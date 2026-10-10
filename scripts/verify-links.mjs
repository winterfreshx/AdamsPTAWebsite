// Parity + quality checks for the built site. Run `npm run build && npm run verify`.
// See designs/CHECKLIST.md Phase 9.
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { isExternalHref, siteHosts, withoutProtectedRegions } from '../src/lib/external-links.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const dist = join(root, 'dist');
const crawlDir = join(root, 'designs/crawl');
// Sub-folder the site was built for ("" at a domain root). Must match the SITE_BASE used for `npm run build`.
const BASE = (process.env.SITE_BASE || '').replace(/\/$/, '');
let failures = 0;
const fail = (msg) => { failures++; console.log(`  ✗ ${msg}`); };
const ok = (msg) => console.log(`  ✓ ${msg}`);

if (!existsSync(dist)) { console.error('dist/ not found, so run `npm run build` first.'); process.exit(1); }

const htmlFiles = readdirSync(dist, { recursive: true }).filter((f) => f.endsWith('.html')).map(String);
const pages = Object.fromEntries(htmlFiles.map((f) => [f, readFileSync(join(dist, f), 'utf8')]));
const decode = (s) => s.replace(/&amp;/g, '&').replace(/&#38;/g, '&').replace(/&quot;/g, '"');
const hrefsOf = (html) => [...html.matchAll(/href="([^"]+)"/g)].map((m) => decode(m[1]));
const allHrefs = new Set(Object.values(pages).flatMap(hrefsOf));

// ---- 9.1 External link parity -------------------------------------------------
console.log('\n9.1 Every live external link & email from the Wix crawl exists in the new site');
const normUrl = (u) => {
  try { u = decodeURIComponent(u); } catch {}
  return u.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/$/, '').toLowerCase();
};
const normMail = (u) => u.replace(/^mailto:/i, '').split('?')[0].toLowerCase();
const builtUrls = new Set([...allHrefs].filter((h) => /^https?:/.test(h)).map(normUrl));
const builtMails = new Set([...allHrefs].filter((h) => h.startsWith('mailto:')).map(normMail));

// Links intentionally not carried over, each with a reason.
const ALLOW = {
  'app.99pledges.com/fund/adamsmoveathon2023': 'only on the retired /fundraisingold page (2023 campaign)',
  'signupgenius.com/go/5080f44ada82da5ff2-adams2': 'only on the retired /fundraisingold page',
  'nam12.safelinks.protection.outlook.com': 'Outlook SafeLinks wrapper, replaced by the real Smith Brothers URL',
  'facebook.com/groups/1741508802605072': 'Class of 2024 Facebook group (graduated)',
  'facebook.com/groups/adamsclassof2025': 'Class of 2025 Facebook group (graduated)',
  'facebook.com/groups/adamsclassof2026': 'Class of 2026 Facebook group (graduated)',
  'mailto:readerboard@adamselementary.com': 'typo on the Wix page; the .org inbox is used',
  'mailto:rep2022b@adamselementary.org': 'wrong mailto on the stale Grade Reps page',
  'mailto:rep2024@adamselementary.org': 'class of 2024 has graduated (stale Grade Reps page)',
  'mailto:rep2025@adamselementary.org': 'class of 2025 has graduated (stale Grade Reps page)',
  'mailto:rep2026@adamselementary.org': 'class of 2026 graduated in June 2026',
  'mailto:rep2020@adamselementary.org': 'shown for the Class of 2030 on Wix; corrected to rep2030@ to match the class year',
  'mailto:fundraising@adamselementary.org': 'only on the retired /fundraisingold page',
  'mailto:execteam-group@adamselementary.org': 'only on the retired /fundraisingold page',
};
const allowedReason = (link) => Object.entries(ALLOW).find(([k]) => link.toLowerCase().includes(k.toLowerCase()))?.[1];

const crawled = readFileSync(join(crawlDir, 'external-links.txt'), 'utf8').split('\n').filter(Boolean);
let carried = 0;
const skipped = [];
for (const link of crawled) {
  const present = link.startsWith('mailto:') ? builtMails.has(normMail(link)) : builtUrls.has(normUrl(link));
  if (present) { carried++; continue; }
  const reason = allowedReason(link);
  if (reason) skipped.push(`${link.slice(0, 70)} (${reason})`);
  else fail(`missing: ${link}`);
}
ok(`${carried}/${crawled.length} crawled links present`);
skipped.forEach((s) => console.log(`  · intentionally dropped: ${s}`));

// ---- 9.2 Every crawled page path resolves ----------------------------------------
console.log('\n9.2 Every Wix URL resolves (page or redirect)');
const crawledPaths = readdirSync(crawlDir).filter((f) => f.endsWith('.md')).map((f) => f.replace(/\.md$/, ''));
for (const p of crawledPaths) {
  const file = p === 'home' ? 'index.html' : `${p}.html`;
  if (!pages[file]) fail(`/${p === 'home' ? '' : p} has no page in dist`);
}
ok(`${crawledPaths.length} Wix paths checked`);

// ---- 9.3 Internal links resolve --------------------------------------------------
console.log('\n9.3 Internal links resolve');
const internal = [...allHrefs].filter((h) => h.startsWith('/') && !h.startsWith('//'));
for (const raw of internal) {
  if (BASE && raw !== BASE && !raw.startsWith(BASE + '/') && !raw.startsWith(BASE + '#')) { fail(`link missing the ${BASE} base path: ${raw}`); continue; }
  const h = BASE ? raw.slice(BASE.length) || '/' : raw;
  const [path, hash] = h.split('#');
  const clean = path.replace(/\/$/, '') || '/';
  const candidates = clean === '/' ? ['index.html'] : [`${clean.slice(1)}.html`, clean.slice(1), `${clean.slice(1)}/index.html`];
  const target = candidates.find((c) => pages[c] || existsSync(join(dist, c)));
  if (!target) { fail(`broken internal link: ${h}`); continue; }
  if (hash && pages[target] && !pages[target].includes(`id="${hash}"`)) fail(`missing anchor #${hash} on ${clean}`);
}
ok(`${internal.length} unique internal links checked${BASE ? ` (base ${BASE})` : ''}`);

// ---- 9.4 Images have alt -------------------------------------------------------------
console.log('\n9.4 Every <img> has an alt attribute');
let imgCount = 0;
for (const [f, html] of Object.entries(pages)) {
  for (const m of html.matchAll(/<img\b[^>]*>/g)) {
    imgCount++;
    if (!/\balt(="|[\s>])/.test(m[0])) fail(`${f}: <img> without alt → ${m[0].slice(0, 90)}`);
  }
}
ok(`${imgCount} images checked`);

// ---- Page quality: one h1, unique title, description -------------------------------------
console.log('\n7.x Each page: exactly one <h1>, a unique <title>, a meta description');
const titles = new Map();
for (const [f, html] of Object.entries(pages)) {
  if (/http-equiv="refresh"/.test(html)) continue; // redirect stubs
  const h1s = (html.match(/<h1\b/g) || []).length;
  if (h1s !== 1) fail(`${f}: ${h1s} <h1> elements`);
  const title = html.match(/<title>([^<]*)<\/title>/)?.[1];
  if (!title) fail(`${f}: no <title>`);
  else if (titles.has(title)) fail(`${f}: duplicate title with ${titles.get(title)}`);
  else titles.set(title, f);
  if (!/<meta name="description" content="[^"]{20,}"/.test(html)) fail(`${f}: missing meta description`);
}
ok(`${titles.size} content pages checked`);

// ---- Words glued to inline elements (e.g. "theSeattle Council PTSA") ----------------
console.log('\n7.x No words glued to links/bold text');
for (const [f, html] of Object.entries(pages)) {
  const body = html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, '');
  for (const m of body.matchAll(/[a-z]<(a|strong)\b[^>]*>[A-Za-z]/g)) fail(`${f}: glued text near "${body.slice(m.index - 20, m.index + 40).replace(/\s+/g, ' ')}"`);
}
ok('checked');

// ---- 9.5 Color contrast of token pairs -------------------------------------------------------
console.log('\n9.5 Brand color contrast (WCAG AA ≥ 4.5:1)');
const lum = (hex) => {
  const [r, g, b] = hex.match(/\w\w/g).map((x) => parseInt(x, 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
const pairs = [
  ['white on green-700', '#ffffff', '#105838'],
  ['green-900 on gold-500', '#0b3d27', '#e4a83c'],
  ['ink on paper', '#14231b', '#fffdf7'],
  ['ink-soft on paper', '#3e5246', '#fffdf7'],
  ['green-700 link on paper', '#105838', '#fffdf7'],
  ['green-700 on green-100', '#105838', '#e6f2ea'],
  ['gold-300 on green-900 (footer headings)', '#f5cd6e', '#0b3d27'],
  ['white on green-500 (hover)', '#ffffff', '#1f7a4d'],
  ['green-900 on gold-100', '#0b3d27', '#fdf4dc'],
  ['green-700 on gold-200 (current nav group)', '#105838', '#fbeac0'],
];
for (const [name, fg, bg] of pairs) {
  const r = ratio(fg, bg);
  r >= 4.5 ? ok(`${name}: ${r.toFixed(2)}:1`) : fail(`${name}: ${r.toFixed(2)}:1`);
}

// ---- 9.8 External links open in a new tab, safely, and say so ----------------------------------------
console.log('\n9.8 External links: new tab + rel="noopener", external icon, "(opens in a new tab)" for screen readers');
// Same "is it external?" rule as the site itself (src/lib/external-links.mjs), so the two can't disagree.
const EXTERNAL_ICON = 'M15 3h6v6';
const hosts = siteHosts(process.env.SITE_URL || 'https://www.adamselementarypta.org');
let externalCount = 0;
for (const [f, html] of Object.entries(pages)) {
  for (const m of withoutProtectedRegions(html).matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/g)) {
    const [, attrs, inner] = m;
    const href = attrs.match(/\shref="([^"]*)"/)?.[1] ?? '';
    if (/target="_blank"/.test(attrs) && !/noopener/.test(attrs)) fail(`${f}: target="_blank" without noopener: ${href}`);
    if (!isExternalHref(href, hosts)) continue;
    const target = attrs.match(/\starget="([^"]*)"/)?.[1];
    if (/\sdata-same-tab(\s|=|$)/.test(attrs) || (target && target !== '_blank')) continue; // deliberate same-tab opt-out
    externalCount++;
    const visible = inner.replace(/<span class="visually-hidden">[\s\S]*?<\/span>/g, '').replace(/<[^>]+>/g, '').trim();
    const announced = /aria-label="[^"]*\(opens in a new tab\)/.test(attrs) || (!/\saria-label="/.test(attrs) && inner.includes('(opens in a new tab)'));
    const icons = inner.split(EXTERNAL_ICON).length - 1;
    const problems = [];
    if (target !== '_blank') problems.push('no target="_blank"');
    if (!/rel="[^"]*noopener/.test(attrs)) problems.push('no rel=noopener');
    if (!announced) problems.push('no "(opens in a new tab)" for screen readers');
    if (visible && icons !== 1) problems.push(`${icons} external icons`);
    if (problems.length) fail(`${f}: ${href.slice(0, 60)}: ${problems.join(', ')}`);
  }
}
ok(`${externalCount} external links checked`);

console.log(failures ? `\n${failures} problem(s) found.` : '\nAll checks passed.');
process.exit(failures ? 1 : 0);
