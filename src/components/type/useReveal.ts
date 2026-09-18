"use client";

import { useEffect, useRef, useState } from "react";

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
 * So: observe an element that is never clipped, and treat "you are above the
 * viewport" as revealed too — if the reader has already passed it, there is
 * nothing left to animate and everything left to show.
 */
export function useReveal<T extends Element>(amount = 0.3) {
  const ref = useRef<T | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    /* No IntersectionObserver at all (very old browser, some test runners):
       show everything rather than hiding the page. */
    if (typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }

    const io = new IntersectionObserver(
      ([e]) => {
        if (e.intersectionRatio >= amount || e.boundingClientRect.top < 0) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: [...new Set([0, amount, 1])].sort((a, b) => a - b) },
    );

    io.observe(el);
    return () => io.disconnect();
  }, [amount]);

  return [ref, shown] as const;
}
