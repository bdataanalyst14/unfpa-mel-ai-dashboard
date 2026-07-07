import type { Activity } from '@/lib/types';

const projects = ['CP9 SRHR', 'CP9 GEWE', 'CP9 AYSRHR', 'KOICA AYSRHR', 'UNFPA Supplies'];
const ips = ['ADRA Nepal', 'FPAN', 'Sunaulo Parivar Nepal', 'WOREC', 'Restless Development', 'CREHPA', 'BP Koirala Institute', 'Tribhuvan Univ', 'NFCC', 'PHECT Nepal', 'Abt Associates', 'Ipas Nepal'];
const provinces = ['Koshi', 'Madhesh', 'Bagmati', 'Gandaki', 'Lumbini', 'Karnali', 'Sudurpashchim'];
const districts = ['Kathmandu', 'Lalitpur', 'Bhaktapur', 'Morang', 'Sunsari', 'Jhapa', 'Kaski', 'Chitwan', 'Rupandehi', 'Banke', 'Kailali', 'Dang', 'Surkhet', 'Parsa', 'Bara', 'Sarlahi', 'Mahottari', 'Dhanusha', 'Siraha', 'Saptari', 'Bardiya', 'Dailekh', 'Jumla', 'Dolpa', 'Humla', 'Mugu', 'Bajhang', 'Bajura', 'Achham', 'Doti', 'Dadeldhura', 'Baitadi', 'Darchula', 'Kanchanpur', 'Kapilvastu', 'Palpa', 'Gulmi', 'Arghakhanchi', 'Pyuthan', 'Rolpa', 'Salyan', 'Rukum West', 'Jajarkot', 'Dolakha', 'Sindhupalchok', 'Nuwakot', 'Rasuwa'];
const eventTypes = ['Training', 'Workshop', 'Orientation', 'Review Meeting', 'Community Mobilization', 'Service Delivery', 'Advocacy', 'Research'];
const evidenceStatuses: ('Approved' | 'Pending' | 'Missing')[] = ['Approved', 'Approved', 'Approved', 'Approved', 'Approved', 'Pending', 'Pending', 'Missing'];
const validationStatuses: ('Validated' | 'Pending' | 'Rejected')[] = ['Validated', 'Validated', 'Validated', 'Validated', 'Validated', 'Pending', 'Pending', 'Rejected'];

export const mainData: Activity[] = Array.from({ length: 342 }, (_, i) => {
  const total = 20 + (i % 7) * 15;
  const female = Math.round(total * 0.6);
  const male = Math.round(total * 0.38);
  const other = total - female - male;
  
  return {
    id: `ACT-2025-${String(i + 1).padStart(4, '0')}`,
    ip: ips[i % ips.length],
    year: 2025,
    quarter: `Q${(i % 4) + 1}`,
    project: projects[i % projects.length],
    outcome: `Outcome ${(i % 3) + 1}`,
    output: `Output ${(i % 5) + 1}.${(i % 3) + 1}`,
    activity: `Activity ${(i % 8) + 1}`,
    subactivity: `Sub-activity ${(i % 4) + 1}`,
    fundCode: `FC-${1000 + (i % 5)}`,
    eventType: eventTypes[i % eventTypes.length],
    startDate: `2025-${String((i % 12) + 1).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}`,
    endDate: `2025-${String((i % 12) + 1).padStart(2, '0')}-${String(Math.min((i % 28) + 3, 28)).padStart(2, '0')}`,
    province: provinces[i % provinces.length],
    district: districts[i % districts.length],
    palika: `Palika ${(i % 10) + 1}`,
    achievementPct: Math.min(100, 40 + (i % 7) * 10),
    evidenceStatus: evidenceStatuses[i % evidenceStatuses.length],
    validationStatus: validationStatuses[i % validationStatuses.length],
    totalParticipants: total,
    femaleParticipants: female,
    maleParticipants: male,
    otherParticipants: Math.max(0, other),
    beneficiaries: Math.round(total * 0.82),
    guests: total - Math.round(total * 0.82),
    youthParticipants: Math.round(total * 0.35),
    participantsWithDisability: Math.round(total * 0.04),
    marginalizedGroups: Math.round(total * 0.28),
  };
});
