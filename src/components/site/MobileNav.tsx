"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { NAV } from "@/lib/site";
import { BRAND } from "@/lib/catalog";
import { ThreadRule } from "@/components/brand/ThreadRule";

/**
 * THE MOBILE HEADER'S OTHER HALF.
 *
 * A full-screen panel, not a dropdown. On a phone the IA is four groups and
 * fourteen destinations; squeezing that into a 280px drawer produces the
 * scrolling list-of-links every template ships. Taking the whole screen lets
 * the groups keep their headings and lets the type stay at a size worth
 * reading.
 *
 * Springs only — no CSS ease. The panel arrives with mass and the rows settle
 * behind it in sequence.
 */

const PANEL = { type: "spring", stiffness: 260, damping: 32, mass: 0.9 } as const;
const ROW = { type: "spring", stiffness: 300, damping: 30 } as const;

export function MobileNav({
  open,
  onClose,
  onSearch,
}: {
  open: boolean;
  onClose: () => void;
  onSearch?: () => void;
}) {
  const reduced = useReducedMotion();

  /* Escape closes, and the page behind must not scroll under the panel. */
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  const rows = NAV.flatMap((g) => [{ group: g.label }, ...g.items]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          id="mobile-nav"
          className="fixed inset-0 z-50 flex flex-col overflow-y-auto lg:hidden"
          style={{ background: "#FAF8F5" }}
          initial={reduced ? { opacity: 0 } : { y: "-100%" }}
          animate={reduced ? { opacity: 1 } : { y: "0%" }}
          exit={reduced ? { opacity: 0 } : { y: "-100%" }}
          transition={PANEL}
        >
          {/* sticky: the list is fourteen destinations tall, and a Close that
              scrolls away leaves the only exit off-screen. */}
          <div
            className="sticky top-0 z-10 flex items-center justify-between px-[clamp(1rem,4vw,2rem)] py-5"
            style={{ background: "#FAF8F5" }}
          >
            {/* On a phone this panel IS the navigation, so search has to live
                inside it — there is no header row left to put it in. */}
            {onSearch ? (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onSearch();
                }}
                className="ty-mono"
                style={{ color: "#1A1A1A", background: "none", border: "none", padding: "0.4rem 0", cursor: "pointer" }}
              >
                Search
              </button>
            ) : (
              <span />
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close menu"
              className="ty-mono"
              style={{
                color: "#1A1A1A",
                background: "none",
                border: "none",
                padding: "0.4rem 0",
                cursor: "pointer",
              }}
            >
              Close
            </button>
          </div>

          <nav
            aria-label="Main"
            className="flex-1 px-[clamp(1rem,4vw,2rem)] pb-[clamp(2rem,6vh,4rem)]"
          >
            {rows.map((row, i) =>
              "group" in row ? (
                <motion.div
                  key={`g-${row.group}`}
                  initial={reduced ? false : { opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ ...ROW, delay: 0.06 + i * 0.022 }}
                  className={i === 0 ? "" : "mt-9"}
                >
                  <p
                    className="ty-mono"
                    style={{ color: "#96605B", letterSpacing: "var(--tracking-luxe-wide)" }}
                  >
                    {row.group}
                  </p>
                  <ThreadRule tone="#C9A59F" slack={2} className="mt-3" />
                </motion.div>
              ) : (
                <motion.div
                  key={row.href}
                  initial={reduced ? false : { opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ ...ROW, delay: 0.06 + i * 0.022 }}
                >
                  <Link
                    href={row.href}
                    onClick={onClose}
                    className="flex items-baseline justify-between gap-5 py-3"
                    style={{ textDecoration: "none" }}
                  >
                    {/* min-w-0 lets a long craft name wrap instead of pushing
                        into its region; shrink-0 keeps the region intact. */}
                    <span className="ty-title min-w-0" style={{ color: "#1A1A1A" }}>
                      {row.label}
                    </span>
                    {row.note && (
                      <span
                        className="ty-mono shrink-0 text-right"
                        style={{ color: "#6B645A", maxWidth: "9rem" }}
                      >
                        {row.note}
                      </span>
                    )}
                  </Link>
                </motion.div>
              ),
            )}

            <motion.div
              initial={reduced ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.06 + rows.length * 0.022 }}
              className="mt-12"
            >
              <a
                href={BRAND.instagram}
                className="ty-mono"
                style={{ color: "#1A1A1A", borderBottom: "1px solid #96605B", paddingBottom: 3 }}
              >
                @the_pinkestore
              </a>
              <p className="ty-mono mt-5" style={{ color: "#6B645A" }}>
                {BRAND.city}, {BRAND.state}
              </p>
            </motion.div>
          </nav>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
