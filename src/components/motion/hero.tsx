"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
} from "motion/react";
import { Magnetic } from "@/components/ui/magnetic";
import { Dust } from "@/components/ornament/dust";
import { getProduct, BRAND } from "@/lib/catalog";

/**
 * HERO — magnetic elegance.
 *
 * Springs only. No CSS ease-in / ease-out anywhere in this file.
 *
 *  · the shawl tilts in 3D toward the cursor, so the cloth reads as an object
 *    in space rather than a flat image
 *  · the headline slides up out of masking boxes, word by word — ink absorbing
 *    into paper, never a fade
 *  · the CTA is magnetic and depresses on press
 */

const TILT = { stiffness: 110, damping: 18, mass: 0.6 } as const;
const WORD = { type: "spring", stiffness: 120, damping: 20, mass: 0.8 } as const;

const LINES = [
  ["The", "Art", "of", "Tradition."],
  ["Hand-Painted", "Mithila", "Shawls."],
];

export function Hero() {
  const reduced = useReducedMotion();
  const frame = useRef<HTMLDivElement>(null);
  const hero = getProduct("chikankari-blush-suit-set")!;

  /* pointer → tilt */
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const rotY = useSpring(useTransform(px, [0, 1], [7, -7]), TILT);
  const rotX = useSpring(useTransform(py, [0, 1], [-6, 6]), TILT);
  const panX = useSpring(useTransform(px, [0, 1], [10, -10]), TILT);
  const panY = useSpring(useTransform(py, [0, 1], [8, -8]), TILT);

  const onMove = (e: React.PointerEvent) => {
    if (reduced) return;
    const r = frame.current?.getBoundingClientRect();
    if (!r) return;
    px.set((e.clientX - r.left) / r.width);
    py.set((e.clientY - r.top) / r.height);
  };

  return (
    <section
      className="relative isolate overflow-hidden"
      style={{ background: "#1B2A63" }}
      onPointerMove={onMove}
      onPointerLeave={() => {
        px.set(0.5);
        py.set(0.5);
      }}
    >
      {/* textile dust in a sunbeam */}
      <Dust density={22} />

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-20 md:px-8 md:py-28 lg:grid-cols-[1.05fr_1fr]">
        <div>
          <motion.p
            className="font-mono"
            style={{ color: "#E8BC57", fontSize: "var(--fs-sm)", letterSpacing: "0.2em" }}
            initial={reduced ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 140, damping: 22, delay: 0.1 }}
          >
            {BRAND.city.toUpperCase()} · {BRAND.state.toUpperCase()}
          </motion.p>

          <h1 className="mt-6">
            {LINES.map((line, li) => (
              <span key={li} className="block">
                {line.map((word, wi) => (
                  /* each word rides up out of its own mask */
                  <span
                    key={`${li}-${wi}`}
                    className="inline-block overflow-hidden align-bottom"
                    style={{ paddingRight: "0.26em" }}
                  >
                    <motion.span
                      className="font-display inline-block"
                      style={{
                        color: li === 0 ? "#F4EFE6" : "#E8BC57",
                        fontSize: "clamp(2rem, 5.4vw, 4.4rem)",
                        lineHeight: 1.04,
                        letterSpacing: "-0.03em",
                      }}
                      initial={reduced ? false : { y: "110%" }}
                      animate={{ y: "0%" }}
                      transition={{
                        ...WORD,
                        delay: 0.22 + (li * line.length + wi) * 0.06,
                      }}
                    >
                      {word}
                    </motion.span>
                  </span>
                ))}
              </span>
            ))}
          </h1>

          <motion.p
            className="measure mt-7"
            style={{ color: "#F4EFE6", opacity: 0.8, fontSize: "var(--fs-xl)", lineHeight: 1.6 }}
            initial={reduced ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 0.8, y: 0 }}
            transition={{ type: "spring", stiffness: 130, damping: 22, delay: 0.62 }}
          >
            Every piece here exists once. Painted, embroidered or woven by hand,
            then packed in {BRAND.city} and sent to one person.
          </motion.p>

          <motion.div
            className="mt-10 inline-block"
            initial={reduced ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 130, damping: 20, delay: 0.76 }}
          >
            <Magnetic intensity={0.45} range={140} springOptions={{ stiffness: 180, damping: 14, mass: 0.3 }}>
              <motion.div whileTap={{ scale: 0.95 }} transition={{ type: "spring", stiffness: 420, damping: 16 }}>
                <Link
                  href="#pieces"
                  className="inline-block px-9 py-4 font-mono"
                  style={{
                    background: "#E8BC57",
                    color: "#221A08",
                    fontSize: "var(--fs-lg)",
                    letterSpacing: "0.1em",
                    borderRadius: "var(--r-xs)",
                  }}
                >
                  EXPLORE COLLECTION
                </Link>
              </motion.div>
            </Magnetic>
          </motion.div>
        </div>

        {/* the cloth, tangible */}
        <div ref={frame} style={{ perspective: 1200 }}>
          <motion.div
            className="relative overflow-hidden"
            style={{
              rotateX: reduced ? 0 : rotX,
              rotateY: reduced ? 0 : rotY,
              transformStyle: "preserve-3d",
              borderRadius: "var(--r-sm)",
              border: "1px solid rgba(232,188,87,0.4)",
            }}
            initial={reduced ? false : { opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 70, damping: 20, delay: 0.3 }}
          >
            <motion.div style={{ x: reduced ? 0 : panX, y: reduced ? 0 : panY }}>
              <Image
                src={hero.image}
                alt={`${hero.name} — Lucknowi chikankari`}
                width={hero.width}
                height={hero.height}
                quality={90}
                sizes="(max-width: 1024px) 92vw, 46vw"
                loading="eager"
                fetchPriority="high"
                className="h-full w-full scale-[1.18] object-cover"
              />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
