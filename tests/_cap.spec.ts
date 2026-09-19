import { test } from "@playwright/test";
const go = (page: any, y: number) => page.evaluate((t: number) => { const l=(window as any).lenis; l?l.scrollTo(t,{immediate:true}):window.scrollTo(0,t); }, y);
const top = (page: any, id: string) => page.evaluate((i: string) => { const e=document.getElementById(i)!; return e.getBoundingClientRect().top + window.scrollY; }, id);
test("desktop scenes", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  const errs: string[] = []; page.on("pageerror", (e) => errs.push(e.message.slice(0,100)));
  await page.goto("/"); await page.waitForTimeout(9500);
  await page.screenshot({ path: "/tmp/r-hero.png" });
  console.log("H1 " + JSON.stringify(await page.evaluate(() => {
    const h = document.querySelector("h1")!; const cs = getComputedStyle(h);
    const big = [...h.querySelectorAll("span > span > span")].map((s) => Math.round(parseFloat(getComputedStyle(s).fontSize)));
    const img = document.querySelector("#origin img")!.getBoundingClientRect();
    const hr = h.getBoundingClientRect();
    return { blend: cs.mixBlendMode, sizes: big, h1Right: Math.round(hr.right), imgLeft: Math.round(img.left), crosses: hr.right > img.left, overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth };
  })));
  for (const id of ["mithila","kashmir","jamawar","kairi","pieces","craft","finale"]) {
    const y = await top(page, id); await go(page, y + (id==="jamawar"||id==="craft"||id==="finale" ? 260 : 120)); await page.waitForTimeout(2400);
    await page.screenshot({ path: `/tmp/r-${id}.png` });
    console.log(`${id.toUpperCase()} ` + JSON.stringify(await page.evaluate((i) => {
      const s = document.getElementById(i)!; const cs = getComputedStyle(s);
      const h2 = s.querySelector("h2"); const line = h2?.querySelector("span > span > span") ?? h2;
      const ink = getComputedStyle(document.documentElement).getPropertyValue("--chrome-ink").trim();
      const masks = [...s.querySelectorAll("div[aria-hidden]")].filter((e) => { const r=e.getBoundingClientRect(); return r.top < innerHeight*0.9 && new DOMMatrixReadOnly(getComputedStyle(e).transform).d > 0.08; }).length;
      return { bg: cs.backgroundColor, chrome: s.dataset.chrome, ink, h2px: line ? Math.round(parseFloat(getComputedStyle(line).fontSize)) : null, stuckMasks: masks };
    }, id)));
  }
  console.log("ERRS " + JSON.stringify(errs.slice(0,3)));
});
test("mobile scenes", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/"); await page.waitForTimeout(9000);
  await page.screenshot({ path: "/tmp/rm-hero.png" });
  for (const id of ["mithila","kairi","pieces","finale"]) {
    const y = await top(page, id); await go(page, y + 80); await page.waitForTimeout(2200);
    await page.screenshot({ path: `/tmp/rm-${id}.png` });
  }
  console.log("MOBILE " + JSON.stringify(await page.evaluate(() => ({
    overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    h1: Math.max(...[...document.querySelectorAll("h1 span > span > span")].map((s) => parseFloat(getComputedStyle(s).fontSize))),
  }))));
});
