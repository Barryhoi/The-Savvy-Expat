import { NextRequest, NextResponse } from "next/server";
import { applicationFromToken } from "@/lib/application";
import { availability } from "@/lib/calendly";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(request: NextRequest) {
  try {
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
