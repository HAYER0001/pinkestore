import { test, expect } from "@playwright/test";
import { PLACES, project, PROCESS, MATERIALS } from "../src/lib/places";
import { CRAFTS, type Craft } from "../src/lib/catalog";

/**
 * PHASE 8 — PLACE AND MATERIAL.
 *
 * Two constraints drive almost every test here.
 *
 * NO DURATIONS. Every competitor puts "6–8 weeks" on a making timeline. We do
 * not know how long any of these pieces took — makingTime is NEEDS_REAL_DATA —
 * and an invented figure would be the most confident-looking claim on the site
 * and the one a buyer is most likely to repeat to someone else.
 *
 * NO MAP OF INDIA. Depicting India's boundaries is legally constrained in
 * India, and an outline traced by eye is not a defensible way for an Indian
 * business to take a position on a border. The diagram has four points and
 * three threads and no coastline.
 */

const CRAFT_KEYS = Object.keys(CRAFTS) as Craft[];

test.describe("the making timeline invents nothing", () => {
  test("no step claims a duration", () => {
    /* a number next to a unit of time, in any of the forms this would slip in */
    const DURATION = /\b\d+\s*(?:–|-|to\s)?\s*\d*\s*(hour|day|week|month|year)s?\b/i;
    for (const craft of CRAFT_KEYS) {
      for (const step of PROCESS[craft] ?? []) {
        const text = `${step.label} ${step.detail}`;
        expect(DURATION.test(text), `${craft}: "${text}" states a duration`).toBe(false);
      }
    }
  });

  test("every craft has an ordered process", () => {
    for (const craft of CRAFT_KEYS) {
      expect(PROCESS[craft]?.length, `${craft} has no process`).toBeGreaterThan(2);
    }
  });

  test("material is described for the craft, never for the piece", () => {
    for (const craft of CRAFT_KEYS) {
      const m = MATERIALS[craft];
      expect(m, `${craft} has no material story`).toBeTruthy();
      /* "this piece is 100% pashmina" is a claim about an object we have not
         measured; "pashmina is the undercoat of..." is a fact about a fibre */
      const joined = m.body.join(" ").toLowerCase();
      expect(joined).not.toMatch(/this (piece|shawl|suit) is (made of|100%)/);
    }
  });
});

test.describe("the place diagram", () => {
  test("projection preserves real geography", () => {
    const at = (id: string) => {
      const p = PLACES.find((x) => x.id === id)!;
      return project(p, 640, 470);
    };
    /* Kashmir is north of Chandigarh; Mithila is south-east of it. If the
       projection ever flips, this catches it. */
    expect(at("kashmir").y).toBeLessThan(at("chandigarh").y);
    expect(at("chandigarh").y).toBeLessThan(at("mithila").y);
    expect(at("chandigarh").x).toBeLessThan(at("mithila").x);
    expect(at("kashmir").x).toBeLessThan(at("chandigarh").x);
  });

  test("exactly one place is the shop, and nothing is made there", () => {
    const shops = PLACES.filter((p) => p.kind === "shop");
    expect(shops).toHaveLength(1);
    expect(shops[0].crafts).toEqual([]);
  });

  test("every craft with a named origin is on the diagram", () => {
    const placed = new Set(PLACES.flatMap((p) => p.crafts));
    for (const craft of CRAFT_KEYS) {
      /* A craft whose catalogue region is just "India" has no named origin to
         place. The printed piece is the only one, and the page says so rather
         than putting a pin somewhere plausible. */
      const named = CRAFTS[craft].region !== "India";
      expect(placed.has(craft), `${craft} (${CRAFTS[craft].region})`).toBe(named);
    }
  });

  test("a craft left off the diagram is explained, not silently dropped", async ({ page }) => {
    await page.goto("/craft");
    await page.waitForTimeout(2000);
    const unplaced = (Object.keys(CRAFTS) as Craft[]).filter(
      (c) => !new Set(PLACES.flatMap((p) => p.crafts)).has(c),
    );
    if (unplaced.length === 0) return;
    await expect(page.locator("body")).toContainText("is not on the diagram");
  });

  test("it renders as a diagram, not as a map with a border", async ({ page }) => {
    await page.goto("/craft");
    await page.waitForTimeout(2200);

    const svg = page.locator('svg[aria-label*="Where each craft comes from"]');
    await expect(svg).toHaveCount(1);

    const shape = await svg.evaluate((el) => ({
      paths: el.querySelectorAll("path").length,
      circles: el.querySelectorAll("circle").length,
      /* a traced coastline would be one enormous path command list */
      longest: Math.max(
        0,
        ...[...el.querySelectorAll("path")].map((p) => (p.getAttribute("d") ?? "").length),
      ),
    }));

    expect(shape.paths, "one thread per origin, and nothing else").toBe(2);
    expect(shape.longest, "a path this long is an outline, not a thread").toBeLessThan(120);
    expect(shape.circles).toBeGreaterThanOrEqual(4);
  });

  test("the threads draw for a reader who lands past them", async ({ page }) => {
    await page.goto("/craft");
    /* jump straight down — no intermediate frames for an observer to sample */
    await page.evaluate(() => {
      const l = (window as unknown as { lenis?: { scrollTo: (n: number, o?: unknown) => void } }).lenis;
      if (l) l.scrollTo(900, { immediate: true });
      else window.scrollTo(0, 900);
    });
    await page.waitForTimeout(2400);

    const drawn = await page
      .locator('svg[aria-label*="Where each craft comes from"] path')
      .first()
      .evaluate((p) => {
        const dash = getComputedStyle(p).strokeDasharray;
        if (!dash || dash === "none") return 1;
        /* motion animates pathLength by setting the pathLength ATTRIBUTE to 1
           and writing the dasharray in those normalised units — so this must
           be measured against the attribute, not against getTotalLength(). */
        const norm = parseFloat(p.getAttribute("pathLength") ?? "0") || 1;
        const first = parseFloat(dash.split(",")[0]);
        return Number.isFinite(first) ? first / norm : 1;
      });
    expect(drawn, "the threads never drew").toBeGreaterThan(0.85);
  });

  test("the places are real controls, not hover-only circles", async ({ page }) => {
    await page.goto("/craft");
    await page.waitForTimeout(2000);

    /* a 9px circle is a poor target on a trackpad and an impossible one on a
       phone, so the diagram must not be the only way in */
    const kashmir = page.getByRole("button", { name: /Kashmir/ }).first();
    await expect(kashmir).toBeVisible();
    await expect(kashmir).toHaveAttribute("aria-pressed", "false");

    await kashmir.click();
    await page.waitForTimeout(400);
    await expect(kashmir).toHaveAttribute("aria-pressed", "true");

    /* selecting a place surfaces its techniques as real links */
    const links = page.locator('a[href^="/craft/"]');
    expect(await links.count()).toBeGreaterThan(0);
  });
});

test.describe("on a technique page", () => {
  test("material and timeline both render, with their caveats", async ({ page }) => {
    await page.goto("/craft/jamawar-kani");
    await page.waitForTimeout(1600);

    await expect(page.getByRole("heading", { name: "The material" })).toHaveCount(1);
    await expect(page.getByRole("heading", { name: "How it is made" })).toHaveCount(1);

    const body = await page.locator("body").innerText();
    /* the two sentences that keep the claims honest */
    expect(body).toContain("That describes the technique");
    expect(body).toContain("No timings here");
  });

  test("no technique page states a making duration", async ({ page }) => {
    const DURATION = /\b\d+\s*(?:–|-|to\s)?\s*\d*\s*(hour|day|week|month|year)s?\b/i;
    for (const craft of CRAFT_KEYS) {
      await page.goto(`/craft/${craft}`);
      await page.waitForTimeout(900);
      const timeline = page.locator("section", { has: page.getByRole("heading", { name: "How it is made" }) });
      const text = await timeline.first().innerText();
      const m = text.match(DURATION);
      expect(m?.[0] ?? null, `${craft} timeline claims "${m?.[0]}"`).toBeNull();
    }
  });
});
