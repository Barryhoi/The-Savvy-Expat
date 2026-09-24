import { createHmac, timingSafeEqual } from "node:crypto";

export function validCalendlySignature(
  raw: string,
  signature: string,
  secret: string,
  now = Date.now(),
) {
  const parts = signature.split(",").map((part) => part.trim().split("="));
  const timestamp = parts.find(([key]) => key === "t")?.[1];
  if (
    !secret ||
    !timestamp ||
    !/^\d+$/.test(timestamp) ||
    Math.abs(now / 1000 - Number(timestamp)) >= 300
  )
    return false;
  const expected = createHmac("sha256", secret)
    .update(`${timestamp}.${raw}`)
    .digest();
  return parts.some(
    ([key, value]) =>
      key === "v1" &&
      /^[a-f0-9]{64}$/.test(value) &&
      timingSafeEqual(Buffer.from(value, "hex"), expected),
  );
}
