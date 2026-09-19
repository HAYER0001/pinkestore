"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { PLACES, project, type Place } from "@/lib/places";
import { CRAFTS, PRODUCTS } from "@/lib/catalog";
import { useReveal } from "@/components/type/useReveal";

/**
 * FROM PLACE TO PIECE (items 34 + 35).
 *
 * A diagram, not a map — see the note in lib/places.ts for why there is no
 * outline of India here. Three places at their true relative coordinates, two
 * of them origins and one of them the shop, joined by thread.
 *
 * The thread runs FROM each origin TO Chandigarh, which is the entire story
 * this section exists to tell: none of this is made where it is sold, and the
 * shop does not pretend otherwise.
 *
 * Interaction is a real listbox of buttons, not hover-only SVG. Hovering a
 * 9px circle is a bad target on a trackpad and an impossible one on a phone,
 * so the places are also a list beneath, and both drive the same state.
 */

const W = 640;
const H = 470;
const DRAW = { duration: 1.1, ease: [0.32, 0.72, 0, 1] as const };

export function PlaceConstellation() {
  const reduced = useReducedMotion();
  const [active, setActive] = useState<string | null>(null);
  /* Not whileInView: a reader who lands past this section would never see the
     threads draw and they would sit at pathLength 0 forever — the diagram
     would render as four labels floating in space. See useReveal. */
  const [svgRef, shown] = useReveal<SVGSVGElement>(0.2);

  const shop = PLACES.find((p) => p.kind === "shop")!;
  const origins = PLACES.filter((p) => p.kind === "origin");
  const shopXY = project(shop, W, H);
  const placed = new Set(PLACES.flatMap((x) => x.crafts));
  const unplaced = (Object.keys(CRAFTS) as (keyof typeof CRAFTS)[]).filter((c) => !placed.has(c));
  const current = PLACES.find((p) => p.id === active) ?? null;

  const isLit = (p: Place) => active === null || active === p.id || p.kind === "shop";

  return (
    <div className="grid gap-[clamp(2rem,5vw,4rem)] lg:grid-cols-[1.35fr_1fr] lg:items-center">
      <figure style={{ margin: 0 }}>
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          className="w-full"
          role="img"
          aria-label="Where each craft comes from, and where the shop is"
          style={{ overflow: "visible" }}
        >
          {/* thread from every origin to the shop */}
          {origins.map((p, i) => {
            const a = project(p, W, H);
            /* a slack curve, the way a laid thread falls — not a straight
               line, which would read as a flight path */
            const mx = (a.x + shopXY.x) / 2;
            const my = (a.y + shopXY.y) / 2 + 26;
            return (
              <motion.path
                key={p.id}
                d={`M ${a.x} ${a.y} Q ${mx} ${my} ${shopXY.x} ${shopXY.y}`}
                fill="none"
                stroke="#C9A59F"
                strokeWidth={1}
                strokeLinecap="round"
                initial={reduced ? { pathLength: 1 } : { pathLength: 0 }}
                animate={{
                  pathLength: reduced || shown ? 1 : 0,
                  opacity: isLit(p) ? 0.85 : 0.18,
                }}
                transition={{ ...DRAW, delay: 0.15 + i * 0.16 }}
              />
            );
          })}

          {PLACES.map((p) => {
            const { x, y } = project(p, W, H);
            const on = active === p.id;
            const lit = isLit(p);
            const shopNode = p.kind === "shop";
            return (
              <g
                key={p.id}
                style={{ opacity: lit ? 1 : 0.3, transition: "opacity 240ms" }}
              >
                {shopNode ? (
                  /* the shop is a different mark entirely — it is not an origin */
                  <>
                    <circle cx={x} cy={y} r={9} fill="none" stroke="#1A1A1A" strokeWidth={1} />
                    <circle cx={x} cy={y} r={2.6} fill="#1A1A1A" />
                  </>
                ) : (
                  <motion.circle
                    cx={x}
                    cy={y}
                    r={on ? 7 : 4.5}
                    fill="#96605B"
                    animate={{ r: on ? 7 : 4.5 }}
                    transition={{ type: "spring", stiffness: 380, damping: 26 }}
                  />
                )}

                <text
                  x={x}
                  y={y - (shopNode ? 20 : 16)}
                  textAnchor="middle"
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: 11,
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    fill: shopNode ? "#1A1A1A" : "#96605B",
                  }}
                >
                  {p.label}
                </text>

                {shopNode && (
                  <text
                    x={x}
                    y={y + 26}
                    textAnchor="middle"
                    style={{ fontFamily: "var(--font-body)", fontSize: 10, letterSpacing: "0.1em", fill: "#6B645A" }}
                  >
                    the shop
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </figure>

      <div>
        <p className="ty-mono" style={{ color: "#96605B", margin: 0 }}>
          From place to piece
        </p>

        {/* Real buttons. A 9px circle is a poor target on a trackpad and an
            impossible one on a phone, so the diagram is not the only way in. */}
        <ul className="mt-6 space-y-1" style={{ margin: "1.5rem 0 0", padding: 0, listStyle: "none" }}>
          {origins.map((p) => {
            const on = active === p.id;
            return (
              <li key={p.id}>
                <button
                  type="button"
                  aria-pressed={on}
                  /* Click SELECTS, it does not toggle. Hover already sets the
                     active place, so a toggle meant that on any pointer device
                     the hover turned it on and the click immediately turned it
                     back off — the control appeared not to work at all. Touch
                     has no hover, so select-on-click is right there too. */
                  onClick={() => setActive(p.id)}
                  onPointerEnter={() => setActive(p.id)}
                  onFocus={() => setActive(p.id)}
                  className="w-full py-3 text-left"
                  style={{ background: "none", border: "none", cursor: "pointer", padding: "0.75rem 0" }}
                >
                  <span className="ty-title block" style={{ color: on ? "#96605B" : "#1A1A1A" }}>
                    {p.label}
                  </span>
                  <span className="ty-mono block" style={{ color: "#6B645A" }}>
                    {p.crafts.map((c) => CRAFTS[c].label).join(" · ")}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        <div className="mt-7 min-h-[7rem]">
          {current && current.kind === "origin" ? (
            <div>
              <p className="ty-read measure-read" style={{ color: "#4A443C", margin: 0 }}>
                {current.note}
              </p>
              <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2">
                {current.crafts.map((c) => {
                  const n = PRODUCTS.filter((x) => x.craft === c).length;
                  return (
                    <Link
                      key={c}
                      href={`/craft/${c}`}
                      className="ty-mono"
                      style={{ color: "#1A1A1A", borderBottom: "1px solid #96605B", paddingBottom: 3, textDecoration: "none" }}
                    >
                      {CRAFTS[c].label} ({n})
                    </Link>
                  );
                })}
              </div>
            </div>
          ) : (
            <>
              <p className="ty-read measure-read" style={{ color: "#6B645A", margin: 0 }}>
                Nothing in this shop is made in {shop.label}. Every piece travels —
                the thread runs from where it was made to where it is sold, and
                that distance is most of what you are paying for.
              </p>
              {/* Three crafts are on the diagram and four exist. The printed one
                  is missing because we do not know where it was printed, and
                  that absence is itself the honest answer — a place invented
                  for it would be the only unsourced claim on this page. */}
              {unplaced.length > 0 && (
                <p className="ty-caption measure-read mt-5" style={{ color: "#6B645A" }}>
                  {unplaced.map((c) => CRAFTS[c].label).join(", ")} is not on the
                  diagram: it is printed rather than made in a named tradition,
                  and we do not know which press it came off. We would rather
                  leave it off than put a pin somewhere plausible.
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
