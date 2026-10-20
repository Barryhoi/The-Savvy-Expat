import "server-only";
import { calendlyApi, resolveEventType } from "./calendly";
import { closeApi, customFields, exactLead, type Lead } from "./close";
import config from "./close-fields.json";
import { normalizePhone } from "./phone";
import { availabilityWindows, type AvailableSlot } from "./booking-time";
import { BOOK_EVENT_URL } from "./book-site";
import { digest, readRecord, withLock, writeRecord } from "./receipt-store";

// Same approach as ryanunhinged.com: slots for a month, fetched in 7-day
// windows, each carrying Calendly's own booking link for that time.
const cache = new Map<string, { expires: number; slots: AvailableSlot[] }>();
export async function bookAvailableTimes(month: string) {
  const windows = availabilityWindows(month);
  const saved = cache.get(month);
  if (saved && saved.expires > Date.now()) return saved.slots;
  const uri = await resolveEventType();
  const pages = await Promise.all(windows.map((window) => {
    const query = new URLSearchParams({ event_type: uri, start_time: window.start, end_time: window.end });
    return calendlyApi(`/event_type_available_times?${query}`);
  }));
  const unique = new Map<string, AvailableSlot>();
  for (const page of pages) for (const slot of page.collection ?? []) {
    if (slot.status !== "available" || !Number.isFinite(Date.parse(slot.start_time))) continue;
    try {
      const url = new URL(slot.scheduling_url);
      if (!url.toString().startsWith(`${BOOK_EVENT_URL}/`)) continue;
      unique.set(slot.start_time, { startTime: slot.start_time, schedulingUrl: url.toString() });
    } catch { /* Ignore malformed provider items. */ }
  }
  const slots = [...unique.values()].sort((a, b) => Date.parse(a.startTime) - Date.parse(b.startTime));
  if (cache.size > 24) cache.clear();
  cache.set(month, { expires: Date.now() + 30000, slots });
  return slots;
}

type QA = { question: string; answer: string };
const plain = (text: string) => text.replace(/[’‘]/g, "'").trim();

// Answers are matched by question wording so small copy edits in Calendly
// don't break the Close sync.
export function formAnswers(questions: QA[]) {
  const find = (pattern: RegExp) => questions.find((q) => pattern.test(plain(q.question)))?.answer?.trim() || "";
  return {
    phone: find(/phone number/i),
    whatsapp: find(/whatsapp/i),
    notes: find(/additional notes/i),
    why: find(/what made you want/i),
    timeline: find(/arrive/i),
    services: find(/services/i).split("\n").map((s) => s.trim()).filter(Boolean).join("; "),
    budget: find(/monthly living expenses/i),
    funds: find(/liquid funds/i),
    logistics: find(/arrangements/i),
  };
}

// The answers that ended the old application. Everyone who books goes to
// Booked (Barry, Oct 11 2026); these only flag the note so Sam and Lea can
// disqualify by hand after reviewing.
export function disqualified(answers: ReturnType<typeof formAnswers>) {
  return /^12\+/.test(plain(answers.timeline)) ||
    /^No\b/i.test(plain(answers.funds)) ||
    /^Under/i.test(plain(answers.budget)) ||
    /^I.m not ready to move forward/i.test(plain(answers.logistics));
}

export async function syncFormBooking(invitee: any, inviteeUri: string, startTime?: string) {
  const email = String(invitee.email || "").trim().toLowerCase();
  if (!email) throw new Error("NO_EMAIL");
  return withLock(`identity:${email}`, async () => {
    const jobKey = `bookings/${digest(inviteeUri)}`;
    const updatedAt = invitee.updated_at || invitee.created_at;
    const prior = await readRecord<{ updatedAt: string; synced: boolean; noted?: boolean; leadId?: string }>(jobKey);
    if (prior?.value.synced && prior.value.updatedAt === updatedAt)
      return { confirmed: invitee.status === "active" };
    const answers = formAnswers(invitee.questions_and_answers || []);
    const dq = disqualified(answers);
    const phone = normalizePhone(answers.phone);
    const name = String(invitee.name || [invitee.first_name, invitee.last_name].filter(Boolean).join(" ") || email).trim();
    const custom = customFields({
      timeline: answers.timeline || undefined,
      services: answers.services || undefined,
      budget: answers.budget || undefined,
      funds: answers.funds || undefined,
      logistics: answers.logistics || undefined,
      whatsapp: answers.whatsapp || undefined,
      notes: answers.notes || undefined,
      why: answers.why || undefined,
    });

    let lead = prior?.value.leadId
      ? (await closeApi(`lead/${prior.value.leadId}/`) as Lead)
      : await exactLead(email);
    if (lead && lead.organization_id !== config.organizationId) throw new Error("WRONG_ORGANIZATION");
    const active = invitee.status === "active";
    let stale = false;
    if (!lead) {
      // A canceled booking from someone not in Close has nothing to update.
      if (!active) return { confirmed: false };
      const marker = await readRecord<{ creating: boolean }>(`form-leads/${digest(email)}`);
      if (marker?.value.creating) throw new Error("CREATE_REQUIRES_RECONCILIATION");
      const pending = await writeRecord(`form-leads/${digest(email)}`, { creating: true }, marker?.etag);
      try {
        lead = await closeApi("lead/", "POST", {
          name,
          // Created as Potential, then moved to Booked below: Make's
          // "Lead Status → Update Opportunity" only fires on a status change.
          status_id: config.potentialStatusId,
          contacts: [{
            name,
            emails: [{ email, type: "office" }],
            ...(phone ? { phones: [{ phone, type: "mobile" }] } : {}),
          }],
          ...custom,
        }) as Lead;
      } catch (error) {
        if (error instanceof Error && /^CLOSE_(400|401|403|404|422|429)$/.test(error.message))
          await writeRecord(`form-leads/${digest(email)}`, { creating: false }, pending.etag);
        throw error;
      }
      await writeRecord(`form-leads/${digest(email)}`, { creating: false, leadId: lead.id }, pending.etag);
      await closeApi(`lead/${lead.id}/`, "PUT", { status_id: config.bookedStatusId });
    } else {
      await withLock(`lead-booking:${lead.id}`, async () => {
        const current = await closeApi(`lead/${lead!.id}/`) as Lead;
        const latestKey = `lead-bookings/${current.id}`;
        const latest = await readRecord<{ createdAt: string; inviteeUri: string; status: string }>(latestKey);
        // A canceled old appointment must never cancel its replacement.
        const older = latest && latest.value.inviteeUri !== inviteeUri &&
          Date.parse(invitee.created_at) < Date.parse(latest.value.createdAt);
        if (older || (!active && latest && latest.value.inviteeUri !== inviteeUri)) { stale = true; return; }
        const patch: Record<string, unknown> = active ? { ...custom } : {};
        if (active && BOOKABLE_STATUS_IDS.includes(current.status_id))
          patch.status_id = config.bookedStatusId;
        if (!active && !invitee.rescheduled && current.status_id === config.bookedStatusId)
          patch.status_id = config.canceledStatusId;
        if (Object.keys(patch).length) await closeApi(`lead/${current.id}/`, "PUT", patch);
        if (active && phone) {
          const contact = current.contacts.find((c) => c.emails.some((e) => e.email.trim().toLowerCase() === email));
          const phones = contact?.phones || [];
          if (contact && !phones.some((p) => p.phone.replace(/\D/g, "") === phone.replace(/\D/g, "")))
            await closeApi(`contact/${contact.id}/`, "PUT", { phones: [...phones, { phone, type: "mobile" }] });
        }
      });
    }
    if (!stale) {
      const latest = await readRecord(`lead-bookings/${lead!.id}`);
      await writeRecord(`lead-bookings/${lead!.id}`, {
        createdAt: invitee.created_at, inviteeUri, status: invitee.status, source: "calendly-form",
      }, latest?.etag);
    }

    // One note per booking so Sam sees the answers on the lead.
    if (active && !stale && !prior?.value.noted) {
      const when = new Intl.DateTimeFormat("en-US", {
        timeZone: "Asia/Manila", weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
      }).format(new Date(startTime || Date.now()));
      await closeApi("activity/note/", "POST", {
        lead_id: lead!.id,
        note: [
          `Booked via website (Calendly form)${dq ? " - CHECK ANSWERS: may not qualify" : ""}`,
          startTime ? `Call: ${when} Manila time` : "",
          `Phone: ${answers.phone || "-"}`,
          `Arrival: ${answers.timeline || "-"}`,
          `Services: ${answers.services || "-"}`,
          `Monthly budget: ${answers.budget || "-"}`,
          answers.funds ? `Liquid funds: ${answers.funds}` : "",
          `Flights & arrangements: ${answers.logistics || "-"}`,
          `WhatsApp: ${answers.whatsapp || "-"}`,
          answers.why ? `Why us: ${answers.why}` : "",
          answers.notes ? `Notes: ${answers.notes}` : "",
          sourceLine(invitee.tracking),
        ].filter(Boolean).join("\n"),
      });
    }
    await writeRecord(jobKey, {
      updatedAt, synced: true, leadId: lead!.id, noted: Boolean(prior?.value.noted || active),
    }, prior?.etag);
    return { confirmed: active };
  });
}

// "Source: instagram / video 123" from the Calendly UTM tracking, if any.
function sourceLine(tracking: { utm_source?: string | null; utm_campaign?: string | null } | undefined) {
  const parts = [tracking?.utm_source, tracking?.utm_campaign].filter((part): part is string => Boolean(part));
  return parts.length ? `Source: ${parts.join(" / ").slice(0, 140)}` : "";
}

// Pre-call statuses a booking may move forward; later sales stages set by
// hand are kept. Same list as lib/booking-sync.ts.
const BOOKABLE_STATUS_IDS: string[] = [
  config.potentialStatusId, config.tfsStatusId, config.tfnbStatusId, config.tfdqStatusId,
  config.bookedStatusId, config.canceledStatusId, ...config.bhsStatusIds,
];
