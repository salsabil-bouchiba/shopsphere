/**
 * README screenshots via Playwright.
 * Prerequisites: backend + frontend running (http://localhost:5173)
 * Usage: npm run screenshots (from frontend/)
 */
import { chromium } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE_URL = process.env.SCREENSHOT_BASE_URL || "http://localhost:5173";
const OUT_DIR = path.resolve(__dirname, "../../docs/screenshots");

async function waitForApp(page) {
  const res = await page.goto(BASE_URL, { waitUntil: "domcontentloaded", timeout: 30000 });
  if (!res || !res.ok()) {
    throw new Error(
      `Cannot reach ${BASE_URL} (status: ${res?.status() ?? "none"}).\n` +
        "Start the frontend first: cd frontend && npm run dev"
    );
  }
}

async function forceLightMode(context) {
  await context.addInitScript(() => {
    localStorage.setItem("ss_theme", "light");
  });
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 1,
  });
  await forceLightMode(context);

  const page = await context.newPage();
  const generated = [];

  try {
    await waitForApp(page);

    await page.goto(`${BASE_URL}/`, { waitUntil: "networkidle" });
    await page.waitForSelector(".hero-carousel .hero-content h1", { state: "visible", timeout: 20000 });
    await page.waitForTimeout(800);
    const homePath = path.join(OUT_DIR, "home.png");
    await page.screenshot({ path: homePath, fullPage: false });
    generated.push(homePath);

    await page.goto(`${BASE_URL}/products`, { waitUntil: "networkidle" });
    await page.waitForSelector(".product-card", { state: "visible", timeout: 20000 });
    await page.waitForTimeout(500);
    const cataloguePath = path.join(OUT_DIR, "catalogue.png");
    await page.screenshot({ path: cataloguePath, fullPage: false });
    generated.push(cataloguePath);

    const firstCardLink = page.locator(".product-card a").first();
    await firstCardLink.waitFor({ state: "visible", timeout: 15000 });
    await Promise.all([
      page.waitForURL(/\/products\/[^/]+$/, { timeout: 20000 }),
      firstCardLink.click(),
    ]);
    await page.waitForSelector(".gallery-main img, .detail-layout h1", {
      state: "visible",
      timeout: 20000,
    });
    await page.waitForTimeout(600);
    const productPath = path.join(OUT_DIR, "product.png");
    await page.screenshot({ path: productPath, fullPage: false });
    generated.push(productPath);

    console.log("\nScreenshots saved:\n");
    for (const file of generated) {
      console.log(`  - ${file}`);
    }
    console.log("");
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error("\nScreenshot failed:\n", err.message || err);
  process.exit(1);
});
