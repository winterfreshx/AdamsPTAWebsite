// Rendered-color contrast audit: loads every built page in headless Chrome and checks each visible text
// element's computed color against the background actually painted behind it (WCAG AA: 4.5:1, or 3:1
// for large text). Run after `npm run build`. Needs Google Chrome; set CHROME_PATH if it isn't found.
import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const dist = fileURLToPath(new URL('../dist/', import.meta.url));
if (!existsSync(dist)) { console.error('dist/ not found, so run `npm run build` first.'); process.exit(1); }

const chromePath = [
  process.env.CHROME_PATH,
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/google-chrome-stable',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
].find((p) => p && existsSync(p));
if (!chromePath) { console.error('Google Chrome not found; set CHROME_PATH.'); process.exit(1); }

// ---- Static server that mimics GitHub Pages (/about-our-pta → about-our-pta.html) ----
const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.xml': 'application/xml' };
const server = createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (p.endsWith('/')) p += 'index.html';
  let file = join(dist, p);
  if (!existsSync(file) && existsSync(file + '.html')) file += '.html';
  if (!existsSync(file) || statSync(file).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'content-type': types[extname(file)] ?? 'application/octet-stream' });
  res.end(readFileSync(file));
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${server.address().port}`;

// ---- Chrome over the DevTools protocol (no dependencies; Node 22+ has WebSocket) ----
const profile = mkdtempSync(join(tmpdir(), 'contrast-'));
const chrome = spawn(chromePath, ['--headless=new', '--no-sandbox', '--disable-gpu', '--hide-scrollbars', '--remote-debugging-port=0', `--user-data-dir=${profile}`, 'about:blank'], { stdio: 'ignore' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let port;
for (let i = 0; i < 80 && !port; i++) {
  await sleep(100);
  try { port = readFileSync(join(profile, 'DevToolsActivePort'), 'utf8').split('\n')[0]; } catch {}
}
let target;
for (let i = 0; i < 40 && !target; i++) {
  try { target = (await (await fetch(`http://127.0.0.1:${port}/json`)).json()).find((t) => t.type === 'page'); } catch {}
  if (!target) await sleep(100);
}
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener('open', r));
let seq = 0;
const pending = new Map();
const listeners = [];
ws.addEventListener('message', (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
  if (m.method) for (const l of listeners.splice(0)) l.method === m.method ? l.res() : listeners.push(l);
});
const send = (method, params = {}) => new Promise((res) => { const id = ++seq; pending.set(id, res); ws.send(JSON.stringify({ id, method, params })); });
const once = (method) => new Promise((res) => listeners.push({ method, res }));
await send('Page.enable');

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
  return { fails, checked, skips };
})()`;

const pages = readdirSync(dist, { recursive: true })
  .map(String)
  .filter((f) => f.endsWith('.html') && !/http-equiv="refresh"/.test(readFileSync(join(dist, f), 'utf8')));

let failures = 0, totalChecked = 0, totalSkipped = 0;
for (const width of [375, 1280]) {
  await send('Emulation.setDeviceMetricsOverride', { width, height: 900, deviceScaleFactor: 1, mobile: width < 700 });
  for (const f of pages) {
    const path = f === 'index.html' ? '/' : '/' + f.replace(/\.html$/, '');
    const loaded = once('Page.loadEventFired');
    await send('Page.navigate', { url: base + path });
    await Promise.race([loaded, sleep(5000)]);
    const res = (await send('Runtime.evaluate', { expression: AUDIT, returnByValue: true })).result?.result?.value;
    if (!res) { console.log(`  ✗ ${path} @${width}px: audit failed to run`); failures++; continue; }
    totalChecked += res.checked;
    totalSkipped += res.skips.length;
    if (process.env.AUDIT_VERBOSE) res.skips.forEach((x) => console.log(`  · skipped ${path} @${width}px  ${x}`));
    for (const x of res.fails) {
      failures++;
      console.log(`  ✗ ${path} @${width}px  ${x.el} "${x.text}"  ${x.fg} on ${x.bg} = ${x.ratio}:1 (needs ${x.need}:1)`);
    }
  }
}

ws.close();
chrome.kill();
server.close();
try { rmSync(profile, { recursive: true, force: true }); } catch {}
console.log(`\nContrast audit: ${pages.length} pages × 2 widths, ${totalChecked} text elements checked, ${totalSkipped} skipped (text over images/gradients).`);
console.log(failures ? `${failures} contrast failure(s).` : 'All rendered text meets WCAG AA contrast.');
process.exit(failures ? 1 : 0);
