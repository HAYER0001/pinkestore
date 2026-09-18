"use client";

import { motion, useReducedMotion } from "motion/react";
import { useReveal } from "@/components/type/useReveal";
/* A bare ElementType is too wide for TS to resolve the children prop — it
   collapses to `never`. A narrow union of the tags we actually use keeps it
   type-safe without a cast. */
type TextTag = "h1" | "h2" | "h3" | "h4" | "p" | "div" | "span";

/**
 * CINEMATIC TEXT
 *
 * Each word sits in its own overflow-hidden box and rides up from y:100%.
 * Never a fade — a fade is a dissolve, this is ink rising through heavy paper.
 *
 * ACCESSIBILITY: the split is purely visual. Screen readers get the intact
 * string from an sr-only node and the animated spans are aria-hidden;
 * otherwise a word-per-span structure is announced one word at a time with
 * pauses, which is miserable to listen to.
 */

const HEAVY = { type: "spring", stiffness: 70, damping: 20, mass: 1.5 } as const;

export function CinematicText({
  text,
  as: Tag = "h2",
  className,
  style,
  delay = 0,
  stagger = 0.055,
  /* Reveals are one-way now: useReveal disconnects on first fire and never
     re-hides. Re-hiding text the reader has already read is not a thing this
     site should ever do, so there is no `once={false}` to offer. */
  /* 0.4 meant a headline sitting low in a short viewport never crossed the
     threshold and stayed hidden forever. 0.15 fires as soon as the first line
     is genuinely on screen. */
  amount = 0.15,
}: {
  text: string;
  as?: TextTag;
  className?: string;
  style?: React.CSSProperties;
  delay?: number;
  stagger?: number;
  amount?: number;
}) {
  const reduced = useReducedMotion();
  const words = text.split(" ");
  /* One observer on the unclipped wrapper. Watching the moving spans instead
     is a deadlock (they start outside their own mask, so they report 0%
     visible and never get the callback that would bring them back), and
     whileInView alone leaves the text hidden forever for anyone who arrives
     already scrolled past it. See useReveal. */
  const [ref, shown] = useReveal<HTMLSpanElement>(amount);

  if (reduced) {
    return <Tag className={className} style={style}>{text}</Tag>;
  }

  return (
    <Tag className={className} style={style}>
      <span className="sr-only">{text}</span>
      <motion.span
        ref={ref}
        aria-hidden="true"
        animate={shown ? "shown" : "hidden"}
      >
        {words.map((word, i) => (
          <motion.span
            key={`${word}-${i}`}
            style={{
              display: "inline-block",
              overflow: "hidden",
              verticalAlign: "bottom",
              /* the mask must clear descenders and the negative tracking of a
                 display face, or the tops of letters get guillotined */
              paddingRight: "0.26em",
              paddingBottom: "0.12em",
              marginBottom: "-0.12em",
            }}
          >
            <motion.span
              style={{ display: "inline-block", willChange: "transform" }}
              initial={{ y: "115%" }}
              variants={{
                hidden: { y: "115%" },
                shown: { y: "0%", transition: { ...HEAVY, delay: delay + i * stagger } },
              }}
            >
              {word}
            </motion.span>
          </motion.span>
        ))}
      </motion.span>
    </Tag>
  );
}
