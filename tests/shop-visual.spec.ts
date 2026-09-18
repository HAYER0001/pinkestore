import { test } from "@playwright/test";

test("capture the shop", async ({ page }) => {
  await page.goto("/");
  await page.waitForTimeout(3000);
  await page.evaluate(() => {
    const el = document.getElementById("pieces");
    const l = (window as unknown as { lenis?: { scrollTo: (t: unknown, o?: unknown) => void } }).lenis;
    if (el && l) l.scrollTo(el, { immediate: true });
  });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: "test-results/shop-grid.png" });

  /* hover the hero to capture the quick-add and the scrim */
  const hero = page.locator(".pk-bento > *").first();
  await hero.hover();
  await page.waitForTimeout(1400);
  await page.screenshot({ path: "test-results/shop-hover.png" });

  /* frame rate with the canvas handed off */
  const r = await page.evaluate(async () => {
    let frames = 0, last = performance.now();
    const start = last;
    await new Promise<void>((res) => {
      const tick = (t: number) => { last = t; frames++; t - start < 2200 ? requestAnimationFrame(tick) : res(); };
      requestAnimationFrame(tick);
    });
    return Math.round((frames * 1000) / (last - start));
  });
  console.log(`  SHOP FPS (canvas paused): ${r}`);
});
