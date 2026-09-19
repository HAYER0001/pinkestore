"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { ScrollTrigger } from "@/utils/animations/gsap";
import { canvasStore } from "@/utils/animations/canvas-store";
import { PRODUCTS, CRAFTS, formatINR, type Product } from "@/lib/catalog";
import { getShots, hoverImage, altFor } from "@/lib/shots";
import { useCart } from "@/lib/cart";
import { useCursor } from "@/components/dom/CursorContext";
import { MaskedImage } from "@/components/site/MaskedImage";
import { DisplayComposition } from "@/components/type/DisplayComposition";
import { RevealIn } from "@/components/type/useReveal";

/**
 * 04 · THE GALLERY WALL.
 *
 * Replaces the 12-column bento of scrim-over-photo cards. A card — border,
 * dark gradient, white text pinned to its bottom edge, a hover that lifts it —
 * is the single most recognisable ecommerce object there is, and the brief
 * asks for none of it.
 *
 * This is hung like a wall. Four photographs at three different widths and
 * two different vertical offsets, on a cream ground, with the type set
 * BESIDE each one in the margin the way a museum label sits beside a frame.
 * Nothing is boxed. Nothing lifts on hover — the photograph crossfades to a
 * second view of the same piece, which is the one hover behaviour that tells
 * the buyer something.
 *
 * WHAT IS KEPT FROM THE OLD GALLERY, because tests and the WebGL layer depend
 * on it: the section id, the `.pk-bento` hook on the container, the canvas
 * handoff ScrollTrigger (an invisible canvas still renders 52k particles), the
 * cursor locking onto a frame on hover, and a per-piece add-to-bag.
 */

/* column start / span on a 12-col grid, and a vertical drop, per slot */
const HANG = [
  { col: "1 / span 7", drop: "0", ratio: "4 / 5" },
  { col: "9 / span 4", drop: "clamp(4rem, 14vh, 12rem)", ratio: "3 / 4" },
  { col: "2 / span 4", drop: "clamp(2rem, 6vh, 5rem)", ratio: "3 / 4" },
  { col: "7 / span 6", drop: "0", ratio: "4 / 5" },
];

export function GalleryWall() {
  const section = useRef<HTMLElement>(null);

  /* ---- the WebGL handoff ----
     When the wall reaches the top of the viewport the canvas is dead weight.
     Hiding it is not enough: an invisible canvas still renders 52k particles
     and a video texture at 60fps, which is the fastest way to flatten a phone. */
  useEffect(() => {
    const el = section.current;
    if (!el) return;
    const st = ScrollTrigger.create({
      trigger: el,
      start: "top 80%",
      end: "bottom top",
      onEnter: () => canvasStore.setActive(false),
      onLeaveBack: () => canvasStore.setActive(true),
    });
    return () => {
      st.kill();
      canvasStore.setActive(true);
    };
  }, []);

  return (
    <section
      ref={section}
      id="pieces"
      data-chrome="light"
      className="ground-paper relative scroll-mt-24"
      style={{ background: "#FAF8F5" }}
    >
      <div className="mx-auto max-w-[1600px] px-[clamp(1rem,3vw,3rem)] pb-[clamp(5rem,12vh,10rem)] pt-[clamp(5rem,12vh,9rem)]">
        <header className="mb-[clamp(3rem,8vh,6rem)] grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="ty-mono" style={{ color: "#8A6812", letterSpacing: "var(--tracking-luxe-widest)" }}>
              The Collection
            </p>
            <DisplayComposition
              as="h2"
              className="mt-5"
              lines={[
                { text: "Four pieces,", scale: "display" },
                { text: "four hands", scale: "display", italic: true },
              ]}
              style={{ color: "#1A1A1A" }}
            />
          </div>
          <p className="ty-read max-w-[34ch]" style={{ color: "#4A443C", margin: 0 }}>
            Each photographed as it arrived. Nothing here is restocked — the next
            piece will be different, because different hands will have made it.
          </p>
        </header>

        {/* the wall: 12 columns on lg, one on a phone with alternating offset */}
        <div
          className="pk-bento grid grid-cols-1 gap-y-[clamp(3rem,8vh,6rem)] lg:grid-cols-12 lg:gap-x-[clamp(1rem,2vw,2rem)]"
        >
          {PRODUCTS.map((p, i) => (
            <Frame key={p.slug} product={p} slot={HANG[i % HANG.length]} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function Frame({
  product: p,
  slot,
  index,
}: {
  product: Product;
  slot: (typeof HANG)[number];
  index: number;
}) {
  const reduced = useReducedMotion();
  const [hot, setHot] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const add = useCart((s) => s.add);
  const { setTarget, clear } = useCursor();
  const craft = CRAFTS[p.craft];
  const shots = getShots(p.slug);
  const hero = shots[0];
  const second = hoverImage(p.slug);
  const even = index % 2 === 0;

  return (
    <div
      ref={ref}
      className={`relative ${even ? "pr-[10vw] lg:pr-0" : "pl-[10vw] lg:pl-0"}`}
      style={{ gridColumn: undefined, marginTop: undefined }}
      /* lg placement via inline var so the phone stays a single column */
      data-slot={index}
    >
      <style>{`@media (min-width:1024px){[data-slot="${index}"]{grid-column:${slot.col};margin-top:${slot.drop};}}`}</style>

      <div
        onPointerEnter={() => {
          setHot(true);
          /* the ring locks onto the frame, not onto a card */
          const r = ref.current?.querySelector("[data-frame]")?.getBoundingClientRect();
          if (r) setTarget({ mode: "product", rect: { x: r.x, y: r.y, w: r.width, h: r.height } });
        }}
        onPointerLeave={() => {
          setHot(false);
          clear();
        }}
        className="group grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end"
      >
        <Link href={`/product/${p.slug}`} className="block" style={{ textDecoration: "none" }}>
          <div data-frame className="relative">
            <MaskedImage
              src={hero?.src ?? p.image}
              alt={hero ? altFor(p, hero) : p.name}
              ratio={slot.ratio}
              sizes="(max-width: 1024px) 90vw, 58vw"
              priority={index === 0}
              ground="#F3EFE8"
            />
            {second && (
              <motion.div
                className="absolute inset-0"
                initial={false}
                animate={{ opacity: reduced ? 0 : hot ? 1 : 0 }}
                transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
              >
                <Image src={second} alt="" aria-hidden fill sizes="58vw" quality={86} className="object-cover" />
              </motion.div>
            )}
          </div>
        </Link>

        {/* the label, beside the frame — essential metadata only */}
        <RevealIn delay={0.1} className="lg:w-[15rem] lg:pb-2">
          <p className="ty-mono" style={{ color: "#96605B", margin: 0 }}>
            {craft.label}
            {!craft.handmade && <span style={{ color: "#8A2F3B" }}> · printed</span>}
          </p>
          <Link href={`/product/${p.slug}`} style={{ textDecoration: "none" }}>
            <h3 className="ty-title mt-2" style={{ color: "#1A1A1A", margin: "0.5rem 0 0" }}>
              {p.name}
            </h3>
          </Link>
          <p className="ty-caption" style={{ color: "#6B645A", margin: "0.2rem 0 0" }}>
            {craft.region}
          </p>
          <p
            className="mt-4"
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 300,
              fontSize: "clamp(1.3rem,1.8vw,1.6rem)",
              letterSpacing: "-0.02em",
              color: "#1A1A1A",
              margin: "1rem 0 0",
            }}
          >
            {formatINR(p.pricePaise)}
          </p>
          <div className="mt-4 flex items-center gap-6">
            <Link
              href={`/product/${p.slug}`}
              aria-label={`View ${p.name}`}
              className="ty-mono"
              style={{ color: "#1A1A1A", textDecoration: "none", borderBottom: "1px solid #96605B", paddingBottom: 3 }}
            >
              View piece
            </Link>
            <button
              type="button"
              aria-label={`Add ${p.name} to bag`}
              onClick={() => add(p.slug)}
              className="ty-mono"
              style={{ color: "#6B645A", background: "none", border: "none", padding: 0, cursor: "pointer" }}
            >
              Add to bag
            </button>
          </div>
        </RevealIn>
      </div>
    </div>
  );
}
