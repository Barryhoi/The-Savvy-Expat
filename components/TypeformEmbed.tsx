"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { readAttribution } from "@/lib/attribution";

const EMBED_SCRIPT = "https://embed.typeform.com/next/embed.js";
/** How long to wait before deciding the embed is never going to appear. */
const LOAD_TIMEOUT_MS = 15000;

interface TypeformApi {
  /** Scans the DOM for `data-tf-*` elements and mounts them. */
  load: () => void;
}

declare global {
  interface Window {
    tf?: TypeformApi;
  }
}

/** Loads the Typeform embed script once and resolves when its API is ready. */
function loadTypeform(): Promise<TypeformApi> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Typeform can only load in the browser"));
  }
  if (window.tf) return Promise.resolve(window.tf);

  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(
      () => reject(new Error("Typeform embed timed out")),
      LOAD_TIMEOUT_MS
    );
    const settle = (fn: () => void) => {
      window.clearTimeout(timer);
      fn();
    };
    const onReady = () =>
      settle(() =>
        window.tf ? resolve(window.tf) : reject(new Error("Typeform API missing"))
      );
    const onError = () => settle(() => reject(new Error("load failed")));

    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${EMBED_SCRIPT}"]`
    );
    if (existing) {
      existing.addEventListener("load", onReady, { once: true });
      existing.addEventListener("error", onError, { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = EMBED_SCRIPT;
    script.async = true;
    script.addEventListener("load", onReady, { once: true });
    script.addEventListener("error", onError, { once: true });
    document.head.appendChild(script);
  });
}

/**
 * The intake form, wired to hand the visitor straight to the booking calendar.
 *
 * Mounted by the form's own id (`data-tf-widget`) rather than the "live embed"
 * id from Typeform's share panel. A live id costs an extra round trip to
 * api.typeform.com before the form can even start loading — measured at
 * ~0.85s on a phone, on top of the ~3.7s Typeform takes to serve the form
 * itself — and its only benefit was re-pointing the form without a deploy,
 * which the direct-link fallback below never followed anyway. To move the
 * funnel to a different form, change FORM_ID on the page.
 *
 * Typeform owns the ending: qualified applicants redirect to the calendar;
 * other applicants see the configured ending. Never navigate on every submit.
 */
export default function TypeformEmbed({
  formId,
  nextHref,
  className = "",
}: {
  /** The Typeform form id, e.g. `my8rCVz6`. */
  formId: string;
  /** Where a completed form sends the visitor. */
  nextHref: string;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "ready" | "failed">("loading");
  const fallbackUrl = `https://form.typeform.com/to/${formId}`;
  // The direct link mirrors whatever hidden fields the embed carries, so a
  // blocked embed doesn't also mean lost attribution.
  const [directUrl, setDirectUrl] = useState(fallbackUrl);

  useEffect(() => {
    let cancelled = false;

    // Warm the next page so the post-submit hop is instant.
    router.prefetch(nextHref);

    // Attribution: replay the tags the subscribe step banked (or the current
    // URL's ?video/?platform) into the form as hidden fields. Set on the DOM
    // node before tf.load() scans it — values are sanitized to [\w.-] so the
    // key=value,key=value format can't be broken. Forms without these hidden
    // fields declared simply ignore them.
    const attr = readAttribution();
    const hiddenPairs = [
      attr.video ? `video=${attr.video}` : null,
      attr.platform ? `platform=${attr.platform}` : null,
    ].filter(Boolean);
    if (hiddenPairs.length > 0) {
      containerRef.current?.setAttribute("data-tf-hidden", hiddenPairs.join(","));
      setDirectUrl(`${fallbackUrl}#${hiddenPairs.join("&")}`);
    }

    // Let long mobile questions extend the page. A maximum height clips the
    // services list into a second scroll area inside the iframe.
    const phone = window.matchMedia("(max-width: 767px)").matches;
    const minHeight = phone ? Math.max(480, window.innerHeight) : 320;
    // A swipe should scroll the services list, not answer/skip the question.
    if (phone) containerRef.current?.setAttribute("data-tf-disable-scroll", "true");
    containerRef.current?.setAttribute(
      "data-tf-auto-resize",
      phone ? String(minHeight) : "320,900"
    );

    // Typeform announces a question before its SDK applies the new height.
    // Align after that layout update, without a smooth animation competing
    // with iframe focus and the browser's scroll anchoring during a resize.
    let scrollFrame = 0;
    const scrollToForm = () => {
      window.cancelAnimationFrame(scrollFrame);
      scrollFrame = window.requestAnimationFrame(() => {
        scrollFrame = window.requestAnimationFrame(() => {
          scrollFrame = 0;
          containerRef.current?.scrollIntoView({ behavior: "instant", block: "start" });
        });
      });
    };

    const onMessage = (event: MessageEvent) => {
      const iframe = containerRef.current?.querySelector("iframe");
      if (
        event.origin !== "https://form.typeform.com" ||
        !iframe ||
        event.source !== iframe.contentWindow
      ) {
        return;
      }
      const data = event.data;
      const type =
        typeof data === "string"
          ? data
          : data && typeof data === "object"
            ? (data as { type?: string }).type
            : undefined;
      if (type === "form-ready") setStatus("ready");
      if (
        phone &&
        (type === "form-screen-changed" ||
          (type === "form-height-changed" && scrollFrame !== 0))
      ) {
        scrollToForm();
      }
      // Do not redirect on form-submit: it also fires for disqualified endings.
      // The SDK follows the redirect configured on the qualified ending only.
    };
    window.addEventListener("message", onMessage);

    loadTypeform()
      .then((tf) => {
        if (cancelled) return;
        tf.load();
      })
      .catch(() => {
        if (!cancelled) setStatus("failed");
      });

    // The script can resolve while the iframe still 404s or hangs; if no
    // `form-ready` has arrived by now, show the direct link instead.
    const readyTimer = window.setTimeout(() => {
      if (!cancelled) setStatus((s) => (s === "ready" ? s : "failed"));
    }, LOAD_TIMEOUT_MS);

    return () => {
      cancelled = true;
      window.removeEventListener("message", onMessage);
      window.clearTimeout(readyTimer);
      window.cancelAnimationFrame(scrollFrame);
    };
  }, [formId, nextHref, fallbackUrl, router]);

  const fallback = (
    <div className="flex min-h-[360px] items-center justify-center p-8">
      <div className="mx-auto max-w-sm text-center">
        <p className="text-lg font-black">The form didn&apos;t load</p>
        <p className="mt-2 text-sm leading-relaxed text-ink/60">
          Usually an ad blocker or a dropped connection. You can open it
          directly instead — it&apos;s the same form.
        </p>
        <a
          href={directUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-shine mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-on-primary shadow-glow transition-all duration-300 hover:-translate-y-0.5"
        >
          Open the form
        </a>
      </div>
    </div>
  );

  // Inline mode avoids the mobile launcher/fullscreen takeover. The loading
  // placeholder reserves space until the SDK applies the question's height.
  return (
    <div className={`relative w-full [overflow-anchor:none] ${status === "ready" ? "" : "min-h-[420px]"} ${className}`}>
      {status === "failed" && fallback}
      {status === "loading" && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <p className="flex items-center gap-3 text-sm font-medium text-ink/50">
            <span
              className="h-4 w-4 animate-spin rounded-full border-2 border-primary/25 border-t-primary"
              aria-hidden="true"
            />
            Loading your form…
          </p>
        </div>
      )}
      {/* Keep the iframe mounted after a timeout so a late ready event can recover it. */}
      <div
        ref={containerRef}
        hidden={status === "failed"}
        data-tf-widget={formId}
        data-tf-opacity="50"
        data-tf-inline-on-mobile
        data-tf-redirect-target="_top"
        className="w-full"
      />
    </div>
  );
}
