"use client";

import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useReducedMotion,
  type MotionValue,
} from "motion/react";
import * as G from "./mithila-geometry";
import { Dust } from "./dust";
import { Lattice } from "./lattice";

/**
 * THE STORY.
 *
 * One scroll position drives everything. Every stage is a useTransform off the
 * SAME scrollYProgress, so nothing fires independently — the line finishing is
 * literally what starts the colour, and the colour finishing is what starts the
 * fill. Scrub back and the whole thing runs backwards, in order.
 *
 * That is why this is not a stack of whileInView reveals: those are separate
 * timers that happen to be near each other. This is one timeline.
 *
 *   0.00 - 0.14   the frame is ruled
 *   0.12 - 0.38   the line arrives            (kachni)
 *   0.36 - 0.52   the colour is poured        (bharni)
 *   0.50 - 0.62   the space is closed         (horror vacui)
 *   0.62 - 0.92   the procession walks        (register, horizontal)
 */

const CHAPTERS = [
  { at: 0.02, kicker: "One", title: "First, the frame", body: "Nothing is drawn freehand into empty space. A Mithila painter rules the border before anything else — the field has to know where it ends." },
  { at: 0.16, kicker: "Two", title: "Then the line", body: "No sketch, no pencil. The contour goes down doubled — two rails with a channel between them — and it is right the first time or it is not right." },
  { at: 0.38, kicker: "Three", title: "Then the colour", body: "Flat, unmodulated, one value per shape. No shading, no gradient. The richness comes from colours sitting next to each other, never from rendering." },
  { at: 0.52, kicker: "Four", title: "Then every gap is closed", body: "Hatch, dot, chevron. Empty space is not restful in this tradition — it is unfinished. The filling is the last and longest part." },
  { at: 0.66, kicker: "Five", title: "And the procession walks", body: "On the shawl, a wedding party walks the lower border. We kept the register and changed the procession — dhol, dancers, wheat." },
];

function useChapter(p: MotionValue<number>, at: number, next?: number) {
  const end = next ?? 1.2;
  return {
    opacity: useTransform(p, [at - 0.05, at + 0.02, end - 0.08, end - 0.02], [0, 1, 1, 0]),
    y: useTransform(p, [at - 0.05, at + 0.02], [14, 0]),
  };
}

function Ink({ d, len, w = 3.4 }: { d: string; len: MotionValue<number>; w?: number }) {
  return (
    <>
      <motion.path d={d} className="pk-ink" strokeWidth={w} style={{ pathLength: len }} />
      <motion.path d={d} className="pk-ground" strokeWidth={w * 0.38} style={{ pathLength: len }} />
    </>
  );
}

export function StoryScroll() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
    trackContentSize: true,
  });

  /* One spring on the master value — every stage inherits its smoothing,
     which is what makes the chain feel continuous rather than stepped. */
  const p = useSpring(scrollYProgress, {
    stiffness: 180,
    damping: 38,
    mass: 0.5,
    restDelta: 0.0005,
  });

  const frame = useTransform(p, [0.0, 0.14], [0, 1]);
  const line = useTransform(p, [0.12, 0.38], [0, 1]);
  const colour = useTransform(p, [0.36, 0.52], [0, 1]);
  const fill = useTransform(p, [0.5, 0.62], [0, 0.55]);
  const dots = useTransform(p, [0.54, 0.64], [0, 0.55]);
  const regX = useTransform(p, [0.62, 0.95], ["30%", "-55%"]);
  const regOpacity = useTransform(p, [0.6, 0.68, 0.98, 1], [0, 1, 1, 1]);
  const artScale = useTransform(p, [0.6, 0.8], [1, 0.82]);
  const artY = useTransform(p, [0.6, 0.8], [0, -70]);

  /* Reduced motion: no scroll choreography. Show the finished painting and
     let the chapters read as ordinary prose. */
  if (reduced) {
    return (
      <section className="ground-indigo relative overflow-hidden">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-20 md:grid-cols-2 md:px-8">
          <FinishedArt />
          <ol className="space-y-8">
            {CHAPTERS.map((c) => (
              <li key={c.kicker}>
                <p className="t-micro" style={{ color: "var(--pk-ivory)", opacity: 0.6 }}>{c.kicker}</p>
                <h3 className="font-display t-heading mt-1" style={{ color: "var(--pk-ivory)" }}>{c.title}</h3>
                <p className="measure t-body mt-2" style={{ color: "var(--pk-ivory)", opacity: 0.75 }}>{c.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
    );
  }

  return (
    <section ref={ref} className="ground-indigo relative" style={{ height: "560svh" }}>
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <Lattice />
        <Dust density={20} />

        <div className="relative mx-auto flex h-full max-w-6xl items-center gap-8 px-4 md:px-8">
          {/* --- the words --- */}
          <div className="relative z-10 w-full md:w-[46%]">
            {CHAPTERS.map((c, i) => (
              <Chapter key={c.kicker} p={p} c={c} next={CHAPTERS[i + 1]?.at} />
            ))}
          </div>

          {/* --- the painting --- */}
          <motion.div
            className="pointer-events-none absolute right-0 top-1/2 hidden -translate-y-1/2 md:block"
            style={{ scale: artScale, y: artY }}
          >
            <svg viewBox="0 0 480 620" className="h-[74svh] w-auto" role="img" aria-label="A Mithila tree of life being drawn, coloured and filled">
              <defs>
                <pattern id="sp-hatch" patternUnits="userSpaceOnUse" width="9" height="9">
                  <path d="M 0 9 L 9 0" className="pk-ink" strokeWidth={0.9} opacity={0.5} />
                </pattern>
                <pattern id="sp-dots" patternUnits="userSpaceOnUse" width="12" height="12">
                  <circle cx="6" cy="6" r="1.5" className="pk-fill-ink" opacity={0.45} />
                </pattern>
                <clipPath id="sp-arch"><path d={`${G.ARCH_INNER} L 412 592 L 68 592 Z`} /></clipPath>
                <clipPath id="sp-canopy"><path d={G.CANOPY} /></clipPath>
              </defs>

              <g clipPath="url(#sp-arch)">
                <motion.rect x="68" y="68" width="344" height="524" fill="url(#sp-hatch)" style={{ opacity: fill }} />
              </g>

              <motion.path d={G.CANOPY} fill="var(--pigment-teal)" style={{ opacity: colour }} />
              <motion.circle cx={G.SUN[0]} cy={G.SUN[1]} r={G.SUN[2]} fill="var(--pigment-haldi)" style={{ opacity: colour }} />
              {[["translate(150 548)"], ["translate(263 548)"]].map(([tf], i) => (
                <motion.path key={`ff-${i}`} d={G.FISH} transform={tf} fill="var(--pigment-madder)" style={{ opacity: colour }} />
              ))}
              {[["translate(112 454)"], ["translate(368 454) scale(-1 1)"]].map(([tf], i) => (
                <motion.path key={`bf-${i}`} d={G.BIRD_BODY} transform={tf} fill="var(--pigment-aubergine)" style={{ opacity: colour }} />
              ))}
              {G.LEAF_AT.map(([x, y, r], i) => (
                <motion.path key={`lf-${i}`} d={G.LEAF} transform={`translate(${x} ${y}) rotate(${r})`} fill="var(--pigment-sindoor)" style={{ opacity: colour }} />
              ))}
              <g clipPath="url(#sp-canopy)">
                <motion.rect x="106" y="188" width="268" height="200" fill="url(#sp-dots)" style={{ opacity: dots }} />
              </g>

              {/* the frame is ruled first */}
              <Ink d={G.ARCH_OUTER} len={frame} />
              <Ink d={G.ARCH_INNER} len={frame} />

              {/* then the line arrives */}
              <Ink d={G.TRUNK} len={line} />
              {G.ROOTS.map((d, i) => <Ink key={`r${i}`} d={d} len={line} />)}
              {G.BRANCHES.map((d, i) => <Ink key={`b${i}`} d={d} len={line} />)}
              <Ink d={G.CANOPY} len={line} />
              {G.CANOPY_BANDS.map((d, i) => <Ink key={`cb${i}`} d={d} len={line} w={2.8} />)}
              {G.TRUNK_TICKS.map((d, i) => <Ink key={`tt${i}`} d={d} len={line} w={2.6} />)}
              {G.LEAF_AT.map(([x, y, r], i) => (
                <g key={`lk${i}`} transform={`translate(${x} ${y}) rotate(${r})`}><Ink d={G.LEAF} len={line} w={2.8} /></g>
              ))}
              <Ink d={G.SUN_RING} len={line} />
              {G.SUN_RAYS.map((d, i) => <Ink key={`ray${i}`} d={d} len={line} w={2.6} />)}
              {[["translate(112 454)"], ["translate(368 454) scale(-1 1)"]].map(([tf], i) => (
                <g key={`bd${i}`} transform={tf}>
                  <Ink d={G.BIRD_BODY} len={line} />
                  <Ink d={G.BIRD_HEAD} len={line} w={2.8} />
                  <Ink d={G.BIRD_BEAK} len={line} w={2.4} />
                  <Ink d={G.BIRD_TAIL} len={line} w={2.8} />
                  <Ink d={G.BIRD_CREST} len={line} w={2.2} />
                </g>
              ))}
              {[["translate(150 548)"], ["translate(263 548)"]].map(([tf], i) => (
                <g key={`fs${i}`} transform={tf}>
                  <Ink d={G.FISH} len={line} />
                  <Ink d={G.FISH_TAIL} len={line} w={2.6} />
                </g>
              ))}
            </svg>
          </motion.div>

          {/* --- and the procession walks out of it --- */}
          <motion.div className="pointer-events-none absolute inset-x-0 bottom-[8svh] overflow-hidden" style={{ opacity: regOpacity }} aria-hidden>
            <motion.div style={{ x: regX }} className="will-change-transform">
              <RegisterStrip />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function Chapter({ p, c, next }: { p: MotionValue<number>; c: (typeof CHAPTERS)[number]; next?: number }) {
  const { opacity, y } = useChapter(p, c.at, next);
  return (
    <motion.div style={{ opacity, y }} className="absolute inset-x-0 top-1/2 -translate-y-1/2">
      <p className="t-micro" style={{ color: "var(--surface-gold)" }}>{c.kicker}</p>
      <h3 className="t-ornament t-display mt-2" style={{ color: "var(--pk-ivory)" }}>{c.title}</h3>
      <p className="measure t-body mt-4" style={{ color: "var(--pk-ivory)", opacity: 0.78 }}>{c.body}</p>
    </motion.div>
  );
}

function FinishedArt() {
  return (
    <svg viewBox="0 0 480 620" className="h-[60svh] w-auto" aria-label="Mithila tree of life" role="img">
      <path d={G.CANOPY} fill="var(--pigment-teal)" />
      <circle cx={G.SUN[0]} cy={G.SUN[1]} r={G.SUN[2]} fill="var(--pigment-haldi)" />
      <path d={G.ARCH_OUTER} className="pk-ink" strokeWidth={3.4} fill="none" />
      <path d={G.TRUNK} className="pk-ink" strokeWidth={3.4} fill="none" />
      <path d={G.CANOPY} className="pk-ink" strokeWidth={3.4} fill="none" />
    </svg>
  );
}

/** The register, as a plain strip — figures live in bhangra-register.tsx. */
function RegisterStrip() {
  return (
    <svg viewBox="0 0 1600 120" className="h-[120px] w-[1600px]">
      <path d="M 0 16 L 1600 16" className="pk-ink" strokeWidth={2.6} fill="none" />
      <path d="M 0 104 L 1600 104" className="pk-ink" strokeWidth={2.6} fill="none" />
      <g transform="translate(0 82)">
        {Array.from({ length: 12 }, (_, i) => (
          <g key={i} transform={`translate(${60 + i * 130} 0)${i % 2 ? " scale(-1 1)" : ""}`}>
            <path d="M -15 -38 C -25 -45 -32 -56 -29 -65 C -25 -68 -19 -62 -17 -55 C -15 -47 -13 -42 -12 -38 Z" className="pk-ink" strokeWidth={3} fill="none" />
            <path d="M 15 -38 C 25 -45 32 -56 29 -65 C 25 -68 19 -62 17 -55 C 15 -47 13 -42 12 -38 Z" className="pk-ink" strokeWidth={3} fill="none" />
            <path d="M -17 -40 C -15 -26 -17 -12 -20 -4 L 20 -4 C 17 -12 15 -26 17 -40 C 10 -47 -10 -47 -17 -40 Z" className="pk-ink" strokeWidth={3} fill="none" />
            <path d="M -13 -4 L -15 20 L -6 20 L -4 -4 Z" className="pk-ink" strokeWidth={3} fill="none" />
            <path d="M 13 -4 L 15 20 L 6 20 L 4 -4 Z" className="pk-ink" strokeWidth={3} fill="none" />
            <path d="M -10 -56 a 10 11 0 1 0 20 0 a 10 11 0 1 0 -20 0" className="pk-ink" strokeWidth={3} fill="none" />
            <path d="M -13 -62 C -11 -75 11 -75 13 -62 C 6 -67 -6 -67 -13 -62 Z" className="pk-ink" strokeWidth={3} fill="none" />
            <path d="M -5 -57 C -2 -61 4 -61 7 -57 C 4 -53 -2 -53 -5 -57 Z" className="pk-ink" strokeWidth={2.2} fill="none" />
          </g>
        ))}
      </g>
    </svg>
  );
}
