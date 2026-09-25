import { NextRequest, NextResponse } from "next/server";
import { qualification, validateSubmission } from "@/lib/intake";
import { digest, withLock, writeRecord } from "@/lib/receipt-store";
import {
  applicationKey,
  getApplication,
  issueToken,
  type Application,
} from "@/lib/application";
import { syncApplication } from "@/lib/close";
import { limitApplication } from "@/lib/rate-limit";
import { syncApplicationFollowups } from "@/lib/application-followups";
import { queueUnbookedApplication } from "@/lib/intake-abandonment";
export const runtime = "nodejs";
export const maxDuration = 60;
export async function POST(request: NextRequest) {
  if (request.headers.get("origin") !== new URL(request.url).origin)
    return NextResponse.json(
      { error: "Please submit the application from this website." },
      { status: 403 },
    );
  if (Number(request.headers.get("content-length")) > 24000)
    return NextResponse.json(
      { error: "Application is too long." },
      { status: 413 },
    );
  try {
    const raw = await request.text();
    if (raw.length > 24000) throw new Error("INVALID");
    const body = JSON.parse(raw);
    if (!/^[a-f0-9-]{36}$/.test(body.id)) throw new Error("INVALID");
    await limitApplication(
      request.headers.get("x-vercel-forwarded-for") ||
        request.headers.get("x-forwarded-for")?.split(",")[0] ||
        "local",
    );
    let answers;
    try {
      answers = validateSubmission(body.answers);
    } catch (e) {
      return NextResponse.json(
        {
          error: e instanceof Error ? e.message : "Please check your answers.",
        },
        { status: 400 },
      );
    }
    for (const [key, source] of [
      ["sourcePlatform", "platform"],
      ["sourceVideo", "video"],
    ]) {
      const value = body.attribution?.[source];
      if (typeof value === "string" && value)
        answers[key] = value.replace(/[^\w.-]/g, "").slice(0, 64);
    }
    const hash = digest(JSON.stringify(answers));
    const receipt = await withLock(`application:${body.id}`, async () => {
      let saved = await getApplication(body.id);
      if (saved && saved.value.hash !== hash)
        throw new Error("APPLICATION_CHANGED");
      if (!saved) {
        const reason = qualification(answers);
        const value: Application = {
          id: body.id,
          answers,
          hash,
          submittedAt: new Date().toISOString(),
          qualified: !reason,
          reason,
          receiptToken: await issueToken(body.id),
        };
        const result = await writeRecord(applicationKey(body.id), value);
        saved = { value, etag: result.etag };
      }
      if (!saved.value.synced) {
        const synced = await syncApplication(
          body.id,
          answers,
          saved.value.submittedAt,
        );
        saved.value = { ...saved.value, ...synced, synced: true };
        await writeRecord(applicationKey(body.id), saved.value, saved.etag);
      }
      if (saved.value.qualified) await queueUnbookedApplication(saved.value.id);
      await syncApplicationFollowups(saved.value);
      return saved.value;
    });
    const response = NextResponse.json({
      qualified: receipt.qualified,
      reason: receipt.reason,
    });
    response.cookies.set("savvy_application", receipt.receiptToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 86400,
    });
    response.headers.set("Cache-Control", "no-store");
    return response;
  } catch (e) {
    const code = e instanceof Error ? e.message : "UNKNOWN";
    if (code === "RATE_LIMITED")
      return NextResponse.json(
        { error: "Too many submissions. Please try again in an hour." },
        { status: 429, headers: { "Retry-After": "3600" } },
      );
    console.error(
      "application_failed",
      code.replace(/[^A-Z_0-9]/g, "").slice(0, 80),
    );
    return NextResponse.json(
      {
        error:
          code === "IN_PROGRESS"
            ? "Your application is being saved. Please wait a moment, then try again."
            : code === "APPLICATION_CHANGED"
              ? "This application was already submitted. Please reload to continue."
              : "We couldn't finish saving your application. Your answers are retained; please try again.",
      },
      { status: code === "IN_PROGRESS" ? 409 : 503 },
    );
  }
}
