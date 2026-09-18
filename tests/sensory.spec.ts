import { test, expect } from "@playwright/test";

/**
 * Phase 8 guards. These exist because every one of these pieces can be built
 * correctly and then never wired to anything — which is exactly what had
 * happened to CursorZone and VelocityDistort.
 */

/* The custom cursor deliberately does NOT mount on coarse pointers — there is
   no cursor to replace and `cursor: none` would hide nothing. Asserting it
   exists on mobile tests the opposite of the intended behaviour. */
test("cursor: dual layer, blended, topmost, and hidden native cursor", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === "mobile", "custom cursor is fine-pointer only by design");
  await page.goto("/");
  await page.waitForTimeout(2000);
  await page.mouse.move(700, 400);
  await page.waitForTimeout(600);

  const c = await page.evaluate(() => {
    const layer = [...document.querySelectorAll<HTMLElement>("div")].find(
      (d) => getComputedStyle(d).zIndex === "2147483647",
    );
    if (!layer) return null;
    const kids = [...layer.children] as HTMLElement[];
    const sizes = kids.map((k) => Math.round(k.getBoundingClientRect().width));
    return {
      blend: getComputedStyle(layer).mixBlendMode,
      pointer: getComputedStyle(layer).pointerEvents,
      layers: kids.length,
      sizes,
      bodyCursor: getComputedStyle(document.body).cursor,
    };
  });

  expect(c, "cursor layer not mounted").not.toBeNull();
  expect(c!.blend).toBe("difference");
  expect(c!.pointer, "cursor must never intercept clicks").toBe("none");
  expect(c!.layers, "cursor must be dual-layer").toBe(2);
  expect(c!.bodyCursor, "native cursor must be hidden on fine pointers").toBe("none");
  /* one layer tiny (the exact dot), one large (the trailing ring) */
  expect(Math.min(...c!.sizes)).toBeLessThanOrEqual(4);
  expect(Math.max(...c!.sizes)).toBeGreaterThan(20);
});

test("cursor ring LOCKS onto a product card", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === "mobile", "no cursor on touch devices");
  await page.goto("/");
  await page.waitForTimeout(2500);
  await page.evaluate(() => {
    const el = document.getElementById("pieces");
    const l = (window as unknown as { lenis?: { scrollTo: (t: unknown, o?: unknown) => void } }).lenis;
    if (el && l) l.scrollTo(el, { immediate: true });
  });
  await page.waitForTimeout(2500);

  const ringWidth = () =>
    page.evaluate(() => {
      const layer = [...document.querySelectorAll<HTMLElement>("div")].find(
        (d) => getComputedStyle(d).zIndex === "2147483647",
      );
      const ring = layer?.children[0] as HTMLElement | undefined;
      return ring ? Math.round(ring.getBoundingClientRect().width) : 0;
    });

  const idle = await ringWidth();
  await page.locator(".pk-bento > *").first().hover();
  await page.waitForTimeout(1200);
  const locked = await ringWidth();

  expect(idle, "ring should be small at rest").toBeLessThan(60);
  expect(
    locked,
    `ring did not lock onto the card (idle ${idle}px -> ${locked}px)`,
  ).toBeGreaterThan(idle * 3);
});

test("ambient audio exists and the toggle is enabled", async ({ page }) => {
  const res = await page.request.get("/audio/ambient.ogg");
  expect(res.status(), "no ambient track installed").toBe(200);

  await page.goto("/");
  await page.waitForTimeout(2500);
  const btn = page.getByRole("button", { name: /ambient sound/i });
  await expect(btn).toBeEnabled();
  await expect(btn).toHaveAttribute("aria-pressed", "false");
});

test("velocity distortion is actually applied to something", async ({ page }) => {
  await page.goto("/");
  await page.waitForTimeout(2500);

  /* At rest scaleY is exactly 1 and Motion emits `transform: none`, not an
     identity matrix — so this must be measured WHILE the page is moving.
     Sample repeatedly during a hard scroll and keep the largest stretch seen. */
  const peak = await page.evaluate(async () => {
    const targets = () =>
      [...document.querySelectorAll<HTMLElement>("div")].filter(
        (d) => getComputedStyle(d).willChange === "transform",
      );

    if (targets().length === 0) return -1; // not wired at all

    const l = (window as unknown as { lenis?: { scrollTo: (n: number, o?: unknown) => void } }).lenis;
    const h = document.documentElement.scrollHeight;

    let best = 1;
    for (let i = 0; i < 24; i++) {
      /* alternate ends to keep velocity genuinely high */
      const y = i % 2 === 0 ? h * 0.9 : h * 0.55;
      if (l) l.scrollTo(y, { duration: 0.35 });
      else window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 90));
      for (const el of targets()) {
        const m = new DOMMatrixReadOnly(getComputedStyle(el).transform);
        if (m.d > best) best = m.d; // m.d is the Y scale component
      }
    }
    return best;
  });

  expect(peak, "VelocityDistort is not wired to any content").toBeGreaterThan(0);
  expect(peak, "scaleY never rose above 1 — distortion is inert").toBeGreaterThan(1.001);
  expect(peak, "distortion exceeded its cap — this would read as a broken transform").toBeLessThan(1.08);
});
