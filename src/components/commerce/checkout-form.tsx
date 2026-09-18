"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCartStore, selectCartTotal } from "@/store/useCartStore";
import { PRODUCTS, CRAFTS, formatINR, BRAND } from "@/lib/catalog";
import { heroImage } from "@/lib/shots";
import { SiteHeader } from "@/components/site/SiteHeader";
import { ThreadRule } from "@/components/brand/ThreadRule";
import { DisplayComposition, Standfirst } from "@/components/type/DisplayComposition";

/**
 * CHECKOUT — HONEST ABOUT WHAT IT CAN DO (items 97 + 98).
 *
 * WHAT THIS REPLACED, AND WHY.
 *
 * The previous version collected full name, mobile, email and postal address,
 * validated them, and then called alert("Payment provider is not connected
 * yet"). That is worse than having no checkout. It asks a stranger to hand
 * over their address and phone number and then throws them away — and it looks
 * exactly like a real checkout right up until the alert, so they have no way
 * to know before they type. A form that cannot deliver what it implies should
 * not collect the data.
 *
 * It also promised, in a line under the button, that "we pack by hand and
 * write to you with a tracking number" — while /shipping states plainly that
 * no courier, no dispatch time and no tracking arrangement has been decided.
 * Two pages of the same site contradicting each other, with the unverifiable
 * claim on the one where money changes hands.
 *
 * So until Razorpay is connected this is a CONCIERGE HANDOVER, which is what a
 * small shop selling one-of-one pieces at Rs 18,000 to Rs 65,000 does anyway.
 * The buyer sees exactly what they are buying, gets a reference they can
 * quote, and reaches a person. No PII is collected, because there is nowhere
 * to put it. The address form comes back the day there is a processor behind
 * it — noted in TOMORROW.md.
 */

const INK = "#1A1A1A";
const MUTED = "#6B645A";

/** A stable, offline reference from the cart contents. Not an order id — there
 *  is no order system — just something both sides can say out loud. */
function reference(items: { id: string; quantity: number }[]) {
  const seed = items
    .map((i) => `${i.id}x${i.quantity}`)
    .sort()
    .join("|");
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return `PK-${h.toString(36).toUpperCase().padStart(6, "0").slice(0, 6)}`;
}

export function CheckoutForm() {
  const items = useCartStore((s) => s.items);
  const total = useCartStore(selectCartTotal);
  /* The reference is derived from cart state, which is rehydrated from
     localStorage — so it must not be rendered until after mount or the server
     and client disagree. */
  const [ref, setRef] = useState<string | null>(null);
  useEffect(() => setRef(items.length ? reference(items) : null), [items]);

  if (items.length === 0) {
    return (
      <div className="ground-paper" style={{ background: "#FAF8F5", minHeight: "100svh" }}>
        <SiteHeader />
        <main className="mx-auto flex max-w-2xl flex-col items-center gap-6 px-6 py-40 text-center">
          <h1 className="ty-display" style={{ color: INK, margin: 0 }}>
            Your bag is empty
          </h1>
          <Link
            href="/collection"
            className="ty-mono"
            style={{ color: INK, borderBottom: "1px solid #96605B", paddingBottom: 3, textDecoration: "none" }}
          >
            See the collection
          </Link>
        </main>
      </div>
    );
  }

  const lines = items
    .map((i) => ({ item: i, product: PRODUCTS.find((p) => p.slug === i.id) }))
    .filter((l): l is { item: (typeof items)[number]; product: (typeof PRODUCTS)[number] } => !!l.product);

  const message = `Hello — I would like to buy ${lines
    .map((l) => `${l.product.name}${l.item.quantity > 1 ? ` x${l.item.quantity}` : ""}`)
    .join(", ")}. Reference ${ref ?? ""}.`;

  return (
    <div className="ground-paper" style={{ background: "#FAF8F5", minHeight: "100svh" }}>
      <SiteHeader />

      <main className="mx-auto max-w-[1100px] px-[clamp(1rem,3vw,3rem)] pb-[clamp(4rem,10vh,7rem)]">
        <div className="pt-[clamp(2rem,6vh,4rem)]">
          <p className="ty-mono" style={{ color: "#8A6812", letterSpacing: "var(--tracking-luxe-widest)" }}>
            Checkout
          </p>

          <DisplayComposition
            as="h1"
            className="mt-6"
            lines={[
              { text: "We finish these", scale: "display" },
              { text: "by hand too", scale: "title", italic: true },
            ]}
            style={{ color: INK }}
          />

          <Standfirst className="mt-6" tone="#4A443C">
            Card payment is not switched on yet, so we are not going to pretend
            it is. Every piece here is a single object, and at these values we
            complete purchases personally — you will speak to someone before you
            pay, which is how this should work anyway.
          </Standfirst>
        </div>

        <ThreadRule tone="#C9A59F" slack={4} className="my-[clamp(2.5rem,7vh,4.5rem)]" />

        <div className="grid gap-[clamp(2rem,4vw,4rem)] lg:grid-cols-[1.2fr_1fr]">
          {/* ---------------- what you are buying ---------------- */}
          <section>
            <h2 className="ty-title" style={{ color: INK, margin: 0 }}>
              Your bag
            </h2>

            <ul className="mt-7 space-y-7" style={{ margin: "1.75rem 0 0", padding: 0, listStyle: "none" }}>
              {lines.map(({ item, product }) => {
                const craft = CRAFTS[product.craft];
                const hero = heroImage(product);
                return (
                  <li key={item.id} className="flex gap-5">
                    <Link
                      href={`/product/${product.slug}`}
                      className="relative block shrink-0 overflow-hidden"
                      style={{ width: 88, height: 117, background: "#F3EFE8" }}
                    >
                      <Image src={hero.src} alt={product.name} fill sizes="88px" className="object-cover" />
                    </Link>

                    <div className="min-w-0 flex-1">
                      <p className="ty-mono" style={{ color: "#96605B", margin: 0 }}>
                        {craft.label}
                      </p>
                      <p className="ty-title" style={{ color: INK, margin: "0.35rem 0 0" }}>
                        {product.name}
                      </p>
                      <p className="ty-caption" style={{ color: MUTED, margin: "0.2rem 0 0" }}>
                        {craft.region}
                        {item.quantity > 1 ? ` · ${item.quantity}` : ""}
                      </p>
                    </div>

                    <p
                      className="shrink-0"
                      style={{
                        fontFamily: "var(--font-display)",
                        fontWeight: 300,
                        fontSize: "1.25rem",
                        letterSpacing: "-0.02em",
                        color: INK,
                        margin: 0,
                      }}
                    >
                      {formatINR(product.pricePaise * item.quantity)}
                    </p>
                  </li>
                );
              })}
            </ul>

            <ThreadRule tone="#C9A59F" slack={3} className="my-8" />

            <div className="flex items-baseline justify-between">
              <span className="ty-mono" style={{ color: MUTED }}>
                Total
              </span>
              <span
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 300,
                  fontSize: "clamp(1.6rem,2.4vw,2.1rem)",
                  letterSpacing: "-0.025em",
                  color: INK,
                }}
              >
                {formatINR(total)}
              </span>
            </div>

            {/* Reassurance (item 97) — only things that are actually true. No
                "secure checkout" badge for a checkout that does not exist, no
                delivery estimate for a courier nobody has chosen. */}
            <ul
              className="mt-9 space-y-3"
              style={{ margin: "2.25rem 0 0", padding: 0, listStyle: "none" }}
            >
              {[
                "Nothing is charged here. You will agree the price and the payment method with a person first.",
                "Every piece in this bag is the only one of itself. It stays held while we are talking.",
                `Sent from ${BRAND.city}. What it costs to send is agreed with you before anything moves — we would rather quote it than publish a number we might have to break.`,
              ].map((line) => (
                <li key={line} className="flex gap-3">
                  <span aria-hidden style={{ color: "#96605B" }}>
                    ·
                  </span>
                  <span className="ty-read" style={{ color: "#4A443C" }}>
                    {line}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          {/* ---------------- how to actually buy it ---------------- */}
          <aside className="lg:sticky lg:top-32 lg:h-fit">
            <div style={{ background: "#F3EFE8", padding: "clamp(1.5rem,3vw,2.25rem)" }}>
              <h2 className="ty-title" style={{ color: INK, margin: 0 }}>
                Complete this purchase
              </h2>

              <p className="ty-read mt-4" style={{ color: "#4A443C" }}>
                Message the shop with the reference below. You will get a reply
                from a person, not a queue.
              </p>

              <div className="mt-6" style={{ background: "#FAF8F5", padding: "1rem 1.25rem" }}>
                <p className="ty-mono" style={{ color: MUTED, margin: 0 }}>
                  Your reference
                </p>
                <p
                  data-order-ref
                  style={{
                    fontFamily: "var(--font-geist-mono, monospace)",
                    fontSize: "1.25rem",
                    letterSpacing: "0.1em",
                    color: INK,
                    margin: "0.35rem 0 0",
                  }}
                >
                  {ref ?? "—"}
                </p>
              </div>

              <a
                href={BRAND.instagram}
                className="mt-7 block w-full py-5 text-center"
                style={{
                  background: INK,
                  color: "#FAF8F5",
                  fontFamily: "var(--font-body)",
                  fontSize: "0.6875rem",
                  letterSpacing: "var(--tracking-luxe-widest)",
                  textTransform: "uppercase",
                  textDecoration: "none",
                }}
              >
                Message @the_pinkestore
              </a>

              <details className="mt-6">
                <summary className="ty-mono" style={{ color: MUTED, cursor: "pointer" }}>
                  What to send
                </summary>
                <p
                  className="ty-caption mt-3"
                  style={{ color: "#4A443C", background: "#FAF8F5", padding: "0.85rem 1rem" }}
                >
                  {message}
                </p>
              </details>

              <p className="ty-caption mt-7" style={{ color: MUTED }}>
                We are not collecting your address on this page. There is nowhere
                to send it yet, and asking for it anyway would be theatre.
              </p>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
