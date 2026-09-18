"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCartStore, selectCartTotal } from "@/store/useCartStore";
import { formatINR, CRAFTS, PRODUCTS, BRAND } from "@/lib/catalog";
import { CommerceHeader } from "@/components/ecommerce/CommerceHeader";

/* Indian delivery reality: a PIN code and a mobile number are not optional —
   couriers call before they deliver. */
const STATES = [
  "Andhra Pradesh", "Assam", "Bihar", "Chandigarh", "Chhattisgarh", "Delhi",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jammu & Kashmir",
  "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra",
  "Odisha", "Punjab", "Rajasthan", "Tamil Nadu", "Telangana", "Uttar Pradesh",
  "Uttarakhand", "West Bengal",
];

const INK = "#1A1A1A";
const MUTED = "#6B645A";

export function CheckoutForm() {
  const items = useCartStore((s) => s.items);
  const total = useCartStore(selectCartTotal);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (items.length === 0) {
    return (
      <div style={{ background: "#FAF8F5", minHeight: "100svh" }}>
        <CommerceHeader />
        <main className="mx-auto flex max-w-2xl flex-col items-center justify-center gap-6 px-6 py-40 text-center">
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 300,
              fontSize: "clamp(2rem,4vw,3rem)",
              letterSpacing: "-0.03em",
              color: INK,
            }}
          >
            Your bag is empty
          </h1>
          <Link
            href="/#pieces"
            className="t-micro-ed"
            style={{ color: "#8A2F3B", letterSpacing: "var(--tracking-luxe)" }}
          >
            See what is in stock
          </Link>
        </main>
      </div>
    );
  }

  const validate = (form: HTMLFormElement) => {
    const d = new FormData(form);
    const next: Record<string, string> = {};
    if (!String(d.get("name") ?? "").trim()) next.name = "We need a name for the parcel.";
    const phone = String(d.get("phone") ?? "").replace(/\D/g, "");
    if (phone.length !== 10) next.phone = "A 10-digit mobile — couriers call before delivery.";
    const pin = String(d.get("pin") ?? "").replace(/\D/g, "");
    if (pin.length !== 6) next.pin = "PIN code must be 6 digits.";
    if (!String(d.get("line1") ?? "").trim()) next.line1 = "Street address is required.";
    if (!String(d.get("city") ?? "").trim()) next.city = "City is required.";
    if (!/^\S+@\S+\.\S+$/.test(String(d.get("email") ?? ""))) next.email = "We send the receipt here.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  return (
    <div style={{ background: "#FAF8F5", minHeight: "100svh" }}>
      <CommerceHeader />

      <main className="mx-auto max-w-[1300px] px-[clamp(1rem,3vw,3rem)] py-14">
        <p className="t-micro-ed" style={{ color: "#8A6812", letterSpacing: "var(--tracking-luxe-widest)" }}>
          Checkout
        </p>
        <h1
          className="mt-4"
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 300,
            fontSize: "clamp(2.2rem,4.4vw,3.6rem)",
            letterSpacing: "-0.035em",
            color: INK,
          }}
        >
          Where it goes
        </h1>

        <div className="mt-14 grid gap-[clamp(2rem,4vw,5rem)] lg:grid-cols-[1.25fr_1fr]">
          <form
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              if (!validate(e.currentTarget)) return;
              alert("Address captured. Payment provider is not connected yet — see PAYMENTS.md.");
            }}
            className="space-y-7"
          >
            <Field name="name" label="Full name" error={errors.name} autoComplete="name" />
            <div className="grid gap-7 sm:grid-cols-2">
              <Field name="phone" label="Mobile" type="tel" inputMode="numeric" placeholder="10 digits" error={errors.phone} autoComplete="tel-national" />
              <Field name="email" label="Email" type="email" error={errors.email} autoComplete="email" />
            </div>
            <Field name="line1" label="Address" error={errors.line1} autoComplete="address-line1" />
            <Field name="line2" label="Apartment, landmark (optional)" autoComplete="address-line2" />
            <div className="grid gap-7 sm:grid-cols-3">
              <Field name="city" label="City" error={errors.city} autoComplete="address-level2" />
              <label className="block">
                <span className="t-micro-ed" style={{ color: MUTED, letterSpacing: "var(--tracking-luxe)" }}>
                  State
                </span>
                <select
                  name="state"
                  defaultValue="Punjab"
                  autoComplete="address-level1"
                  className="mt-3 w-full bg-transparent pb-2"
                  style={{
                    border: "none",
                    borderBottom: `1px solid rgba(26,26,26,0.28)`,
                    borderRadius: 0,
                    fontFamily: "var(--font-body)",
                    fontSize: "1rem",
                    color: INK,
                  }}
                >
                  {STATES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </label>
              <Field name="pin" label="PIN code" inputMode="numeric" error={errors.pin} autoComplete="postal-code" />
            </div>

            <button
              type="submit"
              className="mt-4 w-full py-6"
              style={{
                background: INK,
                color: "#FAF8F5",
                borderRadius: 0,
                border: "none",
                fontFamily: "var(--font-body)",
                fontSize: "0.6875rem",
                letterSpacing: "var(--tracking-luxe-widest)",
                textTransform: "uppercase",
                cursor: "pointer",
              }}
            >
              Continue to payment · {formatINR(total)}
            </button>

            <p className="t-body-ed" style={{ color: MUTED, fontSize: "0.875rem" }}>
              Ships from {BRAND.city}. We pack by hand and write to you with a
              tracking number.
            </p>
          </form>

          <aside className="lg:sticky lg:top-28 lg:h-fit">
            <h2 className="t-micro-ed" style={{ color: MUTED, letterSpacing: "var(--tracking-luxe-wide)" }}>
              Your order
            </h2>

            <ul className="mt-6 border-t border-[#1A1A1A]/14">
              {items.map((i) => {
                const p = PRODUCTS.find((x) => x.slug === i.id);
                return (
                  <li key={i.id} className="flex gap-5 border-b border-[#1A1A1A]/10 py-5">
                    <Image
                      src={i.imageSrc}
                      alt={i.title}
                      width={64}
                      height={80}
                      quality={75}
                      className="h-20 w-16 object-cover"
                      style={{ borderRadius: 0 }}
                    />
                    <div className="min-w-0 flex-1">
                      <p style={{ fontFamily: "var(--font-display)", fontSize: "1.0625rem", color: INK }}>
                        {i.title}
                      </p>
                      {p && (
                        <p className="t-micro-ed mt-1.5" style={{ color: MUTED, letterSpacing: "var(--tracking-luxe)" }}>
                          {CRAFTS[p.craft].label}
                        </p>
                      )}
                      {i.quantity > 1 && (
                        <p className="t-micro-ed mt-1" style={{ color: MUTED }}>Qty {i.quantity}</p>
                      )}
                    </div>
                    <p style={{ fontFamily: "var(--font-body)", fontSize: "0.875rem", color: INK }}>
                      {formatINR(i.price * i.quantity)}
                    </p>
                  </li>
                );
              })}
            </ul>

            <div className="mt-6 flex items-baseline justify-between">
              <span className="t-micro-ed" style={{ color: MUTED, letterSpacing: "var(--tracking-luxe-wide)" }}>
                Total
              </span>
              <span style={{ fontFamily: "var(--font-body)", fontSize: "1.35rem", color: INK }}>
                {formatINR(total)}
              </span>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

/**
 * Underlined fields, not boxes. A boxed input on a warm editorial ground reads
 * as a form; a ruled line reads as a ledger, which is what this is.
 */
function Field({
  name,
  label,
  error,
  ...rest
}: { name: string; label: string; error?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="t-micro-ed" style={{ color: MUTED, letterSpacing: "var(--tracking-luxe)" }}>
        {label}
      </span>
      <input
        name={name}
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-err` : undefined}
        className="mt-3 w-full bg-transparent pb-2"
        style={{
          border: "none",
          borderBottom: `1px solid ${error ? "#8A2F3B" : "rgba(26,26,26,0.28)"}`,
          borderRadius: 0,
          fontFamily: "var(--font-body)",
          fontSize: "1rem",
          color: INK,
          outline: "none",
        }}
        {...rest}
      />
      {error && (
        <span id={`${name}-err`} className="t-micro-ed mt-2 block" style={{ color: "#8A2F3B" }}>
          {error}
        </span>
      )}
    </label>
  );
}
