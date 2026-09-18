import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PRODUCTS, CRAFTS, formatINR, getProduct, BRAND } from "@/lib/catalog";
import { AddToBag } from "@/components/commerce/add-to-bag";
import { CommerceHeader } from "@/components/ecommerce/CommerceHeader";

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata(
  props: PageProps<"/product/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const p = getProduct(slug);
  if (!p) return {};
  const craft = CRAFTS[p.craft];
  return {
    title: `${p.name} — ${craft.label}`,
    description: p.blurb,
    openGraph: { images: [{ url: p.image, width: p.width, height: p.height }] },
  };
}

/**
 * Raw Mango's structural move, which the competitive scan identified as the
 * ceiling: a freely-scrolling image column against a STICKY information rail.
 * The cloth gets the room; the decision never leaves the screen.
 */
export default async function ProductPage(props: PageProps<"/product/[slug]">) {
  const { slug } = await props.params;
  const p = getProduct(slug);
  if (!p) notFound();

  const craft = CRAFTS[p.craft];
  const others = PRODUCTS.filter((x) => x.slug !== p.slug).slice(0, 3);
  const prov = p.provenance;
  const real = (v?: string) => (v && !v.startsWith("NEEDS_REAL_DATA") ? v : null);

  return (
    <div style={{ background: "#FAF8F5", minHeight: "100svh" }}>
      <CommerceHeader />

      <main className="mx-auto max-w-[1500px] px-[clamp(1rem,3vw,3rem)]">
        <nav className="py-6">
          <Link
            href="/#pieces"
            className="t-micro-ed"
            style={{ color: "#6B645A", letterSpacing: "var(--tracking-luxe)" }}
          >
            ← All pieces
          </Link>
        </nav>

        <div className="grid gap-[clamp(2rem,4vw,5rem)] pb-24 lg:grid-cols-[1.15fr_1fr]">
          {/* ---------- the cloth ---------- */}
          <div className="space-y-4">
            <div
              className="relative aspect-4/5 overflow-hidden"
              style={{ border: "1px solid rgba(26,26,26,0.14)" }}
            >
              <Image
                src={p.image}
                alt={`${p.name}, ${craft.label}`}
                fill
                quality={90}
                sizes="(max-width: 1024px) 94vw, 56vw"
                priority
                /* cropped into the weave — the source frames include a
                   mannequin, a vase and a patterned carpet */
                className="object-cover"
                style={{ transform: "scale(1.6)", objectPosition: "40% 55%" }}
              />
            </div>
            <div
              className="relative aspect-4/5 overflow-hidden"
              style={{ border: "1px solid rgba(26,26,26,0.14)" }}
            >
              <Image
                src={p.image}
                alt={`${p.name}, detail`}
                fill
                quality={90}
                sizes="(max-width: 1024px) 94vw, 56vw"
                loading="lazy"
                className="object-cover"
                style={{ transform: "scale(2.4)", objectPosition: "62% 38%" }}
              />
            </div>
            <p
              className="t-body-ed"
              style={{ color: "#6B645A", fontSize: "0.875rem" }}
            >
              Photographed as it arrived. What you see is the actual piece, not
              a sample of the design.
            </p>
          </div>

          {/* ---------- the rail ---------- */}
          <div className="lg:sticky lg:top-28 lg:h-fit lg:pb-16">
            <p
              className="t-micro-ed"
              style={{ color: "#8A6812", letterSpacing: "var(--tracking-luxe-wide)" }}
            >
              {craft.label} · {craft.region}
            </p>

            <h1
              className="mt-5"
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 300,
                fontSize: "clamp(2.4rem, 4.6vw, 4rem)",
                lineHeight: 0.98,
                letterSpacing: "-0.035em",
                color: "#1A1A1A",
              }}
            >
              {p.name}
              {p.nameLocal && (
                <span
                  lang={p.nameLocal.lang}
                  className="ml-4"
                  style={{ color: "#6B645A", fontSize: "0.62em" }}
                >
                  {p.nameLocal.text}
                </span>
              )}
            </h1>

            <p
              className="mt-6"
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "1.25rem",
                letterSpacing: "0.02em",
                color: "#1A1A1A",
              }}
            >
              {formatINR(p.pricePaise)}
            </p>

            {p.stock === 1 ? (
              <p
                className="t-micro-ed mt-3"
                style={{ color: "#8A2F3B", letterSpacing: "var(--tracking-luxe)" }}
              >
                One exists — these are not restocked
              </p>
            ) : p.stock > 1 ? (
              <p className="t-micro-ed mt-3" style={{ color: "#6B645A", letterSpacing: "var(--tracking-luxe)" }}>
                {p.stock} available
              </p>
            ) : (
              <p className="t-micro-ed mt-3" style={{ color: "#6B645A", letterSpacing: "var(--tracking-luxe)" }}>
                Sold
              </p>
            )}

            <p
              className="t-body-ed mt-7 max-w-[42ch]"
              style={{ color: "#3A352E", fontSize: "1.0625rem" }}
            >
              {p.blurb}
            </p>

            <AddToBag slug={p.slug} stock={p.stock} className="mt-9" />

            {/* technique taught at the point of decision — the scan found
                nobody in the category does this */}
            <section className="mt-12 border-t border-[#1A1A1A]/14 pt-8">
              <h2
                className="t-micro-ed"
                style={{ color: "#6B645A", letterSpacing: "var(--tracking-luxe-wide)" }}
              >
                How it is made
              </h2>
              <p
                className="t-body-ed mt-4 max-w-[44ch]"
                style={{ color: "#3A352E", fontSize: "1rem" }}
              >
                {craft.technique}
              </p>

              <dl className="mt-7 space-y-0">
                <Row label="Craft" value={craft.label} />
                <Row label="Made in" value={prov.madeIn} />
                {prov.artisan && <Row label="Made by" value={prov.artisan} />}
                <Row label="By hand" value={craft.handmade ? "Yes, entirely" : "No — printed"} />
                {real(prov.makingTime) && <Row label="Time to make" value={real(prov.makingTime)!} />}
                {real(prov.dimensions) && <Row label="Size" value={real(prov.dimensions)!} />}
                {prov.giCertificate && <Row label="GI certificate" value={prov.giCertificate} />}
              </dl>
            </section>

            <section className="mt-10 border-t border-[#1A1A1A]/14 pt-8">
              <h2
                className="t-micro-ed"
                style={{ color: "#6B645A", letterSpacing: "var(--tracking-luxe-wide)" }}
              >
                Buying from us
              </h2>
              <ul className="mt-4 space-y-2.5">
                {[
                  `Ships from ${BRAND.city}, ${BRAND.state}.`,
                  "Checked and packed by hand before it leaves.",
                  "Ask before you buy — we would rather you were certain.",
                ].map((t) => (
                  <li key={t} className="t-body-ed" style={{ color: "#6B645A", fontSize: "0.9375rem" }}>
                    {t}
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>
      </main>

      {/* ---------- also here ---------- */}
      <section
        className="border-t border-[#1A1A1A]/12"
        style={{ background: "#F3EFE8" }}
      >
        <div className="mx-auto max-w-[1500px] px-[clamp(1rem,3vw,3rem)] py-20">
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 300,
              fontSize: "clamp(1.6rem,3vw,2.4rem)",
              letterSpacing: "-0.03em",
              color: "#1A1A1A",
            }}
          >
            Also here
          </h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {others.map((o) => (
              <Link key={o.slug} href={`/product/${o.slug}`} className="group block">
                <div
                  className="relative aspect-4/5 overflow-hidden"
                  style={{ border: "1px solid rgba(26,26,26,0.14)" }}
                >
                  <Image
                    src={o.image}
                    alt={o.name}
                    fill
                    quality={80}
                    sizes="(max-width: 640px) 92vw, 30vw"
                    loading="lazy"
                    className="object-cover"
                    style={{ transform: "scale(1.7)", objectPosition: "40% 56%" }}
                  />
                </div>
                <p
                  className="mt-4"
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "1.25rem",
                    color: "#1A1A1A",
                  }}
                >
                  {o.name}
                </p>
                <p
                  className="t-micro-ed mt-1"
                  style={{ color: "#6B645A", letterSpacing: "var(--tracking-luxe)" }}
                >
                  {formatINR(o.pricePaise)}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-8 border-b border-[#1A1A1A]/10 py-3">
      <dt className="t-micro-ed" style={{ color: "#6B645A", letterSpacing: "var(--tracking-luxe)" }}>
        {label}
      </dt>
      <dd
        className="text-right"
        style={{ fontFamily: "var(--font-body)", fontSize: "0.875rem", color: "#1A1A1A" }}
      >
        {value}
      </dd>
    </div>
  );
}
