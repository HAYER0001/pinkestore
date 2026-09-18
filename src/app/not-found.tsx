import Link from "next/link";
import type { Metadata } from "next";
import { PRODUCTS, CRAFTS, formatINR } from "@/lib/catalog";
import { heroImage } from "@/lib/shots";
import Image from "next/image";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { DisplayComposition, Standfirst } from "@/components/type/DisplayComposition";
import { ThreadRule } from "@/components/brand/ThreadRule";
import { CtaPair } from "@/components/site/Cta";

export const metadata: Metadata = {
  title: "Not found",
  robots: { index: false, follow: true },
};

/**
 * THE 404.
 *
 * This was Next's default — black Inter on white, no header, no way back. It
 * is also not a rare page for this particular shop: every piece is one of one,
 * so the day something sells, its URL keeps circulating in messages and on
 * Instagram and lands people exactly here. That is a real moment in the life
 * of this business, not an edge case, and the copy says what most likely
 * happened rather than "page not found".
 *
 * It offers the other pieces, because someone who followed a link to a shawl
 * wants a shawl.
 */
export default function NotFound() {
  const suggestions = PRODUCTS.slice(0, 3);

  return (
    <div className="ground-paper" style={{ background: "#FAF8F5", minHeight: "100svh" }}>
      <SiteHeader />

      <main className="mx-auto max-w-[1100px] px-[clamp(1rem,3vw,3rem)] pb-[clamp(4rem,10vh,7rem)]">
        <div className="pt-[clamp(3rem,10vh,6rem)]">
          <p className="ty-mono" style={{ color: "#8A6812", letterSpacing: "var(--tracking-luxe-widest)" }}>
            Nothing here
          </p>

          <DisplayComposition
            as="h1"
            className="mt-6"
            lines={[
              { text: "This one has gone", scale: "display" },
              { text: "or never was", scale: "title", italic: true },
            ]}
            style={{ color: "#1A1A1A" }}
          />

          <Standfirst className="mt-6" tone="#4A443C">
            Every piece here exists once, so links do stop working — usually
            because the thing at the end of it was bought. Occasionally we have
            simply moved a page. Either way, this is not where you meant to be.
          </Standfirst>

          <CtaPair
            className="mt-[clamp(2rem,5vh,3rem)]"
            tone="#1A1A1A"
            ground="#FAF8F5"
            primary={{ href: "/collection", label: "See what is here now" }}
            secondary={{ href: "/", label: "Start again" }}
          />
        </div>

        <ThreadRule tone="#C9A59F" slack={4} className="my-[clamp(3rem,8vh,5rem)]" />

        <section>
          <h2 className="ty-title" style={{ color: "#1A1A1A", margin: 0 }}>
            Still held
          </h2>
          <div className="mt-8 grid gap-[clamp(1rem,2vw,2rem)] sm:grid-cols-3">
            {suggestions.map((p) => {
              const craft = CRAFTS[p.craft];
              const hero = heroImage(p);
              return (
                <Link key={p.slug} href={`/product/${p.slug}`} style={{ textDecoration: "none" }}>
                  <span
                    className="relative block overflow-hidden"
                    style={{ aspectRatio: "3 / 4", background: "#F3EFE8" }}
                  >
                    <Image
                      src={hero.src}
                      alt={`${p.name} — ${craft.label}`}
                      fill
                      sizes="(max-width: 640px) 92vw, 30vw"
                      quality={80}
                      className="object-cover"
                    />
                  </span>
                  <span className="ty-mono mt-3 block" style={{ color: "#96605B" }}>
                    {craft.label}
                  </span>
                  <span className="ty-title block" style={{ color: "#1A1A1A" }}>
                    {p.name}
                  </span>
                  <span className="ty-caption block" style={{ color: "#6B645A" }}>
                    {formatINR(p.pricePaise)}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
