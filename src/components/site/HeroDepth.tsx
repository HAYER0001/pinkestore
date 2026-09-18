"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { getProduct, CRAFTS, formatINR } from "@/lib/catalog";
import { SecondaryCta } from "./Cta";

/**
 * FOREGROUND / BACKGROUND STAGING (items 21 + 24).
 *
 * The hero had exactly one plane of depth: type over a particle field. Depth
 * is not a blur filter — it is PARALLAX PLUS FOCUS. Things nearer the camera
 * travel further per unit of scroll and are further out of focus, and the eye
 * reads those two together as distance without being told.
 *
 * So: a slow背 background haze at 0.25x, the type at 1x from the page flow, and
 * a foreground of large defocused motes at 1.9x. The foreground is
 * pointer-events:none and aria-hidden — it is atmosphere, and it must never
 * intercept a click meant for the CTA behind it.
 *
 * Deliberately CHEAP: five absolutely-positioned divs with a radial gradient
 * and a blur, driven by two shared MotionValues. No canvas, no extra draw
 * calls, nothing competing with the WebGL scene for the frame budget.
 */

const MOTES = [
  { x: "8%", y: "18%", s: 190, o: 0.09, d: 1.0 },
  { x: "74%", y: "12%", s: 250, o: 0.07, d: 1.35 },
  { x: "88%", y: "62%", s: 150, o: 0.1, d: 0.8 },
  { x: "22%", y: "78%", s: 210, o: 0.06, d: 1.6 },
  { x: "52%", y: "88%", s: 120, o: 0.08, d: 1.15 },
];

export function HeroDepth() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  /* Spring the driver, not each layer — five springs would be five separate
     simulations converging at slightly different rates, which reads as jitter
     between planes rather than as parallax. */
  const drive = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.6 });
  const near = useTransform(drive, [0, 1], [0, -340]);
  const far = useTransform(drive, [0, 1], [0, 120]);
  const fade = useTransform(drive, [0, 0.75], [1, 0]);

  if (reduced) return null;

  return (
    <div ref={ref} aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* BACKGROUND — drifts down, slower than the page */}
      <motion.div
        className="absolute inset-0"
        style={{
          y: far,
          opacity: fade,
          background:
            "radial-gradient(60% 45% at 50% 42%, rgba(232,188,87,0.07) 0%, rgba(232,188,87,0) 70%)",
        }}
      />

      {/* FOREGROUND — travels furthest and is furthest out of focus */}
      <motion.div className="absolute inset-0" style={{ y: near, opacity: fade }}>
        {MOTES.map((m, i) => (
          <div
            key={i}
            className="absolute"
            style={{
              left: m.x,
              top: m.y,
              width: m.s,
              height: m.s,
              borderRadius: "50%",
              background: `radial-gradient(circle, rgba(250,248,245,${m.o}) 0%, rgba(250,248,245,0) 68%)`,
              filter: `blur(${14 * m.d}px)`,
            }}
          />
        ))}
      </motion.div>
    </div>
  );
}

/**
 * THE HERO PRODUCT REVEAL (item 30).
 *
 * A piece emerging as a physical object at the end of the hero, before the
 * film starts — the first thing on the page that can actually be bought.
 *
 * It rises and comes INTO focus rather than fading up. A fade says "a layer
 * appeared"; a blur resolving says "something approached", which is the whole
 * point of putting it at the end of a depth-staged scene.
 */
export function HeroReveal({ slug = "sozni-ivory-pashmina" }: { slug?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const p = getProduct(slug);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.95", "start 0.45"],
  });
  const drive = useSpring(scrollYProgress, { stiffness: 90, damping: 26, mass: 0.9 });

  const y = useTransform(drive, [0, 1], [90, 0]);
  const scale = useTransform(drive, [0, 1], [0.92, 1]);
  const blur = useTransform(drive, [0, 1], [14, 0]);
  const filter = useTransform(blur, (b) => `blur(${b}px)`);
  const opacity = useTransform(drive, [0, 0.35], [0, 1]);

  if (!p) return null;
  const craft = CRAFTS[p.craft];

  return (
    <div ref={ref}>
      <motion.div
        className="w-full"
        style={reduced ? undefined : { y, scale, filter, opacity }}
      >
        <Link href={`/product/${p.slug}`} style={{ textDecoration: "none" }} className="block">
          <span className="relative block overflow-hidden" style={{ aspectRatio: "3 / 4", background: "#1A1A1A" }}>
            <Image
              src={p.image}
              alt={`${p.name} — ${craft.label}`}
              fill
              sizes="(max-width: 768px) 90vw, 420px"
              quality={88}
              className="object-cover"
            />
          </span>

          <div className="mt-5 flex items-baseline justify-between gap-5">
            <span>
              <span className="ty-mono block" style={{ color: "#E8BC57" }}>
                {craft.label}
              </span>
              <span className="ty-title mt-1 block" style={{ color: "#FAF8F5" }}>
                {p.name}
              </span>
            </span>
            <span className="ty-mono shrink-0" style={{ color: "#FAF8F5" }}>
              {formatINR(p.pricePaise)}
            </span>
          </div>
        </Link>

        <SecondaryCta href={`/product/${p.slug}`} tone="#FAF8F5" className="mt-2">
          View this piece
        </SecondaryCta>
      </motion.div>
    </div>
  );
}
