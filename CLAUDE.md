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
npm run test:links # unit tests for the external-link rule (src/lib/external-links.mjs), no browser
npm run test:menu # menu + mobile layout tests in WebKit (iPhone) and Chromium; one-time setup: npx playwright install chromium webkit
npm run preview   # serve dist/ (Astro 7 runs it as a daemon; stop with `npx astro preview stop`)
```

## Verifying changes

Before calling any change done, run all five, in order, and fix every failure:

```sh
npm run build && npm run verify && npm run test:links && npm run audit:contrast && npm run test:menu
```

CI runs the same sequence before every deploy. For a sub-folder build (the GitHub Pages preview), prefix each step with
`SITE_BASE=/AdamsPTAWebsite` (and `SITE_URL=https://winterfreshx.github.io` for the build).

There is no unit-test runner or linter. `scripts/verify-links.mjs` fails if any of these break:
- every outside link and email from the Wix crawl still appears in `dist/` (anything deliberately removed must be added to the `ALLOW` map, with a reason)
- every old Wix URL has a page or redirect
- internal links and `#anchors` resolve
- every `<img>` has `alt`
- each page has exactly one `<h1>`, a unique `<title>` and a meta description
- no words are glued to inline links
- the brand color pairs meet WCAG AA contrast
- every external link opens in a new tab with `rel="noopener"`, shows the external icon, and has "(opens in a new tab)" for screen readers

`scripts/test-menu.mjs` tests the navigation menu in real browser engines, on WebKit iPhone 15 and iPhone SE (320px), Chromium Pixel 7 and Chromium desktop:
- **Mobile menu** (on `/` and `/about-our-pta`, opened from mid-page):
  - the header fits the screen
  - the menu opens and fills the screen from just under the header to the bottom, showing several links rather than one row
  - the header stays pinned and its eagle logo is still on screen (its screenshot pixels match the menu-closed state)
  - opening the menu doesn't move the page, and the last link can be reached by scrolling the menu
  - the close button closes it and unlocks scrolling at the same page position, and the header is still sticky afterwards
  - tapping a link navigates; a same-page link (PTA Calendar → `/#calendar`) closes the menu and scrolls to the section; Escape closes the menu
- **Every page** fits a 320px screen with no sideways scrolling, and no button or flex link splits its text into side-by-side columns.
- **Desktop dropdowns:**
  - click opens one group at a time
  - Escape closes
  - a click after hovering keeps the dropdown open
  - every menu link opens a real page

Run it after **any** change to the header, nav, layout, global CSS or page content, since long text can widen a page at 320px. Two things it guards against:
- **Safari (iPhone) behaves differently from Chrome here.** Desktop Chrome checks alone are not enough, so use WebKit.
- **Playwright's element `tap()`/`click()` scrolls the page first**, which hides scroll bugs. The script taps at screen coordinates instead. Keep it that way.
- **Waits are conditions, never fixed delays** (`waitForFunction`, and `settle()` waits for finite CSS animations, capped at 2s).

The five sections run in parallel, each in its own browser, and the whole suite takes about 5 seconds. `scripts/lib/serve-dist.mjs` is the GitHub-Pages-like static server shared by `test-menu.mjs` and `audit-contrast.mjs`.

`scripts/audit-contrast.mjs` checks the colors the browser actually renders. It loads every page at 375 and 1280 px and compares each text element's color with the background painted behind it. Text over a gradient or image with no solid base color is skipped, so give such sections a solid fallback color (`AUDIT_VERBOSE=1` lists the skipped elements).

## Architecture

- **URLs must match the old Wix site exactly.** `astro.config.mjs` uses `build.format: 'file'` and `trailingSlash: 'never'`, so `src/pages/about-our-pta.astro` builds to `/about-our-pta.html` and is served at `/about-our-pta`. Page filenames are those exact slugs (including oddities like `reader-board-request-1`). Retired Wix URLs live in the `redirects` map in the config. `/donationthanks`, `/biggivethanks`, `/readerboard-confirmation` and `/pno-confirmation` are PayPal/Konstella return URLs and must not be renamed.
- **`noindex` pages are listed twice.** Each has `noindex` set on its layout, and the `NOINDEX` list in `astro.config.mjs` also has to include it so the sitemap leaves it out.
- **Content lives in `src/data/`, not in the pages.**
  - `links.ts`: every outside URL (PayPal, Givebacks, Konstella, forms, calendar), plus the `mailto()` helper.
  - `contacts.ts`: people and inboxes. Every PTA address is in the `inbox` map; pages import it rather than typing addresses.
  - `site.ts`: address, bell times, Tax ID, land acknowledgment.
  - `schoolYear.ts`: the current school year (one import path; directory and exec-board labels and the About description use it).
  - `nav.ts`: the grouped menu, used by both the header and the footer.
  - `corporateMatching.ts`, `sponsors.ts`, `announcements.ts`: those lists and the Big Give numbers.

  Pages import from these files. Add new outside URLs to `links.ts` rather than hard-coding them.
- **Date-based content is decided in the browser, in Seattle time.** `src/data/schedule.ts` defines date windows. `scheduled(window)` and `scheduledHref(window, in, out)` add data attributes plus a build-time default to an element, and an inline script in `BaseLayout` re-evaluates them on every page load. So content switches on the right day without a rebuild (the nightly rebuild only refreshes defaults for no-JS visitors). The windows live in `announcements.ts` (`spiritWear.window`, `bigGive.window`) and drive the announcement bar, the home-page cards and hero button, and the Donate link. Use `scheduled(w, { invert: true })` for fallback content shown outside a window. Never compare dates with `new Date()`/`toISOString()` (that's UTC); use `seattleToday()`.
- **`[hidden]` is global `display: none !important`** (in `global.css`), so scheduled and toggled elements hide even when a component sets `display`.
- **Layouts:** `BaseLayout` has the page head and SEO tags, the announcement bar, the header and the footer. `MessageLayout` wraps it into a centered eagle-and-message page, used for the thank-you pages, the directory info pages (both through `DirectoryMoved.astro`) and the 404. Inner pages start with `PageHero`.
- **Styling:** design tokens (the green and gold scales, type and spacing) and shared classes (`.btn`, `.card`, `.section`, `.grid-*`, `.split`, `.steps`, `.check-list`, `.callout`) are in `src/styles/global.css`. Use those before writing page-scoped `<style>`. Cards and buttons are CSS classes, not components. Icons come from `Icon.astro`, a fixed set of inline SVGs; to add one, add a path to its `paths` map.
- **JavaScript is a progressive enhancement.** The desktop dropdowns are `<details>` elements. On hover devices, hovering opens them and a mouse click won't toggle an open one shut (keyboard activation still toggles). The mobile menu's `<noscript>` fallback in `BaseLayout` shows it inline and makes the header non-sticky below 1000px. The only scripts are the header menu, the schedule script, and the corporate-matching search and copy button.
- **Big Give progress** has one source: `bigGive.raised` in `announcements.ts`, rendered only through `components/BigGiveProgress.astro` (`size="compact"` on the home card, `"feature"` on /big-give). Don't compute or display the raised amount anywhere else. The headline goal is the community `goal`; `corporateMatchGoal` is shown as a secondary note.
- **Money** is formatted with `usd()` from `src/lib/format.ts` (whole dollars without cents, otherwise two decimals).
- **Images** go in `src/assets/images/` and are rendered with `astro:assets` `<Image>`. `eagle-logo.png` is the transparent brand eagle, used in the hero, the header, the footer, the favicon and the OG image.
- **Header and mobile menu rules (learned from an iPhone bug):** never put `backdrop-filter`, `filter` or `transform` on `.site-header`. In Safari they trap the `position: fixed` mobile menu inside the header, which showed one row on iPhone. Put the menu's scroll lock on `<body>` (`body.menu-open`), never on `<html>`. Overflow on `<html>` makes `<body>` its own scroll box and the sticky header stops sticking. Long strings wrap through `overflow-wrap: anywhere` on `body`, so 320px phones don't scroll sideways.
- **External links are handled by middleware.** `src/middleware.ts` runs on every page, both in `npm run dev` and when the static build pre-renders. It applies `markExternalLinks()` from `src/lib/external-links.mjs`:
  - **What every link to another site gets:** `target="_blank"`, plus `noopener noreferrer` added to `rel` (existing rel tokens are kept), and the external-link icon. A trailing arrow is swapped for the icon; otherwise the trailing text becomes one `.ext-label` and its last word + icon are kept together in `.ext-nowrap`, so flex buttons don't split into columns and the icon never wraps alone.
  - **Screen readers:** "(opens in a new tab)" as hidden text, or appended to `aria-label` when the link has one. Icon-only links get the announcement but no visible icon.
  - **Left alone:** script, style, template, textarea and comment regions.
  - **In pages, write plain `<a href="https://…">`** and don't add `target`, `rel` or the icon by hand.
  - **To keep a link in the same tab, add `data-same-tab`** (or an explicit `target` other than `_blank`).
  - **`scheduledHref()` only accepts same-site paths:** the browser swaps its href after render, but the new-tab decision is made at render time.
  - **What checks it:** `verify` check 9.8 uses the same `isExternalHref()`/`siteHosts()` rule and fails on any external link missing a piece. `test:links` covers the edge cases.
  - **Keep it as middleware:** don't move it back into an `astro:build:done` integration. Build hooks never run in the dev server, which is how it was first shipped and why it didn't work locally. (`integrations/base-path.mjs` is build-only on purpose, since the dev server has no base path.)
- **The site works at a domain root or in a sub-folder.** `SITE_URL`/`SITE_BASE` env vars set Astro's `site`/`base` (CI gets them from `actions/configure-pages`; locally they default to the real domain at its root). Source code always writes root-relative links (`/about-our-pta`); `integrations/base-path.mjs` prefixes the base into the built HTML after each build, including `data-href-in`/`data-href-out`, meta-refresh redirects and same-site absolute URLs. Code that *compares* the current URL must use `sitePath()` from `src/lib/paths.ts`, and code that builds an absolute URL must use `withBase()`. `verify` and `audit:contrast` read `SITE_BASE` too; `verify` fails on any root-relative link missing the base, and the audit fails if the stylesheet didn't load.
- **`compressHTML: false` is deliberate.** With compression on, Astro removed the whitespace before inline links. Don't turn it back on.

## Content conventions

- Search for `TODO(PTA)` to find content waiting on a PTA decision. Decisions for the PTA board are listed in the README (none open right now; D1–D6 are resolved and recorded there). New ones get the next ID (D7…), are never renumbered, and are marked in code with `TODO(PTA) Dn`. `designs/PLAN.md` §8 has the original D1–D6 list. Don't invent names, dates or addresses to fill those gaps.
- Deployment is GitHub Pages through `.github/workflows/deploy.yml` (the repo is public). The site is **not launched yet**: until the custom domain points at GitHub it's served at `winterfreshx.github.io/AdamsPTAWebsite/`. The domain is registered and its DNS managed at Wix. Cutover steps are in the README.
- The repo lives under `~/Documents`, and iCloud sync has created `* 2.*` duplicate copies of files before. Astro builds duplicate pages as real routes, so stage files explicitly rather than with `git add -A`.
