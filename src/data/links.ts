// Every outside service the PTA site sends people to. Update URLs here, not in page files.
// Source of truth for the original values: designs/crawl/external-links.txt

export const links = {
  // Payments & donations (PayPal)
  donateGeneral: 'https://www.paypal.com/ncp/payment/QYDR6FYHY4JVN',
  donateBigGive: 'https://www.paypal.com/donate/?hosted_button_id=GNY69QWZAVD5Q',
  donateReaderboard: 'https://www.paypal.com/ncp/payment/4DFUHBRV6Z3S8',
  donateSchoolSupplies: 'https://www.paypal.com/ncp/payment/LES4ZE7H7K6UE',

  // Membership (WSPTA Givebacks)
  membershipSingle: 'https://wspta-00023237.givebacks.com/shop/items/1090196',
  membershipDual: 'https://wspta-00023237.givebacks.com/shop/items/1090197',

  // Scholarship request forms
  afterSchoolScholarshipForm: 'https://forms.gle/z398EwrjjG6nU5oq7',
  suppliesScholarshipForm: 'https://forms.gle/oJHzQ9NpMJ38TgGTA',

  // Konstella
  konstella: 'https://www.konstella.com/',
  konstellaCommittees:
    'https://www.konstella.com/school/Adams%20Elementary%20School/6670c0d91b5c044b1b121cb5/committees.html',
  konstellaDirectory:
    'https://www.konstella.com/school/Adams%20Elementary%20School/6670c0d91b5c044b1b121cb5/directory.html',
  konstellaMoveathonVolunteer: 'https://www.konstella.com/cd/hEGZYD',
  konstellaParentNightOut: 'https://www.konstella.com/open/sales/68d2fecef6ba6d526036b1c2',

  // Calendar
  ptaCalendar:
    'https://calendar.google.com/calendar/embed?src=c_vjcl8gafpnfhrebap4vtg458vg%40group.calendar.google.com&ctz=America%2FLos_Angeles',
  ptaCalendarEmbed:
    'https://calendar.google.com/calendar/embed?src=c_vjcl8gafpnfhrebap4vtg458vg%40group.calendar.google.com&ctz=America%2FLos_Angeles&mode=AGENDA&showTitle=0&showPrint=0&showTabs=1&showCalendars=0&bgcolor=%23ffffff',
  spsCalendar: 'https://www.seattleschools.org/news/school-calendar/',

  // Fundraisers & shops
  spiritWearStore: 'https://www.customink.com/fundraising/adamsspiritwearfall2026',
  moveathonPledge: 'https://app.99pledges.com/fund/adamsmovea',
  boxTops: 'https://www.boxtops4education.com/',
  fredMeyerRewards: 'https://www.fredmeyer.com/topic/community-rewards-4',
  // Was wrapped in an Outlook SafeLinks URL on the Wix site; unwrapped here.
  smithBrothers: 'http://smithbrothersfarms.com/?dc=adamspta',

  // Newsletters
  newsletterSignup:
    'https://visitor.r20.constantcontact.com/manage/optin?v=001te_v6vSd9jsq8LBnJTdiJNlwnwFuicA9LD3QYNjzQV2xVppxprXN4W3StYRXDa4uFN4mebNvwAIFtfq6H-2KT2lcELLKg_CLWIB1BBDVUKU%3D',
  spsSchoolBeatSignup:
    'https://visitor.r20.constantcontact.com/manage/optin?v=001jarSHX2McaTQkE0XaFSaUsqarpeqA-MZ10rAh-21JWr8a8y2Xmj0j8j8vb4sONQcqKQPauXCJK6kwVqLAcbtBsECKb2mgbraAjV-aLEQtfQjUY3O-P32BUfLS3zh5_bZH08yNdFI0Sm7YtUKPSVdDTQGU14gjDnn3SftQ2gcGCM%3D',

  // Volunteering
  spsVolunteerSite: 'http://www.seattleschools.org/volunteer',
  spsVolunteerApplication: 'https://www.seattleschools.org/departments/volunteer/volunteer-application-process/',
  spsVolunteerPortal: 'https://www.seattleschools.org/departments/volunteer/current-returning-volunteers/',
  volunteerRolesDoc: 'https://docs.google.com/document/d/1STb0CcIqIJQb46eiAtF8GvtFQc7Ce_PrSza1sZUOhVo/edit?tab=t.0',
  volunteerDoc: 'https://docs.google.com/document/d/1CwJpJq8Oqw2QrRdh4kJsUAOLPo3pJgwI/edit#heading=h.30j0zll',

  // After school & child care
  homeroomEnrichment: 'https://www.homeroom.com/sites/adams-elementary-school-seattle/enrichment?students=all',
  homeroom: 'https://www.homeroom.com/sites/adams-elementary-school-seattle',
  kidsCo: 'https://www.kidscompany.org/site_locations/adams/',
  ballardBoysGirlsClub: 'https://positiveplace.org/youth-before-after-school-programs/',
  ballardCommunityCenter: 'https://www.seattle.gov/parks/all-community-centers/ballard-community-center',

  // Seattle Public Schools
  adamsSps: 'https://adamses.seattleschools.org/',
  adamsStaff: 'https://adamses.seattleschools.org/staff/',
  sps: 'https://www.seattleschools.org/',
  schoolPay: 'https://www.seattleschools.org/student-portal/technology-supports-for-families/schoolpay/',
  theSource: 'https://ps.seattleschools.org/public/',
  schoolBoard: 'https://www.seattleschools.org/about/school-board/',
  whitman: 'https://whitmanms.seattleschools.org/',
  salmonBay: 'https://salmonbayk8.seattleschools.org/',

  // PTA organizations
  scptsa: 'https://scptsa.org/',
  wspta: 'https://www.wastatepta.org/',
  nationalPta: 'https://www.pta.org/',
  nationalPtaFamilies: 'https://www.pta.org/home/family-resources',
  specialEdPtsa: 'https://seattlespecialeducationptsa.org/',

  // Social
  instagram: 'https://www.instagram.com/adams.pta.seattle/',
  facebook: 'https://www.facebook.com/Adams.Elementary.PTA/',
} as const;

export const mailto = (email: string, subject?: string, body?: string) => {
  const params = new URLSearchParams();
  if (subject) params.set('subject', subject);
  if (body) params.set('body', body);
  const q = params.toString().replace(/\+/g, '%20');
  return `mailto:${email}${q ? `?${q}` : ''}`;
};
