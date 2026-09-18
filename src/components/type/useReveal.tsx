"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";

/**
 * FAIL-VISIBLE SCROLL REVEAL.
 *
 * This exists because `whileInView` has bitten this project four times, and
 * every bite looked different while being the same bug: content that starts
 * hidden and is only un-hidden by an observer callback is content that is
 * GONE whenever that callback does not arrive.
 *
 * Two ways it does not arrive:
 *
 *   1. The element is clipped out of its own mask. IntersectionObserver
 *      honours `overflow: hidden` on ancestors, so a span translated 112%
 *      down inside a mask reports 0% visible — it can never reach the
 *      threshold that would move it back into view. A deadlock.
 *
 *   2. The reader arrives ALREADY PAST it — a deep link, a refresh that
 *      restores scroll, a fast flick, a scrollTo that overshoots. The
 *      observer only ever sees ratio 0, so the element stays at opacity 0
 *      forever, on a page the reader is looking straight at.
 *
 * THIS DOES NOT USE INTERSECTIONOBSERVER, and that is the point. IO only
 * delivers a callback when the intersection ratio CROSSES a threshold. An
 * instant jump takes an element from below the viewport (ratio 0) to above it
 * (ratio 0) without ever intersecting — the ratio never changes, so no
 * callback is delivered at all and the "top < 0" rescue above never gets to
 * run. That is case 2 again, one level down, and it is why an IO version of
 * this hook still left masks stuck over photographs.
 *
 * A rAF-coalesced scroll listener has no threshold semantics to get wrong. It
 * measures position, and it removes itself the moment it fires.
 */
export function useReveal<T extends Element>(amount = 0.3) {
  const ref = useRef<T | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let raf = 0;
    let done = false;

    const check = () => {
      raf = 0;
      if (done) return;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight || 0;

      /* Denominator is the element height capped to the viewport: an element
         TALLER than the screen can never reach a ratio of 1 against its own
         height, so a 0.6 threshold on a full-bleed photograph would never
         fire. */
      const visible = Math.min(r.bottom, vh) - Math.max(r.top, 0);
      const denom = Math.max(1, Math.min(r.height, vh));
      const ratio = visible > 0 ? visible / denom : 0;

      if (ratio >= amount || r.top < 0) {
        done = true;
        setShown(true);
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", onScroll);
      }
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(check);
    };

    check();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    /* fonts and images change layout after first paint */
    const t = setTimeout(check, 600);

    return () => {
      clearTimeout(t);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [amount]);

  return [ref, shown] as const;
}

/**
 * The component form, for lists — where a hook per item is not possible.
 *
 * This exists because I have now reached for `whileInView` out of habit three
 * times AFTER writing the hook above, each time in a list. Having the safe
 * version be as easy to type as the unsafe one is the only thing that actually
 * prevents it.
 */
export function RevealIn({
  children,
  amount = 0.15,
  delay = 0,
  y = 24,
  className,
  style,
}: {
  children: React.ReactNode;
  amount?: number;
  delay?: number;
  y?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const reduced = useReducedMotion();
  const [ref, shown] = useReveal<HTMLDivElement>(amount);

  return (
    <motion.div
      ref={ref}
      className={className}
      style={style}
      initial={reduced ? false : { opacity: 0, y }}
      animate={shown || reduced ? { opacity: 1, y: 0 } : undefined}
      transition={{ type: "spring", stiffness: 90, damping: 24, mass: 0.9, delay }}
    >
      {children}
    </motion.div>
  );
}
