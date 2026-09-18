import { test, expect } from "@playwright/test";

/**
 * THE 404.
 *
 * Not an edge case for this shop. Every piece is one of one, so the day
 * something sells its URL keeps circulating in messages and on Instagram and
 * lands people here. It was Next's default — black Inter on white, no header,
 * no way back.
 */

test("a missing page is still a 404, and still the shop", async ({ page }) => {
  const res = await page.goto("/this-does-not-exist");
  /* a branded 404 that returns 200 is a soft 404: search engines index it as a
     real page and the shop accumulates hundreds of identical ones */
  expect(res?.status()).toBe(404);

  await page.waitForTimeout(1200);
  await expect(page.locator("[data-site-header]")).toHaveCount(1);
  await expect(page.locator("footer")).toHaveCount(1);
  await expect(page.locator("h1")).toContainText("This one has gone");
});

test("it is not indexable", async ({ page }) => {
  await page.goto("/this-does-not-exist");
  await page.waitForTimeout(900);
  const robots = await page.locator('meta[name="robots"]').first().getAttribute("content");
  expect(robots).toContain("noindex");
});

test("every way out of it works", async ({ page }) => {
  await page.goto("/this-does-not-exist");
  await page.waitForTimeout(1500);

  const hrefs = await page
    .locator("main a")
    .evaluateAll((els) => [...new Set(els.map((e) => (e as HTMLAnchorElement).getAttribute("href")!))]);
  expect(hrefs.length).toBeGreaterThan(3);

  for (const href of hrefs) {
    const r = await page.request.get(href);
    expect(r.status(), `${href} from the 404 page`).toBe(200);
  }
});

test("it offers pieces that are actually still held", async ({ page }) => {
  await page.goto("/this-does-not-exist");
  await page.waitForTimeout(1500);

  /* someone who followed a link to a shawl wants a shawl */
  const products = await page.locator('main a[href^="/product/"]').count();
  expect(products).toBeGreaterThanOrEqual(3);
  await expect(page.locator("main")).toContainText("Still held");
});
