import { test, expect, type Page } from "@playwright/test";
import { BRAND } from "../src/lib/catalog";

/**
 * PHASE 7 — THE NARRATIVE SPINE.
 *
 * The homepage sold before it explained: "The Making" sat AFTER the shop, so a
 * reader arrived at a price with no reason for it yet. The order is the
 * deliverable here, and order is exactly the kind of thing that gets quietly
 * reshuffled by a later change, so it is pinned.
 */

const settle = (page: Page) => page.waitForTimeout(9000);
const lenisTo = (page: Page, y: number) =>
  page.evaluate((t: number) => {
    const l = (window as unknown as { lenis?: { scrollTo: (n: number, o?: unknown) => void } }).lenis;
    if (l) l.scrollTo(t, { immediate: true });
    else window.scrollTo(0, t);
  }, y);

test("the chapters run in narrative order, not shop-first", async ({ page }) => {
  await page.goto("/");
  await settle(page);

  const order = await page.evaluate(() =>
    [...document.querySelectorAll("#origin,#scrub-track,#mithila,#kashmir,#jamawar,#kairi,#pieces,#promise")]
      .map((e) => ({ id: e.id, top: e.getBoundingClientRect().top + window.scrollY }))
      .sort((a, b) => a.top - b.top)
      .map((x) => x.id),
  );

  /* the four craft chapters sit between the film and the wall; the making
     (#craft, now the exhibition wall) comes after the pieces and is not a
     rail stop */
  expect(order).toEqual(["origin", "scrub-track", "mithila", "kashmir", "jamawar", "kairi", "pieces", "promise"]);
});

test("the rail tracks every chapter and each one exists", async ({ page }) => {
  test.skip(page.viewportSize()!.width < 1024, "the rail is desktop-only");
  await page.goto("/");
  await settle(page);

  const rail = page.locator('nav[aria-label="Chapters"]');
  await expect(rail.locator("li")).toHaveCount(8);

  const missing = await page.evaluate(() =>
    ["origin", "scrub-track", "mithila", "kashmir", "jamawar", "kairi", "pieces", "promise"].filter((id) => !document.getElementById(id)),
  );
  expect(missing).toEqual([]);
});

test("the page ends on a statement, not on the shop", async ({ page }) => {
  await page.goto("/");
  await settle(page);
  await lenisTo(page, await page.evaluate(() => document.body.scrollHeight));
  await page.waitForTimeout(1800);

  const closing = page.locator("main section").last();
  /* "someone's winter" moved onto the exhibition wall; the page now ends on
     the truest sentence on the site, at the monument step */
  await expect(closing).toContainText("Nothing here");
  await expect(closing).toContainText("was made twice");

  /* and it offers somewhere to go rather than stopping dead */
  await expect(closing.locator('a[href="/collection"]')).toHaveCount(1);
  await expect(closing.locator('a[href="/about"]')).toHaveCount(1);
});

test("the closing headline is two lines, not four", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await settle(page);
  await lenisTo(page, await page.evaluate(() => document.body.scrollHeight));
  await page.waitForTimeout(1800);

  /* `ch` resolves against the INHERITED font size, so a 46ch cap around a
     76px headline was ~368px wide and wrapped it to four lines. */
  const lines = await page.evaluate(() => {
    const h = [...document.querySelectorAll("main section")].pop()!.querySelector("h2")!;
    return [...h.querySelectorAll("span[aria-hidden] > span > span")].map((s) => {
      const r = s.getBoundingClientRect();
      return { t: (s as HTMLElement).innerText, h: Math.round(r.height) };
    });
  });
  expect(lines.length).toBe(2);
  /* each masked line must be a SINGLE line of type: two lines inside one mask
     shows up as roughly double height */
  const tallest = Math.max(...lines.map((l) => l.h));
  const shortest = Math.min(...lines.map((l) => l.h));
  expect(tallest / shortest).toBeLessThan(1.45);
});

test.describe("fewer simultaneous elements, and one provenance slip", () => {
  test('"Est. Mithila" appears nowhere — the shop is in Chandigarh', async ({ page }) => {
    for (const route of ["/", "/craft", "/collection", "/about"]) {
      await page.goto(route);
      await page.waitForTimeout(route === "/" ? 6000 : 1500);
      const text = await page.locator("body").innerText();
      /* "Est. Mithila" reads as "established in Mithila". Mithila is where one
         of the five crafts comes from; the business is in Chandigarh. */
      expect(text, `${route} still claims Est. Mithila`).not.toContain("Est. Mithila");
    }
  });

  test("the shop's actual city is the one on the page", async ({ page }) => {
    await page.goto("/craft");
    await page.waitForTimeout(1500);
    await expect(page.locator("footer")).toContainText(BRAND.city);
  });

  test("the hero corner labels are gone", async ({ page }) => {
    await page.goto("/");
    await settle(page);
    /* The utility bar says "one of one" on every page already; the hero
       carried a duplicate of it plus the bad provenance line, on top of a
       monogram, a nav, a rail, a progress hairline, a headline, a standfirst,
       two CTAs, a piece and a scroll cue. */
    const bottom = await page.evaluate(() => {
      const cue = document.querySelector("[data-scroll-cue]");
      const row = cue?.parentElement;
      return {
        children: row ? row.children.length : -1,
        text: row ? (row as HTMLElement).innerText.trim() : "",
      };
    });
    /* The bottom row holds the scroll cue and nothing else now. */
    expect(bottom.children).toBe(1);
    expect(bottom.text).not.toContain("One of one");
    expect(bottom.text).not.toContain("Est.");
  });
});
