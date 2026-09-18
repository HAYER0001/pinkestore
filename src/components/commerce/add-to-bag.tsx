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
        <div
          className="px-6 py-5 text-center"
          style={{ border: "1px solid rgba(26,26,26,0.22)" }}
        >
          <p style={{ fontFamily: "var(--font-body)", color: "#6B645A" }}>
            This one has found its person.
          </p>
        </div>
        <p
          className="t-body-ed mt-3"
          style={{ color: "#6B645A", fontSize: "0.9375rem" }}
        >
          Tell us what you were after and we will write when something close
          comes off the loom.
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
      className={`w-full px-6 py-5 text-center disabled:cursor-not-allowed disabled:opacity-55 ${className ?? ""}`}
      style={{
        background: "#1A1A1A",
        color: "#FAF8F5",
        borderRadius: 0,
        fontFamily: "var(--font-body)",
        fontSize: "0.6875rem",
        letterSpacing: "var(--tracking-luxe-widest)",
        textTransform: "uppercase",
      }}
    >
      {maxed ? "That is all there is" : "Add to bag"}
    </motion.button>
  );
}
