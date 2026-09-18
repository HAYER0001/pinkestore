import { test, expect } from "@playwright/test";
import { PRODUCTS } from "../src/lib/catalog";

/**
 * ITEM 77 — FABRIC-LIKE HORIZONTAL MOVEMENT.
 *
 * The distinction worth protecting: this is not a marquee. A marquee moves on
 * a timer and therefore moves while the reader is sitting still, which reads
 * as an advertisement. This is driven entirely by scroll position — stop
 * scrolling and the cloth stops.
 */

const bandY = (page: import("@playwright/test").Page) =>
  page.evaluate(() => {
    const b = document.querySelector("[data-fabric-band]")!;
    return b.getBoundingClientRect().top + window.scrollY;
  });

const lenisTo = (page: import("@playwright/test").Page, y: number) =>
  page.evaluate((t: number) => {
    const l = (window as unknown as { lenis?: { scrollTo: (n: number, o?: unknown) => void } }).lenis;
    if (l) l.scrollTo(t, { immediate: true });
    else window.scrollTo(0, t);
  }, y);

const xOf = (page: import("@playwright/test").Page) =>
  page.locator("[data-fabric-band] > *").first().evaluate((e) => new DOMMatrixReadOnly(getComputedStyle(e).transform).e);

test("the cloth moves with the scroll, not with a clock", async ({ page }) => {
  await page.goto("/");
  await page.waitForTimeout(9000);

  const y = await bandY(page);
  await lenisTo(page, y - 300);
  await page.waitForTimeout(1800);
  const a = await xOf(page);

  /* sit still: a marquee would keep going */
  await page.waitForTimeout(1600);
  const still = await xOf(page);
  expect(Math.abs(still - a), "the band is animating on a timer").toBeLessThan(6);

  /* scroll: it must travel */
  await lenisTo(page, y + 700);
  await page.waitForTimeout(1800);
  const b = await xOf(page);
  expect(Math.abs(b - a), "the band did not move with the scroll").toBeGreaterThan(40);
});

test("a screen reader hears each piece once, not twice", async ({ page }) => {
  await page.goto("/");
  await page.waitForTimeout(9000);

  const named = await page
    .locator("[data-fabric-band] a:not([aria-hidden='true'])")
    .evaluateAll((els) => els.map((e) => (e as HTMLAnchorElement).getAttribute("href")));

  /* the strip is duplicated so it reads as continuous; the duplicate is
     hidden from assistive tech and removed from the tab order */
  expect(named.length).toBe(PRODUCTS.length);
  expect(new Set(named).size).toBe(PRODUCTS.length);

  const dupTabbable = await page
    .locator("[data-fabric-band] a[aria-hidden='true']")
    .evaluateAll((els) => els.filter((e) => e.getAttribute("tabindex") !== "-1").length);
  expect(dupTabbable, "a duplicated tile is still tabbable").toBe(0);
});

test("every tile leads to a real piece", async ({ page }) => {
  await page.goto("/");
  await page.waitForTimeout(9000);
  const hrefs = await page
    .locator("[data-fabric-band] a")
    .evaluateAll((els) => [...new Set(els.map((e) => (e as HTMLAnchorElement).getAttribute("href")!))]);

  for (const href of hrefs) {
    expect((await page.request.get(href)).status(), `${href}`).toBe(200);
  }
});

test.describe("reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("the cloth is simply laid out, not moving", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(6000);
    const t = await page
      .locator("[data-fabric-band] > *")
      .first()
      .evaluate((e) => getComputedStyle(e).transform);
    expect(t === "none" || /matrix\(1, 0, 0, 1, 0, 0\)/.test(t)).toBe(true);
  });
});
