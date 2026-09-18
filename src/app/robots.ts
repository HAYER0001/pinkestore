import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

/**
 * /lab/* and /v1 are development surfaces — a type specimen, a brand sheet,
 * and the original prototype of this site. /v1 was shipping as index,follow,
 * which means a search engine would have been free to index an abandoned
 * earlier version of the shop and show it to people instead of this one.
 *
 * Belt and braces: each page also carries its own robots meta, because a
 * robots.txt disallow only asks a crawler not to FETCH a page — a page linked
 * from elsewhere can still be indexed from that link alone.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/lab/", "/v1", "/checkout"],
    },
    sitemap: `${SITE}/sitemap.xml`,
    host: SITE,
  };
}
