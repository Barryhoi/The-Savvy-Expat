import { NextRequest, NextResponse } from "next/server";
import { applicationFromToken } from "@/lib/application";
import { syncBooking } from "@/lib/booking-sync";
import { setterInviteeMatches, setterBookingFromToken } from "@/lib/setter-booking";
export const runtime = "nodejs";
export const maxDuration = 60;
export async function POST(request: NextRequest) {
  if (request.headers.get("origin") !== new URL(request.url).origin)
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  try {
    const raw = await request.text();
    if (raw.length > 2000) throw Error("INVALID_BODY");
    const { inviteeUri, setterToken } = JSON.parse(raw);
    if (typeof inviteeUri !== "string") throw Error("INVALID_URI");
    if (typeof setterToken === "string") {
      const setter = await setterBookingFromToken(setterToken);
      if (!setter || !(await setterInviteeMatches(setterToken, inviteeUri)))
        return NextResponse.json({ error: "Booking confirmation not found" }, { status: 401 });
      const result = await syncBooking(inviteeUri);
      if (!result.confirmed || !("setterId" in result) || result.setterId !== setter.value.id)
        return NextResponse.json({ error: "Booking is not active" }, { status: 409 });
      return NextResponse.json({ confirmed: true }, { headers: { "Cache-Control": "no-store" } });
    }
    const receipt = await applicationFromToken(request.cookies.get("savvy_application")?.value);
    if (!receipt?.value.qualified) return NextResponse.json({ error: "Application required" }, { status: 401 });
    const result = await syncBooking(inviteeUri, receipt.value.id);
    if (!result.confirmed)
      return NextResponse.json(
        { error: "Booking is not active" },
        { status: 409 },
      );
    const response = NextResponse.json({ confirmed: true });
    response.cookies.set("savvy_booking", receipt.value.receiptToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 86400,
    });
    return response;
  } catch (e) {
    console.error(
      "booking_confirmation_failed",
      e instanceof Error ? e.message : "UNKNOWN",
    );
    return NextResponse.json(
      { error: "Booking sync is pending" },
      { status: 503 },
    );
  }
}
