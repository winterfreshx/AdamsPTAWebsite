import type { ImageMetadata } from 'astro';
import ajp from '../assets/images/sponsors/ajp-engineering.jpg';
import ballardSails from '../assets/images/sponsors/ballard-sails.jpg';
import britishSwim from '../assets/images/sponsors/british-swim-school.jpg';
import heartOfChelsea from '../assets/images/sponsors/heart-of-chelsea-vet.jpg';
import healthBallard from '../assets/images/sponsors/health-ballard-club.jpg';
import heartroot from '../assets/images/sponsors/heartroot-lactation.jpg';
import lookingGlass from '../assets/images/sponsors/looking-glass-arcade.jpg';
import mathnasium from '../assets/images/sponsors/mathnasium.jpg';
import siena from '../assets/images/sponsors/siena-interiors.jpg';
import smileBallard from '../assets/images/sponsors/smile-ballard.jpg';
import swansons from '../assets/images/sponsors/swansons-nursery.jpg';
import matador from '../assets/images/sponsors/the-matador.jpg';
import digs from '../assets/images/sponsors/digs.png';
import majesticBay from '../assets/images/sponsors/majestic-bay-theatres.png';
import rosellinis from '../assets/images/sponsors/rosellinis.png';
import seattleGymnastics from '../assets/images/sponsors/seattle-gymnastics-academy.svg';
import sunnyHill from '../assets/images/sponsors/sunny-hill.png';
import sweetMickeys from '../assets/images/sponsors/sweet-mickeys.png';
import townAndCountry from '../assets/images/sponsors/town-and-country-markets.png';
import tumbles from '../assets/images/sponsors/tumbles.png';

export const moveathonSponsors: { name: string; logo: ImageMetadata }[] = [
  { name: 'AJP Engineering', logo: ajp },
  { name: 'Ballard Health Club', logo: healthBallard },
  { name: 'Ballard Sails', logo: ballardSails },
  { name: 'British Swim School', logo: britishSwim },
  { name: 'Heartroot Lactation', logo: heartroot },
  { name: 'Heart of Chelsea Veterinary Group', logo: heartOfChelsea },
  { name: 'Mathnasium', logo: mathnasium },
  { name: 'The Looking Glass Arcade', logo: lookingGlass },
  { name: 'The Matador', logo: matador },
  { name: 'Siena Interiors', logo: siena },
  { name: 'Smile Ballard', logo: smileBallard },
  { name: "Swanson's Nursery", logo: swansons },
];

// Local businesses that supported the Big Give (donated prizes), thanked at the end of /big-give (keep them alphabetical).
// Each tile shows the logo with the name under it; `logo` is optional (name only). Logo files go in src/assets/images/sponsors/.
export const bigGiveSupporters: { name: string; url: string; logo?: ImageMetadata }[] = [
  { name: 'DIGS', url: 'https://digsshowroom.com/', logo: digs },
  { name: 'Majestic Bay Theatres', url: 'https://www.majesticbay.com/', logo: majesticBay },
  { name: "Rosellini's", url: 'https://rosellinis.com/', logo: rosellinis },
  { name: 'Seattle Gymnastics Academy', url: 'https://seattlegymnastics.com/locations/ballard/', logo: seattleGymnastics },
  { name: 'Sunny Hill', url: 'https://sunnyhillseattle.com/', logo: sunnyHill },
  { name: "Sweet Mickey's", url: 'https://www.sweetmickeys.com/', logo: sweetMickeys },
  { name: 'Town & Country Markets', url: 'https://townandcountrymarkets.com/markets/ballard', logo: townAndCountry },
  { name: 'Tumbles', url: 'https://seattleballard.tumbles.net/', logo: tumbles },
];
