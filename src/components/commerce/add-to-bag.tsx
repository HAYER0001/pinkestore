"use client";

import { motion } from "motion/react";
import { useCart } from "@/lib/cart";

export function AddToBag({
  slug,
  stock,
  className,
}: {
  slug: string;
  stock: number;
  className?: string;
}) {
  const add = useCart((s) => s.add);
  const lines = useCart((s) => s.lines);
  const inBag = lines.find((l) => l.slug === slug)?.qty ?? 0;
  const soldOut = stock === 0;
  const maxed = inBag >= stock;

  if (soldOut) {
    return (
      <div className={className}>
        <div className="rounded-sm border border-pk-border-strong px-6 py-4 text-center">
          <p className="t-body text-pk-fg-muted">This one has found its person.</p>
        </div>
        <p className="t-small mt-2 text-pk-fg-subtle">
          Tell us what you were after and we will write when something close comes off the loom.
        </p>
      </div>
    );
  }

  return (
    <motion.button
      onClick={() => add(slug)}
      disabled={maxed}
      whileTap={maxed ? undefined : { scale: 0.985 }}
      transition={{ type: "spring", stiffness: 520, damping: 30 }}
      className={`w-full rounded-sm px-6 py-4 text-center transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-55 ${className ?? ""}`}
      style={{
        background: "var(--pk-accent-solid)",
        color: "var(--pk-on-accent)",
      }}
    >
      {maxed ? "That is all there is" : "Add to bag"}
    </motion.button>
  );
}
