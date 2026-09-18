"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { PRODUCTS } from "@/lib/catalog";

/**
 * THE CART.
 *
 * Zustand rather than Context: Context re-renders every consumer whenever any
 * part of the value changes, so a quantity bump in one line would re-render the
 * drawer, the header count, and every button that merely dispatches. Zustand
 * lets each component subscribe to precisely the slice it reads.
 */

export interface CartItem {
  id: string;          // product slug
  title: string;
  price: number;       // paise, integer — never floats for money
  quantity: number;
  imageSrc: string;
  variant?: string;    // e.g. "Unstitched" — most pieces have none
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;

  addItem: (item: Omit<CartItem, "quantity">, qty?: number) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, qty: number) => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  clearCart: () => void;
}

/**
 * Stock is REAL here — most pieces are literally one of one. The cap lives in
 * the store, not in the UI, so no button, keyboard path, or restored
 * localStorage payload can ever exceed it.
 */
const capToStock = (id: string, qty: number) => {
  const p = PRODUCTS.find((x) => x.slug === id);
  return Math.max(0, Math.min(qty, p?.stock ?? 0));
};

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      isOpen: false,

      addItem: (item, qty = 1) =>
        set((s) => {
          const existing = s.items.find((i) => i.id === item.id);
          const next = capToStock(item.id, (existing?.quantity ?? 0) + qty);
          if (next === 0) return s;
          return {
            isOpen: true,
            items: existing
              ? s.items.map((i) => (i.id === item.id ? { ...i, quantity: next } : i))
              : [...s.items, { ...item, quantity: next }],
          };
        }),

      removeItem: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),

      updateQuantity: (id, qty) =>
        set((s) => {
          const n = capToStock(id, qty);
          return n === 0
            ? { items: s.items.filter((i) => i.id !== id) }
            : { items: s.items.map((i) => (i.id === id ? { ...i, quantity: n } : i)) };
        }),

      toggleCart: () => set((s) => ({ isOpen: !s.isOpen })),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      clearCart: () => set({ items: [] }),
    }),
    {
      name: "pk-cart",
      storage: createJSONStorage(() => localStorage),
      /* isOpen is deliberately NOT persisted — a page that loads with the cart
         already slid open is disorienting and hides the thing you navigated to. */
      partialize: (s) => ({ items: s.items }),
      version: 1,
      /* Prices and stock live in the catalogue, not in localStorage. Re-derive
         them on load so a price change is never overridden by a stale cart. */
      migrate: (persisted) => persisted as { items: CartItem[] },
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        state.items = state.items
          .map((i) => {
            const p = PRODUCTS.find((x) => x.slug === i.id);
            if (!p) return null;
            return {
              ...i,
              title: p.name,
              price: p.pricePaise,
              imageSrc: p.image,
              quantity: capToStock(i.id, i.quantity),
            };
          })
          .filter((i): i is CartItem => i !== null && i.quantity > 0);
      },
    },
  ),
);

/* ---- derived selectors ----
   Exported as functions so components subscribe to the slice they need and
   nothing more. */
export const selectCartTotal = (s: CartState) =>
  s.items.reduce((sum, i) => sum + i.price * i.quantity, 0);

export const selectCartCount = (s: CartState) =>
  s.items.reduce((n, i) => n + i.quantity, 0);
