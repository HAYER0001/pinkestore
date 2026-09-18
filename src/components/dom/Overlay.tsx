"use client";

import Link from "next/link";
import { ScrollIndicator } from "./ScrollIndicator";
import { scrollToId } from "@/utils/animations/scroll-to";

/**
 * THE FIXED CHROME.
 *
 * Sits over the WebGL canvas for the whole session: nav, wordmark, cart, and
 * the scroll indicator. Scrolling editorial content lives in the page flow,
 * not here.
 *
 * THE RULE THAT MATTERS: the wrapper is pointer-events:none. A fixed inset-0
 * div is, by default, a sheet of glass over the entire canvas — it would
 * swallow every pointermove and the Phase 2 particle repulsion would simply
 * stop working, with nothing in the console to explain why. Only the genuinely
 * clickable children opt back in with pointer-events:auto.
 */

const NAV = [
  { label: "Collection", href: "#pieces" },
  { label: "The Craft", href: "#craft" },
  { label: "Journal", href: "#journal" },
];

export function Overlay() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-40 flex flex-col justify-between"
      style={{ padding: "clamp(1.25rem, 3vw, 2.75rem)" }}
    >
      {/* ---------------- top ---------------- */}
      <header className="flex items-start justify-between">
        <Link
          href="/"
          className="pointer-events-auto"
          style={{ mixBlendMode: "difference" }}
        >
          <span
            className="t-micro-ed block"
            style={{ color: "#FFFFFF", letterSpacing: "var(--tracking-luxe-widest)" }}
          >
            The Pinkestore
          </span>
          <span
            className="t-micro-ed block"
            style={{
              color: "#FFFFFF",
              opacity: 0.55,
              letterSpacing: "var(--tracking-luxe)",
              marginTop: "0.45rem",
            }}
          >
            Chandigarh
          </span>
        </Link>

        <nav
          className="hidden items-center gap-10 md:flex"
          style={{ mixBlendMode: "difference" }}
        >
          {NAV.map((n) => (
            <a
              key={n.label}
              href={n.href}
              onClick={(e) => {
                /* Lenis owns scrollTop — a native anchor jump gets overwritten
                   on its next frame. Route through lenis.scrollTo instead. */
                e.preventDefault();
                scrollToId(n.href);
              }}
              className="pointer-events-auto t-micro-ed"
              style={{ color: "#FFFFFF", letterSpacing: "var(--tracking-luxe)" }}
            >
              {n.label}
            </a>
          ))}
        </nav>

        <button
          type="button"
          className="pointer-events-auto t-micro-ed"
          style={{
            color: "#FFFFFF",
            letterSpacing: "var(--tracking-luxe)",
            mixBlendMode: "difference",
            background: "none",
            border: "none",
            padding: 0,
            cursor: "pointer",
          }}
        >
          Bag (0)
        </button>
      </header>

      {/* ---------------- bottom ---------------- */}
      <footer className="flex items-end justify-between">
        <span
          className="t-micro-ed hidden md:block"
          style={{
            color: "#FFFFFF",
            opacity: 0.55,
            letterSpacing: "var(--tracking-luxe)",
            mixBlendMode: "difference",
          }}
        >
          One of one
        </span>

        <div className="mx-auto md:mx-0 md:absolute md:left-1/2 md:-translate-x-1/2">
          <ScrollIndicator />
        </div>

        <span
          className="t-micro-ed hidden md:block"
          style={{
            color: "#FFFFFF",
            opacity: 0.55,
            letterSpacing: "var(--tracking-luxe)",
            mixBlendMode: "difference",
          }}
        >
          Est. Mithila
        </span>
      </footer>
    </div>
  );
}
