"use client";

import { motion, useReducedMotion } from "motion/react";

/**
 * THE CONSTRUCTION PIECE.
 *
 * A Mithila painter works in three passes, in this order:
 *   1. KACHNI  — the doubled outline, drawn freehand, no underdrawing
 *   2. BHARNI  — flat unmodulated colour poured inside the contour
 *   3. HORROR VACUI — every remaining gap closed with hatch, dot, chevron
 *
 * This component animates in exactly that order, so the viewer watches the
 * painting being MADE rather than watching a picture fade in. That is the
 * whole idea: the motion is the craft, not decoration on top of it.
 *
 * Secular auspicious motifs only — tree of life, birds, fish, sun. We do not
 * animate sacred kohbar marriage-chamber imagery for commerce.
 */

const EASE = [0.32, 0.72, 0, 1] as const;

/* ---------- geometry ---------- */

const ARCH_OUTER =
  "M 44 592 L 44 208 C 44 116 116 44 240 44 C 364 44 436 116 436 208 L 436 592";
const ARCH_INNER =
  "M 68 592 L 68 213 C 68 131 131 68 240 68 C 349 68 412 131 412 213 L 412 592";

/* A domed crown, not a heart. The two-lobe form read as a valentine — wrong
   symbol entirely for a tree of life. */
const CANOPY =
  "M 240 386 C 148 386 106 332 123 270 C 139 211 190 188 240 196 C 290 188 341 211 357 270 C 374 332 332 386 240 386 Z";

const TRUNK = "M 240 580 C 233 504 233 442 240 384";
const ROOTS = [
  "M 240 580 C 219 574 203 563 194 550",
  "M 240 580 C 261 574 277 563 286 550",
];

const BRANCHES = [
  "M 240 474 C 204 466 181 447 171 416",
  "M 240 474 C 276 466 299 447 309 416",
  "M 240 424 C 209 416 189 399 181 372",
  "M 240 424 C 271 416 291 399 299 372",
];

const LEAF = "M 0 0 c -13 -8 -17 -23 -6 -29 c 9 -5 17 3 15 14 c -2 9 -6 14 -9 15";
const LEAF_AT: Array<[number, number, number]> = [
  [171, 416, -18],
  [309, 416, 18],
  [181, 372, -14],
  [299, 372, 14],
];

const SUN_C: [number, number, number] = [240, 140, 30];

/* Interior structure. A Mithila canopy is never a flat blob — it carries
   foliage bands, a dot field, and the trunk is segmented with tick bands. */
const CANOPY_BANDS = [
  "M 140 300 C 190 282 290 282 340 300",
  "M 150 336 C 196 320 284 320 330 336",
  "M 168 258 C 200 242 280 242 312 258",
];
const TRUNK_TICKS = [
  "M 229 470 L 251 470",
  "M 230 508 L 250 508",
  "M 231 544 L 249 544",
];
const BIRD_CREST = "M 47 -22 L 44 -32 M 52 -22 L 52 -33 M 57 -21 L 60 -31";

const FISH = "M 0 0 C 19 -13 48 -13 67 0 C 48 13 19 13 0 0 Z";
const FISH_TAIL = "M 0 0 L -17 -11 L -17 11 Z";

const BIRD_BODY =
  "M 0 0 C 9 -15 28 -19 41 -9 C 50 -2 48 12 37 16 C 24 21 7 14 0 0 Z";
const BIRD_HEAD = "M 39 -11 C 43 -22 52 -24 56 -20 C 59 -17 58 -11 54 -9";
const BIRD_BEAK = "M 56 -16 L 68 -19";
const BIRD_TAIL = "M 2 2 C -13 11 -26 26 -33 44";

/* ---------- the doubled-contour primitive ---------- */

function Kachni({
  d,
  delay,
  duration = 1.1,
  animate,
  transform,
}: {
  d: string;
  delay: number;
  duration?: number;
  animate: boolean;
  transform?: string;
}) {
  const draw = animate
    ? {
        initial: { pathLength: 0 },
        whileInView: { pathLength: 1 },
        viewport: { once: true, amount: 0.2 },
        transition: { duration, delay, ease: EASE },
      }
    : {};

  return (
    <g transform={transform}>
      <motion.path d={d} className="pk-ink" strokeWidth={3.4} {...draw} />
      <motion.path d={d} className="pk-ground" strokeWidth={1.3} {...draw} />
    </g>
  );
}

/** Flat colour, poured after the line exists. Never gradients. */
function Bharni({
  d,
  fill,
  delay,
  animate,
  transform,
  opacity = 1,
}: {
  d: string;
  fill: string;
  delay: number;
  animate: boolean;
  transform?: string;
  opacity?: number;
}) {
  return (
    <motion.path
      d={d}
      fill={fill}
      transform={transform}
      initial={animate ? { opacity: 0 } : false}
      whileInView={{ opacity }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, delay, ease: EASE }}
    />
  );
}

export function MithilaTree({ className }: { className?: string }) {
  const reduced = useReducedMotion();
  const animate = !reduced;

  /* Three passes. Colour only starts once the line is established. */
  const T_LINE = 0.0;
  const T_FILL = 2.2;
  const T_HATCH = 3.1;

  return (
    <svg
      viewBox="0 0 480 620"
      className={className}
      role="img"
      aria-label="A Mithila tree of life with paired birds, fish and a sun disc, drawn in doubled kachni line"
    >
      <defs>
        <pattern id="mt-hatch" patternUnits="userSpaceOnUse" width="9" height="9">
          <path d="M 0 9 L 9 0" className="pk-ink" strokeWidth={0.9} opacity={0.5} />
        </pattern>
        <pattern id="mt-dots" patternUnits="userSpaceOnUse" width="12" height="12">
          <circle cx="6" cy="6" r="1.5" className="pk-fill-ink" opacity={0.45} />
        </pattern>
        <clipPath id="mt-canopy-clip">
          <path d={CANOPY} />
        </clipPath>
        <clipPath id="mt-arch-clip">
          <path d={`${ARCH_INNER} L 412 592 L 68 592 Z`} />
        </clipPath>
      </defs>

      {/* ---- PASS 3 (behind): the refusal of empty space ---- */}
      <g clipPath="url(#mt-arch-clip)">
        <motion.rect
          x="68"
          y="68"
          width="344"
          height="524"
          fill="url(#mt-hatch)"
          initial={animate ? { opacity: 0 } : false}
          whileInView={{ opacity: 0.55 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.9, delay: T_HATCH, ease: EASE }}
        />
      </g>

      {/* ---- PASS 2: flat colour ---- */}
      <Bharni d={CANOPY} fill="var(--pigment-teal)" delay={T_FILL} animate={animate} opacity={0.9} />
      <Bharni
        d={FISH}
        fill="var(--pigment-madder)"
        transform="translate(150 548)"
        delay={T_FILL + 0.15}
        animate={animate}
      />
      <Bharni
        d={FISH}
        fill="var(--pigment-madder)"
        transform="translate(263 548)"
        delay={T_FILL + 0.22}
        animate={animate}
      />
      <Bharni
        d={BIRD_BODY}
        fill="var(--pigment-aubergine)"
        transform="translate(112 454)"
        delay={T_FILL + 0.3}
        animate={animate}
      />
      <Bharni
        d={BIRD_BODY}
        fill="var(--pigment-aubergine)"
        transform="translate(368 454) scale(-1 1)"
        delay={T_FILL + 0.36}
        animate={animate}
      />
      <motion.circle
        cx={SUN_C[0]}
        cy={SUN_C[1]}
        r={SUN_C[2]}
        fill="var(--pigment-haldi)"
        initial={animate ? { opacity: 0 } : false}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.5, delay: T_FILL, ease: EASE }}
      />
      {LEAF_AT.map(([x, y, r], i) => (
        <Bharni
          key={`lf-${i}`}
          d={LEAF}
          fill="var(--pigment-sindoor)"
          transform={`translate(${x} ${y}) rotate(${r})`}
          delay={T_FILL + 0.4 + i * 0.05}
          animate={animate}
        />
      ))}

      {/* ---- PASS 1 (on top): the line ---- */}
      <Kachni d={ARCH_OUTER} delay={T_LINE} duration={1.4} animate={animate} />
      <Kachni d={ARCH_INNER} delay={T_LINE + 0.15} duration={1.4} animate={animate} />

      <Kachni d={TRUNK} delay={T_LINE + 0.5} duration={0.9} animate={animate} />
      {ROOTS.map((d, i) => (
        <Kachni key={`rt-${i}`} d={d} delay={T_LINE + 0.7 + i * 0.06} duration={0.5} animate={animate} />
      ))}
      {BRANCHES.map((d, i) => (
        <Kachni key={`br-${i}`} d={d} delay={T_LINE + 0.85 + i * 0.07} duration={0.6} animate={animate} />
      ))}
      <Kachni d={CANOPY} delay={T_LINE + 1.1} duration={1.2} animate={animate} />

      {LEAF_AT.map(([x, y, r], i) => (
        <Kachni
          key={`lk-${i}`}
          d={LEAF}
          transform={`translate(${x} ${y}) rotate(${r})`}
          delay={T_LINE + 1.4 + i * 0.06}
          duration={0.45}
          animate={animate}
        />
      ))}

      {/* canopy interior — foliage bands + dot field */}
      <g clipPath="url(#mt-canopy-clip)">
        <motion.rect
          x="106"
          y="188"
          width="268"
          height="200"
          fill="url(#mt-dots)"
          initial={animate ? { opacity: 0 } : false}
          whileInView={{ opacity: 0.6 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7, delay: T_HATCH + 0.2, ease: EASE }}
        />
      </g>
      {CANOPY_BANDS.map((d, i) => (
        <Kachni key={`cb-${i}`} d={d} delay={T_LINE + 1.9 + i * 0.08} duration={0.55} animate={animate} />
      ))}
      {TRUNK_TICKS.map((d, i) => (
        <Kachni key={`tt-${i}`} d={d} delay={T_LINE + 1.15 + i * 0.05} duration={0.25} animate={animate} />
      ))}

      {/* sun + rays */}
      <Kachni
        d={`M ${SUN_C[0] - SUN_C[2]} ${SUN_C[1]} a ${SUN_C[2]} ${SUN_C[2]} 0 1 0 ${SUN_C[2] * 2} 0 a ${SUN_C[2]} ${SUN_C[2]} 0 1 0 ${-SUN_C[2] * 2} 0`}
        delay={T_LINE + 1.5}
        duration={0.8}
        animate={animate}
      />
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i * Math.PI * 2) / 12;
        const [cx, cy, r] = SUN_C;
        const x1 = cx + Math.cos(a) * (r + 6);
        const y1 = cy + Math.sin(a) * (r + 6);
        const x2 = cx + Math.cos(a) * (r + 17);
        const y2 = cy + Math.sin(a) * (r + 17);
        return (
          <Kachni
            key={`ray-${i}`}
            d={`M ${x1.toFixed(1)} ${y1.toFixed(1)} L ${x2.toFixed(1)} ${y2.toFixed(1)}`}
            delay={T_LINE + 1.7 + i * 0.03}
            duration={0.3}
            animate={animate}
          />
        );
      })}

      {/* birds */}
      {[
        ["translate(112 454)", 0],
        ["translate(368 454) scale(-1 1)", 0.08],
      ].map(([tf, off], i) => (
        <g key={`bd-${i}`}>
          <Kachni d={BIRD_BODY} transform={tf as string} delay={T_LINE + 1.75 + (off as number)} duration={0.6} animate={animate} />
          <Kachni d={BIRD_HEAD} transform={tf as string} delay={T_LINE + 1.9 + (off as number)} duration={0.35} animate={animate} />
          <Kachni d={BIRD_BEAK} transform={tf as string} delay={T_LINE + 2.0 + (off as number)} duration={0.2} animate={animate} />
          <Kachni d={BIRD_TAIL} transform={tf as string} delay={T_LINE + 1.95 + (off as number)} duration={0.5} animate={animate} />
          <Kachni d={BIRD_CREST} transform={tf as string} delay={T_LINE + 2.05 + (off as number)} duration={0.25} animate={animate} />
        </g>
      ))}

      {/* fish pair */}
      {[
        ["translate(150 548)", 0],
        ["translate(263 548)", 0.07],
      ].map(([tf, off], i) => (
        <g key={`fs-${i}`}>
          <Kachni d={FISH} transform={tf as string} delay={T_LINE + 2.0 + (off as number)} duration={0.55} animate={animate} />
          <Kachni d={FISH_TAIL} transform={tf as string} delay={T_LINE + 2.15 + (off as number)} duration={0.3} animate={animate} />
          <motion.circle
            cx={52}
            cy={-3}
            r={2.6}
            className="pk-fill-ink"
            transform={tf as string}
            initial={animate ? { opacity: 0 } : false}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.3, delay: T_LINE + 2.3 + (off as number) }}
          />
        </g>
      ))}
    </svg>
  );
}
