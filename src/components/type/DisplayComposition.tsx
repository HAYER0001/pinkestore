"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { useReveal } from "./useReveal";

/**
 * OVERSIZED TYPOGRAPHIC COMPOSITION.
 *
 * The difference between a heading and a composition is that a composition has
 * INTERNAL hierarchy: lines at different sizes, deliberate indents, one word
 * carrying the weight. A single string at one size is a heading no matter how
 * large you set it.
 *
 * Lines are declared individually so each can take its own scale and offset.
 * Every line rides up out of its own mask — never a fade.
 */

const SETTLE = { type: "spring", stiffness: 70, damping: 20, mass: 1.5 } as const;

export type CompLine = {
  text: string;
  /** which step of the scale this line sits on */
  scale?: "colossal" | "hero" | "display" | "title";
  /** indent as a fraction of the container, e.g. 0.18 */
  indent?: number;
  /** italic display face, for the softer line in a pair */
  italic?: boolean;
  tone?: string;
};

const CLASS: Record<NonNullable<CompLine["scale"]>, string> = {
  colossal: "ty-colossal",
  hero: "ty-hero",
  display: "ty-display",
  title: "ty-title",
};

export function DisplayComposition({
  lines,
  as: Tag = "h2",
  className,
  style,
  delay = 0,
  align = "left",
}: {
  lines: CompLine[];
  as?: "h1" | "h2" | "h3";
  className?: string;
  style?: React.CSSProperties;
  delay?: number;
  align?: "left" | "center";
}) {
  const reduced = useReducedMotion();
  const plain = lines.map((l) => l.text).join(" ");
  /* ONE observer, on the unclipped wrapper — not on each mask, and never on
     the moving span inside it. See useReveal for why that distinction is the
     whole ballgame. Variants then propagate down through the masks. */
  const [ref, shown] = useReveal<HTMLSpanElement>(0.15);

  /* The font belongs on the element, not only on the line spans. The sr-only
     string and anything else a consumer nests here should be the display face
     too, and "is the h1 set in the display serif" should be answerable by
     looking at the h1. */
  const tagStyle: React.CSSProperties = {
    margin: 0,
    fontFamily: "var(--font-display)",
    ...style,
  };

  /* REDUCED MOTION GETS PLAIN TEXT — no masks, no variants, no observer.
     Not a courtesy: `animate="hidden"` parks each line at y:112% inside an
     overflow-hidden mask, so leaving the animated structure in place and
     merely skipping the transition renders the whole headline as blank space
     for exactly the people least able to work out why. The line breaks are
     the composition and they stay; only the motion goes. */
  if (reduced) {
    return (
      <Tag className={className} style={tagStyle}>
        {lines.map((line, i) => (
          <span
            key={`${line.text}-${i}`}
            className={`${CLASS[line.scale ?? "hero"]} block`}
            style={{
              color: line.tone ?? "inherit",
              fontStyle: line.italic ? "italic" : undefined,
              paddingLeft: align === "left" && line.indent ? `${line.indent * 100}%` : undefined,
              textAlign: align,
            }}
          >
            {line.text}
          </span>
        ))}
      </Tag>
    );
  }

  return (
    <Tag className={className} style={tagStyle}>
      {/* Screen readers get one clean string. A line-per-span structure is
          otherwise announced with a pause between every fragment. */}
      <span className="sr-only">{plain}</span>

      <motion.span
        ref={ref}
        aria-hidden="true"
        className="block"
        initial="hidden"
        animate={shown ? "shown" : "hidden"}
      >
        {lines.map((line, i) => (
          <motion.span
            key={`${line.text}-${i}`}
            className="block overflow-hidden"
            style={{
              paddingLeft: align === "left" && line.indent ? `${line.indent * 100}%` : undefined,
              textAlign: align,
              /* the mask must clear descenders of a display face at 12rem */
              paddingBottom: "0.08em",
              marginBottom: "-0.08em",
            }}
          >
            <motion.span
              className={`${CLASS[line.scale ?? "hero"]} block`}
              style={{
                color: line.tone ?? "inherit",
                fontStyle: line.italic ? "italic" : undefined,
                willChange: "transform",
              }}
              variants={{
                hidden: { y: "112%" },
                shown: { y: "0%", transition: { ...SETTLE, delay: delay + i * 0.09 } },
              }}
            >
              {line.text}
            </motion.span>
          </motion.span>
        ))}
      </motion.span>
    </Tag>
  );
}

/** A standfirst that belongs to a composition rather than floating after it. */
export function Standfirst({
  children,
  tone,
  className,
  style,
  delay = 0,
}: {
  children: ReactNode;
  tone?: string;
  className?: string;
  style?: React.CSSProperties;
  delay?: number;
}) {
  const reduced = useReducedMotion();
  const [ref, shown] = useReveal<HTMLParagraphElement>(0.3);
  return (
    <motion.p
      ref={ref}
      className={`ty-lede measure-lede ${className ?? ""}`}
      style={{ color: tone, ...style }}
      initial={reduced ? false : { opacity: 0, y: 14 }}
      animate={shown ? { opacity: 1, y: 0 } : undefined}
      transition={{ ...SETTLE, delay }}
    >
      {children}
    </motion.p>
  );
}
