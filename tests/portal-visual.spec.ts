import { test } from "@playwright/test";

/**
 * Visual capture through the portal. Playwright's page is not background
 * throttled, so rAF-driven camera lerp and springs actually advance here —
 * unlike an automated tab in a real browser window.
 */
test("capture the portal opening", async ({ page }) => {
  await page.goto("/");
  await page.waitForTimeout(3000);

  const seek = async (frac: number) => {
    await page.evaluate((f) => {
      const l = (window as unknown as {
        lenis?: { scrollTo: (n: number, o?: unknown) => void };
      }).lenis;
      const y = document.documentElement.scrollHeight * f;
      if (l) l.scrollTo(y, { immediate: true });
      else window.scrollTo(0, y);
    }, frac);
    /* let the camera lerp settle — it is deliberately heavy */
    await page.waitForTimeout(3500);
  };

  await seek(0.70);
  await page.screenshot({ path: "test-results/portal-a-approach.png" });

  await seek(0.80);
  await page.screenshot({ path: "test-results/portal-b-opening.png" });

  await seek(0.88);
  await page.screenshot({ path: "test-results/portal-c-through.png" });
});
