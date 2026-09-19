"use client";

import { useRef, type ReactNode } from "react";
import Link from "next/link";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { PRODUCTS, CRAFTS, formatINR, type Craft } from "@/lib/catalog";
import { getShots, altFor, type Shot } from "@/lib/shots";
import { MaskedImage } from "@/components/site/MaskedImage";
import { DisplayComposition } from "@/components/type/DisplayComposition";
import { RevealIn } from "@/components/type/useReveal";
import { SecondaryCta } from "@/components/site/Cta";

/**
 * 03 · THE CRAFT CHAPTERS.
 *
 * Four techniques, four compositions. The brief's one hard rule for this
 * section is that they must not read as four copies of one layout — and the
 * previous homepage's failure was exactly that: every section was a centred
 * column with an eyebrow, a two-line heading and a standfirst.
 *
 * So the chapters share a SHELL (id, ground, ink, the metadata line, the
 * parallax driver) and nothing else. Image scale, alignment, where the type
 * sits relative to the photograph, how much of the viewport is empty — each
 * is decided per chapter, and each is the opposite of its neighbour on at
 * least one axis:
 *
 *   Mithila   image left, 55vw   type crosses the image's right edge   warm
 *   Kashmir   image right, tall  type top-left, most whitespace         cool
 *   Jamawar   image full-bleed   type ON the image                      dark
 *   Kairi     image a hard panel type stacked vertically beside it      black
 *
 * MOTION is the same restrained pair everywhere: the photograph arrives under
 * a mask (MaskedImage) and thereafter drifts against the headline at 0.85x
 * while the headline drifts at 1x. Linear, no spring — a chapter is a wall,
 * not a widget.
 */

type ChapterProps = {
  id: string;
  craft: Craft;
  chrome: "light" | "dark";
  ground: string;
  ink: string;
  accent: string;
  numeral: string;
  children: ReactNode;
};

/** Shared shell: ground, ink, metadata, parallax driver. Nothing about layout. */
function Chapter({ id, craft, chrome, ground, ink, accent, numeral, children }: ChapterProps) {
  const ref = useRef<HTMLElement>(null);
  const c = CRAFTS[craft];
  return (
    <section
      ref={ref}
      id={id}
      data-chrome={chrome}
      data-chapter={craft}
      className="relative overflow-hidden scroll-mt-24"
      style={{ background: ground, color: ink, ["--accent" as string]: accent }}
    >
      {/* the museum label: top-left, small, uppercase, separate from the type */}
      <div className="absolute left-[clamp(1.25rem,4vw,4rem)] top-[clamp(1.5rem,4vh,3rem)] z-10 flex flex-wrap items-baseline gap-x-5 gap-y-1">
        <span className="ty-mono" style={{ color: accent }}>
          {numeral}
        </span>
        <span className="ty-mono" style={{ color: ink, opacity: 0.7 }}>
          {c.label}
        </span>
        <span className="ty-mono" style={{ color: ink, opacity: 0.45 }}>
          {c.region}
        </span>
        {!c.handmade && (
          <span className="ty-mono" style={{ color: accent }}>
            printed, not handmade
          </span>
        )}
      </div>
      {children}
    </section>
  );
}

/** Linear parallax pair: image drifts slower than the page, type faster. */
function useDrift(ref: React.RefObject<HTMLElement | null>) {
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const image = useTransform(scrollYProgress, [0, 1], ["6%", "-6%"]);
  const type = useTransform(scrollYProgress, [0, 1], ["10%", "-10%"]);
  const grow = useTransform(scrollYProgress, [0, 1], [1.04, 1]);
  return reduced ? { image: undefined, type: undefined, grow: undefined } : { image, type, grow };
}

function pieceFor(craft: Craft) {
  return PRODUCTS.find((p) => p.craft === craft)!;
}
function shotFor(craft: Craft, kind: Shot["kind"], fallback = 0) {
  const p = pieceFor(craft);
  const shots = getShots(p.slug);
  return shots.find((s) => s.kind === kind) ?? shots[fallback];
}

/* ====================================================================== */
/*  MITHILA — warm ivory / terracotta. Image left at 55vw, headline breaks
    across its right edge, copy right and low.                             */
/* ====================================================================== */
function ChapterMithila() {
  const ref = useRef<HTMLDivElement>(null);
  const d = useDrift(ref);
  const craft: Craft = "madhubani-hand-painted";
  const p = pieceFor(craft);
  const shot = shotFor(craft, "macro", 0);

  return (
    <Chapter
      id="mithila"
      craft={craft}
      chrome="light"
      ground="var(--ch-mithila-ground)"
      ink="var(--ch-mithila-ink)"
      accent="var(--ch-mithila-accent)"
      numeral="०२"
    >
      <div ref={ref} className="relative grid min-h-[100svh] grid-cols-1 items-end pb-[clamp(3rem,8vh,6rem)] pt-[clamp(6rem,14vh,10rem)] lg:grid-cols-[55vw_1fr] lg:items-center lg:pt-0">
        {/* the painting, left, bleeding off the left edge */}
        <motion.div className="relative -ml-[6vw] lg:ml-0" style={{ y: d.image }}>
          <motion.div className="relative" style={{ scale: d.grow, transformOrigin: "50% 50%" }}>
            <MaskedImage
              src={shot.src}
              alt={altFor(p, shot)}
              ratio="4 / 5"
              sizes="(max-width: 1024px) 100vw, 55vw"
              ground="var(--ch-mithila-ground)"
              className="w-[92vw] lg:w-full"
            />
            {/* phone only: the foot of the macro dissolves into the ground so
                the headline that overlaps it sits on ivory, not on the
                figures — dark ink on the purple robes was unreadable */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 bottom-0 h-[38%] lg:hidden"
              style={{ background: "linear-gradient(0deg, var(--ch-mithila-ground) 0%, rgba(244,237,226,0) 100%)" }}
            />
          </motion.div>
        </motion.div>

        {/* the headline crosses the image's right edge */}
        <motion.div
          className="over-image relative -mt-[11vw] px-[clamp(1.25rem,5vw,6rem)] lg:-ml-[16vw] lg:mt-0"
          style={{ y: d.type }}
        >
          <DisplayComposition
            as="h2"
            lines={[
              { text: "Painted,", scale: "colossal" },
              { text: "not printed", scale: "hero", italic: true, indent: 0.1 },
            ]}
            style={{ color: "var(--ch-mithila-ink)" }}
          />
          <RevealIn delay={0.2} className="mt-[clamp(1.5rem,3vh,2.5rem)] lg:ml-[18vw]">
            <p className="ty-read measure-lede" style={{ color: "var(--ch-mithila-ink)", opacity: 0.78, margin: 0 }}>
              {CRAFTS[craft].technique} No pencil underneath. No second attempt.
            </p>
            <PieceLine slug={p.slug} ink="var(--ch-mithila-ink)" accent="var(--ch-mithila-accent)" />
          </RevealIn>
        </motion.div>
      </div>
    </Chapter>
  );
}

/* ====================================================================== */
/*  KASHMIR — cool ivory / stone. Reversed: macro right and tall, headline
    top-left at 9vw, narrow copy beneath, the most empty of the four.      */
/* ====================================================================== */
function ChapterKashmir() {
  const ref = useRef<HTMLDivElement>(null);
  const d = useDrift(ref);
  const craft: Craft = "sozni-hand-embroidered";
  const p = pieceFor(craft);
  const shot = shotFor(craft, "macro", 0);

  return (
    <Chapter
      id="kashmir"
      craft={craft}
      chrome="light"
      ground="var(--ch-kashmir-ground)"
      ink="var(--ch-kashmir-ink)"
      accent="var(--ch-kashmir-accent)"
      numeral="०३"
    >
      <div ref={ref} className="relative grid min-h-[110svh] grid-cols-1 lg:grid-cols-[1fr_38vw]">
        {/* type first, high, with a whole field of nothing under it */}
        <motion.div
          className="over-image relative px-[clamp(1.25rem,5vw,6rem)] pb-[clamp(2rem,6vh,4rem)] pt-[clamp(7rem,18vh,12rem)] lg:pt-[22vh]"
          style={{ y: d.type }}
        >
          <DisplayComposition
            as="h2"
            lines={[
              { text: "Months,", scale: "colossal" },
              { text: "not minutes", scale: "display", italic: true },
            ]}
            style={{ color: "var(--ch-kashmir-ink)" }}
          />
          <RevealIn delay={0.2} className="mt-[clamp(2rem,5vh,4rem)] max-w-[34ch]">
            <p className="ty-read" style={{ color: "var(--ch-kashmir-ink)", opacity: 0.74, margin: 0 }}>
              One sozni shawl can hold a year of someone&rsquo;s hands. {CRAFTS[craft].technique}
            </p>
            <PieceLine slug={p.slug} ink="var(--ch-kashmir-ink)" accent="var(--ch-kashmir-accent)" />
          </RevealIn>
        </motion.div>

        {/* the stitch, right, taller than the viewport, cropped at both ends */}
        <motion.div className="relative -mr-[4vw] mt-[-6vw] lg:mr-0 lg:mt-0" style={{ y: d.image }}>
          <motion.div className="relative lg:h-[110svh]" style={{ scale: d.grow, transformOrigin: "50% 50%" }}>
            <MaskedImage
              src={shot.src}
              alt={altFor(p, shot)}
              ratio="3 / 4"
              sizes="(max-width: 1024px) 100vw, 38vw"
              ground="var(--ch-kashmir-ground)"
              className="ml-auto w-[88vw] lg:h-full lg:w-full"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 h-[30%] lg:hidden"
              style={{ background: "linear-gradient(180deg, var(--ch-kashmir-ground) 0%, rgba(242,241,238,0) 100%)" }}
            />
          </motion.div>
        </motion.div>
      </div>
    </Chapter>
  );
}

/* ====================================================================== */
/*  JAMAWAR — indigo / charcoal. The dark chapter. Full-bleed loom texture as
    the ground, headline in ivory ON it, one line of copy.                  */
/* ====================================================================== */
function ChapterJamawar() {
  const ref = useRef<HTMLDivElement>(null);
  const d = useDrift(ref);
  const craft: Craft = "jamawar-kani";
  const p = pieceFor(craft);
  const shot = shotFor(craft, "texture", 0);

  return (
    <Chapter
      id="jamawar"
      craft={craft}
      chrome="dark"
      ground="var(--ch-jamawar-ground)"
      ink="var(--ch-jamawar-ink)"
      accent="var(--ch-jamawar-accent)"
      numeral="०४"
    >
      <div ref={ref} className="relative min-h-[120svh]">
        {/* the weave is the wall */}
        <motion.div className="absolute inset-0" style={{ y: d.image }}>
          <motion.div className="h-full w-full" style={{ scale: d.grow, transformOrigin: "50% 50%" }}>
            <MaskedImage
              src={shot.src}
              alt={altFor(p, shot)}
              ratio="auto"
              sizes="100vw"
              ground="var(--ch-jamawar-ground)"
              className="h-full w-full"
            />
          </motion.div>
          {/* indigo over the weave so the type has a ground; the image stays
              readable through it, which is the point of a dark chapter */}
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(21,26,51,0.55) 0%, rgba(21,26,51,0.2) 40%, rgba(21,26,51,0.7) 100%)",
            }}
          />
        </motion.div>

        <motion.div
          className="over-image relative flex min-h-[120svh] flex-col justify-end px-[clamp(1.25rem,5vw,6rem)] pb-[clamp(4rem,10vh,8rem)]"
          style={{ y: d.type }}
        >
          <DisplayComposition
            as="h2"
            lines={[
              { text: "One pass", scale: "colossal" },
              { text: "at a time", scale: "hero", italic: true, indent: 0.22 },
            ]}
            style={{ color: "var(--ch-jamawar-ink)" }}
          />
          <RevealIn delay={0.2} className="mt-[clamp(1.5rem,3vh,2.5rem)] max-w-[40ch] lg:ml-[22vw]">
            <p className="ty-read" style={{ color: "var(--ch-jamawar-ink)", opacity: 0.8, margin: 0 }}>
              Small wooden spools, a coded talim, no shortcut. {CRAFTS[craft].technique}
            </p>
            <PieceLine slug={p.slug} ink="var(--ch-jamawar-ink)" accent="var(--ch-jamawar-accent)" />
          </RevealIn>
        </motion.div>
      </div>
    </Chapter>
  );
}

/* ====================================================================== */
/*  KAIRI — black / muted pink. Graphic and editorial: the full flat as a
    hard-edged panel at 40vw, the headline stacked vertically beside it.    */
/* ====================================================================== */
function ChapterKairi() {
  const ref = useRef<HTMLDivElement>(null);
  const d = useDrift(ref);
  const craft: Craft = "kairi-print";
  const p = pieceFor(craft);
  const shot = shotFor(craft, "full", 0);

  return (
    <Chapter
      id="kairi"
      craft={craft}
      chrome="dark"
      ground="var(--ch-kairi-ground)"
      ink="var(--ch-kairi-ink)"
      accent="var(--ch-kairi-accent)"
      numeral="०५"
    >
      <div ref={ref} className="relative grid min-h-[100svh] grid-cols-1 items-center gap-[clamp(2rem,4vw,4rem)] px-[clamp(1.25rem,5vw,6rem)] pb-[clamp(7rem,16vh,10rem)] pt-[clamp(9rem,20vh,12rem)] lg:grid-cols-[auto_40vw_1fr] lg:py-[clamp(7rem,16vh,10rem)]">
        {/* vertical headline — reads bottom-to-top beside the panel on lg;
            horizontal above it on a phone */}
        <motion.div className="over-image relative lg:[writing-mode:vertical-rl] lg:rotate-180" style={{ y: d.type }}>
          <h2
            className="ty-wall"
            style={{ color: "var(--ch-kairi-accent)", margin: 0, whiteSpace: "nowrap" }}
          >
            Loud, <em style={{ fontStyle: "italic" }}>worn quietly</em>
          </h2>
        </motion.div>

        {/* the panel: a hard rectangle, no bleed, no border — a print behaves
            like a graphic and is shown like one */}
        <motion.div className="relative" style={{ y: d.image }}>
          <motion.div style={{ scale: d.grow, transformOrigin: "50% 50%" }}>
            <MaskedImage
              src={shot.src}
              alt={altFor(p, shot)}
              ratio="3 / 4"
              sizes="(max-width: 1024px) 92vw, 40vw"
              ground="var(--ch-kairi-ground)"
            />
          </motion.div>
        </motion.div>

        <RevealIn delay={0.2} className="max-w-[34ch] lg:self-end lg:pb-[6vh]">
          <p className="ty-read" style={{ color: "var(--ch-kairi-ink)", opacity: 0.74, margin: 0 }}>
            {CRAFTS[craft].technique} It is in the collection because it is a
            good piece of cloth at a fair price, and it says printed wherever it
            appears.
          </p>
          <PieceLine slug={p.slug} ink="var(--ch-kairi-ink)" accent="var(--ch-kairi-accent)" />
        </RevealIn>
      </div>
    </Chapter>
  );
}

/** The one piece behind the chapter: name, price, a way in. Essential metadata only. */
function PieceLine({ slug, ink, accent }: { slug: string; ink: string; accent: string }) {
  const p = PRODUCTS.find((x) => x.slug === slug);
  if (!p) return null;
  return (
    <div className="mt-[clamp(1.5rem,3vh,2.25rem)] flex flex-wrap items-baseline gap-x-6 gap-y-2">
      <Link href={`/product/${p.slug}`} className="ty-title" style={{ color: ink, textDecoration: "none" }}>
        {p.name}
      </Link>
      <span className="ty-mono" style={{ color: accent }}>
        {formatINR(p.pricePaise)}
      </span>
      <span className="ty-mono" style={{ color: ink, opacity: 0.5 }}>
        {p.stock === 1 ? "one of one" : `${p.stock} available`}
      </span>
      <SecondaryCta href={`/product/${p.slug}`} tone={ink}>
        View piece
      </SecondaryCta>
    </div>
  );
}

export function CraftChapters() {
  return (
    <>
      <ChapterMithila />
      <ChapterKashmir />
      <ChapterJamawar />
      <ChapterKairi />
    </>
  );
}
