// School-wide facts shown in the header, footer and home page.
import { inbox } from './contacts';

export const site = {
  name: 'Adams Elementary PTA',
  shortName: 'Adams PTA',
  tagline: 'We take care of each other.',
  description:
    'The Adams Elementary School PTA in Ballard, Seattle — supporting our students, staff and community through volunteering, fundraising and advocacy. Go Eagles!',
  url: 'https://www.adamselementarypta.org',
  taxId: '91-0963029',
  email: inbox.execTeam,
};

export const school = {
  name: 'Adams Elementary School',
  street: '6110 28th Ave NW',
  city: 'Seattle',
  state: 'WA',
  zip: '98107',
  entranceNote: 'Enter on 62nd St.',
  phone: '206-252-1300',
  principal: 'Anitra Jones',
  mapUrl: 'https://www.google.com/maps/search/?api=1&query=Adams+Elementary+School+6110+28th+Ave+NW+Seattle+WA+98107',
};

export const bellTimes = [
  { time: '7:35', label: 'Supervision begins on the playground; breakfast is served in the lunchroom' },
  { time: '7:50', label: 'First bell (call to classrooms)' },
  { time: '7:55', label: 'Instruction begins' },
  { time: '2:25', label: 'End of instruction' },
  { time: '1:10', label: 'Early dismissal on Wednesdays', highlight: true },
];

export const landAcknowledgment =
  'The Adams PTA acknowledges that Adams Elementary School is located on the traditional land of the first people of Seattle, the Duwamish. We acknowledge the descendants that have become part of the Duwamish, Muckleshoot, Puyallup, Tulalip, Suquamish and Lummi Tribes, who continue to celebrate their cultures while striving for recognition and resources in our region today. We acknowledge and lament our place in longstanding systems of colonization and oppression.';

export const memorial = 'Ms. Timmi – Always In Our Hearts';
