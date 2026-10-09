import "server-only";
import { hasApplicationBooking } from "./application-booking";
import { getApplication } from "./application";
import { closeApi, syncApplication, type Lead } from "./close";
import config from "./close-fields.json";
import { qualification, type Answers } from "./intake";
import { abandonmentDue } from "./intake-progress";
import { digest, readRecord, writeRecord, withLock, removePendingDraft } from "./receipt-store";
export type Draft = { id: string; revision: number; answers: Answers; updatedAt: string; leadId?: string | null; protected?: boolean; marked?: boolean };
export async function saveProgress(id: string, revision: number, answers: Answers) {
  return withLock(`application:${id}`, async () => {
    if (await getApplication(id)) return;
    const key = `drafts/${id}`;
    const saved = await readRecord<Draft>(key);
    if (saved && saved.value.revision >= revision) return;
    // Disqualification is submitted through the final application endpoint and
    // must never be classified as abandonment, even if that submit needs retry.
    const draft: Draft = { id, revision, answers, updatedAt: new Date().toISOString() };
    if (!qualification(answers)) {
      const synced = await syncApplication(id, answers, draft.updatedAt, "draft");
      draft.leadId = synced.leadId;
      draft.protected = "protected" in synced && synced.protected;
    }
    await writeRecord(key, draft, saved?.etag);

  });
}
export async function queueUnbookedApplication(id: string) {
  const key = `abandonment-pending/${id}`;
  const pending = await readRecord(key);
  if (!pending) await writeRecord(key, { id });
}
export async function checkAbandonment(id: string, now = Date.now()) {
  return withLock(`application:${id}`, async () => {
    const receipt = await getApplication(id);
    const application = receipt?.value;
    // TFNB means a qualified, submitted application without a booked call.
    // Old partial-form queue entries are discarded without changing CRM status.
    if (!application || !application.qualified) {
      await removePendingDraft(id);
      return "excluded";
    }
    if (!application.synced || !application.leadId) return "waiting";
    if (!abandonmentDue(application.submittedAt, now)) return "waiting";
    const email = String(application.answers.email).trim().toLowerCase();
    return withLock(`identity:${email}`, () => withLock(`lead-booking:${application.leadId}`, async () => {
      let lead: Lead;
      try {
        lead = await closeApi(`lead/${application.leadId}/`) as Lead;
      } catch (error) {
        // A lead deleted in Close (e.g. test cleanup) can never become TFNB.
        // Drop it from the queue instead of failing every sweep from now on.
        if (error instanceof Error && error.message === "CLOSE_404") {
          await removePendingDraft(id);
          return "excluded";
        }
        throw error;
      }
      if (lead.organization_id !== config.organizationId) throw new Error("WRONG_ORGANIZATION");
      const identity = await readRecord<{ applicationId?: string }>(`identities/${digest(email)}`);
      const legacyApplicationField = config.legacyFields?.applicationId;
      const currentApplication = identity?.value.applicationId ??
        (legacyApplicationField ? lead[`custom.${legacyApplicationField}`] : undefined);
      const eligible = currentApplication === id &&
        application.qualified &&
        !(await hasApplicationBooking(id, lead)) &&
        [config.tfsStatusId, config.tfnbStatusId].includes(lead.status_id);
      if (eligible && lead.status_id !== config.tfnbStatusId)
        await closeApi(`lead/${lead.id}/`, "PUT", { status_id: config.tfnbStatusId });
      await removePendingDraft(id);
      return eligible ? "marked" : "excluded";
    }));
  });
}
