import { test, expect, type Page } from "@playwright/test";
import { NAV } from "../src/lib/site";

/**
 * PHASE 4 — HEADER AND FOOTER.
 *
 * The header is the one component on every page, so its failures are site-wide
 * by definition. The two that matter and are easy to ship without noticing:
 *
 *   - the bag count disagreeing with the bag, because the count is read from
 *     one store and written to another;
 *   - a translucent compacted header that lets body copy read straight through
 *     it, which looks like a rendering bug and costs nothing to prevent.
 *
 * And the footer's job is that the site stops deliberately rather than just
 * running out — plus that it promises nothing the shop cannot do.
 */

const lenisTo = (page: Page, y: number) =>
  page.evaluate((t: number) => {
    const l = (window as unknown as { lenis?: { scrollTo: (n: number, o?: unknown) => void } }).lenis;
    if (l) l.scrollTo(t, { immediate: true });
    else window.scrollTo(0, t);
  }, y);

const desktop = (page: Page) => page.viewportSize()!.width >= 1024;

test.describe("the header is on every route and is one component", () => {
  for (const route of ["/collection", "/craft", "/care", "/journal", "/product/sozni-ivory-pashmina"]) {
    test(`${route} has exactly one header and one footer`, async ({ page }) => {
      await page.goto(route);
      await expect(page.locator("[data-site-header]")).toHaveCount(1);
      await expect(page.locator("footer")).toHaveCount(1);
    });
  }

  test("the homepage no longer just stops", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(2000);
    await expect(page.locator("footer")).toHaveCount(1);
    /* The cinematic route keeps its blended chrome — it must NOT also get the
       solid header, which is what produced two stacked headers before. */
    await expect(page.locator("[data-site-header]")).toHaveCount(0);
  });
});

test.describe("landmarks", () => {
  for (const route of ["/", "/craft", "/checkout", "/product/sozni-ivory-pashmina"]) {
    test(`${route} has exactly one main, unnested`, async ({ page }) => {
      await page.goto(route);
      await page.waitForTimeout(1800);
      const c = await page.evaluate(() => ({
        main: document.querySelectorAll("main").length,
        nested: document.querySelectorAll("main main").length,
        headerInMain: document.querySelectorAll("main [data-site-header]").length,
        footerInMain: document.querySelectorAll("main footer").length,
      }));
      /* AppShell used to be <motion.main>, which put the site header and
         footer inside main — so the document had no banner and no contentinfo
         landmark at all — and nested a second main inside it on every page
         that declares its own. main must be unique per document. */
      expect(c.main, "main must be unique per document").toBe(1);
      expect(c.nested).toBe(0);
      expect(c.headerInMain, "the site header must not be inside main").toBe(0);
      expect(c.footerInMain, "the site footer must not be inside main").toBe(0);
    });
  }

  test("the banner landmark exists and holds the route home", async ({ page }) => {
    await page.goto("/craft");
    await expect(
      page.getByRole("banner").getByLabel("The Pinkestore — home"),
    ).toHaveAttribute("href", "/");
  });
});

test.describe("scroll-state identity", () => {
  test("the header compacts and the utility bar retracts", async ({ page }) => {
    await page.goto("/craft");
    await page.waitForTimeout(1000);

    const header = page.locator("[data-site-header]");
    await expect(header).toHaveAttribute("data-scrolled", "false");
    const tall = await header.evaluate((e) => e.getBoundingClientRect().height);
    const barOpen = await page.locator("[data-utility-bar]").evaluate((e) => e.getBoundingClientRect().height);
    expect(barOpen).toBeGreaterThan(10);

    await lenisTo(page, 400);
    await page.waitForTimeout(900);

    await expect(header).toHaveAttribute("data-scrolled", "true");
    const short = await header.evaluate((e) => e.getBoundingClientRect().height);
    expect(short, "the header did not compact").toBeLessThan(tall);

    const barClosed = await page.locator("[data-utility-bar]").evaluate((e) => e.getBoundingClientRect().height);
    expect(barClosed, "the utility bar did not retract").toBeLessThan(2);
  });

  test("the compacted header is opaque enough to read nav against", async ({ page }) => {
    await page.goto("/craft");
    await lenisTo(page, 500);
    await page.waitForTimeout(900);

    const alpha = await page.locator("[data-site-header]").evaluate((e) => {
      const bg = getComputedStyle(e).backgroundColor;
      const m = bg.match(/rgba?\(([^)]+)\)/);
      const parts = m ? m[1].split(",").map((s) => parseFloat(s)) : [];
      return parts.length === 4 ? parts[3] : 1;
    });
    /* Below ~0.9 the page's own body copy reads through the bar and competes
       with the navigation. */
    expect(alpha).toBeGreaterThanOrEqual(0.93);
  });

  test("it stays put while scrolling", async ({ page }) => {
    await page.goto("/craft");
    await lenisTo(page, 1200);
    await page.waitForTimeout(700);
    const top = await page.locator("[data-site-header]").evaluate((e) => e.getBoundingClientRect().top);
    expect(Math.abs(top)).toBeLessThan(4);
  });
});

test.describe("the bag", () => {
  test("the count agrees with what was added, and is announced", async ({ page }) => {
    await page.goto("/product/sozni-ivory-pashmina");
    await page.waitForTimeout(1200);

    const bag = page.locator('button[aria-label^="Bag"]').first();
    await expect(bag).toHaveAttribute("aria-label", /Bag — 0 pieces/);

    await page.getByRole("button", { name: /add to bag/i }).first().click();
    await page.waitForTimeout(900);

    /* The accessible name has to carry the count: the visible label is a bare
       numeral, which tells a screen reader nothing about what it counts. */
    await expect(bag).toHaveAttribute("aria-label", /Bag — 1 piece/);
    expect(await bag.innerText()).toContain("1");
  });

  test("the count survives a route change", async ({ page }) => {
    await page.goto("/product/sozni-ivory-pashmina");
    await page.waitForTimeout(1200);
    await page.getByRole("button", { name: /add to bag/i }).first().click();
    await page.waitForTimeout(700);

    await page.goto("/craft");
    await page.waitForTimeout(1200);
    await expect(page.locator('button[aria-label^="Bag"]').first()).toHaveAttribute(
      "aria-label",
      /Bag — 1 piece/,
    );
  });

  test("the potli is drawn, not a stock cart icon", async ({ page }) => {
    await page.goto("/collection");
    const paths = await page
      .locator('button[aria-label^="Bag"] svg path')
      .evaluateAll((els) => els.map((e) => e.getAttribute("d") ?? ""));
    expect(paths.length).toBe(3); // loop, neck, pouch
    for (const d of paths) expect(d.length).toBeGreaterThan(10);
  });
});

test.describe("navigation", () => {
  test("desktop nav marks the current section", async ({ page }) => {
    test.skip(!desktop(page), "desktop nav");
    await page.goto("/craft");
    const current = page.locator('nav[aria-label="Main"] [aria-current="page"]');
    await expect(current).toHaveCount(1);
    await expect(current).toHaveText("The Craft");

    /* a nested route still marks its parent */
    await page.goto("/craft/jamawar-kani");
    await expect(page.locator('nav[aria-label="Main"] [aria-current="page"]')).toHaveText("The Craft");
  });

  test("the mobile header opens a full-screen panel and closes again", async ({ page }) => {
    test.skip(desktop(page), "phones only");
    await page.goto("/craft");
    await page.waitForTimeout(800);

    /* the desktop nav must not merely be visually hidden on a phone */
    const menu = page.getByRole("button", { name: "Open menu" });
    await expect(menu).toBeVisible();
    await menu.click();
    await page.waitForTimeout(700);

    const panel = page.locator("#mobile-nav");
    await expect(panel).toBeVisible();
    const box = await panel.boundingBox();
    expect(box!.width).toBeGreaterThan(page.viewportSize()!.width - 2);

    /* the page behind must not scroll under an open panel */
    expect(await page.evaluate(() => getComputedStyle(document.body).overflow)).toBe("hidden");

    await page.getByRole("button", { name: "Close menu" }).click();
    await page.waitForTimeout(700);
    await expect(panel).toHaveCount(0);
    expect(await page.evaluate(() => getComputedStyle(document.body).overflow)).not.toBe("hidden");
  });

  test("escape closes the mobile panel", async ({ page }) => {
    test.skip(desktop(page), "phones only");
    await page.goto("/craft");
    await page.getByRole("button", { name: "Open menu" }).click();
    await page.waitForTimeout(600);
    await page.keyboard.press("Escape");
    await page.waitForTimeout(700);
    await expect(page.locator("#mobile-nav")).toHaveCount(0);
  });
});

test.describe("the footer", () => {
  test("carries the whole IA and every link resolves", async ({ page }) => {
    await page.goto("/craft");
    const footer = page.locator("footer");
    const hrefs = await footer
      .locator('nav[aria-label="Footer"] a')
      .evaluateAll((els) => els.map((e) => (e as HTMLAnchorElement).getAttribute("href")!));

    const expected = NAV.flatMap((g) => g.items.map((i) => i.href));
    expect(new Set(hrefs)).toEqual(new Set(expected));

    for (const href of [...new Set(hrefs)]) {
      const res = await page.request.get(href);
      expect(res.status(), `${href} is in the footer but does not resolve`).toBe(200);
    }
  });

  test("promises nothing the shop cannot do", async ({ page }) => {
    await page.goto("/craft");
    const text = (await page.locator("footer").innerText()).toLowerCase();

    /* No payment marks (there is no processor), no trust badges (there is no
       certificate), no newsletter field (there is no list, and a form that
       posts nowhere lets someone believe they subscribed). */
    for (const claim of [
      "free shipping", "subscribe", "newsletter", "sign up",
      "gi certified", "as seen in", "money back", "secure checkout",
    ]) {
      expect(text, `footer claims "${claim}"`).not.toContain(claim);
    }
    expect(await page.locator('footer input[type="email"]').count()).toBe(0);
  });

  test("the thread rule draws even for a reader who lands past it", async ({ page }) => {
    await page.goto("/craft");
    /* instant jump to the very bottom — no intermediate frames to observe */
    await lenisTo(page, await page.evaluate(() => document.body.scrollHeight));
    await page.waitForTimeout(1800);

    const opacity = await page
      .locator("footer svg[aria-hidden] path")
      .first()
      .evaluate((e) => parseFloat(getComputedStyle(e).opacity));
    expect(opacity).toBeGreaterThan(0.9);
  });
});
