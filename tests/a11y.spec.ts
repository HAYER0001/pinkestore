import { test, expect } from "@playwright/test";
import { PRODUCTS } from "../src/lib/catalog";

/**
 * ACCESSIBILITY SWEEP.
 *
 * This site is almost entirely custom controls — a potli bag button, a
 * chapter rail, a zoom viewer, a mega-menu, a scroll cue that is really a
 * button. None of them get anything for free, so they get checked together
 * rather than one at a time inside the phase that built them.
 *
 * Two real defects came out of the first run:
 *   · five "Add to bag" buttons on the film, one per beat, all with the same
 *     accessible name — a screen-reader user hears it five times with no way
 *     to tell which shawl is which;
 *   · /collection jumped h1 -> h3, so anyone navigating by heading fell
 *     through a level with no idea what the list below was.
 */

const ROUTES = ["/", "/collection", "/craft", "/product/sozni-ivory-pashmina", "/checkout", "/about"];

const settle = (page: import("@playwright/test").Page, r: string) =>
  page.waitForTimeout(r === "/" ? 7000 : 1500);

test("every image declares alt, even if empty", async ({ page }) => {
  for (const r of ROUTES) {
    await page.goto(r);
    await settle(page, r);
    /* A MISSING alt is read out as the filename. An empty one is a deliberate
       "this is decorative" and is correct for the hover frame and the
       duplicated band tiles. */
    const missing = await page.evaluate(() =>
      [...document.images].filter((i) => i.getAttribute("alt") === null).map((i) => i.currentSrc.slice(-30)),
    );
    expect(missing, `${r} has images with no alt attribute`).toEqual([]);
  }
});

test("every control a reader can reach has a name", async ({ page }) => {
  for (const r of ROUTES) {
    await page.goto(r);
    await settle(page, r);

    const unnamed = await page.evaluate(() =>
      [...document.querySelectorAll("button,a")]
        .filter((el) => {
          if (el.closest('[aria-hidden="true"]')) return false;
          const cs = getComputedStyle(el);
          /* visibility:hidden takes it out of the a11y tree and the tab order,
             which is how the off-beat film cards are correctly excluded */
          if (cs.visibility === "hidden" || cs.display === "none") return false;
          return el.getBoundingClientRect().width > 0;
        })
        .filter((el) => !(el.getAttribute("aria-label") || (el as HTMLElement).innerText?.trim()))
        .map((el) => `${el.tagName}.${(el.className || "").toString().slice(0, 24)}`),
    );
    expect(unnamed, `${r} has unnamed controls`).toEqual([]);
  }
});

test("repeated actions are told apart by name", async ({ page }) => {
  await page.goto("/");
  await page.waitForTimeout(7000);

  const names = await page.evaluate(() =>
    [...document.querySelectorAll("button")]
      .map((b) => b.getAttribute("aria-label") ?? "")
      .filter((n) => /add .* to bag/i.test(n)),
  );

  /* The homepage carries two of these per piece — one on the film, one in the
     bento grid — and both correctly say the same thing, because both do the
     same thing to the same shawl. What must never happen again is a bare
     "Add to bag" repeated five times with nothing to tell them apart. */
  expect(names.length).toBeGreaterThanOrEqual(PRODUCTS.length);

  for (const n of names) {
    expect(
      PRODUCTS.some((p) => n.includes(p.name)),
      `"${n}" does not say which piece it adds`,
    ).toBe(true);
  }
  expect(new Set(names).size, "not every piece has its own label").toBe(PRODUCTS.length);
});

test("headings do not skip a level", async ({ page }) => {
  for (const r of ROUTES) {
    await page.goto(r);
    await settle(page, r);

    const jumps = await page.evaluate(() => {
      const out: string[] = [];
      let prev = 0;
      document.querySelectorAll("h1,h2,h3,h4,h5,h6").forEach((h) => {
        const lvl = +h.tagName[1];
        if (prev && lvl > prev + 1) out.push(`h${prev} -> h${lvl}: ${(h as HTMLElement).innerText.slice(0, 30)}`);
        prev = lvl;
      });
      return out;
    });
    expect(jumps, `${r} skips a heading level`).toEqual([]);
  }
});

test("there is exactly one h1 per page", async ({ page }) => {
  for (const r of ROUTES) {
    await page.goto(r);
    await settle(page, r);
    expect(await page.locator("h1").count(), `${r}`).toBe(1);
  }
});

test("keyboard focus is visible", async ({ page }) => {
  await page.goto("/craft");
  await page.waitForTimeout(1500);

  /* Tab, rather than .focus(): :focus-visible is the whole point and a
     programmatic focus does not always satisfy it. */
  for (let i = 0; i < 6; i++) {
    await page.keyboard.press("Tab");
    const ok = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement | null;
      if (!el || el === document.body) return true;
      const cs = getComputedStyle(el);
      return (
        (cs.outlineStyle !== "none" && parseFloat(cs.outlineWidth) > 0) ||
        cs.boxShadow !== "none"
      );
    });
    expect(ok, `tab stop ${i + 1} has no visible focus indicator`).toBe(true);
  }
});

test("modals trap the page, and give it back", async ({ page }) => {
  await page.goto("/collection");
  await page.waitForTimeout(2000);

  for (const open of [
    async () => page.getByRole("button", { name: "Search" }).first().click(),
    async () => page.getByRole("button", { name: /Quick view/ }).first().click(),
  ]) {
    await open();
    await page.waitForTimeout(700);
    expect(await page.evaluate(() => getComputedStyle(document.body).overflow)).toBe("hidden");
    await page.keyboard.press("Escape");
    await page.waitForTimeout(700);
    /* a modal that forgets to restore scroll leaves the whole site frozen */
    expect(await page.evaluate(() => getComputedStyle(document.body).overflow)).not.toBe("hidden");
  }
});
