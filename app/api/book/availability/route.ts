import { NextRequest, NextResponse } from "next/server";
import { bookAvailableTimes } from "@/lib/book-event";
import { availabilityWindows } from "@/lib/booking-time";
export const dynamic = "force-dynamic";
export async function GET(request: NextRequest) {
  const month = request.nextUrl.searchParams.get("month") ?? "";
  try { availabilityWindows(month); } catch { return NextResponse.json({ error: "Invalid month." }, { status: 400 }); }
  try {
    return NextResponse.json({ slots: await bookAvailableTimes(month) }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Book availability unavailable:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "We couldn’t load available times. Please try again." }, { status: 503 });
  }
}
