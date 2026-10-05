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
| The school year shown on directory and exec-board labels. **Update each summer**, and shift the grade-rep grade labels in `contacts.ts` to match. | `src/data/schoolYear.ts` |
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
   `….pages.dev` if you switch hosts). Check [Decisions for the PTA board](#decisions-for-the-pta-board) for anything new
   that's still open.
   Also confirm the `rep2030@adamselementary.org` and `rep2032@adamselementary.org` grade-rep inboxes exist in Google
   Workspace. They were added to match their class years and weren't on the old site.
2. **In Wix, open Domains → `adamselementarypta.org` → Manage DNS records** and point the domain at the new host:
   - **GitHub Pages:** apex `@` → **A** records `185.199.108.153`, `185.199.109.153`, `185.199.110.153`,
     `185.199.111.153`; `www` → **CNAME** → `winterfreshx.github.io`. Then in *Settings → Pages*, enter
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

## Decisions for the PTA board

**None open right now.** For the record, here is how the original decisions (D1–D6) were settled:

| ID | Decision | Outcome |
|----|----------|---------|
| D1 | Password-protected Wix pages (old directory, Staff Appreciation Binder) | The directory is the current school year's directory on Konstella. The binder was removed: nobody had the password, and a static site can't password-protect a page. Its old URL redirects to Staff Appreciation. |
| D2 | Grade-rep inboxes | Each class uses `rep<class year>@adamselementary.org`. |
| D3 | Future Families tour dates | Added to the page when they're announced. |
| D4 | Moveathon page | Shows the most recent event until the next one is ready. |
| D5 | Hosting | GitHub Pages; the domain switch from Wix follows the launch-day steps above. |
| D6 | Big Give totals | Kept up to date in `src/data/announcements.ts` → `bigGive.raised`. |

New decisions can be added here with the next ID (D7…), and marked in the code with a `TODO(PTA) Dn` comment.
