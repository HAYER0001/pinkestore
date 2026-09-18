"use client";

import { useRef, type ReactNode } from "react";
import { motion, useMotionValue, useSpring, useReducedMotion } from "motion/react";

/**
 * MAGNETIC WRAPPER.
 *
 * THE MATH
 *   d       = cursor - buttonCentre            (a VECTOR, not a scalar)
 *   dist    = |d|
 *   falloff = 1 - smoothstep(range*0.6, range, dist)
 *   offset  = clamp(d * PULL, ±MAX) * falloff
 *
 * Using `d` directly rather than normalize(d) matters: at dist = 0 the offset
 * is naturally zero — the button is already under the cursor — and it grows
 * linearly outward. A normalized vector would snap the button to full offset
 * the instant the cursor crossed into range, which reads as a glitch.
 *
 * `falloff` decays the pull to exactly zero AT the range boundary, so there is
 * no visible jump when the cursor leaves. Without it the button teleports home
 * from wherever it happened to be.
 */

const PULL = 0.32;
const MAX = 14;
const SNAP = { stiffness: 400, damping: 25, mass: 0.4 } as const;

const smoothstep = (a: number, b: number, t: number) => {
  const x = Math.min(Math.max((t - a) / (b - a), 0), 1);
  return x * x * (3 - 2 * x);
};

export function Magnet({
  children,
  range = 120,
  className,
}: {
  children: ReactNode;
  range?: number;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, SNAP);
  const sy = useSpring(my, SNAP);

  const onMove = (e: React.PointerEvent) => {
    if (reduced) return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const dx = e.clientX - (r.x + r.width / 2);
    const dy = e.clientY - (r.y + r.height / 2);
    const dist = Math.hypot(dx, dy);

    const falloff = 1 - smoothstep(range * 0.6, range, dist);
    mx.set(Math.max(-MAX, Math.min(MAX, dx * PULL)) * falloff);
    my.set(Math.max(-MAX, Math.min(MAX, dy * PULL)) * falloff);
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ x: reduced ? 0 : sx, y: reduced ? 0 : sy, display: "inline-block" }}
      onPointerMove={onMove}
      onPointerLeave={() => {
        mx.set(0);
        my.set(0);
      }}
    >
      {children}
    </motion.div>
  );
}
