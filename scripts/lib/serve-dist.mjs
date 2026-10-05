// A tiny static server for dist/ that behaves like GitHub Pages: "/about-our-pta" serves about-our-pta.html, and
// with a base path only the sub-folder exists. Shared by audit-contrast.mjs and test-menu.mjs.
import { createServer } from 'node:http';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { extname, join, resolve, sep } from 'node:path';

const TYPES = {
  '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.webp': 'image/webp', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.xml': 'application/xml',
};

/** Starts the server on a free port. Returns { origin, close }. `base` is "" or e.g. "/AdamsPTAWebsite". */
export async function serveDist(dist, base = '') {
  const root = resolve(dist);
  const notFound = (res) => { res.writeHead(404); res.end(); };
  const server = createServer((req, res) => {
    let p;
    try {
      p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    } catch {
      return notFound(res); // malformed escape like %E0%A4%A
    }
    if (base) {
      if (p !== base && !p.startsWith(base + '/')) return notFound(res);
      p = p.slice(base.length) || '/';
    }
    if (p.endsWith('/')) p += 'index.html';
    let file = resolve(join(root, p));
    if (file !== root && !file.startsWith(root + sep)) return notFound(res); // never serve outside dist/
    if (!existsSync(file) && existsSync(file + '.html')) file += '.html';
    if (!existsSync(file) || statSync(file).isDirectory()) return notFound(res);
    res.writeHead(200, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream' });
    res.end(readFileSync(file));
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  return { origin: `http://127.0.0.1:${server.address().port}`, close: () => server.close() };
}
