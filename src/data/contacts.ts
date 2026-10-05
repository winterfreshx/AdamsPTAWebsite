// People and inboxes. Update each school year.
// Pages must import addresses from here, never type them inline, so a change lands everywhere at once.
import { schoolYear } from './schoolYear';

export const inbox = {
  execTeam: 'execteam@adamselementary.org',
  president: 'ptapresident@adamselementary.org',
  vicePresident: 'ptavp@adamselementary.org',
  secretary: 'ptasecretary@adamselementary.org',
  treasurer: 'ptatreasurer@adamselementary.org',
  communications: 'communications@adamselementary.org',
  socialMedia: 'socialmedia@adamselementary.org',
  newsletter: 'newsletter@adamselementary.org',
  readerboard: 'readerboard@adamselementary.org',
  afterSchool: 'afterschoolprog@adamselementary.org',
  familyDirectory: 'familydirectory@adamselementary.org',
} as const;

export const execBoard = {
  year: schoolYear,
  members: [
    { name: 'Kerry Lynd', role: 'PTA President', email: inbox.president },
    { name: 'Jaclyn Callahan', role: 'PTA Vice President', email: inbox.vicePresident },
    { name: 'Monica Miller', role: 'PTA Secretary', email: inbox.secretary },
    { name: 'Dave Hubbard', role: 'PTA Treasurer', email: inbox.treasurer },
  ],
};

export const ptaInboxes = [
  { label: 'PTA Exec Team', email: inbox.execTeam, note: 'Not sure who to ask? Start here.' },
  { label: 'Konstella questions', email: inbox.communications },
  { label: 'Social media', email: inbox.socialMedia },
  { label: 'Newsletter items', email: inbox.newsletter, subject: 'Newsletter item' },
  { label: 'Readerboard requests', email: inbox.readerboard, subject: 'Readerboard Request' },
  { label: 'After-school programs', email: inbox.afterSchool },
  { label: 'Family directory updates', email: inbox.familyDirectory },
  { label: 'Treasurer & corporate matching', email: inbox.treasurer },
];

// Grade reps by graduating class. The grade labels are tied to the school year: when `schoolYear` changes,
// shift them (in 2026/27, K = Class of 2032 … 5th = Class of 2027), add the new kindergarten class, and drop
// the class that graduated.
// Each class's inbox follows the rep<class year>@ pattern. (The Wix site showed "rep2020@" for the Class of 2030
// and had no Class of 2032 inbox; both were corrected to match their class year.)
// A class without an inbox falls back to the exec team on the Resources page.
const rep = (classOf: string) => `rep${classOf}@adamselementary.org`;

export const gradeReps: { classOf: string; grade: string; email?: string; facebook?: string }[] = [
  { classOf: '2032', grade: 'Kindergarten', email: rep('2032') },
  { classOf: '2031', grade: '1st grade', email: rep('2031') },
  { classOf: '2030', grade: '2nd grade', email: rep('2030') },
  { classOf: '2029', grade: '3rd grade', email: rep('2029'), facebook: 'https://www.facebook.com/groups/532687575498486' },
  { classOf: '2028', grade: '4th grade', email: rep('2028'), facebook: 'https://www.facebook.com/groups/613223476577940' },
  { classOf: '2027', grade: '5th grade', email: rep('2027'), facebook: 'https://www.facebook.com/groups/889714471858039' },
];

export const schoolContacts = {
  volunteerOffice: { name: 'Ms. Patti', email: 'pjroche@seattleschools.org' },
  parentNightOut: { name: 'Mr. Kellum', email: 'gskellum@seattleschools.org' },
  spsGoodNews: 'GoodNews@seattleschools.org',
};
