"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const CAL_ORIGIN = "https://app.cal.com";
const CAL_SCRIPT = `${CAL_ORIGIN}/embed/embed.js`;
/** How long to wait before deciding the calendar is never going to appear. */
const LOAD_TIMEOUT_MS = 8000;

type CalFn = ((...args: unknown[]) => void) & {
  ns?: Record<string, (...args: unknown[]) => void>;
  loaded?: boolean;
  q?: unknown[];
};

declare global {
  interface Window {
    Cal?: CalFn;
  }
}

/**
 * The upstream Cal loader snippet, transcribed so it can run inside an effect.
 * It queues calls made before embed.js finishes downloading, so the namespace
 * is safe to use immediately after this returns.
 */
function ensureCalLoader(): CalFn {
  const w = window;
  if (w.Cal) return w.Cal;

  const push = (target: { q?: unknown[] }, args: unknown) => {
    target.q = target.q || [];
    target.q.push(args);
  };

  const cal = function (...args: unknown[]) {
    const c = w.Cal as CalFn;
    if (!c.loaded) {
      c.ns = {};
      c.q = c.q || [];
      const script = document.createElement("script");
      script.src = CAL_SCRIPT;
      document.head.appendChild(script);
      c.loaded = true;
    }
    if (args[0] === "init") {
      const namespace = args[1];
      if (typeof namespace === "string") {
        const api = function (...inner: unknown[]) {
          push(api, inner);
        } as CalFn;
        api.q = api.q || [];
        c.ns![namespace] = c.ns![namespace] || api;
        push(c.ns![namespace] as unknown as { q?: unknown[] }, args);
        push(c, ["initNamespace", namespace]);
      } else {
        push(c, args);
      }
      return;
    }
    push(c, args);
  } as CalFn;

  w.Cal = cal;
  return cal;
}

/**
 * The booking calendar, wired to hand the visitor to the confirmation page.
 *
 * `bookingSuccessful` is the whole point of doing this in a component instead
 * of pasting the raw snippet: Cal shows its own inline success state, and
 * without this callback the funnel would simply stop there.
 */
export default function CalEmbed({
  calLink,
  namespace,
  nextHref,
}: {
  /** e.g. "team/the-savvy-expat/expat-relocation-discovery-call" */
  calLink: string;
  namespace: string;
  /** Where a completed booking sends the visitor. */
  nextHref: string;
}) {
  const elementId = useRef(`cal-inline-${namespace}`);
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "ready" | "failed">("loading");

  useEffect(() => {
    const Cal = ensureCalLoader();
    router.prefetch(nextHref);

    // If `linkReady` never arrives — blocked script, offline, Cal outage —
    // stop spinning and hand over a working link instead.
    const timer = window.setTimeout(
      () => setStatus((s) => (s === "ready" ? s : "failed")),
      LOAD_TIMEOUT_MS
    );

    Cal("init", namespace, { origin: CAL_ORIGIN });

    const ns = Cal.ns?.[namespace];
    if (!ns) {
      window.clearTimeout(timer);
      setStatus("failed");
      return;
    }

    ns("inline", {
      elementOrSelector: `#${elementId.current}`,
      config: {
        layout: "month_view",
        useSlotsViewOnSmallScreen: "true",
        theme: "light",
      },
      calLink,
    });

    // Cal paints its own white surface. Hand it the page's lavender instead so
    // the calendar reads as part of the page rather than a card dropped on it.
    ns("ui", {
      theme: "light",
      cssVarsPerTheme: {
        light: {
          "cal-brand": "#4934FB",
          "cal-bg": "transparent",
          "cal-bg-emphasis": "rgba(4,22,48,0.06)",
          "cal-bg-subtle": "rgba(4,22,48,0.04)",
          "cal-bg-muted": "transparent",
          "cal-border": "rgba(4,22,48,0.10)",
          "cal-border-subtle": "rgba(4,22,48,0.08)",
          "cal-border-emphasis": "rgba(4,22,48,0.18)",
        },
        dark: { "cal-brand": "#fafafa" },
      },
      hideEventTypeDetails: false,
      layout: "month_view",
    });

    const markReady = () => {
      window.clearTimeout(timer);
      setStatus("ready");
    };

    // Cal's own readiness event is the fast path, but don't depend on it:
    // watching for the iframe Cal mounts is what actually proves the calendar
    // is on screen, whatever the embed decides to name its events.
    ns("on", { action: "linkReady", callback: markReady });

    const host = document.getElementById(elementId.current);
    const observer = new MutationObserver(() => {
      if (host?.querySelector("iframe")) {
        markReady();
        observer.disconnect();
      }
    });
    if (host) {
      if (host.querySelector("iframe")) markReady();
      else observer.observe(host, { childList: true, subtree: true });
    }

    ns("on", {
      action: "bookingSuccessful",
      callback: () => router.push(nextHref),
    });

    return () => {
      window.clearTimeout(timer);
      observer.disconnect();
    };
  }, [calLink, namespace, nextHref, router]);

  return (
    <div className="relative">
      {status !== "ready" && (
        <div className="absolute inset-0 z-10 flex items-center justify-center p-8">
          {status === "loading" ? (
            <p className="flex items-center gap-3 text-sm font-medium text-ink/50">
              <span
                className="h-4 w-4 animate-spin rounded-full border-2 border-primary/25 border-t-primary"
                aria-hidden="true"
              />
              Loading available times…
            </p>
          ) : (
            <div className="max-w-sm text-center">
              <p className="text-lg font-black">The calendar didn&apos;t load</p>
              <p className="mt-2 text-sm leading-relaxed text-ink/60">
                Usually an ad blocker or a dropped connection. You can pick your
                time directly instead — same calendar.
              </p>
              <a
                href={`${CAL_ORIGIN}/${calLink}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-shine mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-on-primary shadow-glow transition-all duration-300 hover:-translate-y-0.5"
              >
                Open the calendar
              </a>
            </div>
          )}
        </div>
      )}
      <div
        id={elementId.current}
        className="min-h-[620px] w-full overflow-y-auto"
      />
    </div>
  );
}
