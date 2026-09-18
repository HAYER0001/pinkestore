import { test, expect, type Page } from "@playwright/test";

/**
 * PHASE 2 — TYPOGRAPHY GUARDS.
 *
 * The centre of gravity here is the reveal, not the type scale. Four separate
 * times this project has shipped headlines that rendered as blank space, each
 * time looking like a different bug and each time being the same one: text
 * that starts hidden and depends on an IntersectionObserver callback to become
 * visible is text that VANISHES whenever the callback does not arrive.
 *
 * So the load-bearing test is "land on the section directly and the words are
 * still there". Everything else — scale steps, measure caps, mobile floor — is
 * cheap to check and worth checking, but it is not what breaks.
 */

/* Lenis owns scrollTop. window.scrollTo and scrollIntoView are both silently
   reverted on its next frame, which has invalidated two rounds of QA here.
   `immediate: true` also gives us the exact case we care about: arriving with
   no intermediate frames for an observer to sample. */
const lenisTo = (page: Page, y: number) =>
  page.evaluate((t: number) => {
    const l = (window as unknown as { lenis?: { scrollTo: (n: number, o?: unknown) => void } }).lenis;
    if (l) l.scrollTo(t, { immediate: true });
    else window.scrollTo(0, t);
  }, y);

const settle = async (page: Page, ms = 1800) => page.waitForTimeout(ms);

test.describe("reveals fail visible", () => {
  test("every masked line lands at zero offset", async ({ page }) => {
    await page.goto("/lab/type");
    await settle(page);

    const lines = await page.$$eval("h1 span > span > span", (els) =>
      els.map((e) => ({ t: (e as HTMLElement).innerText, tf: getComputedStyle(e).transform })),
    );
    expect(lines.length).toBeGreaterThan(0);
    for (const l of lines) {
      /* "none" or a matrix whose translateY is 0 — anything else means the
         line is still parked outside its own overflow-hidden mask. */
      expect(l.tf === "none" || /,\s*0\)$/.test(l.tf), `"${l.t}" stuck at ${l.tf}`).toBeTruthy();
    }
  });

  test("a reader who lands past a reveal still sees it", async ({ page }) => {
    await page.goto("/");
    await settle(page, 2500);

    /* Jump straight to the pull quote with no intervening frames — a deep
       link, a restored scroll position, or a hard flick all look like this. */
    const y = await page.evaluate(
      () =>
        document.querySelector("figure blockquote")!.getBoundingClientRect().top +
        window.scrollY -
        200,
    );
    await lenisTo(page, y);
    await settle(page);

    const quote = page.locator("figure blockquote p").first();
    await expect(quote).toBeVisible();
    expect(await quote.evaluate((e) => parseFloat(getComputedStyle(e).opacity))).toBeGreaterThan(0.9);
  });

  test("the closing composition survives the same jump", async ({ page }) => {
    await page.goto("/");
    await settle(page, 2500);
    const y = await page.evaluate(
      () => document.getElementById("craft")!.getBoundingClientRect().top + window.scrollY,
    );
    await lenisTo(page, y);
    await settle(page);

    const lines = await page.$$eval("#craft h2 span > span > span", (els) =>
      els.map((e) => getComputedStyle(e).transform),
    );
    expect(lines.length).toBe(2);
    for (const tf of lines) expect(tf === "none" || /,\s*0\)$/.test(tf)).toBeTruthy();

    const body = page.locator("#craft p").last();
    expect(await body.evaluate((e) => parseFloat(getComputedStyle(e).opacity))).toBeGreaterThan(0.5);
  });
});

test.describe("reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("a composition with motion off is still on the screen", async ({ page }) => {
    await page.goto("/lab/type");
    await page.waitForTimeout(1500);

    /* The near-miss worth guarding: keeping the animated structure and only
       skipping the transition leaves every line parked at y:112% inside its
       own mask. The headline is then permanently blank for the people who
       asked for less motion, which is the worst possible audience to lose it
       for. Measure pixels on screen, not the absence of a transform. */
    const h1 = page.locator("h1");
    await expect(h1).toBeVisible();

    const painted = await page.evaluate(() => {
      const el = document.querySelector("h1")!;
      const r = el.getBoundingClientRect();
      const inner = [...el.querySelectorAll("span")].filter(
        (s) => !s.classList.contains("sr-only") && s.getBoundingClientRect().height > 4,
      );
      return { h: Math.round(r.height), visibleSpans: inner.length, clipped: [...el.querySelectorAll("span")].some((s) => getComputedStyle(s).overflow === "hidden" && !s.classList.contains("sr-only")) };
    });
    expect(painted.h).toBeGreaterThan(80);
    expect(painted.visibleSpans).toBeGreaterThan(0);
    expect(painted.clipped, "masks must not survive into reduced motion").toBeFalsy();
  });
});

test.describe("compositions, not big headings", () => {
  test("the hero carries internal hierarchy", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(2500);

    const sizes = await page.$$eval("h1 span > span > span", (els) =>
      els.map((e) => parseFloat(getComputedStyle(e).fontSize)),
    );
    expect(sizes.length).toBe(3);
    /* A composition has a scale STEP inside it. Three lines at one size is a
       heading set large, which is the thing this phase exists to replace. */
    expect(new Set(sizes).size).toBeGreaterThan(1);
    expect(Math.max(...sizes) / Math.min(...sizes)).toBeGreaterThan(1.3);
  });

  test("the split is invisible to screen readers", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(2000);

    const h1 = page.locator("h1");
    /* One clean string for AT, and the per-line spans hidden from it —
       otherwise every line break is announced as a pause. */
    await expect(h1.locator(".sr-only")).toHaveText("The dust remembers the drawing");
    expect(await h1.locator("[aria-hidden='true']").count()).toBe(1);
  });
});

test.describe("chapter numerals as navigation", () => {
  test("the rail tracks the section in view and jumps to it", async ({ page }) => {
    test.skip(page.viewportSize()!.width < 1024, "the rail is desktop-only");
    await page.goto("/");
    await page.waitForTimeout(2500);

    const rail = page.locator('nav[aria-label="Chapters"]');
    await expect(rail).toBeVisible();
    await expect(rail.locator("li")).toHaveCount(4);

    /* every numeral must resolve to a section that actually exists */
    const missing = await page.evaluate(() =>
      ["origin", "scrub-track", "pieces", "craft"].filter((id) => !document.getElementById(id)),
    );
    expect(missing).toEqual([]);

    await expect(rail.locator('[aria-current="true"]')).toHaveCount(1);

    const y = await page.evaluate(
      () => document.getElementById("craft")!.getBoundingClientRect().top + window.scrollY,
    );
    await lenisTo(page, y);
    await settle(page, 1200);
    await expect(rail.locator('[aria-current="true"]')).toContainText("04");
  });

  test("the rail never prints through the hero", async ({ page }) => {
    test.skip(page.viewportSize()!.width < 1024, "the rail is desktop-only");
    await page.goto("/");
    await page.waitForTimeout(2500);

    const [rail, h1, chip] = await page.evaluate(() => {
      const b = (el: Element) => {
        const r = el.getBoundingClientRect();
        return { left: r.left, right: r.right, top: r.top, bottom: r.bottom };
      };
      return [
        b(document.querySelector('nav[aria-label="Chapters"]')!),
        b(document.querySelector("h1")!),
        b(document.querySelector("#origin p")!),
      ];
    });
    for (const el of [h1, chip]) expect(el.left).toBeGreaterThanOrEqual(rail.right);
  });
});

test.describe("mobile ramp", () => {
  test("phone type stays above the readable floor and never overflows", async ({ page }) => {
    test.skip(page.viewportSize()!.width >= 1024, "phones only");
    await page.goto("/");
    await page.waitForTimeout(2500);

    const m = await page.evaluate(() => {
      const el = document.documentElement;
      const px = (s: string) => parseFloat(getComputedStyle(document.querySelector(s)!).fontSize);
      return {
        overflow: el.scrollWidth - el.clientWidth,
        hero: Math.max(
          ...[...document.querySelectorAll("h1 span > span > span")].map((s) =>
            parseFloat(getComputedStyle(s).fontSize),
          ),
        ),
        lede: px(".ty-lede"),
      };
    });

    /* A horizontal scrollbar on a phone is the single loudest "this was built
       for a laptop" tell there is. */
    expect(m.overflow).toBeLessThanOrEqual(1);
    /* The usual failure is a clamp lower bound chosen so the DESKTOP
       composition survives a 390px screen, which yields 28px "hero" type that
       reads as a subheading. */
    expect(m.hero).toBeGreaterThanOrEqual(56);
    expect(m.lede).toBeGreaterThanOrEqual(17);
  });

  test("the fixed chrome fits on one line", async ({ page }) => {
    test.skip(page.viewportSize()!.width >= 1024, "phones only");
    await page.goto("/");
    await page.waitForTimeout(2500);

    for (const sel of ['button[aria-label^="Ambient sound"]', "header button:last-of-type"]) {
      const h = await page.locator(sel).first().evaluate((e) => {
        const cs = getComputedStyle(e);
        return e.getBoundingClientRect().height / parseFloat(cs.lineHeight || cs.fontSize);
      });
      expect(h, `${sel} wrapped onto a second line`).toBeLessThan(1.9);
    }
  });
});
