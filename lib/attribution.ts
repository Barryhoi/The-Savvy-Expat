/**
 * Attribution hand-off between the squeeze funnel and the intake form.
 *
 * ManyChat links land on /subscribe with ?video=<post id>&platform=<source>.
 * Every hop after that (/survey, /king, /form) is a deliberate full browser
 * navigation, so URL params don't survive the trip. Instead, the subscribe
 * form banks the tags in localStorage the moment the visitor actually
 * subscribes, and the Typeform embed on /form reads them back as hidden
 * fields. Organic visitors have nothing stored and nothing changes for them.
 */

const KEY = "se_attribution";
/** Attribution older than this is stale enough to drop. */
const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

export type Attribution = { video?: string; platform?: string };

/** Mirror of the /api/subscribe sanitizer, so what we replay into Typeform
 * is the same shape that went to beehiiv. */
function clean(value: string | null | undefined): string | undefined {
  if (!value) return undefined;
  const tag = value.replace(/[^\w.-]/g, "").slice(0, 64);
  return tag || undefined;
}

/** Store the tags that just converted a subscriber. No-ops without tags. */
export function saveAttribution(video?: string | null, platform?: string | null) {
  const entry: Attribution = { video: clean(video), platform: clean(platform) };
  if (!entry.video && !entry.platform) return;
  try {
    localStorage.setItem(KEY, JSON.stringify({ ...entry, ts: Date.now() }));
  } catch {
    // Private mode / storage full — attribution falls back to inference.
  }
}

/**
 * Current attribution for this browser: URL params on the page right now win
 * (an exact, fresh tag), then whatever the subscribe step banked, if it isn't
 * stale. Always safe to call; returns {} when there's nothing.
 */
export function readAttribution(): Attribution {
  const result: Attribution = {};
  try {
    const params = new URLSearchParams(window.location.search);
    result.video = clean(params.get("video"));
    result.platform = clean(params.get("platform"));
    if (result.video || result.platform) return result;

    const raw = localStorage.getItem(KEY);
    if (!raw) return result;
    const stored = JSON.parse(raw) as Attribution & { ts?: number };
    if (!stored.ts || Date.now() - stored.ts > MAX_AGE_MS) {
      localStorage.removeItem(KEY);
      return result;
    }
    result.video = clean(stored.video);
    result.platform = clean(stored.platform);
  } catch {
    // Storage or JSON trouble reads as "no attribution", never as an error.
  }
  return result;
}
