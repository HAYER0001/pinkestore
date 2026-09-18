import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  timeout: 45_000,
  fullyParallel: true,
  reporter: [["list"]],
  use: {
    baseURL: "http://localhost:3000",
    trace: "off",
  },
  projects: [
    {
      /* iPhone 14 metrics (390x844 @3x, touch) on the Chromium engine.
         The stock Playwright iPhone profiles run WebKit, a separate ~100MB
         download; these guards test geometry, memory and WebGL rather than
         engine quirks, so Chromium at the right metrics is the honest trade.
         deviceScaleFactor 3 matters most — it is what drives the fill-rate
         tiering we are verifying. */
      name: "mobile",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true,
        deviceScaleFactor: 3,
      },
    },
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
