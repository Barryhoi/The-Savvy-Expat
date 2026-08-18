import { NextResponse } from "next/server";
import type {
  BeehiivErrorResponse,
  BeehiivSubscriptionResponse,
} from "@/types/beehiiv";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  let email: unknown;
  try {
    const body = await request.json();
    email = body?.email;
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
          utm_source: "squeeze_page",
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
