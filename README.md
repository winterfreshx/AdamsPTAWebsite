# Adams Elementary PTA Website

The website for the [Adams Elementary School PTA](https://www.adamselementarypta.org) (Ballard, Seattle), live at
https://www.adamselementarypta.org since October 4, 2026, when it replaced the old Wix site. It's a fast static site in Adams
green and gold, built mobile-first with [Astro](https://astro.build).

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
npm run test:links # unit tests for the external-link (new tab + icon) rule
npm run test:menu  # tests the menu on iPhone (WebKit), Android and desktop (Chromium); first run: npx playwright install chromium webkit
npm run preview    # serve dist/ locally
```

## Updating content (no coding needed)

Most updates are one-line edits in `src/data/`:

| To change… | Edit |
|---|---|
| Announcement bar, and the dates for Spirit Wear and the Big Give. Each date window turns the announcement, the home-page card and the Donate button on and off automatically, in Seattle time, with no rebuild needed. **Update the dates each year.** | `src/data/announcements.ts` |
| **Big Give amount raised:** change the one number `bigGive.raised` (for example `raised: 9_492.47,`). The home page card and the Big Give page both update from it. The community `goal` and `corporateMatchGoal` are next to it. | `src/data/announcements.ts` → `bigGive` |
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

**The site is live at https://www.adamselementarypta.org** (launched October 4, 2026), hosted on GitHub Pages.

Every push to `main` runs `.github/workflows/deploy.yml`: build → `verify` → `test:links` → `audit:contrast` →
`test:menu` → deploy. A failing check stops the deploy, so the live site keeps its last good version. Dated content
(announcements, the Big Give card, the Donate button) switches over in visitors' browsers, so it doesn't depend on a rebuild.

### How it's hosted

| | |
|---|---|
| Host | **GitHub Pages**. The repo is public; *Settings → Pages → Source* = **GitHub Actions** |
| Custom domain | `www.adamselementarypta.org`, with **Enforce HTTPS** on (certificate covers `www` and the bare domain) |
| Redirects | `http://…`, `adamselementarypta.org` (without `www`) and the old preview `winterfreshx.github.io/AdamsPTAWebsite/…` all redirect (301) to `https://www.adamselementarypta.org/…` |
| Cost | Free. The only ongoing cost is the domain renewal at Wix. |

### The domain and its DNS (at Wix)

The domain was bought through Wix (registrar: Tucows) and its DNS stays at Wix (`ns14.wixdns.net`, `ns15.wixdns.net`).
It's paid through **August 15, 2028**. It has **no email**: PTA email addresses are `@adamselementary.org`, a different
domain on Google Workspace.

Records set in **Wix → Domains → `adamselementarypta.org` → ⋯ → Manage DNS Records**:

| Type | Host | Value | Purpose |
|------|------|-------|---------|
| A | `@` | `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153` | GitHub Pages |
| CNAME | `www` | `winterfreshx.github.io` | GitHub Pages |
| TXT | `_github-pages-challenge-winterfreshx` | (value from GitHub) | Verifies the domain in GitHub, so no one else's GitHub site can claim it |

Check them any time with `dig A adamselementarypta.org` and `dig CNAME www.adamselementarypta.org`.

**Rollback** (if ever needed): set the A records back to Wix's `185.230.63.107`, `185.230.63.171`, `185.230.63.186`
and `www` back to `cdn1.wixdns.net`, reconnect the domain to the Wix site in Wix, and clear the custom domain in GitHub
*Settings → Pages*. That only works while the Wix Premium plan is still active.

**Domain root vs. sub-folder:** the build adapts on its own. CI asks GitHub Pages where the site is served
(`actions/configure-pages`) and passes that as `SITE_URL`/`SITE_BASE`. With the custom domain that's the domain root.
If the domain were ever disconnected, GitHub would serve the site under `/AdamsPTAWebsite/` on `winterfreshx.github.io`,
and the next deploy would build for that sub-folder with no code change. To test that variant locally:

```sh
SITE_URL=https://winterfreshx.github.io SITE_BASE=/AdamsPTAWebsite npm run build
SITE_BASE=/AdamsPTAWebsite npm run verify && SITE_BASE=/AdamsPTAWebsite npm run audit:contrast
```

**Housekeeping notes:**
- The `CNAME` file in the repo root was created by GitHub when the custom domain was saved. It duplicates
  `public/CNAME`, which is what the build uses. Either can stay.
- Saving the custom domain once triggered GitHub's built-in "pages-build-deployment" (Jekyll) run, which failed. That's
  expected for an Astro site and harmless, because Pages deploys from our workflow.

### After launch: remaining to-dos

- [ ] **Cancel the Wix Premium site plan** about a week after launch (around October 11, 2026). Keep the **domain** in
      the Wix account with **auto-renew on** and a current payment method, or it will lapse.
- [ ] Confirm the `rep2030@adamselementary.org` and `rep2032@adamselementary.org` grade-rep inboxes exist in Google
      Workspace. They were added to match their class years and weren't on the old site.
- [ ] Make one real PayPal donation (any amount) and check that it returns to `/donationthanks` on the new site.

### Optional: transferring the domain away from Wix

Not required, since the site works with DNS at Wix. If you do, transfer **after** the site has been stable for a while,
and set up DNS at the new provider **before** the transfer, so the site never goes down:

1. Pick a registrar (Cloudflare is at-cost and requires its DNS; Namecheap and Porkbun also work). Add the domain there and
   recreate the DNS records in the table above. On Cloudflare, set them to "DNS only" (grey cloud).
2. In Wix, change the domain's nameservers to the new provider's, and wait until the site loads normally.
3. In Wix, turn off the transfer (registrar) lock, turn off DNSSEC if on, and request the authorization (EPP) code. It's
   emailed to the domain owner. Don't change the owner's contact details first, which can trigger a 60-day lock.
4. Start the transfer at the new registrar with the code, pay (usually adds a year), and approve the confirmation emails.
   It takes up to about 5–7 days.
5. Turn on auto-renew at the new registrar, then remove the domain from Wix.

## Decisions for the PTA board

**None open right now.** For the record, here is how the original decisions (D1–D6) were settled:

| ID | Decision | Outcome |
|----|----------|---------|
| D1 | Password-protected Wix pages (old directory, Staff Appreciation Binder) | The directory is the current school year's directory on Konstella. The binder was removed: nobody had the password, and a static site can't password-protect a page. Its old URL redirects to Staff Appreciation. |
| D2 | Grade-rep inboxes | Each class uses `rep<class year>@adamselementary.org`. |
| D3 | Future Families tour dates | Added to the page when they're announced. |
| D4 | Moveathon page | Shows the most recent event until the next one is ready. |
| D5 | Hosting | GitHub Pages with DNS at Wix. Launched at `www.adamselementarypta.org` on October 4, 2026. |
| D6 | Big Give totals | Kept up to date in `src/data/announcements.ts` → `bigGive.raised`. |

New decisions can be added here with the next ID (D7…), and marked in the code with a `TODO(PTA) Dn` comment.
