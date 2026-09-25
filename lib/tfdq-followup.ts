import "server-only";
import type { Application } from "./application";
import config from "./close-fields.json";
import { closeApi } from "./close";
import { choiceLabel, questions } from "./intake";
import { readRecord, withLock, writeRecord } from "./receipt-store";

type Task = { id: string; text: string; organization_id: string };

// One task per application, even when a request is retried after Close accepted
// it but the response or receipt write was lost. Never repeat an uncertain POST.
export async function syncTfdqFollowup(application: Application) {
  if (application.qualified) return;
  if (!application.leadId || !application.reason) throw new Error("TFDQ_MISSING_LEAD");
  const reason = application.reason;
  const assignee = process.env.CLOSE_TFDQ_SETTER_ID;
  if (!assignee) throw new Error("TFDQ_SETTER_NOT_CONFIGURED");
  const preview = process.env.VERCEL_ENV !== "production";
  const marker = `[TFDQ:${application.id}]`;
  const key = `tfdq-followups/${application.id}`;
  await withLock(`tfdq:${application.id}`, async () => {
    let saved = await readRecord<{ taskId?: string; creating?: boolean }>(key);
    if (saved?.value.taskId) return;
    let existing: Task | undefined;
    let skip = 0;
    while (true) {
      const query = new URLSearchParams({ lead_id: application.leadId!, _type: "lead", _limit: "100", _skip: String(skip) });
      const page = await closeApi(`task/?${query}`);
      existing = page.data.find((task: Task) => task.organization_id === config.organizationId && task.text?.includes(marker));
      if (existing || !page.has_more) break;
      skip += page.data.length;
      if (!page.data.length || skip >= 1000) throw new Error("TFDQ_TASK_LOOKUP_LIMIT");
    }
    if (existing) {
      await writeRecord(key, { taskId: existing.id }, saved?.etag);
      return;
    }
    if (saved?.value.creating) throw new Error("TFDQ_CREATE_REQUIRES_RECONCILIATION");
    const question = questions.find(q => q.key === reason);
    const answer = String(application.answers[reason] || "");
    const text = [
      preview ? "PREVIEW QA — DO NOT CONTACT" : "TFDQ — Call to further qualify for Sam’s discovery call",
      "Type Form Disqualified. Review the saved answers and call to assess whether a discovery call with Sam is appropriate.",
      `Disqualification question: ${question?.title || application.reason}`,
      `Answer: ${choiceLabel(answer)}`,
      `Submitted: ${application.submittedAt}`,
      marker,
    ].join("\n\n");
    const pending = await writeRecord(key, { creating: true }, saved?.etag);
    saved = { value: { creating: true }, etag: pending.etag };
    let task: Task;
    try {
      task = await closeApi("task/", "POST", {
        _type: "lead",
        lead_id: application.leadId,
        assigned_to: assignee,
        date: application.submittedAt,
        text,
        // Preview validates the CRM write without adding work to the setter's inbox.
        is_complete: preview,
        send_notification: false,
      });
    } catch (error) {
      if (error instanceof Error && /^CLOSE_(400|401|403|404|422|429)$/.test(error.message))
        await writeRecord(key, { creating: false }, saved.etag);
      throw error;
    }
    await writeRecord(key, { taskId: task.id }, saved.etag);
  });
}
