import { test, expect } from "@playwright/test";

const toShop = async (page: import("@playwright/test").Page) => {
  await page.evaluate(() => {
    const el = document.getElementById("pieces");
    const l = (window as unknown as { lenis?: { scrollTo: (t: unknown, o?: unknown) => void } }).lenis;
    if (el && l) l.scrollTo(el, { immediate: true });
    else el?.scrollIntoView();
  });
  await page.waitForTimeout(2500);
};

test("webgl hands off: canvas hidden and render loop paused", async ({ page }) => {
  await page.goto("/");
  await page.waitForTimeout(3000);
  await toShop(page);

  const res = await page.evaluate(() => {
    const c = document.querySelector("canvas");
    let layer: HTMLElement | null = c;
    while (layer && getComputedStyle(layer).position !== "fixed") layer = layer.parentElement;
    return {
      opacity: layer ? getComputedStyle(layer).opacity : null,
      pointer: layer ? getComputedStyle(layer).pointerEvents : null,
    };
  });

  expect(Number(res.opacity), "canvas must fade out over the shop").toBeLessThan(0.2);
  expect(res.pointer).toBe("none");
});

test("the render loop actually stops", async ({ page }) => {
  await page.goto("/");
  await page.waitForTimeout(3000);
  await toShop(page);
  await page.waitForTimeout(1200);

  /* Measure the loop itself. Comparing canvas PIXELS cannot prove this: a
     zero-opacity layer screenshots identically whether or not it is still
     rendering, so that test would pass for the wrong reason. */
  const read = () =>
    page.evaluate(() => (window as unknown as { __pkFrames?: number }).__pkFrames ?? 0);

  const before = await read();
  await page.waitForTimeout(1400);
  const after = await read();

  expect(before, "frame hook never ran — the scene was not rendering at all").toBeGreaterThan(0);
  expect(
    after - before,
    `render loop still running after handoff (+${after - before} frames in 1.4s)`,
  ).toBeLessThanOrEqual(2);
});

test("grid is asymmetric, square-cornered and shadowless", async ({ page }) => {
  await page.goto("/");
  await page.waitForTimeout(3000);
  await toShop(page);

  const cards = await page.evaluate(() => {
    const grid = document.querySelector(".pk-bento");
    if (!grid) return null;
    return [...grid.children].map((el) => {
      const cs = getComputedStyle(el as HTMLElement);
      const r = (el as HTMLElement).getBoundingClientRect();
      return {
        w: Math.round(r.width),
        h: Math.round(r.height),
        radius: cs.borderRadius,
        shadow: cs.boxShadow,
        border: cs.borderTopWidth,
      };
    });
  });

  expect(cards).not.toBeNull();
  expect(cards!.length).toBe(5);

  for (const c of cards!) {
    expect(c.radius, "luxury is sharp — no rounded corners").toBe("0px");
    expect(c.shadow, "no drop shadows").toBe("none");
    expect(parseFloat(c.border), "each cell needs a hairline border").toBeGreaterThan(0);
  }

  /* Asymmetry is a DESKTOP property. Below md the bento deliberately collapses
     to a single full-width column — a 12-column bento at 390px is slivers — so
     equal widths there are correct, not a regression. */
  const vp = page.viewportSize();
  if (vp && vp.width >= 768) {
    const widths = new Set(cards!.map((c) => c.w));
    expect(widths.size, "grid is uniform — that is a catalogue, not an edit").toBeGreaterThan(1);
  } else {
    const widths = new Set(cards!.map((c) => c.w));
    expect(widths.size, "mobile must collapse to one column").toBe(1);
  }
});

test("all five images load", async ({ page }) => {
  await page.goto("/");
  await page.waitForTimeout(3000);
  await toShop(page);
  await page.waitForTimeout(1500);

  const imgs = await page.evaluate(() =>
    [...document.querySelectorAll(".pk-bento img")].map((i) => ({
      complete: (i as HTMLImageElement).complete,
      w: (i as HTMLImageElement).naturalWidth,
    })),
  );

  expect(imgs.length).toBe(5);
  for (const i of imgs) {
    expect(i.complete).toBe(true);
    expect(i.w, "an image failed to decode").toBeGreaterThan(0);
  }
});
