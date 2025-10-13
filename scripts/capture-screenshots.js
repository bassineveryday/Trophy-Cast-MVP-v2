const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const BASE = process.env.EXPO_URL || 'http://localhost:8082';
const OUT_DIR = path.resolve(__dirname, '..', 'screenshots');

async function ensureOut() {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
}

async function clickFirstClickable(page) {
  const selectors = ['button', '[role="button"]', 'a', '[tabindex]'];
  for (const sel of selectors) {
    const el = page.locator(sel).first();
    try {
      const count = await el.count();
      if (count && count > 0) {
        await el.click({ timeout: 5000 });
        return true;
      }
    } catch (e) {
      // ignore and try next
    }
  }
  return false;
}

async function capture() {
  await ensureOut();
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 400, height: 800 } });
  const page = await context.newPage();

  console.log('Opening home...');
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.screenshot({ path: path.join(OUT_DIR, 'home.png'), fullPage: true });

  // Tournaments list
  console.log('Opening tournaments list...');
  await page.goto(BASE + '/?path=/tournaments', { waitUntil: 'networkidle' });
  await page.waitForTimeout(800); // let RN web render
  await page.screenshot({ path: path.join(OUT_DIR, 'tournaments-list.png'), fullPage: true });

  // Try to open first tournament by clicking the first clickable element inside the list
  console.log('Attempting to open first tournament item...');
  let opened = false;
  try {
    opened = await clickFirstClickable(page);
    if (opened) {
      // wait for detail-ish UI (look for Overview/Participants/Results tabs)
      try {
        await page.waitForSelector('text=Participants', { timeout: 5000 });
      } catch (e) {
        // ignore
      }
      await page.screenshot({ path: path.join(OUT_DIR, 'tournament-overview.png'), fullPage: true });

      // Participants tab
      try {
        const participants = page.locator('text=Participants');
        if ((await participants.count()) > 0) {
          await participants.first().click();
          await page.waitForTimeout(600);
          await page.screenshot({ path: path.join(OUT_DIR, 'tournament-participants.png'), fullPage: true });
        }
      } catch (e) {
        console.warn('Participants tab click failed:', e.message || e);
      }

      // Results tab
      try {
        const results = page.locator('text=Results');
        if ((await results.count()) > 0) {
          await results.first().click();
          await page.waitForTimeout(600);
          await page.screenshot({ path: path.join(OUT_DIR, 'tournament-results.png'), fullPage: true });
        }
      } catch (e) {
        console.warn('Results tab click failed:', e.message || e);
      }
    } else {
      console.warn('Could not click a tournament item — skipping detail screenshots.');
    }
  } catch (e) {
    console.warn('Error opening tournament detail:', e.message || e);
  }

  // Social
  try {
    console.log('Opening social...');
    await page.goto(BASE + '/?path=/social', { waitUntil: 'networkidle' });
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(OUT_DIR, 'social.png'), fullPage: true });
  } catch (e) {
    console.warn('Social page capture failed:', e.message || e);
  }

  // Club
  try {
    console.log('Opening club...');
    await page.goto(BASE + '/?path=/club', { waitUntil: 'networkidle' });
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(OUT_DIR, 'club.png'), fullPage: true });
  } catch (e) {
    console.warn('Club page capture failed:', e.message || e);
  }

  await browser.close();
  console.log('Screenshots saved to', OUT_DIR);
}

capture().catch(err => {
  console.error('Capture failed:', err);
  process.exit(1);
});
