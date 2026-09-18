"use client";

import { useEffect } from "react";
import { motion, useSpring, useTransform, useReducedMotion } from "motion/react";
import { formatINR } from "@/lib/catalog";

/** The total rolls to its new value on a spring rather than snapping. */
export function RollingINR({ paise, className }: { paise: number; className?: string }) {
  const reduced = useReducedMotion();
  const spring = useSpring(paise, { stiffness: 90, damping: 20, mass: 0.7 });
  const text = useTransform(spring, (v) => formatINR(Math.round(v)));

  useEffect(() => {
    if (reduced) spring.jump(paise);
    else spring.set(paise);
  }, [paise, reduced, spring]);

  return (
    <motion.span className={className} aria-label={formatINR(paise)}>
      {text}
    </motion.span>
  );
}
