// Every link to another website opens in a new tab and says so. Applied to every page by src/middleware.ts (in the
// dev server and in the static build), so page code just writes <a href="https://…"> and never has to remember
// target/rel or the icon.
//
// For each external link (http/https to a different host than the site), this adds:
// - target="_blank" rel="noopener noreferrer"
// - the external-link icon at the end. If the link already ends in an arrow icon, the arrow becomes the external
//   icon instead, and links that already show the external icon keep it.
// - hidden "(opens in a new tab)" text for screen readers. Icon-only links (e.g. the footer's Instagram circle)
//   get it in their aria-label and no visible icon.
// mailto:, tel: and same-site links are left alone.
const EXTERNAL_PATH = 'M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6';
const ARROW_PATH = 'M5 12h14M13 6l6 6-6 6';
const NEW_TAB_TEXT = '(opens in a new tab)';
const ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="ext-icon" aria-hidden="true" focusable="false"><path d="${EXTERNAL_PATH}"/></svg>`;
const SR_TEXT = `<span class="visually-hidden"> ${NEW_TAB_TEXT}</span>`;

/** Hosts that count as "this site" (the live domain with or without www, plus wherever this build is served). */
export const siteHosts = (siteUrl) => {
  const hosts = new Set(['adamselementarypta.org', 'www.adamselementarypta.org']);
  if (siteUrl) hosts.add(new URL(siteUrl).host);
  return hosts;
};

// Appends the icon, keeping it on the same line as the link's last word ("calendar ↗", never "↗" alone on a new
// line). Long last words (e.g. a bare URL) are left breakable so they can still wrap on narrow phones.
function appendIcon(inner) {
  const trimmed = inner.replace(/\s*$/, '');
  const m = trimmed.match(/^([\s\S]*?)([^\s<>]+)$/);
  if (m && m[2].length <= 24) return `${m[1]}<span class="ext-nowrap">${m[2]}${ICON}</span>`;
  return trimmed + ICON;
}

export function markExternalLinks(html, hosts) {
  return html.replace(/<a\b([^>]*)>([\s\S]*?)<\/a>/g, (whole, attrs, inner) => {
    const href = attrs.match(/\shref="([^"]*)"/)?.[1];
    if (!href || !/^https?:\/\//i.test(href)) return whole;
    let host;
    try { host = new URL(href.replace(/&amp;/g, '&')).host; } catch { return whole; }
    if (hosts.has(host)) return whole;

    // target + rel
    let a = attrs.replace(/\s(target|rel)="[^"]*"/g, '');
    a += ' target="_blank" rel="noopener noreferrer"';

    const text = inner.replace(/<[^>]+>/g, '').trim();
    if (!text) {
      // Icon-only link: announce the new tab through aria-label, no visible extra icon.
      a = /\saria-label="/.test(a)
        ? a.replace(/\saria-label="([^"]*)"/, (m, label) => (label.includes(NEW_TAB_TEXT) ? m : ` aria-label="${label} ${NEW_TAB_TEXT}"`))
        : a;
      return `<a${a}>${inner}</a>`;
    }

    let body = inner;
    if (!body.includes(EXTERNAL_PATH)) {
      body = body.includes(ARROW_PATH) ? body.replace(ARROW_PATH, EXTERNAL_PATH) : appendIcon(body);
    }
    if (!body.includes(NEW_TAB_TEXT)) body += SR_TEXT;
    return `<a${a}>${body}</a>`;
  });
}
