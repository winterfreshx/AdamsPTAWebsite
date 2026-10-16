// Screenshot one page of the built site in headless Chromium, optionally as if it were another day.
// Run after `npm run build`. Needs Playwright's Chromium: `npx playwright install chromium`.
//
//   npm run screenshot -- <path> [--width 375] [--date 2026-10-23] [--selector .happening] [--full] [--out file.png]
//
// --date fixes the browser clock so scheduled content (src/data/schedule.ts) renders for that day. A date alone means
// noon Seattle time; 2026-10-23T07:30 is a Seattle wall time; a value with Z or an offset is used as given.
// --selector captures just that element, --full the whole page; otherwise the first screenful.
// The default output is screenshots/<path>-<width>[-<date>].png. SITE_BASE must match the one used for the build.
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { serveDist } from './lib/serve-dist.mjs';
import { BASE, dist, requireDist } from './lib/site.mjs';

const usage = 'Usage: npm run screenshot -- <path> [--width 375] [--date 2026-10-23] [--selector .css] [--full] [--out file.png]';
const fail = (msg) => { console.error(msg); process.exit(1); };

const args = process.argv.slice(2);
const opts = { width: 375, full: false };
let path;
for (let i = 0; i < args.length; i++) {
  const a = args[i];
  const value = () => args[++i] ?? fail(`${a} needs a value.\n${usage}`);
  if (a === '--width') opts.width = Number(value());
  else if (a === '--date') opts.date = value();
  else if (a === '--selector') opts.selector = value();
  else if (a === '--out') opts.out = value();
  else if (a === '--full') opts.full = true;
  else if (a === '--help' || a === '-h') { console.log(usage); process.exit(0); }
  else if (a.startsWith('--') || path) fail(`Unexpected argument: ${a}\n${usage}`);
  else path = a;
}
if (!path) fail(usage);
if (!path.startsWith('/')) path = '/' + path;
if (!(opts.width > 0)) fail('--width must be a positive number.');

/** The UTC instant at which the Seattle wall clock reads y-mo-d h:mi. */
function seattleInstant(y, mo, d, h, mi) {
  const guess = Date.UTC(y, mo - 1, d, h, mi);
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Los_Angeles', hourCycle: 'h23',
    year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric',
  }).formatToParts(new Date(guess)).map((p) => [p.type, Number(p.value)]));
  const offset = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute) - guess;
  return new Date(guess - offset);
}

let clock;
if (opts.date) {
  const m = opts.date.match(/^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?$/);
  clock = m ? seattleInstant(+m[1], +m[2], +m[3], m[4] ? +m[4] : 12, m[5] ? +m[5] : 0) : new Date(opts.date);
  if (Number.isNaN(clock.getTime())) fail(`Can't read --date ${opts.date}; use YYYY-MM-DD.`);
}

const root = fileURLToPath(new URL('../', import.meta.url));
requireDist();
const slug = path.replace(/^\/+|\/+$/g, '').replace(/[^\w.-]+/g, '-') || 'home';
const out = opts.out ?? `${root}screenshots/${slug}-${opts.width}${opts.date ? '-' + opts.date.replace(/:/g, '') : ''}.png`;
mkdirSync(dirname(out), { recursive: true });

const server = await serveDist(dist, BASE);
const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: opts.width, height: 800 }, timezoneId: 'America/Los_Angeles' });
  if (clock) await page.clock.setFixedTime(clock);
  const res = await page.goto(server.origin + BASE + path);
  if (!res?.ok()) throw new Error(`${path} returned HTTP ${res?.status()}`);

  // A static header can't cover element shots. Lazy images only load near the viewport, so load every visible one
  // now; images inside [hidden] scheduled cards are skipped, since they never load.
  await page.addStyleTag({ content: '.site-header { position: static !important; }' });
  await page.evaluate(async () => {
    const imgs = [...document.images].filter((img) => img.checkVisibility());
    for (const img of imgs) img.loading = 'eager';
    await Promise.all(imgs.map((img) => img.decode().catch(() => {})));
    await document.fonts.ready;
  });

  const shot = { path: out, animations: 'disabled' };
  if (opts.selector) {
    const el = page.locator(opts.selector).first();
    if (!(await el.count())) throw new Error(`No element matches ${opts.selector} on ${path}`);
    await el.screenshot(shot);
  } else {
    await page.screenshot({ ...shot, fullPage: opts.full });
  }
  console.log(relative(process.cwd(), out) || out);
} catch (err) {
  console.error(err.message);
  process.exitCode = 1;
} finally {
  await browser.close();
  server.close();
}
