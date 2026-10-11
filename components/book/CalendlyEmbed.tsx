"use client";
import Script from "next/script";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { useRouter } from "next/navigation";
import { BOOK_EVENT_URL, bookEmbedUrl } from "@/lib/book-site";
import { isOwnCalendarMessage } from "@/lib/calendly-events";

declare global {
  interface Window {
    Calendly?: { initInlineWidget: (options: { url: string; parentElement: HTMLElement; resize: boolean }) => void };
  }
}


export default function CalendlyEmbed({ nextHref, bookingUrl, onReturn, backgroundColor, eventUrl = BOOK_EVENT_URL }: { nextHref: string; bookingUrl?: string; onReturn?: () => void; backgroundColor?: string; eventUrl?: string }) {
  const enteredDetails = useRef(false);
  const url = useMemo(() => {
    const target = new URL(bookEmbedUrl(bookingUrl ?? eventUrl));
    if (backgroundColor) target.searchParams.set("background_color", backgroundColor);
    return target.toString();
  }, [bookingUrl, backgroundColor, eventUrl]);
  const container = useRef<HTMLDivElement>(null);
  const loaded = useRef(false);
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [pageHeight, setPageHeight] = useState<number | null>(null);
  const [stage, setStage] = useState<"time" | "details">(bookingUrl ? "details" : "time");

  const initialize = useCallback(() => {
    if (container.current && window.Calendly && !container.current.querySelector("iframe")) {
      window.Calendly.initInlineWidget({ url, parentElement: container.current, resize: false });
    }
  }, [url]);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (!isOwnCalendarMessage(event, container.current?.querySelector("iframe") ?? null)) return;
      const name = event.data?.event;
      if (!["calendly.event_type_viewed", "calendly.profile_page_viewed", "calendly.page_height", "calendly.date_and_time_selected", "calendly.event_scheduled"].includes(name)) return;
      if (name === "calendly.page_height") {
        // Calendly sends CSS pixel values such as "1414px".
        const rawHeight = event.data?.payload?.height;
        const height = typeof rawHeight === "number" ? rawHeight :
          typeof rawHeight === "string" && /^\d+(?:\.\d+)?(?:px)?$/.test(rawHeight)
            ? Number.parseFloat(rawHeight) : Number.NaN;
        if (Number.isFinite(height) && height > 0 && height <= 6000) {
          setPageHeight(Math.max(660, Math.ceil(height)));
        }
      }
      loaded.current = true;
      setReady(true);
      setFailed(false);
      if (name === "calendly.event_type_viewed" || name === "calendly.date_and_time_selected") {
        if (bookingUrl && name === "calendly.event_type_viewed") {
          if (enteredDetails.current) onReturn?.();
          return;
        }
        if (name === "calendly.date_and_time_selected") enteredDetails.current = true;
        // Apply the new viewport and its reveal together, before the browser
        // paints Calendly's form at the previous step's responsive width.
        flushSync(() => setStage(name === "calendly.event_type_viewed" ? "time" : "details"));
      }
      if (name === "calendly.event_scheduled") router.push(nextHref);
    };
    window.addEventListener("message", onMessage);
    initialize();
    router.prefetch(nextHref);
    const timer = window.setTimeout(() => { if (!loaded.current) setFailed(true); }, 15000);
    return () => { window.removeEventListener("message", onMessage); window.clearTimeout(timer); };
  }, [initialize, nextHref, router, bookingUrl, onReturn]);

  return (
    <div className="bk-calendar" data-stage={stage}>
      <ol className="bk-steps" aria-label="Booking progress">
        <li aria-current={stage === "time" ? "step" : undefined} className={stage === "time" ? "is-current" : "is-complete"}><span aria-hidden="true">{stage === "details" ? "✓" : "1"}</span>Choose a time</li>
        <li aria-current={stage === "details" ? "step" : undefined} className={stage === "details" ? "is-current" : ""}><span aria-hidden="true">2</span>Your details</li>
      </ol>
      <p className="sr-only" role="status">{stage === "details" ? "Enter your details to confirm your call." : "Choose a date and time for your call."}</p>
      <Script src="https://assets.calendly.com/assets/external/widget.js" onReady={initialize} onError={() => setFailed(true)} />
      <div className="bk-calendar-body" aria-busy={!ready && !failed}>
        {!ready && !failed && <div className="bk-loading" role="status"><span className="bk-spinner" aria-hidden="true" /><p>{bookingUrl ? "Preparing your booking…" : "Finding available times…"}</p></div>}
        {failed && !ready && <div className="bk-error" role="alert"><h3 className="text-2xl font-black">Let’s get your calendar open.</h3><p>It’s taking longer than expected to load.</p><button type="button" onClick={() => window.location.reload()}>Try again</button><a href={eventUrl} target="_blank" rel="noopener noreferrer">Open booking in a new tab ↗</a></div>}
        <div ref={container} id="calendly-book" style={stage === "details" && pageHeight ? { height: pageHeight } : undefined} className={`bk-widget${failed && !ready ? " is-unavailable" : ""}`} />
      </div>
      {stage === "time" && <div className="bk-help"><span>Times shown in your time zone.</span><a href={eventUrl} target="_blank" rel="noopener noreferrer">Trouble booking? ↗</a></div>}
    </div>
  );
}
