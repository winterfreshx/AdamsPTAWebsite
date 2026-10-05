// Unit tests for src/lib/external-links.mjs (the new-tab + icon rule for links to other sites). No browser needed.
// Run: npm run test:links
import assert from 'node:assert/strict';
import { isExternalHref, markExternalLinks, siteHosts } from '../src/lib/external-links.mjs';

const hosts = siteHosts('https://www.adamselementarypta.org');
const mark = (html) => markExternalLinks(html, hosts);
const EXT = 'M15 3h6v6';
const ARROW = 'M5 12h14M13 6l6 6-6 6';
const arrowSvg = `<svg class="ac-arrow" viewBox="0 0 24 24"><path d="${ARROW}"/></svg>`;
const count = (s, sub) => s.split(sub).length - 1;

let passed = 0;
const failures = [];
const test = (name, fn) => {
  try { fn(); passed++; } catch (e) { failures.push(`✗ ${name}\n    ${e.message.split('\n')[0]}`); }
};

test('which links count as external', () => {
  assert.equal(isExternalHref('https://www.paypal.com/x', hosts), true);
  assert.equal(isExternalHref('HTTPS://EXAMPLE.COM/', hosts), true);
  assert.equal(isExternalHref('https://shop.adamselementarypta.org/', hosts), true); // a different host
  assert.equal(isExternalHref('https://www.adamselementarypta.org?ref=x', hosts), false);
  assert.equal(isExternalHref('https://adamselementarypta.org#top', hosts), false);
  assert.equal(isExternalHref('/big-give', hosts), false);
  assert.equal(isExternalHref('mailto:a@b.org', hosts), false);
  assert.equal(isExternalHref('tel:2062521300', hosts), false);
});

test('plain text link: new tab, rel, one icon bound to the last word, screen-reader text', () => {
  const out = mark('<a href="https://x.org">SPS school-year calendar</a>');
  assert.match(out, /target="_blank"/);
  assert.match(out, /rel="noopener noreferrer"/);
  assert.equal(count(out, EXT), 1);
  assert.match(out, /<span class="ext-label">SPS school-year <span class="ext-nowrap">calendar<svg/);
  assert.match(out, /\(opens in a new tab\)/);
});

test('button with a leading icon: trailing text becomes one label (no flex column split)', () => {
  const out = mark('<a class="btn" href="https://paypal.com"><svg><path d="heart"/></svg> Donate now</a>');
  assert.match(out, /<path d="heart"\/><\/svg><span class="ext-label"> Donate <span class="ext-nowrap">now<svg/);
});

test('very long last word stays breakable (no no-wrap)', () => {
  const out = mark('<a href="https://x.org">https://averyveryverylongdomainname.example.org</a>');
  assert.doesNotMatch(out, /ext-nowrap/);
  assert.equal(count(out, EXT), 1);
});

test('existing rel tokens are kept', () => {
  const out = mark('<a href="https://mastodon.social/@pta" rel="me">PTA</a>');
  assert.match(out, /rel="me noopener noreferrer"/);
});

test('opt-out: data-same-tab and an explicit non-_blank target are left alone', () => {
  for (const html of ['<a href="https://paypal.com" data-same-tab>Pay</a>', '<a href="https://paypal.com" target="_self">Pay</a>']) {
    assert.equal(mark(html), html);
  }
});

test('icon-only link with aria-label: label announces the new tab, no visible icon', () => {
  const out = mark('<a href="https://instagram.com/x" aria-label="Instagram"><svg><path d="ig"/></svg></a>');
  assert.match(out, /aria-label="Instagram \(opens in a new tab\)"/);
  assert.equal(count(out, EXT), 0);
});

test('icon-only link without aria-label (image with alt): screen-reader text, no visible icon', () => {
  const out = mark('<a href="https://sponsor.com"><img src="logo.png" alt="Acme"></a>');
  assert.match(out, /<span class="visually-hidden"> \(opens in a new tab\)<\/span>/);
  assert.equal(count(out, EXT), 0);
});

test('icon + visually-hidden label counts as icon-only (no visible icon)', () => {
  const out = mark('<a href="https://instagram.com/x"><svg><path d="ig"/></svg><span class="visually-hidden">Instagram</span></a>');
  assert.equal(count(out, EXT), 0);
  assert.match(out, /\(opens in a new tab\)/);
});

test('text link with aria-label: announcement goes into the label (it overrides content)', () => {
  const out = mark('<a href="https://x.org" aria-label="Adams PTA on Konstella">Konstella</a>');
  assert.match(out, /aria-label="Adams PTA on Konstella \(opens in a new tab\)"/);
  assert.doesNotMatch(out, /visually-hidden/);
});

test('trailing arrow is swapped for the external icon (and marked for its hover nudge)', () => {
  const out = mark(`<a href="https://x.org">Shop now ${arrowSvg}</a>`);
  assert.equal(count(out, ARROW), 0);
  assert.equal(count(out, EXT), 1);
  assert.match(out, /class="ext-swapped ac-arrow"/);
});

test('leading arrow is NOT swapped; the icon goes at the end', () => {
  const out = mark(`<a href="https://x.org">${arrowSvg} Next step</a>`);
  assert.equal(count(out, ARROW), 1);
  assert.ok(out.indexOf(EXT) > out.indexOf('Next'));
});

// Exactly what <Icon name="external" /> renders.
const FULL_EXT_PATH = 'M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6';
test('link that already shows the external icon gets no second icon', () => {
  const out = mark(`<a href="https://x.org">Docs <svg><path d="${FULL_EXT_PATH}"/></svg></a>`);
  assert.equal(count(out, EXT), 1);
});

test('links inside <script>, <style>, <template>, <textarea> and comments are untouched', () => {
  for (const html of [
    '<script>const s = "<a href=\\"https://x.org\\">x</a>";</script>',
    '<style>/* <a href="https://x.org">x</a> */</style>',
    '<template><a href="https://x.org">x</a></template>',
    '<textarea><a href="https://x.org">x</a></textarea>',
    '<!-- <a href="https://x.org">x</a> -->',
  ]) assert.equal(mark(html), html);
});

test('internal, mailto and tel links are untouched', () => {
  for (const html of ['<a href="/big-give">Give</a>', '<a href="mailto:a@b.org">a@b.org</a>', '<a href="tel:123">123</a>', '<a href="https://www.adamselementarypta.org/x">x</a>']) {
    assert.equal(mark(html), html);
  }
});

test('running it twice changes nothing more', () => {
  const once = mark(`<p><a href="https://x.org">Shop now ${arrowSvg}</a> and <a href="https://y.org">read more</a></p>`);
  assert.equal(mark(once), once);
});

for (const f of failures) console.log(f);
console.log(failures.length ? `\n${failures.length} of ${passed + failures.length} external-link tests failed.` : `All ${passed} external-link tests passed.`);
process.exit(failures.length ? 1 : 0);
