"use client";

import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useReducedMotion,
} from "motion/react";
import * as G from "@/components/ornament/mithila-geometry";

/**
 * THE ART OF MADHUBANI — scroll-linked.
 *
 *  · a huge Mithila motif rotates behind everything at 10% opacity, driven by
 *    scroll position, never by a timer
 *  · gold wipes across the copy left-to-right as you scroll, so the reading
 *    pace is the scroll pace
 *
 * The wipe is a clip-path over a duplicate of the same text. The base copy is
 * always fully legible on its own, so if the effect never runs the paragraph
 * still reads — the animation adds emphasis, it never carries meaning.
 */

export function CraftStory() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
    trackContentSize: true,
  });

  const rotate = useTransform(scrollYProgress, [0, 1], [-12, 26]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1.05, 1.16, 1.05]);

  /* the wipe runs over the middle of the section's travel */
  const wipeRaw = useTransform(scrollYProgress, [0.26, 0.72], [0, 100]);
  const wipe = useSpring(wipeRaw, { stiffness: 120, damping: 26, mass: 0.5 });
  const clip = useTransform(wipe, (v) => `inset(0 ${100 - v}% 0 0)`);

  const COPY =
    "In Mithila the painting is not signed. It is made on a wall, for a wedding, by women who learned it from their mothers, and it is finished only when no empty space is left. Every line goes down doubled and freehand — there is no pencil underneath, and no second attempt.";

  return (
    <section
      ref={ref}
      className="relative overflow-hidden"
      style={{ background: "#12100E" }}
      aria-labelledby="craft-heading"
    >
      {/* the slowly turning motif */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2"
        style={{
          rotate: reduced ? 0 : rotate,
          scale: reduced ? 1.1 : scale,
          x: "-50%",
          y: "-50%",
          opacity: 0.1,
        }}
      >
        <svg width="min(120vw,1400px)" height="min(120vw,1400px)" viewBox="0 0 480 620">
          <g fill="none" stroke="#E8BC57" strokeWidth={2.2}>
            <path d={G.CANOPY} />
            <path d={G.TRUNK} />
            <path d={G.ARCH_OUTER} />
            <path d={G.ARCH_INNER} />
            {G.BRANCHES.map((d, i) => <path key={i} d={d} />)}
            {G.CANOPY_BANDS.map((d, i) => <path key={`c${i}`} d={d} />)}
            <path d={G.SUN_RING} />
            {G.SUN_RAYS.map((d, i) => <path key={`r${i}`} d={d} />)}
          </g>
        </svg>
      </motion.div>

      <div className="relative mx-auto max-w-4xl px-4 py-28 md:px-8 md:py-40">
        <p className="font-mono" style={{ color: "#E8BC57", fontSize: "var(--fs-sm)", letterSpacing: "0.2em" }}>
          [ शैली ०१ · MADHUBANI ]
        </p>

        <h2
          id="craft-heading"
          className="font-display mt-5"
          style={{
            color: "#F2E9D8",
            fontSize: "clamp(2rem, 4.6vw, 3.4rem)",
            lineHeight: 1.08,
            letterSpacing: "-0.03em",
          }}
        >
          The art of Madhubani
        </h2>

        {/* base copy — always readable */}
        <div className="relative mt-8">
          <p
            className="measure"
            style={{ color: "#8A8272", fontSize: "clamp(1.05rem,1.9vw,1.45rem)", lineHeight: 1.62 }}
          >
            {COPY}
          </p>

          {/* gold wipes over it, clipped by scroll */}
          {!reduced && (
            <motion.p
              aria-hidden
              className="measure absolute inset-0"
              style={{
                color: "#E8BC57",
                fontSize: "clamp(1.05rem,1.9vw,1.45rem)",
                lineHeight: 1.62,
                clipPath: clip,
              }}
            >
              {COPY}
            </motion.p>
          )}
        </div>
      </div>
    </section>
  );
}
