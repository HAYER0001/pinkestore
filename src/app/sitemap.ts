import type { MetadataRoute } from "next";
import { PRODUCTS, CRAFTS } from "@/lib/catalog";
import { SITE, POLICIES, isComplete } from "@/lib/site";
import { JOURNAL } from "@/lib/journal";

/**
 * The sitemap is generated from the same sources the pages are, so it cannot
 * list a route that does not exist or miss one that does.
 *
 * INCOMPLETE POLICY PAGES ARE EXCLUDED. They already carry noindex; listing
 * them here would be asking a crawler to come and look at a page we have
 * explicitly asked it not to index. /care is complete and is in.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const policies = Object.entries(POLICIES)
    .filter(([, doc]) => isComplete(doc))
    .map(([slug]) => ({
      url: `${SITE}/${slug}`,
      lastModified: now,
      changeFrequency: "yearly" as const,
      priority: 0.3,
    }));

  return [
    { url: SITE, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE}/collection`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE}/craft`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },

    ...PRODUCTS.map((p) => ({
      url: `${SITE}/product/${p.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      /* one-of-one: when it sells, the page changes meaning entirely */
      priority: 0.9,
    })),

    ...Object.keys(CRAFTS).map((c) => ({
      url: `${SITE}/craft/${c}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),

    /* only listed once something is published — an empty journal is noindex */
    ...(JOURNAL.length
      ? [{ url: `${SITE}/journal`, lastModified: now, changeFrequency: "weekly" as const, priority: 0.6 }]
      : []),
    ...JOURNAL.map((e) => ({
      url: `${SITE}/journal/${e.slug}`,
      lastModified: new Date(e.date),
      changeFrequency: "yearly" as const,
      priority: 0.5,
    })),

    ...policies,
  ];
}
