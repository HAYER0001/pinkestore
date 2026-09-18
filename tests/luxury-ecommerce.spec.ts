import { test, expect, type Page } from "@playwright/test";

/**
 * THE STRUCTURAL SUITE.
 *
 * Every scroll here goes through LENIS. window.scrollTo and scrollIntoView are
 * overwritten on Lenis's next frame, so a spec that uses them silently tests a
 * page that never moved.
 */

const lenisTo = async (page: Page, y: number) => {
  await page.evaluate((target) => {
    const l = (window as unknown as { lenis?: { scrollTo: (n: number, o?: unknown) => void } }).lenis;
    if (l) l.scrollTo(target, { immediate: true });
    else window.scrollTo(0, target);
  }, y);
  await page.waitForTimeout(1200);
};

const noOverflow = async (page: Page) =>
  page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));

/* ------------------------------------------------------------------ */
/* Test 1 — Timeline integrity                                         */
/* ------------------------------------------------------------------ */

test("timeline: no horizontal overflow anywhere on the cinematic run", async ({ page }) => {
  await page.goto("/");
  await page.waitForTimeout(3000);

  for (let y = 0; y <= 3000; y += 500) {
    await lenisTo(page, y);
    const { scrollWidth, clientWidth } = await noOverflow(page);
    expect(
      scrollWidth,
      `horizontal overflow of ${scrollWidth - clientWidth}px at scrollY ${y}`,
    ).toBeLessThanOrEqual(clientWidth);
  }
});

test("timeline: the portal headline actually pins", async ({ page }) => {
  await page.goto("/");
  await page.waitForTimeout(3000);

  /* The portal sits AFTER a 150vh morph zone and a 520vh scrub track, so it is
     nowhere near y=3000.measure it where it actually lives: find the section's own
     offset and sweep ITS range. Sweeping 0-3000 measured an element that had
     not pinned yet, which is why it "drifted" exactly as far as it scrolled. */
  const range = await page.evaluate(() => {
    const el = [...document.querySelectorAll("h2")].find((h) =>
      /enter the collection/i.test(h.textContent ?? ""),
    );
    const section = el?.closest("section");
    if (!section) return null;
    const top = section.getBoundingClientRect().top + window.scrollY;
    const h = section.getBoundingClientRect().height;
    /* The pin runs from "top top" to "bottom bottom", i.e. it RELEASES once the
       section's bottom reaches the viewport bottom — that is start + height -
       innerHeight, NOT start + height. Sampling past it measures the element
       after it has been unpinned, which is what produced the 7425px "drift". */
    return {
      start: Math.round(top),
      pinEnd: Math.round(top + h - window.innerHeight),
    };
  });

  expect(range, "portal section not found").not.toBeNull();

  const span = range!.pinEnd - range!.start;
  expect(span, "pin window is degenerate").toBeGreaterThan(200);

  const seen: number[] = [];
  for (let i = 0; i <= 5; i++) {
    /* stay strictly inside the pin window, 8% to 88% of it */
    await lenisTo(page, range!.start + span * (0.08 + i * 0.16));
    const top = await page.evaluate(() => {
      const el = [...document.querySelectorAll("h2")].find((h) =>
        /enter the collection/i.test(h.textContent ?? ""),
      );
      return el ? Math.round(el.getBoundingClientRect().top) : null;
    });
    if (top !== null) seen.push(top);

    const { scrollWidth, clientWidth } = await noOverflow(page);
    expect(scrollWidth, "overflow while pinned").toBeLessThanOrEqual(clientWidth);
  }

  expect(seen.length).toBeGreaterThan(3);
  const spread = Math.max(...seen) - Math.min(...seen);
  /* Pinned means it holds position relative to the VIEWPORT. Unpinned it would
     travel the full section height (several thousand px). */
  expect(spread, `pinned element drifted ${spread}px — pin is not holding`).toBeLessThan(400);
});

/* ------------------------------------------------------------------ */
/* Test 2 — Cart physics                                               */
/* ------------------------------------------------------------------ */

test("cart: quick add updates the store, pushes the layout back, opens the drawer", async ({ page }) => {
  await page.goto("/");
  await page.waitForTimeout(3000);

  await page.evaluate(() => {
    const el = document.getElementById("pieces");
    const l = (window as unknown as { lenis?: { scrollTo: (t: unknown, o?: unknown) => void } }).lenis;
    if (el && l) l.scrollTo(el, { immediate: true });
  });
  await page.waitForTimeout(2200);

  const before = await page.evaluate(() => {
    const b = [...document.querySelectorAll("button")].find((x) => /^Bag \(/.test(x.textContent ?? ""));
    return Number(b?.textContent?.match(/\((\d+)\)/)?.[1] ?? -1);
  });
  expect(before).toBe(0);

  /* hover reveals the quick-add, then click it */
  await page.locator(".pk-bento > *").first().hover();
  await page.waitForTimeout(700);
  await page.getByRole("button", { name: /add .* to bag/i }).first().click();
  await page.waitForTimeout(1800);

  const after = await page.evaluate(() => {
    const dialog = document.querySelector<HTMLElement>('[role="dialog"]');
    const main = document.querySelector<HTMLElement>("main");
    const bag = [...document.querySelectorAll("button")].find((x) => /^Bag \(/.test(x.textContent ?? ""));
    const m = main ? new DOMMatrixReadOnly(getComputedStyle(main).transform) : null;
    return {
      count: Number(bag?.textContent?.match(/\((\d+)\)/)?.[1] ?? -1),
      drawerOpen: !!dialog,
      drawerInView: dialog
        ? dialog.getBoundingClientRect().right > 0 &&
          dialog.getBoundingClientRect().left < window.innerWidth
        : false,
      mainScale: m ? Number(m.a.toFixed(3)) : 1,
      mainFilter: main ? getComputedStyle(main).filter : "none",
      bodyLocked: getComputedStyle(document.body).overflow,
    };
  });

  expect(after.count, "Zustand store did not reach the DOM").toBe(1);
  expect(after.drawerOpen, "cart drawer did not mount").toBe(true);
  expect(after.drawerInView, "drawer did not slide into the viewport").toBe(true);
  expect(after.mainScale, "layout pushback did not apply scale 0.98").toBeLessThan(0.995);
  expect(after.mainFilter).toContain("brightness");
  expect(after.bodyLocked, "body scroll must lock while the cart is open").toBe("hidden");
});

/* ------------------------------------------------------------------ */
/* Test 3 — Mobile (iPhone 14 metrics)                                 */
/* ------------------------------------------------------------------ */

test("mobile: bento stacks to one column with no horizontal shift", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "iPhone-14-metrics project only");

  await page.goto("/");
  await page.waitForTimeout(3000);
  await page.evaluate(() => {
    const el = document.getElementById("pieces");
    const l = (window as unknown as { lenis?: { scrollTo: (t: unknown, o?: unknown) => void } }).lenis;
    if (el && l) l.scrollTo(el, { immediate: true });
  });
  await page.waitForTimeout(2200);

  const grid = await page.evaluate(() => {
    const g = document.querySelector(".pk-bento");
    if (!g) return null;
    const kids = [...g.children] as HTMLElement[];
    return {
      widths: kids.map((k) => Math.round(k.getBoundingClientRect().width)),
      lefts: kids.map((k) => Math.round(k.getBoundingClientRect().left)),
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    };
  });

  expect(grid).not.toBeNull();
  /* one column: every cell the same width AND the same left edge */
  expect(new Set(grid!.widths).size, "cells are not equal width — grid did not collapse").toBe(1);
  expect(new Set(grid!.lefts).size, "cells are not aligned — more than one column").toBe(1);
  expect(grid!.scrollWidth, "horizontal shift on mobile").toBeLessThanOrEqual(grid!.clientWidth);

  /* and the adaptive tier must actually have cut the particle budget */
  const tier = await page.evaluate(() => {
    const hud = [...document.querySelectorAll("div")].find((d) =>
      /particles/.test(d.textContent ?? ""),
    );
    const m = hud?.textContent?.match(/([\d,]+)\s+particles/);
    return m ? Number(m[1].replace(/,/g, "")) : null;
  });
  if (tier !== null) {
    expect(tier, `mobile still running ${tier} particles — tiering did not apply`).toBeLessThanOrEqual(12000);
  }
});
