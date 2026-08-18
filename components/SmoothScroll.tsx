"use client";

import { useEffect } from "react";
import Lenis from "lenis";

/**
 * Eases wheel/touch input into scroll position over time instead of letting
 * the browser jump straight there — the same library thesavvyexpat.com runs,
 * which is what actually produces its "smooth" feel (there is no such effect
 * in native scrolling, however jank-free). Renders nothing.
 */
export default function SmoothScroll() {
  useEffect(() => {
    const lenis = new Lenis({
      autoRaf: true,
      // Scroll tracks the input 1:1 and skips the easing when the user has
      // asked for reduced motion, rather than this feature ignoring them.
      respectReducedMotion: true,
    });

    return () => lenis.destroy();
  }, []);

  return null;
}
