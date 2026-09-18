"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

/**
 * THE THREAD & CANVAS REVEAL.
 *
 * No spinner. A single gold thread draws itself across the centre, snaps, and
 * the canvas parts vertically — top half up, bottom half down — on a heavy
 * spring (stiffness 70, damping 20).
 *
 * The preloader is an OVERLAY, never a gate: the page beneath is fully
 * rendered and the overlay is removed on a timer. If the animation stalls the
 * site is still there, and a crawler never sees a blank document.
 */

const CURTAIN = { type: "spring", stiffness: 70, damping: 20 } as const;
const THREAD = { type: "spring", stiffness: 60, damping: 18, mass: 0.8 } as const;

export function Preloader() {
  const reduced = useReducedMotion();
  const [phase, setPhase] = useState<"thread" | "part" | "gone">(
    reduced ? "gone" : "thread",
  );

  useEffect(() => {
    if (reduced) return;
    const t1 = setTimeout(() => setPhase("part"), 1150);
    const t2 = setTimeout(() => setPhase("gone"), 2150);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [reduced]);

  useEffect(() => {
    document.body.style.overflow = phase === "gone" ? "" : "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [phase]);

  return (
    <AnimatePresence>
      {phase !== "gone" && (
        <div className="pointer-events-none fixed inset-0 z-[90]" aria-hidden>
          {/* top half */}
          <motion.div
            className="absolute inset-x-0 top-0 h-1/2 origin-bottom"
            style={{ background: "#1B2A63" }}
            initial={{ y: 0 }}
            animate={{ y: phase === "part" ? "-100%" : 0 }}
            transition={CURTAIN}
          />
          {/* bottom half */}
          <motion.div
            className="absolute inset-x-0 bottom-0 h-1/2 origin-top"
            style={{ background: "#1B2A63" }}
            initial={{ y: 0 }}
            animate={{ y: phase === "part" ? "100%" : 0 }}
            transition={CURTAIN}
          />

          {/* the thread */}
          <motion.svg
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            width="min(70vw, 760px)"
            height="24"
            viewBox="0 0 760 24"
            initial={{ opacity: 1 }}
            animate={{ opacity: phase === "part" ? 0 : 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <defs>
              <linearGradient id="pl-gold" x1="0" x2="1">
                <stop offset="0" stopColor="#E8BC57" stopOpacity="0" />
                <stop offset="0.5" stopColor="#F3D48A" />
                <stop offset="1" stopColor="#E8BC57" stopOpacity="0" />
              </linearGradient>
            </defs>
            {/* silk has slack — the thread is a shallow catenary, not a ruler */}
            <motion.path
              d="M 4 12 C 190 20, 570 20, 756 12"
              fill="none"
              stroke="url(#pl-gold)"
              strokeWidth={1.6}
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={THREAD}
            />
          </motion.svg>
        </div>
      )}
    </AnimatePresence>
  );
}
