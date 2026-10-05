// The site can be served from a domain root (www.adamselementarypta.org) or from a sub-folder
// (winterfreshx.github.io/AdamsPTAWebsite before the domain is connected). Source code always writes
// root-relative links like "/about-our-pta"; integrations/base-path.mjs adds the base to built HTML.
// Use these helpers only where code *compares* or *builds* URLs at render time.

/** The base path without a trailing slash: "" at a domain root, "/AdamsPTAWebsite" in a sub-folder. */
export const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

/** "/AdamsPTAWebsite/about-our-pta.html" → "/about-our-pta" (also drops the .html of file-format builds). */
export const sitePath = (pathname: string) => {
  const p = BASE && pathname.startsWith(BASE) ? pathname.slice(BASE.length) : pathname;
  return p.replace(/\.html$/, '').replace(/\/index$/, '/').replace(/(.)\/$/, '$1') || '/';
};

/** "/og-image.png" → "/AdamsPTAWebsite/og-image.png". */
export const withBase = (path: string) => `${BASE}${path}`;
