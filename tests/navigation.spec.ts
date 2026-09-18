import { test, expect, type Page } from "@playwright/test";
import { search, INDEX } from "../src/lib/search";
import { PRODUCTS, CRAFTS } from "../src/lib/catalog";

/**
 * PHASE 5 — NAVIGATION DEPTH.
 *
 * Mega-menu, browse-by-craft, and search. The search tests are mostly about
 * SYNONYMS: on a five-piece catalogue, a search that only matches the words we
 * happened to write tells almost everyone we have nothing, and "no results" is
 * the moment someone leaves.
 */

const desktop = (page: Page) => page.viewportSize()!.width >= 1024;

test.describe("search index", () => {
  /* Pure-function tests: no browser needed, so they cannot flake. */
  test("the words a buyer would actually type reach the right piece", () => {
    const cases: [string, string][] = [
      ["pashmina", "/product/sozni-ivory-pashmina"],
      ["cashmere", "/product/sozni-ivory-pashmina"],
      ["mithila", "/product/madhubani-baraat-shawl"],
      ["folk painting", "/product/madhubani-baraat-shawl"],
      ["paisley", "/product/kairi-noir-paisley-shawl"],
      ["salwar", "/product/chikankari-blush-suit-set"],
      ["kurta", "/product/chikankari-blush-suit-set"],
      ["dupatta", "/product/"],
      ["kashmir", "/"],
    ];
    for (const [q, expectedPrefix] of cases) {
      const hits = search(q);
      expect(hits.length, `"${q}" found nothing`).toBeGreaterThan(0);
      expect(hits[0].href, `"${q}" -> ${hits[0].href}`).toContain(expectedPrefix);
    }
  });

  test("every token must match, so more words narrow", () => {
    const broad = search("kashmir");
    const narrow = search("kashmir suit");
    expect(broad.length).toBeGreaterThan(0);
    /* the chikankari suit is from Lucknow, so this pair should not both hit */
    expect(narrow.length).toBeLessThan(broad.length);
  });

  test("a match inside a longer word does not outrank a real one", () => {
    /* "kani" appears inside "chikankari" */
    const hits = search("kani");
    expect(hits[0].title.toLowerCase()).toContain("kani");
    expect(hits[0].title.toLowerCase()).not.toContain("chikankari");
  });

  test("the index covers every piece and every craft", () => {
    for (const p of PRODUCTS) {
      expect(INDEX.some((d) => d.href === `/product/${p.slug}`), `${p.slug} missing`).toBe(true);
    }
    for (const slug of Object.keys(CRAFTS)) {
      expect(INDEX.some((d) => d.href === `/craft/${slug}`), `${slug} missing`).toBe(true);
    }
  });

  test("a single letter does not return the whole shop", () => {
    expect(search("a")).toEqual([]);
    expect(search(" ")).toEqual([]);
  });
});

test.describe("search overlay", () => {
  test("opens, filters, and navigates by keyboard alone", async ({ page }) => {
    await page.goto("/craft");
    await page.waitForTimeout(1200);

    await page.getByRole("button", { name: "Search" }).first().click();
    const dialog = page.getByRole("dialog", { name: "Search" });
    await expect(dialog).toBeVisible();

    await page.keyboard.type("pashmina");
    await page.waitForTimeout(500);
    const rows = dialog.locator("li a");
    expect(await rows.count()).toBeGreaterThan(0);
    await expect(rows.first()).toContainText("Sozni Ivory");

    await page.keyboard.press("Enter");
    await page.waitForURL("**/product/sozni-ivory-pashmina");
    expect(page.url()).toContain("sozni-ivory-pashmina");
  });

  test("arrow keys move the highlight", async ({ page }) => {
    await page.goto("/craft");
    await page.waitForTimeout(1200);
    await page.getByRole("button", { name: "Search" }).first().click();
    await page.keyboard.type("kashmir");
    await page.waitForTimeout(500);

    const dialog = page.getByRole("dialog", { name: "Search" });
    await expect(dialog.locator('li a[aria-current="true"]')).toHaveCount(1);
    const first = await dialog.locator("li a").first().getAttribute("href");

    await page.keyboard.press("ArrowDown");
    await page.waitForTimeout(250);
    const active = await dialog.locator('li a[aria-current="true"]').getAttribute("href");
    expect(active).not.toBe(first);
  });

  test("a miss offers the collection instead of a dead end", async ({ page }) => {
    await page.goto("/craft");
    await page.waitForTimeout(1200);
    await page.getByRole("button", { name: "Search" }).first().click();
    await page.keyboard.type("zzzznothing");
    await page.waitForTimeout(500);

    const dialog = page.getByRole("dialog", { name: "Search" });
    await expect(dialog).toContainText("Nothing matches");
    /* the important half: it still shows somewhere to go */
    expect(await dialog.locator("li a").count()).toBeGreaterThan(0);
  });

  test("escape closes it and releases the page", async ({ page }) => {
    await page.goto("/craft");
    await page.waitForTimeout(1200);
    await page.getByRole("button", { name: "Search" }).first().click();
    await page.waitForTimeout(500);
    expect(await page.evaluate(() => getComputedStyle(document.body).overflow)).toBe("hidden");

    await page.keyboard.press("Escape");
    await page.waitForTimeout(600);
    await expect(page.getByRole("dialog", { name: "Search" })).toHaveCount(0);
    expect(await page.evaluate(() => getComputedStyle(document.body).overflow)).not.toBe("hidden");
  });

  test("the system search-clear control is suppressed", async ({ page }) => {
    await page.goto("/craft");
    await page.waitForTimeout(1200);

    /* getComputedStyle on a UA shadow pseudo-element reports "auto" whatever
       the author sheet says, so assert the rule SHIPPED instead — that is the
       part we control. The absence of the blue X itself is verified visually. */
    const shipped = await page.evaluate(() => {
      for (const sheet of [...document.styleSheets]) {
        let rules: CSSRuleList;
        try {
          rules = sheet.cssRules;
        } catch {
          continue; // cross-origin sheet
        }
        for (const r of [...rules]) {
          if (r.cssText.includes("search-cancel-button") && /appearance:\s*none/.test(r.cssText)) {
            return true;
          }
        }
      }
      return false;
    });
    expect(shipped, "the search-cancel-button reset is not in any stylesheet").toBe(true);
  });
});

test.describe("mega-menu", () => {
  test("Collection opens a panel showing actual cloth", async ({ page }) => {
    test.skip(!desktop(page), "desktop only");
    await page.goto("/craft");
    await page.waitForTimeout(1200);

    await page.getByRole("link", { name: "Collection", exact: true }).first().hover();
    await page.waitForTimeout(700);

    const panel = page.locator('[data-mega-panel="collection"]');
    await expect(panel).toBeVisible();
    /* a mega-menu that is only text links is a sitemap with a drop shadow */
    expect(await panel.locator("img").count()).toBeGreaterThanOrEqual(4);
    await expect(panel).toContainText("Shawls");
  });

  test("The Craft opens browse-by-craft, and names the printed one there", async ({ page }) => {
    test.skip(!desktop(page), "desktop only");
    await page.goto("/collection");
    await page.waitForTimeout(1200);

    await page.getByRole("link", { name: "The Craft", exact: true }).first().hover();
    await page.waitForTimeout(700);

    const panel = page.locator('[data-mega-panel="craft"]');
    await expect(panel).toBeVisible();
    for (const c of Object.values(CRAFTS)) await expect(panel).toContainText(c.label);
    /* this is where people choose, so the honesty has to be here too */
    await expect(panel).toContainText("printed");
  });

  test("the trigger reports its state and escape closes", async ({ page }) => {
    test.skip(!desktop(page), "desktop only");
    await page.goto("/journal");
    await page.waitForTimeout(1200);

    const trigger = page.getByRole("link", { name: "Collection", exact: true }).first();
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await trigger.hover();
    await page.waitForTimeout(700);
    await expect(trigger).toHaveAttribute("aria-expanded", "true");

    await page.keyboard.press("Escape");
    await page.waitForTimeout(500);
    await expect(page.locator("[data-mega-panel]")).toHaveCount(0);
  });

  test("every link in both panels resolves", async ({ page }) => {
    test.skip(!desktop(page), "desktop only");
    await page.goto("/journal");
    await page.waitForTimeout(1200);

    for (const name of ["Collection", "The Craft"]) {
      await page.getByRole("link", { name, exact: true }).first().hover();
      await page.waitForTimeout(700);
      const hrefs = await page
        .locator("[data-mega-panel] a")
        .evaluateAll((els) => [...new Set(els.map((e) => (e as HTMLAnchorElement).getAttribute("href")!))]);
      expect(hrefs.length).toBeGreaterThan(3);
      for (const href of hrefs) {
        const res = await page.request.get(href);
        expect(res.status(), `${href} from the ${name} panel`).toBe(200);
      }
      await page.keyboard.press("Escape");
      await page.waitForTimeout(400);
    }
  });

  test("a panel does not survive a route change", async ({ page }) => {
    test.skip(!desktop(page), "desktop only");
    await page.goto("/journal");
    await page.waitForTimeout(1200);
    await page.getByRole("link", { name: "Collection", exact: true }).first().hover();
    await page.waitForTimeout(700);
    await expect(page.locator("[data-mega-panel]")).toHaveCount(1);

    await page.locator('[data-mega-panel] a[href="/collection"]').first().click();
    await page.waitForTimeout(1200);
    /* left open, it hangs over the page you just navigated to */
    await expect(page.locator("[data-mega-panel]")).toHaveCount(0);
  });
});

test.describe("mobile", () => {
  test("search is reachable from the panel, which is the only nav a phone has", async ({ page }) => {
    test.skip(desktop(page), "phones only");
    await page.goto("/craft");
    await page.waitForTimeout(1000);

    await page.getByRole("button", { name: "Open menu" }).click();
    await page.waitForTimeout(700);
    await page.locator("#mobile-nav").getByRole("button", { name: "Search" }).click();
    await page.waitForTimeout(800);

    await expect(page.getByRole("dialog", { name: "Search" })).toBeVisible();
    /* the menu must close behind it, not stack */
    await expect(page.locator("#mobile-nav")).toHaveCount(0);
  });
});
