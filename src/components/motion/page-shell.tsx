"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { useCart } from "@/lib/cart";

/**
 * When the drawer opens the whole site steps back — scales to 98% and dims.
 * That is what makes the drawer read as ON TOP of something rather than as a
 * panel that happens to be there.
 */
const SHELL = { type: "spring", stiffness: 100, damping: 15 } as const;

export function PageShell({ children }: { children: ReactNode }) {
  const open = useCart((s) => s.open);
  const reduced = useReducedMotion();

  return (
    <motion.div
      className="flex min-h-full flex-1 flex-col"
      style={{ transformOrigin: "50% 0%" }}
      animate={
        reduced
          ? undefined
          : { scale: open ? 0.98 : 1, filter: open ? "brightness(0.82)" : "brightness(1)" }
      }
      transition={SHELL}
    >
      {children}
    </motion.div>
  );
}
