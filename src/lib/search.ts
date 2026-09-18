import { PRODUCTS, CRAFTS, formatINR, type Craft } from "./catalog";
import { NAV } from "./site";

/**
 * SEARCH, over about twenty-two things.
 *
 * No index library, no fuzzy matching dependency, no API route. The entire
 * corpus is five pieces, five crafts and a dozen pages — it fits in a constant
 * and scores in well under a millisecond. Reaching for Fuse or Algolia here
 * would add a bundle and a network hop to make an instant thing slower.
 *
 * What it does need to get right is SYNONYMS. Someone looking for a shawl may
 * type "pashmina", "stole", "dupatta" or "wrap"; someone after the Madhubani
 * piece may type "mithila", "folk" or "painting". A search that only matches
 * the words we happened to choose is a search that tells most people we have
 * nothing — which, on a five-product catalogue, is fatal.
 */

export type ResultKind = "piece" | "craft" | "page";

export interface SearchDoc {
  kind: ResultKind;
  href: string;
  title: string;
  /** shown under the title */
  meta: string;
  image?: string;
  /** everything matchable, lowercased, joined */
  haystack: string;
  /** matched-in-title beats matched-in-body */
  title_l: string;
}

/* Words a buyer might plausibly use that appear nowhere in our own copy. */
const SYNONYMS: Record<string, string[]> = {
  "madhubani-hand-painted": ["mithila", "folk", "painting", "painted", "bihar", "kachni", "baraat", "wedding"],
  "sozni-hand-embroidered": ["pashmina", "cashmere", "kashmiri", "embroidery", "needlework", "ivory", "white"],
  "jamawar-kani": ["kani", "jamawar", "handloom", "woven", "kashmiri", "indigo", "blue", "talim"],
  "kairi-print": ["paisley", "printed", "black", "budget", "affordable"],
  "lucknowi-chikankari": ["chikan", "chikankari", "lucknow", "cotton", "suit", "salwar", "kurta", "white", "shadow work"],
};

const CATEGORY_WORDS: Record<string, string[]> = {
  shawl: ["shawl", "stole", "wrap", "dupatta", "scarf", "shal"],
  "suit-set": ["suit", "suit set", "salwar", "kurta", "kameez", "set"],
};

function buildIndex(): SearchDoc[] {
  const docs: SearchDoc[] = [];

  for (const p of PRODUCTS) {
    const c = CRAFTS[p.craft];
    const extra = [
      ...(SYNONYMS[p.craft] ?? []),
      ...(CATEGORY_WORDS[p.category] ?? []),
      p.nameLocal?.text ?? "",
      c.handmade ? "handmade hand made by hand" : "printed",
      p.stock === 1 ? "one of one unique single" : "",
    ];
    docs.push({
      kind: "piece",
      href: `/product/${p.slug}`,
      title: p.name,
      meta: `${c.label} · ${c.region} · ${formatINR(p.pricePaise)}`,
      image: p.image,
      title_l: p.name.toLowerCase(),
      haystack: [p.name, c.label, c.region, p.blurb, p.slug, ...extra]
        .join(" ")
        .toLowerCase(),
    });
  }

  for (const [slug, c] of Object.entries(CRAFTS) as [Craft, (typeof CRAFTS)[Craft]][]) {
    const n = PRODUCTS.filter((p) => p.craft === slug).length;
    docs.push({
      kind: "craft",
      href: `/craft/${slug}`,
      title: c.label,
      meta: `${c.region} · ${n} ${n === 1 ? "piece" : "pieces"}`,
      title_l: c.label.toLowerCase(),
      haystack: [c.label, c.region, c.technique, slug, ...(SYNONYMS[slug] ?? [])]
        .join(" ")
        .toLowerCase(),
    });
  }

  const seen = new Set<string>();
  for (const group of NAV) {
    for (const item of group.items) {
      /* NAV carries /collection twice over with query strings, and the craft
         pages are already indexed above with better metadata. */
      if (seen.has(item.href) || item.href.startsWith("/craft/")) continue;
      seen.add(item.href);
      docs.push({
        kind: "page",
        href: item.href,
        title: item.label,
        meta: group.label,
        title_l: item.label.toLowerCase(),
        haystack: [item.label, group.label, item.note ?? "", item.href].join(" ").toLowerCase(),
      });
    }
  }

  return docs;
}

export const INDEX = buildIndex();

export interface Scored extends SearchDoc {
  score: number;
}

/**
 * Every token must match something, so "kashmir shawl" narrows rather than
 * widens. Within that, earlier and title-level matches score higher, and
 * pieces outrank crafts outrank pages on a tie — someone typing into a shop's
 * search box is usually looking for a thing to buy.
 */
export function search(query: string, limit = 8): Scored[] {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];
  const tokens = q.split(/\s+/).filter(Boolean);

  const KIND_BIAS: Record<ResultKind, number> = { piece: 3, craft: 2, page: 1 };

  return INDEX.map((doc) => {
    let score = 0;
    for (const t of tokens) {
      const inTitle = doc.title_l.indexOf(t);
      const inBody = doc.haystack.indexOf(t);
      if (inTitle === -1 && inBody === -1) return { ...doc, score: 0 };

      if (inTitle === 0) score += 12;
      else if (inTitle > 0) score += 8;
      else score += 3;

      /* a match at a word boundary is a real match; one inside a longer word
         usually is not — "kani" inside "chikankari" should not win */
      if (inBody > 0 && /[\s·—-]/.test(doc.haystack[inBody - 1])) score += 2;
    }
    return { ...doc, score: score + KIND_BIAS[doc.kind] };
  })
    .filter((d) => d.score > 0)
    .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title))
    .slice(0, limit);
}
