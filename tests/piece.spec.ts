import { test, expect, type Page } from "@playwright/test";
import { PRODUCTS } from "../src/lib/catalog";
import { getShots } from "../src/lib/shots";

/**
 * PHASE 11 — PRODUCT PAGE DEPTH.
 *
 * At Rs 18,000 to Rs 65,000 the most common unanswered question is "can I see
 * the actual stitch". Everything here serves that, so the tests are mostly
 * about the viewer working rather than about layout.
 */

const shot = PRODUCTS.find((p) => getShots(p.slug).length > 2)!;
const lenisTo = (page: Page, y: number) =>
  page.evaluate((t: number) => {
    const l = (window as unknown as { lenis?: { scrollTo: (n: number, o?: unknown) => void } }).lenis;
    if (l) l.scrollTo(t, { immediate: true });
    else window.scrollTo(0, t);
  }, y);

test.describe("the gallery", () => {
  test("shows every real frame, not one image repeated", async ({ page }) => {
    await page.goto(`/product/${shot.slug}`);
    await page.waitForTimeout(2200);

    const srcs = await page
      .locator("main img")
      .evaluateAll((els) =>
        els.map((e) => new URL((e as HTMLImageElement).currentSrc || (e as HTMLImageElement).src, "http://x").searchParams.get("url")).filter(Boolean),
      );
    const unique = new Set(srcs);
    /* The old page rendered the SAME photograph twice at scale(1.6) and
       scale(2.4) with shifted object-positions to fake a second view. */
    expect(unique.size, "the gallery is showing duplicates of one frame").toBeGreaterThan(2);
  });

  test("a frame opens full screen at the frame that was clicked", async ({ page }) => {
    await page.goto(`/product/${shot.slug}`);
    await page.waitForTimeout(2200);

    await page.locator("button[aria-label*='open full screen']").nth(1).click();
    const dialog = page.getByRole("dialog", { name: "Full screen view" });
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText("2 /");
  });
});

test.describe("full screen viewing", () => {
  const open = async (page: Page) => {
    await page.goto(`/product/${shot.slug}`);
    await page.waitForTimeout(2200);
    await page.locator("button[aria-label*='open full screen']").first().click();
    await page.getByRole("dialog", { name: "Full screen view" }).waitFor();
    await page.locator('[role="dialog"] img').first().waitFor({ state: "visible" });
    await page.waitForTimeout(600);
  };

  test("arrows move through the frames and wrap", async ({ page }) => {
    await open(page);
    const dialog = page.getByRole("dialog", { name: "Full screen view" });
    await expect(dialog).toContainText("1 /");

    await page.keyboard.press("ArrowRight");
    await page.waitForTimeout(500);
    await expect(dialog).toContainText("2 /");

    await page.keyboard.press("ArrowLeft");
    await page.keyboard.press("ArrowLeft");
    await page.waitForTimeout(600);
    const n = getShots(shot.slug).length;
    await expect(dialog, "it did not wrap round").toContainText(`${n} /`);
  });

  test("tapping zooms, and the origin stays inside the photograph", async ({ page }) => {
    await open(page);
    const img = page.locator('[role="dialog"] img').first();
    const box = (await img.boundingBox())!;

    /* Measure the UNZOOMED geometry first: getBoundingClientRect on a scaled
       element returns the scaled box, so computing the letterbox offsets after
       the click measures the wrong thing entirely. */
    const frame = await page.evaluate(() => {
      const el = document.querySelector('[role="dialog"] img')!.parentElement!;
      const im = el.querySelector("img") as HTMLImageElement;
      const r = el.getBoundingClientRect();
      const ar = im.naturalWidth / im.naturalHeight;
      const drawnW = r.width / r.height > ar ? r.height * ar : r.width;
      return { offX: (r.width - drawnW) / 2, drawnW };
    });

    /* A portrait frame in a landscape viewport is letterboxed, so most of this
       box is empty black. Clicking that band used to put the transform origin
       outside the picture and scaling threw it off screen entirely. */
    await page.mouse.click(box.x + 40, box.y + box.height / 2);
    await page.waitForTimeout(900);

    const state = await page.evaluate(() => {
      const el = document.querySelector('[role="dialog"] img')!.parentElement!;
      const cs = getComputedStyle(el);
      return {
        scale: new DOMMatrixReadOnly(cs.transform).a,
        originX: parseFloat(cs.transformOrigin),
      };
    });
    const min = frame.offX - 1;
    const max = frame.offX + frame.drawnW + 1;

    expect(state.scale, "it did not zoom").toBeGreaterThan(2);
    expect(state.originX, `origin ${state.originX} outside [${min}, ${max}]`).toBeGreaterThanOrEqual(min);
    expect(state.originX).toBeLessThanOrEqual(max);
  });

  test("escape steps out of zoom, then out of the viewer", async ({ page }) => {
    await open(page);
    const img = page.locator('[role="dialog"] img').first();
    const box = (await img.boundingBox())!;
    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
    await page.waitForTimeout(800);

    await page.keyboard.press("Escape");
    await page.waitForTimeout(700);
    /* still open, just unzoomed — escape should not throw away the frame you
       were looking at as well */
    await expect(page.getByRole("dialog", { name: "Full screen view" })).toBeVisible();

    await page.keyboard.press("Escape");
    await page.waitForTimeout(700);
    await expect(page.getByRole("dialog", { name: "Full screen view" })).toHaveCount(0);
    expect(await page.evaluate(() => getComputedStyle(document.body).overflow)).not.toBe("hidden");
  });
});

test.describe("the decision", () => {
  test("the price is display type, not a receipt line", async ({ page }) => {
    await page.goto(`/product/${shot.slug}`);
    await page.waitForTimeout(1600);

    const sizes = await page.evaluate(() => {
      const els = [...document.querySelectorAll("main p, main h1")];
      const price = els.find((e) => /^₹/.test((e as HTMLElement).innerText.trim()))!;
      const name = document.querySelector("main h1")!;
      return {
        price: parseFloat(getComputedStyle(price).fontSize),
        family: getComputedStyle(price).fontFamily,
        name: parseFloat(getComputedStyle(name).fontSize),
      };
    });
    expect(sizes.family.toLowerCase()).toContain("cormorant");
    /* second most important thing on the page, not a caption under the name */
    expect(sizes.price).toBeGreaterThan(24);
    expect(sizes.price).toBeLessThan(sizes.name);
  });

  test("availability reads as a state", async ({ page }) => {
    for (const p of PRODUCTS) {
      await page.goto(`/product/${p.slug}`);
      await page.waitForTimeout(700);
      const av = page.locator("[data-availability]");
      await expect(av).toHaveCount(1);
      await expect(av).toContainText(
        p.stock === 1 ? "One exists" : p.stock > 1 ? `${p.stock} available` : "Sold",
        { ignoreCase: true },
      );
    }
  });

  test("enquire privately offers a channel that exists", async ({ page }) => {
    await page.goto(`/product/${shot.slug}`);
    await page.waitForTimeout(1600);

    const btn = page.getByRole("button", { name: "Enquire privately" });
    await expect(btn).toHaveAttribute("aria-expanded", "false");
    await btn.click();
    await page.waitForTimeout(400);
    await expect(btn).toHaveAttribute("aria-expanded", "true");

    /* Not a contact form posting nowhere — the one channel that is real. */
    const link = page.getByRole("link", { name: /Message @the_pinkestore/ });
    await expect(link).toHaveAttribute("href", /instagram\.com/);
    expect(await page.locator("form input[type=email]").count()).toBe(0);
  });

  test("the sticky bar waits until the real button is gone", async ({ page }) => {
    test.skip(page.viewportSize()!.width >= 1024, "phones only");
    await page.goto(`/product/${shot.slug}`);
    await page.waitForTimeout(2200);

    const bar = page.locator("[data-sticky-buy]");
    const offset = () =>
      bar.evaluate((e) => {
        const m = new DOMMatrixReadOnly(getComputedStyle(e).transform);
        return m.f;
      });

    /* a bar covering the button it duplicates is just a smaller screen */
    expect(await offset(), "the bar is up while the real button is on screen").toBeGreaterThan(10);

    const y = await page.evaluate(
      () => document.getElementById("buy")!.getBoundingClientRect().top + window.scrollY + 900,
    );
    await lenisTo(page, y);
    /* Poll, do not sleep. The mobile project renders at DPR 3 with six
       full-width photographs, and a fixed wait loses that race. */
    await page
      .locator("[data-sticky-buy][aria-hidden='false']")
      .waitFor({ timeout: 15_000 })
      .catch(() => {});
    await page.waitForTimeout(700);
    expect(await offset(), "the bar never appeared").toBeLessThan(2);
  });
});
