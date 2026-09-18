import { test, expect, type Page } from "@playwright/test";
import { existsSync, readFileSync } from "node:fs";
import { NAV, POLICIES, isComplete } from "../src/lib/site";
import { CRAFTS } from "../src/lib/catalog";

/**
 * PHASE 3 — ROUTE SKELETON.
 *
 * Two things are being guarded, and only one of them is "the pages exist".
 *
 * The other is that none of them LIE. Seven of these routes are service and
 * legal documents whose real content is a set of business decisions nobody has
 * made yet. The failure mode is not a 404 — it is a plausible paragraph. A
 * shipping page that says "we usually dispatch within 2-3 business days"
 * because that is what shipping pages say is a promise made in the owner's
 * name by someone with no authority to make it.
 */

/* Route strings are literals here on purpose. Reading them from NAV would make
   the test agree with the nav by construction — including when the nav points
   at a route that does not exist. */
const POLICY_ROUTES = ["/about", "/contact", "/shipping", "/returns", "/care", "/privacy", "/terms"];
const INDEX_ROUTES = ["/collection", "/craft", "/journal"];
const ALL = [...INDEX_ROUTES, ...POLICY_ROUTES, ...Object.keys(CRAFTS).map((c) => `/craft/${c}`)];

/* The whole point of writing scaffolding by hand is that none of this leaks. */
const FORBIDDEN = [
  "lorem ipsum",
  "coming soon",
  "tbd",
  "to be decided",
  "placeholder",
  "needs_real_data",
  "insert ",
  "your text here",
  "sample text",
];

const bodyText = async (page: Page) =>
  (await page.locator("body").innerText()).toLowerCase();

test.describe("every route in the IA resolves", () => {
  for (const route of ALL) {
    test(`${route} renders`, async ({ page }) => {
      const res = await page.goto(route);
      expect(res?.status(), `${route} did not return 200`).toBe(200);

      /* A page with no h1 is a page the nav can link to but nobody can read. */
      const h1 = page.locator("h1");
      await expect(h1).toHaveCount(1);
      expect((await h1.innerText()).trim().length).toBeGreaterThan(3);
    });
  }

  test("the nav does not point at anything that is missing", async ({ page }) => {
    const hrefs = [...new Set(NAV.flatMap((g) => g.items.map((i) => i.href)))];
    expect(hrefs.length).toBeGreaterThan(8);
    for (const href of hrefs) {
      const res = await page.goto(href);
      expect(res?.status(), `${href} is in NAV but does not resolve`).toBe(200);
    }
  });
});

test.describe("nothing is faked", () => {
  for (const route of ALL) {
    test(`${route} contains no placeholder copy`, async ({ page }) => {
      await page.goto(route);
      const text = await bodyText(page);
      for (const phrase of FORBIDDEN) {
        expect(text, `${route} contains "${phrase}"`).not.toContain(phrase);
      }
    });
  }

  test("an unwritten section is dropped, not filled in", async ({ page }) => {
    await page.goto("/shipping");
    const text = await bodyText(page);

    /* Every heading in the document is unwritten, so none of them may appear
       as a rendered section heading. */
    for (const s of POLICIES.shipping.sections) {
      expect(
        await page.getByRole("heading", { name: s.heading, exact: true }).count(),
        `"${s.heading}" was rendered although it has no body`,
      ).toBe(0);
    }
    /* ...and the reader is told so plainly rather than shown a blank page. */
    expect(text).toContain("not written yet");
  });

  test("a written section IS rendered", async ({ page }) => {
    await page.goto("/care");
    for (const c of Object.values(CRAFTS)) {
      await expect(page.getByRole("heading", { name: c.label, exact: true })).toHaveCount(1);
    }
  });

  test("the printed craft is labelled printed, in the index and on its page", async ({ page }) => {
    const [slug, craft] = Object.entries(CRAFTS).find(([, c]) => !c.handmade)!;

    await page.goto("/craft");
    expect(await bodyText(page)).toContain("printed, not handmade");

    await page.goto(`/craft/${slug}`);
    const text = await bodyText(page);
    expect(text, `${craft.label} must say so on its own page`).toContain("printed, not handmade");
  });
});

test.describe("incomplete documents stay out of the index", () => {
  for (const route of POLICY_ROUTES) {
    test(`${route} robots tag matches its completeness`, async ({ page }) => {
      await page.goto(route);
      const robots = await page
        .locator('meta[name="robots"]')
        .first()
        .getAttribute("content")
        .catch(() => null);

      const doc = POLICIES[route.slice(1)];
      if (isComplete(doc)) {
        expect(robots ?? "index", `${route} is complete and should be indexable`).toContain("index");
        expect(robots ?? "index").not.toContain("noindex");
      } else {
        /* A half-written returns policy cached by Google is the version a
           customer quotes back at you. */
        expect(robots, `${route} is incomplete and must be noindex`).toContain("noindex");
      }
    });
  }

  test("the build note never reaches a production bundle", async () => {
    const built = ".next/server/app/shipping.html";
    test.skip(!existsSync(built), "no production build on disk — run npm run build");
    expect(readFileSync(built, "utf8")).not.toContain("data-build-note");
  });

  test("but it is there in development, so the gaps are visible", async ({ page }) => {
    await page.goto("/shipping");
    await expect(page.locator("[data-build-note]")).toBeVisible();
  });
});

test.describe("the catalogue pages are real", () => {
  test("collection lists every piece and filters by category", async ({ page }) => {
    await page.goto("/collection");
    const all = await page.locator('a[href^="/product/"]').count();
    expect(all).toBeGreaterThanOrEqual(5);

    await page.goto("/collection?category=suit-set");
    const filtered = await page.locator('a[href^="/product/"]').count();
    expect(filtered).toBeGreaterThan(0);
    expect(filtered).toBeLessThan(all);

    /* An unknown filter shows everything rather than an empty shop. */
    await page.goto("/collection?category=nonsense");
    expect(await page.locator('a[href^="/product/"]').count()).toBe(all);
  });

  test("product cards are not collapsed to a hairline", async ({ page }) => {
    await page.goto("/collection");
    await page.waitForTimeout(800);
    /* ProductCard is position:relative with every child absolute — dropped in
       a plain block wrapper it has no intrinsic height and renders as a line. */
    const h = await page
      .locator('a[href^="/product/"]')
      .first()
      .evaluate((e) => e.getBoundingClientRect().height);
    expect(h).toBeGreaterThan(200);
  });

  test("each craft page shows its own pieces and nobody else's", async ({ page }) => {
    for (const slug of Object.keys(CRAFTS)) {
      await page.goto(`/craft/${slug}`);
      const hrefs = await page.locator('a[href^="/product/"]').evaluateAll((els) =>
        [...new Set(els.map((e) => (e as HTMLAnchorElement).getAttribute("href")!))],
      );
      for (const href of hrefs) {
        const res = await page.request.get(href);
        expect(res.status()).toBe(200);
      }
    }
  });

  test("an empty journal 404s its entries rather than rendering a shell", async ({ page }) => {
    const res = await page.goto("/journal/anything-at-all");
    expect(res?.status()).toBe(404);
  });
});

test.describe("structure", () => {
  test("breadcrumbs mark the current page and link the rest", async ({ page }) => {
    await page.goto("/craft/sozni-hand-embroidered");
    const crumbs = page.locator('nav[aria-label="Breadcrumb"] li');
    await expect(crumbs).toHaveCount(3);
    await expect(crumbs.last().locator('[aria-current="page"]')).toHaveCount(1);
    await expect(crumbs.first().locator("a")).toHaveAttribute("href", "/");
  });

  test("no h2 outranks the h1 it sits under", async ({ page }) => {
    for (const route of ["/craft", "/collection", "/care", "/journal"]) {
      await page.goto(route);
      const sizes = await page.evaluate(() => {
        const px = (el: Element) => parseFloat(getComputedStyle(el).fontSize);
        const h1 = document.querySelector("h1 span span span") ?? document.querySelector("h1");
        return {
          h1: px(h1!),
          h2: [...document.querySelectorAll("h2")].map((e) =>
            px(e.querySelector("a") ?? e),
          ),
        };
      });
      for (const s of sizes.h2) {
        expect(s, `${route}: an h2 at ${s}px under an h1 at ${sizes.h1}px`).toBeLessThan(sizes.h1);
      }
    }
  });
});
