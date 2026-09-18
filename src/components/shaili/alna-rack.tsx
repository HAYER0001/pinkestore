"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  motion,
  useMotionValue,
  useVelocity,
  useSpring,
  useTransform,
  useReducedMotion,
  type MotionValue,
} from "motion/react";
import { PRODUCTS, CRAFTS, formatINR, type Product } from "@/lib/catalog";

/**
 * THE ALNA — the wooden rod a cloth shop hangs its stock on.
 *
 * Drag the rack sideways and the pieces swing, because cloth hanging from a
 * rod has mass. The swing is driven by DRAG VELOCITY, not by a canned
 * keyframe: each piece reads the rack's velocity through its own spring, so
 * they fall out of phase with one another exactly as real hanging cloth does.
 *
 * Accessibility: dragging is an enhancement, never the only way through. The
 * rack is a real scroll container with a real focus order, so Tab walks the
 * pieces and the browser scrolls to them. Arrow keys nudge it. Under
 * prefers-reduced-motion the swing is removed and it is a plain scroller.
 */

const CARD_W = 268;

export function AlnaRack() {
  const reduced = useReducedMotion();
  const scroller = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const grab = useRef({ startX: 0, startLeft: 0, active: false, moved: 0 });

  /** Rack velocity, shared by every hanging piece. */
  const x = useMotionValue(0);
  const rawV = useVelocity(x);
  const velocity = useSpring(rawV, {
    stiffness: 90,
    damping: 18,
    mass: 0.7,
  });

  const items = PRODUCTS;

  const nudge = (dir: 1 | -1) =>
    scroller.current?.scrollBy({ left: dir * CARD_W, behavior: "smooth" });

  return (
    <section
      className="graph relative overflow-hidden"
      style={
        {
          background: "#C2185B",
          "--hard-ink": "#1E1712",
          "--graph-line": "rgba(30,23,18,0.14)",
        } as React.CSSProperties
      }
      aria-labelledby="alna-heading"
    >
      <div className="relative mx-auto max-w-7xl px-4 pt-14 md:px-8">
        <span className="chip" style={{ background: "#FFF3D6", color: "#1E1712" }}>
          [ शैली ०५ · PHULKARI ]
        </span>

        <h2
          id="alna-heading"
          className="hard mt-5 inline-block px-5 py-3"
          style={{
            background: "#FFF3D6",
            color: "#1E1712",
            fontSize: "clamp(22px, 4.2vw, 40px)",
            fontWeight: 700,
            letterSpacing: "-0.03em",
          }}
        >
          ON THE ALNA
        </h2>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <span
            className="chip"
            style={{ background: "#F5B301", color: "#1E1712" }}
          >
            ↔ drag the rack — the cloth swings
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => nudge(-1)}
              aria-label="Previous piece"
              className="hard hard-press px-3 py-1.5"
              style={{ background: "#FFF3D6", color: "#1E1712", fontSize: "var(--fs-md)" }}
            >
              ←
            </button>
            <button
              onClick={() => nudge(1)}
              aria-label="Next piece"
              className="hard hard-press px-3 py-1.5"
              style={{ background: "#FFF3D6", color: "#1E1712", fontSize: "var(--fs-md)" }}
            >
              →
            </button>
          </div>
        </div>
      </div>

      {/* the rod */}
      <div className="relative mt-10">
        <div
          aria-hidden
          className="absolute inset-x-0 top-[26px] z-0 h-[10px]"
          style={{
            background:
              "repeating-linear-gradient(90deg,#6B3A1F 0 22px,#7C4526 22px 44px)",
            borderTop: "2px solid #1E1712",
            borderBottom: "2px solid #1E1712",
          }}
        />

        <div
          ref={scroller}
          className="relative z-10 flex snap-x snap-mandatory gap-7 overflow-x-auto px-4 pb-16 md:px-8"
          style={{
            scrollbarWidth: "none",
            cursor: dragging ? "grabbing" : "grab",
          }}
          /* Pointer-drag to scroll. A native overflow container scrolls with
             touch and trackpad but NOT with a held mouse button, so the "drag
             the rack" affordance would be a lie on desktop without this. */
          onPointerDown={(e) => {
            const el = e.currentTarget;
            grab.current = {
              startX: e.clientX,
              startLeft: el.scrollLeft,
              active: true,
              moved: 0,
            };
            setDragging(true);
          }}
          onPointerMove={(e) => {
            if (!grab.current.active) return;
            const dx = e.clientX - grab.current.startX;
            grab.current.moved = Math.abs(dx);
            e.currentTarget.scrollLeft = grab.current.startLeft - dx;
          }}
          onPointerUp={() => {
            grab.current.active = false;
            setDragging(false);
          }}
          onPointerLeave={() => {
            grab.current.active = false;
            setDragging(false);
          }}
          /* A drag that travelled must not also open the product. */
          onClickCapture={(e) => {
            if (grab.current.moved > 6) {
              e.preventDefault();
              e.stopPropagation();
            }
          }}
          onScroll={(e) => x.set(-(e.currentTarget.scrollLeft ?? 0))}
          onKeyDown={(e) => {
            if (e.key === "ArrowRight") { e.preventDefault(); nudge(1); }
            if (e.key === "ArrowLeft") { e.preventDefault(); nudge(-1); }
          }}
          tabIndex={0}
          role="region"
          aria-label="Pieces hanging on the rack, scrollable"
        >
          {items.map((p, i) => (
            <Hanging
              key={p.slug}
              product={p}
              i={i}
              velocity={velocity}
              still={!!reduced}
            />
          ))}
          <div className="w-4 shrink-0 md:w-8" aria-hidden />
        </div>
      </div>
    </section>
  );
}

function Hanging({
  product: p,
  i,
  velocity,
  still,
}: {
  product: Product;
  i: number;
  velocity: MotionValue<number>;
  still: boolean;
}) {
  /* Each piece answers the rack's velocity through its OWN spring, so the row
     falls out of phase. Heavier pieces (lower stiffness) lag further. */
  const own = useSpring(velocity, {
    stiffness: 60 + ((i * 17) % 40),
    damping: 12 + ((i * 7) % 8),
    mass: 0.5 + ((i % 3) * 0.25),
  });
  const rotate = useTransform(own, [-2600, 0, 2600], [11, 0, -11], {
    clamp: true,
  });

  const craft = CRAFTS[p.craft];

  return (
    <motion.div
      className="relative shrink-0 snap-start"
      style={{
        width: CARD_W,
        rotate: still ? 0 : rotate,
        transformOrigin: "50% 0%",
      }}
    >
      {/* hook */}
      <div
        aria-hidden
        className="mx-auto h-[34px] w-[14px]"
        style={{
          borderLeft: "2px solid #1E1712",
          borderRight: "2px solid #1E1712",
          borderBottom: "2px solid #1E1712",
          borderRadius: "0 0 8px 8px",
          background: "#E8BC57",
        }}
      />

      <Link
        href={`/product/${p.slug}`}
        className="hard hard-press torn-bottom block overflow-hidden"
        style={{ background: "#FFF3D6", color: "#1E1712" }}
      >
        <div className="relative aspect-4/5 overflow-hidden border-b-2 border-[#1E1712]">
          <Image
            src={p.image}
            alt={`${p.name} — ${craft.label}`}
            width={p.width}
            height={p.height}
            quality={90}
            sizes="268px"
            className="h-full w-full scale-[1.7] object-cover object-[40%_56%]"
          />
          {p.stock === 1 && (
            <span
              className="chip absolute left-2 top-2"
              style={{ background: "#F5B301", color: "#1E1712" }}
            >
              1 of 1
            </span>
          )}
        </div>

        <div className="px-4 pb-7 pt-3">
          <p
            className="font-mono"
            style={{ fontSize: "var(--fs-xs)", letterSpacing: "0.14em", opacity: 0.7 }}
          >
            // {String(i + 1).padStart(2, "0")} · {craft.region.toUpperCase()}
          </p>
          <p
            className="mt-1.5"
            style={{ fontSize: "var(--fs-3xl)", fontWeight: 700, letterSpacing: "-0.02em" }}
          >
            {p.name}
          </p>
          <p className="mt-1" style={{ fontSize: "var(--fs-md)", opacity: 0.75 }}>
            {craft.label}
          </p>
          <p
            className="mt-3 font-mono"
            style={{ fontSize: "var(--fs-lg)", fontWeight: 600 }}
          >
            {formatINR(p.pricePaise)}
          </p>
        </div>
      </Link>
    </motion.div>
  );
}
