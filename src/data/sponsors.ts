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
