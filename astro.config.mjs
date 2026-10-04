// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Pages that should never show up in search results (PayPal return pages, info stubs).
const NOINDEX = [
  '/donationthanks',
  '/biggivethanks',
  '/pno-confirmation',
  '/readerboard-confirmation',
  '/school-directory',
  '/student-directory',
  '/we-appreciate-adams-web-list',
  '/404',
];

export default defineConfig({
  site: 'https://www.adamselementarypta.org',
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
  },
  integrations: [
    sitemap({
      filter: (page) => !NOINDEX.some((p) => new URL(page).pathname.replace(/\.html$/, '') === p),
    }),
  ],
});
