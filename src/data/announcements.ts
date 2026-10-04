import { links } from './links';

// Time-sensitive items. An announcement disappears automatically after its `expires` date
// (checked at build time and again in the visitor's browser).
export type Announcement = {
  id: string;
  text: string;
  cta: { label: string; href: string };
  starts?: string; // YYYY-MM-DD
  expires: string; // YYYY-MM-DD, last day shown
};

export const announcements: Announcement[] = [
  {
    id: 'spirit-wear-2026',
    text: 'Eagles Spirit Wear store is open! Orders close October 9.',
    cta: { label: 'Shop now', href: links.spiritWearStore },
    expires: '2026-10-09',
  },
  {
    id: 'big-give-2026',
    text: 'The Big Give is happening October 1–31. Every gift helps!',
    cta: { label: 'Give today', href: '/big-give' },
    starts: '2026-10-01',
    expires: '2026-10-31',
  },
];

// The Big Give campaign numbers. Update `raised` during October to move the progress bars.
export const bigGive = {
  dates: 'October 1–31',
  perChildAsk: 700,
  communityGoal: 100_000,
  corporateGoal: 50_000,
  raised: { community: 0, corporate: 0 }, // TODO(PTA) D6: update weekly during the campaign
};
