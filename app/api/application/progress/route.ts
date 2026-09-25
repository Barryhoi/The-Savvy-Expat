import { NextRequest, NextResponse } from "next/server";
import { validateProgress } from "@/lib/intake-progress";
import { saveProgress } from "@/lib/intake-abandonment";
import { limitApplication } from "@/lib/rate-limit";
export const runtime = "nodejs";
export const maxDuration = 60;
export async function POST(request: NextRequest) {
  if (request.headers.get("origin") !== new URL(request.url).origin) return new Response(null, { status: 403 });
  try {
    const raw = await request.text();
    if (raw.length > 24000) return new Response(null, { status: 413 });
    const body = JSON.parse(raw);
    if (!/^[a-f0-9-]{36}$/.test(body.id) || !Number.isSafeInteger(body.revision) || body.revision < 1) return new Response(null, { status: 400 });
    let answers;
    try { answers = validateProgress(body.answers); } catch { return new Response(null, { status: 400 }); }
    await limitApplication("progress:" + (request.headers.get("x-vercel-forwarded-for") || request.headers.get("x-forwarded-for")?.split(",")[0] || "local"), 300);
    await saveProgress(body.id, body.revision, answers);
    return NextResponse.json({ saved: true }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const code = error instanceof Error ? error.message : "UNKNOWN";
    console.error("progress_failed", code.replace(/[^A-Z_0-9]/g, "").slice(0, 80));
    return new Response(null, { status: code === "RATE_LIMITED" ? 429 : code === "IN_PROGRESS" ? 409 : 503 });
  }
}
