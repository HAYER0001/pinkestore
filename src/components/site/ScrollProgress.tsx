"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";

/**
 * SCROLL PROGRESS (item 28).
 *
 * The homepage is roughly nine viewports of continuous scroll with no chapter
 * breaks a reader can see. Without a progress signal there is no way to tell
 * a long deliberate sequence from a page that will not end — and the second
 * reading is the one that makes people leave.
 *
 * A HAIRLINE, not a bar. It sits on the very top edge, one pixel tall, in the
 * rose ink. Anything thicker reads as a download.
 *
 * Progress is computed from scrollY over the scrollable distance, not from
 * Lenis — Lenis is absent entirely under prefers-reduced-motion, and the
 * indicator still has to work there.
 */
export function ScrollProgress({
  tone = "#96605B",
  /* only worth showing on pages long enough to get lost in */
  minScreens = 2.5,
}: {
  tone?: string;
  minScreens?: number;
}) {
  const reduced = useReducedMotion();
  const [p, setP] = useState(0);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    let raf = 0;

    const read = () => {
      raf = 0;
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      setEnabled(doc.scrollHeight > window.innerHeight * minScreens);
      /* round to 1/500 so we re-render ~500 times over the whole page rather
         than once per frame for the entire duration of every flick */
      setP(max > 0 ? Math.round((window.scrollY / max) * 500) / 500 : 0);
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(read);
    };

    read();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    /* images and fonts change scrollHeight after first paint */
    const t = setTimeout(read, 1200);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      clearTimeout(t);
      clearTimeout(t);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [minScreens]);

  if (!enabled) return null;

  return (
    <div
      data-scroll-progress
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-[70]"
      style={{ height: 1 }}
    >
      <motion.div
        style={{
          height: 1,
          background: tone,
          transformOrigin: "left center",
          width: "100%",
        }}
        initial={false}
        animate={{ scaleX: p }}
        transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 40, mass: 0.3 }}
      />
    </div>
  );
}
