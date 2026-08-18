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
      {data && <Lottie animationData={data} loop autoplay />}
    </div>
  );
}
