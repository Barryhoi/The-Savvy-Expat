"use client";

import { useEffect, useState } from "react";
import Lottie from "lottie-react";

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

  return (
    <div style={{ width: size, height: size }} aria-hidden="true">
      {/* Plays its intro once and settles on the last frame. Six of these
          render at once in the services grid; looping all of them forever
          keeps six requestAnimationFrame loops competing with Lenis's own
          for the rest of the visit, which is a real source of scroll jank
          for something that's purely decorative after the first look. */}
      {data && <Lottie animationData={data} loop={false} autoplay />}
    </div>
  );
}
