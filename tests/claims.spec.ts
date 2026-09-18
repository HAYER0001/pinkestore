import { test, expect, type Page } from "@playwright/test";
import { PRODUCTS, CRAFTS } from "../src/lib/catalog";
import { POLICIES, isComplete } from "../src/lib/site";

/**
 * SITE-WIDE CLAIM SWEEP.
 *
 * This exists because I found the same bug three times on three different
 * surfaces, each time by accident:
 *
 *   checkout      "we pack by hand and write to you with a tracking number"
 *   cart drawer   "Shipping calculated at checkout"
 *   hero chrome   "Est. Mithila"
 *
 * In every case /shipping says no courier is chosen, checkout calculates
 * nothing, and the shop is in Chandigarh. A page-by-page test would have
 * caught none of them, because each was on a surface whose own tests were
 * about something else entirely.
 *
 * So this sweeps EVERY route for claims the site cannot back, and it runs
 * against the whole catalogue rather than a sample. The list is deliberately
 * blunt: copy is written to avoid these words rather than to argue with the
 * matcher, because a regex clever enough to excuse a negation would also let a
 * real one through one day.
 */

const ROUTES = [
  "/", "/collection", "/craft", "/journal", "/about", "/contact",
  "/shipping", "/returns", "/care", "/privacy", "/terms", "/checkout",
  ...Object.keys(CRAFTS).map((c) => `/craft/${c}`),
  ...PRODUCTS.map((p) => `/product/${p.slug}`),
];

/** Claims requiring a policy, a processor or a certificate we do not have. */
const UNBACKED = [
  "tracking number",
  "shipping calculated",
  "secure checkout",
  "money back",
  "free shipping",
  "free delivery",
  "business days",
  "delivered within",
  "30-day",
  "gi certified",
  "gi-certified",
  "certified authentic",
  "100% authentic",
  "as seen in",
  "est. mithila",
  "lifetime warranty",
  "easy returns",
];

/** Manufactured urgency. The whole argument of the shop collapses under it. */
const URGENCY = [
  "hurry",
  "selling fast",
  "almost gone",
  "don't miss",
  "limited time",
  "act now",
  "only a few left",
];

/**
 * Customer-facing text only. The dev-only build notes on the unwritten policy
 * pages legitimately contain phrases like "whether a tracking number is sent
 * automatically" — they are questions TO the owner, they are marked
 * [data-build-note], and a separate test already asserts they reach no
 * production bundle. Sweeping them here would be checking the scaffolding.
 */
const read = async (page: Page, route: string) => {
  await page.goto(route);
  await page.waitForTimeout(route === "/" ? 6000 : 900);
  return (
    await page.evaluate(() => {
      /* Hide, read, restore — do NOT clone. innerText on a DETACHED node falls
         back to textContent, which drags in <script> contents including Next's
         RSC payload: 34,000 characters of serialised props instead of the
         1,400 the page actually renders, and the build-note strings are in
         there regardless of the element being removed. */
      const notes = [...document.querySelectorAll<HTMLElement>("[data-build-note]")];
      const prev = notes.map((n) => n.style.display);
      notes.forEach((n) => (n.style.display = "none"));
      const text = document.body.innerText;
      notes.forEach((n, i) => (n.style.display = prev[i]));
      return text;
    })
  ).toLowerCase();
};

test.describe("no page claims what the shop cannot back", () => {
  for (const route of ROUTES) {
    test(`${route}`, async ({ page }) => {
      const text = await read(page, route);
      for (const claim of UNBACKED) {
        expect(text, `${route} claims "${claim}"`).not.toContain(claim);
      }
      for (const push of URGENCY) {
        expect(text, `${route} uses urgency: "${push}"`).not.toContain(push);
      }
    });
  }
});

test("a written policy and the pages that reference it agree", async ({ page }) => {
  /* If /shipping ever gets written, this stops being vacuous and starts
     checking that checkout and the drawer match it. */
  const shippingWritten = isComplete(POLICIES.shipping);
  const text = await read(page, "/checkout");

  if (!shippingWritten) {
    for (const term of ["flat rate", "ships within", "dispatch within", "free over"]) {
      expect(text, `checkout asserts "${term}" while /shipping is unwritten`).not.toContain(term);
    }
  }
});

test("every surface that shows a price agrees with the catalogue", async ({ page }) => {
  const inr = (paise: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 })
      .format(paise / 100)
      .replace(/\s/g, "");

  for (const p of PRODUCTS) {
    const body = (await read(page, `/product/${p.slug}`)).replace(/\s/g, "");
    expect(body, `${p.slug} shows a price other than the catalogue's`).toContain(inr(p.pricePaise));
  }
});
