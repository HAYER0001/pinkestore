"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart, cartCount } from "@/lib/cart";
import { BRAND } from "@/lib/catalog";

export function SiteHeader() {
  const { lines, setOpen } = useCart();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const count = mounted ? cartCount(lines) : 0;

  return (
    <header className="sticky top-0 z-30 backdrop-blur-sm"
      style={{ background: "#17120F", borderBottom: "1px solid rgba(232,188,87,0.28)" }}>
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 md:px-8">
        <Link href="/" className="flex items-center gap-3">
          <svg width="28" height="28" viewBox="0 0 48 48" className="ink-gold" aria-hidden>
            <use href="#pk-lotus" width="48" height="48" />
          </svg>
          <span className="t-ornament t-heading" style={{ color: "#E8E0D4" }}>{BRAND.name}</span>
        </Link>

        <button
          onClick={() => setOpen(true)}
          className="t-small flex items-center gap-2 rounded-sm px-3 py-2 transition-opacity duration-200 hover:opacity-80"
          style={{ color: "#E8E0D4" }}
          aria-label={`Open bag, ${count} item${count === 1 ? "" : "s"}`}
        >
          Bag
          <span
            className="inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 font-mono text-[11px]"
            style={{
              background: count ? "#E8BC57" : "transparent",
              color: count ? "#221A08" : "rgba(232,224,212,0.7)",
              border: count ? "none" : "1px solid rgba(232,188,87,0.4)",
            }}
          >
            {count}
          </span>
        </button>
      </div>
    </header>
  );
}
