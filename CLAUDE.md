# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A static Astro site for the Adams Elementary School PTA (Seattle). It replaces the PTA's old Wix site at adamselementarypta.org. Design intent, the old-site audit and the build checklist are in `designs/` (`ANALYSIS.md`, `PLAN.md`, `CHECKLIST.md`). `designs/crawl/` is a snapshot of the old Wix site (one extract per page plus `external-links.txt`). The verify script reads it, so don't delete it.

## Commands

Requires Node ≥ 22.12 (Astro 7).

```sh
npm run dev       # dev server, http://localhost:4321
npm run build     # static build → dist/
npm run verify    # static checks on dist/; run after build
npm run audit:contrast  # rendered-color WCAG check of every page in headless Chrome (needs Chrome; CHROME_PATH to override)
npm run preview   # serve dist/ (Astro 7 runs it as a daemon; stop with `npx astro preview stop`)
```

There is no test runner or linter. CI runs build → verify → audit:contrast before every deploy. `scripts/verify-links.mjs` fails if any of these break:
- every outside link and email from the Wix crawl still appears in `dist/` (anything deliberately removed must be added to the `ALLOW` map, with a reason)
- every old Wix URL has a page or redirect
- internal links and `#anchors` resolve
- every `<img>` has `alt`
- each page has exactly one `<h1>`, a unique `<title>` and a meta description
- no words are glued to inline links
- the brand color pairs meet WCAG AA contrast

`scripts/audit-contrast.mjs` checks the colors the browser actually renders. It loads every page at 375 and 1280 px and compares each text element's color with the background painted behind it. Text over a gradient or image with no solid base color is skipped, so give such sections a solid fallback color (`AUDIT_VERBOSE=1` lists the skipped elements).

## Architecture

- **URLs must match the old Wix site exactly.** `astro.config.mjs` uses `build.format: 'file'` and `trailingSlash: 'never'`, so `src/pages/about-our-pta.astro` builds to `/about-our-pta.html` and is served at `/about-our-pta`. Page filenames are those exact slugs (including oddities like `reader-board-request-1`). Retired Wix URLs live in the `redirects` map in the config. `/donationthanks`, `/biggivethanks`, `/readerboard-confirmation` and `/pno-confirmation` are PayPal/Konstella return URLs and must not be renamed.
- **`noindex` pages are listed twice.** Each has `noindex` set on its layout, and the `NOINDEX` list in `astro.config.mjs` also has to include it so the sitemap leaves it out.
- **Content lives in `src/data/`, not in the pages.**
  - `links.ts`: every outside URL (PayPal, Givebacks, Konstella, forms, calendar), plus the `mailto()` helper.
  - `contacts.ts`: people and inboxes. Every PTA address is in the `inbox` map; pages import it rather than typing addresses.
  - `site.ts`: address, bell times, Tax ID, land acknowledgment.
  - `nav.ts`: the grouped menu, used by both the header and the footer.
  - `corporateMatching.ts`, `sponsors.ts`, `announcements.ts`: those lists and the Big Give numbers.

  Pages import from these files. Add new outside URLs to `links.ts` rather than hard-coding them.
- **Date-based content is decided in the browser, in Seattle time.** `src/data/schedule.ts` defines date windows. `scheduled(window)` and `scheduledHref(window, in, out)` add data attributes plus a build-time default to an element, and an inline script in `BaseLayout` re-evaluates them on every page load. So content switches on the right day without a rebuild (the nightly rebuild only refreshes defaults for no-JS visitors). The windows live in `announcements.ts` (`spiritWear.window`, `bigGive.window`) and drive the announcement bar, the home-page cards and hero button, and the Donate link. Use `scheduled(w, { invert: true })` for fallback content shown outside a window. Never compare dates with `new Date()`/`toISOString()` (that's UTC); use `seattleToday()`.
- **`[hidden]` is global `display: none !important`** (in `global.css`), so scheduled and toggled elements hide even when a component sets `display`.
- **Layouts:** `BaseLayout` has the page head and SEO tags, the announcement bar, the header and the footer. `MessageLayout` wraps it into a centered eagle-and-message page, used for the thank-you pages, the directory info pages (both through `DirectoryMoved.astro`) and the 404. Inner pages start with `PageHero`.
- **Styling:** design tokens (the green and gold scales, type and spacing) and shared classes (`.btn`, `.card`, `.section`, `.grid-*`, `.split`, `.steps`, `.check-list`, `.callout`) are in `src/styles/global.css`. Use those before writing page-scoped `<style>`. Cards and buttons are CSS classes, not components. Icons come from `Icon.astro`, a fixed set of inline SVGs; to add one, add a path to its `paths` map.
- **JavaScript is a progressive enhancement.** The desktop dropdowns are `<details>` elements. On hover devices, hovering opens them and a mouse click won't toggle an open one shut (keyboard activation still toggles). The mobile menu's `<noscript>` fallback in `BaseLayout` shows it inline and makes the header non-sticky below 1000px. The only scripts are the header menu, the schedule script, and the corporate-matching search and copy button.
- **Images** go in `src/assets/images/` and are rendered with `astro:assets` `<Image>`. `eagle-logo.png` is the transparent brand eagle, used in the hero, the header, the footer, the favicon and the OG image.
- **The site works at a domain root or in a sub-folder.** `SITE_URL`/`SITE_BASE` env vars set Astro's `site`/`base` (CI gets them from `actions/configure-pages`; locally they default to the real domain at its root). Source code always writes root-relative links (`/about-our-pta`); `integrations/base-path.mjs` prefixes the base into the built HTML after each build, including `data-href-in`/`data-href-out`, meta-refresh redirects and same-site absolute URLs. Code that *compares* the current URL must use `sitePath()` from `src/lib/paths.ts`, and code that builds an absolute URL must use `withBase()`. `verify` and `audit:contrast` read `SITE_BASE` too; `verify` fails on any root-relative link missing the base, and the audit fails if the stylesheet didn't load.
- **`compressHTML: false` is deliberate.** With compression on, Astro removed the whitespace before inline links. Don't turn it back on.

## Content conventions

- Search for `TODO(PTA)` to find content waiting on a PTA decision. Decisions for the PTA board are listed in the README (none open right now; D1–D6 are resolved and recorded there). New ones get the next ID (D7…), are never renumbered, and are marked in code with `TODO(PTA) Dn`. `designs/PLAN.md` §8 has the original D1–D6 list. Don't invent names, dates or addresses to fill those gaps.
- Deployment is GitHub Pages through `.github/workflows/deploy.yml` (the repo is public). The site is **not launched yet**: until the custom domain points at GitHub it's served at `winterfreshx.github.io/AdamsPTAWebsite/`. The domain is registered and its DNS managed at Wix. Cutover steps are in the README.
- The repo lives under `~/Documents`, and iCloud sync has created `* 2.*` duplicate copies of files before. Astro builds duplicate pages as real routes, so stage files explicitly rather than with `git add -A`.
