import { NextRequest, NextResponse } from "next/server";
import { applicationFromToken } from "@/lib/application";
import { createNativeBooking } from "@/lib/native-booking";
import { createSetterInvitee } from "@/lib/setter-booking";
export const runtime = "nodejs";
export const maxDuration = 60;
export async function POST(request: NextRequest) {
  if (request.headers.get("origin") !== new URL(request.url).origin) return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  try {
    const raw = await request.text();
    if (raw.length > 5000) throw Error("INVALID_DETAILS");
    let body;
    try { body = JSON.parse(raw); } catch { throw Error("INVALID_DETAILS"); }
    let inviteeUri: string;
    if (typeof body?.setterToken === "string") {
      inviteeUri = await createSetterInvitee(body.setterToken, body);
    } else {
      const application = await applicationFromToken(request.cookies.get("savvy_application")?.value);
      if (!application?.value.qualified) return NextResponse.json({ error: "Please complete the application first." }, { status: 401 });
      inviteeUri = await createNativeBooking(application.value, body);
    }
    return NextResponse.json({ inviteeUri }, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    const code = e instanceof Error ? e.message : "UNKNOWN";
    const messages: Record<string, string> = {
      INVALID_DETAILS: "Please check your booking details.",
      SLOT_UNAVAILABLE: "That time is no longer available. Please choose another time.",
      APPLICATION_CHANGED: "A newer application has been submitted. Please reopen the booking page from that application.",
      INVALID_SETTER_LINK: "This booking link has expired. Please ask your setter for a new one.",
      ALREADY_BOOKED: "This person already has an active discovery call booked.",
      BOOKING_UNCERTAIN: "We’re checking whether your booking went through. Please don’t book another appointment. Wait a moment, then check again.",
      IN_PROGRESS: "Your booking request is being processed. Please wait a moment, then check again.",
    };
    console.error("native_booking_failed", code.replace(/[^A-Z_0-9]/g, "").slice(0, 80));
    return NextResponse.json({ error: messages[code] || "Booking is temporarily unavailable. Please try again shortly.", pending: ["BOOKING_UNCERTAIN", "IN_PROGRESS", "UNKNOWN"].includes(code) }, { status: code === "INVALID_DETAILS" ? 400 : ["SLOT_UNAVAILABLE", "APPLICATION_CHANGED", "IN_PROGRESS"].includes(code) ? 409 : 503 });
  }
}
