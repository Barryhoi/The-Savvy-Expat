"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { CAL_ORIGIN, ensureCalLoader } from "@/lib/booking";

/** How long to wait before deciding the calendar is never going to appear. */
const LOAD_TIMEOUT_MS = 15000;

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
    let active = true;
    let navigated = false;
    setStatus("loading");
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

    const markReady = () => {
      if (!active) return;
      window.clearTimeout(timer);
      setStatus("ready");
    };
    const markFailed = () => {
      if (!active) return;
      window.clearTimeout(timer);
      setStatus("failed");
    };
    const onBooked = (event: {
      detail?: { data?: { confirmed?: boolean; booking?: { paymentUid?: string } } };
    }) => {
      if (!active || navigated) return;
      // Let Cal finish pending approvals or payment before claiming confirmation.
      const data = event.detail?.data;
      if (!data || data.confirmed === false || data.booking?.paymentUid) return;
      navigated = true;
      router.push(nextHref);
    };

    // Register before mounting: cached calendars can report ready immediately.
    ns("on", { action: "linkReady", callback: markReady });
    ns("on", { action: "linkFailed", callback: markFailed });
    ns("on", { action: "bookingSuccessful", callback: onBooked });

    ns("inline", {
      elementOrSelector: `#${elementId.current}`,
      config: {
        layout: "month_view",
        theme: "light",
        // Mobile date taps open Cal's dedicated time picker. Keeping the slots
        // below the month grid triggers a separate SDK route-change scroll to
        // the embed's top, which hides the times the visitor just requested.
        // The dedicated picker puts date, timezone and slots together in view
        // on every selection; desktop keeps the side-by-side month layout.
        // Disable the legacy Safari parent-scroll fallback, whose iframe-local
        // offset can otherwise overshoot into the content below the calendar.
        "ui.autoscroll": "false",
        useSlotsViewOnSmallScreen: "true",
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
        // Cal also applies this option to the final booking-details screen.
        // Keep the summary visible so phones can verify date, time and timezone.
        hideEventTypeDetails: false,
        layout: "month_view",
      });
    };
    applyUi();
    wideScreen.addEventListener("change", applyUi);

    // React can rerun the effect with an existing embed (including StrictMode).
    // An iframe alone proves nothing; only Cal's completed loading state does.
    const host = document.getElementById(elementId.current);
    if (host?.querySelector('cal-inline[loading="done"]')) markReady();

    return () => {
      active = false;
      window.clearTimeout(timer);
      ns("off", { action: "linkReady", callback: markReady });
      ns("off", { action: "linkFailed", callback: markFailed });
      ns("off", { action: "bookingSuccessful", callback: onBooked });
      wideScreen.removeEventListener("change", applyUi);
    };
  }, [calLink, namespace, nextHref, router]);

  return (
    <div className="relative">
      {status !== "ready" && (
        <div
          role="status"
          aria-live="polite"
          className="absolute inset-0 z-10 flex items-center justify-center bg-[#e9e7f4] p-8"
        >
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
        aria-hidden={status === "failed" ? true : undefined}
        className={`w-full ${status === "ready" ? "" : "min-h-[620px]"} ${status === "failed" ? "invisible" : ""}`}
      />
    </div>
  );
}
