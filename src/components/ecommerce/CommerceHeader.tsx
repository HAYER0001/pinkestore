"use client";

import Link from "next/link";
import { useCartStore, selectCartCount } from "@/store/useCartStore";
import { BRAND } from "@/lib/catalog";

/**
 * Header for the commerce routes. The homepage has fixed cinematic chrome that
 * blends against the WebGL layer; these pages have a light ground and need a
 * real, in-flow header instead of a blended overlay sitting on top of them.
 */
export function CommerceHeader() {
  const openCart = useCartStore((s) => s.openCart);
  const count = useCartStore(selectCartCount);

  return (
    <header
      className="sticky top-0 z-30 border-b border-[#1A1A1A]/12"
      style={{ background: "rgba(250,248,245,0.92)", backdropFilter: "blur(8px)" }}
    >
      <div className="mx-auto flex max-w-[1500px] items-center justify-between px-[clamp(1rem,3vw,3rem)] py-5">
        <Link href="/" className="block">
          <span
            className="t-micro-ed block"
            style={{ color: "#1A1A1A", letterSpacing: "var(--tracking-luxe-widest)" }}
          >
            {BRAND.name}
          </span>
          <span
            className="t-micro-ed mt-1 block"
            style={{ color: "#6B645A", letterSpacing: "var(--tracking-luxe)" }}
          >
            {BRAND.city}
          </span>
        </Link>

        <nav className="flex items-center gap-8">
          <Link
            href="/#pieces"
            className="t-micro-ed"
            style={{ color: "#1A1A1A", letterSpacing: "var(--tracking-luxe)" }}
          >
            Collection
          </Link>
          <button
            onClick={openCart}
            className="t-micro-ed"
            style={{
              color: "#1A1A1A",
              letterSpacing: "var(--tracking-luxe)",
              background: "none",
              border: "none",
              padding: 0,
              cursor: "pointer",
            }}
          >
            Bag ({count})
          </button>
        </nav>
      </div>
    </header>
  );
}
