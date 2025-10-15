// Simple Playwright snapshot runner for Expo Web
// Prereq: Expo dev server running on http://localhost:8083

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function ensureDir(dir) {
  await fs.promises.mkdir(dir, { recursive: true });
}

async function waitForApp(page) {
  // Wait for the React Native Web root to render something meaningful
  await page.waitForLoadState('domcontentloaded');
  // Heuristic: wait for any bottom tab label to appear
  await page.waitForSelector('text=Tournaments', { timeout: 30000 });
}

async function clickTab(page, tabText) {
  // Click by visible text; fall back to role-based search
  const btn = page.getByText(tabText, { exact: true }).first();
  if (await btn.count()) {
    await btn.click();
    return;
  }
  // Fallback tries
  const btn2 = page.getByRole('button', { name: tabText }).first();
  if (await btn2.count()) {
    await btn2.click();
  }
}

async function main() {
  const baseUrl = process.env.EXPO_WEB_URL || 'http://localhost:8083';
  const outDir = path.resolve(__dirname, '..', 'screenshots');
  await ensureDir(outDir);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();

  await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });
  await waitForApp(page);

  // Home
  await page.screenshot({ path: path.join(outDir, 'home.png'), fullPage: true });

  // Tournaments tab
  await clickTab(page, 'Tournaments');
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(outDir, 'tournaments.png'), fullPage: true });

  // AOY tab
  await clickTab(page, 'AOY');
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(outDir, 'aoy.png'), fullPage: true });

  // Profile tab
  await clickTab(page, 'Profile');
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(outDir, 'profile.png'), fullPage: true });

  await browser.close();
  console.log('Snapshots saved to', outDir);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
