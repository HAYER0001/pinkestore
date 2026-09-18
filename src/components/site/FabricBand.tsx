"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { PRODUCTS, CRAFTS } from "@/lib/catalog";
import { heroImage } from "@/lib/shots";

/**
 * FABRIC-LIKE HORIZONTAL MOVEMENT (item 77).
 *
 * A band of cloth that travels sideways as the page travels down. Not a
 * marquee: a marquee moves on a timer and therefore moves while you are still,
 * which reads as an advertisement. This is driven entirely by scroll position,
 * so it is under the reader's hand — stop scrolling and the cloth stops.
 *
 * The strip is SKEWED very slightly against its own direction of travel. That
 * is the whole trick, and it is worth explaining: a rigid rectangle sliding
 * horizontally reads as a filmstrip, but a few degrees of lag at the trailing
 * edge reads as a length of fabric being drawn across a table, because that is
 * what cloth does when you pull it.
 *
 * The images are duplicated once so the strip is continuous, and the duplicate
 * is aria-hidden — a screen reader should hear five pieces, not ten.
 */

export function FabricBand() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  /* Spring the driver, not the output, so the skew and the travel stay in
     step — two springs would converge at different rates and the cloth would
     visibly shear away from its own edge. */
  const drive = useSpring(scrollYProgress, { stiffness: 90, damping: 30, mass: 0.7 });
  const x = useTransform(drive, [0, 1], ["2%", "-38%"]);
  const skew = useTransform(drive, [0, 0.5, 1], [-1.6, 0, 1.6]);

  const row = [...PRODUCTS, ...PRODUCTS];

  return (
    <section
      ref={ref}
      data-fabric-band
      aria-label="The pieces, in passing"
      className="relative overflow-hidden py-[clamp(3rem,9vh,6rem)]"
      style={{ background: "#1A1A1A" }}
    >
      <motion.div
        className="flex w-max gap-[clamp(0.75rem,1.6vw,1.5rem)]"
        style={reduced ? undefined : { x, skewY: skew }}
      >
        {row.map((p, i) => {
          const dup = i >= PRODUCTS.length;
          const craft = CRAFTS[p.craft];
          const hero = heroImage(p);
          return (
            <Link
              key={`${p.slug}-${i}`}
              href={`/product/${p.slug}`}
              aria-hidden={dup}
              tabIndex={dup ? -1 : undefined}
              className="group relative block shrink-0"
              style={{
                width: "clamp(180px, 22vw, 320px)",
                aspectRatio: "3 / 4",
                textDecoration: "none",
              }}
            >
              <Image
                src={hero.src}
                alt={dup ? "" : `${p.name} — ${craft.label}`}
                fill
                sizes="(max-width: 768px) 46vw, 320px"
                quality={80}
                className="object-cover"
              />
              {!dup && (
                <span
                  className="ty-mono absolute bottom-0 left-0"
                  style={{ background: "rgba(26,26,26,0.88)", color: "#FAF8F5", padding: "0.45rem 0.8rem" }}
                >
                  {p.name}
                </span>
              )}
            </Link>
          );
        })}
      </motion.div>
    </section>
  );
}
