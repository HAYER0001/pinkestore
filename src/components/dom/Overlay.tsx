"use client";

import Link from "next/link";
import { ScrollIndicator } from "./ScrollIndicator";
import { scrollToId } from "@/utils/animations/scroll-to";
import { useChromeTone } from "./useChromeTone";
import { useSyncExternalStore } from "react";
import { canvasStore } from "@/utils/animations/canvas-store";
import { SoundController } from "./SoundController";
import { Magnet } from "./Magnet";
import { useCursor } from "./CursorContext";
import { useCartStore, selectCartCount } from "@/store/useCartStore";

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
  useChromeTone();

  /* The scroll indicator belongs to the cinematic intro. Once the canvas has
     handed off we are in the shop, and a fixed "scroll to explore" prompt
     there is both meaningless and physically collides with the Quick Add
     button at the bottom of the hero cell. */
  const { setTarget, clear } = useCursor();
  const openCart = useCartStore((s) => s.openCart);
  const count = useCartStore(selectCartCount);
  const linkProps = {
    onPointerEnter: () => setTarget({ mode: "link" as const }),
    onPointerLeave: clear,
  };

  const intro = useSyncExternalStore(
    canvasStore.subscribe,
    canvasStore.getActive,
    () => true,
  );

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
          style={{ mixBlendMode: "var(--chrome-blend, difference)" as React.CSSProperties["mixBlendMode"] }}
        >
          <span
            className="t-micro-ed block"
            style={{ color: "var(--chrome-ink, #FFFFFF)", letterSpacing: "var(--tracking-luxe-widest)" }}
          >
            The Pinkestore
          </span>
          <span
            className="t-micro-ed block"
            style={{
              color: "var(--chrome-ink, #FFFFFF)",
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
          style={{ mixBlendMode: "var(--chrome-blend, difference)" as React.CSSProperties["mixBlendMode"] }}
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
              style={{ color: "var(--chrome-ink, #FFFFFF)", letterSpacing: "var(--tracking-luxe)" }}
              {...linkProps}
            >
              {n.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-7">
        <SoundController />
        <Magnet range={90}>
        <button
          type="button"
          className="pointer-events-auto t-micro-ed"
          style={{
            color: "var(--chrome-ink, #FFFFFF)",
            letterSpacing: "var(--tracking-luxe)",
            mixBlendMode: "var(--chrome-blend, difference)" as React.CSSProperties["mixBlendMode"],
            background: "none",
            border: "none",
            padding: 0,
            cursor: "pointer",
          }}
          onClick={openCart}
          {...linkProps}
        >
          Bag ({count})
        </button>
        </Magnet>
        </div>
      </header>

      {/* ---------------- bottom ---------------- */}
      <footer className="flex items-end justify-between">
        <span
          className="t-micro-ed hidden md:block"
          style={{
            color: "var(--chrome-ink, #FFFFFF)",
            opacity: intro ? 0.55 : 0,
            letterSpacing: "var(--tracking-luxe)",
            mixBlendMode: "var(--chrome-blend, difference)" as React.CSSProperties["mixBlendMode"],
          }}
        >
          One of one
        </span>

        <div
          className="mx-auto md:mx-0 md:absolute md:left-1/2 md:-translate-x-1/2"
          style={{
            opacity: intro ? 1 : 0,
            visibility: intro ? "visible" : "hidden",
            transition: "opacity 450ms cubic-bezier(0.32,0.72,0,1)",
          }}
        >
          <ScrollIndicator />
        </div>

        <span
          className="t-micro-ed hidden md:block"
          style={{
            color: "var(--chrome-ink, #FFFFFF)",
            opacity: intro ? 0.55 : 0,
            letterSpacing: "var(--tracking-luxe)",
            mixBlendMode: "var(--chrome-blend, difference)" as React.CSSProperties["mixBlendMode"],
          }}
        >
          Est. Mithila
        </span>
      </footer>
    </div>
  );
}
