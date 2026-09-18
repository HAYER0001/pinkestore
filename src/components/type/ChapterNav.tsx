"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { scrollToId } from "@/utils/animations/scroll-to";

/**
 * CHAPTER NUMERALS AS NAVIGATION.
 *
 * A sticky vertical rail. Numerals are not decoration here — each is a real
 * jump target, and the rail is the only persistent wayfinding on a page that is
 * otherwise a continuous scroll.
 *
 * LATIN NUMERALS, deliberately, even though the shaili chips use Devanagari.
 * The distinction is decorative versus functional: a chip saying शैली ०२ is
 * content and can be culturally specific, but wayfinding has to be parsed at a
 * glance by every visitor. Making someone decode a numeral to find their place
 * is a worse failure than the inconsistency.
 *
 * IntersectionObserver rather than scroll maths, so it stays correct when
 * sections change height as images decode.
 */

export type Chapter = { id: string; label: string };

export function ChapterNav({
  chapters,
  tone = "#1A1A1A",
  className,
}: {
  chapters: Chapter[];
  tone?: string;
  className?: string;
}) {
  const [active, setActive] = useState(0);
  const reduced = useReducedMotion();
  const ratios = useRef<number[]>(chapters.map(() => 0));

  useEffect(() => {
    const els = chapters
      .map((c) => document.getElementById(c.id))
      .filter((e): e is HTMLElement => e !== null);
    if (els.length === 0) return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const i = els.indexOf(e.target as HTMLElement);
          if (i >= 0) ratios.current[i] = e.intersectionRatio;
        }
        /* whichever section occupies the most of the viewport wins — a simple
           "first intersecting" check flickers between two adjacent sections */
        let best = 0;
        let bestRatio = -1;
        ratios.current.forEach((r, i) => {
          if (r > bestRatio) {
            bestRatio = r;
            best = i;
          }
        });
        setActive(best);
      },
      { threshold: [0, 0.15, 0.3, 0.5, 0.75, 1] },
    );

    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [chapters]);

  return (
    <nav
      aria-label="Chapters"
      className={`pointer-events-none fixed left-0 top-1/2 z-30 hidden -translate-y-1/2 lg:block ${className ?? ""}`}
      style={{ paddingLeft: "clamp(1rem,2.2vw,2.5rem)" }}
    >
      <ol className="flex flex-col gap-5" style={{ margin: 0, padding: 0, listStyle: "none" }}>
        {chapters.map((c, i) => {
          const on = i === active;
          return (
            <li key={c.id}>
              <button
                onClick={() => scrollToId(c.id)}
                className="pointer-events-auto flex items-center gap-3"
                style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}
                aria-current={on ? "true" : undefined}
              >
                <motion.span
                  className="ty-mono block"
                  style={{ color: tone, letterSpacing: "0.16em" }}
                  animate={reduced ? undefined : { opacity: on ? 1 : 0.34 }}
                  transition={{ duration: 0.28 }}
                >
                  {String(i + 1).padStart(2, "0")}
                </motion.span>

                {/* the rule extends for the active chapter — the numeral alone
                    is too small a target to read as "you are here" */}
                <motion.span
                  aria-hidden
                  style={{ height: 1, background: tone, transformOrigin: "left center" }}
                  initial={false}
                  animate={{ width: on ? 34 : 12, opacity: on ? 1 : 0.28 }}
                  transition={{ type: "spring", stiffness: 260, damping: 28 }}
                />

                <motion.span
                  className="ty-mono whitespace-nowrap"
                  style={{ color: tone }}
                  initial={false}
                  animate={{ opacity: on ? 0.72 : 0, x: on ? 0 : -6 }}
                  transition={{ duration: 0.28 }}
                >
                  {c.label}
                </motion.span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/** The numeral as a section marker, for use inside the flow. */
export function ChapterMark({
  n,
  label,
  tone = "#1A1A1A",
  accent = "#C9A59F",
}: {
  n: number;
  label: string;
  tone?: string;
  accent?: string;
}) {
  return (
    <div className="flex items-baseline gap-5">
      <span className="ty-mono" style={{ color: accent, letterSpacing: "var(--tracking-luxe-wide)" }}>
        {String(n).padStart(2, "0")}
      </span>
      <span className="ty-mono" style={{ color: tone, opacity: 0.7 }}>
        {label}
      </span>
    </div>
  );
}
