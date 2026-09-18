"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { useReveal } from "@/components/type/useReveal";

/**
 * MASKED IMAGE REVEAL (item 73).
 *
 * The image does not fade in. A mask lifts off it, and the photograph beneath
 * is already fully opaque the whole time.
 *
 * The difference matters more than it sounds. A fade renders a half-present
 * ghost for 600ms — the piece looks washed out, which on a shop selling colour
 * and thread is actively misleading. A mask that travels shows a smaller
 * amount of correct image instead of a full amount of wrong one.
 *
 * The photograph also drifts up very slightly BEHIND the mask, so the two edges
 * move at different rates. Without that it reads as a wipe transition; with it,
 * it reads as cloth being drawn back.
 */

const EASE = [0.32, 0.72, 0, 1] as const;

export function MaskedImage({
  src,
  alt,
  ratio = "3 / 4",
  sizes = "(max-width: 768px) 92vw, 46vw",
  priority = false,
  quality = 88,
  delay = 0,
  className,
  ground = "#F3EFE8",
}: {
  src: string;
  alt: string;
  ratio?: string;
  sizes?: string;
  priority?: boolean;
  quality?: number;
  delay?: number;
  className?: string;
  ground?: string;
}) {
  const reduced = useReducedMotion();
  /* The observer watches the FRAME, which is never masked or translated —
     watching the moving layer is the deadlock described in useReveal. */
  const [ref, shown] = useReveal<HTMLDivElement>(0.15);
  const on = reduced || shown;

  return (
    <div
      ref={ref}
      className={`relative overflow-hidden ${className ?? ""}`}
      style={{ aspectRatio: ratio, background: ground }}
    >
      <motion.div
        className="absolute inset-0"
        initial={reduced ? false : { y: "6%", scale: 1.06 }}
        animate={on ? { y: "0%", scale: 1 } : undefined}
        transition={{ duration: 1.15, ease: EASE, delay }}
      >
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          quality={quality}
          priority={priority}
          className="object-cover"
        />
      </motion.div>

      {/* The mask itself: a solid plate that travels off the top. It is the
          only thing animating opacity-free, so the image is never a ghost. */}
      {!reduced && (
        <motion.div
          aria-hidden
          className="absolute inset-0"
          style={{ background: ground, transformOrigin: "top center" }}
          initial={{ scaleY: 1 }}
          animate={on ? { scaleY: 0 } : undefined}
          transition={{ duration: 0.95, ease: EASE, delay: delay + 0.05 }}
        />
      )}
    </div>
  );
}
