"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { getProduct, CRAFTS, formatINR } from "@/lib/catalog";
import { getShots, altFor } from "@/lib/shots";
import { AddToBag } from "@/components/commerce/add-to-bag";
import { ThreadRule } from "@/components/brand/ThreadRule";

/**
 * QUICK VIEW (item 50).
 *
 * Deliberately NOT a second product page in a box. It answers the three
 * questions that stop someone mid-scroll — what does it look like from
 * another angle, what is it, what does it cost — and then gets out of the way
 * with a link to the real page.
 *
 * A quick view that tries to be complete is worse than none: it duplicates
 * the product page badly, and it takes the decision away from the page that
 * was actually designed to carry it.
 */

const PANEL = { type: "spring", stiffness: 280, damping: 34, mass: 0.8 } as const;

export function QuickView({ slug, onClose }: { slug: string | null; onClose: () => void }) {
  const reduced = useReducedMotion();
  const [frame, setFrame] = useState(0);
  const p = slug ? getProduct(slug) : null;
  const shots = p ? getShots(p.slug) : [];

  useEffect(() => setFrame(0), [slug]);

  useEffect(() => {
    if (!slug) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [slug, onClose]);

  const craft = p ? CRAFTS[p.craft] : null;
  const shown = shots[frame];

  return (
    <AnimatePresence>
      {p && craft && (
        <motion.div
          className="fixed inset-0 z-[65] flex items-center justify-center p-[clamp(0.5rem,3vw,2.5rem)]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          <button
            aria-label="Close quick view"
            onClick={onClose}
            tabIndex={-1}
            className="absolute inset-0 h-full w-full cursor-default"
            style={{ background: "rgba(16,14,12,0.6)", border: "none" }}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={`${p.name} — quick view`}
            className="relative grid w-full max-w-[940px] gap-0 overflow-hidden sm:grid-cols-2"
            style={{ background: "#FAF8F5", maxHeight: "88vh" }}
            initial={reduced ? false : { y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={reduced ? { opacity: 0 } : { y: 16, opacity: 0 }}
            transition={PANEL}
          >
            {/* ---------------- the cloth ---------------- */}
            <div className="relative" style={{ aspectRatio: "3 / 4", background: "#F3EFE8" }}>
              {shown ? (
                <Image
                  key={shown.src}
                  src={shown.src}
                  alt={altFor(p, shown)}
                  fill
                  quality={88}
                  sizes="(max-width: 640px) 96vw, 460px"
                  className="object-cover"
                />
              ) : (
                <Image src={p.image} alt={p.name} fill quality={88} sizes="460px" className="object-cover" />
              )}

              {shots.length > 1 && (
                <div className="absolute inset-x-0 bottom-0 flex gap-1 p-3">
                  {shots.map((s, i) => (
                    <button
                      key={s.src}
                      type="button"
                      onClick={() => setFrame(i)}
                      aria-label={`Frame ${i + 1}: ${s.frame}`}
                      aria-current={i === frame ? "true" : undefined}
                      className="h-1 flex-1"
                      style={{
                        background: i === frame ? "#FAF8F5" : "rgba(250,248,245,0.4)",
                        border: "none",
                        padding: 0,
                        cursor: "pointer",
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* ---------------- the decision ---------------- */}
            <div className="flex flex-col overflow-y-auto p-[clamp(1.25rem,3vw,2.25rem)]">
              <div className="flex items-start justify-between gap-4">
                <p className="ty-mono" style={{ color: "#96605B", margin: 0 }}>
                  {craft.label}
                  {!craft.handmade && <span style={{ color: "#8A2F3B" }}> · printed</span>}
                </p>
                <button
                  type="button"
                  onClick={onClose}
                  className="ty-mono shrink-0"
                  style={{ color: "#6B645A", background: "none", border: "none", cursor: "pointer" }}
                >
                  Close
                </button>
              </div>

              <h2 className="ty-display mt-3" style={{ color: "#1A1A1A", margin: "0.75rem 0 0" }}>
                {p.name}
              </h2>

              <p className="ty-caption mt-2" style={{ color: "#6B645A" }}>
                {craft.region}
              </p>

              <ThreadRule tone="#C9A59F" slack={3} animate={false} className="my-5" />

              <p className="ty-read" style={{ color: "#4A443C", margin: 0 }}>
                {p.blurb}
              </p>

              <p
                className="mt-6"
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 300,
                  fontSize: "clamp(1.5rem,2.4vw,2rem)",
                  letterSpacing: "-0.02em",
                  color: "#1A1A1A",
                  margin: "1.5rem 0 0",
                }}
              >
                {formatINR(p.pricePaise)}
              </p>

              <p className="ty-mono mt-2" style={{ color: p.stock === 1 ? "#8A2F3B" : "#6B645A" }}>
                {p.stock === 1 ? "One exists" : `${p.stock} available`}
              </p>

              <AddToBag slug={p.slug} stock={p.stock} className="mt-6" />

              {/* the real page is where the decision belongs */}
              <Link
                href={`/product/${p.slug}`}
                onClick={onClose}
                className="ty-mono mt-5 inline-block"
                style={{ color: "#1A1A1A", borderBottom: "1px solid #96605B", paddingBottom: 3, textDecoration: "none" }}
              >
                Everything about this piece
              </Link>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
