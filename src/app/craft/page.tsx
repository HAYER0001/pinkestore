import Link from "next/link";
import type { Metadata } from "next";
import { CRAFTS, PRODUCTS, type Craft } from "@/lib/catalog";
import { spell } from "@/lib/site";
import { PageShell } from "@/components/site/PageShell";
import { ThreadRule } from "@/components/brand/ThreadRule";

export const metadata: Metadata = {
  title: "The Craft",
  description:
    "Five techniques, four regions: hand-painted Madhubani from Mithila, sozni and jamawar kani from Kashmir, chikankari from Lucknow, and printed kairi.",
};

/**
 * Browse by technique.
 *
 * The honesty this page exists to carry: one of these five is PRINTED, and it
 * is labelled as printed, in the same type as the rest. The trade's standard
 * move is to bury that distinction in a product description where nobody
 * reads it. Putting it in the index is the entire point.
 */
export default function CraftIndexPage() {
  const entries = Object.entries(CRAFTS) as [Craft, (typeof CRAFTS)[Craft]][];
  const handmade = entries.filter(([, c]) => c.handmade).length;

  return (
    <PageShell
      eyebrow="The Craft"
      display={["Five techniques,", "four regions"]}
      standfirst={`${spell(handmade, true)} of the ${spell(entries.length)} are made entirely by hand, one is printed, and this page says which is which. Mithila painting is the look of this website; it is not the look of most of what we sell.`}
      trail={[{ label: "Home", href: "/" }, { label: "The Craft" }]}
    >
      <ul className="space-y-[clamp(2.5rem,6vh,4rem)]" style={{ margin: 0, padding: 0, listStyle: "none" }}>
        {entries.map(([slug, c], i) => {
          const count = PRODUCTS.filter((p) => p.craft === slug).length;
          return (
            <li key={slug}>
              {i > 0 && <ThreadRule tone="#C9A59F" slack={3} className="mb-[clamp(2.5rem,6vh,4rem)]" />}

              <article className="grid gap-x-10 gap-y-4 md:grid-cols-[auto_1fr]">
                <span className="ty-mono" style={{ color: "#96605B", paddingTop: "0.6rem" }}>
                  {String(i + 1).padStart(2, "0")}
                </span>

                <div>
                  <h2 style={{ margin: 0 }}>
                    <Link
                      href={`/craft/${slug}`}
                      className="ty-title"
                      style={{ color: "#1A1A1A", textDecoration: "none" }}
                    >
                      {c.label}
                    </Link>
                  </h2>

                  <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
                    <span className="ty-mono" style={{ color: "#6B645A" }}>
                      {c.region}
                    </span>
                    {/* Not a badge, not a colour-coded chip — the same type as
                        everything else, because it is a fact, not a marketing
                        award. And the printed one says printed. */}
                    <span className="ty-mono" style={{ color: c.handmade ? "#6B645A" : "#8A2F3B" }}>
                      {c.handmade ? "Made by hand" : "Printed, not handmade"}
                    </span>
                    <span className="ty-mono" style={{ color: "#6B645A" }}>
                      {count} {count === 1 ? "piece" : "pieces"}
                    </span>
                  </div>

                  <p className="ty-read measure-read mt-5" style={{ color: "#4A443C" }}>
                    {c.technique}
                  </p>

                  <Link
                    href={`/craft/${slug}`}
                    className="ty-mono mt-6 inline-block"
                    style={{
                      color: "#1A1A1A",
                      borderBottom: "1px solid #96605B",
                      paddingBottom: 3,
                      textDecoration: "none",
                    }}
                  >
                    {c.label} in detail
                  </Link>
                </div>
              </article>
            </li>
          );
        })}
      </ul>
    </PageShell>
  );
}
