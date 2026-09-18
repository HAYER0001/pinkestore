"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useSpring, useReducedMotion } from "motion/react";

/**
 * THE FUSION CENTREPIECE.
 *
 * On the hero shawl, a wedding baraat walks the lower border in a narrative
 * register. Here that same register keeps walking — but the procession is
 * Punjabi: dhol, bhangra dancers, wheat, jutti. One drawing hand (Mithila
 * kachni), two vocabularies. Mithila painters have drawn trains, bicycles and
 * election scenes in this grammar for fifty years; putting a Punjabi
 * procession in a register band is a move the tradition itself makes.
 *
 * Read left to right, the way a register is read.
 *
 * Motion: sticky viewport + percent-translated track. No pixel measurement,
 * so it is resize-, zoom- and font-load-proof. trackContentSize handles late
 * image decode — the thing ScrollTrigger used to be needed for.
 */

const EASE = [0.32, 0.72, 0, 1] as const;

/* --- figures, drawn at a common baseline of y=0, ~90 units tall --- */

/* Figures have VOLUME. Mithila people are closed forms with patterned
   garments and one large fish-shaped eye — never single-stroke limbs. */

const DANCER = {
  /* raised arms, tapered */
  armL: "M -15 -38 C -25 -45 -32 -56 -29 -65 C -25 -68 -19 -62 -17 -55 C -15 -47 -13 -42 -12 -38 Z",
  armR: "M 15 -38 C 25 -45 32 -56 29 -65 C 25 -68 19 -62 17 -55 C 15 -47 13 -42 12 -38 Z",
  /* kurta — bell silhouette */
  body: "M -17 -40 C -15 -26 -17 -12 -20 -4 L 20 -4 C 17 -12 15 -26 17 -40 C 10 -47 -10 -47 -17 -40 Z",
  legL: "M -13 -4 L -15 20 L -6 20 L -4 -4 Z",
  legR: "M 13 -4 L 15 20 L 6 20 L 4 -4 Z",
  head: "M -10 -56 a 10 11 0 1 0 20 0 a 10 11 0 1 0 -20 0",
  turban: "M -13 -62 C -11 -75 11 -75 13 -62 C 6 -67 -6 -67 -13 -62 Z",
  /* the fish eye */
  eye: "M -5 -57 C -2 -61 4 -61 7 -57 C 4 -53 -2 -53 -5 -57 Z",
  sash: "M -15 -30 L 16 -18",
};

const DHOLI = {
  armL: "M -16 -40 C -26 -38 -31 -33 -30 -28 C -26 -26 -21 -30 -18 -34 Z",
  armR: "M 16 -40 C 26 -38 31 -33 30 -28 C 26 -26 21 -30 18 -34 Z",
  body: "M -16 -42 C -14 -28 -16 -14 -19 -4 L 19 -4 C 16 -14 14 -28 16 -42 C 10 -49 -10 -49 -16 -42 Z",
  legL: "M -12 -4 L -14 20 L -5 20 L -3 -4 Z",
  legR: "M 12 -4 L 14 20 L 5 20 L 3 -4 Z",
  /* the dhol, slung across */
  drum: "M -22 -30 a 22 14 0 1 0 44 0 a 22 14 0 1 0 -44 0",
  drumBand: "M -22 -30 L 22 -30",
  strap: "M -14 -46 L 18 -22",
  head: "M -10 -58 a 10 11 0 1 0 20 0 a 10 11 0 1 0 -20 0",
  turban: "M -13 -64 C -11 -77 11 -77 13 -64 C 6 -69 -6 -69 -13 -64 Z",
  eye: "M -5 -59 C -2 -63 4 -63 7 -59 C 4 -55 -2 -55 -5 -59 Z",
};

const WHEAT = {
  stalk: "M 0 20 L 0 -36",
  g1: "M 0 -12 C 10 -19 15 -12 11 -5 C 5 -3 1 -7 0 -12 Z",
  g2: "M 0 -25 C 10 -32 15 -25 11 -18 C 5 -16 1 -20 0 -25 Z",
  g3: "M 0 -36 C 8 -43 13 -36 9 -30 C 4 -28 1 -32 0 -36 Z",
};

const JUTTI = "M -17 18 C -18 7 -7 2 4 5 C 14 8 17 13 15 18 Z";
const JUTTI_CURL = "M 15 18 C 20 12 17 4 10 5";

const POT = "M -13 22 C -17 10 -13 0 0 0 C 13 0 17 10 13 22 Z";

function K({
  d,
  at,
  delay = 0,
  animate,
  w = 3.2,
}: {
  d: string;
  at?: string;
  delay?: number;
  animate: boolean;
  w?: number;
}) {
  const draw = animate
    ? {
        initial: { pathLength: 0 },
        whileInView: { pathLength: 1 },
        viewport: { once: true, amount: 0.05 },
        transition: { duration: 0.7, delay, ease: EASE },
      }
    : {};
  return (
    <g transform={at}>
      <motion.path d={d} className="pk-ink" strokeWidth={w} {...draw} />
      <motion.path d={d} className="pk-ground" strokeWidth={w * 0.38} {...draw} />
    </g>
  );
}

function Dancer({ x, flip, delay, animate }: { x: number; flip?: boolean; delay: number; animate: boolean }) {
  const at = `translate(${x} 0)${flip ? " scale(-1 1)" : ""}`;
  return (
    <g transform={at}>
      {Object.values(DANCER).map((d, i) => (
        <K key={i} d={d} delay={delay + i * 0.04} animate={animate} />
      ))}
    </g>
  );
}

function Dholi({ x, delay, animate }: { x: number; delay: number; animate: boolean }) {
  return (
    <g transform={`translate(${x} 0)`}>
      {Object.values(DHOLI).map((d, i) => (
        <K key={i} d={d} delay={delay + i * 0.04} animate={animate} />
      ))}
    </g>
  );
}

/** The continuous band. One long viewBox, read left to right. */
function RegisterBand({ animate }: { animate: boolean }) {
  return (
    <svg viewBox="0 0 1600 140" className="h-[140px] w-[1600px]" aria-hidden>
      {/* the two rails that define a register */}
      <K d="M 0 30 L 1600 30" animate={animate} w={2.6} />
      <K d="M 0 122 L 1600 122" animate={animate} w={2.6} />

      <g transform="translate(0 96)">
        <Dholi x={90} delay={0.1} animate={animate} />
        <Dancer x={220} delay={0.25} animate={animate} />
        <Dancer x={330} flip delay={0.35} animate={animate} />
        <K d={WHEAT.stalk} at="translate(430 0)" delay={0.45} animate={animate} w={2.6} />
        <K d={WHEAT.g1} at="translate(430 0)" delay={0.5} animate={animate} w={2.6} />
        <K d={WHEAT.g2} at="translate(430 0)" delay={0.54} animate={animate} w={2.6} />
        <K d={WHEAT.g3} at="translate(430 0)" delay={0.57} animate={animate} w={2.6} />
        <Dancer x={530} delay={0.6} animate={animate} />
        <Dancer x={640} flip delay={0.68} animate={animate} />
        <K d={POT} at="translate(745 0)" delay={0.76} animate={animate} />
        <Dholi x={850} delay={0.84} animate={animate} />
        <Dancer x={975} delay={0.92} animate={animate} />
        <K d={JUTTI} at="translate(1075 0)" delay={1.0} animate={animate} />
        <K d={JUTTI_CURL} at="translate(1075 0)" delay={1.04} animate={animate} w={2.4} />
        <Dancer x={1170} flip delay={1.1} animate={animate} />
        <K d={WHEAT.stalk} at="translate(1270 0)" delay={1.18} animate={animate} w={2.6} />
        <K d={WHEAT.g1} at="translate(1270 0)" delay={1.22} animate={animate} w={2.6} />
        <K d={WHEAT.g2} at="translate(1270 0)" delay={1.26} animate={animate} w={2.6} />
        <K d={WHEAT.g3} at="translate(1270 0)" delay={1.29} animate={animate} w={2.6} />
        <Dancer x={1370} delay={1.32} animate={animate} />
        <Dholi x={1490} delay={1.4} animate={animate} />
      </g>
    </svg>
  );
}

export function BhangraRegister() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
    /* v13: survives late image decode without a manual refresh pass. */
    trackContentSize: true,
  });

  /* Travel in PERCENT of the track's own width — no layout read, so it is
     resize- and zoom-proof. */
  const xRaw = useTransform(scrollYProgress, [0, 1], ["8%", "-58%"]);
  const x = useSpring(xRaw, { stiffness: 220, damping: 40, mass: 0.6, restDelta: 0.0005 });

  return (
    <section
      ref={ref}
      className="pk-on-indigo relative overflow-hidden py-16 md:py-24"
      style={{ background: "var(--pigment-indigo)" }}
      aria-labelledby="register-heading"
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.14]">
        <svg width="100%" height="100%">
          <rect width="100%" height="100%" fill="url(#pk-phulkari)" />
        </svg>
      </div>

      <div className="relative mx-auto max-w-6xl px-4 md:px-8">
        <h2
          id="register-heading"
          className="font-display t-display"
          style={{ color: "var(--pk-ivory)" }}
        >
          The procession keeps walking
        </h2>
        <p className="measure t-body mt-4" style={{ color: "var(--pk-ivory)", opacity: 0.76 }}>
          On the Baraat Shawl, a wedding party walks the lower border in a
          narrative register. We kept the register and changed the procession —
          dhol, dancers, wheat, jutti, drawn in the same Mithila line. Read it
          left to right.
        </p>
      </div>

      {/* The band. Horizontal motion is decorative — the meaning is in the
          heading and caption above, which are plain text for a screen reader. */}
      <div className="relative mt-12 overflow-hidden" aria-hidden>
        <motion.div style={reduced ? undefined : { x }} className="will-change-transform">
          <RegisterBand animate={!reduced} />
        </motion.div>
      </div>

      <div className="relative mx-auto mt-10 max-w-6xl px-4 md:px-8">
        <p className="t-micro" style={{ color: "var(--pk-ivory)", opacity: 0.55 }}>
          Mithila grammar · Punjabi subject
        </p>
      </div>
    </section>
  );
}
