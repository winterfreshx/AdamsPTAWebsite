# Adams Elementary PTA — Redesign Plan

Companion docs: [ANALYSIS.md](ANALYSIS.md) (what exists today) · [CHECKLIST.md](CHECKLIST.md) (step-by-step build and verification).

## 1. Goals

1. **Parity:** keep every page, link, button, contact, and transaction flow from the current Wix site (ANALYSIS §4).
2. **Modern look:** a clean, friendly school-spirit design in **Adams green and gold**, with the **Adams Eagle** as the home-page hero.
3. **Mobile first:** works well on a 360 px phone. Tap targets are at least 44 px, there is no horizontal scroll, and the menu fits a thumb.
4. **Easy for volunteers to maintain:** content lives in plain data files (contacts, bell times, corporate-match list, sponsors, announcements),
   so a volunteer can update the site without touching layout code.
5. **Fast, accessible, free to host:** static HTML, WCAG 2.1 AA, Lighthouse ≥ 90 across the board, deployable to GitHub Pages.

## 2. Tech stack

| Concern | Choice | Why |
|---------|--------|-----|
| Framework | **Astro** (static output) | Component-based pages that ship zero JS by default; Markdown/data-file friendly; one-command build |
| Styling | Hand-written CSS with design tokens (CSS custom properties) in `src/styles/global.css` | No utility-class learning curve for volunteers; tokens keep green/gold consistent |
| Fonts | Self-hosted via `@fontsource-variable` — **Bricolage Grotesque** (headings), **Nunito** (body) | Friendly, highly legible, no third-party font requests |
| JS | Small inline scripts only: mobile menu, dropdowns, corporate-match search | Progressive enhancement; the site works with JS off |
| Images | Originals downloaded from Wix into `src/assets/`, optimized with Astro `<Image>` (AVIF/WebP, responsive `srcset`) | Removes the dependency on Wix and adds real alt text |
| Hosting | GitHub Pages via GitHub Actions (`.github/workflows/deploy.yml`) | Free; the repo is already on GitHub. Netlify/Cloudflare Pages work too. |
| Domain | `adamselementarypta.org` moved from Wix to Pages at cutover (`public/CNAME`) | Done by the PTA at launch time, not during the build |

## 3. Design system

### Color tokens (sampled from the eagle logo)

| Token | Hex | Use |
|-------|-----|-----|
| `--green-900` | `#0B3D27` | Footer background, darkest text on gold |
| `--green-700` | `#105838` | **Primary brand**: header, headings, primary buttons |
| `--green-500` | `#1F7A4D` | Hover states, accents |
| `--green-100` | `#E6F2EA` | Tinted section backgrounds, cards |
| `--gold-500` | `#E4A83C` | **Accent**: CTA buttons (with green-900 text), highlights, eagle talons |
| `--gold-300` | `#F5CD6E` | Underlines, badges |
| `--gold-100` | `#FDF4DC` | Announcement banners, soft backgrounds |
| `--ink` | `#14231B` | Body text |
| `--paper` | `#FFFDF7` | Page background (warm white) |

Contrast rules: white on green-700 = 8.4:1 ✔. green-900 on gold-500 = 5.8:1 ✔. **Never** put gold text on white.

### Type scale
`clamp()`-based fluid sizes: h1 2.25→3.75 rem, h2 1.75→2.5 rem, h3 1.25→1.5 rem, body 1.0625 rem / 1.65 line height.

### Components
- **SiteHeader:** eagle mark + "Adams Elementary PTA" wordmark, grouped nav with dropdowns, gold "Donate" CTA; it collapses to a hamburger drawer under 900 px.
- **Hero (home):** a green gradient with a subtle feather/wave pattern, the large green eagle logo on a soft gold "sun" disc, headline, tagline
  *"We take care of each other"*, and two CTAs (Join the PTA / Give to the Big Give).
- **AnnouncementBar:** a gold strip for time-sensitive items, each with an expiry date so it hides itself automatically.
- **PageHero:** a compact green banner with the title, a one-line intro, and an optional eyebrow label.
- **Card / ActionCard:** icon + title + text + link; used for the quick actions grid.
- **Button:** `primary` (green), `accent` (gold), `ghost`; 44 px minimum height.
- **InfoList / ContactCard / PriceCard / Steps / Timeline / LogoWall / FilterableList**.
- **SiteFooter:** bell times, contact and address, social links, land acknowledgment, Ms. Timmi memorial, Tax ID.

### Motion & polish
Subtle hover lifts on cards, a focus-visible ring in gold, and `prefers-reduced-motion` turns animation off.
The hero eagle gets a gentle entrance fade.

## 4. Project structure

```
designs/                  ← this plan, analysis, checklist, crawl data
public/                   favicon, CNAME, robots.txt, og image
src/
  assets/images/          downloaded and renamed site images
  data/                   site.ts (school info, bell times, contacts), nav.ts, corporateMatching.ts,
                          sponsors.ts, announcements.ts, links.ts
  components/             SiteHeader, SiteFooter, Hero, PageHero, Card, Button, …
  layouts/BaseLayout.astro
  pages/                  one .astro per URL (same slugs as Wix)
  styles/global.css
scripts/verify-links.mjs  parity check: every crawled external link exists in dist/
astro.config.mjs
```

## 5. URL map

| Old URL | New behavior |
|---------|--------------|
| `/`, `/about-our-pta`, `/volunteering`, `/pta-membership`, `/fundraising`, `/big-give`, `/reader-board-request-1`, `/pay-for-school-supplies`, `/corporate-matching`, `/moveathon`, `/resources` | Same path, redesigned |
| `/we-appreciate-adams`, `/prospective-families`, `/parent-night-out`, `/communications-app`, `/everyday-giving` | Same path, redesigned, **now linked in the nav** |
| `/donationthanks`, `/biggivethanks`, `/pno-confirmation`, `/readerboard-confirmation` | Same path (PayPal/Konstella return URLs), `noindex` |
| `/keep-connected` | Content merged into `/resources` → redirect |
| `/grade-reps-groups` | Content merged into `/resources#grade-reps` → redirect |
| `/fundraisingold`, `/copy-of-fundraising` | Redirect → `/fundraising` |
| `/biggiveold` | Redirect → `/big-give` |
| `/school-directory`, `/student-directory` | Info page: "The family directory now lives in Konstella" + link (see Open Decision D1) |
| `/we-appreciate-adams-web-list` | Redirect → `/we-appreciate-adams` (the binder was removed; see D1 in the README) |
| anything else | Custom branded 404 |

## 6. Home page wireframe

```
┌──────────────────────────────────────────────────────────┐
│ [gold bar] Spirit Wear store open — order by Oct 9 → Shop │
├──────────────────────────────────────────────────────────┤
│ 🦅 Adams Elementary PTA   About▾ Give▾ Community▾ [Donate]│
├──────────────────────────────────────────────────────────┤
│  GREEN HERO                                              │
│  Go Eagles!                       (  GREEN EAGLE LOGO  ) │
│  We take care of each other.      (   on gold disc     ) │
│  [Join the PTA] [Give to Big Give]                       │
├──────────────────────────────────────────────────────────┤
│ Quick actions (2×3 grid → 1 col on mobile)               │
│  Konstella · PTA Calendar · Volunteer · Membership ·     │
│  After-School Programs · Corporate Matching              │
├──────────────────────────────────────────────────────────┤
│ What's happening: Big Give progress card | Spirit Wear   │
│                   After-school enrollment + scholarship  │
├──────────────────────────────────────────────────────────┤
│ PTA Calendar (embedded Google Calendar, agenda view)     │
├──────────────────────────────────────────────────────────┤
│ Bell times (timeline)   |   Visit Adams (address, phone) │
├──────────────────────────────────────────────────────────┤
│ FOOTER (green-900): contacts · socials · land ack ·      │
│ Ms. Timmi memorial · Tax ID · © Adams PTA                │
└──────────────────────────────────────────────────────────┘
```

Mobile: the hero stacks with the eagle on top, the CTAs go full width, the quick actions become one column, and the calendar
switches to a "Open calendar" button plus a compact embed.

## 7. Content fixes applied during migration

The data bugs from ANALYSIS §5.4 get fixed: mailto mismatches, `.com` → `.org`, SafeLinks unwrapped, the About "Calendar" link
pointed at the Google Calendar, Volunteer FAQ buttons turned into in-page anchors, and page titles cleaned up.
Stale content stays but is flagged with `TODO(PTA)` comments in the data files. See Open Decisions.

## 8. Open decisions for the PTA (does not block the build)

| ID | Decision | Default taken in the build |
|----|----------|----------------------------|
| D1 | Password-protected pages (2024/25 directory, staff appreciation binder). A static host can't do real password protection. | Point to the Konstella directory; the binder goes in a Google Drive file shared with the Adams community; placeholder link + note. |
| D2 | Grade reps for 2026/27 (current site lists 2024 data and mismatched emails) | Show the grade-rep emails from the Resources page with fixed mailtos; `rep2020@` is shown as-is, flagged `TODO(PTA)` |
| D3 | Future Families page names "Principal Sohn" | Reworded to "meet our principal" (no name), flagged for review |
| D4 | Moveathon content is from the May 2026 event | Kept as-is (last year's recap + sponsors), labelled "2026" |
| D5 | Hosting provider and DNS cutover timing | GitHub Pages workflow included; cutover steps documented in README |
| D6 | Big Give fundraising thermometer | Static goal display ($100K + $50K match); live total can be edited in `src/data/announcements.ts` |
