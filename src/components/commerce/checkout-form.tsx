"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart, hydrate, cartTotal } from "@/lib/cart";
import { formatINR, CRAFTS, BRAND } from "@/lib/catalog";
import { Band } from "@/components/ornament/band";

/* Indian delivery reality: PIN code and a phone number are not optional. */
const STATES = [
  "Andhra Pradesh", "Assam", "Bihar", "Chandigarh", "Chhattisgarh", "Delhi",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jammu & Kashmir",
  "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra",
  "Odisha", "Punjab", "Rajasthan", "Tamil Nadu", "Telangana", "Uttar Pradesh",
  "Uttarakhand", "West Bengal",
];

export function CheckoutForm() {
  const { lines } = useCart();
  const items = hydrate(lines);
  const total = cartTotal(lines);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (items.length === 0) {
    return (
      <main className="mx-auto flex max-w-2xl flex-1 flex-col items-center justify-center gap-4 px-4 py-24 text-center">
        <h1 className="font-display t-title text-pk-fg">Your bag is empty</h1>
        <Link href="/" className="t-body text-pk-accent underline underline-offset-4">
          See what is in stock
        </Link>
      </main>
    );
  }

  const validate = (form: HTMLFormElement) => {
    const d = new FormData(form);
    const next: Record<string, string> = {};
    if (!String(d.get("name") ?? "").trim()) next.name = "We need a name for the parcel.";
    const phone = String(d.get("phone") ?? "").replace(/\D/g, "");
    if (phone.length !== 10) next.phone = "A 10-digit mobile number — couriers call before delivery.";
    const pin = String(d.get("pin") ?? "").replace(/\D/g, "");
    if (pin.length !== 6) next.pin = "PIN code must be 6 digits.";
    if (!String(d.get("line1") ?? "").trim()) next.line1 = "Street address is required.";
    if (!String(d.get("city") ?? "").trim()) next.city = "City is required.";
    const email = String(d.get("email") ?? "");
    if (!/^\S+@\S+\.\S+$/.test(email)) next.email = "We send the receipt here.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  return (
    <main className="mx-auto max-w-6xl flex-1 px-4 py-10 md:px-8">
      <Link href="/" className="t-small text-pk-fg-muted hover:text-pk-fg">
        ← Keep looking
      </Link>
      <h1 className="font-display t-title mt-4 text-pk-fg">Checkout</h1>
      <Band variant="rule" className="mb-10 mt-5" />

      <div className="grid gap-12 md:grid-cols-[1.2fr_1fr]">
        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            if (!validate(e.currentTarget)) return;
            /* Payment provider is not connected yet — see PAYMENTS.md. */
            alert(
              "Address captured. Payment provider is not connected yet — see PAYMENTS.md.",
            );
          }}
          className="space-y-6"
        >
          <fieldset className="space-y-4">
            <legend className="t-micro text-pk-fg-subtle">Where it goes</legend>
            <Field name="name" label="Full name" error={errors.name} autoComplete="name" />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                name="phone"
                label="Mobile"
                type="tel"
                inputMode="numeric"
                placeholder="10 digits"
                error={errors.phone}
                autoComplete="tel-national"
              />
              <Field
                name="email"
                label="Email"
                type="email"
                error={errors.email}
                autoComplete="email"
              />
            </div>
            <Field name="line1" label="Address" error={errors.line1} autoComplete="address-line1" />
            <Field
              name="line2"
              label="Apartment, landmark (optional)"
              autoComplete="address-line2"
            />
            <div className="grid gap-4 sm:grid-cols-3">
              <Field name="city" label="City" error={errors.city} autoComplete="address-level2" />
              <label className="block">
                <span className="t-small block text-pk-fg-muted">State</span>
                <select
                  name="state"
                  defaultValue="Punjab"
                  autoComplete="address-level1"
                  className="mt-1.5 w-full rounded-sm border border-pk-border-strong bg-pk-surface px-3 py-2.5 text-pk-fg"
                >
                  {STATES.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </label>
              <Field
                name="pin"
                label="PIN code"
                inputMode="numeric"
                error={errors.pin}
                autoComplete="postal-code"
              />
            </div>
          </fieldset>

          <button
            type="submit"
            className="w-full rounded-sm px-6 py-4 text-center transition-colors duration-200"
            style={{ background: "var(--pk-accent-solid)", color: "var(--pk-on-accent)" }}
          >
            Continue to payment · {formatINR(total)}
          </button>
          <p className="t-small text-pk-fg-subtle">
            Ships from {BRAND.city}. We pack by hand and write to you with a
            tracking number.
          </p>
        </form>

        <aside className="md:sticky md:top-24 md:h-fit">
          <h2 className="t-micro text-pk-fg-subtle">Your order</h2>
          <Band variant="rule" className="mb-5 mt-3" />
          <ul className="space-y-5">
            {items.map(({ product: p, qty, subtotalPaise }) => (
              <li key={p.slug} className="flex gap-4">
                <Image
                  src={p.image}
                  alt={p.name}
                  width={64}
                  height={86}
                  quality={75}
                  className="h-[86px] w-16 rounded-sm object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="t-body text-pk-fg">{p.name}</p>
                  <p className="t-small text-pk-fg-muted">{CRAFTS[p.craft].label}</p>
                  {qty > 1 && <p className="t-small text-pk-fg-subtle">Qty {qty}</p>}
                </div>
                <p className="font-mono t-small text-pk-fg">{formatINR(subtotalPaise)}</p>
              </li>
            ))}
          </ul>
          <Band variant="rule" className="my-5" />
          <div className="flex items-baseline justify-between">
            <span className="t-body text-pk-fg-muted">Total</span>
            <span className="font-mono t-heading text-pk-fg">{formatINR(total)}</span>
          </div>
        </aside>
      </div>
    </main>
  );
}

function Field({
  name,
  label,
  error,
  ...rest
}: {
  name: string;
  label: string;
  error?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="t-small block text-pk-fg-muted">{label}</span>
      <input
        name={name}
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-err` : undefined}
        className="mt-1.5 w-full rounded-sm border bg-pk-surface px-3 py-2.5 text-pk-fg"
        style={{ borderColor: error ? "var(--pk-danger)" : "var(--pk-border-strong)" }}
        {...rest}
      />
      {error && (
        <span id={`${name}-err`} className="t-small mt-1 block" style={{ color: "var(--pk-danger)" }}>
          {error}
        </span>
      )}
    </label>
  );
}
