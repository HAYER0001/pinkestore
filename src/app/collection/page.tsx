import Link from "next/link";
import type { Metadata } from "next";
import { PRODUCTS, CRAFTS, type Category } from "@/lib/catalog";
import { spell } from "@/lib/site";
import { PageShell } from "@/components/site/PageShell";
import { CollectionGrid } from "@/components/ecommerce/CollectionGrid";

/**
 * The full collection. Unlike the service routes, nothing here is stubbed —
 * it reads the catalogue, so it is exactly as complete as the catalogue is.
 */

export const metadata: Metadata = {
  title: "The Collection",
  description:
    "Every piece currently held: hand-painted Madhubani, Kashmiri sozni and jamawar kani, Lucknowi chikankari, printed kairi. Each one one-of-one unless stated.",
};

const CATEGORIES: { value: Category | "all"; label: string }[] = [
  { value: "all", label: "Everything" },
  { value: "shawl", label: "Shawls" },
  { value: "suit-set", label: "Suit sets" },
];

export default async function CollectionPage(props: PageProps<"/collection">) {
  const sp = await props.searchParams;
  const raw = Array.isArray(sp.category) ? sp.category[0] : sp.category;
  /* An unrecognised ?category= shows everything rather than an empty page.
     A filter nobody can see is not worth a 404. */
  const active = CATEGORIES.some((c) => c.value === raw) ? (raw as Category | "all") : "all";
  const shown = active === "all" ? PRODUCTS : PRODUCTS.filter((p) => p.category === active);

  const handmade = shown.filter((p) => CRAFTS[p.craft].handmade).length;

  return (
    <PageShell
      wide
      eyebrow="The Collection"
      display={["Everything", "we are holding"]}
      standfirst={`${spell(PRODUCTS.length, true)} pieces. ${spell(handmade, true)} of them made entirely by hand. Where a piece says one, there is one — these are not restocked, because the next one would be different.`}
      trail={[{ label: "Home", href: "/" }, { label: "Collection" }]}
    >
      <nav aria-label="Filter by category" className="mb-[clamp(2rem,5vh,3.5rem)]">
        <ul className="flex flex-wrap items-center gap-x-8 gap-y-3" style={{ margin: 0, padding: 0, listStyle: "none" }}>
          {CATEGORIES.map((c) => {
            const on = c.value === active;
            const count =
              c.value === "all" ? PRODUCTS.length : PRODUCTS.filter((p) => p.category === c.value).length;
            return (
              <li key={c.value}>
                <Link
                  href={c.value === "all" ? "/collection" : `/collection?category=${c.value}`}
                  className="ty-mono"
                  aria-current={on ? "page" : undefined}
                  style={{
                    color: "#1A1A1A",
                    opacity: on ? 1 : 0.5,
                    textDecoration: "none",
                    borderBottom: on ? "1px solid #96605B" : "1px solid transparent",
                    paddingBottom: 4,
                  }}
                >
                  {c.label} ({count})
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <CollectionGrid products={shown} label="The pieces" />

      <p className="ty-read measure-read mt-[clamp(3rem,7vh,5rem)]" style={{ color: "#6B645A" }}>
        Every piece is named by its technique, not by a mood. If you want to
        understand what separates sozni from kani before you choose,{" "}
        <Link href="/craft" className="underline underline-offset-4" style={{ color: "#96605B" }}>
          start with the crafts
        </Link>
        .
      </p>
    </PageShell>
  );
}
