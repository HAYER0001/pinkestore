import { test, expect } from "@playwright/test";

const openViaBag = async (page: import("@playwright/test").Page) => {
  await page.getByRole("button", { name: /^Bag/ }).click();
  await page.waitForTimeout(1400);
};

test("drawer opens above everything and pushes the site back", async ({ page }) => {
  await page.goto("/");
  await page.waitForTimeout(2500);

  /* seed an item through the store so the test does not depend on hover UI */
  await page.evaluate(() => {
    const b = [...document.querySelectorAll("button")].find((x) =>
      /add to bag|quick add/i.test(x.textContent ?? ""),
    );
    b?.click();
  });
  await page.waitForTimeout(1600);

  const res = await page.evaluate(() => {
    const dialog = document.querySelector<HTMLElement>('[role="dialog"]');
    const main = document.querySelector<HTMLElement>("main");
    return {
      open: !!dialog,
      /* the drawer must be a direct child of body — a portal — because the
         shell's filter would otherwise clip and blur it */
      portaled: dialog?.parentElement === document.body,
      z: dialog ? Number(getComputedStyle(dialog).zIndex) : 0,
      bodyOverflow: getComputedStyle(document.body).overflow,
      mainFilter: main ? getComputedStyle(main).filter : "none",
      mainTransform: main ? getComputedStyle(main).transform : "none",
    };
  });

  expect(res.open, "drawer did not open").toBe(true);
  expect(res.portaled, "drawer is not portaled to body").toBe(true);
  expect(res.z, "drawer must sit above the cursor layer").toBeGreaterThan(2000000000);
  expect(res.bodyOverflow, "body scroll must be locked").toBe("hidden");
  expect(res.mainFilter, "pushback filter not applied").toContain("brightness");
  expect(res.mainTransform).not.toBe("none");
});

test("cart persists across reload", async ({ page }) => {
  await page.goto("/");
  await page.waitForTimeout(2500);
  await page.evaluate(() => {
    const b = [...document.querySelectorAll("button")].find((x) =>
      /add to bag|quick add/i.test(x.textContent ?? ""),
    );
    b?.click();
  });
  await page.waitForTimeout(1200);

  const before = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("pk-cart") ?? "{}"),
  );
  expect(before?.state?.items?.length ?? 0).toBeGreaterThan(0);
  /* isOpen must NOT be persisted — reloading into an open drawer is hostile */
  expect(before?.state?.isOpen, "isOpen should not be persisted").toBeUndefined();

  await page.reload();
  await page.waitForTimeout(2500);
  const after = await page.evaluate(() => {
    const raw = JSON.parse(localStorage.getItem("pk-cart") ?? "{}");
    return {
      items: raw?.state?.items?.length ?? 0,
      dialog: !!document.querySelector('[role="dialog"]'),
    };
  });
  expect(after.items).toBeGreaterThan(0);
  expect(after.dialog, "drawer should be closed after reload").toBe(false);
});

test("stock cap is enforced in the store, not just the UI", async ({ page }) => {
  await page.goto("/");
  await page.waitForTimeout(2500);

  const qty = await page.evaluate(() => {
    /* a one-of-one piece: ask for 9 and the store must clamp to 1 */
    const raw = localStorage.getItem("pk-cart");
    localStorage.setItem(
      "pk-cart",
      JSON.stringify({
        state: { items: [{ id: "madhubani-baraat-shawl", title: "x", price: 1, quantity: 9, imageSrc: "/x.jpg" }] },
        version: 1,
      }),
    );
    return raw;
  });
  void qty;

  await page.reload();
  await page.waitForTimeout(2500);

  /* Read what the APP uses, not the disk copy. onRehydrateStorage clamps the
     in-memory state on load, but Zustand does not rewrite localStorage until
     the next mutation — so the persisted blob still says 9 for a moment while
     the running cart already says 1. The header count is the honest signal. */
  const shown = await page.evaluate(() => {
    const bag = [...document.querySelectorAll("button")].find((b) =>
      /^Bag \(/.test(b.textContent ?? ""),
    );
    const m = bag?.textContent?.match(/\((\d+)\)/);
    return m ? Number(m[1]) : null;
  });

  expect(shown, "a tampered localStorage quantity must be clamped to stock").toBe(1);
});
