"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { PRODUCTS, CRAFTS } from "@/lib/catalog";
import { getShots, altFor } from "@/lib/shots";
import { CtaPair } from "@/components/site/Cta";
import { useReveal } from "@/components/type/useReveal";

/**
 * 07 · THE FINAL SCENE.
 *
 * "Nothing here was made twice." — the brief asks the page to end on it, and
 * it deserves to: it is the truest sentence on the site and the whole
 * argument in five words.
 *
 * Set at the monument step (12vw), across a full-bleed frame of the kani —
 * the one piece where the sentence is most literally true, because the
 * pattern is the weave and a second one would need a second talim. The image
 * is nearly black at the edges and the type is ivory; nothing else is on the
 * screen until the two CTAs, small, at the bottom.
 *
 * The headline drifts UP against the scroll as the section arrives, so the
 * last thing that happens on the page is the words rising to meet you.
 */
export function FinalScene() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const piece = PRODUCTS.find((p) => p.craft === "jamawar-kani")!;
  const craft = CRAFTS[piece.craft];
  const shot = getShots(piece.slug).find((s) => s.kind === "macro") ?? getShots(piece.slug)[0];

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end end"] });
  const scale = useTransform(scrollYProgress, [0, 1], [1.12, 1]);
  const rise = useTransform(scrollYProgress, [0, 1], ["18vh", "0vh"]);
  const [lineRef, shown] = useReveal<HTMLDivElement>(0.3);

  return (
    <section
      ref={ref}
      id="finale"
      data-chrome="dark"
      className="relative flex min-h-[100svh] items-end overflow-hidden"
      style={{ background: "#0F0E0C" }}
      aria-label="Nothing here was made twice"
    >
      <motion.div className="absolute inset-0" style={reduced ? undefined : { scale }}>
        {shot && (
          <Image
            src={shot.src}
            alt={altFor(piece, shot)}
            fill
            sizes="100vw"
            quality={86}
            className="object-cover"
            style={{ objectPosition: "50% 45%" }}
          />
        )}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(120% 90% at 50% 30%, rgba(15,14,12,0.1) 0%, rgba(15,14,12,0.7) 60%, rgba(15,14,12,0.96) 100%)",
          }}
        />
      </motion.div>

      <motion.div
        className="over-image relative w-full px-[clamp(1.25rem,5vw,6rem)] pb-[clamp(4rem,10vh,7rem)] pt-[clamp(8rem,20vh,14rem)]"
        style={reduced ? undefined : { y: rise }}
      >
        <p className="ty-mono" style={{ color: "#C9A59F", letterSpacing: "var(--tracking-luxe-widest)" }}>
          {craft.label} · {piece.name} · one of one
        </p>

        {/* Two lines at the monument step. Masked, not faded, and revealed by
            position rather than an observer — see useReveal. */}
        <h2 className="mt-[clamp(1.5rem,3vh,2.5rem)]" style={{ margin: 0, color: "#F3EDE9" }}>
          <span className="sr-only">Nothing here was made twice.</span>
          <span ref={lineRef} aria-hidden="true" className="block">
            {["Nothing here", "was made twice."].map((line, i) => (
              <span key={line} className="block overflow-hidden" style={{ paddingBottom: "0.06em", marginBottom: "-0.06em" }}>
                <motion.span
                  className={`ty-monument block ${i === 1 ? "italic" : ""}`}
                  style={{ paddingLeft: i === 1 ? "6vw" : 0, willChange: "transform" }}
                  initial={reduced ? false : { y: "110%" }}
                  animate={reduced || shown ? { y: "0%" } : undefined}
                  transition={{ duration: 1.1, ease: [0.32, 0.72, 0, 1], delay: i * 0.14 }}
                >
                  {line}
                </motion.span>
              </span>
            ))}
          </span>
        </h2>

        <div className="mt-[clamp(2.5rem,6vh,4rem)] flex flex-wrap items-end justify-between gap-6">
          <CtaPair
            tone="#F3EDE9"
            ground="#0F0E0C"
            primary={{ href: "/collection", label: "See the collection" }}
            secondary={{ href: "/about", label: "About the shop" }}
          />
          <p className="ty-mono hidden md:block" style={{ color: "#F3EDE9", opacity: 0.4, margin: 0 }}>
            Chandigarh · Punjab · India
          </p>
        </div>
      </motion.div>
    </section>
  );
}
