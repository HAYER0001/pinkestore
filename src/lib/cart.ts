"use client";

/**
 * COMPATIBILITY ADAPTER.
 *
 * The cart moved to /store/useCartStore.ts in Phase 9 with a richer CartItem
 * shape. Rather than leave two Zustand stores fighting over the same
 * localStorage key — which would silently drop items depending on mount order —
 * this module now delegates entirely.
 *
 * `useCart` keeps the old selector signature so existing call sites compile
 * unchanged. New code should import useCartStore directly.
 */

import { useCartStore, type CartItem } from "@/store/useCartStore";
import { PRODUCTS, type Product } from "./catalog";

export { formatINR } from "./catalog";

interface LegacyShape {
  lines: { slug: string; qty: number }[];
  open: boolean;
  add: (slug: string, qty?: number) => void;
  remove: (slug: string) => void;
  setQty: (slug: string, qty: number) => void;
  setOpen: (open: boolean) => void;
  clear: () => void;
}

/**
 * The selector receives a stable projection of the new store. Building the
 * object inside the selector would create a new reference every render and
 * Zustand would loop — so each field is pulled from the store individually and
 * the object is assembled by useCart itself, memo-free but referentially fine
 * because every member is a stable store action or a primitive.
 */
export function useCart<T = LegacyShape>(selector?: (s: LegacyShape) => T): T {
  const items = useCartStore((s) => s.items);
  const isOpen = useCartStore((s) => s.isOpen);
  const addItem = useCartStore((s) => s.addItem);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const openCart = useCartStore((s) => s.openCart);
  const closeCart = useCartStore((s) => s.closeCart);
  const clearCart = useCartStore((s) => s.clearCart);

  const shape: LegacyShape = {
    lines: items.map((i) => ({ slug: i.id, qty: i.quantity })),
    open: isOpen,
    add: (slug, qty = 1) => {
      const p = PRODUCTS.find((x) => x.slug === slug);
      if (!p) return;
      addItem(
        { id: p.slug, title: p.name, price: p.pricePaise, imageSrc: p.image },
        qty,
      );
    },
    remove: removeItem,
    setQty: updateQuantity,
    setOpen: (v) => (v ? openCart() : closeCart()),
    clear: clearCart,
  };

  return (selector ? selector(shape) : shape) as T;
}

export interface HydratedLine {
  slug: string;
  qty: number;
  product: Product;
  subtotalPaise: number;
}

export const hydrate = (lines: { slug: string; qty: number }[]): HydratedLine[] =>
  lines
    .map((l) => {
      const product = PRODUCTS.find((p) => p.slug === l.slug);
      return product
        ? { ...l, product, subtotalPaise: product.pricePaise * l.qty }
        : null;
    })
    .filter((x): x is HydratedLine => x !== null);

export const cartTotal = (lines: { slug: string; qty: number }[]) =>
  hydrate(lines).reduce((sum, l) => sum + l.subtotalPaise, 0);

export const cartCount = (lines: { slug: string; qty: number }[]) =>
  lines.reduce((n, l) => n + l.qty, 0);

export type { CartItem };
