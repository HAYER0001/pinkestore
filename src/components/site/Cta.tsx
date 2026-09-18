"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { useCursor } from "@/components/dom/CursorContext";

/**
 * THE CALL TO ACTION.
 *
 * The homepage had none. Not a weak one — none at all. Someone could read the
 * whole cinematic run and never be offered anywhere to go, which is the single
 * most expensive omission on the site.
 *
 * NO FILLED PILL. Nothing on this site has a corner radius or a drop shadow,
 * and a rounded solid button would be the first and loudest exception. The
 * primary is a hairline rectangle whose ground SWEEPS in from the left on
 * hover and whose label inverts with it — the same trick a letterpress proof
 * does, and it costs one transform rather than a colour transition on four
 * properties.
 *
 * The secondary is a rule that extends. A second box would compete; a plain
 * link would disappear.
 */

const SWEEP = { type: "spring", stiffness: 220, damping: 30, mass: 0.7 } as const;

export function PrimaryCta({
  href,
  children,
  tone = "#1A1A1A",
  ground = "#FAF8F5",
  blend,
  className,
}: {
  href: string;
  children: string;
  /** the hairline and the label at rest */
  tone?: string;
  /** what the label becomes once the sweep is under it */
  ground?: string;
  blend?: string;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const { setTarget, clear } = useCursor();

  return (
    <Link
      href={href}
      className={`group relative inline-block overflow-hidden ${className ?? ""}`}
      style={{
        border: `1px solid ${tone}`,
        borderRadius: 0,
        padding: "1rem 2.25rem",
        textDecoration: "none",
        mixBlendMode: blend as React.CSSProperties["mixBlendMode"],
      }}
      onPointerEnter={() => setTarget({ mode: "link" })}
      onPointerLeave={clear}
    >
      {/* the sweep sits behind the label and is clipped by the border box */}
      <motion.span
        aria-hidden
        className="absolute inset-0"
        style={{ background: tone, transformOrigin: "left center" }}
        initial={{ scaleX: 0 }}
        whileHover={reduced ? undefined : { scaleX: 1 }}
        transition={SWEEP}
      />
      <motion.span
        className="ty-mono relative block"
        style={{ color: tone, letterSpacing: "var(--tracking-luxe-wide)" }}
        whileHover={reduced ? undefined : { color: ground }}
        transition={{ duration: 0.18 }}
      >
        {children}
      </motion.span>
    </Link>
  );
}

export function SecondaryCta({
  href,
  children,
  tone = "#1A1A1A",
  blend,
  className,
}: {
  href: string;
  children: string;
  tone?: string;
  blend?: string;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const { setTarget, clear } = useCursor();

  return (
    <Link
      href={href}
      className={`group relative inline-flex items-center gap-3 ${className ?? ""}`}
      style={{
        textDecoration: "none",
        padding: "1rem 0",
        mixBlendMode: blend as React.CSSProperties["mixBlendMode"],
      }}
      onPointerEnter={() => setTarget({ mode: "link" })}
      onPointerLeave={clear}
    >
      <span className="ty-mono" style={{ color: tone, letterSpacing: "var(--tracking-luxe-wide)" }}>
        {children}
      </span>

      {/* a rule that extends, rather than a second box competing with the first */}
      <motion.span
        aria-hidden
        style={{ height: 1, background: tone, display: "block", transformOrigin: "left center" }}
        initial={{ width: 22 }}
        whileHover={reduced ? undefined : { width: 44 }}
        transition={SWEEP}
      />
    </Link>
  );
}

/** The pair, spaced. */
export function CtaPair({
  primary,
  secondary,
  tone,
  ground,
  blend,
  className,
}: {
  primary: { href: string; label: string };
  secondary: { href: string; label: string };
  tone?: string;
  ground?: string;
  blend?: string;
  className?: string;
}) {
  return (
    <div className={`flex flex-wrap items-center gap-x-10 gap-y-2 ${className ?? ""}`}>
      <PrimaryCta href={primary.href} tone={tone} ground={ground} blend={blend}>
        {primary.label}
      </PrimaryCta>
      <SecondaryCta href={secondary.href} tone={tone} blend={blend}>
        {secondary.label}
      </SecondaryCta>
    </div>
  );
}
