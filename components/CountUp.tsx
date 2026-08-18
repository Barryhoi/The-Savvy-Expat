"use client";

import { useEffect, useRef, useState } from "react";

interface CountUpProps {
  end: number;
  suffix?: string;
  duration?: number;
  className?: string;
}

/** Counts from 0 to `end` with ease-out once scrolled into view. */
export default function CountUp({
  end,
  suffix = "",
  duration = 1500,
  className = "",
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [value, setValue] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setValue(end);
      return;
    }

    let frame = 0;
    const begin = () => {
      if (started.current) return;
      started.current = true;
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
      const start = performance.now();
      const tick = (now: number) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setValue(Math.round(end * eased));
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      // rAF pauses in hidden tabs — make sure we always land on the final value.
      setTimeout(() => setValue(end), duration + 250);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Start when visible, or if the section was jumped past entirely.
        if (entry.isIntersecting || entry.boundingClientRect.top < 0) begin();
      },
      { threshold: 0.4 }
    );

    // Coalesced to one layout read per animation frame (mirroring
    // ScrollProgress) rather than one per scroll event.
    const check = () => {
      frame = 0;
      if (el.getBoundingClientRect().top < 0) begin();
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(check);
    };

    observer.observe(el);
    window.addEventListener("scroll", onScroll, { passive: true });
    // Last-resort safety net, mirroring Reveal. If the observer never fires,
    // which happens in a backgrounded tab or after a restored scroll position,
    // the figure would otherwise sit at zero forever. A stranded 0 above the
    // fold is far worse than skipping the animation.
    const timer = window.setTimeout(begin, 2500);
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.clearTimeout(timer);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [end, duration]);

  return (
    <span ref={ref} className={className}>
      {value.toLocaleString("en-US")}
      {suffix}
    </span>
  );
}
