// Rendered-color contrast audit: loads every built page in headless Chromium (Playwright) and checks each visible
// text element's computed color against the background actually painted behind it (WCAG AA: 4.5:1, or 3:1 for
// large text). Run after `npm run build`. Needs Playwright's Chromium: `npx playwright install chromium`.
import { chromium } from 'playwright';
import { BASE, dist, listPages, requireDist } from './lib/site.mjs';
import { serveDist } from './lib/serve-dist.mjs';

requireDist();

// ---- Static server that mimics GitHub Pages ----
const server = await serveDist(dist, BASE);
const base = server.origin;

// Runs inside the page. Returns failing text elements.
const AUDIT = `(() => {
  const parse = (c) => { const m = c.match(/[\\d.]+/g)?.map(Number) ?? [0,0,0,0]; return { r: m[0], g: m[1], b: m[2], a: m.length > 3 ? m[3] : 1 }; };
  const over = (top, bot) => { const a = top.a + bot.a * (1 - top.a); return a === 0 ? { r: 0, g: 0, b: 0, a: 0 } : { r: (top.r * top.a + bot.r * bot.a * (1 - top.a)) / a, g: (top.g * top.a + bot.g * bot.a * (1 - top.a)) / a, b: (top.b * top.a + bot.b * bot.a * (1 - top.a)) / a, a }; };
  const lum = ({ r, g, b }) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
  const ratio = (x, y) => { const [h, l] = [lum(x), lum(y)].sort((a, b) => b - a); return (h + 0.05) / (l + 0.05); };
  const hex = (c) => '#' + [c.r, c.g, c.b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');
  const bgBehind = (el) => {
    const layers = [];
    for (let n = el; n; n = n.parentElement) {
      const cs = getComputedStyle(n);
      const c = parse(cs.backgroundColor);
      if (c.a > 0) layers.push(c);
      if (c.a >= 1) break;
      if (cs.backgroundImage !== 'none' && c.a < 1) return null; // painted image/gradient with no solid base: can't judge
    }
    return layers.reverse().reduce((acc, l) => over(l, acc), { r: 255, g: 255, b: 255, a: 1 });
  };
  const fails = [], skips = []; let checked = 0;
  for (const el of document.body.querySelectorAll('*')) {
    if (el.closest('svg, [hidden], noscript, script, style, iframe')) continue;
    const text = [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join('').trim();
    if (!text) continue;
    const cs = getComputedStyle(el);
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0 || cs.visibility === 'hidden' || +cs.opacity === 0) continue;
    if (el.closest('.visually-hidden, .skip-link')) continue;
    const bg = bgBehind(el);
    if (!bg) { skips.push(el.tagName.toLowerCase() + [...el.classList].filter((c) => !c.startsWith('astro-')).map((c) => '.' + c).join('') + ' "' + text.slice(0, 30) + '"'); continue; }
    const fg = over(parse(cs.color), bg);
    const size = parseFloat(cs.fontSize), bold = +cs.fontWeight >= 700;
    const need = size >= 24 || (size >= 18.66 && bold) ? 3 : 4.5;
    const r = ratio(fg, bg);
    checked++;
    if (r < need) fails.push({ text: text.slice(0, 50), el: el.tagName.toLowerCase() + [...el.classList].filter((c) => !c.startsWith('astro-')).map((c) => '.' + c).join(''), fg: hex(fg), bg: hex(bg), ratio: +r.toFixed(2), need });
  }
  // The page background is --paper only when global.css loaded; a broken stylesheet URL would otherwise pass.
  const stylesLoaded = getComputedStyle(document.body).backgroundColor === 'rgb(255, 253, 247)';
  return { fails, checked, skips, stylesLoaded };
})()`;

const pages = listPages();
const browser = await chromium.launch();

let failures = 0, totalChecked = 0, totalSkipped = 0;
for (const width of [375, 1280]) {
  const context = await browser.newContext({ viewport: { width, height: 900 }, deviceScaleFactor: 1, isMobile: width < 700 });
  const page = await context.newPage();
  for (const path of pages) {
    let res, error = '';
    try {
      // Waits for the load event (stylesheets, fonts and images done), not a fixed delay.
      await page.goto(base + BASE + path, { waitUntil: 'load', timeout: 30000 });
      res = await page.evaluate(AUDIT);
    } catch (e) { error = ` (${String(e.message).split('\n')[0]})`; }
    if (!res) { console.log(`  ✗ ${path} @${width}px: audit failed to run${error}`); failures++; continue; }
    if (!res.stylesLoaded) { failures++; console.log(`  ✗ ${path} @${width}px: site stylesheet did not load`); }
    totalChecked += res.checked;
    totalSkipped += res.skips.length;
    if (process.env.AUDIT_VERBOSE) res.skips.forEach((x) => console.log(`  · skipped ${path} @${width}px  ${x}`));
    for (const x of res.fails) {
      failures++;
      console.log(`  ✗ ${path} @${width}px  ${x.el} "${x.text}"  ${x.fg} on ${x.bg} = ${x.ratio}:1 (needs ${x.need}:1)`);
    }
  }
  await context.close();
}

await browser.close();
server.close();
console.log(`\nContrast audit: ${pages.length} pages × 2 widths, ${totalChecked} text elements checked, ${totalSkipped} skipped (text over images/gradients).`);
console.log(failures ? `${failures} contrast failure(s).` : 'All rendered text meets WCAG AA contrast.');
process.exit(failures ? 1 : 0);
