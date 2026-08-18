"use client";

import { useEffect, useRef, type ReactNode } from "react";

interface RevealProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

/** Fades content up into view the first time it enters the viewport. */
export default function Reveal({ children, delay = 0, className = "" }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let done = false;
    let frame = 0;
    const finish = () => {
      if (done) return;
      done = true;
      el.classList.add("revealed");
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        // threshold 0 so even a single visible pixel triggers this — a
        // percentage-of-area threshold never fires for very tall blocks
        // (e.g. a long list), since scrolling to their top rarely brings
        // 15% of their total height into view.
        if (entry.isIntersecting || entry.boundingClientRect.top < 0) {
          finish();
        }
      },
      { threshold: 0, rootMargin: "0px 0px -40px 0px" }
    );

    // Fallback: instant jumps (anchor links, programmatic scroll) can move an
    // element past the viewport without ever intersecting it. Coalesced to
    // one layout read per animation frame (mirroring ScrollProgress) rather
    // than one per scroll event, since dozens of these can be live at once
    // on a long page and an un-throttled reader on each is a real source of
    // scroll jank.
    const check = () => {
      frame = 0;
      if (el.getBoundingClientRect().top < 0) finish();
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(check);
    };

    observer.observe(el);
    window.addEventListener("scroll", onScroll, { passive: true });
    // Last-resort safety net: whatever the viewport/observer state, never
    // leave content permanently invisible.
    const timer = window.setTimeout(finish, 2500);
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.clearTimeout(timer);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div ref={ref} className={`reveal ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}
