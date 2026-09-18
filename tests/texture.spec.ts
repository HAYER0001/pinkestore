import { test, expect } from "@playwright/test";

/**
 * PHASES 14–16 — TEXTURE AND MOTION.
 *
 * The load-bearing test here is that the page transition did not break the
 * homepage. The root layout forbids any ancestor creating a stacking context,
 * because the WebGL canvas sits at z-index -1 in the ROOT context and the hero
 * type blends against it with mix-blend-mode: difference. The obvious page
 * transition — app/template.tsx animating opacity around {children} — creates
 * one on every route and silently kills that blend.
 */

test.describe("page transitions", () => {
  test("the curtain plays on navigation and never on first load", async ({ page }) => {
    await page.goto("/craft");
    await page.waitForTimeout(800);
    /* A boolean "have I rendered before" ref does NOT survive StrictMode's
       double effect invoke — the first pass flips it and the second treats a
       fresh load as a navigation. */
    await expect(page.locator("[data-route-curtain]")).toHaveCount(0);

    await page.getByRole("link", { name: "Journal", exact: true }).first().click();
    await page.waitForTimeout(160);
    await expect(page.locator("[data-route-curtain]")).toHaveCount(1);

    await page.waitForTimeout(1500);
    await expect(page.locator("[data-route-curtain]")).toHaveCount(0);
  });

  test("it cannot eat the first click on the page it revealed", async ({ page }) => {
    await page.goto("/craft");
    await page.waitForTimeout(800);
    await page.getByRole("link", { name: "Journal", exact: true }).first().click();
    await page.waitForTimeout(200);

    const pe = await page
      .locator("[data-route-curtain]")
      .evaluate((e) => getComputedStyle(e).pointerEvents)
      .catch(() => "none");
    expect(pe).toBe("none");
  });

  test("the hero still blends against the canvas", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(6000);

    /* If this ever reads "normal", a wrapper somewhere gained a transform,
       filter or opacity and the whole cinematic hero has gone flat. */
    const blend = await page.evaluate(
      () => getComputedStyle(document.querySelector("h1")!).mixBlendMode,
    );
    expect(blend, "an ancestor created a stacking context").toBe("difference");
  });
});

test.describe("tactile ground", () => {
  test("grain sits on flat colour plates, never over a photograph", async ({ page }) => {
    await page.goto("/craft");
    await page.waitForTimeout(1200);

    const over = await page.evaluate(() =>
      [...document.querySelectorAll(".ground-paper, .ground-woven")].filter((el) =>
        el.querySelector("img"),
      ).length,
    );
    /* Grain over an image fights the weave that is already in the photograph. */
    const footerHasImages = await page.evaluate(
      () => document.querySelector("footer.ground-paper")?.querySelectorAll("img").length ?? 0,
    );
    expect(footerHasImages).toBe(0);
    expect(over).toBe(0);
  });

  test("it is at the threshold of perception, not a filter", async ({ page }) => {
    await page.goto("/craft");
    await page.waitForTimeout(1200);

    const g = await page.evaluate(() => {
      const el = document.querySelector(".ground-paper");
      if (!el) return null;
      const cs = getComputedStyle(el, "::after");
      return { opacity: parseFloat(cs.opacity), blend: cs.mixBlendMode, pe: cs.pointerEvents };
    });
    expect(g).not.toBeNull();
    /* if you can see it as texture rather than feel it as surface, it is wrong */
    expect(g!.opacity).toBeLessThanOrEqual(0.6);
    expect(g!.blend).toBe("multiply");
    expect(g!.pe, "the grain is intercepting pointer events").toBe("none");
  });
});

test.describe("masked image reveals", () => {
  test("the photograph is never rendered as a ghost", async ({ page }) => {
    await page.goto("/product/sozni-ivory-pashmina");
    await page.waitForTimeout(2500);

    /* A fade renders a half-present image for the better part of a second,
       which on a shop selling colour and thread misrepresents the piece while
       it plays. The mask travels; the photograph underneath is always opaque. */
    const opacities = await page
      .locator("main img")
      .evaluateAll((els) =>
        els.map((e) => parseFloat(getComputedStyle(e.parentElement!).opacity)),
      );
    expect(opacities.length).toBeGreaterThan(0);
    for (const o of opacities) expect(o).toBe(1);
  });

  test("every frame ends fully revealed", async ({ page }) => {
    await page.goto("/product/sozni-ivory-pashmina");
    await page.waitForTimeout(1200);
    await page.evaluate(() => {
      const l = (window as unknown as { lenis?: { scrollTo: (n: number, o?: unknown) => void } }).lenis;
      const y = document.body.scrollHeight / 2;
      if (l) l.scrollTo(y, { immediate: true });
      else window.scrollTo(0, y);
    });
    await page.waitForTimeout(2600);

    /* Only frames the reader has reached. A mask still up on an image below
       the fold is correct — that one has not been revealed yet. */
    const stuck = await page.evaluate(() =>
      [...document.querySelectorAll("main div[aria-hidden]")]
        .filter((e) => e.getBoundingClientRect().top < window.innerHeight * 0.85)
        .map((e) => new DOMMatrixReadOnly(getComputedStyle(e).transform).d)
        .filter((d) => d > 0.08).length,
    );
    expect(stuck, "a mask is stuck over an image the reader has reached").toBe(0);
  });
});

test.describe("reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("no curtain, and images are simply there", async ({ page }) => {
    await page.goto("/craft");
    await page.waitForTimeout(900);
    await page.getByRole("link", { name: "Journal", exact: true }).first().click();
    await page.waitForTimeout(300);
    await expect(page.locator("[data-route-curtain]")).toHaveCount(0);

    await page.goto("/product/sozni-ivory-pashmina");
    await page.waitForTimeout(1800);
    const masks = await page.evaluate(
      () => document.querySelectorAll('main div[aria-hidden][style*="transform-origin"]').length,
    );
    expect(masks).toBe(0);
    await expect(page.locator("main img").first()).toBeVisible();
  });
});
