// People and inboxes. Update each school year.

export const execBoard = {
  year: '2026/27',
  members: [
    { name: 'Kerry Lynd', role: 'PTA President', email: 'ptapresident@adamselementary.org' },
    { name: 'Jaclyn Callahan', role: 'PTA Vice President', email: 'ptavp@adamselementary.org' },
    { name: 'Monica Miller', role: 'PTA Secretary', email: 'ptasecretary@adamselementary.org' },
    { name: 'Dave Hubbard', role: 'PTA Treasurer', email: 'ptatreasurer@adamselementary.org' },
  ],
};

export const ptaInboxes = [
  { label: 'PTA Exec Team', email: 'execteam@adamselementary.org', note: 'Not sure who to ask? Start here.' },
  { label: 'Konstella questions', email: 'communications@adamselementary.org' },
  { label: 'Social media', email: 'socialmedia@adamselementary.org' },
  { label: 'Newsletter items', email: 'newsletter@adamselementary.org', subject: 'Newsletter item' },
  { label: 'Readerboard requests', email: 'readerboard@adamselementary.org', subject: 'Readerboard Request' },
  { label: 'After-school programs', email: 'afterschoolprog@adamselementary.org' },
  { label: 'Family directory updates', email: 'familydirectory@adamselementary.org' },
  { label: 'Treasurer & corporate matching', email: 'ptatreasurer@adamselementary.org' },
];

// Grade reps by graduating class, as listed on the Wix Resources page.
// The Wix page had several mailto links pointing at the wrong inbox; these use the address that was displayed.
// TODO(PTA) D2: confirm 2026/27 reps. "rep2020" is probably meant to be "rep2030".
export const gradeReps: { classOf: string; email: string; facebook?: string }[] = [
  { classOf: '2031', email: 'rep2031@adamselementary.org' },
  { classOf: '2030', email: 'rep2020@adamselementary.org' },
  { classOf: '2029', email: 'rep2029@adamselementary.org', facebook: 'https://www.facebook.com/groups/532687575498486' },
  { classOf: '2028', email: 'rep2028@adamselementary.org', facebook: 'https://www.facebook.com/groups/613223476577940' },
  { classOf: '2027', email: 'rep2027@adamselementary.org', facebook: 'https://www.facebook.com/groups/889714471858039' },
  { classOf: '2026', email: 'rep2026@adamselementary.org' },
];

export const schoolContacts = {
  volunteerOffice: { name: 'Ms. Patti', email: 'pjroche@seattleschools.org' },
  parentNightOut: { name: 'Mr. Kellum', email: 'gskellum@seattleschools.org' },
  spsGoodNews: 'GoodNews@seattleschools.org',
};
