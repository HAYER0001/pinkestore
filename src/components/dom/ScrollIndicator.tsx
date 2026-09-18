"use client";

import { motion, useReducedMotion } from "motion/react";

/**
 * A 1px track with a short bright line falling through it, forever.
 * No bouncing arrow — an arrow instructs, a falling line suggests.
 */
export function ScrollIndicator({ label = "Scroll to explore" }: { label?: string }) {
  const reduced = useReducedMotion();

  return (
    <div
      className="flex flex-col items-center gap-5"
      style={{ mixBlendMode: "var(--chrome-blend, difference)" as React.CSSProperties["mixBlendMode"] }}
    >
      <span
        className="t-micro-ed"
        style={{ color: "var(--chrome-ink, #FFFFFF)", letterSpacing: "var(--tracking-luxe-widest)" }}
      >
        {label}
      </span>

      <div
        aria-hidden
        style={{
          position: "relative",
          width: 1,
          height: 60,
          background: "color-mix(in srgb, var(--chrome-ink, #FFF) 50%, transparent)",
          overflow: "hidden",
        }}
      >
        {!reduced && (
          <motion.div
            style={{ position: "absolute", left: 0, width: 1, height: 15, background: "var(--chrome-ink, #FFFFFF)" }}
            initial={{ y: -15 }}
            animate={{ y: 60 }}
            transition={{
              duration: 2,
              ease: [0.76, 0, 0.24, 1],
              repeat: Infinity,
              repeatDelay: 0.35,
            }}
          />
        )}
      </div>
    </div>
  );
}
