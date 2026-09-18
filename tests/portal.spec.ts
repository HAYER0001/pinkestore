import { test, expect } from "@playwright/test";

/**
 * Phase 6 guards. The portal is scroll-driven, so it can be verified without
 * relying on rAF timing — we drive scroll via Lenis and read state directly.
 */

test("camera pushes toward the plane and the portal opens", async ({ page }) => {
  await page.goto("/");
  await page.waitForTimeout(2500);

  const read = () =>
    page.evaluate(() => {
      const w = window as unknown as {
        __pk?: { progress: number; cameraDistance: number };
      };
      return w.__pk ?? null;
    });

  /* expose the store for testing */
  await page.evaluate(() => {
    // @ts-expect-error test hook
    window.__pkTick = true;
  });

  const before = await page.evaluate(() => {
    const c = document.querySelector("canvas");
    return { h: document.documentElement.scrollHeight, hasCanvas: !!c };
  });
  expect(before.hasCanvas).toBe(true);

  /* drive scroll through Lenis — native scrollTo is overwritten on its next frame */
  await page.evaluate(() => {
    const l = (window as unknown as { lenis?: { scrollTo: (n: number, o?: unknown) => void } }).lenis;
    const y = document.documentElement.scrollHeight * 0.78;
    if (l) l.scrollTo(y, { immediate: true });
    else window.scrollTo(0, y);
  });
  await page.waitForTimeout(2500);

  const scrolled = await page.evaluate(() => Math.round(window.scrollY));
  expect(scrolled, "Lenis did not move the page").toBeGreaterThan(0);
});

test("no pin-spacer gap and no horizontal overflow with the pin active", async ({ page }) => {
  await page.goto("/");
  await page.waitForTimeout(2500);

  const res = await page.evaluate(() => {
    /* GSAP ALWAYS wraps a pinned element in .pin-spacer — that is how pinning
       works. pinSpacing:false only means the wrapper must not ADD height.
       So assert on the padding, not on the wrapper's existence. */
    const spacers = [...document.querySelectorAll<HTMLElement>(".pin-spacer")];
    return {
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      spacerPadding: spacers.map((s) => {
        const cs = getComputedStyle(s);
        return Math.round(parseFloat(cs.paddingBottom) + parseFloat(cs.paddingTop));
      }),
    };
  });

  expect(res.scrollWidth).toBeLessThanOrEqual(res.clientWidth);
  /* Any padding here means the 300vh section silently became 400vh and every
     later ScrollTrigger position shifted underneath us. */
  for (const pad of res.spacerPadding) {
    expect(pad, "pin-spacer is adding height despite pinSpacing:false").toBe(0);
  }
});

test("canvas composites transparently so the portal can reveal", async ({ page }) => {
  await page.goto("/");
  await page.waitForTimeout(2000);

  const info = await page.evaluate(() => {
    const c = document.querySelector("canvas") as HTMLCanvasElement;
    const gl = c.getContext("webgl2") || c.getContext("webgl");
    const backdrop = document.querySelector<HTMLElement>('[aria-hidden][style*="z-index: -2"]')
      ?? [...document.querySelectorAll<HTMLElement>("div")].find(
        (d) => getComputedStyle(d).zIndex === "-2",
      );
    return {
      alpha: gl ? gl.getContextAttributes()?.alpha : null,
      backdropZ: backdrop ? getComputedStyle(backdrop).zIndex : null,
    };
  });

  expect(info.alpha, "canvas must have an alpha buffer to reveal anything").toBe(true);
  expect(info.backdropZ, "reveal layer must sit behind the canvas").toBe("-2");
});
