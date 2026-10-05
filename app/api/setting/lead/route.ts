import { NextRequest, NextResponse } from "next/server";
import { createSetterBooking } from "@/lib/setter-booking";
import { limitApplication } from "@/lib/rate-limit";
export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  if (request.headers.get("origin") !== new URL(request.url).origin)
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  try {
    const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
    const ip = forwarded && /^[\da-f:.]+$/i.test(forwarded) ? forwarded : "unknown";
    await limitApplication(ip, 12);
    const raw = await request.text();
    if (raw.length > 3000) throw new Error("INVALID_CONTACT");
    const { booking, token } = await createSetterBooking(JSON.parse(raw));
    return NextResponse.json(
      { token, booking: { name: booking.name, email: booking.email, phone: booking.phone } },
      { headers: { "Cache-Control": "no-store", "Referrer-Policy": "no-referrer" } },
    );
  } catch (error) {
    const code = error instanceof Error ? error.message : "UNKNOWN";
    const messages: Record<string, string> = {
      INVALID_CONTACT: "Check the name, email, and 10-digit US phone number, then try again.",
      ALREADY_BOOKED: "This person already has an active discovery call booked in Close.",
      AMBIGUOUS_EMAIL: "Close has more than one lead with this email. Please resolve the duplicate before booking.",
      WRONG_ORGANIZATION: "That lead belongs to a different Close organization.",
      RATE_LIMITED: "Too many attempts from this connection. Please wait and try again.",
      IN_PROGRESS: "This contact is being prepared. Wait a moment and try again.",
    };
    console.error("setter_contact_failed", code.replace(/[^A-Z_0-9]/g, "").slice(0, 80));
    const status = code === "INVALID_CONTACT" ? 400 : code === "ALREADY_BOOKED" ? 409 : code === "RATE_LIMITED" ? 429 : 503;
    return NextResponse.json({ error: messages[code] || "Close is temporarily unavailable. Please try again shortly." }, { status });
  }
}
