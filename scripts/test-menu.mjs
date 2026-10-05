// Navigation menu tests in real browser engines: WebKit (what Safari on iPhone uses) and Chromium.
// Run after `npm run build`. Needs Playwright browsers: `npx playwright install chromium webkit`.
//
// Why these checks exist: on iPhone Safari the mobile menu once showed a single row (a backdrop-filter on the header
// trapped the fixed menu), and a scroll lock on <html> once broke the sticky header. Chrome showed neither bug, so
// the mobile checks run in WebKit. Taps go to real screen coordinates (Playwright's element taps scroll the page
// first, which hides scroll bugs), and the logo is judged from screenshot pixels (DOM hit-testing reported the
// header as visible when it wasn't on screen). Waits are condition-based, not fixed delays, so slow CI runners
// don't cause false failures.
import { chromium, webkit, devices } from 'playwright';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { serveDist } from './lib/serve-dist.mjs';

const dist = fileURLToPath(new URL('../dist/', import.meta.url));
if (!existsSync(dist)) { console.error('dist/ not found, so run `npm run build` first.'); process.exit(1); }
// Sub-folder the site was built for ("" at a domain root). Must match the SITE_BASE used for `npm run build`.
const BASE = (process.env.SITE_BASE || '').replace(/\/$/, '');
const server = await serveDist(dist, BASE);
const url = (path) => server.origin + BASE + path;

// Sections run in parallel (each in its own browser) and buffer their output, printed in order at the end.
const newReport = (title) => {
  const lines = [`\n${title}`];
  const report = { lines, failures: 0, started: Date.now() };
  report.check = (name, ok, detail = '') => {
    if (!ok) report.failures++;
    lines.push(`  ${ok ? '✓' : '✗'} ${name}${!ok && detail ? ` (${detail})` : ''}`);
  };
  report.note = (text) => lines.push(`  · ${text}`);
  return report;
};

const TIMEOUT = 5000;
// Wait for finite running CSS animations (e.g. the menu's slide-in) to finish, then two frames for layout to settle.
// Bounded at 2s and skipping infinite/paused animations, so it can never hang.
const settle = (page) =>
  page.evaluate(async () => {
    const finite = document.getAnimations().filter((a) => a.playState === 'running' && a.effect?.getComputedTiming().iterations !== Infinity);
    await Promise.race([Promise.all(finite.map((a) => a.finished.catch(() => {}))), new Promise((r) => setTimeout(r, 2000))]);
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  });
const menuState = (page, open) =>
  page
    .waitForFunction((want) => document.querySelector('[data-mobile-menu]').hidden === !want, open, { timeout: TIMEOUT })
    .then(() => true, () => false);

const tapAt = async (page, selector) => {
  const box = await page.evaluate((sel) => {
    const r = document.querySelector(sel).getBoundingClientRect();
    return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
  }, selector);
  await page.touchscreen.tap(box.x, box.y);
};
const scrollPageTo = async (page, y) => {
  await page.evaluate((top) => window.scrollTo({ top, behavior: 'instant' }), y);
  await settle(page);
};

// Compares two PNG screenshots of the same region inside the page: the share of pixels that differ noticeably,
// and how many "ink" pixels (the dark-green eagle logo) the first one has.
const comparePngs = (page, a, b) =>
  page.evaluate(async ([aB64, bB64]) => {
    const pixels = async (b64) => {
      const img = new Image();
      img.src = `data:image/png;base64,${b64}`;
      await img.decode();
      const c = document.createElement('canvas');
      c.width = img.width; c.height = img.height;
      const ctx = c.getContext('2d');
      ctx.drawImage(img, 0, 0);
      return ctx.getImageData(0, 0, c.width, c.height).data;
    };
    const [p, q] = await Promise.all([pixels(aB64), pixels(bB64)]);
    let differ = 0, ink = 0;
    for (let i = 0; i < p.length; i += 4) {
      if (Math.abs(p[i] - q[i]) + Math.abs(p[i + 1] - q[i + 1]) + Math.abs(p[i + 2] - q[i + 2]) > 60) differ++;
      if (p[i] < 90 && p[i + 1] < 130 && p[i + 2] < 100) ink++;
    }
    return { differRatio: differ / (p.length / 4), ink };
  }, [a.toString('base64'), b.toString('base64')]);

// ---- Mobile menu ----
const mobileDevices = [
  ['iPhone 15', webkit],
  ['iPhone SE', webkit],
  ['Pixel 7', chromium],
];
async function testMobile([deviceName, engine]) {
  const report = newReport(`Mobile menu: ${deviceName} (${engine === webkit ? 'WebKit' : 'Chromium'})`);
  const { check } = report;
  const browser = await engine.launch();
  const page = await (await browser.newContext({ ...devices[deviceName] })).newPage();

  for (const path of ['/', '/about-our-pta']) {
    await page.goto(url(path));
    await scrollPageTo(page, 300);
    const y0 = await page.evaluate(() => scrollY);

    const fit = await page.evaluate(() => { const t = document.querySelector('[data-menu-toggle]').getBoundingClientRect(); return { docWidth: document.documentElement.scrollWidth, vw: innerWidth, toggleRight: Math.round(t.right) }; });
    check(`${path}: header fits the screen (menu button fully visible, no sideways scroll)`, fit.toggleRight <= fit.vw && fit.docWidth <= fit.vw, `menu button right edge ${fit.toggleRight}, page width ${fit.docWidth}, screen ${fit.vw}`);

    // The eagle logo's on-screen box, screenshotted with the menu closed and again with it open.
    const logoBox = await page.evaluate(() => { const r = document.querySelector('.brand-eagle').getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height }; });
    const logoClosed = await page.screenshot({ clip: logoBox });

    await tapAt(page, '[data-menu-toggle]');
    const opened = await menuState(page, true);
    check(`${path}: menu opens`, opened);
    if (!opened) { report.note(`${path}: skipped the open-menu checks because the menu didn't open`); continue; }
    await settle(page);

    const open = await page.evaluate(() => {
      const menu = document.querySelector('[data-mobile-menu]');
      const m = menu.getBoundingClientRect();
      const h = document.querySelector('[data-header]').getBoundingClientRect();
      const links = [...menu.querySelectorAll('a')];
      const fullyVisible = links.filter((a) => { const r = a.getBoundingClientRect(); return r.height > 0 && r.top >= m.top - 1 && r.bottom <= Math.min(m.bottom, innerHeight) + 1; }).length;
      return { headerTop: Math.round(h.top), headerBottom: Math.round(h.bottom), menuTop: Math.round(m.top), menuBottom: Math.round(m.bottom), vh: innerHeight, links: links.length, fullyVisible, scrollY };
    });
    check(`${path}: header stays pinned at the top while open`, open.headerTop === 0, `header top ${open.headerTop}`);
    check(`${path}: menu starts right under the header`, Math.abs(open.menuTop - open.headerBottom) <= 2, `menu top ${open.menuTop}, header bottom ${open.headerBottom}`);
    check(`${path}: menu reaches the bottom of the screen`, open.menuBottom >= open.vh - 2, `menu bottom ${open.menuBottom} of ${open.vh}`);
    check(`${path}: several menu links visible at once (not one row)`, open.fullyVisible >= Math.min(5, open.links), `${open.fullyVisible} of ${open.links}`);
    check(`${path}: opening the menu doesn't move the page`, open.scrollY === y0, `scrollY ${y0} → ${open.scrollY}`);

    const logo = await comparePngs(page, logoClosed, await page.screenshot({ clip: logoBox }));
    check(`${path}: eagle logo still on screen while the menu is open`, logo.ink > 50 && logo.differRatio < 0.05, `${Math.round(logo.differRatio * 100)}% of logo pixels changed, ${logo.ink} logo ink pixels`);

    const end = await page.evaluate(() => {
      const menu = document.querySelector('[data-mobile-menu]');
      menu.scrollTop = menu.scrollHeight;
      const m = menu.getBoundingClientRect();
      const last = [...menu.querySelectorAll('a')].at(-1).getBoundingClientRect();
      return { lastVisible: last.top >= m.top - 1 && last.bottom <= Math.min(m.bottom, innerHeight) + 1 };
    });
    check(`${path}: last menu link reachable by scrolling the menu`, end.lastVisible);

    await tapAt(page, '[data-menu-toggle]');
    const closedOk = await menuState(page, false);
    await settle(page);
    const closed = await page.evaluate(() => ({ locked: document.body.classList.contains('menu-open'), scrollY }));
    check(`${path}: close button closes the menu and unlocks scrolling`, closedOk && !closed.locked);
    check(`${path}: page position kept after closing`, closed.scrollY === y0, `scrollY ${y0} → ${closed.scrollY}`);
    await scrollPageTo(page, 900);
    check(`${path}: header still sticky after closing`, (await page.evaluate(() => Math.round(document.querySelector('[data-header]').getBoundingClientRect().top))) === 0);
  }

  // Tapping a link to another page navigates.
  await page.goto(url('/'));
  await tapAt(page, '[data-menu-toggle]');
  await menuState(page, true);
  await page.evaluate(() => document.querySelector('[data-mobile-menu] a[href$="/corporate-matching"]').scrollIntoView({ block: 'center' }));
  await settle(page);
  await Promise.all([page.waitForURL('**/corporate-matching', { timeout: TIMEOUT }).catch(() => {}), tapAt(page, '[data-mobile-menu] a[href$="/corporate-matching"]')]);
  check('tapping a menu link opens that page', new URL(page.url()).pathname.endsWith('/corporate-matching'), page.url());

  // A same-page link (PTA Calendar → /#calendar on the home page) closes the menu and shows the section.
  await page.goto(url('/'));
  await tapAt(page, '[data-menu-toggle]');
  await menuState(page, true);
  await page.evaluate(() => document.querySelector('[data-mobile-menu] a[href$="#calendar"]').scrollIntoView({ block: 'center' }));
  await settle(page);
  await tapAt(page, '[data-mobile-menu] a[href$="#calendar"]');
  const samePageClosed = await menuState(page, false);
  await page.waitForFunction(() => location.hash === '#calendar', null, { timeout: TIMEOUT }).catch(() => {});
  await page.waitForFunction(() => Math.abs(document.getElementById('calendar').getBoundingClientRect().top) < innerHeight / 2, null, { timeout: TIMEOUT }).catch(() => {});
  const cal = await page.evaluate(() => ({ locked: document.body.classList.contains('menu-open'), hash: location.hash, calTop: Math.round(document.getElementById('calendar').getBoundingClientRect().top), vh: innerHeight }));
  check('same-page link (PTA Calendar) closes the menu and unlocks scrolling', samePageClosed && !cal.locked);
  check('same-page link scrolls to the calendar', cal.hash === '#calendar' && Math.abs(cal.calTop) < cal.vh / 2, `hash ${cal.hash}, calendar top ${cal.calTop}`);

  // Escape closes the menu (keyboard and screen-reader users).
  await tapAt(page, '[data-menu-toggle]');
  await menuState(page, true);
  await page.keyboard.press('Escape');
  check('Escape closes the menu', await menuState(page, false));

  await browser.close();
  return report;
}

// ---- Every page fits a 320px phone (original iPhone SE) ----
async function testAllPagesFit() {
  const report = newReport('No sideways scrolling: every page at 320px (WebKit, iPhone SE)');
  const { check } = report;
  const browser = await webkit.launch();
  const page = await (await browser.newContext({ ...devices['iPhone SE'] })).newPage();
  const pages = readdirSync(dist, { recursive: true })
    .map(String)
    .filter((f) => f.endsWith('.html') && !/http-equiv="refresh"/.test(readFileSync(join(dist, f), 'utf8')));
  const wide = [];
  for (const f of pages) {
    const path = f === 'index.html' ? '/' : '/' + f.replace(/\.html$/, '').replace(/\/index$/, '/');
    await page.goto(url(path));
    const r = await page.evaluate(() => {
      const W = document.documentElement.clientWidth;
      const bad = [...document.querySelectorAll('body *')].filter((e) => { const b = e.getBoundingClientRect(); return b.width > 0 && b.right > W + 1 && getComputedStyle(e).position !== 'fixed'; });
      const inner = bad.filter((e) => !bad.some((o) => o !== e && e.contains(o)))[0];
      return { width: document.documentElement.scrollWidth, W, culprit: inner ? `${inner.tagName.toLowerCase()} "${(inner.textContent || '').trim().slice(0, 30)}"` : '' };
    });
    if (r.width > r.W) wide.push(`${path} is ${r.width}px wide (${r.culprit})`);
  }
  check(`all ${pages.length} pages fit a 320px screen`, wide.length === 0, wide.join('; '));
  await browser.close();
  return report;
}

// ---- Desktop dropdowns ----
async function testDesktop() {
  const report = newReport('Desktop menu: 1280px (Chromium)');
  const { check } = report;
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto(url('/'));
  const dropdownOpen = (i, want) =>
    page
      .waitForFunction(([idx, w]) => document.querySelectorAll('[data-dropdown]')[idx].open === w, [i, want], { timeout: TIMEOUT })
      .then(() => true, () => false);
  const triggers = page.locator('[data-dropdown] > summary');
  await triggers.nth(0).click();
  check('clicking a menu group opens its dropdown', await dropdownOpen(0, true));
  await triggers.nth(1).click();
  await dropdownOpen(1, true);
  check('only one dropdown open at a time', await page.evaluate(() => [...document.querySelectorAll('[data-dropdown]')].filter((d) => d.open).length === 1));
  await page.keyboard.press('Escape');
  check('Escape closes the dropdown', await page.waitForFunction(() => [...document.querySelectorAll('[data-dropdown]')].every((d) => !d.open), null, { timeout: TIMEOUT }).then(() => true, () => false));
  await triggers.nth(0).hover();
  await dropdownOpen(0, true);
  await triggers.nth(0).click();
  await settle(page);
  check('a click after hovering keeps the dropdown open', await page.evaluate(() => document.querySelectorAll('[data-dropdown]')[0].open));

  // Every menu link (desktop + mobile) leads to a real page.
  const hrefs = await page.evaluate(() => [...new Set([...document.querySelectorAll('[data-header] a[href]')].map((a) => a.getAttribute('href').split('#')[0]))]);
  const broken = [];
  for (const href of hrefs) {
    const res = await fetch(server.origin + href);
    const html = await res.text();
    if (res.status !== 200 || !/<h1/.test(html)) broken.push(`${href} (${res.status})`);
  }
  check(`all ${hrefs.length} menu links open a real page`, broken.length === 0, broken.join(', '));
  await browser.close();
  return report;
}

// ---- Run every section in parallel, then print the results in a stable order ----
const started = Date.now();
const reports = await Promise.all([...mobileDevices.map(testMobile), testAllPagesFit(), testDesktop()]);
server.close();
let failures = 0;
for (const r of reports) {
  console.log(r.lines.join('\n'));
  failures += r.failures;
}
const secs = ((Date.now() - started) / 1000).toFixed(1);
console.log(failures ? `\n${failures} menu check(s) failed (${secs}s).` : `\nAll menu checks passed (${secs}s).`);
process.exit(failures ? 1 : 0);
