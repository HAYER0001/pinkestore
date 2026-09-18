"use client";

import { motion, useReducedMotion } from "motion/react";
import { ThreadRule, ThreadKnot } from "@/components/brand/ThreadRule";
import { useReveal } from "./useReveal";

/**
 * PULL QUOTE.
 *
 * One statement, given a whole band of the page. The rule it has to earn: it
 * must be a CLAIM, not a summary of the section it sits between. A pull quote
 * that restates the paragraph above it is decoration; one that says something
 * the prose cannot is punctuation.
 *
 * Bracketed by the thread device, so the brand mark does the quoting instead
 * of a pair of typographic quote marks — which would be the generic choice.
 */

const SETTLE = { type: "spring", stiffness: 70, damping: 20, mass: 1.5 } as const;

export function PullQuote({
  children,
  attribution,
  tone = "#1A1A1A",
  threadTone,
  ground,
  className,
}: {
  children: string;
  attribution?: string;
  tone?: string;
  threadTone?: string;
  ground?: string;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const thread = threadTone ?? tone;
  const [ref, shown] = useReveal<HTMLParagraphElement>(0.4);

  return (
    <figure
      className={`relative ${className ?? ""}`}
      style={{ background: ground, margin: 0 }}
    >
      <div className="mx-auto max-w-[1100px] px-[clamp(1rem,5vw,4rem)] py-[clamp(4rem,11vh,9rem)]">
        <ThreadRule tone={thread} slack={5} className="mb-[clamp(2rem,5vh,4rem)]" />

        <blockquote style={{ margin: 0 }}>
          <motion.p
            ref={ref}
            className="ty-quote measure-read"
            style={{ color: tone }}
            initial={reduced ? false : { opacity: 0, y: 18 }}
            animate={shown ? { opacity: 1, y: 0 } : undefined}
            transition={SETTLE}
          >
            {children}
          </motion.p>
        </blockquote>

        {attribution && (
          <figcaption
            className="ty-mono mt-[clamp(1.5rem,3vh,2.5rem)] flex items-center gap-3"
            style={{ color: tone, opacity: 0.6 }}
          >
            <ThreadKnot tone={thread} size={13} />
            {attribution}
          </figcaption>
        )}

        <ThreadRule tone={thread} slack={5} className="mt-[clamp(2rem,5vh,4rem)]" />
      </div>
    </figure>
  );
}
