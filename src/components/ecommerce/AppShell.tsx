"use client";

import { useState, type ReactNode } from "react";
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
 *
 * SECOND, SHARPER TRAP — found by the E2E, not by reading:
 * `will-change: transform` creates a containing block for position:fixed
 * descendants just as `transform` does. Declaring it permanently re-anchored
 * GSAP's ScrollTrigger pin (which works by setting position:fixed) to THIS
 * element instead of the viewport, so the pinned headline tracked scroll
 * instead of holding — 7425px of drift with no error anywhere.
 *
 * So will-change is applied ONLY while the cart is open. Outside that window
 * this element must create no containing block at all.
 */
const PUSH = { type: "spring", stiffness: 120, damping: 20 } as const;

export function AppShell({ children }: { children: ReactNode }) {
  const isOpen = useCartStore((s) => s.isOpen);
  const reduced = useReducedMotion();

  /* Stays true through the close animation, then flips false so every
     containing-block-creating property can be removed entirely. */
  const [engaged, setEngaged] = useState(false);
  const active = isOpen || engaged;

  return (
    /* A DIV, not <main>.
       This is the layer that gets pushed back when the cart opens — a visual
       wrapper, not the main content landmark. Marking it <main> put the site
       header and footer INSIDE main (so the document had no banner and no
       contentinfo landmark at all) and nested a second <main> inside it on
       every page that declares its own. <main> must be unique per document. */
    <motion.div
      data-app-shell
      /* At rest this element must declare NO transform, NO filter and NO
         will-change. transform:scale(1) and filter:brightness(1) are not
         no-ops — any value other than `none` creates a containing block for
         fixed descendants, which re-anchors GSAP's pin away from the viewport.
         So the style object is empty unless the push is actually engaged. */
      style={
        active
          ? { transformOrigin: "50% 40%", willChange: "transform, filter" }
          : { transformOrigin: "50% 40%" }
      }
      animate={
        reduced || !active
          ? undefined
          : {
              scale: isOpen ? 0.98 : 1,
              borderRadius: isOpen ? 16 : 0,
              filter: isOpen ? "brightness(0.7) blur(2px)" : "brightness(1) blur(0px)",
            }
      }
      onAnimationStart={() => setEngaged(true)}
      onAnimationComplete={() => {
        if (!isOpen) setEngaged(false);
      }}
      transition={PUSH}
    >
      {children}
    </motion.div>
  );
}
