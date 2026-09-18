"use client";

import { motion, useReducedMotion } from "motion/react";
import { SHAILIS } from "./traditions";
import { ShailiPattern } from "./shaili-patterns";

/**
 * THE SHATTERED PLANE.
 *
 * One viewport, broken into shards. Each shard is a real Indian painting
 * school rendered in its own true palette and its own drawing grammar —
 * Madhubani's doubled line, Warli's three shapes, Gond's dash-and-dot,
 * Phulkari's counted darn stitch, Pattachitra's border-first logic.
 *
 * Each school contributes one thing to the visual language, and the shard
 * says which: LINE, FORM, DOT, STITCH, BORDER.
 *
 * The cracks are real black gaps, drawn as an overlay so they stay crisp at
 * any size rather than relying on antialiased polygon seams.
 */

type Shard = {
  key: string;
  clip: string;
  word: string;
  wordLocal: string;
  /** how this shard sets its big word */
  face: string;
  /** centroid of the polygon — content must sit INSIDE the shard, not at the
      centre of the viewport, or the clip eats it. */
  at: { x: string; y: string };
  w: string;
};

const SHARDS: Shard[] = [
  {
    key: "madhubani",
    clip: "polygon(0% 0%, 44% 0%, 38% 52%, 0% 46%)",
    word: "LINE",
    wordLocal: "रेखा",
    face: "font-display",
    at: { x: "19%", y: "23%" },
    w: "min(30ch, 26vw)",
  },
  {
    key: "warli",
    clip: "polygon(44% 0%, 100% 0%, 100% 36%, 38% 52%)",
    word: "FORM",
    wordLocal: "आकार",
    face: "font-sans font-semibold tracking-[-0.04em]",
    at: { x: "71%", y: "19%" },
    w: "min(30ch, 28vw)",
  },
  {
    key: "gond",
    clip: "polygon(100% 36%, 100% 100%, 64% 100%, 38% 52%)",
    word: "DOT",
    wordLocal: "बिंदु",
    face: "font-mono font-bold tracking-[-0.02em]",
    at: { x: "78%", y: "72%" },
    w: "min(28ch, 24vw)",
  },
  {
    key: "phulkari",
    clip: "polygon(0% 46%, 38% 52%, 64% 100%, 26% 100%)",
    word: "STITCH",
    wordLocal: "ਟਾਂਕਾ",
    face: "font-display italic",
    at: { x: "33%", y: "76%" },
    w: "min(30ch, 26vw)",
  },
  {
    key: "pattachitra",
    clip: "polygon(0% 46%, 26% 100%, 0% 100%)",
    word: "BORDER",
    wordLocal: "କିନାରା",
    face: "font-sans font-medium",
    at: { x: "9%", y: "83%" },
    w: "min(20ch, 16vw)",
  },
];

/* Devanagari numerals for the chips — a Latin "01" on a Mithila shard is the
   exact incoherence the competitive scan found everywhere. */
const DEV = ["०१", "०२", "०३", "०४", "०५", "०६"];

export function ShailiHero() {
  const reduced = useReducedMotion();

  return (
    <section
      className="relative isolate w-full overflow-hidden bg-[#080706]"
      style={{ height: "100svh" }}
      aria-label="Five Indian painting traditions"
    >
      {SHARDS.map((shard, i) => {
        const s = SHAILIS.find((x) => x.id === shard.key)!;
        const big = shard.key === "pattachitra";
        return (
          <motion.div
            key={shard.key}
            className="absolute inset-0"
            style={{ clipPath: shard.clip, background: s.ground }}
            /* The shard is ALWAYS painted. Only the settle is animated, and it
               animates a transform — never opacity. A hero that depends on an
               animation completing is a hero that can ship blank. */
            initial={reduced ? false : { scale: 1.035 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.9, delay: i * 0.08, ease: [0.32, 0.72, 0, 1] }}
          >
            <ShailiPattern
              id={s.id}
              ink={s.ink}
              accent={s.accent}
              opacity={s.id === "warli" ? 0.5 : s.id === "gond" ? 0.65 : 0.4}
            />

            <div
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: shard.at.x, top: shard.at.y, width: shard.w }}
            >
              {/* THE PLATE. Text never sits on pattern — the reference puts
                  every label on a solid box or chip, and that is what makes it
                  readable at 10px over a grid. Measured: body copy on raw
                  Phulkari ground was 3.52:1 and on Warli 4.07:1. Both failed.
                  On the plate both are >12:1. */}
              <div
                className="hard px-4 py-3.5"
                style={{
                  background: s.plate,
                  color: s.plateInk,
                  ["--hard-ink" as string]: s.plateInk,
                }}
              >
                <span
                  className="chip"
                  style={{ background: s.plateInk, color: s.plate, boxShadow: "none" }}
                >
                  शैली {DEV[i]} · {s.name}
                </span>

                {!big && (
                  <>
                    <p
                      className={`mt-3 leading-[0.88] ${shard.face}`}
                      style={{ fontSize: "clamp(1.75rem, 4.4vw, 3.6rem)" }}
                    >
                      {shard.word}
                    </p>
                    <p
                      lang={s.lang}
                      className="mt-1 leading-tight"
                      style={{
                        fontSize: "clamp(0.95rem,1.5vw,1.25rem)",
                        color: s.accentOnPlate,
                      }}
                    >
                      {shard.wordLocal}
                    </p>
                    <p
                      className="mt-2.5 border-t pt-2.5"
                      style={{
                        fontSize: "var(--fs-md)",
                        lineHeight: 1.45,
                        borderColor: "color-mix(in srgb, currentColor 22%, transparent)",
                      }}
                    >
                      {s.rule}
                    </p>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        );
      })}

      {/* the cracks */}
      <svg
        aria-hidden
        className="pointer-events-none absolute inset-0 h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        {[
          "M 44 0 L 38 52",
          "M 0 46 L 38 52",
          "M 38 52 L 100 36",
          "M 38 52 L 64 100",
          "M 0 46 L 26 100",
        ].map((d, i) => (
          <path
            key={i}
            d={d}
            stroke="#080706"
            strokeWidth={0.7}
            fill="none"
            vectorEffect="non-scaling-stroke"
            style={{ strokeWidth: 3 }}
          />
        ))}
      </svg>

      {/* the shop, sitting in the middle of all of it */}
      <div className="pointer-events-none absolute inset-x-0 bottom-[3%] z-10 flex justify-center">
        <div
          className="pointer-events-auto px-4 py-2 font-mono text-[10px] tracking-[0.18em] md:text-[11px]"
          style={{ background: "#080706", color: "#EDE4D3" }}
        >
          THE PINKESTORE · CHANDIGARH · SCROLL ↓
        </div>
      </div>
    </section>
  );
}
