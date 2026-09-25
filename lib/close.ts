import "server-only";
import config from "./close-fields.json";
import { qualification, questions, type Answers } from "./intake";
import { hasApplicationBooking } from "./application-booking";
import { intakeStatus } from "./intake-status";
import { digest, readRecord, withLock, writeRecord } from "./receipt-store";

export async function closeApi(path: string, method = "GET", body?: unknown) {
  const key = process.env.CLOSE_API_KEY;
  if (!key || key === "[SENSITIVE]") throw new Error("CLOSE_NOT_CONFIGURED");
  const response = await fetch(`https://api.close.com/api/v1/${path}`, {
    method,
    headers: {
      Authorization: `Basic ${Buffer.from(key + ":").toString("base64")}`,
      "Content-Type": "application/json",
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
    cache: "no-store",
    signal: AbortSignal.timeout(12000),
  });
  if (!response.ok) throw new Error(`CLOSE_${response.status}`);
  return response.json();
}
export function customFields(values: Record<string, unknown>) {
  const fields = config.fields as Record<string, string>;
  return Object.fromEntries(
    Object.entries(values)
      .filter(([key, value]) => fields[key] && value !== undefined)
      .map(([key, value]) => [
        `custom.${fields[key]}`,
        value === "" ? null : value,
      ]),
  );
}
type Contact = {
  id: string;
  name: string;
  emails: { email: string; type: string }[];
  phones: { phone: string; type: string }[];
};
export type Lead = {
  [key: string]: unknown;
  id: string;
  organization_id: string;
  contacts: Contact[];
  status_id: string;
  custom: Record<string, unknown>;
};
export async function exactLead(email: string): Promise<Lead | null> {
  // Provider search is a candidate lookup; email equality is checked locally.
  const query = new URLSearchParams({
    query: `email:${JSON.stringify(email)}`,
    _limit: "100",
    _fields: "id,organization_id,contacts,status_id,custom",
  });
  const result = await closeApi(`lead/?${query}`);
  if (result.has_more) throw new Error("AMBIGUOUS_EMAIL");
  const matches: Lead[] = result.data.filter((lead: Lead) =>
    lead.contacts.some((c) =>
      c.emails.some((e) => e.email.trim().toLowerCase() === email),
    ),
  );
  if (matches.length > 1) throw new Error("AMBIGUOUS_EMAIL");
  if (matches[0] && matches[0].organization_id !== config.organizationId)
    throw new Error("WRONG_ORGANIZATION");
  return matches[0] ? await closeApi(`lead/${matches[0].id}/`) as Lead : null;
}
export async function syncApplication(
  id: string,
  answers: Answers,
  submittedAt: string,
  mode: "submitted" | "draft" = "submitted",
) {
  const email = String(answers.email || "")
    .trim()
    .toLowerCase();
  // Retain support for historical receipts; new submissions require identity.
  if (!email) return { leadId: null, created: false };
  return withLock(`identity:${email}`, async () => {
    const key = `identities/${digest(email)}`;
    let record = await readRecord<{ leadId?: string; creating?: boolean; createdByApplication?: string }>(key);
    let lead: Lead | null = null;
    if (record?.value.leadId) {
      try {
        lead = await closeApi(`lead/${record.value.leadId}/`) as Lead;
      } catch (error) {
        // Close may have had a lead removed after we cached its ID. Recover by
        // exact email before deciding whether to create a replacement.
        if (!(error instanceof Error) || error.message !== "CLOSE_404") throw error;
        lead = await exactLead(email);
      }
    } else {
      lead = await exactLead(email);
    }
    const update = async () => {
      // Re-read while sharing the booking lock so a concurrent booking wins over
      // a repeat submission instead of being overwritten by TFS.
      if (lead) lead = await closeApi(`lead/${lead.id}/`) as Lead;
      if (lead && lead.organization_id !== config.organizationId)
        throw new Error("WRONG_ORGANIZATION");
      // A partial repeat visit cannot replace a completed application or booking.
      if (mode === "draft" && lead && (
        lead.status_id !== config.potentialStatusId ||
        ["Qualified", "Disqualified"].includes(String(lead[`custom.${config.fields.qualification}`] || "")) ||
        ["Booked", "Rescheduled"].includes(String(lead[`custom.${config.fields.bookingStatus}`] || ""))
      )) return { leadId: lead.id, created: false, protected: true };
      const reason = mode === "submitted" ? qualification(answers) : null;
      const status = intakeStatus(mode, !!reason, lead, lead ? await hasApplicationBooking(id, lead) : false);
      const values: Record<string, unknown> = {
        ...answers,
        services: Array.isArray(answers.services)
          ? answers.services.join("; ")
          : answers.services,
        qualification: mode === "draft" ? "In progress" : reason ? "Disqualified" : "Qualified",
        reason: reason || "None",
        applicationId: id,
        submittedAt: mode === "submitted" ? submittedAt : undefined,
        environment:
          process.env.VERCEL_ENV === "production" ? "Production" : "Preview",
      };
      const blankAnswers = Object.fromEntries(
        questions
          .filter(
            (q) => q.choices.length || ["obstacle", "whyUs"].includes(q.key),
          )
          .map((q) => [q.key, null]),
      );
      const custom = customFields({ ...blankAnswers, ...values });
      let created = false;
      if (!lead) {
        if (record?.value.creating)
          throw new Error("CREATE_REQUIRES_RECONCILIATION");
        const marker = await writeRecord(key, { creating: true }, record?.etag);
        record = { value: { creating: true }, etag: marker.etag };
        // Never automatically repeat an uncertain create. A later request searches
        // the exact email first and recovers the result if Close accepted it.
        try {
          lead = await closeApi("lead/", "POST", {
            name:
              [answers.firstName, answers.lastName].filter(Boolean).join(" ") ||
              email,
            status_id: status,
            contacts: [
              {
                name:
                  [answers.firstName, answers.lastName]
                    .filter(Boolean)
                    .join(" ") || undefined,
                emails: [{ email, type: "office" }],
                ...(answers.phone
                  ? { phones: [{ phone: answers.phone, type: "mobile" }] }
                  : {}),
              },
            ],
            ...custom,
          });
        } catch (error) {
          // A definitive rejection did not create a lead; allow a corrected retry.
          // Network timeouts and server errors retain the uncertain-create guard.
          if (
            error instanceof Error &&
            /^CLOSE_(400|401|403|404|422|429)$/.test(error.message)
          ) {
            await writeRecord(key, { creating: false }, marker.etag);
          }
          throw error;
        }
        created = true;
      } else {
        await closeApi(`lead/${lead.id}/`, "PUT", {
          ...custom,
          ...(status ? { status_id: status } : {}),
        });
        const contact = lead.contacts.find((c) =>
          c.emails.some((e) => e.email.trim().toLowerCase() === email),
        );
        if (contact) {
          const name = [answers.firstName, answers.lastName]
            .filter(Boolean)
            .join(" ");
          const phone = String(answers.phone || "");
          const phones = contact.phones || [];
          const patch = {
            ...(name ? { name } : {}),
            ...(phone &&
            !phones.some(
              (p) => p.phone.replace(/\D/g, "") === phone.replace(/\D/g, ""),
            )
              ? { phones: [...phones, { phone, type: "mobile" }] }
              : {}),
          };
          if (Object.keys(patch).length)
            await closeApi(`contact/${contact.id}/`, "PUT", patch);
        }
      }
      await writeRecord(key, { leadId: lead!.id, creating: false, createdByApplication: created ? id : record?.value.createdByApplication }, record?.etag);
      return { leadId: lead!.id, created: created || record?.value.createdByApplication === id };
    };
    return lead ? withLock(`lead-booking:${lead.id}`, update) : update();
  });
}
