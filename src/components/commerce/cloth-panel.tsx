import Image from "next/image";
import Link from "next/link";
import { Lattice } from "@/components/ornament/lattice";
import { CRAFTS, formatINR, type Product } from "@/lib/catalog";

/**
 * A full-screen photographic chapter. The cloth gets the whole viewport and is
 * cropped hard into the pattern, so weave and stitch actually read — the scan
 * found no site in the category does this. The ornament recedes to a frame.
 */
export function ClothPanel({
  product: p,
  ground = "ground-madder",
  align = "left",
  kicker,
}: {
  product: Product;
  ground?: "ground-madder" | "ground-indigo" | "ground-ink";
  align?: "left" | "right";
  kicker: string;
}) {
  const craft = CRAFTS[p.craft];
  return (
    <section className={`${ground} relative overflow-hidden`}>
      <Lattice />
      <div
        className={`relative mx-auto grid max-w-7xl items-center gap-8 px-4 py-16 md:px-8 md:py-24 lg:grid-cols-2 lg:gap-14 ${
          align === "right" ? "lg:[direction:rtl]" : ""
        }`}
      >
        <div className="lg:[direction:ltr]">
          <p className="t-micro" style={{ color: "var(--surface-gold)" }}>
            {kicker}
          </p>
          <h2
            className="t-ornament t-display mt-3"
            style={{ color: "var(--surface-ink)" }}
          >
            {p.name}
            {p.nameLocal && (
              <span lang={p.nameLocal.lang} className="ml-3 opacity-70">
                {p.nameLocal.text}
              </span>
            )}
          </h2>
          <p className="t-micro mt-3" style={{ color: "var(--surface-gold)" }}>
            {craft.label} · {craft.region}
          </p>
          <p
            className="measure t-body mt-5"
            style={{ color: "var(--surface-ink)", opacity: 0.82 }}
          >
            {p.blurb}
          </p>
          <p
            className="measure t-small mt-4"
            style={{ color: "var(--surface-ink)", opacity: 0.62 }}
          >
            {craft.technique}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-5">
            <Link
              href={`/product/${p.slug}`}
              className="rounded-sm px-7 py-3.5 transition-opacity duration-200 hover:opacity-90"
              style={{ background: "var(--surface-gold)", color: "#221A08" }}
            >
              See this piece
            </Link>
            <span
              className="font-mono t-small"
              style={{ color: "var(--surface-ink)", opacity: 0.8 }}
            >
              {formatINR(p.pricePaise)}
            </span>
            {p.stock === 1 && (
              <span className="t-micro" style={{ color: "var(--surface-gold)" }}>
                Only one exists
              </span>
            )}
          </div>
        </div>

        {/* Cropped hard into the cloth — weave first, mannequin never. */}
        <div className="relative lg:[direction:ltr]">
          <div
            className="relative aspect-4/5 overflow-hidden rounded-sm"
            style={{ border: "1px solid color-mix(in srgb, var(--surface-gold) 45%, transparent)" }}
          >
            <Image
              src={p.image}
              alt={`${p.name} — ${craft.label}, detail`}
              width={p.width}
              height={p.height}
              quality={90}
              sizes="(max-width: 1024px) 92vw, 46vw"
              className="h-full w-full scale-[1.7] object-cover object-[38%_58%]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
