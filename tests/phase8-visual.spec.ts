import { test } from "@playwright/test";

test("capture motif + product-on-film", async ({ page }) => {
  await page.goto("/");
  await page.waitForTimeout(3500);

  const seek = async (f: number) => {
    await page.evaluate((frac) => {
      const l = (window as unknown as { lenis?: { scrollTo: (n: number, o?: unknown) => void } }).lenis;
      const y = document.documentElement.scrollHeight * frac;
      if (l) l.scrollTo(y, { immediate: true });
      else window.scrollTo(0, y);
    }, f);
    await page.waitForTimeout(3200);
  };

  /* the morphed motif — should now fit the frame */
  await seek(0.085);
  await page.screenshot({ path: "test-results/p8-motif.png" });

  /* a product playing on the film */
  await seek(0.30);
  await page.screenshot({ path: "test-results/p8-product-on-film.png" });
});
