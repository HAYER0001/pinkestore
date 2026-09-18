"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useCartStore, selectCartTotal } from "@/store/useCartStore";
import { formatINR, PRODUCTS } from "@/lib/catalog";
import { RollingINR } from "@/components/motion/rolling-number";
import { Magnet } from "@/components/dom/Magnet";

/**
 * THE DRAWER.
 *
 * Rendered through a PORTAL on document.body. The app shell applies a filter
 * when the cart opens, and a filter creates a containing block for fixed
 * descendants — a `position: fixed` drawer nested inside it would be clipped
 * to the scaled, blurred layer and inherit the blur. The portal lifts it out.
 */

const DRAWER = { type: "spring", stiffness: 100, damping: 18, mass: 1 } as const;
const LIST = { staggerChildren: 0.06, delayChildren: 0.12 } as const;
const ITEM = { type: "spring", stiffness: 140, damping: 20, mass: 0.7 } as const;

export function CartDrawer() {
  const items = useCartStore((s) => s.items);
  const isOpen = useCartStore((s) => s.isOpen);
  const closeCart = useCartStore((s) => s.closeCart);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const total = useCartStore(selectCartTotal);

  const reduced = useReducedMotion();
  const panel = useRef<HTMLDivElement>(null);
  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;
  }, []);

  /* scroll lock + escape + focus */
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeCart();
    window.addEventListener("keydown", onKey);
    panel.current?.focus();
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen, closeCart]);

  if (typeof document === "undefined") return null;

  const ui = (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0"
            style={{ zIndex: 2147483000, background: "rgba(10,9,8,0.45)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: "spring", stiffness: 160, damping: 26 }}
            onClick={closeCart}
            aria-hidden
          />

          <motion.div
            ref={panel}
            role="dialog"
            aria-modal="true"
            aria-label="Your bag"
            tabIndex={-1}
            className="fixed right-0 top-0 flex h-[100svh] w-full flex-col outline-none sm:max-w-[450px]"
            style={{ zIndex: 2147483001, background: "#FAF8F5", borderRadius: 0 }}
            initial={reduced ? { opacity: 0 } : { x: "100%" }}
            animate={reduced ? { opacity: 1 } : { x: 0 }}
            exit={reduced ? { opacity: 0 } : { x: "100%" }}
            transition={reduced ? { duration: 0.15 } : DRAWER}
          >
            <header className="flex items-baseline justify-between border-b border-[#1A1A1A]/15 px-7 py-6">
              <h2
                className="t-micro-ed"
                style={{ color: "#1A1A1A", letterSpacing: "var(--tracking-luxe-widest)" }}
              >
                Your bag
              </h2>
              <button
                onClick={closeCart}
                className="t-micro-ed"
                style={{
                  color: "#1A1A1A",
                  letterSpacing: "var(--tracking-luxe)",
                  background: "none",
                  border: "none",
                  borderRadius: 0,
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                Close
              </button>
            </header>

            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-5 px-8 text-center">
                <p style={{ fontFamily: "var(--font-body)", color: "#4A443C" }}>
                  Nothing here yet.
                </p>
                <Link
                  href="#pieces"
                  onClick={closeCart}
                  className="t-micro-ed"
                  style={{ color: "#8A2F3B", letterSpacing: "var(--tracking-luxe)" }}
                >
                  See what is in stock
                </Link>
              </div>
            ) : (
              <motion.ul
                className="flex-1 overflow-y-auto"
                initial="hidden"
                animate="show"
                variants={{ hidden: {}, show: { transition: LIST } }}
              >
                {items.map((i) => {
                  const stock = PRODUCTS.find((p) => p.slug === i.id)?.stock ?? 1;
                  return (
                    <motion.li
                      key={i.id}
                      className="flex gap-4 border-b border-[#1A1A1A]/12 px-7 py-6"
                      variants={{
                        hidden: reduced ? { opacity: 1 } : { opacity: 0, y: 20 },
                        show: { opacity: 1, y: 0, transition: ITEM },
                      }}
                    >
                      <Image
                        src={i.imageSrc}
                        alt={i.title}
                        width={72}
                        height={72}
                        quality={75}
                        /* square thumbnail, cropped into the cloth */
                        className="h-[72px] w-[72px] shrink-0 object-cover"
                        style={{ borderRadius: 0 }}
                      />

                      <div className="min-w-0 flex-1">
                        <p
                          style={{
                            fontFamily: "var(--font-display)",
                            fontSize: "1.0625rem",
                            color: "#1A1A1A",
                          }}
                        >
                          {i.title}
                        </p>
                        {i.variant && (
                          <p
                            className="t-micro-ed mt-1"
                            style={{ color: "#6B645A", letterSpacing: "var(--tracking-luxe-wide)" }}
                          >
                            {i.variant}
                          </p>
                        )}

                        <div className="mt-3 flex items-center gap-5">
                          {stock > 1 ? (
                            <div className="flex items-center gap-3">
                              <Qty
                                label={`Decrease quantity of ${i.title}`}
                                onClick={() => updateQuantity(i.id, i.quantity - 1)}
                              >
                                −
                              </Qty>
                              <span
                                style={{
                                  fontFamily: "var(--font-body)",
                                  fontSize: "0.8125rem",
                                  minWidth: "1.2ch",
                                  textAlign: "center",
                                  color: "#1A1A1A",
                                }}
                              >
                                {i.quantity}
                              </span>
                              <Qty
                                label={`Increase quantity of ${i.title}`}
                                disabled={i.quantity >= stock}
                                onClick={() => updateQuantity(i.id, i.quantity + 1)}
                              >
                                +
                              </Qty>
                            </div>
                          ) : (
                            <span
                              className="t-micro-ed"
                              style={{ color: "#6B645A", letterSpacing: "var(--tracking-luxe)" }}
                            >
                              Only one exists
                            </span>
                          )}

                          <button
                            onClick={() => removeItem(i.id)}
                            className="t-micro-ed"
                            style={{
                              color: "#6B645A",
                              letterSpacing: "var(--tracking-luxe)",
                              background: "none",
                              border: "none",
                              padding: 0,
                              cursor: "pointer",
                            }}
                          >
                            Remove
                          </button>
                        </div>
                      </div>

                      <p
                        style={{
                          fontFamily: "var(--font-body)",
                          fontSize: "0.8125rem",
                          color: "#1A1A1A",
                        }}
                      >
                        {formatINR(i.price * i.quantity)}
                      </p>
                    </motion.li>
                  );
                })}
              </motion.ul>
            )}

            {items.length > 0 && (
              <footer className="border-t border-[#1A1A1A]/15 px-7 pb-7 pt-6">
                <div className="flex items-baseline justify-between">
                  <span
                    className="t-micro-ed"
                    style={{ color: "#6B645A", letterSpacing: "var(--tracking-luxe-wide)" }}
                  >
                    Total
                  </span>
                  {/* rolls like an odometer when a quantity changes */}
                  <RollingINR
                    paise={total}
                    className="font-[family-name:var(--font-body)] text-[1.35rem] text-[#1A1A1A]"
                  />
                </div>

                <p
                  className="t-micro-ed mt-2"
                  style={{ color: "#6B645A", letterSpacing: "var(--tracking-luxe)" }}
                >
                  Shipping calculated at checkout
                </p>

                <Link href="/checkout" onClick={closeCart} className="mt-6 block">
                  <SweepButton>Proceed to checkout</SweepButton>
                </Link>
              </footer>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return createPortal(ui, document.body);
}

/** Minimal magnetic hit-area, not a chrome button. */
function Qty({
  children,
  onClick,
  label,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  label: string;
  disabled?: boolean;
}) {
  return (
    <Magnet range={60}>
      <button
        onClick={onClick}
        aria-label={label}
        disabled={disabled}
        style={{
          width: 30,
          height: 30,
          display: "grid",
          placeItems: "center",
          border: "1px solid rgba(26,26,26,0.25)",
          borderRadius: 0,
          background: "none",
          color: "#1A1A1A",
          fontSize: "0.9rem",
          lineHeight: 1,
          cursor: disabled ? "not-allowed" : "pointer",
          opacity: disabled ? 0.3 : 1,
        }}
      >
        {children}
      </button>
    </Magnet>
  );
}

/** Full-width CTA whose ink sweeps across on hover rather than cross-fading. */
function SweepButton({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial="rest"
      whileHover="hot"
      whileTap={{ scale: 0.99 }}
      className="relative w-full overflow-hidden"
      style={{ background: "#1A1A1A", borderRadius: 0 }}
    >
      <motion.span
        aria-hidden
        className="absolute inset-0"
        style={{ background: "#8A2F3B", transformOrigin: "left center" }}
        variants={{ rest: { scaleX: 0 }, hot: { scaleX: 1 } }}
        transition={{ type: "spring", stiffness: 120, damping: 22 }}
      />
      <span
        className="relative block w-full py-5 text-center"
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "0.6875rem",
          letterSpacing: "var(--tracking-luxe-widest)",
          textTransform: "uppercase",
          color: "#FAF8F5",
        }}
      >
        {children}
      </span>
    </motion.div>
  );
}
