import { test } from "@playwright/test";
test("capture the drawer", async ({ page }) => {
  await page.goto("/");
  await page.waitForTimeout(2500);
  await page.evaluate(() => {
    const b = [...document.querySelectorAll("button")].find((x) =>
      /add to bag|quick add/i.test(x.textContent ?? ""),
    );
    b?.click();
  });
  await page.waitForTimeout(2200);
  await page.screenshot({ path: "test-results/cart-drawer.png" });
});
