import { Hero } from "@/components/motion/hero";
import { CraftStory } from "@/components/motion/craft-story";
import { BentoGallery } from "@/components/motion/bento-gallery";
import { AlnaRack } from "@/components/shaili/alna-rack";
import { ClothPanel } from "@/components/commerce/cloth-panel";
import { getProduct, BRAND } from "@/lib/catalog";

export default function Home() {
  const jamawar = getProduct("jamawar-indigo-kani-shawl")!;

  return (
    <main className="flex-1">
      {/* 1 · magnetic hero — tilt, masked word stagger, magnetic CTA */}
      <Hero />

      {/* 2 · the story, wiped in gold at scroll pace */}
      <CraftStory />

      {/* 3 · the collection, bento */}
      <BentoGallery />

      {/* 4 · one piece, full bleed */}
      <ClothPanel product={jamawar} ground="ground-ink" align="right" kicker="Woven, not printed" />

      {/* 5 · the rack — drag it, the cloth swings */}
      <AlnaRack />

      <footer className="relative overflow-hidden" style={{ background: "#12100E" }}>
        <div className="mx-auto max-w-7xl px-4 py-16 md:px-8">
          <div className="flex flex-wrap items-end justify-between gap-8">
            <div>
              <p className="font-display" style={{ color: "#F2E9D8", fontSize: "var(--fs-4xl)" }}>
                {BRAND.name}
              </p>
              <p className="font-mono mt-2" style={{ color: "#F2E9D8", opacity: 0.6, fontSize: "var(--fs-md)" }}>
                {BRAND.city}, {BRAND.state}, {BRAND.country}
              </p>
            </div>
            <a
              href={BRAND.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono underline underline-offset-4"
              style={{ color: "#E8BC57", fontSize: "var(--fs-md)" }}
            >
              Instagram
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
