"use client";

import { useState } from "react";
import type { Product } from "@/lib/catalog";
import { EditorialCard } from "./EditorialCard";
import { QuickView } from "./QuickView";

/**
 * THE ASYMMETRIC GRID (item 44).
 *
 * A uniform three-column grid says "these are interchangeable units". They are
 * not — every piece here is the only one of itself, and a layout that treats a
 * Rs 65,000 kani shawl as one twelfth of a page is arguing against the shop.
 *
 * So the rhythm is 7+5 then 4+4+4 across twelve columns, and the second cell
 * of each wide row is dropped down a little. The offset is what stops it
 * reading as "two unequal boxes" and starts it reading as a spread.
 *
 * It collapses to one column below sm, where asymmetry is meaningless and the
 * only thing that matters is that the photograph is as wide as the phone.
 */

const SPANS = [7, 5, 4, 4, 4];
const DROP = [false, true, false, false, false];

export function CollectionGrid({ products }: { products: Product[] }) {
  const [quick, setQuick] = useState<string | null>(null);

  return (
    <>
      <div className="grid grid-cols-1 gap-x-[clamp(1rem,2.5vw,2.5rem)] gap-y-[clamp(2.5rem,6vh,4.5rem)] sm:grid-cols-12">
        {products.map((p, i) => {
          const slot = i % SPANS.length;
          return (
            <div
              key={p.slug}
              className="sm:col-span-full"
              style={{
                gridColumn: `span ${SPANS[slot]} / span ${SPANS[slot]}`,
                marginTop: DROP[slot] ? "clamp(0px, 5vw, 5rem)" : undefined,
              }}
            >
              <EditorialCard product={p} priority={i < 2} onQuickView={setQuick} />
            </div>
          );
        })}
      </div>

      <QuickView slug={quick} onClose={() => setQuick(null)} />
    </>
  );
}
