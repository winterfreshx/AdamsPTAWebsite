// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import basePath from './integrations/base-path.mjs';

// Where the site is served. Defaults to the real domain at its root. In CI, GitHub's configure-pages
// step supplies these: before the custom domain is connected that's https://winterfreshx.github.io
// with base /AdamsPTAWebsite, and afterwards the custom domain with no base, with no code change needed.
const SITE_URL = process.env.SITE_URL || 'https://www.adamselementarypta.org';
const SITE_BASE = (process.env.SITE_BASE || '').replace(/\/$/, '');

// Pages that should never show up in search results (PayPal return pages, info stubs).
const NOINDEX = [
  '/donationthanks',
  '/biggivethanks',
  '/pno-confirmation',
  '/readerboard-confirmation',
  '/school-directory',
  '/student-directory',
  '/404',
];

export default defineConfig({
  site: SITE_URL,
  base: SITE_BASE || undefined,
  // "file" output keeps the exact Wix-style URLs: /about-our-pta (no trailing slash).
  build: { format: 'file' },
  // Keep whitespace between text and inline links (compression was gluing words to links).
  compressHTML: false,
  trailingSlash: 'never',
  // Old Wix pages that were merged or retired. See designs/PLAN.md §5.
  redirects: {
    '/keep-connected': '/resources',
    '/grade-reps-groups': '/resources#grade-reps',
    '/fundraisingold': '/fundraising',
    '/copy-of-fundraising': '/fundraising',
    '/biggiveold': '/big-give',
    // The password-protected Staff Appreciation Binder; removed because nobody maintains it.
    '/we-appreciate-adams-web-list': '/we-appreciate-adams',
  },
  integrations: [
    sitemap({
      filter: (page) => {
        const path = new URL(page).pathname.slice(SITE_BASE.length).replace(/\.html$/, '');
        return !NOINDEX.includes(path);
      },
    }),
    // Runs after the pages are written: prefixes root-relative links with SITE_BASE. (External links are handled
    // by src/middleware.ts, which also runs in the dev server.)
    basePath(),
  ],
});
