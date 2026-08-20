import { NextResponse } from "next/server";

const REQUIRED_FIELDS = [
  "email",
  "firstName",
  "lastName",
  "phone",
  "timeline",
  "helpIntent",
] as const;

// Excludes " and \ on top of the usual shape check — those characters would
// otherwise let a crafted email break out of the quoted Close search query
// below and match (and overwrite) an unrelated lead.
const EMAIL_REGEX = /^[^\s@"\\]+@[^\s@"\\]+\.[^\s@"\\]+$/;

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

  if (!EMAIL_REGEX.test(email.trim())) {
    return NextResponse.json(
      { error: "Please enter a valid email address." },
      { status: 400 }
    );
  }

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
  const authHeader = `Basic ${Buffer.from(`${apiKey}:`).toString("base64")}`;

  try {
    // Dedup: someone can hit /subscribe -> /survey more than once (resubscribe,
    // retaken survey, double submit). Look up by email first so a repeat visit
    // updates the existing Close lead instead of spawning a second one.
    const searchRes = await fetch(
      `https://api.close.com/api/v1/lead/?query=${encodeURIComponent(`email:"${email}"`)}`,
      { headers: { Authorization: authHeader } }
    );

    if (!searchRes.ok) {
      const errorText = await searchRes.text().catch(() => "");
      console.error(`Close lead search failed (${searchRes.status}):`, errorText);
      return NextResponse.json(
        { error: "Something went wrong. Please try again." },
        { status: 502 }
      );
    }

    type CloseLead = {
      id: string;
      contacts?: { id: string; emails?: { email: string }[] }[];
    };
    const searchData = (await searchRes.json()) as { data?: CloseLead[] };
    const existingLead = searchData.data?.[0];
    const existingLeadId = existingLead?.id;

    const res = existingLeadId
      ? await fetch(`https://api.close.com/api/v1/lead/${existingLeadId}/`, {
          method: "PUT",
          headers: {
            Authorization: authHeader,
            "Content-Type": "application/json",
          },
          // Status moves with the latest submission — a HOT retake can
          // downgrade a COLD lead and vice versa, same as a fresh survey.
          body: JSON.stringify({
            name: fullName,
            status_id: STATUS_ID[bucket],
            description,
          }),
        })
      : await fetch("https://api.close.com/api/v1/lead/", {
          method: "POST",
          headers: {
            Authorization: authHeader,
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
      console.error(
        `Close lead ${existingLeadId ? "update" : "creation"} failed (${res.status}):`,
        errorText
      );
      return NextResponse.json(
        { error: "Something went wrong. Please try again." },
        { status: 502 }
      );
    }

    // The lead update above only touches the lead's own name/status/description —
    // the nested contact record (its display name, phone) is a separate object
    // in Close and stays stale on a retake unless synced here too.
    if (existingLead) {
      const contactId =
        existingLead.contacts?.find((c) =>
          c.emails?.some((e) => e.email.toLowerCase() === email.trim().toLowerCase())
        )?.id ?? existingLead.contacts?.[0]?.id;

      if (contactId) {
        const contactRes = await fetch(`https://api.close.com/api/v1/contact/${contactId}/`, {
          method: "PUT",
          headers: {
            Authorization: authHeader,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: fullName,
            phones: phoneValid && phoneClean ? [{ phone: phoneClean, type: "office" }] : [],
          }),
        });
        if (!contactRes.ok) {
          const errorText = await contactRes.text().catch(() => "");
          console.error(`Close contact update failed (${contactRes.status}):`, errorText);
        }
      } else {
        console.error(`No contact found on lead ${existingLeadId} matching ${email}`);
      }
    }
  } catch (error) {
    console.error("Close lead sync errored:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 502 }
    );
  }

  return NextResponse.json({ success: true });
}
