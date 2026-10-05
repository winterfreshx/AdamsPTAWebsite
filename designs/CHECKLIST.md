# Adams PTA Redesign — Build & Verification Checklist

Work through the phases in order. Check a box only after its **Verify** step passes.
Plan: [PLAN.md](PLAN.md) · Analysis: [ANALYSIS.md](ANALYSIS.md)

Legend: `[ ]` to do · `[x]` done and verified · `[~]` done with a caveat (see note)

---

## Phase 0 — Discovery & planning
- [x] 0.1 Crawl every page on adamselementarypta.org (nav + sitemap + in-page links)
  - Verify: `designs/crawl/` has one extract per URL (28 files) plus `external-links.txt`
- [x] 0.2 Write the site analysis (inventory, features, assets, problems) → `designs/ANALYSIS.md`
- [x] 0.3 Write the redesign plan (stack, tokens, IA, URL map, wireframe) → `designs/PLAN.md`
- [x] 0.4 Write this checklist → `designs/CHECKLIST.md`

## Phase 1 — Project scaffold
- [x] 1.1 `package.json` with Astro, fontsource fonts, and `dev` / `build` / `preview` / `verify` scripts
- [x] 1.2 `astro.config.mjs`: static output, `site` = https://www.adamselementarypta.org, redirects from PLAN §5
- [x] 1.3 `.gitignore` (node_modules, dist, .astro)
- [x] 1.4 `npm install` succeeds
  - Verify: `npm run build` produces `dist/index.html` with no errors

## Phase 2 — Assets
- [x] 2.1 Download original-resolution images from Wix into `src/assets/images/` with descriptive names
- [x] 2.2 Green Adams Eagle logo present (`eagle-logo.png`) and trimmed of excess whitespace
- [x] 2.3 Favicon (eagle) at `public/favicon.png` + `apple-touch-icon.png`; social share image `public/og-image.png`
- [x] 2.4 Oversized originals (5–7k px murals) resized to ≤ 2400 px before committing
  - Verify: `du -sh src/assets` is under 15 MB; every image opens

## Phase 3 — Design system
- [x] 3.1 `global.css` color tokens (green-900/700/500/100, gold-500/300/100, ink, paper) exactly as in PLAN §3
- [x] 3.2 Fluid type scale, spacing scale, radius and shadow tokens
- [x] 3.3 Base element styles (links, headings, lists, tables), `.container`, `.section`, `.grid` utilities
- [x] 3.4 Button variants: primary / accent / ghost, 44 px minimum height, gold focus-visible ring
- [x] 3.5 `prefers-reduced-motion` disables animation
  - Verify: contrast pairs are AA (white/green-700, green-900/gold-500, ink/paper), checked with the script in Phase 9

## Phase 4 — Shared data (content kept out of layout code)
- [x] 4.1 `src/data/site.ts`: school name, address, phone, principal, bell times, Tax ID, land acknowledgment, socials, memorial
- [x] 4.2 `src/data/contacts.ts`: exec board (4 officers), PTA role emails, grade-rep emails (mailto bugs fixed)
- [x] 4.3 `src/data/nav.ts`: grouped navigation (About / Give / Community) + Donate CTA
- [x] 4.4 `src/data/corporateMatching.ts`: all **50** employers (47 with portal links; Kaiser, PEMCO and Sanmar are "Ask HR") with portal URLs and notes ("ask HR", "hours only")
- [x] 4.5 `src/data/sponsors.ts`: 12 Moveathon sponsors with logos (the 13th Wix image was the T-shirt design)
- [x] 4.6 `src/data/announcements.ts`: Spirit Wear (expires 2026-10-09), Big Give (Oct 1–31, goals)
- [x] 4.7 `src/data/links.ts`: every external service URL (PayPal ×4, Givebacks ×2, Google Forms ×2, Konstella ×5, calendar, Constant Contact ×2, …)
  - Verify: `grep -c` of entries matches the counts above

## Phase 5 — Layout & global components
- [x] 5.1 `BaseLayout.astro`: `<html lang="en">`, meta description, canonical, Open Graph, favicon, skip link, `noindex` option
- [x] 5.2 `SiteHeader`: eagle + wordmark, desktop dropdowns (hover + keyboard + click), mobile drawer under 900 px, `aria-expanded`, Esc closes
- [x] 5.3 `AnnouncementBar`: shows only unexpired announcements
- [x] 5.4 `SiteFooter`: bell times, contact, address, phone, principal, socials, land acknowledgment, Ms. Timmi memorial, Tax ID
- [~] 5.5 `PageHero`, `Card`, `ActionCard`, `Button`, `Icon` components. Note: PageHero, ActionCard and Icon are components; Card and Button are CSS classes (`.card`, `.btn`) in `global.css`, which are simpler for volunteers to reuse. `MessageLayout` was added for the thank-you, stub and 404 pages.
  - Verify: header and footer render on every built page; the menu works at 360 px with JS on, and links stay reachable with JS off

## Phase 6 — Home page (`/`)
- [x] 6.1 Hero with the **green Adams Eagle** on a gold disc, "Go Eagles!" headline, "We take care of each other", 2 CTAs
- [x] 6.2 Quick-action grid: Konstella, PTA Calendar, Volunteer, Membership, After-School Programs, Corporate Matching
- [x] 6.3 "What's happening" cards: Spirit Wear (CustomInk, Oct 9), Big Give (goal), After-school enrollment (Homeroom + scholarship form)
- [x] 6.4 Embedded PTA Google Calendar (agenda view, lazy-loaded) + "Subscribe" link
- [x] 6.5 Bell times timeline + Visit Adams card
  - Verify: every link from the old home page is present (`npm run verify`)

## Phase 7 — Content pages (same URLs as Wix)
- [x] 7.1 `/about-our-pta`: who / what / why (SCPTSA, WSPTA, National PTA links), exec board cards with mailtos, "How to get involved" ×3, mural gallery
- [x] 7.2 `/volunteering`: FAQ jump-links that work, SPS registration steps, SPS portal, Ms. Patti contact, most-needed roles, Konstella committees, both Google Docs, limited-time list
- [x] 7.3 `/pta-membership`: 3 price cards (Single $16, Dual $27 → Givebacks; Scholarship $0 → mailto), Givebacks explainer
- [x] 7.4 `/fundraising`: quick links (Readerboard, Donate PayPal), annual fundraisers (Big Give, Moveathon), what funds support, corporate-match CTA, everyday giving link
- [x] 7.5 `/big-give`: Donate Now (PayPal), dates, $700/child ask, goals ($100K + $50K) as a visual, corporate-match nudge
- [x] 7.6 `/reader-board-request-1`: $25 rental explainer, prefilled mailto (name/date/message template), PayPal $25 button, photo
- [x] 7.7 `/pay-for-school-supplies`: explainer, Contribute Now (PayPal), scholarship form
- [x] 7.8 `/corporate-matching`: 3 steps, Tax ID with copy button, **searchable** list of 50 employers (A–Z), treasurer contact
- [x] 7.9 `/moveathon`: Pledge (99pledges) + Volunteer (Konstella), T-shirt winner, description, schedule table, 12 sponsor logos
- [x] 7.10 `/resources`: quick buttons, contacts grid, grade reps (`#grade-reps`), newsletter sign-ups, communications, enrichment, child care, SPS links, PTA orgs, middle schools, Facebook/Instagram, Special Ed PTSA, National PTA (merges `/keep-connected` + `/grade-reps-groups`)
- [x] 7.11 `/we-appreciate-adams`: explainer, binder link, call for leads, contribution contact
- [x] 7.12 `/prospective-families`: tours (January), address (enter on 62nd St), description
- [x] 7.13 `/parent-night-out`: description, Konstella PNO sales link, "stay tuned"
- [x] 7.14 `/communications-app`: Konstella explainer + join link
- [x] 7.15 `/everyday-giving`: donate directly, Box Tops, Fred Meyer (91334), Smith Brothers (ADAMSPTA, SafeLinks unwrapped)
  - Verify: each page builds, has a unique `<title>` and meta description, and exactly one `<h1>`

## Phase 8 — Transactional, legacy & error pages
- [x] 8.1 `/donationthanks`, `/biggivethanks`, `/pno-confirmation`, `/readerboard-confirmation` (`.org` fixed), all `noindex`
- [x] 8.2 `/school-directory`, `/student-directory`, `/we-appreciate-adams-web-list` info pages (D1), `noindex`
- [x] 8.3 Redirects: `/keep-connected`, `/grade-reps-groups`, `/fundraisingold`, `/copy-of-fundraising`, `/biggiveold`
- [x] 8.4 Branded `404.astro` with the eagle and links home
  - Verify: `dist/` contains every path from PLAN §5

## Phase 9 — Verification
- [x] 9.1 `scripts/verify-links.mjs`: every live external link and mailto from the crawl appears in `dist/` (legacy-only and intentionally fixed links are allow-listed with a reason)
- [x] 9.2 Every crawled page path resolves in `dist/` (page or redirect)
- [x] 9.3 No broken internal links (every `href="/…"` in dist resolves)
- [x] 9.4 Every `<img>` has non-empty `alt` (decorative images use `alt=""` + `aria-hidden` on purpose)
- [x] 9.5 Color-contrast check of token pairs is ≥ 4.5:1
- [x] 9.6 Visual QA screenshots at 375 px (mobile), 768 px (tablet), 1280 px (desktop) for home + 3 inner pages; no horizontal scroll
- [x] 9.7 Mobile menu: opens and closes, focus moves sensibly, Esc closes, body doesn't scroll behind it
- [x] 9.8 External links open safely (`rel="noopener"` on any `target="_blank"`; links open in the same tab by default)

## Phase 10 — Deploy readiness
- [x] 10.1 `.github/workflows/deploy.yml` (build + deploy to GitHub Pages on push to `main`)
- [x] 10.2 `public/CNAME` = `www.adamselementarypta.org` and `public/robots.txt` + sitemap (`@astrojs/sitemap`)
- [x] 10.3 README: how to run locally, how to edit content (data files), how to deploy, DNS cutover steps from Wix
- [x] 10.4 Open decisions D1–D6 recorded in README for the PTA board

## Phase 11 — Launch (PTA-owned, after review)
- [ ] 11.1 PTA board reviews the preview URL
- [ ] 11.2 Resolve open decision D1 (D2–D6 are resolved)
- [ ] 11.3 Confirm PayPal return URLs still land on the thank-you pages
- [ ] 11.4 Point DNS to GitHub Pages; enable HTTPS
- [ ] 11.5 Cancel the Wix plan only after a week of stable traffic on the new site

---

## Verification log — 2026-10-04

| Check | Result |
|-------|--------|
| `npm run build` | ✅ 24 pages + 5 redirects, no errors |
| `npm run verify` 9.1 link parity | ✅ 119/131 crawled links carried over. The 12 dropped are all allow-listed with a reason: retired `*old` pages, graduated classes' groups and emails, the SafeLinks wrapper, and the `.com` typo |
| 9.2 Wix URLs | ✅ all 28 crawled paths resolve |
| 9.3 Internal links + anchors | ✅ 25 unique internal links resolve, including `#calendar` and `#grade-reps` |
| 9.4 Image alt | ✅ 115 images (decorative ones use an empty `alt`) |
| 7.x Page quality | ✅ exactly one `<h1>`, a unique title and a meta description on all 24 pages; no words glued to links |
| 9.5 Contrast | ✅ all 9 token pairs ≥ 5.3:1 (green-900 on gold-500 is 5.82:1) |
| 9.6 Visual QA | ✅ 19 pages × 360/768/1280 px = 57 combinations, **0** with horizontal scroll (headless Chrome via DevTools protocol) |
| 9.7 Mobile menu | ✅ opens, `aria-expanded` set, focus moves into the menu, page scroll locked, sits below the header, Esc closes and returns focus to the toggle |
| Desktop dropdowns | ✅ open on click/hover, only one open at a time, Esc closes |
| JS disabled (375 px) | ✅ full nav renders inline, dead menu toggle hidden, every page reachable |
| Corporate matching search | ✅ 50 employers; "micro" → Microsoft; no-match message shown |

### Issues found and fixed during verification
- The mobile header overflowed at 375 px (the menu button was clipped). Fixed by tightening the brand, button, and gap sizes under 440 px.
- Two stacked announcements took about 190 px on phones. They're now a compact single line per item.
- Astro's `compressHTML` glued words to inline links ("theSeattle Council PTSA"). Turned it off and added a regression check to `verify`.
- The quick-action grid made four cramped columns on desktop. The grid minimum is now 18rem, giving a clean 3×2.
- The first link check had dropped the Class of 2027/2028/2029 Facebook groups. Those students are still at Adams, so the groups were restored on the grade-rep cards.

### Still open (Phase 11, owned by the PTA)
Board review, decisions D1–D6 (see README), the PayPal return-URL test, DNS cutover, and cancelling Wix.

---

## Code review fixes (PR #1, `/code-review high`): 2026-10-04

- [x] R1 Seasonal home-page content (Spirit Wear card, Big Give card, hero Big Give button) now follows the campaign date windows, with a year-round "Support Adams" card and a "Ways to give" button outside the Big Give
- [x] R2 Dates are re-checked in the visitor's browser (`src/data/schedule.ts` + the inline script in `BaseLayout`), so the announcements, cards and Donate link no longer depend on a nightly rebuild
- [x] R3 No-JS mobile: the header is no longer sticky, so the inline menu doesn't cover the page while scrolling
- [x] R4 Corporate-matching letter headings changed from gold (2.11:1) to green-700 with a gold underline
- [x] R5 Desktop dropdown: a mouse click after hovering keeps it open; keyboard Enter still toggles it
- [x] R6 Grade reps show the Classes of 2027–2032 with grade labels; the Class of 2032 falls back to the exec team; the graduated Class of 2026 was removed
- [x] R7 All dates are Seattle dates (`seattleToday()`), not UTC
- [x] R8 `verify-links.mjs` resolves its root with `fileURLToPath`, so a path with spaces works
- [x] R9 Resources no longer labels the current directory "2025/26"
- [x] R10 Every PTA inbox comes from the `inbox` map in `contacts.ts`; the two directory pages share `DirectoryMoved.astro`
- [x] R11 New `npm run audit:contrast` checks the colors the browser renders, at 375 and 1280 px, and now runs in CI. It was confirmed to catch the R4 regression (fails at 2.11:1) before the fix was restored

| Check | Result |
|-------|--------|
| `npm run verify` | ✅ all checks pass |
| `npm run audit:contrast` | ✅ 4,438 text elements across 24 pages × 2 widths, 0 failures, 0 skipped |
| Schedule tests with a faked clock (Oct 4, Oct 9 at 11:30pm Seattle, Oct 10, Nov 15, Sep 20, Oct 2027) | ✅ the bar, cards, hero button and Donate link were correct on every date |
| Dropdown hover + click, keyboard toggle | ✅ |
| No-JS mobile header scrolls away; desktop header still sticky | ✅ |
| Layout regression QA: 13 pages × 360/768/1280 | ✅ no horizontal scroll; menu and search OK |
