# Decisions for the PTA board

Choices about the website that belong to the PTA board rather than to whoever maintains the code.

**None open right now.**

## How to add one

- Give it the next ID (D7, D8, …). IDs are never reused or renumbered, because code comments point at them.
- Add a row to **Open** below with the question and the default the site uses until the board decides.
- Mark the affected code with a `TODO(PTA) Dn` comment, so `grep -rn "TODO(PTA)" src` finds it.
- Once it's decided, move the row to **Resolved** with the outcome, and update or remove the `TODO(PTA) Dn` comments.

## Open

| ID | Decision | Default until decided |
|----|----------|-----------------------|
| – | – | – |

## Resolved

| ID | Decision | Outcome |
|----|----------|---------|
| D1 | Password-protected Wix pages (old directory, Staff Appreciation Binder) | The directory is the current school year's directory on Konstella. The binder was removed: nobody had the password, and a static site can't password-protect a page. Its old URL redirects to Staff Appreciation. |
| D2 | Grade-rep inboxes | Each class uses `rep<class year>@adamselementary.org` (all confirmed to exist, including the new `rep2030@` and `rep2032@`). |
| D3 | Future Families tour dates | Added to the page when they're announced. |
| D4 | Moveathon page | Shows the most recent event until the next one is ready. |
| D5 | Hosting | GitHub Pages with DNS at Wix. Launched at `www.adamselementarypta.org` on October 4, 2026. |
| D6 | Big Give totals | Kept up to date in `src/data/announcements.ts` → `bigGive.raised`. |

The defaults the build originally took for D1–D6, before the board weighed in, are in [`PLAN.md` §8](PLAN.md#8-open-decisions-for-the-pta-does-not-block-the-build).
