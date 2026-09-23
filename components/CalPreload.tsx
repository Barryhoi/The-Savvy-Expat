"use client";

import { useEffect } from "react";

import { preloadCalBooker } from "@/lib/booking";

/** If the form never reports ready, warm the calendar anyway after this long. */
const FALLBACK_MS = 8000;

/**
 * Pre-warms the /booking calendar while the visitor is still filling in the
 * intake form. Waits for the Typeform embed's own `form-ready` message so the
 * warm-up never competes with the form for bandwidth, with a timer fallback
 * in case that message never arrives.
 */
export default function CalPreload() {
  useEffect(() => {
    let fired = false;
    const fire = () => {
      if (fired) return;
      fired = true;
      window.removeEventListener("message", onMessage);
      window.clearTimeout(timer);
      preloadCalBooker();
    };
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== "https://form.typeform.com") return;
      const data = event.data;
      const type =
        typeof data === "string"
          ? data
          : data && typeof data === "object"
            ? (data as { type?: string }).type
            : undefined;
      if (type === "form-ready") fire();
    };
    window.addEventListener("message", onMessage);
    const timer = window.setTimeout(fire, FALLBACK_MS);
    return () => {
      window.removeEventListener("message", onMessage);
      window.clearTimeout(timer);
    };
  }, []);

  return null;
}
