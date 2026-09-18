"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { scrubStore } from "@/utils/animations/scrub-store";
import { getProduct, CRAFTS, formatINR } from "@/lib/catalog";
import { useCart } from "@/lib/cart";
import { Magnet } from "./Magnet";

/**
 * THE SCRUB TRACK — and the products that play ON it.
 *
 * The five clips ARE the five pieces. So the product does not wait in a grid
 * below the film: as the footage scrubs into each clip, that piece's card
 * rises with it and can be bought right there. The film is the merchandising.
 *
 * Each beat owns a window of scroll progress. Opacity and Y are derived from
 * distance to the beat centre, so a card fades up as its clip arrives and
 * falls away as the next one takes over — driven by scroll position, never by
 * a timer, so scrubbing backwards plays it in reverse correctly.
 */

const BEATS = [
  { at: 0.09, slug: "madhubani-baraat-shawl", k: "०१ · मिथिला", line: "Painted, not printed", sub: "No pencil underneath. No second attempt." },
  { at: 0.30, slug: "sozni-ivory-pashmina", k: "०२ · कश्मीर", line: "Months, not minutes", sub: "One sozni shawl can hold a year of someone's hands." },
  { at: 0.52, slug: "jamawar-indigo-kani-shawl", k: "०३ · जामावार", line: "One pass at a time", sub: "Small wooden spools, a coded talim, no shortcut." },
  { at: 0.73, slug: "chikankari-blush-suit-set", k: "०४ · लखनऊ", line: "White on blush", sub: "Shadow-work, worked from the reverse." },
  { at: 0.92, slug: "kairi-noir-paisley-shawl", k: "०५", line: "Loud, worn quietly", sub: "A printed field of paisley on black." },
];

const WINDOW = 0.13;

export function ScrubTrack() {
  const [p, setP] = useState(0);
  const add = useCart((s) => s.add);

  useEffect(() => {
    let raf = 0;
    let last = -1;
    const loop = () => {
      const v = Math.round(scrubStore.getProgress() * 200) / 200;
      if (v !== last) {
        last = v;
        setP(v);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div id="scrub-track" style={{ position: "relative", height: "520vh" }}>
      <div
        style={{
          position: "sticky",
          top: 0,
          height: "100svh",
          display: "flex",
          alignItems: "flex-end",
          padding: "0 clamp(1rem,5vw,5rem) clamp(2.5rem,8vh,6rem)",
        }}
      >
        <div style={{ position: "relative", width: "100%" }}>
          {BEATS.map((b) => {
            const d = Math.abs(p - b.at);
            const on = 1 - Math.min(d / WINDOW, 1);
            const eased = on * on * (3 - 2 * on);
            const product = getProduct(b.slug);
            if (!product) return null;
            const craft = CRAFTS[product.craft];
            /* below ~2% the card is invisible; stop it eating pointer events */
            const live = eased > 0.02;

            return (
              <div
                key={b.slug}
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  opacity: eased,
                  transform: `translateY(${(1 - eased) * 26}px)`,
                  pointerEvents: live ? "auto" : "none",
                  visibility: live ? "visible" : "hidden",
                  willChange: "opacity, transform",
                }}
              >
                <p
                  className="t-micro-ed"
                  style={{ color: "#E8BC57", letterSpacing: "var(--tracking-luxe-wide)" }}
                >
                  {b.k}
                </p>

                <h2
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 300,
                    fontSize: "clamp(2.2rem, 6.5vw, 5.5rem)",
                    lineHeight: 0.95,
                    letterSpacing: "-0.035em",
                    color: "#F7F3EC",
                    margin: "0.35rem 0 0",
                    textShadow: "0 2px 44px rgba(0,0,0,0.8)",
                  }}
                >
                  {b.line}
                </h2>

                <p
                  style={{
                    fontFamily: "var(--font-display)",
                    fontStyle: "italic",
                    fontSize: "clamp(1rem,1.7vw,1.4rem)",
                    color: "#F7F3EC",
                    opacity: 0.8,
                    maxWidth: "36ch",
                    marginTop: "0.7rem",
                    textShadow: "0 2px 30px rgba(0,0,0,0.85)",
                  }}
                >
                  {b.sub}
                </p>

                {/* the piece, buyable on the film itself */}
                <div className="mt-7 flex flex-wrap items-center gap-x-8 gap-y-4">
                  <Link
                    href={`/product/${product.slug}`}
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "clamp(1.1rem,2vw,1.6rem)",
                      color: "#F7F3EC",
                      textDecoration: "none",
                      borderBottom: "1px solid rgba(247,243,236,0.35)",
                      paddingBottom: "0.2rem",
                    }}
                  >
                    {product.name}
                  </Link>

                  <span
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "0.85rem",
                      letterSpacing: "0.06em",
                      color: "#F7F3EC",
                      opacity: 0.8,
                    }}
                  >
                    {formatINR(product.pricePaise)}
                  </span>

                  <span
                    className="t-micro-ed"
                    style={{ color: "#E8BC57", letterSpacing: "var(--tracking-luxe)" }}
                  >
                    {craft.region}
                  </span>

                  <Magnet range={110}>
                    <button
                      /* Five of these exist, one per beat. Without a distinct
                         name a screen-reader user hears "Add to bag" five
                         times over with no way to tell which shawl is which. */
                      aria-label={`Add ${product.name} to bag`}
                      type="button"
                      onClick={() => add(product.slug)}
                      style={{
                        fontFamily: "var(--font-body)",
                        fontSize: "0.6875rem",
                        letterSpacing: "var(--tracking-luxe)",
                        textTransform: "uppercase",
                        color: "#1A1A1A",
                        background: "#F7F3EC",
                        border: "1px solid #F7F3EC",
                        borderRadius: 0,
                        padding: "0.85rem 1.5rem",
                        cursor: "pointer",
                      }}
                    >
                      Add to bag
                    </button>
                  </Magnet>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div
        aria-hidden
        style={{
          position: "sticky",
          top: "calc(100svh - 2px)",
          height: 2,
          background: "rgba(232,188,87,0.16)",
        }}
      >
        <div style={{ height: "100%", width: `${p * 100}%`, background: "#E8BC57" }} />
      </div>
    </div>
  );
}
