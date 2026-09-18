import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CRAFTS, PRODUCTS, type Craft } from "@/lib/catalog";
import { POLICIES } from "@/lib/site";
import { PageShell } from "@/components/site/PageShell";
import { ProductCard } from "@/components/ecommerce/ProductCard";
import { ThreadRule } from "@/components/brand/ThreadRule";
import { MaterialStory, MakingTimeline } from "@/components/craft/MakingTimeline";

const isCraft = (s: string): s is Craft => s in CRAFTS;

export function generateStaticParams() {
  return Object.keys(CRAFTS).map((technique) => ({ technique }));
}

export async function generateMetadata(
  props: PageProps<"/craft/[technique]">,
): Promise<Metadata> {
  const { technique } = await props.params;
  if (!isCraft(technique)) return {};
  const c = CRAFTS[technique];
  return {
    title: c.label,
    description: `${c.label} from ${c.region}. ${c.technique}`,
  };
}

/**
 * One technique. Reads the catalogue and the care document, so it cannot drift
 * out of step with either — the care advice shown here is literally the same
 * array /care renders, not a second copy of it that someone forgets to update.
 */
export default async function CraftPage(props: PageProps<"/craft/[technique]">) {
  const { technique } = await props.params;
  if (!isCraft(technique)) notFound();

  const c = CRAFTS[technique];
  const pieces = PRODUCTS.filter((p) => p.craft === technique);
  const care = POLICIES.care.sections.find((s) => s.heading === c.label)?.body;

  /* Split the label so the composition has a scale step in it. A one-word
     craft name falls back to a pair with the region, which still steps. */
  const words = c.label.split(" ");
  const display =
    words.length > 1
      ? [words.slice(0, -1).join(" "), words[words.length - 1]]
      : [c.label, c.region];

  return (
    <PageShell
      eyebrow={c.region}
      display={display}
      standfirst={c.technique}
      trail={[
        { label: "Home", href: "/" },
        { label: "The Craft", href: "/craft" },
        { label: c.label },
      ]}
    >
      {/* The single most load-bearing sentence on the page, and the one the
          rest of this trade hides. It gets its own block, not a footnote. */}
      {!c.handmade && (
        <p
          className="ty-read measure-read mb-[clamp(2.5rem,6vh,4rem)] border-l-2 pl-6"
          style={{ borderColor: "#8A2F3B", color: "#1A1A1A" }}
        >
          This one is printed, not handmade. It is in the collection because it
          is a good piece of cloth at a fair price, and it is labelled here the
          same way it is labelled on its own page — a printed textile sold as
          handwork is the oldest trick in this trade.
        </p>
      )}

      <section>
        <h2 className="ty-title" style={{ color: "#1A1A1A", margin: 0 }}>
          {pieces.length === 0
            ? "Nothing in this technique right now"
            : pieces.length === 1
              ? "The piece"
              : "The pieces"}
        </h2>

        {pieces.length === 0 ? (
          <p className="ty-read measure-read mt-5" style={{ color: "#6B645A" }}>
            Nothing in {c.label.toLowerCase()} is in stock at the moment.{" "}
            <Link href="/collection" className="underline underline-offset-4" style={{ color: "#96605B" }}>
              See what is
            </Link>
            .
          </p>
        ) : (
          <div className="mt-[clamp(1.5rem,4vh,2.5rem)] grid gap-[clamp(1rem,2vw,2rem)] sm:grid-cols-2 lg:grid-cols-3">
            {pieces.map((p, i) => (
              <div key={p.slug} style={{ aspectRatio: "3 / 4", display: "grid" }}>
                <ProductCard product={p} priority={i === 0} />
              </div>
            ))}
          </div>
        )}
      </section>

      <ThreadRule tone="#C9A59F" slack={4} className="my-[clamp(2.5rem,7vh,5rem)]" />
      <MaterialStory craft={technique} />

      <ThreadRule tone="#C9A59F" slack={4} className="my-[clamp(2.5rem,7vh,5rem)]" />
      <MakingTimeline craft={technique} />

      {care && (
        <>
          <ThreadRule tone="#C9A59F" slack={4} className="my-[clamp(2.5rem,7vh,5rem)]" />
          <section>
            <h2 className="ty-title" style={{ color: "#1A1A1A", margin: 0 }}>
              Living with it
            </h2>
            <div className="mt-[clamp(1rem,2.5vh,1.5rem)] space-y-4">
              {care.map((para, i) => (
                <p key={i} className="ty-read measure-read" style={{ color: "#4A443C", margin: 0 }}>
                  {para}
                </p>
              ))}
            </div>
            <Link
              href="/care"
              className="ty-mono mt-7 inline-block"
              style={{ color: "#1A1A1A", borderBottom: "1px solid #96605B", paddingBottom: 3, textDecoration: "none" }}
            >
              Care for every technique
            </Link>
          </section>
        </>
      )}
    </PageShell>
  );
}
