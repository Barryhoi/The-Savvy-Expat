"use client";

import { useEffect, useRef } from "react";

const PLANE = 22; // px, the plane's own width, kept out of the travel range

/**
 * Where the tail sits inside the plane's box, in px.
 *
 * The icon is drawn nose-up in a 24 unit viewBox spanning y 2 (nose) to y 22
 * (tail). Rotating a quarter turn maps y to x as x' = 24 - y, so the tail lands
 * at x' = 2 of 24. Scaled into the 22px box that is 2 * (22 / 24).
 *
 * The trail is drawn to this point rather than to the plane's leading edge, so
 * the line appears to come straight out of the back of the aircraft instead of
 * running through it.
 */
const TAIL = 2 * (PLANE / 24);

/**
 * A hairline progress bar across the top of a long page, with a small plane
 * flying along its leading edge.
 *
 * /king runs past twenty thousand pixels, and a reader on a phone has no idea
 * how much is left. This gives him that, and it is the one piece of chrome the
 * page carries. The plane is the brand's own mark doing the work: the trail
 * behind it is the distance already flown.
 *
 * Both the trail and the plane are written straight to refs as transforms, so
 * scrolling never triggers a React re-render, and both are read inside one
 * requestAnimationFrame so a fast flick coalesces into a single measurement
 * per frame rather than one per scroll event.
 */
export default function ScrollProgress({
  anchor,
}: {
  /**
   * CSS selector for a sticky element to fly beneath, such as the site header
   * on an article page. The strip measures that element rather than assuming a
   * height, so a header that changes size across breakpoints stays handled.
   * Omit it and the strip pins to the top of the viewport.
   */
  anchor?: string;
} = {}) {
  const trailRef = useRef<HTMLDivElement>(null);
  const planeRef = useRef<HTMLDivElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const trail = trailRef.current;
    const plane = planeRef.current;
    const strip = stripRef.current;
    if (!trail || !plane || !strip) return;

    const anchorEl = anchor
      ? document.querySelector<HTMLElement>(anchor)
      : null;

    let frame = 0;
    const measure = () => {
      frame = 0;
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - window.innerHeight;
      const progress =
        scrollable > 0 ? Math.min(Math.max(window.scrollY / scrollable, 0), 1) : 0;

      // Ride the bottom edge of the sticky header rather than the top of the
      // screen, so the plane never crosses the logo.
      if (anchorEl) {
        strip.style.top = `${Math.max(
          anchorEl.getBoundingClientRect().bottom,
          0
        )}px`;
      }

      const width = window.innerWidth;
      // The plane stops short of the right edge by its own width so it never
      // flies off the screen at the bottom of the page.
      const planeX = progress * (width - PLANE);

      plane.style.transform = `translate3d(${planeX}px, 0, 0)`;
      // The trail ends at the tail, not under the fuselage, so the line reads
      // as coming out of the back of the plane rather than through it.
      trail.style.transform = `scaleX(${width > 0 ? (planeX + TAIL) / width : 0})`;
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [anchor]);

  return (
    /* The bar stays flush against the top edge of the screen. The strip below
       it is only as tall as the plane, so the aircraft hangs just under the
       line with its tail fin running up into it. */
    <div
      ref={stripRef}
      className="pointer-events-none fixed inset-x-0 top-0 z-50"
      style={{ height: PLANE }}
      aria-hidden="true"
    >
      <div
        ref={trailRef}
        className="absolute inset-x-0 top-0 h-[3px] origin-left scale-x-0 bg-gradient-to-r from-primary via-primary-soft to-primary"
        style={{ boxShadow: "0 0 12px rgba(122,92,255,0.55)" }}
      />
      <div
        ref={planeRef}
        className="absolute left-0 top-0 will-change-transform"
        style={{ width: PLANE, height: PLANE }}
      >
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className="h-full w-full text-primary"
          style={{ filter: "drop-shadow(0 1px 4px rgba(73,52,251,0.5))" }}
        >
          {/* Drawn nose-up, then turned a quarter turn so it flies along the
              line rather than across it. */}
          <g transform="rotate(90 12 12)">
            <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
          </g>
        </svg>
      </div>
    </div>
  );
}
