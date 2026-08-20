"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const EMBED_SCRIPT = "https://embed.typeform.com/next/embed.js";
/** How long to wait before deciding the embed is never going to appear. */
const LOAD_TIMEOUT_MS = 8000;

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
 * Mounted through `data-tf-live` + `tf.load()` — the snippet Typeform gives you
 * — rather than `createWidget`, because a live id is not a classic form id:
 * passing one to `createWidget` requests a form URL that doesn't exist and
 * Typeform answers with a generic marketing page instead of the form.
 *
 * The live id resolves to whichever form it currently points at, so the submit
 * handoff listens for the embed's own `form-submit` message rather than
 * hard-coding the resolved id. Re-point the form in Typeform and this keeps
 * working.
 */
export default function TypeformEmbed({
  liveId,
  nextHref,
  fallbackUrl,
  className = "",
}: {
  /** The `data-tf-live` id from Typeform's embed snippet. */
  liveId: string;
  /** Where a completed form sends the visitor. */
  nextHref: string;
  /** Direct form link, shown if the embed script never loads. */
  fallbackUrl: string;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "ready" | "failed">("loading");

  useEffect(() => {
    let cancelled = false;

    // Warm the next page so the post-submit hop is instant.
    router.prefetch(nextHref);

    const onMessage = (event: MessageEvent) => {
      if (!event.origin.includes("typeform.com")) return;
      const data = event.data;
      const type =
        typeof data === "string"
          ? data
          : data && typeof data === "object"
            ? (data as { type?: string }).type
            : undefined;
      if (type === "form-ready") setStatus("ready");
      if (type === "form-submit") router.push(nextHref);
    };
    window.addEventListener("message", onMessage);

    // The embed script locks the page by writing `overflow: hidden` onto
    // <body> — it assumes it owns the whole viewport. This is an inline embed
    // inside a normal scrolling page, so strip that back off whenever it
    // appears, otherwise nothing below the form can be reached.
    const body = document.body;
    const originalOverflow = body.style.overflow;
    const unlockScroll = () => {
      if (body.style.overflow === "hidden") body.style.overflow = originalOverflow;
    };
    const bodyObserver = new MutationObserver(unlockScroll);
    bodyObserver.observe(body, {
      attributes: true,
      attributeFilter: ["style"],
    });

    loadTypeform()
      .then((tf) => {
        if (cancelled) return;
        tf.load();
        unlockScroll();
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
      bodyObserver.disconnect();
      body.style.overflow = originalOverflow;
    };
  }, [liveId, nextHref, router]);

  if (status === "failed") {
    return (
      <div className="flex min-h-[360px] items-center justify-center p-8">
        <div className="mx-auto max-w-sm text-center">
          <p className="text-lg font-black">The form didn&apos;t load</p>
          <p className="mt-2 text-sm leading-relaxed text-ink/60">
            Usually an ad blocker or a dropped connection. You can open it
            directly instead — it&apos;s the same form.
          </p>
          <a
            href={fallbackUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-shine mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-on-primary shadow-glow transition-all duration-300 hover:-translate-y-0.5"
          >
            Open the form
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative min-h-[560px] w-full ${className}`}>
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
      <div
        ref={containerRef}
        data-tf-live={liveId}
        data-tf-opacity="50"
        // Same Lenis-vs-nested-scroll conflict fixed on the YouTube and Cal
        // embeds — this container always ends up with an iframe once loaded,
        // and Typeform's own question flow scrolls internally.
        data-lenis-prevent
        className="h-full min-h-[560px] w-full"
      />
    </div>
  );
}
