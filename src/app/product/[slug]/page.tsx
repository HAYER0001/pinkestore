import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PRODUCTS, CRAFTS, formatINR, getProduct, BRAND } from "@/lib/catalog";
import { AddToBag } from "@/components/commerce/add-to-bag";
import { Band } from "@/components/ornament/band";

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

export default async function ProductPage(props: PageProps<"/product/[slug]">) {
  const { slug } = await props.params;
  const p = getProduct(slug);
  if (!p) notFound();

  const craft = CRAFTS[p.craft];
  const others = PRODUCTS.filter((x) => x.slug !== p.slug).slice(0, 3);

  return (
    <main className="flex-1">
      <div className="mx-auto max-w-6xl px-4 md:px-8">
        <nav className="py-4">
          <Link href="/" className="t-small text-pk-fg-muted hover:text-pk-fg">
            ← All pieces
          </Link>
        </nav>

        {/* Raw Mango's move: a free-scrolling image column against a sticky
            rail. The cloth gets the room; the decision stays reachable. */}
        <div className="grid gap-10 pb-20 md:grid-cols-2 md:gap-14">
          <div className="space-y-4">
            <Image
              src={p.image}
              alt={`${p.name}, full view`}
              width={p.width}
              height={p.height}
              quality={90}
              sizes="(max-width: 768px) 100vw, 50vw"
              loading="eager"
              fetchPriority="high"
              className="w-full rounded-sm border border-pk-border object-cover"
            />
            <p className="t-small text-pk-fg-subtle">
              Photographed as it arrives — on the form, unstyled. What you see is
              the actual piece, not a sample of the design.
            </p>
          </div>

          <div className="md:sticky md:top-24 md:h-fit md:pb-10">
            <p className="t-micro text-pk-fg-subtle">{craft.label}</p>
            <h1 className="font-display t-title mt-2 text-pk-fg">
              {p.name}
              {p.nameLocal && (
                <span lang={p.nameLocal.lang} className="ml-3 text-pk-fg-muted">
                  {p.nameLocal.text}
                </span>
              )}
            </h1>

            <p className="font-mono t-heading mt-4 text-pk-fg">
              {formatINR(p.pricePaise)}
            </p>

            {/* Honest scarcity. The scan found the whole category fakes this
                with countdown timers while selling genuinely unique goods. */}
            {p.stock === 1 ? (
              <p className="t-small mt-2 text-pk-accent">
                One exists. When it goes, it is gone — these are not restocked.
              </p>
            ) : p.stock > 1 ? (
              <p className="t-small mt-2 text-pk-fg-muted">
                {p.stock} available.
              </p>
            ) : (
              <p className="t-small mt-2 text-pk-fg-muted">Sold.</p>
            )}

            <p className="measure t-body mt-5 text-pk-fg-muted">{p.blurb}</p>

            <AddToBag slug={p.slug} stock={p.stock} className="mt-7" />

            <Band variant="rule" className="my-8" />

            {/* Teach the technique at the moment of decision — the scan found
                nobody in the category does this. */}
            <section>
              <h2 className="t-micro text-pk-fg-subtle">How it is made</h2>
              <p className="measure t-body mt-3 text-pk-fg">{craft.technique}</p>
              <dl className="mt-5 space-y-2">
                <Row label="Craft" value={craft.label} />
                <Row label="Made in" value={p.provenance.madeIn} />
                {p.provenance.artisan && (
                  <Row label="Made by" value={p.provenance.artisan} />
                )}
                <Row
                  label="By hand"
                  value={craft.handmade ? "Yes, entirely" : "No — printed"}
                />
                {p.provenance.makingTime &&
                  !p.provenance.makingTime.startsWith("NEEDS_REAL_DATA") && (
                    <Row label="Time to make" value={p.provenance.makingTime} />
                  )}
                {p.provenance.dimensions &&
                  !p.provenance.dimensions.startsWith("NEEDS_REAL_DATA") && (
                    <Row label="Size" value={p.provenance.dimensions} />
                  )}
                {p.provenance.giCertificate && (
                  <Row label="GI certificate" value={p.provenance.giCertificate} />
                )}
              </dl>
            </section>

            <Band variant="rule" className="my-8" />

            <section>
              <h2 className="t-micro text-pk-fg-subtle">Buying from us</h2>
              <ul className="mt-3 space-y-2">
                <li className="t-small text-pk-fg-muted">
                  Ships from {BRAND.city}, {BRAND.state}.
                </li>
                <li className="t-small text-pk-fg-muted">
                  Every piece is checked and packed by hand before it leaves.
                </li>
                <li className="t-small text-pk-fg-muted">
                  Questions about a piece? Ask before you buy — we would rather
                  you were certain.
                </li>
              </ul>
            </section>
          </div>
        </div>
      </div>

      <Band variant="kairi" />

      <section className="mx-auto max-w-6xl px-4 py-16 md:px-8">
        <h2 className="font-display t-heading text-pk-fg">Also here</h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {others.map((o) => (
            <Link key={o.slug} href={`/product/${o.slug}`} className="group block">
              <Image
                src={o.image}
                alt={o.name}
                width={o.width}
                height={o.height}
                quality={75}
                sizes="(max-width: 768px) 90vw, 30vw"
                className="w-full rounded-sm border border-pk-border object-cover transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-[1.02]"
              />
              <p className="t-body mt-3 text-pk-fg">{o.name}</p>
              <p className="font-mono t-small text-pk-fg-muted">
                {formatINR(o.pricePaise)}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-6 border-b border-pk-border pb-2">
      <dt className="t-small text-pk-fg-subtle">{label}</dt>
      <dd className="t-small text-right text-pk-fg">{value}</dd>
    </div>
  );
}
