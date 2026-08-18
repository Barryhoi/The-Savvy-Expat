import { NextResponse } from "next/server";

const REQUIRED_FIELDS = [
  "email",
  "firstName",
  "lastName",
  "phone",
  "timeline",
  "helpIntent",
] as const;

// Same three Close CRM pipeline statuses the old n8n workflow routed into —
// kept identical so nothing changes on the sales side.
const STATUS_ID = {
  HOT: "stat_2GzbZXyyUUBlYLy5dTQGjUXidDIAYDL3adSInjCbDWm",
  COLD: "stat_09bKuP35aM9jR4euZF3nynnfjTdcgTIzdzux0Nxk8Vn",
  WARM: "stat_giPt4N0ya910Owwjsb3ct9ngv9c9PcWIzs1ica4E6TO",
} as const;

/** Strips everything but digits, then adds a country code if it wasn't
 * already there — mirrors the n8n workflow's cleanup exactly. */
function cleanPhone(raw: string): string {
  const digits = raw.replace(/[^0-9]/g, "");
  if (digits.length < 7) return "";
  return (raw.trim().startsWith("+") ? "+" : "+1") + digits;
}

function scoreLead(timeline: string, helpIntent: string): keyof typeof STATUS_ID {
  if (timeline === "Within the next 6 months" && helpIntent === "Yes, I want professional help") {
    return "HOT";
  }
  if (helpIntent === "No, I plan to do it myself") {
    return "COLD";
  }
  return "WARM";
}

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

  const { email, firstName, lastName, phone, timeline, helpIntent } = body as Record<
    (typeof REQUIRED_FIELDS)[number],
    string
  >;

  const apiKey = process.env.CLOSE_API_KEY;
  if (!apiKey) {
    console.error("CLOSE_API_KEY is not configured.");
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }

  const fullName = `${firstName} ${lastName}`;
  const phoneClean = cleanPhone(phone);
  const digitCount = phone.replace(/[^0-9]/g, "").length;
  const isRepeatedDigit = /^(\d)\1*$/.test(phone.replace(/[^0-9]/g, ""));
  const phoneValid = digitCount >= 7 && digitCount <= 15 && !isRepeatedDigit;

  const bucket = scoreLead(timeline, helpIntent);
  const description = `Timeline: ${timeline} | Help: ${helpIntent} | Phone: ${phone}`;

  try {
    const res = await fetch("https://api.close.com/api/v1/lead/", {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${apiKey}:`).toString("base64")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: fullName,
        status_id: STATUS_ID[bucket],
        description,
        contacts: [
          {
            name: fullName,
            emails: [{ email, type: "office" }],
            phones: phoneValid && phoneClean ? [{ phone: phoneClean, type: "office" }] : [],
          },
        ],
      }),
    });

    if (!res.ok) {
      const errorText = await res.text().catch(() => "");
      console.error(`Close lead creation failed (${res.status}):`, errorText);
      return NextResponse.json(
        { error: "Something went wrong. Please try again." },
        { status: 502 }
      );
    }
  } catch (error) {
    console.error("Close lead creation errored:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 502 }
    );
  }

  return NextResponse.json({ success: true });
}
