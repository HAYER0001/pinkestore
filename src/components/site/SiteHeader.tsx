"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import { NAV } from "@/lib/site";
import { Wordmark } from "@/components/brand/Monogram";
import { BagButton } from "./BagButton";
import { UtilityBar } from "./UtilityBar";
import { MobileNav } from "./MobileNav";
import { useScrollState } from "./useScrollState";

/**
 * THE HEADER. One component, every route except the cinematic intro.
 *
 * SCROLL-STATE IDENTITY (items 12 + 20): at the top it is generous and
 * borderless with the utility bar showing; scrolled, it compacts, drops the
 * utility bar, and earns a hairline and a blurred ground. Two states, both
 * deliberate — not a height that tracks scroll offset continuously, which
 * reads as a widget rather than as a masthead.
 *
 * The top-level nav is the four IA groups' primary destinations. The groups
 * themselves expand in Phase 5 (mega-menu, browse-by-craft, search); this is
 * the flat version and it is a real nav, not a placeholder for one.
 */

const SETTLE = { type: "spring", stiffness: 260, damping: 34, mass: 0.9 } as const;

/* The desktop bar shows destinations, not group labels: "The Collection"
   is somewhere you can go, "Shop" is a category of somewhere. */
const PRIMARY = [
  { label: "Collection", href: "/collection" },
  { label: "The Craft", href: "/craft" },
  { label: "Journal", href: "/journal" },
  { label: "About", href: "/about" },
];

export function SiteHeader() {
  const scrolled = useScrollState();
  const reduced = useReducedMotion();
  const [menu, setMenu] = useState(false);
  const pathname = usePathname();

  const isCurrent = (href: string) =>
    href === pathname || (href !== "/" && pathname.startsWith(`${href}/`));

  return (
    <>
      <div className="sticky top-0 z-40">
        <UtilityBar hidden={scrolled} />

        <motion.header
          data-site-header
          data-scrolled={scrolled ? "true" : "false"}
          initial={false}
          animate={
            reduced
              ? undefined
              : {
                  backgroundColor: scrolled ? "rgba(250,248,245,0.96)" : "rgba(250,248,245,1)",
                  borderBottomColor: scrolled ? "rgba(26,26,26,0.12)" : "rgba(26,26,26,0)",
                }
          }
          transition={SETTLE}
          style={{
            borderBottomWidth: 1,
            borderBottomStyle: "solid",
            /* backdrop-filter, unlike filter, does NOT create a containing
               block for fixed descendants — but it does create a stacking
               context, which is fine here because nothing inside needs to
               blend with the page behind it. */
            /* 0.9 + blur(10) left body copy legible THROUGH the bar, reading
               as a second line of nav. The translucency has to be a hint that
               something is behind it, not a window onto it. */
            backdropFilter: scrolled ? "blur(16px) saturate(1.1)" : "none",
          }}
        >
          <motion.div
            className="mx-auto flex max-w-[1500px] items-center justify-between px-[clamp(1rem,3vw,3rem)]"
            initial={false}
            animate={reduced ? undefined : { paddingTop: scrolled ? 12 : 22, paddingBottom: scrolled ? 12 : 22 }}
            transition={SETTLE}
          >
            <Link href="/" aria-label={`The Pinkestore — home`} style={{ textDecoration: "none" }}>
              {/* the city line is a luxury at rest and noise once compact */}
              <Wordmark tone="#1A1A1A" showCity={!scrolled} />
            </Link>

            <nav aria-label="Main" className="hidden items-center gap-9 lg:flex">
              {PRIMARY.map((n) => {
                const on = isCurrent(n.href);
                return (
                  <Link
                    key={n.href}
                    href={n.href}
                    aria-current={on ? "page" : undefined}
                    className="ty-mono"
                    style={{
                      color: "#1A1A1A",
                      textDecoration: "none",
                      opacity: on ? 1 : 0.62,
                      borderBottom: `1px solid ${on ? "#96605B" : "transparent"}`,
                      paddingBottom: 3,
                    }}
                  >
                    {n.label}
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center gap-6">
              <BagButton tone="#1A1A1A" />

              {/* DEDICATED MOBILE HEADER (item 19): below lg the nav collapses
                  to one control and the panel takes the whole screen. */}
              <button
                type="button"
                onClick={() => setMenu(true)}
                aria-label="Open menu"
                aria-expanded={menu}
                aria-controls="mobile-nav"
                className="ty-mono lg:hidden"
                style={{ color: "#1A1A1A", background: "none", border: "none", padding: 0, cursor: "pointer" }}
              >
                Menu
              </button>
            </div>
          </motion.div>
        </motion.header>
      </div>

      <MobileNav open={menu} onClose={() => setMenu(false)} />
    </>
  );
}

export { NAV };
