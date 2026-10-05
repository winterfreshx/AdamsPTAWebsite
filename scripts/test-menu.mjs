// Navigation menu tests in real browser engines: WebKit (what Safari on iPhone uses) and Chromium.
// Run after `npm run build`. Needs Playwright browsers: `npx playwright install chromium webkit`.
//
// Why these checks exist: on iPhone Safari the mobile menu once showed a single row (a backdrop-filter on the header
// trapped the fixed menu), and a scroll lock on <html> once broke the sticky header. Chrome showed neither bug, so
// the mobile checks run in WebKit. Taps go to real screen coordinates and header visibility is judged from
// screenshot pixels, because Playwright's element taps scroll the page and DOM hit-testing reported the header as
// visible when it wasn't on screen.
import { chromium, webkit, devices } from 'playwright';
import { createServer } from 'node:http';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const dist = fileURLToPath(new URL('../dist/', import.meta.url));
if (!existsSync(dist)) { console.error('dist/ not found, so run `npm run build` first.'); process.exit(1); }
// Sub-folder the site was built for ("" at a domain root). Must match the SITE_BASE used for `npm run build`.
const BASE = (process.env.SITE_BASE || '').replace(/\/$/, '');

// ---- Static server that mimics GitHub Pages ----
const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.xml': 'application/xml' };
const server = createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (BASE) {
    if (p !== BASE && !p.startsWith(BASE + '/')) { res.writeHead(404); return res.end(); }
    p = p.slice(BASE.length) || '/';
  }
  if (p.endsWith('/')) p += 'index.html';
  let file = join(dist, p);
  if (!existsSync(file) && existsSync(file + '.html')) file += '.html';
  if (!existsSync(file) || statSync(file).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'content-type': types[extname(file)] ?? 'application/octet-stream' });
  res.end(readFileSync(file));
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const origin = `http://127.0.0.1:${server.address().port}`;
const url = (path) => origin + BASE + path;

let failures = 0;
const check = (name, ok, detail = '') => {
  if (!ok) failures++;
  console.log(`  ${ok ? '✓' : '✗'} ${name}${!ok && detail ? ` (${detail})` : ''}`);
};

// Count "ink" pixels (the dark-green logo/wordmark) in a screenshot of the header, decoded inside the page.
const inkPixels = (page, png) =>
  page.evaluate(async (b64) => {
    const img = new Image();
    img.src = `data:image/png;base64,${b64}`;
    await img.decode();
    const c = document.createElement('canvas');
    c.width = img.width; c.height = img.height;
    const ctx = c.getContext('2d');
    ctx.drawImage(img, 0, 0);
    const d = ctx.getImageData(0, 0, c.width, c.height).data;
    let n = 0;
    for (let i = 0; i < d.length; i += 4) if (d[i] < 90 && d[i + 1] < 130 && d[i + 2] < 100) n++;
    return n;
  }, png.toString('base64'));

const tapAt = async (page, selector) => {
  const box = await page.evaluate((sel) => {
    const r = document.querySelector(sel).getBoundingClientRect();
    return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
  }, selector);
  await page.touchscreen.tap(box.x, box.y);
  await page.waitForTimeout(350);
};

// ---- Mobile menu ----
const mobileDevices = [
  ['iPhone 15', webkit],
  ['iPhone SE', webkit],
  ['Pixel 7', chromium],
];
for (const [deviceName, engine] of mobileDevices) {
  const engineName = engine === webkit ? 'WebKit' : 'Chromium';
  console.log(`\nMobile menu: ${deviceName} (${engineName})`);
  const browser = await engine.launch();
  const context = await browser.newContext({ ...devices[deviceName] });
  const page = await context.newPage();

  for (const path of ['/', '/about-our-pta']) {
    await page.goto(url(path));
    await page.evaluate(() => window.scrollTo({ top: 300, behavior: 'instant' }));
    await page.waitForTimeout(250);
    const headerBox = await page.evaluate(() => { const r = document.querySelector('[data-header]').getBoundingClientRect(); return { x: 0, y: Math.max(0, r.top), width: innerWidth, height: r.height }; });
    const inkClosed = await inkPixels(page, await page.screenshot({ clip: headerBox }));
    const y0 = await page.evaluate(() => scrollY);
    const fit = await page.evaluate(() => { const t = document.querySelector('[data-menu-toggle]').getBoundingClientRect(); return { docWidth: document.documentElement.scrollWidth, vw: innerWidth, toggleRight: Math.round(t.right) }; });
    check(`${path}: header fits the screen (menu button fully visible, no sideways scroll)`, fit.toggleRight <= fit.vw && fit.docWidth <= fit.vw, `menu button right edge ${fit.toggleRight}, page width ${fit.docWidth}, screen ${fit.vw}`);

    await tapAt(page, '[data-menu-toggle]');
    const open = await page.evaluate(() => {
      const menu = document.querySelector('[data-mobile-menu]');
      const m = menu.getBoundingClientRect();
      const h = document.querySelector('[data-header]').getBoundingClientRect();
      const links = [...menu.querySelectorAll('a')];
      const fullyVisible = links.filter((a) => { const r = a.getBoundingClientRect(); return r.top >= m.top - 1 && r.bottom <= Math.min(m.bottom, innerHeight) + 1; }).length;
      return {
        isOpen: !menu.hidden && document.querySelector('[data-menu-toggle]').getAttribute('aria-expanded') === 'true',
        headerTop: Math.round(h.top), headerBottom: Math.round(h.bottom), menuTop: Math.round(m.top), menuBottom: Math.round(m.bottom),
        vh: innerHeight, links: links.length, fullyVisible, scrollY,
      };
    });
    check(`${path}: menu opens`, open.isOpen);
    if (!open.isOpen) { failures++; console.log(`  ✗ ${path}: skipped the open-menu checks because the menu didn't open`); continue; }
    check(`${path}: header stays pinned at the top while open`, open.headerTop === 0, `header top ${open.headerTop}`);
    check(`${path}: menu starts right under the header`, Math.abs(open.menuTop - open.headerBottom) <= 2, `menu top ${open.menuTop}, header bottom ${open.headerBottom}`);
    check(`${path}: menu reaches the bottom of the screen`, open.menuBottom >= open.vh - 2, `menu bottom ${open.menuBottom} of ${open.vh}`);
    check(`${path}: several menu links visible at once (not one row)`, open.fullyVisible >= Math.min(5, open.links), `${open.fullyVisible} of ${open.links}`);
    check(`${path}: opening the menu doesn't move the page`, open.scrollY === y0, `scrollY ${y0} → ${open.scrollY}`);

    const inkOpen = await inkPixels(page, await page.screenshot({ clip: headerBox }));
    check(`${path}: header logo/wordmark visible on screen while open`, inkOpen > 200 && inkOpen > inkClosed * 0.6, `ink pixels closed ${inkClosed}, open ${inkOpen}`);

    const end = await page.evaluate(() => {
      const menu = document.querySelector('[data-mobile-menu]');
      menu.scrollTop = menu.scrollHeight;
      const m = menu.getBoundingClientRect();
      const last = [...menu.querySelectorAll('a')].at(-1).getBoundingClientRect();
      return { scrollable: menu.scrollHeight > menu.clientHeight, lastVisible: last.top >= m.top - 1 && last.bottom <= Math.min(m.bottom, innerHeight) + 1 };
    });
    check(`${path}: last menu link reachable by scrolling the menu`, end.lastVisible);

    await tapAt(page, '[data-menu-toggle]');
    const closed = await page.evaluate(() => ({ hidden: document.querySelector('[data-mobile-menu]').hidden, locked: document.body.classList.contains('menu-open'), headerTop: Math.round(document.querySelector('[data-header]').getBoundingClientRect().top), scrollY }));
    check(`${path}: close button closes the menu and unlocks scrolling`, closed.hidden && !closed.locked);
    check(`${path}: page position kept after closing`, closed.scrollY === y0, `scrollY ${y0} → ${closed.scrollY}`);
    await page.evaluate(() => window.scrollTo({ top: 900, behavior: 'instant' }));
    await page.waitForTimeout(200);
    check(`${path}: header still sticky after closing`, (await page.evaluate(() => Math.round(document.querySelector('[data-header]').getBoundingClientRect().top))) === 0);
  }

  // Tapping a menu link navigates.
  await page.goto(url('/'));
  await tapAt(page, '[data-menu-toggle]');
  await page.evaluate(() => [...document.querySelectorAll('[data-mobile-menu] a')].find((a) => a.textContent.includes('Corporate Matching')).scrollIntoView({ block: 'center' }));
  await page.waitForTimeout(150);
  await Promise.all([page.waitForURL('**/corporate-matching', { timeout: 5000 }).catch(() => {}), tapAt(page, '[data-mobile-menu] a[href$="/corporate-matching"]')]);
  check('tapping a menu link opens that page', new URL(page.url()).pathname.endsWith('/corporate-matching'), page.url());

  // Escape closes the menu (keyboard and screen-reader users).
  await tapAt(page, '[data-menu-toggle]');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(200);
  check('Escape closes the menu', await page.evaluate(() => document.querySelector('[data-mobile-menu]').hidden));

  await browser.close();
}

// ---- Every page fits a 320px phone (original iPhone SE) ----
console.log('\nNo sideways scrolling: every page at 320px (WebKit, iPhone SE)');
{
  const browser = await webkit.launch();
  const page = await (await browser.newContext({ ...devices['iPhone SE'] })).newPage();
  const pages = readdirSync(dist).filter((f) => f.endsWith('.html') && !/http-equiv="refresh"/.test(readFileSync(join(dist, f), 'utf8')));
  const wide = [];
  for (const f of pages) {
    const path = f === 'index.html' ? '/' : '/' + f.replace(/\.html$/, '');
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
}

// ---- Desktop dropdowns ----
console.log('\nDesktop menu: 1280px (Chromium)');
{
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto(url('/'));
  const triggers = page.locator('[data-dropdown] > summary');
  await triggers.nth(0).click();
  check('clicking a menu group opens its dropdown', await page.evaluate(() => document.querySelectorAll('[data-dropdown]')[0].open));
  await triggers.nth(1).click();
  check('only one dropdown open at a time', await page.evaluate(() => [...document.querySelectorAll('[data-dropdown]')].filter((d) => d.open).length === 1));
  await page.keyboard.press('Escape');
  check('Escape closes the dropdown', await page.evaluate(() => [...document.querySelectorAll('[data-dropdown]')].every((d) => !d.open)));
  await page.locator('[data-dropdown] > summary').nth(0).hover();
  await page.waitForTimeout(100);
  await page.locator('[data-dropdown] > summary').nth(0).click();
  check('a click after hovering keeps the dropdown open', await page.evaluate(() => document.querySelectorAll('[data-dropdown]')[0].open));

  // Every menu link (desktop + mobile) leads to a real page.
  const hrefs = await page.evaluate(() => [...new Set([...document.querySelectorAll('[data-header] a[href]')].map((a) => a.getAttribute('href').split('#')[0]))]);
  let broken = [];
  for (const href of hrefs) {
    const res = await fetch(origin + href);
    const html = await res.text();
    if (res.status !== 200 || !/<h1/.test(html)) broken.push(`${href} (${res.status})`);
  }
  check(`all ${hrefs.length} menu links open a real page`, broken.length === 0, broken.join(', '));
  await browser.close();
}

server.close();
console.log(failures ? `\n${failures} menu check(s) failed.` : '\nAll menu checks passed.');
process.exit(failures ? 1 : 0);
