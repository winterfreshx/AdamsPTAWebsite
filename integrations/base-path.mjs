// When the site is built with a sub-folder `base` (e.g. GitHub Pages at /AdamsPTAWebsite before the custom
// domain is connected), prefix every root-relative URL in the built HTML with that base. Source code keeps
// writing "/about-our-pta"; Astro already prefixes its own /_astro assets, so those are left alone.
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ATTRS = ['href', 'src', 'action', 'poster', 'data-href-in', 'data-href-out'];

export function prefixRootUrls(html, base, origin = '') {
  const fix = (url) => (url.startsWith('/') && !url.startsWith('//') && url !== base && !url.startsWith(base + '/') && !url.startsWith(base + '#') ? base + url : url);
  const attrRe = new RegExp(`(\\s(?:${ATTRS.join('|')})=)(["'])(/[^"']*)\\2`, 'g');
  return html
    .replace(attrRe, (_, pre, q, url) => `${pre}${q}${fix(url)}${q}`)
    .replace(/(\ssrcset=)(["'])([^"']*)\2/g, (_, pre, q, set) =>
      `${pre}${q}${set.split(',').map((part) => part.replace(/^(\s*)(\S+)/, (m, sp, url) => sp + fix(url))).join(',')}${q}`,
    )
    .replace(/(<meta\s+http-equiv="refresh"\s+content="\d+;\s*url=)(\/[^"]*)/gi, (_, pre, url) => pre + fix(url))
    // Same-site absolute URLs that Astro writes without the base (e.g. the canonical link on redirect pages).
    .replace(new RegExp(`(["'])${escapeRe(origin)}(/[^"']*)\\1`, 'g'), (m, q, path) => (origin ? `${q}${origin}${fix(path)}${q}` : m));
}

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export default function basePath() {
  let base = '';
  let origin = '';
  return {
    name: 'adams:base-path',
    hooks: {
      'astro:config:done': ({ config }) => {
        base = config.base.replace(/\/$/, '');
        origin = config.site ? new URL(config.site).origin : '';
      },
      'astro:build:done': async ({ dir, logger }) => {
        if (!base) return;
        const root = fileURLToPath(dir);
        const files = (await readdir(root, { recursive: true })).filter((f) => f.endsWith('.html'));
        for (const f of files) {
          const p = join(root, f);
          const html = await readFile(p, 'utf8');
          const out = prefixRootUrls(html, base, origin);
          if (out !== html) await writeFile(p, out);
        }
        logger.info(`prefixed root-relative URLs with ${base} in ${files.length} pages`);
      },
    },
  };
}
