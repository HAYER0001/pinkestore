"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { PRODUCTS, CRAFTS, formatINR, type Craft } from "@/lib/catalog";

/**
 * THE MEGA-MENU.
 *
 * Two panels — Collection and The Craft — and the thing that makes either
 * worth having is that both show CLOTH. A mega-menu that is three columns of
 * text links is a sitemap with a drop shadow; the reason luxury houses use the
 * pattern is that it puts photographs one hover away from every page.
 *
 * INTENT DELAY, both directions. Opening instantly on hover means the panel
 * fires while someone is travelling to the bag button; closing instantly means
 * it vanishes while they are travelling INTO it. 110ms in, 220ms out — out is
 * longer because the diagonal from trigger to panel content is where
 * accidental closes happen.
 *
 * Keyboard users get click-to-toggle and Escape; the panel is not hover-only.
 */

const PANEL = { type: "spring", stiffness: 320, damping: 36, mass: 0.7 } as const;
const OPEN_MS = 110;
const CLOSE_MS = 220;

export type MenuKey = "collection" | "craft";

export function useMegaMenu() {
  const [openKey, setOpenKey] = useState<MenuKey | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancel = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  };

  const open = (k: MenuKey) => {
    cancel();
    timer.current = setTimeout(() => setOpenKey(k), OPEN_MS);
  };
  const close = () => {
    cancel();
    timer.current = setTimeout(() => setOpenKey(null), CLOSE_MS);
  };
  /* click and Escape must be immediate — a delayed close after a deliberate
     dismissal reads as lag, not as grace */
  const closeNow = () => {
    cancel();
    setOpenKey(null);
  };
  const toggle = (k: MenuKey) => {
    cancel();
    setOpenKey((cur) => (cur === k ? null : k));
  };

  useEffect(() => {
    if (!openKey) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeNow();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openKey]);

  useEffect(() => cancel, []);

  return { openKey, open, close, closeNow, toggle, cancel };
}

function Piece({ slug, onNavigate }: { slug: string; onNavigate: () => void }) {
  const p = PRODUCTS.find((x) => x.slug === slug);
  if (!p) return null;
  const c = CRAFTS[p.craft];
  return (
    <Link href={`/product/${p.slug}`} onClick={onNavigate} style={{ textDecoration: "none" }} className="group block">
      <span className="relative block overflow-hidden" style={{ aspectRatio: "3 / 4", background: "#F3EFE8" }}>
        <Image
          src={p.image}
          alt={`${p.name} — ${c.label}`}
          fill
          sizes="(max-width: 1280px) 22vw, 260px"
          quality={80}
          className="object-cover"
        />
      </span>
      <span className="ty-caption mt-3 block" style={{ color: "#1A1A1A" }}>
        {p.name}
      </span>
      <span className="ty-mono block" style={{ color: "#6B645A" }}>
        {formatINR(p.pricePaise)}
      </span>
    </Link>
  );
}

export function MegaPanel({
  which,
  onNavigate,
  onPointerEnter,
  onPointerLeave,
}: {
  which: MenuKey;
  onNavigate: () => void;
  onPointerEnter: () => void;
  onPointerLeave: () => void;
}) {
  const reduced = useReducedMotion();
  const crafts = Object.entries(CRAFTS) as [Craft, (typeof CRAFTS)[Craft]][];

  return (
    <motion.div
      data-mega-panel={which}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      className="absolute inset-x-0 top-full hidden lg:block"
      style={{
        background: "#FAF8F5",
        borderBottom: "1px solid rgba(26,26,26,0.12)",
        boxShadow: "0 24px 48px -32px rgba(26,26,26,0.28)",
      }}
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduced ? { opacity: 0 } : { opacity: 0, y: -8 }}
      transition={PANEL}
    >
      <div className="mx-auto max-w-[1500px] px-[clamp(1rem,3vw,3rem)] py-10">
        {which === "collection" ? (
          <div className="grid grid-cols-[minmax(180px,1fr)_3fr] gap-12">
            <nav aria-label="Collection">
              <p className="ty-mono" style={{ color: "#96605B", margin: 0 }}>
                Browse
              </p>
              <ul className="mt-5 space-y-3" style={{ margin: "1.25rem 0 0", padding: 0, listStyle: "none" }}>
                {[
                  { label: "Everything", href: "/collection", n: PRODUCTS.length },
                ].map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} onClick={onNavigate} className="ty-title" style={{ color: "#1A1A1A", textDecoration: "none" }}>
                      {l.label}{" "}
                      <span className="ty-mono" style={{ color: "#6B645A" }}>
                        {l.n}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div>
              <p className="ty-mono" style={{ color: "#96605B", margin: 0 }}>
                In stock now
              </p>
              <div className="mt-5 grid grid-cols-4 gap-6">
                {PRODUCTS.slice(0, 4).map((p) => (
                  <Piece key={p.slug} slug={p.slug} onNavigate={onNavigate} />
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-[2fr_1fr] gap-12">
            <nav aria-label="Techniques">
              <p className="ty-mono" style={{ color: "#96605B", margin: 0 }}>
                Explore by craft
              </p>
              <ul className="mt-5 grid grid-cols-2 gap-x-10 gap-y-5" style={{ margin: "1.25rem 0 0", padding: 0, listStyle: "none" }}>
                {crafts.map(([slug, c]) => {
                  const n = PRODUCTS.filter((p) => p.craft === slug).length;
                  return (
                    <li key={slug}>
                      <Link href={`/craft/${slug}`} onClick={onNavigate} style={{ textDecoration: "none" }}>
                        <span className="ty-title block" style={{ color: "#1A1A1A" }}>
                          {c.label}
                        </span>
                        <span className="ty-mono block" style={{ color: "#6B645A" }}>
                          {c.region} · {n} {n === 1 ? "piece" : "pieces"}
                          {/* the printed one says so here too, not only on its
                              own page — this is where people choose */}
                          {!c.handmade && (
                            <span style={{ color: "#8A2F3B" }}> · printed</span>
                          )}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
              <Link
                href="/craft"
                onClick={onNavigate}
                className="ty-mono mt-8 inline-block"
                style={{ color: "#1A1A1A", borderBottom: "1px solid #96605B", paddingBottom: 3, textDecoration: "none" }}
              >
                All five techniques
              </Link>
            </nav>

            <div>
              <p className="ty-mono" style={{ color: "#96605B", margin: 0 }}>
                The one that is painted
              </p>
              <div className="mt-5">
                <Piece slug="madhubani-baraat-shawl" onNavigate={onNavigate} />
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export { AnimatePresence };
