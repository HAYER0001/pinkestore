import { test, expect } from "@playwright/test";

/**
 * PHASE 18 — MOBILE AS ITS OWN EXPERIENCE (item 86).
 *
 * Most of this phase landed inside earlier ones: vertical chapters, the type
 * ramp, the editorial menu overlay, the persistent add-to-bag, swipeable
 * galleries and full-screen viewing are all already built and tested.
 *
 * What an audit of every route at 390px actually turned up was tap targets.
 * The chrome is set in 11px uppercase micro-type — correct for the design, and
 * a 17px-tall hit area. Search, Menu and the bag are the primary navigation on
 * a phone and all three were under half of what both platform guidelines ask.
 */

const ROUTES = ["/", "/collection", "/craft", "/craft/jamawar-kani", "/about", "/care"];

test.describe("mobile", () => {
  test.skip(({ page }) => page.viewportSize()!.width >= 1024, "phones only");

  test("no route scrolls sideways", async ({ page }) => {
    for (const r of ROUTES) {
      await page.goto(r);
      await page.waitForTimeout(r === "/" ? 6000 : 1500);
      const over = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      /* a horizontal scrollbar on a phone is the loudest "built for a laptop"
         tell there is */
      expect(over, `${r} scrolls sideways by ${over}px`).toBeLessThanOrEqual(1);
    }
  });

  test("the primary controls are actually hittable", async ({ page }) => {
    await page.goto("/craft");
    await page.waitForTimeout(1800);

    for (const sel of [
      'button[aria-label="Search"]',
      'button[aria-label^="Bag"]',
      'button[aria-label="Open menu"]',
    ]) {
      const hit = await page.evaluate((s) => {
        const el = document.querySelector(s) as HTMLElement;
        if (!el) return { found: false, above: "", below: "" };
        const r = el.getBoundingClientRect();
        const at = (y: number) => {
          const t = document.elementFromPoint(r.x + r.width / 2, y);
          return t === el || el.contains(t) ? "hit" : (t?.tagName ?? "none");
        };
        /* the cushion has to extend past the visual box in both directions */
        return { found: true, above: at(r.y - 8), below: at(r.bottom + 8) };
      }, sel);

      expect(hit.found, `${sel} missing`).toBe(true);
      expect(hit.above, `${sel} misses a tap 8px above it`).toBe("hit");
      expect(hit.below, `${sel} misses a tap 8px below it`).toBe("hit");
    }
  });

  test("the cushions do not steal each other's taps", async ({ page }) => {
    await page.goto("/craft");
    await page.waitForTimeout(1800);

    /* An invisible 44px box around every control in a row would overlap its
       neighbours and swallow their taps, which is worse than the original
       problem. */
    const clash = await page.evaluate(() => {
      const els = [...document.querySelectorAll('[data-site-header] .tap')] as HTMLElement[];
      const bad: string[] = [];
      for (const el of els) {
        const r = el.getBoundingClientRect();
        /* the desktop nav also carries .tap and is display:none here, so its
           rect is 0x0 and elementFromPoint would answer about the page behind */
        if (r.width < 1 || r.height < 1) continue;
        const t = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
        if (!(t === el || el.contains(t))) bad.push(el.getAttribute("aria-label") ?? el.textContent ?? "?");
      }
      return bad;
    });
    expect(clash).toEqual([]);
  });

  test("the visual size of the chrome is unchanged", async ({ page }) => {
    await page.goto("/craft");
    await page.waitForTimeout(1800);
    /* the cushion is a pseudo-element: it must not push the header apart */
    const h = await page
      .locator('button[aria-label="Search"]')
      .evaluate((e) => e.getBoundingClientRect().height);
    expect(h).toBeLessThan(26);
  });
});
