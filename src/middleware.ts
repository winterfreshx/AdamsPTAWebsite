// Runs for every page, both in `npm run dev` and when `npm run build` pre-renders the static site.
// Gives every link to another website target="_blank", the external-link icon and "(opens in a new tab)".
// The HTML transform lives in src/lib/external-links.mjs; see the comment there.
import { defineMiddleware } from 'astro:middleware';
import { markExternalLinks, siteHosts } from './lib/external-links.mjs';

const hosts = siteHosts(import.meta.env.SITE);

export const onRequest = defineMiddleware(async (_context, next) => {
  const response = await next();
  if (!response.headers.get('content-type')?.includes('text/html')) return response;
  const html = await response.text();
  return new Response(markExternalLinks(html, hosts), {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  });
});
