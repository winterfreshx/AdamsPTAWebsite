export type NavLink = { label: string; href: string; description?: string };
export type NavGroup = { label: string; items: NavLink[] };

export const nav: NavGroup[] = [
  {
    label: 'About',
    items: [
      { label: 'About Our PTA', href: '/about-our-pta', description: 'Who we are and our exec board' },
      { label: 'PTA Membership', href: '/pta-membership', description: 'Join for $16, or free by scholarship' },
      { label: 'Volunteer', href: '/volunteering', description: 'Big roles, small tasks, SPS sign-up' },
      { label: 'Staff Appreciation', href: '/we-appreciate-adams', description: 'Celebrate our teachers & staff' },
      { label: 'Future Families', href: '/prospective-families', description: 'Kindergarten & new-student tours' },
    ],
  },
  {
    label: 'Give',
    items: [
      { label: 'Fundraising', href: '/fundraising', description: 'Where every dollar goes' },
      { label: 'The Big Give', href: '/big-give', description: 'Our October giving campaign' },
      { label: 'Moveathon', href: '/moveathon', description: 'Our spring FUNraiser' },
      { label: 'Corporate Matching', href: '/corporate-matching', description: 'Double your gift' },
      { label: 'Everyday Giving', href: '/everyday-giving', description: 'Box Tops, Fred Meyer & more' },
      { label: 'Pay for School Supplies', href: '/pay-for-school-supplies', description: 'Chip in for class supplies' },
      { label: 'Readerboard Request', href: '/reader-board-request-1', description: 'Put your message on the sign' },
    ],
  },
  {
    label: 'Community',
    items: [
      { label: 'Resources & Contacts', href: '/resources', description: 'Links, inboxes, grade reps' },
      { label: 'Konstella App', href: '/communications-app', description: 'Our parent communication app' },
      { label: 'Parent Night Out', href: '/parent-night-out', description: 'Friday fun nights at Adams' },
      { label: 'PTA Calendar', href: '/#calendar', description: 'Meetings & events' },
    ],
  },
];

// During the Big Give (October) the Donate button goes to the campaign page; otherwise to Fundraising.
const isBigGiveMonth = new Date().getMonth() === 9;
export const donateCta = { label: 'Donate', href: isBigGiveMonth ? '/big-give' : '/fundraising' };
