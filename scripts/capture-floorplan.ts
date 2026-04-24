/**
 * Captures the official Licensing Expo 2026 floor plan from Map Your Show
 * via headless Chromium, saving it to public/floorplan.png.
 *
 * Usage: npx tsx scripts/capture-floorplan.ts [URL]
 */
import { chromium } from 'playwright';
import path from 'path';

const DEFAULT_URL = 'https://licensing26.mapyourshow.com/8_0/floorplan/';
const url = process.argv[2] ?? DEFAULT_URL;

(async () => {
  console.log('Launching Chromium (headless + stealth flags)...');
  const browser = await chromium.launch({
    headless: true,
    args: [
      '--disable-blink-features=AutomationControlled',
      '--disable-features=IsolateOrigins,site-per-process',
    ],
  });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1400 },
    deviceScaleFactor: 2,
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    extraHTTPHeaders: {
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
    },
  });
  const page = await context.newPage();

  // Hide webdriver
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
  });

  console.log('Visiting landing page first...');
  const landing = await page.goto('https://licensing26.mapyourshow.com/8_0/', { waitUntil: 'domcontentloaded', timeout: 60000 });
  console.log('  landing status:', landing?.status());
  await page.waitForTimeout(3000);

  console.log('Navigating to floor plan:', url);
  const fp = await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
  console.log('  floorplan status:', fp?.status());

  // Wait for anything floor-plan-ish: canvas, svg, or #map
  const candidates = [
    'canvas',
    'svg',
    '#map',
    '#mapContainer',
    '.floorplan',
    '.map-container',
    '[id*="floor"]',
    '[class*="floor"]',
  ];

  for (const sel of candidates) {
    const el = await page.$(sel);
    if (el) {
      const box = await el.boundingBox();
      if (box && box.width > 400 && box.height > 400) {
        console.log(`Found floor-plan element: ${sel} (${Math.round(box.width)}x${Math.round(box.height)})`);
        break;
      }
    }
  }

  // Give the page time to finish rendering the canvas
  await page.waitForTimeout(8000);

  // Try to find the largest canvas and screenshot it directly
  const canvas = await page.$('canvas');
  if (!canvas) {
    throw new Error('No canvas found on page');
  }
  const box = await canvas.boundingBox();
  console.log('Canvas bounding box:', box);

  // Zoom the canvas to fit / maximize detail via keyboard shortcut if available
  // Many MYS maps have "+" to zoom in — let's try a couple of presses for clarity
  await canvas.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);

  const outPath = path.resolve(process.cwd(), 'public/floorplan.png');
  await canvas.screenshot({ path: outPath });
  console.log('Saved canvas-only screenshot to:', outPath);

  // Also save a full-page version for reference
  const fullPath = path.resolve(process.cwd(), 'public/floorplan-raw.png');
  await page.screenshot({ path: fullPath, fullPage: false });
  console.log('Saved full-page screenshot to:', fullPath);

  const title = await page.title();
  console.log('Page title:', title);

  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
