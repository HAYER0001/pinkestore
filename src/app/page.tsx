import Link from "next/link";
import { StoryScroll } from "@/components/ornament/story-scroll";
import { ShailiHero } from "@/components/shaili/shaili-hero";
import { AlnaRack } from "@/components/shaili/alna-rack";
import { Lattice } from "@/components/ornament/lattice";
import { OrnateFrame } from "@/components/ornament/ornate-frame";
import { Band } from "@/components/ornament/band";
import { Reveal } from "@/components/ornament/reveal";
import { ClothPanel } from "@/components/commerce/cloth-panel";
import { ProductCard } from "@/components/commerce/product-card";
import { PRODUCTS, CRAFTS, BRAND, getProduct, type Craft } from "@/lib/catalog";

const CRAFT_ORDER: Craft[] = [
  "madhubani-hand-painted",
  "sozni-hand-embroidered",
  "jamawar-kani",
  "lucknowi-chikankari",
  "kairi-print",
];

export default function Home() {
  const inStock = PRODUCTS.filter((p) => p.stock > 0);
  const madhubani = getProduct("madhubani-baraat-shawl")!;
  const jamawar = getProduct("jamawar-indigo-kani-shawl")!;
  const sozni = getProduct("sozni-ivory-pashmina")!;

  return (
    <main className="flex-1">
      <ShailiHero />

      {/* ============ 2 · THE STORY — illustrated, one timeline ============ */}
      <StoryScroll />

      {/* ============ 3 · CLOTH — photographic ============ */}
      <ClothPanel product={madhubani} ground="ground-madder" kicker="One of one" />

      {/* ============ 4 · CLOTH — photographic ============ */}
      <ClothPanel
        product={jamawar}
        ground="ground-ink"
        align="right"
        kicker="Woven, not printed"
      />

      <div id="pieces" className="scroll-mt-20">
        <AlnaRack />
      </div>

      {/* ============ 6 · CLOTH — photographic ============ */}
      <ClothPanel product={sozni} ground="ground-indigo" kicker="Months of needlework" />

      {/* ============ 7 · CRAFT — illustrated ============ */}
      <section className="ground-madder relative overflow-hidden">
        <Lattice />
        <div className="relative mx-auto max-w-7xl px-4 py-20 md:px-8 md:py-28">
          <h2 className="t-ornament t-display" style={{ color: "var(--surface-ink)" }}>
            Four traditions, one shop
          </h2>
          <p
            className="measure t-body mt-4"
            style={{ color: "var(--surface-ink)", opacity: 0.82 }}
          >
            None of these crafts are from Punjab. We are in {BRAND.city}; the cloth
            comes from Mithila, from Kashmir, from Lucknow. We say which is which,
            because the difference is the whole point.
          </p>
          <div className="my-10 ink-gold">
            <Band variant="kairi" />
          </div>

          <dl className="grid gap-10 sm:grid-cols-2">
            {CRAFT_ORDER.map((key) => {
              const c = CRAFTS[key];
              const count = PRODUCTS.filter((p) => p.craft === key).length;
              return (
                <Reveal key={key}>
                  <div
                    className="border-l-2 pl-6"
                    style={{ borderColor: "var(--surface-gold)" }}
                  >
                    <dt className="t-ornament t-heading" style={{ color: "var(--surface-ink)" }}>
                      {c.label}
                    </dt>
                    <p className="t-micro mt-1" style={{ color: "var(--surface-gold)" }}>
                      {c.region} · {count} piece{count === 1 ? "" : "s"}
                      {c.handmade ? "" : " · printed"}
                    </p>
                    <dd
                      className="measure t-small mt-3"
                      style={{ color: "var(--surface-ink)", opacity: 0.78 }}
                    >
                      {c.technique}
                    </dd>
                  </div>
                </Reveal>
              );
            })}
          </dl>
        </div>
      </section>

      {/* ============ 8 · FOOTER ============ */}
      <footer className="ground-ink relative overflow-hidden">
        <Lattice variant="gold" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 md:px-8">
          <div className="flex flex-wrap items-end justify-between gap-8">
            <div>
              <p className="t-ornament t-title" style={{ color: "var(--pk-ivory)" }}>
                {BRAND.name}
              </p>
              <p className="t-small mt-2" style={{ color: "var(--pk-ivory)", opacity: 0.66 }}>
                {BRAND.city}, {BRAND.state}, {BRAND.country}
              </p>
            </div>
            <a
              href={BRAND.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="t-small underline underline-offset-4"
              style={{ color: "var(--surface-gold)" }}
            >
              Instagram
            </a>
          </div>
          <div className="mt-10 ink-gold">
            <Band variant="wheat-lotus" />
          </div>
        </div>
      </footer>
    </main>
  );
}
