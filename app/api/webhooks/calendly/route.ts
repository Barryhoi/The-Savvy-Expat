import { createHmac, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { syncBooking } from "@/lib/booking-sync";
export const runtime = "nodejs";
export const maxDuration = 60;
export async function POST(request: NextRequest) {
  const secret = process.env.CALENDLY_WEBHOOK_SIGNING_KEY;
  if (!secret)
    return NextResponse.json({ error: "Webhook unavailable" }, { status: 503 });
  const raw = await request.text();
  if (raw.length > 100000)
    return NextResponse.json({ error: "Too large" }, { status: 413 });
  const signature = request.headers.get("calendly-webhook-signature") || "";
  const parts = signature.split(",").map((p) => p.trim().split("="));
  const timestamp = parts.find(([k]) => k === "t")?.[1];
  const expected = createHmac("sha256", secret)
    .update(`${timestamp}.${raw}`)
    .digest("hex");
  const valid =
    timestamp &&
    Math.abs(Date.now() / 1000 - Number(timestamp)) < 300 &&
    parts.some(
      ([k, v]) =>
        k === "v1" &&
        /^[a-f0-9]{64}$/.test(v) &&
        timingSafeEqual(Buffer.from(v, "hex"), Buffer.from(expected, "hex")),
    );
  if (!valid)
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  try {
    const data = JSON.parse(raw);
    if (!["invitee.created", "invitee.canceled"].includes(data.event))
      return NextResponse.json({ ignored: true });
    if (typeof data.payload?.uri !== "string") throw Error("INVALID_PAYLOAD");
    await syncBooking(data.payload.uri);
    return NextResponse.json({ received: true });
  } catch (e) {
    console.error(
      "calendly_sync_failed",
      e instanceof Error ? e.message : "UNKNOWN",
    );
    return NextResponse.json({ error: "Retry delivery" }, { status: 503 });
  }
}
