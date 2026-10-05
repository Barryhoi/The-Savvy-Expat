import { NextRequest, NextResponse } from "next/server";
import { applicationFromToken } from "@/lib/application";
import { availability } from "@/lib/calendly";
import { setterBookingFromToken } from "@/lib/setter-booking";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(request: NextRequest) {
  try {
    const setterToken = request.nextUrl.searchParams.get("setter");
    if (setterToken) {
      const setter = await setterBookingFromToken(setterToken);
      if (!setter) return NextResponse.json({ error: "This booking link has expired. Please ask your setter for a new one." }, { status: 401 });
      return NextResponse.json({ slots: await availability() }, { headers: { "Cache-Control": "private, no-store" } });
    }
    const app = await applicationFromToken(
      request.cookies.get("savvy_application")?.value,
    );
    if (!app?.value.qualified)
      return NextResponse.json(
        { error: "Please complete your application first." },
        { status: 401 },
      );
    return NextResponse.json(
      { slots: await availability() },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch {
    return NextResponse.json(
      {
        error:
          "We couldn't load the available times. Please retry or open the calendar below.",
      },
      { status: 503 },
    );
  }
}
