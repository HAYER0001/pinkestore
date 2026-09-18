"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { motion, useMotionValue, useSpring, useReducedMotion } from "motion/react";

/**
 * SCROLL VELOCITY DISTORTION.
 *
 * Stretches content slightly on Y in proportion to Lenis's scroll velocity, so
 * the page feels like it is moving through something dense rather than sliding
 * on glass.
 *
 * Kept deliberately small (max 1.045). Past roughly 1.08 it stops reading as
 * momentum and starts reading as a broken transform — and it makes text
 * genuinely harder to read at exactly the moment someone is scanning for
 * something.
 *
 * transform-only, GPU-composited, and read from a rAF loop rather than React
 * state so nothing re-renders while scrolling.
 */
export function VelocityDistort({
  children,
  max = 0.045,
  className,
}: {
  children: ReactNode;
  max?: number;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const raw = useMotionValue(1);
  const scaleY = useSpring(raw, { stiffness: 220, damping: 26, mass: 0.6 });
  const rafRef = useRef(0);

  useEffect(() => {
    if (reduced) return;
    const loop = () => {
      const lenis = (window as unknown as { lenis?: { velocity: number } }).lenis;
      const v = Math.abs(lenis?.velocity ?? 0);
      /* normalise against a fast-but-plausible flick; clamp so a trackpad
         slam cannot tear the layout */
      const t = Math.min(v / 2600, 1);
      raw.set(1 + t * max);
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [raw, max, reduced]);

  if (reduced) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      style={{ scaleY, transformOrigin: "center center", willChange: "transform" }}
    >
      {children}
    </motion.div>
  );
}
