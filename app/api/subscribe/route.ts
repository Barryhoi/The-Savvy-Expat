import { NextResponse } from "next/server";
import type {
  BeehiivErrorResponse,
  BeehiivSubscriptionResponse,
} from "@/types/beehiiv";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Attribution tags are ids and slugs, never free text — cap and strip. */
function cleanTag(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const cleaned = value.trim().replace(/[^\w.-]/g, "").slice(0, 64);
  return cleaned || undefined;
}

export async function POST(request: Request) {
  let email: unknown;
  let video: string | undefined;
  let platform: string | undefined;
  try {
    const body = await request.json();
    email = body?.email;
    video = cleanTag(body?.video);
    platform = cleanTag(body?.platform);
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (typeof email !== "string" || !EMAIL_REGEX.test(email.trim())) {
    return NextResponse.json(
      { error: "Please enter a valid email address." },
      { status: 400 }
    );
  }

  const apiKey = process.env.BEEHIIV_API_KEY;
  const publicationId = process.env.BEEHIIV_PUBLICATION_ID;

  if (!apiKey || !publicationId) {
    return NextResponse.json(
      { error: "Newsletter signup is not configured yet." },
      { status: 500 }
    );
  }

  try {
    const res = await fetch(
      `https://api.beehiiv.com/v2/publications/${publicationId}/subscriptions`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          reactivate_existing: true,
          send_welcome_email: true,
          // utm_campaign carries the video id that produced this subscriber —
          // the key the content CRM joins revenue back to. utm_medium is the
          // platform. Organic signups keep the plain squeeze_page source.
          utm_source: "squeeze_page",
          ...(platform ? { utm_medium: platform } : {}),
          ...(video ? { utm_campaign: video } : {}),
        }),
      }
    );

    if (!res.ok) {
      const errorJson: BeehiivErrorResponse = await res
        .json()
        .catch(() => ({}));
      const message =
        errorJson.errors?.[0]?.message ??
        errorJson.message ??
        "Subscription failed. Please try again.";
      console.error(`beehiiv subscribe failed (${res.status}):`, message);
      return NextResponse.json({ error: message }, { status: 502 });
    }

    const json: BeehiivSubscriptionResponse = await res.json();
    return NextResponse.json({
      success: true,
      status: json.data?.status ?? "active",
    });
  } catch (error) {
    console.error("beehiiv subscribe errored:", error);
    return NextResponse.json(
      { error: "Subscription failed. Please try again." },
      { status: 502 }
    );
  }
}
