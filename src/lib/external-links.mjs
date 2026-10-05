// Every link to another website opens in a new tab and says so. Applied to every page by src/middleware.ts (in the
// dev server and in the static build), so page code just writes <a href="https://…"> and never has to remember
// target/rel or the icon. scripts/verify-links.mjs uses the same isExternalHref()/siteHosts() rule to check it.
//
// For each external link (http/https to a different host than the site):
// - target="_blank", and rel gains "noopener noreferrer" (existing rel tokens like "me" or "sponsored" are kept)
// - the external-link icon at the end, kept on the same line as the last word. If the link already ends in an
//   arrow icon, that arrow becomes the external icon instead; links already showing the external icon keep it.
// - "(opens in a new tab)" for screen readers: hidden text, or appended to aria-label when the link has one
//   (aria-label overrides the link's content for screen readers)
// Icon-only links (no visible text, e.g. the footer's Instagram circle) get the announcement but no visible icon.
//
// Opt out (stay in the same tab, no icon): add data-same-tab, or an explicit target other than "_blank".
// mailto:, tel:, same-site links, and anything inside <script>, <style>, <template>, <textarea> or comments are untouched.

const EXTERNAL_PATH = 'M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6';
const ARROW_PATH = 'M5 12h14M13 6l6 6-6 6';
const NEW_TAB_TEXT = '(opens in a new tab)';
const ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="ext-icon" aria-hidden="true" focusable="false"><path d="${EXTERNAL_PATH}"/></svg>`;
const SR_TEXT = `<span class="visually-hidden"> ${NEW_TAB_TEXT}</span>`;
// Regions where "<a …>" is not a real link and must not be rewritten.
const PROTECTED = /<(script|style|template|textarea)\b[\s\S]*?<\/\1\s*>|<!--[\s\S]*?-->/gi;

/** Hosts that count as "this site" (the live domain with or without www, plus wherever this build is served). */
export const siteHosts = (siteUrl) => {
  const hosts = new Set(['adamselementarypta.org', 'www.adamselementarypta.org']);
  if (siteUrl) hosts.add(new URL(siteUrl).host.toLowerCase());
  return hosts;
};

/** True for an http(s) URL on a host other than this site. `href` may contain HTML entities (&amp;). */
export function isExternalHref(href, hosts) {
  if (!href || !/^https?:\/\//i.test(href)) return false;
  try {
    return !hosts.has(new URL(href.replace(/&amp;/g, '&')).host.toLowerCase());
  } catch {
    return false;
  }
}

/** The HTML with script/style/template/textarea/comment regions blanked out (for scanning real links only). */
export const withoutProtectedRegions = (html) => html.replace(PROTECTED, '');

/** Visible text of a link's inner HTML (ignores tags and screen-reader-only spans). */
const visibleText = (inner) =>
  inner.replace(/<span class="visually-hidden">[\s\S]*?<\/span>/g, '').replace(/<[^>]+>/g, '').trim();

// Puts the icon after the link's trailing text. The trailing text becomes ONE label element (so a flex button can't
// split it into columns), and its last word is bound to the icon with no-wrap ("calendar ↗", never "↗" alone on a
// new line). Very long last words (e.g. a bare URL) stay breakable so they can wrap on narrow phones.
function appendIcon(inner) {
  const trimmed = inner.replace(/\s+$/, '');
  const m = trimmed.match(/^([\s\S]*>)?([^<>]*)$/); // [1] everything up to the last tag, [2] trailing text
  const lead = m?.[1] ?? '';
  const text = m?.[2] ?? '';
  if (!text.trim()) return trimmed + ICON;
  const w = text.match(/^([\s\S]*?)(\S+)$/);
  const label = w && w[2].length <= 24 ? `${w[1]}<span class="ext-nowrap">${w[2]}${ICON}</span>` : `${text}${ICON}`;
  return `${lead}<span class="ext-label">${label}</span>`;
}

// If the link ends with an arrow icon, turn that arrow into the external icon. Returns null when it doesn't.
function swapTrailingArrow(inner) {
  const m = inner.match(/(<svg\b[^>]*>)((?:(?!<\/svg>)[\s\S])*)<\/svg>\s*$/);
  if (!m || !m[2].includes(ARROW_PATH)) return null;
  const open = /\sclass="/.test(m[1]) ? m[1].replace(/\sclass="/, ' class="ext-swapped ') : m[1].replace(/<svg\b/, '<svg class="ext-swapped"');
  return inner.slice(0, m.index) + open + m[2].replace(ARROW_PATH, EXTERNAL_PATH) + '</svg>' + inner.slice(m.index + m[0].length);
}

function markLink(whole, attrs, inner, hosts) {
  const href = attrs.match(/\shref="([^"]*)"/)?.[1];
  if (!isExternalHref(href, hosts)) return whole;
  const target = attrs.match(/\starget="([^"]*)"/)?.[1];
  if (/\sdata-same-tab(\s|=|$)/.test(attrs) || (target && target !== '_blank')) return whole; // explicit opt-out

  // target + rel (keep existing rel tokens)
  const rel = new Set((attrs.match(/\srel="([^"]*)"/)?.[1] ?? '').split(/\s+/).filter(Boolean));
  rel.add('noopener');
  rel.add('noreferrer');
  let a = attrs.replace(/\s(target|rel)="[^"]*"/g, '') + ` target="_blank" rel="${[...rel].join(' ')}"`;

  // Screen-reader announcement: aria-label wins over content, so extend it when present.
  const label = a.match(/\saria-label="([^"]*)"/)?.[1];
  let body = inner;
  if (label !== undefined) {
    if (!label.includes(NEW_TAB_TEXT)) a = a.replace(/\saria-label="[^"]*"/, ` aria-label="${label} ${NEW_TAB_TEXT}"`);
  } else if (!inner.includes(NEW_TAB_TEXT)) {
    body += SR_TEXT;
  }

  // Visible icon, only for links with visible text.
  if (visibleText(inner) && !inner.includes(EXTERNAL_PATH)) {
    const swapped = swapTrailingArrow(inner);
    const withIcon = swapped ?? appendIcon(inner);
    body = withIcon + body.slice(inner.length);
  }
  return `<a${a}>${body}</a>`;
}

export function markExternalLinks(html, hosts) {
  const rewrite = (chunk) => chunk.replace(/<a\b([^>]*)>([\s\S]*?)<\/a>/g, (whole, attrs, inner) => markLink(whole, attrs, inner, hosts));
  let out = '';
  let last = 0;
  for (const m of html.matchAll(PROTECTED)) {
    out += rewrite(html.slice(last, m.index)) + m[0];
    last = m.index + m[0].length;
  }
  return out + rewrite(html.slice(last));
}
