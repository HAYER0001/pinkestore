"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { PRODUCTS, CRAFTS } from "@/lib/catalog";
import { getShots, altFor } from "@/lib/shots";
import { DisplayComposition, Standfirst } from "@/components/type/DisplayComposition";
import { CinematicText } from "@/components/dom/CinematicText";
import { CtaPair } from "@/components/site/Cta";
import { useReveal } from "@/components/type/useReveal";

/**
 * 05 · THE EXHIBITION WALL.
 *
 * The "Making" copy, restaged. It was a centred column on cream — correct
 * words, template composition. Here it is one full-bleed macro of the work
 * (the sozni stitch, close enough to see the floss) as a museum wall, the
 * composition set across it, and a wall label in the corner naming the piece
 * the way a gallery names a loan.
 *
 * The macro is the only image on the page shown WITHOUT a frame or an edge:
 * it runs to the viewport on all four sides. That is what makes it a wall
 * rather than a picture of one.
 *
 * Same copy as before, in the same order. "What you are buying is someone's
 * winter" moves here from the old closing — it is the standfirst this wall
 * always needed, and the closing now belongs to a different line.
 */
export function ExhibitionWall() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const piece = PRODUCTS.find((p) => p.craft === "sozni-hand-embroidered")!;
  const craft = CRAFTS[piece.craft];
  const shot = getShots(piece.slug).find((s) => s.kind === "macro") ?? getShots(piece.slug)[0];

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const scale = useTransform(scrollYProgress, [0, 1], [1.1, 1]);
  const y = useTransform(scrollYProgress, [0, 1], ["-6%", "6%"]);
  const [maskRef, shown] = useReveal<HTMLDivElement>(0.2);

  return (
    <section
      ref={ref}
      id="craft"
      data-chrome="dark"
      className="relative min-h-[120svh] overflow-hidden scroll-mt-24"
      style={{ background: "#1A1A1A" }}
    >
      {/* the wall */}
      <motion.div className="absolute inset-0" style={reduced ? undefined : { y }}>
        <motion.div className="relative h-full w-full" style={reduced ? undefined : { scale }}>
          {shot && (
            <Image
              src={shot.src}
              alt={altFor(piece, shot)}
              fill
              sizes="100vw"
              quality={88}
              className="object-cover"
            />
          )}
        </motion.div>
        {/* darken toward the type; the stitch stays legible at the top */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(26,26,26,0.15) 0%, rgba(26,26,26,0.62) 50%, rgba(26,26,26,0.9) 100%)",
          }}
        />
      </motion.div>

      {/* the mask that lifts to reveal the wall, once */}
      {!reduced && (
        <motion.div
          ref={maskRef}
          aria-hidden
          className="absolute inset-0 z-[1]"
          style={{ background: "#1A1A1A", transformOrigin: "bottom center" }}
          initial={{ scaleY: 1 }}
          animate={shown ? { scaleY: 0 } : undefined}
          transition={{ duration: 1.3, ease: [0.32, 0.72, 0, 1] }}
        />
      )}

      {/* wall label — top left, like a loan card */}
      <div className="over-image absolute left-[clamp(1.25rem,4vw,4rem)] top-[clamp(1.5rem,4vh,3rem)] z-[2]">
        <p className="ty-mono" style={{ color: "#C9A59F", margin: 0 }}>
          The Making
        </p>
        <p className="ty-mono" style={{ color: "#FAF8F5", opacity: 0.55, margin: "0.3rem 0 0" }}>
          {piece.name} · {craft.label} · {shot?.frame}
        </p>
      </div>

      {/* the composition, across the lower half of the wall */}
      <div className="over-image relative z-[2] flex min-h-[120svh] flex-col justify-end px-[clamp(1.25rem,5vw,6rem)] pb-[clamp(4rem,10vh,8rem)]">
        <DisplayComposition
          as="h2"
          lines={[
            { text: "What you are buying", scale: "display" },
            { text: "is someone's winter", scale: "display", italic: true, indent: 0.08 },
          ]}
          style={{ color: "#FAF8F5" }}
        />

        <div className="mt-[clamp(2rem,4vh,3rem)] grid gap-[clamp(2rem,4vw,5rem)] lg:grid-cols-2">
          <Standfirst tone="#E7DDD4">
            Months of one person&rsquo;s hands, and the fact that they will never
            spend them the same way twice. When a piece is finished they begin
            something else, and it is different. That is the whole business.
          </Standfirst>

          <div>
            <CinematicText
              as="p"
              text="A sozni shawl can hold a year of one person's hands. A kani weave advances one pass at a time against a coded talim. We do not restock, because the next piece will be different."
              className="ty-read measure-read"
              style={{ color: "#FAF8F5", opacity: 0.72 }}
              delay={0.2}
              stagger={0.018}
            />
            <CtaPair
              className="mt-[clamp(2rem,4vh,3rem)]"
              tone="#FAF8F5"
              ground="#1A1A1A"
              primary={{ href: "/craft", label: "All four techniques" }}
              secondary={{ href: "/collection", label: "See what is in stock" }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
