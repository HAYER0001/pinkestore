"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { Magnetic } from "@/components/ui/magnetic";
import { useCart } from "@/lib/cart";
import { useCursor } from "@/components/dom/CursorContext";
import { CRAFTS, formatINR, type Product } from "@/lib/catalog";

/**
 * Editorial product card.
 *
 * Hover does NOT scale the card. A scale-110 enlarges the border and the type
 * along with the photo, which is what makes stock templates read as cheap.
 * Instead the IMAGE drifts on Y inside a fixed frame — the crop changes, the
 * furniture does not.
 */

/* Emil Kowalski's weight: slow enough to have mass, damped enough not to wobble. */
const HEAVY = { type: "spring", stiffness: 100, damping: 15 } as const;
const DRIFT = { type: "spring", stiffness: 140, damping: 22, mass: 0.7 } as const;

export function ProductCard({
  product: p,
  area,
  priority = false,
}: {
  product: Product;
  /** grid-area shorthand, e.g. "1 / 1 / 3 / 8" */
  area?: string;
  priority?: boolean;
}) {
  const reduced = useReducedMotion();
  const [hot, setHot] = useState(false);
  const add = useCart((s) => s.add);
  const ref = useRef<HTMLDivElement>(null);
  const craft = CRAFTS[p.craft];
  const { setTarget, clear } = useCursor();

  return (
    <motion.div
      ref={ref}
      onHoverStart={() => {
        setHot(true);
        /* Hand the ring this card's box so it snaps to the frame instead of
           floating over it. Measured on enter, not stored, because the grid
           reflows on resize. */
        const r = ref.current?.getBoundingClientRect();
        if (r) setTarget({ mode: "product", rect: { x: r.x, y: r.y, w: r.width, h: r.height } });
      }}
      onHoverEnd={() => {
        setHot(false);
        clear();
      }}
      style={{ gridArea: area, borderRadius: 0 }}
      className="relative overflow-hidden border border-[#1A1A1A]/15 bg-[#F3EFE8]"
    >
      <Link href={`/product/${p.slug}`} className="block h-full w-full">
        {/* the frame is fixed; only the photograph moves */}
        <motion.div
          className="absolute inset-0"
          animate={reduced ? undefined : { y: hot ? -14 : 0 }}
          transition={DRIFT}
        >
          <Image
            src={p.image}
            alt={`${p.name} — ${craft.label}`}
            fill
            quality={90}
            sizes="(max-width: 768px) 92vw, (max-width: 1280px) 48vw, 40vw"
            priority={priority}
            /* scale 1.08 gives the drift somewhere to travel without exposing
               an edge at the bottom of the frame */
            className="object-cover"
            style={{ transform: "scale(1.08)" }}
          />
        </motion.div>

        {/* bottom-up scrim, only as strong as it needs to be to carry text */}
        <motion.div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-1/2"
          style={{
            background:
              "linear-gradient(to top, rgba(12,10,8,0.94) 0%, rgba(12,10,8,0.62) 38%, rgba(12,10,8,0) 100%)",
          }}
          /* 0.55 at rest was fine over the dark jamawar and illegible over the
             pale sozni and chikankari. The scrim has to be sized for the
             LIGHTEST photograph in the set, not the average one. */
          animate={{ opacity: hot ? 1 : 0.88 }}
          transition={DRIFT}
        />

        <div className="absolute inset-x-0 bottom-0 p-5 md:p-7">
          <p
            className="t-micro-ed"
            style={{
              color: "#F0C86B",
              letterSpacing: "var(--tracking-luxe-wide)",
            }}
          >
            {craft.label}
          </p>

          <h3
            className="mt-2"
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 300,
              fontSize: "clamp(1.4rem, 2.4vw, 2.4rem)",
              lineHeight: 1.02,
              letterSpacing: "-0.025em",
              color: "#FBF7EF",
            }}
          >
            {p.name}
          </h3>

          <div className="mt-2 flex items-baseline gap-4">
            <span
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "0.8125rem",
                letterSpacing: "0.06em",
                color: "#FBF7EF",
                opacity: 0.85,
              }}
            >
              {formatINR(p.pricePaise)}
            </span>
            {p.stock === 1 && (
              <span
                className="t-micro-ed"
                style={{ color: "#FBF7EF", opacity: 0.6, letterSpacing: "var(--tracking-luxe)" }}
              >
                One of one
              </span>
            )}
          </div>
        </div>
      </Link>

      {/* quick add — rides up on the heavy spring, magnetic on approach */}
      <motion.div
        className="absolute bottom-5 right-5 md:bottom-7 md:right-7"
        initial={false}
        animate={
          reduced
            ? { y: 0, opacity: 1 }
            : { y: hot ? 0 : 58, opacity: hot ? 1 : 0 }
        }
        transition={HEAVY}
      >
        <Magnetic
          intensity={0.4}
          range={110}
          springOptions={{ stiffness: 180, damping: 14, mass: 0.3 }}
        >
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              add(p.slug);
            }}
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.6875rem",
              letterSpacing: "var(--tracking-luxe)",
              textTransform: "uppercase",
              color: "#1A1A1A",
              background: "#FBF7EF",
              border: "1px solid #1A1A1A",
              borderRadius: 0,
              padding: "0.85rem 1.4rem",
              cursor: "pointer",
            }}
          >
            Quick add
          </button>
        </Magnetic>
      </motion.div>
    </motion.div>
  );
}
