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
npm run audit:contrast  # renders every page in headless Chrome and checks text contrast (needs Google Chrome)
npm run preview    # serve dist/ locally
```

## Updating content (no coding needed)

Most updates are one-line edits in `src/data/`:

| To change… | Edit |
|---|---|
| Announcement bar, and the dates for Spirit Wear and the Big Give. Each date window turns the announcement, the home-page card and the Donate button on and off automatically, in Seattle time, with no rebuild needed. **Update the dates each year.** | `src/data/announcements.ts` |
| Big Give goals and the amount raised so far (moves the progress bars) | `src/data/announcements.ts` → `bigGive` |
| Exec board, every PTA email address, grade reps | `src/data/contacts.ts` |
| Bell times, address, principal, Tax ID, land acknowledgment | `src/data/site.ts` |
| PayPal / Givebacks / Konstella / form / calendar links | `src/data/links.ts` |
| Corporate matching employers (keep them alphabetical) | `src/data/corporateMatching.ts` |
| Moveathon sponsors (logo files go in `src/assets/images/sponsors/`) | `src/data/sponsors.ts` |
| Menu items | `src/data/nav.ts` |

Page text lives in `src/pages/<page-name>.astro`, one file per URL. Search the code for `TODO(PTA)` to find content
that needs a decision or a yearly refresh.

## Deploying

Every push to `main` runs `.github/workflows/deploy.yml`: build → `verify` → `audit:contrast` → deploy to GitHub Pages.
Dated content switches over in visitors' browsers, so it doesn't depend on a rebuild.

> **Current status (October 2026): not launched yet.** The repo is public and GitHub Pages is enabled with
> *Source = GitHub Actions*. Until the custom domain is connected, the site is published at
> **https://winterfreshx.github.io/AdamsPTAWebsite/**, which works as a full preview for the PTA board. Launch means
> pointing `www.adamselementarypta.org` at GitHub Pages (see the launch-day steps below).

**Sub-folder vs. domain root:** the build adapts automatically. CI asks GitHub Pages where the site is served
(`actions/configure-pages`) and passes that to the build as `SITE_URL` and `SITE_BASE`. Before launch that's the
`/AdamsPTAWebsite` sub-folder; after the custom domain is set it's the domain root, with no code change. To build the
sub-folder version locally:

```sh
SITE_URL=https://winterfreshx.github.io SITE_BASE=/AdamsPTAWebsite npm run build
SITE_BASE=/AdamsPTAWebsite npm run verify && SITE_BASE=/AdamsPTAWebsite npm run audit:contrast
```

### Hosting options

Wix can't host this site. Wix only serves sites built in its own editor, so you can't upload your own code to it. The plan
is to **keep the domain at Wix and host the site elsewhere.**

| Option | Cost | Notes |
|--------|------|-------|
| **Netlify** or **Cloudflare Pages** | Free | Gives a preview link for every PR, so the board can review changes before merging. Needs a small config file and connecting the repo in their dashboard. |
| **GitHub Pages** (current setup: the repo is public) | Free | Done: *Settings → Pages → Source* is **GitHub Actions**, and the workflow deploys on every push to `main`. Preview at `winterfreshx.github.io/AdamsPTAWebsite/` until launch. No per-PR previews. |
| Rebuild the design inside Wix's editor | Wix Premium plan | Stays on one platform, but loses this codebase, the automated checks and the faster mobile pages. |

### The domain and Wix (checked October 4, 2026)

| | |
|---|---|
| Domain | `adamselementarypta.org` |
| Bought through | **Wix** (registrar: Tucows, the company Wix uses for domains) |
| DNS managed by | **Wix** (`ns14.wixdns.net`, `ns15.wixdns.net`) |
| Paid through | **August 15, 2028** |
| Email on this domain | **None.** PTA email addresses are `@adamselementary.org`, a *different* domain on Google Workspace. Changing `adamselementarypta.org` does not affect anyone's email. |

Re-check before cutover with `dig NS adamselementarypta.org` and `dig MX adamselementarypta.org`. If an `MX` record
has appeared, someone has set up email on this domain, and it must be preserved.

### Launch day: moving the domain off Wix hosting

1. **Review the site** at https://winterfreshx.github.io/AdamsPTAWebsite/ with the PTA board (or at `….netlify.app` /
   `….pages.dev` if you switch hosts). Resolve the open decisions below.
2. **In Wix, open Domains → `adamselementarypta.org` → Manage DNS records** and point the domain at the new host:
   - **GitHub Pages:** apex `@` → **A** records `185.199.108.153`, `185.199.109.153`, `185.199.110.153`,
     `185.199.111.153`; `www` → **CNAME** → `<github-username>.github.io`. Then in *Settings → Pages*, enter
     `www.adamselementarypta.org` as the custom domain and turn on **Enforce HTTPS**. Then re-run the latest
     deploy workflow: the next build picks up the domain root automatically, and the github.io address starts redirecting to it.
   - **Netlify / Cloudflare Pages:** add `www.adamselementarypta.org` as a custom domain in their dashboard, then copy
     the records it shows into Wix's DNS settings.

   Delete Wix's existing `A` and `www` `CNAME` records for the site, but leave any other records (for example `TXT`
   verification records) alone.
3. **Wait for DNS to update.** This usually takes minutes to a few hours. The new host issues the HTTPS certificate on its own.
4. **Test the PayPal "return to site" pages:** `/donationthanks`, `/biggivethanks`, `/readerboard-confirmation`,
   `/pno-confirmation`. They keep their exact Wix URLs, so the PayPal buttons don't need changes.
5. **Keep the Wix Premium site plan for about a week**, until traffic on the new site looks normal, then cancel it.

### After launch: what stays at Wix

- **The domain stays in the Wix account** and renews on its own yearly domain fee, separate from the Premium site plan.
  Keep auto-renew on, and keep the payment method current, or the domain will lapse.
- **Hosting cost drops to $0** on the free options; the domain renewal becomes the only ongoing cost.
- **Optional:** to leave Wix entirely, transfer the domain to another registrar (such as Cloudflare or Namecheap) from Wix's
  Domains page. Do this after launch, not on the same day, so a DNS problem and a transfer problem can't happen at once.

## Open decisions for the PTA board

| ID | Decision | What the site does now |
|----|----------|------------------------|
| D1 | The 2024/25 directory and the Staff Appreciation Binder were password-protected Wix pages. A static site can't do real password protection. | `/school-directory` points families to the Konstella directory. The binder page explains how to get access. Put the binder in a Google Drive file shared with Adams families and paste its link into `links.staffAppreciationBinder`. |
| D2 | Grade reps for 2026/27. The old site's list was stale and had mismatched email links. | Shows the Classes of 2027–2032 (K–5th grade). Inboxes come from the old Resources page, with the mailto bugs fixed. The Class of 2032 has no known rep inbox, so it points to the exec team for now. Please confirm the list, especially `rep2020@` (probably meant to be `rep2030@`). |
| D3 | Future Families tour dates | Says "January, details coming soon." The outdated principal name was removed. |
| D4 | Moveathon page shows the May 2026 event | Kept as last year's recap with sponsors, to be refreshed for Spring 2027. |
| D5 | When to switch the domain from Wix | Hosting is GitHub Pages (the repo is public and Pages is enabled). The site isn't launched until the domain's DNS points at GitHub. Follow the launch-day steps under [Deploying](#deploying). |
| D6 | Big Give live totals | Goals are shown. Update `bigGive.raised` to show progress bars. |
