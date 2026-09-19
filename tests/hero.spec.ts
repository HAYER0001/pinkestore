import { test, expect, type Page } from "@playwright/test";

/**
 * PHASE 6 — THE CINEMATIC HERO.
 *
 * The expensive omission this phase fixed: the homepage had NO call to action.
 * Someone could read the whole cinematic run and never be offered anywhere to
 * go. So the load-bearing tests are that the CTAs exist, resolve, and — the
 * part that is easy to get wrong — that the decorative depth layer sitting on
 * top of them cannot swallow the click.
 */

const settle = (page: Page) => page.waitForTimeout(9000);
const lenisTo = (page: Page, y: number) =>
  page.evaluate((t: number) => {
    const l = (window as unknown as { lenis?: { scrollTo: (n: number, o?: unknown) => void } }).lenis;
    if (l) l.scrollTo(t, { immediate: true });
    else window.scrollTo(0, t);
  }, y);

test.describe("calls to action", () => {
  test("the hero offers somewhere to go, and both destinations resolve", async ({ page }) => {
    await page.goto("/");
    await settle(page);

    const primary = page.locator('#origin a[href="/collection"]').first();
    const secondary = page.locator('#origin a[href="/craft"]').first();
    await expect(primary).toBeVisible();
    await expect(secondary).toBeVisible();

    for (const href of ["/collection", "/craft"]) {
      expect((await page.request.get(href)).status()).toBe(200);
    }
  });

  test("the atmosphere layer cannot swallow a click meant for the CTA", async ({ page }) => {
    await page.goto("/");
    await settle(page);

    /* HeroDepth is absolutely positioned over the whole hero. If it ever
       forgets pointer-events:none, the primary CTA silently stops working and
       nothing in the console says so. */
    const hit = await page.evaluate(() => {
      const cta = document.querySelector('#origin a[href="/collection"]')!;
      const r = cta.getBoundingClientRect();
      const top = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
      return cta.contains(top) || top === cta;
    });
    expect(hit, "something is covering the primary CTA").toBe(true);

    await page.locator('#origin a[href="/collection"]').first().click();
    await page.waitForURL("**/collection");
    expect(page.url()).toContain("/collection");
  });

  test("the hero is one scene: a single photograph, not a product column", async ({ page }) => {
    await page.setViewportSize({ width: 1600, height: 950 });
    await page.goto("/");
    await settle(page);
    /* the redesign replaced the type-left / cloth-right spread with one
       full-viewport painting the headline crosses — so exactly one image */
    expect(await page.locator("#origin img").count()).toBe(1);
    expect(await page.locator('#origin a[href^="/product/"]').count()).toBe(0);
  });
});

test.describe("scroll cue", () => {
  test("it is a real control, not a decoration that lies", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto("/");
    await settle(page);

    const cue = page.locator('button[aria-label*="Scroll to explore"]');
    await expect(cue).toBeVisible();

    const before = await page.evaluate(() => window.scrollY);
    await cue.click();
    await page.waitForTimeout(2200);
    const after = await page.evaluate(() => window.scrollY);
    /* it names a destination, so it has to go there */
    expect(after, "the scroll cue did nothing when clicked").toBeGreaterThan(before + 200);
  });

  test("it yields to the CTAs on a short viewport", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 760 });
    await page.goto("/");
    await settle(page);

    const boxes = await page.evaluate(() => {
      const b = (s: string) => {
        const e = document.querySelector(s);
        if (!e) return null;
        const r = e.getBoundingClientRect();
        if (r.width === 0 && r.height === 0) return null;
        return { l: r.left, r: r.right, t: r.top, b: r.bottom };
      };
      return {
        sec: b('#origin a[href="/craft"]'),
        cue: b('button[aria-label*="Scroll to explore"]'),
      };
    });

    /* On a 760px laptop the centred cue rises straight into "How it is made",
       and no amount of vertical spacing in the hero separates them — they are
       competing for the same band. Below 820px the cue goes. */
    if (boxes.cue && boxes.sec) {
      const overlap =
        boxes.sec.l < boxes.cue.r &&
        boxes.cue.l < boxes.sec.r &&
        boxes.sec.t < boxes.cue.b &&
        boxes.cue.t < boxes.sec.b;
      expect(overlap, "the scroll cue is printing through the secondary CTA").toBe(false);
    }
  });
});

test.describe("scroll progress", () => {
  test("it tracks the page and reaches the end", async ({ page }) => {
    await page.goto("/craft");
    await page.waitForTimeout(1500);

    const bar = page.locator("[data-scroll-progress] > *");
    await expect(page.locator("[data-scroll-progress]")).toHaveCount(1);

    const at = () => bar.evaluate((e) => new DOMMatrixReadOnly(getComputedStyle(e).transform).a);
    const top = await at();
    expect(top).toBeLessThan(0.15);

    await lenisTo(page, await page.evaluate(() => document.body.scrollHeight));
    await page.waitForTimeout(1600);
    expect(await at(), "progress never reached the end of the page").toBeGreaterThan(0.9);
  });

  test("it stays off pages too short to get lost in", async ({ page }) => {
    /* a tall viewport on a short page: nothing to indicate */
    await page.setViewportSize({ width: 1440, height: 2400 });
    await page.goto("/journal");
    await page.waitForTimeout(1800);
    await expect(page.locator("[data-scroll-progress]")).toHaveCount(0);
  });
});

test.describe("reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("the parallax atmosphere is not rendered at all", async ({ page }) => {
    await page.setViewportSize({ width: 1600, height: 950 });
    await page.goto("/");
    await page.waitForTimeout(4000);

    /* Depth here IS parallax. With motion off there is nothing left for the
       layer to express, and five blurred divs that never move are just cost. */
    const motes = await page.evaluate(
      () => document.querySelectorAll('#origin [aria-hidden] div[style*="blur"]').length,
    );
    expect(motes).toBe(0);

    /* the CTAs must still be there */
    await expect(page.locator('#origin a[href="/collection"]').first()).toBeVisible();
  });
});
