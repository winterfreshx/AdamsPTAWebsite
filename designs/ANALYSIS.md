# Adams Elementary PTA — Current Site Analysis

Crawled **2026-10-04** from https://www.adamselementarypta.org/ (Wix). I discovered pages from the
home page nav, from `sitemap.xml` → `pages-sitemap.xml`, and from links inside every crawled page.
Raw per-page extracts (text, links, images) are in [`crawl/`](crawl/), and every outbound link is in
[`crawl/external-links.txt`](crawl/external-links.txt).

## 1. Page inventory

### 1a. Primary navigation (11 items, overflowing into a "More" menu on desktop)

| # | Path | Title | Purpose / key features |
|---|------|-------|------------------------|
| 1 | `/` | HOME | Spirit Wear announcement (CustomInk store, orders close Oct 9 2026), Register for Konstella, Subscribe to PTA Google Calendar, After-School Enrollment (Homeroom) + scholarship Google Form, "What's happening at Adams" |
| 2 | `/about-our-pta` | About our PTA | Who we are / what we do / why PTA (links SCPTSA, WSPTA, National PTA); 2026/27 Exec Board (4 officers with emails); How to get involved (Volunteer, Attend a Meeting, Attend a Community Event); 4 mural photos |
| 3 | `/volunteering` | Volunteer | 4 FAQ anchor buttons; SPS volunteer registration steps; SPS portal links; Ms. Patti contact; "Most needed roles 26/27"; Konstella committees link; Google Doc of volunteer roles; "limited time" opportunities |
| 4 | `/pta-membership` | PTA Membership | Single $16 / Dual $27 (Givebacks links), Scholarship $0 (mailto); "What is Givebacks?" explainer |
| 5 | `/fundraising` | Fundraising | Quick links (Readerboard, Donate via PayPal); Annual fundraisers (Big Give – Oct, Moveathon – Spring 2027); What our funds support; Corporate match reminder |
| 6 | `/big-give` | Big Give | Donate Now (PayPal donate button); dates 10/1–31; ask of $700/child; goal $100K community + $50K corporate match |
| 7 | `/reader-board-request-1` | Reader Board Request | $25 rental; email name/date/message to readerboard@; PayPal $25 button; photo of readerboard |
| 8 | `/pay-for-school-supplies` | Pay for School Supplies | Explainer; Contribute Now (PayPal); scholarship request Google Form |
| 9 | `/corporate-matching` | Corporate Matching | 3-step instructions; Tax ID 91-0963029; **48 employers** each linking to their matching portal (A–F / G–P / Q–Z columns) |
| 10 | `/moveathon` | Moveathon | Pledge Now (99pledges), Volunteer (Konstella); T-shirt design winner; event description + grade-by-grade schedule; **13 sponsor logos** |
| 11 | `/resources` | Resources | Quick buttons (Konstella, Staff Appreciation, Instagram, 25/26 Directory on Konstella, 24/25 Directory, Adams SPS site); PTA contact emails; grade-rep emails; Tax ID; Communications (SPS calendar, Parent Night Out); Other links (enrichment, child care, SPS resources, PTA orgs, middle schools) |

### 1b. Live pages not in the nav (reachable by link or sitemap)

| Path | Title | Notes |
|------|-------|-------|
| `/we-appreciate-adams` | Staff Appreciation | Linked from Resources. Staff-favorites explainer; link to password-protected binder; call for Staff Appreciation leads |
| `/prospective-families` | Future Families | K / new-student tours (January), address, tour description. **Stale:** mentions "Principal Sohn" (current principal is Anitra Jones) |
| `/parent-night-out` | Parent Night Out | Teacher-hosted Friday 6–9pm drop-off nights; "Stay tuned for dates" |
| `/communications-app` | Join Our App | Konstella explainer |
| `/everyday-giving` | Everyday Ways to Give (titled "…old") | Donate directly, Box Tops app, Fred Meyer code 91334, Smith Brothers code ADAMSPTA. Smith Brothers link is wrapped in an Outlook SafeLinks URL (bug) |
| `/keep-connected` | Resources (titled "RESOURCESold") | Weekly newsletter (Constant Contact opt-in), family directory, grade reps, Facebook, SPS School Beat newsletter, Special Ed PTSA, SCPTSA, National PTA |
| `/grade-reps-groups` | Grade Reps & Groups | **Very stale:** Classes of 2024–2029 with names, emails, Facebook groups; several mailto mismatches |

### 1c. Transaction "thank you" pages (PayPal return URLs — **paths must be preserved**)

| Path | Content |
|------|---------|
| `/donationthanks` | Thanks for your donation + Tax ID + mascot photo |
| `/biggivethanks` | Thanks for Big Give + corporate-match ask + "We take care of each other" eagle art |
| `/pno-confirmation` | PNO sign-up thanks; forward receipt to gskellum@seattleschools.org |
| `/readerboard-confirmation` | Readerboard thanks; **bug:** email shown as `readerboard@adamselementary.com` (should be `.org`) |

### 1d. Password-protected (Wix member/password pages — return an empty shell to crawlers)

`/school-directory` (2024/25 directory), `/student-directory`, `/we-appreciate-adams-web-list` (staff binder).

### 1e. Dead or legacy pages

`/fundraisingold`, `/biggiveold` (old copies), `/copy-of-fundraising` (404 in sitemap).

## 2. Global elements (repeated on every page)

- **Header:** "ADAMS ELEMENTARY SCHOOL PTA" + green eagle logo + 11-item nav ("More" overflow).
- **Footer:** Bell times (7:35 supervision & breakfast, 7:50 first bell, 7:55 instruction, 2:25 end, 1:10 Wednesday early dismissal);
  Contact PTA (mailto execteam@); school address 6110 28th Ave NW, Seattle WA 98107; phone 206-252-1300; Principal Anitra Jones;
  Duwamish land acknowledgment; "Ms. Timmi – Always In Our Hearts" memorial with eagle-head icon.

## 3. Brand assets found

| Asset | Source file | Use in redesign |
|-------|-------------|-----------------|
| **Green Adams Eagle logo** (wings spread, "ADAMS ELEMENTARY", gold beak/talons) — 6912×3456 PNG | `2d212f_d54cfe…png` | Hero centerpiece on home page, header mark, favicon / social card |
| "We take care of each other" Viking-ship eagle (PTA art) | `4eadb3_9c98f4…png` | About page / Big Give thanks |
| Eagle head icon | `4eadb3_3b907c…jpg` (120×93) | Ms. Timmi memorial |
| Eagle mascot costume photo | `360af2_f209a9…jpg` | Donation thanks page, community imagery |
| School mural photos (octopus etc., 4 large JPGs) | `360af2_116e29…`, `…49ee01…`, `…cc2104…`, `…dbfce7…`, `…7588c1…` | About page gallery / section backgrounds |
| Big Give logo + banner | `360af2_4b6c54…png`, `4eadb3_a45e9d…jpg` | Big Give + Fundraising |
| Moveathon art + 13 sponsor logos | `4eadb3_*` | Moveathon page |
| Readerboard photo, school supplies photo, PNO banner, staff appreciation photo, Konstella icon, Box Tops / Fred Meyer / QR | various | Respective pages |

**Colors sampled from the eagle logo:** forest green `#105838` (dominant), gold `#E4A83C` (beak/talons).
These are the anchors for the new green and yellow palette.

## 4. Functionality inventory (what we have to keep)

There is **no server-side functionality.** Every interactive feature is an outbound link:

| Feature | Provider | Where |
|---------|----------|-------|
| Donations | PayPal (4 buttons: general, Big Give, readerboard $25, school supplies) | Fundraising, Big Give, Readerboard, Supplies |
| Membership purchase | WSPTA Givebacks (2 items) | Membership |
| Scholarship requests | mailto + Google Forms (2) | Membership, Supplies, Home |
| Pledges | 99pledges | Moveathon |
| Volunteer sign-up, directory, PNO sales | Konstella | Volunteer, Moveathon, Resources |
| Calendar | Google Calendar (public) | Home |
| Newsletter sign-up | Constant Contact (2 opt-in forms) | Keep Connected |
| Spirit wear | CustomInk | Home |
| After-school enrollment | Homeroom | Home, Resources |
| Corporate matching | 48 employer portals | Corporate Matching |
| Contact | ~20 mailto addresses | Everywhere |

So a **static site** can carry 100% of current functionality. That makes it cheap to host (free on GitHub Pages),
fast, and secure.

## 5. Problems with the current site

1. **Navigation overload:** 11 flat top-level items plus "More"; useful pages (Staff Appreciation, Future Families, Konstella,
   Parent Night Out, Everyday Giving) are orphaned out of the nav.
2. **Mobile:** Wix's mobile layout is fixed-position and cramped; buttons are small, and there are multi-column lists
   (corporate matching) that read poorly on a phone.
3. **Stale content:** Grade reps (Classes 2024–2029), "Principal Sohn", Moveathon (May 15 2026 event), old directories, "…old" page titles.
4. **Data bugs:**
   - Resources: `rep2027@` and `rep2026@` link to `mailto:rep2028@`; `rep2020@` is probably meant to be `rep2030@`.
   - Grade Reps page: `rep2026@` → `mailto:rep2020@`; `rep2028@` → `mailto:rep2022b@`.
   - Readerboard confirmation uses `.com` instead of `.org`.
   - Smith Brothers link is an Outlook SafeLinks wrapper.
   - About page "Calendar" link points to the home page instead of the calendar.
   - Volunteer FAQ buttons all link to the same page and don't scroll anywhere.
   - About page title reads "About **or** PTA".
5. **Performance:** each page is about 750 KB of HTML before images and loads Wix's JS runtime; images have generic alt text (`DSC_0070.JPG`).
6. **Accessibility:** headings are used for styling (an `h4` for body text), the alt text is filenames, and buttons are the same color as their background in places.
7. **Search/SEO:** page titles are inconsistent, and there's no structured data or social share images.

## 6. Proposed information architecture

```
Home
About ▾            About our PTA · Membership · Volunteer · Staff Appreciation · Future Families
Give ▾             Fundraising · Big Give · Moveathon · Corporate Matching · Everyday Giving · School Supplies · Readerboard
Community ▾        Resources & Contacts · Konstella App · Parent Night Out · Calendar
[Donate] (gold CTA button) → Big Give in October, otherwise /fundraising
```

All existing URLs stay the same. Legacy/merged URLs redirect to their new home (see PLAN §5).
