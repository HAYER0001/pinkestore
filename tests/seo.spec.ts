import { test, expect } from "@playwright/test";
import { PRODUCTS, CRAFTS } from "../src/lib/catalog";
import { POLICIES, isComplete } from "../src/lib/site";

/**
 * LAUNCH HYGIENE.
 *
 * The finding that prompted this: /v1 — the original prototype of this site,
 * still deployed — was shipping as index,follow. A search engine was free to
 * index an abandoned earlier version of the shop and show it to people instead
 * of this one. Nothing links to it, which is exactly why nobody would notice.
 */

test("development surfaces are not indexable", async ({ page }) => {
  for (const route of ["/v1", "/lab/type", "/lab/brand", "/lab/rack", "/checkout"]) {
    const res = await page.goto(route);
    if (res?.status() === 404) continue;
    await page.waitForTimeout(700);
    const robots = await page
      .locator('meta[name="robots"]')
      .first()
      .getAttribute("content")
      .catch(() => null);
    expect(robots, `${route} is indexable`).toContain("noindex");
  }
});

test("robots.txt disallows them too, and points at the sitemap", async ({ page }) => {
  const res = await page.request.get("/robots.txt");
  expect(res.status()).toBe(200);
  const body = await res.text();

  /* A disallow only asks a crawler not to FETCH — a page linked from elsewhere
     can still be indexed from the link alone, which is why the meta tag above
     matters as well. Both, deliberately. */
  for (const path of ["/lab/", "/v1", "/checkout"]) {
    expect(body, `robots.txt does not disallow ${path}`).toContain(`Disallow: ${path}`);
  }
  expect(body).toContain("Sitemap: https://thepinkestore.com/sitemap.xml");
});

test("the sitemap lists every real page and nothing noindexed", async ({ page }) => {
  const res = await page.request.get("/sitemap.xml");
  expect(res.status()).toBe(200);
  const xml = await res.text();

  for (const p of PRODUCTS) {
    expect(xml, `${p.slug} missing from the sitemap`).toContain(`/product/${p.slug}`);
  }
  for (const c of Object.keys(CRAFTS)) {
    expect(xml, `${c} missing from the sitemap`).toContain(`/craft/${c}`);
  }

  /* Listing a noindex page asks a crawler to come and look at something we
     have explicitly told it not to index. */
  for (const [slug, doc] of Object.entries(POLICIES)) {
    if (!isComplete(doc)) {
      expect(xml, `${slug} is noindex but listed in the sitemap`).not.toContain(`/${slug}<`);
    }
  }
  for (const dev of ["/v1", "/lab/"]) {
    expect(xml, `${dev} is in the sitemap`).not.toContain(dev);
  }
});

test("every page a crawler is offered actually resolves", async ({ page }) => {
  const xml = await (await page.request.get("/sitemap.xml")).text();
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  expect(locs.length).toBeGreaterThan(10);

  for (const loc of locs) {
    const path = new URL(loc).pathname || "/";
    const r = await page.request.get(path);
    expect(r.status(), `${path} is in the sitemap but returns ${r.status()}`).toBe(200);
  }
});
