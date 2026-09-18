"use client";

import { useEffect, useRef } from "react";
import { ScrollTrigger } from "@/utils/animations/gsap";
import { canvasStore } from "@/utils/animations/canvas-store";
import { PRODUCTS, getProduct } from "@/lib/catalog";
import { ProductCard } from "./ProductCard";

/**
 * THE SHOPPABLE GRID.
 *
 * Asymmetric on purpose. A uniform grid of equal tiles is a catalogue; unequal
 * weights are what make a page read as edited. Size carries the merchandising
 * argument before any copy does — which is also why the printed piece gets the
 * smallest cell.
 *
 *  cols 1-7,  rows 1-2   Jamawar Indigo    hero, double height
 *  cols 8-12, row  1     Baraat Shawl      the narrative piece
 *  cols 8-12, row  2     Sozni Ivory       light, tight
 *  cols 1-4,  row  3     Kairi Noir        smallest: printed, not handworked
 *  cols 5-12, row  3     Chikankari Blush  wide closer
 */

const AREAS: Record<string, string> = {
  "jamawar-indigo-kani-shawl": "1 / 1 / 3 / 8",
  "madhubani-baraat-shawl": "1 / 8 / 2 / 13",
  "sozni-ivory-pashmina": "2 / 8 / 3 / 13",
  "kairi-noir-paisley-shawl": "3 / 1 / 4 / 5",
  "chikankari-blush-suit-set": "3 / 5 / 4 / 13",
};

const ORDER = [
  "jamawar-indigo-kani-shawl",
  "madhubani-baraat-shawl",
  "sozni-ivory-pashmina",
  "kairi-noir-paisley-shawl",
  "chikankari-blush-suit-set",
];

export function ProductGallery() {
  const section = useRef<HTMLElement>(null);

  /* ---- the WebGL handoff ----
     When the shop reaches the top of the viewport the canvas is dead weight.
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
      /* leave it running for whatever mounts next */
      canvasStore.setActive(true);
    };
  }, []);

  const ordered = ORDER.map((slug) => getProduct(slug)).filter(Boolean);
  const rest = PRODUCTS.filter((p) => !ORDER.includes(p.slug));

  return (
    <section
      ref={section}
      id="pieces"
      className="relative scroll-mt-24"
      style={{ background: "#FAF8F5" }}
    >
      <div className="mx-auto max-w-[1500px] px-[clamp(1rem,3vw,3rem)] py-[clamp(4rem,10vh,9rem)]">
        <header className="mb-[clamp(2.5rem,6vh,5rem)] flex flex-wrap items-end justify-between gap-6">
          <div>
            <p
              className="t-micro-ed"
              style={{ color: "#8A6812", letterSpacing: "var(--tracking-luxe-widest)" }}
            >
              The Collection
            </p>
            <h2
              className="mt-4"
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 300,
                fontSize: "clamp(2.2rem, 5vw, 4.5rem)",
                lineHeight: 0.96,
                letterSpacing: "-0.035em",
                color: "#1A1A1A",
              }}
            >
              Five pieces, five hands
            </h2>
          </div>

          <p
            style={{
              fontFamily: "var(--font-body)",
              fontWeight: 300,
              fontSize: "0.9375rem",
              lineHeight: 1.7,
              color: "#4A443C",
              maxWidth: "34ch",
            }}
          >
            Each photographed as it arrived. Nothing here is restocked — the next
            piece will be different, because different hands will have made it.
          </p>
        </header>

        {/* 12-column bento. Rows are viewport-relative so the hero stays
            genuinely large on a laptop without a fixed pixel height. */}
        <div
          className="pk-bento grid gap-[clamp(0.6rem,1vw,1.1rem)]"
          style={{
            gridTemplateColumns: "repeat(12, minmax(0, 1fr))",
            gridAutoRows: "clamp(180px, 26vh, 300px)",
          }}
        >
          {ordered.map((p, i) => (
            <ProductCard
              key={p!.slug}
              product={p!}
              area={AREAS[p!.slug]}
              priority={i === 0}
            />
          ))}
          {rest.map((p) => (
            <ProductCard key={p.slug} product={p} area="auto / span 4" />
          ))}
        </div>
      </div>
    </section>
  );
}
