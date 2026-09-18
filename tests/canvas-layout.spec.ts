import { test, expect } from "@playwright/test";

/**
 * Phase 1 layout guards.
 *
 * A fixed, full-viewport WebGL canvas is the classic source of a 1px
 * horizontal scrollbar on mobile — 100vw includes the scrollbar gutter on
 * desktop, and any overflowing child of a fixed layer still extends the
 * document. These tests fail loudly if that regresses.
 */

test("no horizontal overflow", async ({ page }) => {
  await page.goto("/");
  await page.waitForTimeout(1200);

  const { scrollWidth, clientWidth } = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));

  expect(scrollWidth, `document is ${scrollWidth - clientWidth}px wider than the viewport`)
    .toBeLessThanOrEqual(clientWidth);
});

test("webgl canvas is fixed, behind content, and context is live", async ({ page }) => {
  await page.goto("/");
  await page.waitForTimeout(1500);

  const info = await page.evaluate(() => {
    const c = document.querySelector("canvas") as HTMLCanvasElement | null;
    if (!c) return null;
    // walk up to the layer we positioned
    let el: HTMLElement | null = c;
    let fixed: string | null = null;
    let z: string | null = null;
    while (el && el !== document.body) {
      const cs = getComputedStyle(el);
      if (cs.position === "fixed") {
        fixed = cs.position;
        z = cs.zIndex;
        break;
      }
      el = el.parentElement;
    }
    return {
      hasContext: !!(c.getContext("webgl2") || c.getContext("webgl")),
      fixed,
      z,
      dpr: c.width / c.clientWidth,
      rootBg: getComputedStyle(document.documentElement).backgroundColor,
    };
  });

  expect(info, "no <canvas> rendered").not.toBeNull();
  expect(info!.hasContext, "WebGL context missing or lost").toBe(true);
  expect(info!.fixed, "canvas layer is not position:fixed").toBe("fixed");
  expect(Number(info!.z), "canvas must sit behind the DOM").toBeLessThan(0);
  // dpr must be capped at 2 or mobile GPUs melt
  expect(info!.dpr, "device pixel ratio is not capped at 2").toBeLessThanOrEqual(2);
  // root needs an opaque base or a z-index:-1 canvas is invisible
  expect(info!.rootBg).not.toBe("rgba(0, 0, 0, 0)");
});

test("scroll scrubs the webgl scene", async ({ page }) => {
  await page.goto("/");
  await page.waitForTimeout(1500);

  /* Drive scroll through LENIS. window.scrollTo is overwritten on Lenis's very
     next frame, so the page never actually moved and this compared two
     identical frames — it was failing for the right reason, via the wrong
     mechanism. */
  const before = await page.locator("canvas").screenshot();
  await page.evaluate(() => {
    const l = (window as unknown as { lenis?: { scrollTo: (n: number, o?: unknown) => void } }).lenis;
    if (l) l.scrollTo(1600, { immediate: true });
    else window.scrollTo(0, 1600);
  });
  await page.waitForTimeout(1800);
  const after = await page.locator("canvas").screenshot();

  expect(
    Buffer.compare(before, after) !== 0,
    "canvas did not change after scrolling — ScrollTrigger is not driving the scene",
  ).toBe(true);
});
