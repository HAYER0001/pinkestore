"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { formatINR, BRAND, type Product } from "@/lib/catalog";
import { useCartStore } from "@/store/useCartStore";

/**
 * THE STICKY PURCHASE BAR (items 60 + 90) and PRIVATE ENQUIRY (item 59).
 *
 * On a phone the product page is a long scroll of full-width photographs. By
 * the third frame the price and the button are thousands of pixels above, and
 * the moment someone decides is the moment they have to hunt for it. So the
 * bar appears once the real button has scrolled away — and NOT before, because
 * a bar covering the button it duplicates is just a smaller screen.
 *
 * ENQUIRE PRIVATELY is not decoration at these prices. Someone about to spend
 * Rs 65,000 on a one-of-one object wants a person to confirm it is real before
 * they commit. What it cannot do yet is give them a phone number — there is no
 * email or WhatsApp on file — so it is honest about the channel that exists
 * rather than opening a contact form that goes nowhere.
 */

const SPRING = { type: "spring", stiffness: 300, damping: 34, mass: 0.8 } as const;

export function StickyBuy({ product: p, watch }: { product: Product; watch: string }) {
  const reduced = useReducedMotion();
  const [show, setShow] = useState(false);
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);

  useEffect(() => {
    /* A SCROLL LISTENER, NOT AN INTERSECTION OBSERVER.
     *
     * IO was the obvious choice and it is silently wrong here. A fast flick or
     * an instant jump takes #buy from BELOW the viewport (ratio 0) to ABOVE it
     * (ratio 0) without ever intersecting — the ratio never changes, so no
     * callback fires at all and the bar stays hidden. That is precisely the
     * reader this bar exists for: the one who scrolled past the button.
     *
     * Same family as the whileInView bug: never depend on a callback that is
     * only delivered when a threshold is crossed.
     */
    let raf = 0;
    const read = () => {
      raf = 0;
      const el = document.getElementById(watch);
      if (!el) return;
      /* show once the real control has left the screen upward — a bar
         covering the button it duplicates is just a smaller screen */
      setShow(el.getBoundingClientRect().bottom < 0);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(read);
    };

    read();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    /* images decode after first paint and move #buy down the page */
    const t = setTimeout(read, 1200);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      clearTimeout(t);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [watch]);

  return (
    <motion.div
      data-sticky-buy
      className="fixed inset-x-0 bottom-0 z-40 lg:hidden"
      style={{
        background: "rgba(250,248,245,0.96)",
        backdropFilter: "blur(14px)",
        borderTop: "1px solid rgba(26,26,26,0.12)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
      initial={false}
      animate={reduced ? { y: show ? 0 : "110%" } : { y: show ? 0 : "110%" }}
      transition={reduced ? { duration: 0 } : SPRING}
      aria-hidden={!show}
    >
      <div className="flex items-center justify-between gap-4 px-[clamp(1rem,4vw,2rem)] py-3">
        <div className="min-w-0">
          <p className="ty-mono truncate" style={{ color: "#6B645A", margin: 0 }}>
            {p.name}
          </p>
          <p
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 300,
              fontSize: "1.2rem",
              letterSpacing: "-0.02em",
              color: "#1A1A1A",
              margin: "0.1rem 0 0",
            }}
          >
            {formatINR(p.pricePaise)}
          </p>
        </div>

        <button
          type="button"
          tabIndex={show ? 0 : -1}
          onClick={() => {
            addItem(
              { id: p.slug, title: p.name, price: p.pricePaise, imageSrc: p.image },
              1,
            );
            openCart();
          }}
          className="ty-mono shrink-0"
          style={{
            background: "#1A1A1A",
            color: "#FAF8F5",
            border: "none",
            borderRadius: 0,
            padding: "0.95rem 1.6rem",
            letterSpacing: "var(--tracking-luxe-wide)",
            cursor: "pointer",
          }}
        >
          Add to bag
        </button>
      </div>
    </motion.div>
  );
}

export function EnquirePrivately({ product: p }: { product: Product }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-6">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="ty-mono"
        style={{
          color: "#1A1A1A",
          background: "none",
          border: "none",
          padding: 0,
          cursor: "pointer",
          borderBottom: "1px solid #96605B",
          paddingBottom: 3,
        }}
      >
        Enquire privately
      </button>

      {open && (
        <div className="mt-5 border-l-2 pl-5" style={{ borderColor: "#C9A59F" }}>
          <p className="ty-read measure-read" style={{ color: "#4A443C", margin: 0 }}>
            Ask anything before you buy — the exact measurements, what the reverse
            looks like, whether it suits what you have in mind. Mention{" "}
            <strong style={{ fontWeight: 500 }}>{p.name}</strong> and you will get
            a straight answer from a person.
          </p>

          {/* Only the channel that actually exists. A contact form posting
              nowhere would be worse than this. */}
          <a
            href={BRAND.instagram}
            className="ty-mono mt-5 inline-block"
            style={{ color: "#1A1A1A", borderBottom: "1px solid #96605B", paddingBottom: 3, textDecoration: "none" }}
          >
            Message @the_pinkestore
          </a>
        </div>
      )}
    </div>
  );
}
