import "server-only";
import type { Application } from "./application";
import { digest, readRecord, withLock, writeRecord } from "./receipt-store";

// Matches the existing Make new-lead branch. Preview never enrolls test data.
export async function syncApplicationFollowups(application: Application) {
  if (
    process.env.VERCEL_ENV !== "production" ||
    process.env.BOOKING_LIVE_AUTOMATIONS !== "true" ||
    !application.created
  )
    return;
  const email = String(application.answers.email || "")
    .trim()
    .toLowerCase();
  if (!email) return;
  await withLock(`newsletter:${email}`, async () => {
    const key = `newsletter/${digest(email)}`;
    const saved = await readRecord<{ synced: boolean }>(key);
    if (saved?.value.synced) return;
    const apiKey = process.env.BEEHIIV_API_KEY;
    const publicationId = process.env.BEEHIIV_PUBLICATION_ID;
    if (!apiKey || !publicationId) throw new Error("NEWSLETTER_NOT_CONFIGURED");
    const response = await fetch(
      `https://api.beehiiv.com/v2/publications/${publicationId}/subscriptions`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          reactivate_existing: false,
          send_welcome_email: false,
          double_opt_override: "off",
          skip_newsletter_list_auto_subscribe: false,
          tier: "free",
          utm_source: "typeform",
        }),
        signal: AbortSignal.timeout(12000),
      },
    );
    if (!response.ok) throw new Error(`NEWSLETTER_${response.status}`);
    await writeRecord(key, { synced: true }, saved?.etag);
  });
}
