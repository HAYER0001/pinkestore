"use client";

import { motion, useReducedMotion } from "motion/react";
import { useReveal } from "@/components/type/useReveal";

/**
 * THE THREAD — the signature device.
 *
 * A single hairline with slack in it, the way a thread lies when it is laid
 * down rather than pulled taut. It is the one mark that repeats everywhere:
 * under section headings, between chapters, through the preloader, along the
 * footer. A brand device earns its keep by recurring, not by being elaborate.
 *
 * The curve is a shallow catenary, never a straight rule. A straight line is a
 * border; a line with slack is a thread.
 */
export function ThreadRule({
  width = "100%",
  tone = "currentColor",
  weight = 1,
  slack = 5,
  animate = true,
  className,
}: {
  width?: number | string;
  tone?: string;
  weight?: number;
  /** vertical droop in px — 0 makes it a plain rule, which defeats the point */
  slack?: number;
  animate?: boolean;
  className?: string;
}) {
  const reduced = useReducedMotion();
  /* Fail-visible: see useReveal. A reader who arrives already past this rule
     would otherwise never see it draw, and it would sit at opacity 0 forever. */
  const [ref, shown] = useReveal<SVGSVGElement>(0.6);
  const h = slack + weight * 4;
  const d = `M 0 ${weight * 2} C 260 ${weight * 2 + slack}, 740 ${weight * 2 + slack}, 1000 ${weight * 2}`;

  const draw =
    animate && !reduced
      ? {
          initial: { pathLength: 0, opacity: 0 },
          animate: shown ? { pathLength: 1, opacity: 1 } : undefined,
          transition: { duration: 1.1, ease: [0.32, 0.72, 0, 1] as const },
        }
      : {};

  return (
    <svg
      ref={ref}
      aria-hidden
      className={className}
      width={width}
      height={h}
      viewBox={`0 0 1000 ${h}`}
      preserveAspectRatio="none"
      fill="none"
      style={{ display: "block", overflow: "visible" }}
    >
      <motion.path
        d={d}
        stroke={tone}
        strokeWidth={weight}
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        {...draw}
      />
    </svg>
  );
}

/**
 * A knot to terminate a thread — used where a section ends rather than
 * continues, so the device has punctuation as well as a line.
 */
export function ThreadKnot({
  size = 14,
  tone = "currentColor",
  className,
}: {
  size?: number;
  tone?: string;
  className?: string;
}) {
  return (
    <svg
      aria-hidden
      width={size}
      height={size}
      viewBox="0 0 14 14"
      fill="none"
      className={className}
    >
      <path
        d="M1 7c2.6-3.4 4.4 3.4 6.6 0C9.4 4.2 11 5.6 13 7"
        stroke={tone}
        strokeWidth={1}
        strokeLinecap="round"
      />
    </svg>
  );
}
