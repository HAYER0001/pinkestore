import { test, expect } from "@playwright/test";
import { PROMISES } from "../src/lib/site";
import { PRODUCTS, CRAFTS, type Craft } from "../src/lib/catalog";

/**
 * PHASE 9 — THE PROMISE.
 *
 * Every claim on the promise list is paired with a test here. That pairing is
 * the deliverable, not the copy: the competitive scan found GI badges with no
 * certificate number, "handcrafted" printed on printed goods, and restock
 * buttons on pieces sold as unique. Those are promises too — they are just not
 * kept, and nothing anywhere could tell you so.
 *
 * If a promise stops being true, a test below goes red.
 */

const CRAFT_KEYS = Object.keys(CRAFTS) as Craft[];

test("the list is exactly what the tests below cover", () => {
  /* a promise added without a test is a promise nobody is keeping */
  expect(PROMISES).toHaveLength(4);
  for (const p of PROMISES) {
    expect(p.verifiedBy.length, `"${p.title}" declares no verification`).toBeGreaterThan(20);
  }
});

test("01 · stock is literal — the page never offers more than we hold", async ({ page }) => {
  for (const p of PRODUCTS) {
    await page.goto(`/product/${p.slug}`);
    await page.waitForTimeout(700);

    const body = (await page.locator("body").innerText()).toLowerCase();

    /* Substring matching is wrong here: the page says "these are NOT
       restocked", which contains "restock" while asserting the opposite.
       Only affirmative future-supply language counts. */
    for (const phrase of [
      "back in stock",
      "restocking",
      "will be restocked",
      "more coming",
      "made to order",
      "ships in 2",
    ]) {
      expect(body, `${p.slug} implies "${phrase}"`).not.toContain(phrase);
    }

    /* And the count on the page has to be the count we hold.
       Lowercased: innerText applies text-transform, and this label is
       uppercased by .t-micro-ed. */
    const rail = (await page.locator("main").innerText()).toLowerCase();
    if (p.stock === 1) {
      expect(rail, `${p.slug} holds 1 but does not say so`).toContain("one exists");
    } else {
      expect(rail, `${p.slug} holds ${p.stock}`).toContain(`${p.stock} available`);
    }
  }
});

test("02 · the printed one says printed, in all three places", async ({ page }) => {
  const [slug] = Object.entries(CRAFTS).find(([, c]) => !c.handmade)!;

  await page.goto("/craft");
  await page.waitForTimeout(1500);
  expect((await page.locator("body").innerText()).toLowerCase()).toContain("printed, not handmade");

  await page.goto(`/craft/${slug}`);
  await page.waitForTimeout(1200);
  expect((await page.locator("body").innerText()).toLowerCase()).toContain("printed, not handmade");

  if (page.viewportSize()!.width >= 1024) {
    await page.goto("/collection");
    await page.waitForTimeout(1200);
    await page.getByRole("link", { name: "The Craft", exact: true }).first().hover();
    await page.waitForTimeout(700);
    await expect(page.locator('[data-mega-panel="craft"]')).toContainText("printed");
  }
});

test("03 · no page invents what we do not know", async ({ page }) => {
  const FORBIDDEN = [
    "lorem ipsum", "coming soon", "tbd", "placeholder", "needs_real_data",
    "approximately 6", "6-8 weeks", "6–8 weeks", "estimated delivery",
  ];
  const routes = [
    ...PRODUCTS.map((p) => `/product/${p.slug}`),
    ...CRAFT_KEYS.map((c) => `/craft/${c}`),
    "/about", "/craft", "/collection",
  ];

  for (const route of routes) {
    await page.goto(route);
    await page.waitForTimeout(600);
    const text = (await page.locator("body").innerText()).toLowerCase();
    for (const phrase of FORBIDDEN) {
      expect(text, `${route} contains "${phrase}"`).not.toContain(phrase);
    }
  }
});

test("04 · no seal without a number behind it", async ({ page }) => {
  const BADGES = [
    "gi certified", "gi-certified", "certified authentic", "100% authentic",
    "guaranteed authentic", "verified artisan", "as seen in", "award winning",
  ];

  for (const route of ["/", "/collection", "/craft", ...PRODUCTS.map((p) => `/product/${p.slug}`)]) {
    await page.goto(route);
    await page.waitForTimeout(route === "/" ? 5000 : 600);
    const text = (await page.locator("body").innerText()).toLowerCase();
    for (const badge of BADGES) {
      expect(text, `${route} shows "${badge}"`).not.toContain(badge);
    }
  }
});

test("the promise is on the page, not only in the repo", async ({ page }) => {
  for (const route of ["/about"]) {
    await page.goto(route);
    await page.waitForTimeout(1200);
    for (const p of PROMISES) {
      await expect(page.locator("body"), `${route} is missing "${p.title}"`).toContainText(p.title);
    }
  }
});

test.describe("the parts that are still blocked", () => {
  test("an artisan credit renders only when there is a real name", async ({ page }) => {
    /* Item 66. No maker has given consent yet, so the row must be absent —
       not "Artisan: —", not "Master craftsman", not a stock photo. */
    for (const p of PRODUCTS) {
      const real = p.provenance.artisan && !p.provenance.artisan.startsWith("NEEDS_REAL_DATA");
      await page.goto(`/product/${p.slug}`);
      await page.waitForTimeout(600);
      const count = await page.getByText("Made by", { exact: false }).count();
      expect(count > 0, `${p.slug} artisan row`).toBe(Boolean(real));
    }
  });
});
