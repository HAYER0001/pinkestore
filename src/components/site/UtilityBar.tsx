"use client";

import { motion, useReducedMotion } from "motion/react";
import { BRAND } from "@/lib/catalog";

/**
 * THE UTILITY BAR.
 *
 * Every word of this is TRUE. That constraint is the whole design problem —
 * the slot conventionally holds "Free shipping over ₹X" and "30-day returns",
 * and we do not have a shipping policy or a returns window yet. Writing either
 * of them here would be a promise made at the very top of every page on the
 * site, which is the worst possible place to put a guess.
 *
 * So it carries the two things that are verifiably true and that happen to be
 * the two strongest things about this shop anyway: every piece is a single
 * object, and there is a real person in Chandigarh to talk to.
 *
 * It retracts on scroll. A utility bar is a greeting, not furniture — keeping
 * it pinned costs vertical space on every screen for a line nobody re-reads.
 */

const SETTLE = { type: "spring", stiffness: 260, damping: 34, mass: 0.8 } as const;

export function UtilityBar({ hidden }: { hidden: boolean }) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      data-utility-bar
      aria-hidden={hidden}
      className="overflow-hidden"
      style={{ background: "#F3EFE8", borderBottom: "1px solid rgba(26,26,26,0.07)" }}
      initial={false}
      animate={reduced ? undefined : { height: hidden ? 0 : "auto", opacity: hidden ? 0 : 1 }}
      transition={SETTLE}
    >
      <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-6 px-[clamp(1rem,3vw,3rem)] py-2">
        <p className="ty-mono truncate" style={{ color: "#6B645A", margin: 0 }}>
          Every piece one of one — nothing here is restocked
        </p>

        <div className="flex shrink-0 items-center gap-6">
          <span className="ty-mono hidden sm:block" style={{ color: "#6B645A" }}>
            {BRAND.city}, {BRAND.state}
          </span>
          <a
            href={BRAND.instagram}
            className="ty-mono"
            style={{ color: "#96605B", textDecoration: "none" }}
          >
            @the_pinkestore
          </a>
        </div>
      </div>
    </motion.div>
  );
}
