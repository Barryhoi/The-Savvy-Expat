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

    // No useSlotsViewOnSmallScreen here, deliberately. That flag swaps the
    // whole booker for a separate slots-only view when a date is tapped on a
    // phone — but the swapped-in view keeps the month view's reported height,
    // so the visitor got four slot buttons followed by ~500px of dead page
    // before the next section, and (before cal-bg was solid) the old view
    // bleeding through the new one. Without the flag, Cal's natural stacked
    // mobile layout lists the day's slots directly under the calendar and the
    // iframe height tracks the real content. Desktop is unaffected either way.
    ns("inline", {
      elementOrSelector: `#${elementId.current}`,
      config: {
        layout: "month_view",
        theme: "light",
        // After a date is tapped on a phone, the booker scrolls its slot list
        // into view. Safari refuses cross-origin scrollIntoView, so on Safari
        // Cal instead asks the parent page to scroll by the list's offset
        // *inside the iframe* — which is only right when the iframe's top is
        // at the top of the viewport. A phone visitor has always already
        // scrolled down to reach the calendar, so the page overshot by that
        // amount and dumped them in the testimonials. Off; the slots render
        // directly under the calendar and need no scroll at all.
        "ui.autoscroll": "false",
        // Phones hide the event-details column (see applyUi); this keeps the
        // timezone picker available above the calendar when they do.
        showTimezoneWhenEventDetailsHidden: "true",
      },
      calLink,
    });

    // Cal paints its own white surface. Hand it the page's lavender instead so
    // the calendar reads as part of the page rather than a card dropped on it.
    //
    // cssVarsPerTheme writes a `.light { --name: value !important }` block
    // straight into the embed iframe's own <head> (see Cal's embed-iframe-init
    // applyCssVars) — it isn't limited to the documented cal-* names, it sets
    // whatever key you give it. The phone-country dropdown doesn't read any
    // cal-* token at all: its panel is styled by Tailwind's `bg-popover`
    // class, which resolves through --popover (itself defined as
    // `var(--color-white)` in Cal's base theme). Something about the embedded
    // context left that chain unresolved, rendering the panel transparent, so
    // pin both links directly rather than relying on Cal's own default.
    //
    // cal-bg is transparent ONLY on wide screens, where the month grid and the
    // slot list render side by side and the page's lavender shows through as
    // intended. On narrow screens the booker stacks its surfaces, and
    // transparency has bitten twice there (the slots overlay ghosting through
    // the event details; the see-through phone-country dropdown), so below the
    // desktop breakpoint the embed gets the page base color as a solid fill:
    // visually identical to the blend, but opaque wherever surfaces overlap.
    //
    // cal-bg-emphasis is the pill Cal draws behind every day that has open
    // slots; unavailable days are plain muted text. It must contrast with
    // cal-bg — the previous #e8e9f1 was one shade off the page base, so
    // bookable and unbookable dates looked identical. White pills read at a
    // glance and match the site's white-cards-on-lavender language.
    const wideScreen = window.matchMedia("(min-width: 1024px)");
    const applyUi = () => {
      ns("ui", {
        theme: "light",
        cssVarsPerTheme: {
          light: {
            "cal-brand": "#4934FB",
            "cal-brand-emphasis": "#3d2ae8",
            "cal-brand-text": "#ffffff",
            "cal-bg": wideScreen.matches ? "transparent" : "#e9e7f4",
            "cal-bg-emphasis": "#ffffff",
            "cal-bg-subtle": "#f2f2f8",
            "cal-bg-muted": "#f6f6fb",
            "cal-border": "rgba(4,22,48,0.10)",
            "cal-border-subtle": "rgba(4,22,48,0.12)",
            "cal-border-emphasis": "rgba(4,22,48,0.18)",
            "color-white": "#ffffff",
            popover: "#ffffff",
          },
          dark: { "cal-brand": "#fafafa" },
        },
        // On a phone the details column (avatar, title, four-line description,
        // duration, location) stacks above the calendar and pushes it a whole
        // screen down. The page heading already says what the call is, and
        // the confirm step repeats the title, duration and time — so phones
        // open straight on the calendar. Desktop keeps the three-column view.
        hideEventTypeDetails: !wideScreen.matches,
        layout: "month_view",
      });
    };
    applyUi();
    wideScreen.addEventListener("change", applyUi);

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
      wideScreen.removeEventListener("change", applyUi);
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
        className={`w-full ${status === "ready" ? "" : "min-h-[620px]"}`}
      />
    </div>
  );
}
