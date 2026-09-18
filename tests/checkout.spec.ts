import { test, expect, type Page } from "@playwright/test";
import { PRODUCTS } from "../src/lib/catalog";

/**
 * PHASE 19 — CONVERSION AND TRUST.
 *
 * The previous checkout collected full name, mobile, email and postal address,
 * validated them, and then called alert("Payment provider is not connected
 * yet"). It looked exactly like a real checkout right up until the alert, so a
 * stranger had no way to know before typing their address that it was going
 * nowhere.
 *
 * It also promised "we pack by hand and write to you with a tracking number"
 * while /shipping states no courier and no tracking arrangement has been
 * decided — two pages of the same site contradicting each other, with the
 * unverifiable claim on the one where money changes hands.
 *
 * These tests exist so neither can come back.
 */

const addFirst = async (page: Page) => {
  await page.goto(`/product/${PRODUCTS[0].slug}`);
  await page.waitForTimeout(2000);
  await page.getByRole("button", { name: /add to bag/i }).first().click();
  await page.waitForTimeout(800);
};

test("it collects no personal data, because there is nowhere to put it", async ({ page }) => {
  await addFirst(page);
  await page.goto("/checkout");
  await page.waitForTimeout(1500);

  for (const sel of [
    'input[type="email"]',
    'input[type="tel"]',
    'input[autocomplete*="address"]',
    'input[autocomplete="name"]',
    'input[autocomplete="postal-code"]',
  ]) {
    expect(await page.locator(sel).count(), `${sel} is being collected`).toBe(0);
  }
  /* and it says so, rather than just quietly omitting it */
  await expect(page.locator("main")).toContainText("not collecting your address");
});

test("no claim it cannot keep", async ({ page }) => {
  await addFirst(page);
  await page.goto("/checkout");
  await page.waitForTimeout(1500);

  const text = (await page.locator("main").innerText()).toLowerCase();
  for (const claim of [
    "tracking number",
    "secure checkout",
    "ssl",
    "money back",
    "free shipping",
    "business days",
    "delivered within",
    "30-day",
  ]) {
    expect(text, `checkout claims "${claim}"`).not.toContain(claim);
  }
});

test("checkout and /shipping do not contradict each other", async ({ page }) => {
  await addFirst(page);
  await page.goto("/checkout");
  await page.waitForTimeout(1200);
  const checkout = (await page.locator("main").innerText()).toLowerCase();

  await page.goto("/shipping");
  await page.waitForTimeout(900);
  const shipping = (await page.locator("main").innerText()).toLowerCase();

  /* /shipping has no written policy, so checkout must not assert one */
  const shippingIsUnwritten = shipping.includes("not written yet");
  if (shippingIsUnwritten) {
    /* Deliberately blunt substring matching. A cleverer regex that tried to
       exclude negations would also let a real "flat rate Rs 200" through one
       day; the copy is written to avoid the words instead. */
    for (const claim of ["flat rate", "free over", "ships within", "dispatch within"]) {
      expect(checkout, `checkout asserts "${claim}" while /shipping is unwritten`).not.toContain(claim);
    }
  }
});

test("the buyer gets a reference and a real person to send it to", async ({ page }) => {
  await addFirst(page);
  await page.goto("/checkout");
  await page.waitForTimeout(1500);

  const ref = await page.locator("[data-order-ref]").innerText();
  expect(ref).toMatch(/^PK-[A-Z0-9]{6}$/);

  const link = page.getByRole("link", { name: /Message @the_pinkestore/i });
  await expect(link).toHaveAttribute("href", /instagram\.com/);
});

test("the reference is stable for the same bag", async ({ page }) => {
  await addFirst(page);
  await page.goto("/checkout");
  await page.waitForTimeout(1500);
  const a = await page.locator("[data-order-ref]").innerText();

  await page.reload();
  await page.waitForTimeout(1800);
  const b = await page.locator("[data-order-ref]").innerText();

  /* it is quoted to a human in a DM — it cannot change under them */
  expect(b).toBe(a);
});

test("an empty bag says so instead of showing an empty checkout", async ({ page }) => {
  await page.goto("/");
  await page.waitForTimeout(2500);
  await page.evaluate(() => {
    try {
      localStorage.removeItem("pk-cart");
    } catch {}
  });
  await page.goto("/checkout");
  await page.waitForTimeout(1800);

  await expect(page.locator("main")).toContainText("Your bag is empty");
  await expect(page.getByRole("link", { name: "See the collection" })).toHaveCount(1);
});

test("the total matches the pieces in the bag", async ({ page }) => {
  await addFirst(page);
  await page.goto("/checkout");
  await page.waitForTimeout(1500);

  const p = PRODUCTS[0];
  const expected = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(p.pricePaise / 100);

  const main = await page.locator("main").innerText();
  expect(main.replace(/\s/g, "")).toContain(expected.replace(/\s/g, ""));
});
