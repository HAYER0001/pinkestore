"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useCartStore, selectCartCount } from "@/store/useCartStore";

/**
 * THE BAG.
 *
 * A POTLI — the drawstring cloth pouch — not a shopping cart and not a paper
 * carrier bag. Both of those are pictograms of a supermarket. This house sells
 * cloth, in India, and the potli is the object a piece actually leaves in.
 * Drawn in the monogram's language: one hairline, no fill, nothing that closes
 * into a counter-shape that would fill in at 18px.
 *
 * THE COUNT IS ISOLATED. When it changes, the numeral rides out and the new
 * one rides in behind it — and the pouch does not move at all. The cheap
 * version pops or bounces the whole icon, which draws the eye to the furniture
 * instead of to the fact that something changed.
 */

const COUNT = { type: "spring", stiffness: 400, damping: 25, mass: 0.4 } as const;

export function PotliGlyph({
  size = 20,
  stroke = "currentColor",
  weight = 1.25,
}: {
  size?: number;
  stroke?: string;
  weight?: number;
}) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      {/* the drawstring loop */}
      <path
        d="M 9.6 9.6 C 9.4 6.2 10.3 4.6 12 4.6 C 13.7 4.6 14.6 6.2 14.4 9.6"
        stroke={stroke}
        strokeWidth={weight * 0.85}
        strokeLinecap="round"
      />
      {/* the gathered neck */}
      <path d="M 7.4 9.9 L 16.6 9.9" stroke={stroke} strokeWidth={weight} strokeLinecap="round" />
      {/* the pouch: heavier at the base, the way a filled cloth bag hangs */}
      <path
        d="M 8.1 10.1 C 6.2 13.4 5.6 16.6 7.2 18.7 C 8.6 20.5 10.2 21.1 12 21.1 C 13.8 21.1 15.4 20.5 16.8 18.7 C 18.4 16.6 17.8 13.4 15.9 10.1"
        stroke={stroke}
        strokeWidth={weight}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function BagButton({
  tone = "currentColor",
  blend,
  className,
  onPointerEnter,
  onPointerLeave,
}: {
  tone?: string;
  blend?: string;
  className?: string;
  onPointerEnter?: () => void;
  onPointerLeave?: () => void;
}) {
  const reduced = useReducedMotion();
  const openCart = useCartStore((s) => s.openCart);
  const count = useCartStore(selectCartCount);

  return (
    <button
      type="button"
      onClick={openCart}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      /* The visible label is a numeral, which tells a screen reader nothing.
         The accessible name has to carry both what it opens and what is in it. */
      aria-label={`Bag — ${count} ${count === 1 ? "piece" : "pieces"}`}
      className={`pointer-events-auto inline-flex items-center gap-2.5 ${className ?? ""}`}
      style={{
        color: tone,
        background: "none",
        border: "none",
        padding: 0,
        borderRadius: 0,
        cursor: "pointer",
        mixBlendMode: blend as React.CSSProperties["mixBlendMode"],
      }}
    >
      <PotliGlyph size={20} stroke={tone} />

      {/* Fixed width, tabular figures: the header must not reflow when the
          count crosses from 9 to 10, and neighbouring items must not shuffle
          sideways while a number is mid-flight. */}
      <span
        aria-hidden="true"
        className="relative block overflow-hidden text-center"
        style={{
          width: "1.4ch",
          height: "1em",
          fontFamily: "var(--font-body)",
          fontSize: "0.6875rem",
          fontVariantNumeric: "tabular-nums",
          letterSpacing: "0.04em",
          lineHeight: 1,
        }}
      >
        <AnimatePresence initial={false} mode="popLayout">
          <motion.span
            key={count}
            className="block"
            initial={reduced ? false : { y: "-105%" }}
            animate={{ y: "0%" }}
            exit={reduced ? { opacity: 0 } : { y: "105%" }}
            transition={COUNT}
          >
            {count}
          </motion.span>
        </AnimatePresence>
      </span>
    </button>
  );
}
