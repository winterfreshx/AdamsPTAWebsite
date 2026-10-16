# Codebase cleanup: proposal and decisions (October 2026)

Proposed and approved on October 15, 2026, about two weeks after launch. The aim is to cut repetition and improve
reliability **without changing how the site looks or what it says**. The two intended exceptions are noted in
items 4 and 6.

## Why now

- **A deploy failed on a flaky check.** On October 15 the deploy for PR #18 failed in `npm run audit:contrast`
  (`Cannot read properties of undefined (reading 'webSocketDebuggerUrl')`). The script starts Chrome itself and gives
  up after about 12 seconds, and the GitHub runner was slower than that. A rerun passed. Nothing was wrong with the site.
- **Patterns were being copied page by page.** Over the first two weeks of edits (Big Give supporters, check card,
  Fall Fest, after-school window), several patterns were copied rather than shared.

## How "no unintended change" is proven

Before starting, build the site from `main` and keep that `dist/` as a baseline. After each item, rebuild, run all five
checks (`build`, `verify`, `test:links`, `audit:contrast`, `test:menu`), and compare the new `dist/` with the
baseline. The only differences allowed are the ones listed for that item.

## Phase 1: Reliability

1. **Contrast audit on Playwright.**
   - `scripts/audit-contrast.mjs` drove Chrome by hand: it spawned the browser, polled for `DevToolsActivePort` and
     spoke raw DevTools protocol, about 50 lines in all. Switch it to Playwright, which `test:menu` already uses
     reliably.
   - In `deploy.yml`, install Playwright's browsers before the audit step so both checks can use them.
   - The audit no longer needs a system Google Chrome, so `CHROME_PATH` goes away.
2. **Shared setup for the check scripts.**
   - `verify-links`, `audit-contrast` and `test-menu` each repeated the `dist/` path and `SITE_BASE` parsing.
   - Two of them also each built their own list of pages from `dist/`.
   - Both move into `scripts/lib/`, so there is one page-listing rule.

## Phase 2: Repeated code in pages

3. **`<EmailLink>` component.**
   - About 17 links repeated the address as both the `mailto:` and the link text, e.g.
     `` <a href={`mailto:${inbox.treasurer}`}>{inbox.treasurer}</a> ``.
   - They become `<EmailLink to={…} />`, with an optional subject and optional custom text, built on the existing
     `mailto()` helper.
4. **No hand-added external icons.**
   - 9 buttons added `<Icon name="external" />` by hand, but the external-link middleware already adds that icon.
   - The middleware's version also keeps the icon on the same line as the last word. *Intended difference:* the icon
     markup changes slightly and can no longer wrap onto its own line.
5. **Shared card-icon class.**
   - Four pages each defined `.card :global(.i)` themselves.
   - It becomes one `.card-icon` class in `global.css`. The Big Give "icon beside title" layout becomes a shared
     `.card-head`.
6. **`<LogoGrid>` component.**
   - Moveathon sponsors (`.logos`) and Big Give supporters (`.sponsors`) each built their own logo tiles.
   - One component replaces both. Each item has `name`, `logo` and an optional `url`.
   - *Intended difference (decided):* Moveathon sponsors adopt the Big Give tile style: logo with the name under it,
     and centered rows.

## Phase 3: Tidying

7. **Tokens and unused CSS.**
   - Add a `--green-200` token for the `#bcd9c6` border color, which was written out in several places.
   - Remove the unused `.prose` and `.badge-green` classes.
8. **"Back to home" in `MessageLayout`.**
   - The four thank-you and confirmation pages each ended with the same button.
   - The layout now adds it, with an option to turn it off.
9. **`npm run screenshot`.**
   - A small script that screenshots any page at any width, with the clock optionally set to a date, so scheduled
     content can be previewed ahead of time.
   - It replaces the throwaway screenshot scripts written during reviews.

## Considered and not done

- **A `SectionHead` component for the ~20 "eyebrow + heading" blocks.** They vary (centered or not, with or without
  intro text), so a component would need many options for little gain.
- **Removing the duplicate date-window logic.** It lives in both `schedule.ts` and BaseLayout's inline script. The
  inline script has to stand alone, because it runs in the browser with no build step.
- **Editing the historical design docs** (`ANALYSIS.md`, `PLAN.md`, `CHECKLIST.md`). They record the original plan.

## Decisions

- **All three phases approved**, to be done in parallel.
- **Item 6:** the Moveathon sponsors adopt the newer tile style. This was the recommended option, and it's easy to
  revert.
- **Delivery:** the phases touch overlapping files (`global.css`, `big-give.astro`, the README), so each phase is
  built on its own branch. They are then combined on one `codebase-cleanup` branch, with one commit per phase. The
  combined result passes all five checks and the baseline comparison before the PR opens.

## Code review follow-ups (October 15, 2026)

A `/code-review high` of the combined PR (#19) found nine issues. Eight were fixed in the same PR:

- **The contrast audit no longer waits for the full load event.** That would have made a slow third-party embed (the
  home page's Google Calendar iframe) fail the deploy. It now waits for the site's own stylesheets and fonts. The two
  widths also run in parallel.
- **Long one-word external-link labels are handled in the middleware, not page by page.** Only the last 4 characters of
  a last word over 12 characters are bound to the icon. So "smithbrothersfarms.com" can break on a 320px phone, and the
  icon still never sits alone on a line. That replaced a page-only rule in `everyday-giving.astro`.
- **No page markup calls `mailto()` directly any more.** The reader board pages, the footer and the Resources contact
  and grade-rep lists use `<EmailLink>`. The reader board request email's subject and template are defined once, as
  `readerboardRequest` in `links.ts`. `mailto()` remains for data that needs an href string, such as the membership
  card list.
- **The 404 and directory pages put their buttons in `MessageLayout`'s `actions` slot**, so every message page builds
  its button row the same way.
- **`npm run screenshot` rejects bad input instead of guessing.** It no longer accepts `--date` values outside the
  documented forms (they would be read in the machine's time zone) or impossible dates. It errors on an option that is
  missing its value, instead of taking the next option as the value.
- **Comments in `serve-dist.mjs` and CLAUDE.md** now mention that `screenshot.mjs` also uses the shared helpers.

**Not changed (decided): logo image size.** The review suggested a per-page image size for `<LogoGrid>`, so the 12
Moveathon logos would be smaller downloads. Decision: every logo grid keeps the Big Give style, including its
320px-wide logo images, so the Moveathon and Big Give grids stay identical.
