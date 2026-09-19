import { test, expect, type Page } from "@playwright/test";

/**
 * THE REDESIGNED HOMEPAGE.
 *
 * The brief's one hard rule for the chapters is that they must not read as
 * four copies of one layout, and the old page's failure was exactly that. So
 * these tests pin what makes each chapter different — its ground, its ink,
 * its headline scale — and the two things the redesign got wrong on the way
 * in: a headline clipped off the top of the viewport, and a scroll cue that
 * kept printing 1,300px into the page.
 */

const CHAPTERS = ["mithila", "kashmir", "jamawar", "kairi"];
const settle = (page: Page) => page.waitForTimeout(9000);
const lenisTo = (page: Page, y: number) =>
  page.evaluate((t: number) => {
    const l = (window as unknown as { lenis?: { scrollTo: (n: number, o?: unknown) => void } }).lenis;
    if (l) l.scrollTo(t, { immediate: true });
    else window.scrollTo(0, t);
  }, y);
const topOf = (page: Page, id: string) =>
  page.evaluate((i) => document.getElementById(i)!.getBoundingClientRect().top + window.scrollY, id);

test.describe("the hero scene", () => {
  test("the headline is on screen and crosses onto the painting", async ({ page }) => {
    test.skip(page.viewportSize()!.width < 1024, "desktop composition");
    await page.goto("/");
    await settle(page);
    const g = await page.evaluate(() => {
      const h1 = document.querySelector("h1")!.getBoundingClientRect();
      const img = document.querySelector("#origin img")!.getBoundingClientRect();
      return { h1Top: h1.top, h1Right: h1.right, imgLeft: img.left, vh: innerHeight };
    });
    /* a utility class once overrode `absolute` with `relative` and the block
       was nudged 126px above the viewport — "The dust" was simply gone */
    expect(g.h1Top).toBeGreaterThan(40);
    expect(g.h1Right, "the headline must break across the image edge").toBeGreaterThan(g.imgLeft + 200);
  });

  test("on a phone the painting is above the type, and they overlap by one line", async ({ page }) => {
    test.skip(page.viewportSize()!.width >= 1024, "phone composition");
    await page.goto("/");
    await settle(page);
    const g = await page.evaluate(() => {
      const img = document.querySelector("#origin img")!.getBoundingClientRect();
      const lines = [...document.querySelectorAll("h1 span > span > span")].map((s) => s.getBoundingClientRect());
      return { imgBottom: img.bottom, line1Top: lines[0]?.top, line2Top: lines[1]?.top, vh: innerHeight };
    });
    /* full-width image behind the type put "remembers" on the busiest part of
       the pattern, where the difference blend turns it to noise */
    expect(g.imgBottom).toBeLessThan(g.vh * 0.66);
    expect(g.line1Top).toBeLessThan(g.imgBottom); // first line touches the painting
    /* The image's bottom 46% dissolves to the void, so its last ~60px are
       effectively dust already. Line two may start inside that band; what it
       must not do is start on the un-faded pattern. */
    expect(g.line2Top).toBeGreaterThan(g.imgBottom - 60);
  });

  test("the scroll cue retires once the hero has scrolled off", async ({ page }) => {
    test.skip(page.viewportSize()!.width < 1024, "the cue is desktop-only");
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto("/");
    await settle(page);
    const cue = page.locator("[data-scroll-cue]");
    expect(await cue.evaluate((e) => getComputedStyle(e).opacity)).toBe("1");

    await lenisTo(page, (await topOf(page, "jamawar")) + 200);
    await page.waitForTimeout(1500);
    /* it was gated on the canvas being alive and printed across the film, the
       portal and four chapters */
    expect(await cue.evaluate((e) => getComputedStyle(e).visibility)).toBe("hidden");
  });
});

test.describe("the craft chapters", () => {
  test("run in order between the film and the wall", async ({ page }) => {
    await page.goto("/");
    await settle(page);
    const order = await page.evaluate(() =>
      [...document.querySelectorAll("#scrub-track,#mithila,#kashmir,#jamawar,#kairi,#pieces")]
        .map((e) => ({ id: e.id, top: e.getBoundingClientRect().top + window.scrollY }))
        .sort((a, b) => a.top - b.top)
        .map((x) => x.id),
    );
    expect(order).toEqual(["scrub-track", "mithila", "kashmir", "jamawar", "kairi", "pieces"]);
  });

  test("no two chapters share a ground, and two are dark", async ({ page }) => {
    await page.goto("/");
    await settle(page);
    const grounds = await page.evaluate((ids) =>
      ids.map((id) => {
        const el = document.getElementById(id)!;
        return { id, bg: getComputedStyle(el).backgroundColor, chrome: el.dataset.chrome };
      }), CHAPTERS);
    expect(new Set(grounds.map((g) => g.bg)).size, "chapters share a ground colour").toBe(CHAPTERS.length);
    expect(grounds.filter((g) => g.chrome === "dark").map((g) => g.id)).toEqual(["jamawar", "kairi"]);
  });

  test("the header ink follows the ground under it", async ({ page }) => {
    await page.goto("/");
    await settle(page);
    const ink = () =>
      page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--chrome-ink").trim());

    await lenisTo(page, (await topOf(page, "mithila")) + 120);
    await page.waitForTimeout(700);
    expect(await ink(), "dark ink over the ivory chapter").toMatch(/rgb\(2[0-9], /);

    await lenisTo(page, (await topOf(page, "jamawar")) + 260);
    await page.waitForTimeout(700);
    /* the old single flip at the portal would have left dark type on indigo */
    expect(await ink(), "white ink over the indigo chapter").toMatch(/rgb\(25[0-5], /);

    await lenisTo(page, (await topOf(page, "pieces")) + 120);
    await page.waitForTimeout(700);
    expect(await ink(), "dark ink again over the wall").toMatch(/rgb\(2[0-9], /);
  });

  test("headlines are display size, not heading size", async ({ page }) => {
    test.skip(page.viewportSize()!.width < 1024, "the vw ramp is a desktop measure");
    await page.goto("/");
    await settle(page);
    const sizes = await page.evaluate((ids) =>
      ids.map((id) => {
        const h2 = document.getElementById(id)!.querySelector("h2")!;
        const line = h2.querySelector("span > span > span") ?? h2;
        return { id, px: parseFloat(getComputedStyle(line).fontSize) };
      }), CHAPTERS);
    /* the brief asks for 8-12vw; at 1440 that is 115px and up */
    for (const s of sizes) expect(s.px, `${s.id} headline is ${s.px}px`).toBeGreaterThanOrEqual(1440 * 0.08);
  });

  test("no chapter image is boxed", async ({ page }) => {
    await page.goto("/");
    await settle(page);
    const boxed = await page.evaluate((ids) =>
      ids.flatMap((id) =>
        [...document.getElementById(id)!.querySelectorAll("img")].filter((img) => {
          let el: HTMLElement | null = img;
          while (el && el.id !== id) {
            const cs = getComputedStyle(el);
            if (cs.borderRadius !== "0px" || cs.boxShadow !== "none") return true;
            el = el.parentElement;
          }
          return false;
        }).map(() => id),
      ), CHAPTERS);
    /* a border-radius or a drop shadow around a photograph is a card */
    expect(boxed).toEqual([]);
  });

  test("on a phone the label never sits on the headline", async ({ page }) => {
    test.skip(page.viewportSize()!.width >= 1024, "phones only");
    await page.goto("/");
    await settle(page);
    for (const id of CHAPTERS) {
      await lenisTo(page, await topOf(page, id));
      await page.waitForTimeout(900);
      const g = await page.evaluate((i) => {
        const s = document.getElementById(i)!;
        const label = s.querySelector(":scope > div")!.getBoundingClientRect();
        const h2 = s.querySelector("h2")!.getBoundingClientRect();
        return { labelBottom: label.bottom, h2Top: h2.top };
      }, id);
      expect(g.h2Top, `${id}: headline under the label`).toBeGreaterThan(g.labelBottom);
    }
  });
});

test("the page ends on the sentence, at the monument step", async ({ page }) => {
  await page.goto("/");
  await settle(page);
  await lenisTo(page, await page.evaluate(() => document.body.scrollHeight));
  await page.waitForTimeout(2200);
  const fin = page.locator("#finale");
  await expect(fin).toContainText("Nothing here");
  await expect(fin).toContainText("was made twice");
  const px = await fin.locator(".ty-monument").first().evaluate((e) => parseFloat(getComputedStyle(e).fontSize));
  const vw = page.viewportSize()!.width;
  expect(px).toBeGreaterThanOrEqual(Math.min(vw * 0.1, 64));
});
