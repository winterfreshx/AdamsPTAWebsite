// Shared setup for the scripts (verify-links, audit-contrast, test-menu, screenshot): where the build is, which
// sub-folder it was built for, and which of its HTML files are real pages.
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const dist = fileURLToPath(new URL('../../dist/', import.meta.url));

// Sub-folder the site was built for ("" at a domain root). Must match the SITE_BASE used for `npm run build`.
export const BASE = (process.env.SITE_BASE || '').replace(/\/$/, '');

/** Exits with a hint when there is no build to check. */
export function requireDist() {
  if (!existsSync(dist)) { console.error('dist/ not found, so run `npm run build` first.'); process.exit(1); }
}

/** Every .html file in dist/, as paths relative to it (e.g. "about-our-pta.html"), redirect stubs included. */
export const listHtmlFiles = () => readdirSync(dist, { recursive: true }).map(String).filter((f) => f.endsWith('.html'));

/**
 * The built pages as URL paths without the base ("/", "/about-our-pta"), leaving out meta-refresh redirect stubs.
 * "index.html" maps to "/" and "x/index.html" to "/x/", the way GitHub Pages serves them.
 */
export const listPages = () =>
  listHtmlFiles()
    .filter((f) => !/http-equiv="refresh"/.test(readFileSync(join(dist, f), 'utf8')))
    .map((f) => '/' + f.replace(/\\/g, '/').replace(/\.html$/, '').replace(/(^|\/)index$/, '$1'));
