"use client";

import { useEffect, type ReactNode } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/utils/animations/gsap";

/**
 * LENIS ↔ GSAP, driven off ONE clock.
 *
 * The whole point of this file is that there must not be two independent
 * animation loops. If Lenis runs its own rAF and GSAP runs its own ticker,
 * they drift by a frame and every scroll-linked WebGL value micro-stutters.
 *
 * So: `autoRaf: false` (Lenis 1.3 defaults it to TRUE, which would silently
 * give us the second loop this file exists to prevent), Lenis is stepped from
 * gsap.ticker, and ScrollTrigger.update is fired from Lenis's own scroll event.
 * One clock, three consumers: Lenis, ScrollTrigger, and the R3F frame loop.
 *
 * lagSmoothing(0) is required — GSAP otherwise "helpfully" skips time after a
 * long frame, which desynchronises scrub against a WebGL scene.
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  useEffect(() => {
    /* Respect the OS setting: no hijack, native scroll, no smoothing. */
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      touchMultiplier: 1.6,
      autoRaf: false,
    });

    /* expose for debugging / other components that need to scrollTo */
    (window as unknown as { lenis?: Lenis }).lenis = lenis;

    const onScroll = () => ScrollTrigger.update();
    lenis.on("scroll", onScroll);

    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    /* Fonts and images change document height after first paint; without this
       every trigger position is computed against a stale height. */
    const refresh = () => ScrollTrigger.refresh();
    document.fonts?.ready.then(refresh).catch(() => {});
    window.addEventListener("load", refresh);

    return () => {
      lenis.off("scroll", onScroll);
      gsap.ticker.remove(raf);
      gsap.ticker.lagSmoothing(500, 33);
      window.removeEventListener("load", refresh);
      lenis.destroy();
      delete (window as unknown as { lenis?: Lenis }).lenis;
    };
  }, []);

  return <>{children}</>;
}
