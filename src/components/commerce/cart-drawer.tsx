"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart, hydrate, cartTotal } from "@/lib/cart";
import { formatINR, CRAFTS } from "@/lib/catalog";
import { Band } from "@/components/ornament/band";
import { RollingINR } from "@/components/motion/rolling-number";

/* Heavy physical drawer. It glides in and settles rather than stopping dead. */
const DRAWER_SPRING = { type: "spring", stiffness: 100, damping: 15 } as const;
const ITEM_SPRING = { type: "spring", stiffness: 140, damping: 20, mass: 0.6 } as const;

export function CartDrawer() {
  const { lines, open, setOpen, setQty, remove } = useCart();
  const reduced = useReducedMotion();
  const panelRef = useRef<HTMLDivElement>(null);
  const items = hydrate(lines);
  const total = cartTotal(lines);

  /* Scroll lock + escape + focus move. */
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    panelRef.current?.focus();
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, setOpen]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-[#0B0A09]/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: "spring", stiffness: 160, damping: 26 }}
            onClick={() => setOpen(false)}
            aria-hidden
          />

          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Your bag"
            tabIndex={-1}
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-pk-surface-raised shadow-2xl outline-none"
            initial={reduced ? { opacity: 0 } : { x: "100%" }}
            animate={reduced ? { opacity: 1 } : { x: 0 }}
            exit={reduced ? { opacity: 0 } : { x: "100%" }}
            transition={reduced ? { type: "spring", stiffness: 400, damping: 40 } : DRAWER_SPRING}
          >
            <div className="flex items-baseline justify-between px-6 pt-6">
              <h2 className="font-display t-heading text-pk-fg">Your bag</h2>
              <button
                onClick={() => setOpen(false)}
                className="t-small text-pk-fg-muted underline-offset-4 hover:text-pk-fg hover:underline"
              >
                Close
              </button>
            </div>
            <Band variant="rule" className="mt-4" />

            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
                <svg width="88" height="60" viewBox="0 0 120 60" className="pk-on-ivory opacity-60">
                  <use href="#pk-kairi" x="20" y="0" width="34" height="40" />
                  <use href="#pk-kairi" x="66" y="16" width="34" height="40" />
                </svg>
                <p className="t-body text-pk-fg-muted">Nothing here yet.</p>
                <Link
                  href="/"
                  onClick={() => setOpen(false)}
                  className="t-small text-pk-accent underline underline-offset-4"
                >
                  See what is in stock
                </Link>
              </div>
            ) : (
              <ul className="flex-1 divide-y divide-pk-border overflow-y-auto px-6">
                {items.map(({ product: p, qty, subtotalPaise }, i) => (
                  <motion.li
                    key={p.slug}
                    className="flex gap-4 py-5"
                    initial={reduced ? false : { opacity: 0, x: 28 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ ...ITEM_SPRING, delay: 0.12 + i * 0.07 }}
                  >
                    <Link href={`/product/${p.slug}`} onClick={() => setOpen(false)}>
                      <Image
                        src={p.image}
                        alt={p.name}
                        width={72}
                        height={96}
                        quality={75}
                        className="h-24 w-[72px] rounded-sm object-cover"
                      />
                    </Link>
                    <div className="min-w-0 flex-1">
                      <p className="t-body text-pk-fg">{p.name}</p>
                      <p className="t-small text-pk-fg-muted">
                        {CRAFTS[p.craft].label}
                      </p>
                      <div className="mt-2 flex items-center gap-3">
                        {p.stock > 1 ? (
                          <label className="flex items-center gap-2">
                            <span className="sr-only">Quantity for {p.name}</span>
                            <select
                              value={qty}
                              onChange={(e) => setQty(p.slug, Number(e.target.value))}
                              className="rounded-sm border border-pk-border-strong bg-transparent px-2 py-1 text-sm"
                            >
                              {Array.from({ length: p.stock }, (_, i) => (
                                <option key={i + 1} value={i + 1}>
                                  {i + 1}
                                </option>
                              ))}
                            </select>
                          </label>
                        ) : (
                          <span className="t-micro text-pk-fg-subtle">
                            Only one exists
                          </span>
                        )}
                        <button
                          onClick={() => remove(p.slug)}
                          className="t-small text-pk-fg-subtle underline-offset-4 hover:text-pk-danger hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                    <p className="font-mono t-small text-pk-fg">
                      {formatINR(subtotalPaise)}
                    </p>
                  </motion.li>
                ))}
              </ul>
            )}

            {items.length > 0 && (
              <div className="border-t border-pk-border px-6 py-5">
                <div className="flex items-baseline justify-between">
                  <span className="t-body text-pk-fg-muted">Subtotal</span>
                  <RollingINR paise={total} className="font-mono t-heading text-pk-fg" />
                </div>
                <p className="t-small mt-1 text-pk-fg-subtle">
                  Shipping calculated at checkout.
                </p>
                <Link
                  href="/checkout"
                  onClick={() => setOpen(false)}
                  className="mt-4 block w-full rounded-sm bg-pk-accent-solid px-6 py-4 text-center text-pk-on-accent transition-colors duration-200 hover:bg-pk-accent-solid-hover"
                >
                  Checkout
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
