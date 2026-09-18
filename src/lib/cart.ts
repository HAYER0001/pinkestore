"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { PRODUCTS, type Product } from "./catalog";

export interface CartLine {
  slug: string;
  qty: number;
}

interface CartState {
  lines: CartLine[];
  open: boolean;
  add: (slug: string, qty?: number) => void;
  remove: (slug: string) => void;
  setQty: (slug: string, qty: number) => void;
  setOpen: (open: boolean) => void;
  clear: () => void;
}

/** Stock is real here — most pieces are literally one of one. Never exceed it. */
const cap = (slug: string, qty: number) => {
  const p = PRODUCTS.find((x) => x.slug === slug);
  return Math.max(0, Math.min(qty, p?.stock ?? 0));
};

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      open: false,
      add: (slug, qty = 1) =>
        set((s) => {
          const existing = s.lines.find((l) => l.slug === slug);
          const next = cap(slug, (existing?.qty ?? 0) + qty);
          if (next === 0) return s;
          return {
            open: true,
            lines: existing
              ? s.lines.map((l) => (l.slug === slug ? { ...l, qty: next } : l))
              : [...s.lines, { slug, qty: next }],
          };
        }),
      remove: (slug) =>
        set((s) => ({ lines: s.lines.filter((l) => l.slug !== slug) })),
      setQty: (slug, qty) =>
        set((s) => {
          const n = cap(slug, qty);
          return n === 0
            ? { lines: s.lines.filter((l) => l.slug !== slug) }
            : { lines: s.lines.map((l) => (l.slug === slug ? { ...l, qty: n } : l)) };
        }),
      setOpen: (open) => set({ open }),
      clear: () => set({ lines: [] }),
    }),
    { name: "pk-cart", partialize: (s) => ({ lines: s.lines }) },
  ),
);

export interface HydratedLine extends CartLine {
  product: Product;
  subtotalPaise: number;
}

export const hydrate = (lines: CartLine[]): HydratedLine[] =>
  lines
    .map((l) => {
      const product = PRODUCTS.find((p) => p.slug === l.slug);
      return product
        ? { ...l, product, subtotalPaise: product.pricePaise * l.qty }
        : null;
    })
    .filter((x): x is HydratedLine => x !== null);

export const cartTotal = (lines: CartLine[]) =>
  hydrate(lines).reduce((sum, l) => sum + l.subtotalPaise, 0);

export const cartCount = (lines: CartLine[]) =>
  lines.reduce((n, l) => n + l.qty, 0);
