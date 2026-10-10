import { links } from './links';
import type { DateWindow } from './schedule';

// Seasonal campaigns. Their date windows drive the announcement bar, the home-page cards,
// the hero button and the Donate button (see schedule.ts). Update the dates each year.

export const spiritWear = {
  // Shown on the home page card. Update with the store link (links.spiritWearStore) and deadline each season.
  label: '2027 Adams Eagles Spirit Wear',
  window: { expires: '2026-10-09' } satisfies DateWindow,
  orderDeadline: 'October 9, 2026',
};

export const bigGive = {
  window: { starts: '2026-10-01', expires: '2026-10-31' } satisfies DateWindow,
  dates: 'October 1–31',
  perChildAsk: 700,
  // The flyer with the pledge form. Replace the file in public/ each year (same name, so the link keeps working).
  pledgeForm: '/big-give-pledge-form.pdf',
  // The goal we highlight: what we raise from our own community.
  goal: 100_000,
  // Corporate matching on top of the community goal; mentioned as a bonus, not part of the headline goal.
  corporateMatchGoal: 50_000,
  // TODO(PTA): update this ONE number during the campaign. Every page that shows Big Give progress (the home page card
  // and the Big Give page) reads it through the BigGiveProgress component.
  raised: 9_492.47,
};

// Gold announcement bar items. Each is shown only inside its window.
export type Announcement = {
  id: string;
  text: string;
  cta: { label: string; href: string };
  window: DateWindow;
};

export const announcements: Announcement[] = [
  {
    id: 'spirit-wear-2026',
    text: `Eagles Spirit Wear store is open! Orders close ${spiritWear.orderDeadline.replace(/, \d{4}$/, '')}.`,
    cta: { label: 'Shop now', href: links.spiritWearStore },
    window: spiritWear.window,
  },
  {
    id: 'big-give-2026',
    text: `The Big Give is happening ${bigGive.dates}. Every gift helps!`,
    cta: { label: 'Give today', href: '/big-give' },
    window: bigGive.window,
  },
];
