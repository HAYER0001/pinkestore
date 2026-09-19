"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { PRODUCTS, CRAFTS } from "@/lib/catalog";
import { getShots, altFor } from "@/lib/shots";
import { DisplayComposition } from "@/components/type/DisplayComposition";
import { CtaPair } from "@/components/site/Cta";
import { HeroDepth } from "@/components/site/HeroDepth";

/**
 * 01 · THE HERO SCENE.
 *
 * One photograph, one headline, and the two are not separable. The old hero
 * was a text block with an image beside it — type left, cloth right — which
 * is a magazine spread, not a scene. This is the Baraat Shawl laid flat,
 * filling the viewport, with the headline breaking across its left edge so
 * the last word sits ON the painting.
 *
 * THE CANVAS STAYS LIVE UNDERNEATH. The particle morph runs behind the
 * photograph exactly as before; the image is offset right and never covers
 * the full width on desktop, so the dust is visible down its left side and
 * around the type. The blend on the h1 is still `difference`, so wherever the
 * headline crosses from painting to void it inverts correctly without a line
 * of colour-tracking JS.
 *
 * ON A PHONE the scene is stacked, not shrunk: the painting owns the top 60%
 * of the screen and the type sits on the dust below it, with the headline's
 * first line overlapping the painting's foot so the two still read as one
 * composition. A full-width image behind the type put "remembers" on the
 * busiest part of the pattern, where the difference blend turns it to noise.
 *
 * FILM ZOOM. The image scales 1.0 -> 1.08 linearly across the section's
 * scroll and drifts up more slowly than the page (0.7x). No spring, no ease-
 * out: a camera on a track does not decelerate at the end of a dolly, and the
 * moment it does the shot stops feeling like film and starts feeling like UI.
 */

const HERO_SLUG = "madhubani-baraat-shawl";

export function HeroScene() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const piece = PRODUCTS.find((p) => p.slug === HERO_SLUG)!;
  const craft = CRAFTS[piece.craft];
  const shot = getShots(piece.slug)[0];

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  /* linear, deliberately — see above */
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);
  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "-14%"]);
  const typeY = useTransform(scrollYProgress, [0, 1], ["0%", "-30%"]);
  const fade = useTransform(scrollYProgress, [0.55, 0.95], [1, 0]);

  return (
    <section
      ref={ref}
      id="origin"
      data-chrome="dark"
      className="relative h-[150vh]"
      aria-label="The Pinkestore"
    >
      <HeroDepth />

      <div className="sticky top-0 h-[100svh] overflow-hidden">
        {/* ---------------- the photograph ---------------- */}
        <motion.div
          className="absolute inset-x-0 top-0 h-[60svh] lg:inset-y-0 lg:left-[26vw] lg:right-0 lg:h-auto"
          style={reduced ? undefined : { y: imageY, opacity: fade }}
          aria-hidden={false}
        >
          <motion.div
            className="relative h-full w-full"
            style={reduced ? undefined : { scale, transformOrigin: "50% 40%" }}
          >
            {shot && (
              <Image
                src={shot.src}
                alt={altFor(piece, shot)}
                fill
                priority
                quality={90}
                sizes="(max-width: 1024px) 100vw, 74vw"
                className="object-cover"
                style={{ objectPosition: "50% 22%" }}
              />
            )}
            {/* a breath of the void over the image's left edge, so the type
                that crosses it has a gradient to cross rather than a cliff */}
            <div
              aria-hidden
              className="absolute inset-y-0 left-0 hidden w-[30%] lg:block"
              style={{
                background:
                  "linear-gradient(90deg, rgba(10,11,16,0.92) 0%, rgba(10,11,16,0.55) 45%, rgba(10,11,16,0) 100%)",
              }}
            />
            {/* the top, so the fixed header always has a dark ground — the nav
                is centred and would otherwise sit on the busiest part of the
                painting with nothing behind it */}
            <div
              aria-hidden
              className="absolute inset-x-0 top-0 h-[16%]"
              style={{
                background:
                  "linear-gradient(180deg, rgba(10,11,16,0.7) 0%, rgba(10,11,16,0) 100%)",
              }}
            />
            {/* and the bottom, where the metadata sits */}
            <div
              aria-hidden
              className="absolute inset-x-0 bottom-0 h-[46%] lg:h-[34%]"
              style={{
                background:
                  "linear-gradient(0deg, #0A0B10 0%, rgba(10,11,16,0.86) 22%, rgba(10,11,16,0) 100%)",
              }}
            />
          </motion.div>
        </motion.div>

        {/* ---------------- the headline, ON the image ----------------
            lg:pl clears the chapter rail, which is fixed to the left gutter
            (0-187px at 1440) and printed "01 — ORIGIN" straight into "The
            dust" at the narrower inset. The image starts at 26vw, so the line
            still crosses well onto the painting. */}
        <motion.div
          className="over-image absolute inset-x-0 bottom-[7svh] px-[clamp(1.25rem,5vw,6rem)] lg:bottom-[21vh] lg:pl-[clamp(8rem,14vw,15rem)]"
          style={reduced ? undefined : { y: typeY }}
        >
          <p
            className="ty-mono"
            style={{
              color: "#E8BC57",
              letterSpacing: "var(--tracking-luxe-widest)",
              marginBottom: "clamp(1.25rem,2.5vw,2rem)",
            }}
          >
            शैली ०१ · {craft.region}
          </p>

          {/* difference: the same glyph inverts over the void AND over the
              cream ground of the painting, so the line can cross the edge */}
          <DisplayComposition
            as="h1"
            lines={[
              { text: "The dust", scale: "hero" },
              { text: "remembers", scale: "colossal" },
              { text: "the drawing", scale: "hero", italic: true, indent: 0.14 },
            ]}
            style={{ color: "#FFFFFF", mixBlendMode: "difference" }}
          />

          <div className="mt-[clamp(1.5rem,3vh,2.5rem)] grid gap-6 lg:grid-cols-[minmax(0,44ch)_auto] lg:items-end">
            <p
              className="ty-lede"
              style={{ color: "#F3EDE9", margin: 0, textShadow: "0 1px 24px rgba(0,0,0,0.6)" }}
            >
              Hand-painted in Mithila, embroidered and woven in Kashmir. Every
              piece exists once.
            </p>

            <CtaPair
              tone="#FAF8F5"
              ground="#0A0B10"
              primary={{ href: "/collection", label: "See the collection" }}
              secondary={{ href: "/craft", label: "How it is made" }}
            />
          </div>
        </motion.div>

        {/* museum label, bottom-right — the object, not the story */}
        <div className="over-image absolute bottom-[4vh] right-[clamp(1.25rem,4vw,4rem)] hidden text-right md:block">
          <p className="ty-mono" style={{ color: "#F3EDE9", opacity: 0.7, margin: 0 }}>
            {piece.name} · {craft.label}
          </p>
          <p className="ty-mono" style={{ color: "#F3EDE9", opacity: 0.45, margin: "0.25rem 0 0" }}>
            {shot?.frame ?? "laid flat"} · one of one
          </p>
        </div>
      </div>
    </section>
  );
}
