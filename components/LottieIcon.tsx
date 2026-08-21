"use client";

import { useEffect, useRef, useState } from "react";
import Lottie, { type LottieRefCurrentProps } from "lottie-react";

interface LottieIconProps {
  src: string;
  size?: number;
}

/**
 * Plays a Lottie animation fetched at runtime. Used for the service icons —
 * the same Lordicon "wired-outline" assets the live Framer site uses.
 */
export default function LottieIcon({ src, size = 112 }: LottieIconProps) {
  const [data, setData] = useState<object | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const lottieRef = useRef<LottieRefCurrentProps>(null);

  useEffect(() => {
    let alive = true;
    fetch(src)
      .then((res) => res.json())
      .then((json) => {
        if (alive) setData(json);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [src]);

  // Loops continuously, but only while actually on screen. Six of these
  // render at once in the services grid; looping all of them forever
  // regardless of scroll position keeps six requestAnimationFrame loops
  // competing with Lenis's own for the rest of the visit. Pausing off-screen
  // instances keeps the loop everyone expects without that cost.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) lottieRef.current?.play();
        else lottieRef.current?.pause();
      },
      { threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} style={{ width: size, height: size }} aria-hidden="true">
      {data && <Lottie animationData={data} lottieRef={lottieRef} loop autoplay />}
    </div>
  );
}
