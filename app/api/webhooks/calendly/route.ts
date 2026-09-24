import { validCalendlySignature } from "@/lib/webhook-signature";
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
  if (!validCalendlySignature(raw, signature, secret))
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
