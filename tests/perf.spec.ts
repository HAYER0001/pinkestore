import { test } from "@playwright/test";

/**
 * FPS, measured somewhere it can actually be measured.
 *
 * A real browser tab driven by automation runs backgrounded, and Chrome clamps
 * requestAnimationFrame to ~1fps when visibilityState is "hidden" — every
 * reading from the preview pane has been measuring the throttle, not the
 * shader. Playwright's page is not throttled.
 */
test("frame rate across the scene", async ({ page }) => {
  await page.goto("/");
  await page.waitForTimeout(3500);

  const sample = async (label: string, frac: number) => {
    await page.evaluate((f) => {
      const l = (window as unknown as { lenis?: { scrollTo: (n: number, o?: unknown) => void } }).lenis;
      const y = document.documentElement.scrollHeight * f;
      if (l) l.scrollTo(y, { immediate: true });
      else window.scrollTo(0, y);
    }, frac);
    await page.waitForTimeout(1200);

    const r = await page.evaluate(async () => {
      let frames = 0;
      let worst = 0;
      let last = performance.now();
      const start = last;
      await new Promise<void>((resolve) => {
        const tick = (t: number) => {
          const dt = t - last;
          last = t;
          if (dt > worst) worst = dt;
          frames++;
          if (t - start < 2500) requestAnimationFrame(tick);
          else resolve();
        };
        requestAnimationFrame(tick);
      });
      return { fps: Math.round((frames * 1000) / (last - start)), worst: Math.round(worst) };
    });
    console.log(`  ${label.padEnd(22)} ${String(r.fps).padStart(3)} fps   worst ${r.worst}ms`);
  };

  await sample("dust + morph", 0.04);
  await sample("motif formed", 0.14);
  await sample("video scrubbing", 0.45);
  await sample("portal opening", 0.80);
});
