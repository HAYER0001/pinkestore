"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { useCartStore } from "@/store/useCartStore";

/**
 * THE PUSHBACK.
 *
 * When the drawer opens the site is pushed back in Z — scaled, rounded, dimmed
 * and softened — so the cart reads as sitting in front of a physical object
 * rather than as a panel pasted on top.
 *
 * KNOWN TRADE-OFF, stated plainly: `filter` and `scale` both create a stacking
 * context, which disables `mix-blend-mode` on every descendant. The hero
 * headline uses difference, so it renders un-blended while the cart is open.
 * That is acceptable here only because the same filter dims and blurs the
 * whole layer anyway — the colour shift is invisible under brightness(0.7)
 * plus a 2px blur. It is the same mechanism that forced PageShell out of the
 * layout in Phase 5, so it is a deliberate exception, not an oversight.
 *
 * The fixed chrome (Overlay) and the custom cursor are SIBLINGS of this
 * wrapper, not children, so neither is affected.
 */
const PUSH = { type: "spring", stiffness: 120, damping: 20 } as const;

export function AppShell({ children }: { children: ReactNode }) {
  const isOpen = useCartStore((s) => s.isOpen);
  const reduced = useReducedMotion();

  return (
    <motion.main
      style={{ transformOrigin: "50% 40%", willChange: "transform, filter" }}
      animate={
        reduced
          ? undefined
          : {
              scale: isOpen ? 0.98 : 1,
              borderRadius: isOpen ? 16 : 0,
              filter: isOpen ? "brightness(0.7) blur(2px)" : "brightness(1) blur(0px)",
            }
      }
      transition={PUSH}
    >
      {children}
    </motion.main>
  );
}
