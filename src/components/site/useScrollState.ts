"use client";

import { useEffect, useState } from "react";

/**
 * SCROLL-STATE IDENTITY.
 *
 * A plain passive scroll listener, deliberately — NOT a Lenis subscription.
 * Lenis drives the real window (wrapper defaults to window), so native scroll
 * events fire either way, and under prefers-reduced-motion SmoothScroll never
 * constructs a Lenis at all. Reading window.scrollY is correct in both cases.
 *
 * Note this is the opposite of the rule for WRITING scroll: window.scrollTo is
 * overwritten on Lenis's next frame and must go through lenis.scrollTo. Read
 * native, write through Lenis.
 *
 * HYSTERESIS is the whole reason this is a hook rather than three lines
 * inline. A single threshold makes the header flicker between states for
 * anyone resting at exactly that offset — and a header that strobes while you
 * hold still is the most conspicuous possible way to look cheap.
 */
export function useScrollState({ on = 64, off = 24 }: { on?: number; off?: number } = {}) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    let raf = 0;
    let last = -1;

    const read = () => {
      raf = 0;
      const y = window.scrollY;
      if (y === last) return;
      last = y;
      setScrolled((was) => (was ? y > off : y > on));
    };

    /* Coalesce to one read per frame. Lenis emits scroll on every rAF while
       smoothing, so an unthrottled handler here would run setState 60x a
       second for the entire duration of every flick. */
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(read);
    };

    read();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [on, off]);

  return scrolled;
}
