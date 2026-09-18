import { test, expect } from "@playwright/test";

/**
 * Phase 5 guards. These assert the things that are CHEAP TO BREAK and silent
 * when they do: pointer-events pass-through, blend mode, and the absence of
 * Inter / rounded corners / shadows.
 */

test("overlay lets pointer events reach the canvas", async ({ page }) => {
  await page.goto("/");
  await page.waitForTimeout(1500);

  const res = await page.evaluate(() => {
    const overlay = document.querySelector<HTMLElement>(".pointer-events-none.fixed");
    const nav = document.querySelector<HTMLElement>("nav a");
    /* what actually receives a click in the middle of the screen? */
    const hit = document.elementFromPoint(window.innerWidth / 2, window.innerHeight / 2);
    return {
      overlayPE: overlay ? getComputedStyle(overlay).pointerEvents : null,
      navPE: nav ? getComputedStyle(nav).pointerEvents : null,
      centreTag: hit?.tagName ?? null,
      centreInOverlay: overlay && hit ? overlay.contains(hit) : null,
    };
  });

  expect(res.overlayPE, "overlay must not swallow pointer events").toBe("none");
  expect(res.navPE, "nav links must opt back in").toBe("auto");
  /* the element under the centre of the screen must NOT be inside the overlay,
     or WebGL mouse repulsion is dead */
  expect(res.centreInOverlay, "overlay is blocking the canvas at screen centre").toBeFalsy();
});

test("hero type uses the display serif, blends, and is not Inter", async ({ page }) => {
  await page.goto("/");
  await page.waitForTimeout(1500);

  const t = await page.evaluate(() => {
    const h1 = document.querySelector("h1");
    if (!h1) return null;
    const cs = getComputedStyle(h1);
    return { font: cs.fontFamily, blend: cs.mixBlendMode, radius: cs.borderRadius, shadow: cs.boxShadow };
  });

  expect(t).not.toBeNull();
  expect(t!.font.toLowerCase()).toContain("cormorant");
  expect(t!.font.toLowerCase()).not.toContain("inter");
  expect(t!.blend).toBe("difference");
  expect(t!.radius).toBe("0px");
  expect(t!.shadow).toBe("none");
});

test.describe("reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("text renders with no transform when motion is reduced", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(1500);

    const h1 = page.locator("h1").first();
    await expect(h1).toBeVisible();
    await expect(h1).toContainText("dust");

    /* with reduce, CinematicText must NOT split into masked spans at all */
    const split = await page.evaluate(
      () => document.querySelectorAll("h1 span[aria-hidden] span").length,
    );
    expect(split, "reduced motion must render plain text, not masked word spans").toBe(0);

    await page.screenshot({ path: "test-results/hero-reduced.png" });
  });
});
