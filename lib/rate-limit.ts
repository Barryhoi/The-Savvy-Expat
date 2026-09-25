import "server-only";
import { digest, readRecord, withLock, writeRecord } from "./receipt-store";
export async function limitApplication(ip: string, maximum = 30) {
  const key = `rate/${digest(ip + ":" + Math.floor(Date.now() / 3600000))}`;
  await withLock(key, async () => {
    const saved = await readRecord<{ count: number }>(key);
    const count = saved?.value.count || 0;
    if (count >= maximum) throw new Error("RATE_LIMITED");
    await writeRecord(key, { count: count + 1 }, saved?.etag);
  });
}
