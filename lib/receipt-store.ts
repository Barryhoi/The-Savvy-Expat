import "server-only";
import { get, put } from "@vercel/blob";
import { createHash, randomUUID } from "node:crypto";

export const digest = (value: string) =>
  createHash("sha256").update(value).digest("hex");
const prefix = () =>
  `booking/${process.env.VERCEL_ENV === "production" ? "production" : "preview"}/`;
export async function readRecord<T>(
  key: string,
): Promise<{ value: T; etag: string } | null> {
  const result = await get(prefix() + key + ".json", {
    access: "private",
    useCache: false,
  });
  if (!result || result.statusCode !== 200) return null;
  return {
    value: JSON.parse(await new Response(result.stream).text()),
    etag: result.blob.etag,
  };
}
export async function writeRecord<T>(key: string, value: T, etag?: string) {
  return put(prefix() + key + ".json", JSON.stringify(value), {
    access: "private",
    addRandomSuffix: false,
    contentType: "application/json",
    ...(etag ? { ifMatch: etag } : { allowOverwrite: false }),
  });
}
// Conditional object writes serialize the same identity across Vercel instances.
// The lease exceeds the route's 60s maximum duration. Expired leases are reclaimed
// with an ETag compare-and-swap, never by deleting another request's lock.
export async function withLock<T>(
  key: string,
  fn: () => Promise<T>,
): Promise<T> {
  const path = "locks/" + digest(key);
  const existing = await readRecord<{ until: number; owner: string }>(path);
  if (existing && existing.value.until > Date.now())
    throw new Error("IN_PROGRESS");
  let lease;
  try {
    lease = await writeRecord(
      path,
      { until: Date.now() + 120000, owner: randomUUID() },
      existing?.etag,
    );
  } catch {
    throw new Error("IN_PROGRESS");
  }
  try {
    return await fn();
  } finally {
    await writeRecord(path, { until: 0, owner: "released" }, lease.etag).catch(
      () => {},
    );
  }
}
