import { timingSafeEqual } from "node:crypto";
import { listPendingDrafts, readRecord, writeRecord, withLock } from "@/lib/receipt-store";
import { checkAbandonment } from "@/lib/intake-abandonment";
export const runtime = "nodejs";
export const maxDuration = 60;
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const received = Buffer.from(request.headers.get("authorization") || "");
  const expected = Buffer.from(`Bearer ${secret}`);
  if (!secret || received.length !== expected.length || !timingSafeEqual(received, expected)) return new Response(null, { status: 401 });
  try {
    const result = await withLock("tfns-sweep", async () => {
      const state = await readRecord<{ cursor?: string }>("tfns-sweep-cursor");
      const page = await listPendingDrafts(state?.value.cursor);
      const counts = { marked: 0, waiting: 0, excluded: 0, errors: 0 };
      for (const blob of page.blobs) {
        const id = blob.pathname.split("/").pop()!.replace(/\.json$/, "");
        try { counts[await checkAbandonment(id)]++; }
        catch { counts.errors++; }
      }
      await writeRecord("tfns-sweep-cursor", { cursor: page.hasMore ? page.cursor : undefined }, state?.etag);
      return counts;
    });
    return Response.json(result, { status: result.errors ? 503 : 200 });
  } catch { return new Response(null, { status: 503 }); }
}
