import "server-only";
import { getApplication } from "./application";
import { closeApi, syncApplication, type Lead } from "./close";
import config from "./close-fields.json";
import { qualification, type Answers } from "./intake";
import { abandonmentDue } from "./intake-progress";
import { readRecord, writeRecord, withLock, removePendingDraft } from "./receipt-store";
export type Draft = { id: string; revision: number; answers: Answers; updatedAt: string; leadId?: string | null; protected?: boolean; marked?: boolean };
export async function saveProgress(id: string, revision: number, answers: Answers) {
  return withLock(`application:${id}`, async () => {
    if (await getApplication(id)) return;
    const key = `drafts/${id}`;
    const saved = await readRecord<Draft>(key);
    if (saved && saved.value.revision >= revision) {
      // Repair a missing queue entry if the previous response failed after the
      // draft write. Replays never move the inactivity deadline forward.
      const pendingKey = `abandonment-pending/${id}`;
      if (!saved.value.marked && !await readRecord(pendingKey))
        await writeRecord(pendingKey, { id });
      return;
    }
    // Disqualification is submitted through the final application endpoint and
    // must never be classified as abandonment, even if that submit needs retry.
    const draft: Draft = { id, revision, answers, updatedAt: new Date().toISOString() };
    if (!qualification(answers)) {
      const synced = await syncApplication(id, answers, draft.updatedAt, "draft");
      draft.leadId = synced.leadId;
      draft.protected = "protected" in synced && synced.protected;
    }
    await writeRecord(key, draft, saved?.etag);
    const pendingKey = `abandonment-pending/${id}`;
    const pending = await readRecord(pendingKey);
    await writeRecord(pendingKey, { id }, pending?.etag);
  });
}
export async function checkAbandonment(id: string, now = Date.now()) {
  return withLock(`application:${id}`, async () => {
    const saved = await readRecord<Draft>(`drafts/${id}`);
    const draft = saved?.value;
    if (!draft || draft.marked || draft.protected || qualification(draft.answers) || await getApplication(id)) {
      await removePendingDraft(id);
      return "excluded";
    }
    if (!abandonmentDue(draft.updatedAt, now)) return "waiting";
    if (!draft.leadId) throw new Error("DRAFT_MISSING_LEAD");
    const email = String(draft.answers.email).trim().toLowerCase();
    return withLock(`identity:${email}`, async () => {
      const lead = await closeApi(`lead/${draft.leadId}/`) as Lead & Record<string, unknown>;
      if (lead.organization_id !== config.organizationId) throw new Error("WRONG_ORGANIZATION");
      // Protect other applications, bookings, and any manual pipeline movement.
      const eligible = lead[`custom.${config.fields.applicationId}`] === id &&
        lead[`custom.${config.fields.qualification}`] === "In progress" &&
        !["Booked", "Rescheduled"].includes(String(lead[`custom.${config.fields.bookingStatus}`])) &&
        [config.potentialStatusId, config.tfnsStatusId].includes(lead.status_id);
      if (eligible && lead.status_id !== config.tfnsStatusId)
        await closeApi(`lead/${lead.id}/`, "PUT", { status_id: config.tfnsStatusId });
      await writeRecord(`drafts/${id}`, { ...draft, marked: true }, saved!.etag);
      await removePendingDraft(id);
      return eligible ? "marked" : "excluded";
    });
  });
}
