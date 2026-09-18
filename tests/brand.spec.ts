import { test, expect } from "@playwright/test";

/**
 * Brand system guards. A design system is only real if it is enforced — these
 * fail when someone reaches past the tokens.
 */

test("favicon renders from the monogram", async ({ page }) => {
  const res = await page.request.get("/icon");
  expect(res.status(), "generated icon route did not respond").toBe(200);
  expect(res.headers()["content-type"]).toContain("image");
});

test("wordmark is present and labelled on both header types", async ({ page }) => {
  /* commerce route */
  await page.goto("/checkout");
  await page.waitForTimeout(1500);
  await expect(page.getByLabel("The Pinkestore — home")).toBeVisible();

  /* cinematic route */
  await page.goto("/");
  await page.waitForTimeout(2500);
  await expect(page.getByLabel("The Pinkestore — home")).toBeVisible();
});

test("brand tokens resolve", async ({ page }) => {
  await page.goto("/");
  await page.waitForTimeout(1500);

  const tokens = await page.evaluate(() => {
    const cs = getComputedStyle(document.documentElement);
    const names = [
      "--color-brand-ivory",
      "--color-brand-paper",
      "--color-brand-rose",
      "--color-brand-rose-ink",
      "--color-brand-charcoal",
      "--color-brand-indigo",
      "--color-brand-gold",
      "--b-4",
      "--m-glide",
      "--m-ease",
    ];
    return Object.fromEntries(names.map((n) => [n, cs.getPropertyValue(n).trim()]));
  });

  for (const [name, value] of Object.entries(tokens)) {
    expect(value, `${name} is not defined`).not.toBe("");
  }
  expect(tokens["--color-brand-gold"].toUpperCase()).toContain("E8BC57");
});

test("the thread device draws as a curve, not a straight rule", async ({ page }) => {
  await page.goto("/lab/brand");
  await page.waitForTimeout(2000);

  const isCurve = await page.evaluate(() => {
    const p = document.querySelector("svg path[d^='M 0']");
    const d = p?.getAttribute("d") ?? "";
    /* a cubic segment is what gives it slack; a straight rule would be L or H */
    return d.includes("C");
  });

  expect(isCurve, "thread is a straight line — a straight line is a border, not a thread").toBe(true);
});
