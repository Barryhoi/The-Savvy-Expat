import { NextResponse } from "next/server";

const REQUIRED_FIELDS = [
  "email",
  "firstName",
  "lastName",
  "phone",
  "timeline",
  "helpIntent",
] as const;

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  for (const field of REQUIRED_FIELDS) {
    const value = body[field];
    if (typeof value !== "string" || !value.trim()) {
      return NextResponse.json(
        { error: "Please fill in every field." },
        { status: 400 }
      );
    }
  }

  // Close CRM lead creation goes here — same phone cleanup and HOT/WARM/COLD
  // scoring the old n8n workflow ran — once the Close API key is wired up.

  return NextResponse.json({ success: true });
}
