"use client";

import Link from "next/link";
import { ScrollIndicator } from "./ScrollIndicator";
import { scrollToId } from "@/utils/animations/scroll-to";
import { useChromeTone } from "./useChromeTone";
import { useEffect, useState, useSyncExternalStore } from "react";
import { canvasStore } from "@/utils/animations/canvas-store";
import { SoundController } from "./SoundController";
import { Magnet } from "./Magnet";
import { useCursor } from "./CursorContext";
import { Wordmark } from "@/components/brand/Monogram";
import { usePathname } from "next/navigation";
import { BagButton } from "@/components/site/BagButton";

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
  const pathname = usePathname();
  /* Every other route renders SiteHeader in normal flow; a second fixed one
     overlapping it is the reason the product page looked layered on itself. */
  const cinematic = pathname === "/";

  const { setTarget, clear } = useCursor();
  const linkProps = {
    onPointerEnter: () => setTarget({ mode: "link" as const }),
    onPointerLeave: clear,
  };

  const introActive = useSyncExternalStore(
    canvasStore.subscribe,
    canvasStore.getActive,
    () => true,
  );
  /* The cue is a HERO instruction, not a canvas one. Gating it on the canvas
     being alive kept "Scroll to explore" printing across the film, the portal
     and four chapters — 1,300px into a page the reader was already exploring.
     It retires as soon as the hero's sticky frame has scrolled off. Position
     is read from a rAF-coalesced scroll listener, not IntersectionObserver —
     see useReveal for why. */
  const [heroOnScreen, setHeroOnScreen] = useState(true);
  useEffect(() => {
    let raf = 0;
    const read = () => {
      raf = 0;
      const hero = document.getElementById("origin");
      setHeroOnScreen(!hero || hero.getBoundingClientRect().bottom > window.innerHeight * 0.9);
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(read); };
    read();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { window.removeEventListener("scroll", onScroll); if (raf) cancelAnimationFrame(raf); };
  }, []);

  const intro = cinematic && introActive && heroOnScreen;

  /* The whole overlay is cinematic furniture. Commerce routes render
     SiteHeader in normal flow, and leaving this fixed layer mounted on top
     of it produced two headers stacked on the same pixels. */
  if (!cinematic) return null;

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
          aria-label="The Pinkestore — home"
          style={{ mixBlendMode: "var(--chrome-blend, difference)" as React.CSSProperties["mixBlendMode"] }}
        >
          <Wordmark tone="var(--chrome-ink, #FFFFFF)" />
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

        {/* nowrap + a tighter gap on phones: at 390px the wide luxe tracking
            pushed "Sound [off]" onto two lines mid-label. */}
        <div className="flex items-center gap-4 md:gap-7">
        <SoundController />
        <Magnet range={90}>
          <BagButton
            tone="var(--chrome-ink, #FFFFFF)"
            blend="var(--chrome-blend, difference)"
            {...linkProps}
          />
        </Magnet>
        </div>
      </header>

      {/* ---------------- bottom ----------------
          A div, NOT a <footer>. This is decorative cinematic furniture — a
          scroll prompt. Marking it up as a footer gave the
          homepage two contentinfo landmarks once the real site footer landed,
          and left a screen-reader user choosing between them. */}
      <div className="flex items-end justify-center">
        {/* FEWER SIMULTANEOUS ELEMENTS (item 89).
            Two corner labels used to sit here: "One of one", which the utility
            bar already says on every page, and "Est. Mithila" — which reads as
            "established in Mithila" and is simply wrong. The shop is in
            Chandigarh; Mithila is where one of the five crafts comes from.
            That is the same provenance slip this project has been corrected on
            before, printed in the corner of the first screen. Both are gone:
            the hero already carries a monogram, a nav, a chapter rail, a
            progress hairline, a headline, a standfirst, two CTAs, a piece and
            a scroll cue. It did not need two more labels. */}

        <div
          data-scroll-cue
          className="mx-auto md:mx-0 md:absolute md:left-1/2 md:-translate-x-1/2"
          style={{
            opacity: intro ? 1 : 0,
            visibility: intro ? "visible" : "hidden",
            transition: "opacity 450ms cubic-bezier(0.32,0.72,0,1)",
          }}
        >
          <ScrollIndicator />
        </div>

      </div>
    </div>
  );
}
