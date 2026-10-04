import { links } from './links';
import type { DateWindow } from './schedule';

// Seasonal campaigns. Their date windows drive the announcement bar, the home-page cards,
// the hero button and the Donate button (see schedule.ts). Update the dates each year.

export const spiritWear = {
  window: { expires: '2026-10-09' } satisfies DateWindow,
  orderDeadline: 'October 9, 2026',
};

export const bigGive = {
  window: { starts: '2026-10-01', expires: '2026-10-31' } satisfies DateWindow,
  dates: 'October 1–31',
  perChildAsk: 700,
  communityGoal: 100_000,
  corporateGoal: 50_000,
  raised: { community: 0, corporate: 0 }, // TODO(PTA) D6: update weekly during the campaign
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
