# Adams Elementary PTA Website

The new website for the [Adams Elementary School PTA](https://www.adamselementarypta.org) (Ballard, Seattle), replacing the
old Wix site. It's a fast static site in Adams green and gold, built mobile-first with [Astro](https://astro.build).

- **Design docs:** [`designs/ANALYSIS.md`](designs/ANALYSIS.md) (audit of the old site) ·
  [`designs/PLAN.md`](designs/PLAN.md) (design system, sitemap, URL map) ·
  [`designs/CHECKLIST.md`](designs/CHECKLIST.md) (build and verification checklist)
- **Crawl of the old site:** [`designs/crawl/`](designs/crawl/)

## Run it locally

Requires Node.js 22.12 or newer.

```sh
npm install
npm run dev        # http://localhost:4321 with live reload
npm run build      # production build into dist/
npm run verify     # link-parity, accessibility and quality checks against dist/
npm run preview    # serve dist/ locally
```

## Updating content (no coding needed)

Most updates are one-line edits in `src/data/`:

| To change… | Edit |
|---|---|
| Announcement bar (gold strip at the top). Each item hides itself after its `expires` date. | `src/data/announcements.ts` |
| Big Give dates, goals, and the amount raised so far (moves the progress bars) | `src/data/announcements.ts` → `bigGive` |
| Exec board, PTA inboxes, grade reps | `src/data/contacts.ts` |
| Bell times, address, principal, Tax ID, land acknowledgment | `src/data/site.ts` |
| PayPal / Givebacks / Konstella / form / calendar links | `src/data/links.ts` |
| Corporate matching employers (keep them alphabetical) | `src/data/corporateMatching.ts` |
| Moveathon sponsors (logo files go in `src/assets/images/sponsors/`) | `src/data/sponsors.ts` |
| Menu items | `src/data/nav.ts` |

Page text lives in `src/pages/<page-name>.astro`, one file per URL. Search the code for `TODO(PTA)` to find content
that needs a decision or a yearly refresh.

## Deploying

Every push to `main` builds, verifies, and deploys to GitHub Pages (`.github/workflows/deploy.yml`). The site also
rebuilds nightly so dated announcements expire on schedule.

**One-time setup:** in GitHub → *Settings → Pages*, set **Source** to **GitHub Actions**.

### Moving the domain off Wix (launch day)

1. Review the GitHub Pages preview URL with the PTA board, and resolve the open decisions below.
2. In the DNS settings for `adamselementarypta.org` (at Wix, or wherever the domain is registered):
   - `www` → **CNAME** → `<github-username>.github.io`
   - apex `@` → **A** records `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
3. In GitHub *Settings → Pages*, enter `www.adamselementarypta.org` as the custom domain and turn on **Enforce HTTPS**.
4. Test the PayPal "return to site" pages: `/donationthanks`, `/biggivethanks`, `/readerboard-confirmation`, `/pno-confirmation`.
   They keep their exact Wix URLs, so the PayPal buttons don't need changes.
5. Keep the Wix plan for about a week after launch, then cancel it.

## Open decisions for the PTA board

| ID | Decision | What the site does now |
|----|----------|------------------------|
| D1 | The 2024/25 directory and the Staff Appreciation Binder were password-protected Wix pages. A static site can't do real password protection. | `/school-directory` points families to the Konstella directory. The binder page explains how to get access. Put the binder in a Google Drive file shared with Adams families and paste its link into `links.staffAppreciationBinder`. |
| D2 | Grade reps for 2026/27. The old site's list was stale and had mismatched email links. | Shows the inboxes listed on the old Resources page, with the mailto bugs fixed. Please confirm them, especially `rep2020@` (probably meant to be `rep2030@`), and add the Class of 2032. |
| D3 | Future Families tour dates | Says "January, details coming soon." The outdated principal name was removed. |
| D4 | Moveathon page shows the May 2026 event | Kept as last year's recap with sponsors, to be refreshed for Spring 2027. |
| D5 | Hosting and cutover timing | GitHub Pages workflow is ready. See the steps above. |
| D6 | Big Give live totals | Goals are shown. Update `bigGive.raised` to show progress bars. |
