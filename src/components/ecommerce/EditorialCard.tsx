"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { CRAFTS, formatINR, type Product } from "@/lib/catalog";
import { getShots, hoverImage, altFor } from "@/lib/shots";
import { useCursor } from "@/components/dom/CursorContext";

/**
 * THE EDITORIAL CARD (items 41, 42, 45, 46, 47, 48, 49).
 *
 * The type sits BELOW the photograph, not on a scrim over it. A dark gradient
 * with white text across the bottom of every image is the single most
 * recognisable ecommerce tell there is — it exists because a template cannot
 * predict what the photo looks like, so it darkens it defensively. We know
 * what these photographs look like. The cloth gets the whole frame.
 *
 * HOVER CROSSFADE (item 43). The second frame is a different VIEW of the same
 * piece — flat to draped, or flat to border — not the same shot zoomed. That
 * distinction is the whole value: the hover answers "what does it look like
 * from another angle", which is the question that makes someone click.
 *
 * ONE OF ONE (item 45) is a hairline chip, not a red pill. It is a fact about
 * availability, not a discount sticker, and this shop's entire argument falls
 * apart if it looks like urgency marketing.
 */

const DRIFT = { type: "spring", stiffness: 140, damping: 22, mass: 0.7 } as const;

export function EditorialCard({
  product: p,
  priority = false,
  onQuickView,
}: {
  product: Product;
  priority?: boolean;
  onQuickView?: (slug: string) => void;
}) {
  const reduced = useReducedMotion();
  const [hot, setHot] = useState(false);
  const { setTarget, clear } = useCursor();

  const craft = CRAFTS[p.craft];
  const shots = getShots(p.slug);
  const hero = shots[0];
  const second = hoverImage(p.slug);
  const heroSrc = hero?.src ?? p.image;

  return (
    <article
      className="group relative flex flex-col"
      onPointerEnter={() => {
        setHot(true);
        setTarget({ mode: "link" });
      }}
      onPointerLeave={() => {
        setHot(false);
        clear();
      }}
    >
      <Link href={`/product/${p.slug}`} className="block" style={{ textDecoration: "none" }}>
        {/* THE CLOTH GETS THE FRAME (item 42) — nothing printed over it. */}
        <div
          className="relative overflow-hidden"
          style={{ aspectRatio: "3 / 4", background: "#F3EFE8" }}
        >
          <Image
            src={heroSrc}
            alt={hero ? altFor(p, hero) : `${p.name} — ${craft.label}`}
            fill
            quality={88}
            sizes="(max-width: 640px) 92vw, (max-width: 1280px) 46vw, 32vw"
            priority={priority}
            className="object-cover"
          />

          {second && (
            <motion.div
              className="absolute inset-0"
              initial={false}
              animate={{ opacity: reduced ? 0 : hot ? 1 : 0 }}
              transition={{ duration: 0.45, ease: [0.32, 0.72, 0, 1] }}
            >
              <Image
                src={second}
                alt=""
                aria-hidden
                fill
                quality={88}
                sizes="(max-width: 640px) 92vw, (max-width: 1280px) 46vw, 32vw"
                className="object-cover"
              />
            </motion.div>
          )}

          {/* item 45 — a fact, not a sticker */}
          {p.stock === 1 && (
            <span
              className="ty-mono absolute left-0 top-0"
              style={{
                background: "#FAF8F5",
                color: "#1A1A1A",
                padding: "0.5rem 0.9rem",
                borderRight: "1px solid rgba(26,26,26,0.12)",
                borderBottom: "1px solid rgba(26,26,26,0.12)",
              }}
            >
              One of one
            </span>
          )}
        </div>

        {/* ---------------- the information, in order of what matters --------- */}
        <div className="pt-5">
          {/* item 46 — the craft, as micro type */}
          <p className="ty-mono" style={{ color: "#96605B", margin: 0 }}>
            {craft.label}
            {!craft.handmade && <span style={{ color: "#8A2F3B" }}> · printed</span>}
          </p>

          <h3 className="ty-title mt-2" style={{ color: "#1A1A1A", margin: "0.5rem 0 0" }}>
            {p.name}
          </h3>

          {/* item 48 — where it is from, given its own line rather than
              buried in a description nobody expands */}
          <p className="ty-caption mt-1" style={{ color: "#6B645A", margin: "0.25rem 0 0" }}>
            {craft.region}
          </p>

          {/* item 47 — the price is display type, not a label. A price set in
              11px UI type next to a 24px name reads as an afterthought; at
              these values it is the second most important thing on the card. */}
          <p
            className="mt-4"
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 300,
              fontSize: "clamp(1.25rem, 1.8vw, 1.6rem)",
              letterSpacing: "-0.02em",
              color: "#1A1A1A",
              margin: "1rem 0 0",
            }}
          >
            {formatINR(p.pricePaise)}
          </p>
        </div>
      </Link>

      {/* item 49 — "View piece", not "Add to cart". The card's job is to get
          someone to LOOK; the decision happens on the piece's own page. */}
      <div className="mt-4 flex items-center gap-6">
        <Link
          href={`/product/${p.slug}`}
          className="ty-mono"
          aria-label={`View ${p.name}`}
          style={{ color: "#1A1A1A", textDecoration: "none", borderBottom: "1px solid #96605B", paddingBottom: 3 }}
        >
          View piece
        </Link>

        {/* item 50 — quick view is SECONDARY, and it is a button, not a
            second link competing with the primary one */}
        {onQuickView && (
          <button
            type="button"
            onClick={() => onQuickView(p.slug)}
            aria-label={`Quick view — ${p.name}`}
            className="ty-mono"
            style={{ color: "#6B645A", background: "none", border: "none", padding: 0, cursor: "pointer" }}
          >
            Quick view
          </button>
        )}
      </div>
    </article>
  );
}
