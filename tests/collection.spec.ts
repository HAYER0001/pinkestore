import { test, expect } from "@playwright/test";
import { PRODUCTS, CRAFTS } from "../src/lib/catalog";
import { SHOTS, getShots, hoverImage, unshot } from "../src/lib/shots";

/**
 * PHASE 10 — THE EDITORIAL COLLECTION.
 *
 * The photography arrived mid-build: 28 AI-generated frames worked up from the
 * owner's own photograph of each piece. Three were excluded after looking at
 * every frame individually, and the exclusions are the most important thing
 * tested here — a gallery is a claim about what the object looks like, and the
 * generator has no idea which object it is describing.
 */

test.describe("photography", () => {
  test("every referenced frame actually exists", async ({ page }) => {
    for (const [slug, shots] of Object.entries(SHOTS)) {
      for (const s of shots) {
        const res = await page.request.get(s.src);
        expect(res.status(), `${slug} references a missing frame: ${s.src}`).toBe(200);
      }
    }
  });

  test("the excluded frames are referenced nowhere", () => {
    /* Two near-black macros on ivory-ground pieces, one ivory shawl in the
       black piece's set, and — the one that matters most — a macro of RAISED
       METALLIC EMBROIDERY in the gallery of the piece we sell as printed.
       This site's second promise is that the printed one is labelled printed
       everywhere; an embroidery close-up in its gallery contradicts that more
       loudly than any label could correct. */
    const EXCLUDED = [
      "/pieces/madhubani-baraat-shawl/02.webp",
      "/pieces/sozni-ivory-pashmina/02.webp",
      "/pieces/kairi-noir-paisley-shawl/05.webp",
      "/pieces/kairi-noir-paisley-shawl/06.webp",
    ];
    const used = new Set(Object.values(SHOTS).flatMap((ss) => ss.map((s) => s.src)));
    for (const src of EXCLUDED) {
      expect(used.has(src), `${src} was excluded but is in use`).toBe(false);
    }
  });

  test("the printed piece's gallery shows no handwork", () => {
    const [printed] = Object.entries(CRAFTS).find(([, c]) => !c.handmade)!;
    const p = PRODUCTS.find((x) => x.craft === printed)!;
    const shots = getShots(p.slug);
    expect(shots.length).toBeGreaterThan(0);
    /* macro is where embroidery would show; the printed piece has none listed */
    expect(shots.some((s) => s.kind === "macro")).toBe(false);
  });

  test("a hero frame is always a full view, never a detail", () => {
    for (const shots of Object.values(SHOTS)) {
      expect(shots[0].kind, "the first frame must be the whole piece").toBe("full");
    }
  });

  test("pieces without photography fall back rather than breaking", async ({ page }) => {
    const waiting = unshot();
    for (const p of waiting) {
      await page.goto(`/product/${p.slug}`);
      await page.waitForTimeout(700);
      /* it still has to show SOMETHING — the original single photograph */
      const broken = await page.evaluate(
        () => [...document.images].filter((i) => i.complete && i.naturalWidth === 0).length,
      );
      expect(broken, `${p.slug} has a broken image`).toBe(0);
    }
  });
});

test.describe("the editorial card", () => {
  test("carries craft, place, price and a way in", async ({ page }) => {
    await page.goto("/collection");
    await page.waitForTimeout(2000);

    const card = page.locator("article").first();
    const p = PRODUCTS[0];
    const craft = CRAFTS[p.craft];

    await expect(card).toContainText(craft.label);
    await expect(card).toContainText(craft.region);
    await expect(card).toContainText(p.name);
    /* item 49 — the card's job is to get someone to LOOK */
    await expect(card.getByRole("link", { name: `View ${p.name}` })).toHaveCount(1);
  });

  test("one of one is stated as a fact, not a countdown", async ({ page }) => {
    await page.goto("/collection");
    await page.waitForTimeout(2000);
    const text = (await page.locator("body").innerText()).toLowerCase();

    const ones = PRODUCTS.filter((p) => p.stock === 1).length;
    expect(await page.getByText("One of one", { exact: true }).count()).toBe(ones);

    /* nothing may dress availability up as urgency */
    for (const phrase of ["hurry", "selling fast", "only 1 left!", "almost gone", "don't miss"]) {
      expect(text).not.toContain(phrase);
    }
  });

  test("hover reveals a different view of the same piece", async ({ page }) => {
    test.skip(page.viewportSize()!.width < 1024, "hover is a pointer interaction");
    await page.goto("/collection");
    await page.waitForTimeout(2200);

    const shot = PRODUCTS.find((p) => hoverImage(p.slug))!;
    const card = page.locator("article", { hasText: shot.name }).first();

    const opacity = () =>
      card.locator("div.absolute.inset-0").first().evaluate((e) => parseFloat(getComputedStyle(e).opacity));

    expect(await opacity()).toBeLessThan(0.1);
    await card.hover();
    await page.waitForTimeout(900);
    expect(await opacity(), "the second frame never appeared").toBeGreaterThan(0.85);
  });

  test("the grid is asymmetric, not a uniform strip", async ({ page }) => {
    test.skip(page.viewportSize()!.width < 1024, "one column on a phone, by design");
    await page.goto("/collection");
    await page.waitForTimeout(2200);

    const widths = await page
      .locator("article")
      .evaluateAll((els) => els.map((e) => Math.round(e.getBoundingClientRect().width)));
    /* a uniform grid says these are interchangeable units; they are not */
    expect(new Set(widths).size, "every card is the same width").toBeGreaterThan(1);
  });
});

test.describe("quick view", () => {
  test("opens, shows frames, and hands off to the real page", async ({ page }) => {
    await page.goto("/collection");
    await page.waitForTimeout(2200);

    await page.getByRole("button", { name: /Quick view/ }).first().click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    await expect(dialog.getByRole("button", { name: /Add .* to bag|Add to bag/i })).toHaveCount(1);
    await expect(dialog.getByRole("link", { name: "Everything about this piece" })).toHaveCount(1);

    /* frame selectors, one per shot */
    const frames = await dialog.getByRole("button", { name: /^Frame \d/ }).count();
    expect(frames).toBeGreaterThan(2);
  });

  test("escape closes it and releases the page", async ({ page }) => {
    await page.goto("/collection");
    await page.waitForTimeout(2200);
    await page.getByRole("button", { name: /Quick view/ }).first().click();
    await page.waitForTimeout(600);
    expect(await page.evaluate(() => getComputedStyle(document.body).overflow)).toBe("hidden");

    await page.keyboard.press("Escape");
    await page.waitForTimeout(700);
    await expect(page.getByRole("dialog")).toHaveCount(0);
    expect(await page.evaluate(() => getComputedStyle(document.body).overflow)).not.toBe("hidden");
  });

  test("it does not try to be the product page", async ({ page }) => {
    await page.goto("/collection");
    await page.waitForTimeout(2200);
    await page.getByRole("button", { name: /Quick view/ }).first().click();
    await page.waitForTimeout(700);

    /* A quick view that tries to be complete duplicates the product page badly
       and takes the decision away from the page designed to carry it. */
    const dialog = page.getByRole("dialog");
    const text = await dialog.innerText();
    expect(text.length, "the quick view has become a second product page").toBeLessThan(700);
  });
});
