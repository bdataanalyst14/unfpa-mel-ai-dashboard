import 'server-only';

import type { GbvServiceRecord } from '@/lib/types';

export const gbvServiceData: GbvServiceRecord[] = [
  {
    province: 'Koshi', district: 'Morang', totalSurvivors: 125, femaleSurvivors: 118, maleSurvivors: 7,
    under15: 18, aged15to49: 95, above49: 12, withDisability: 6, referralCount: 89, followUpCount: 72,
    byPregnancyStatus: { pregnant: 8, notPregnant: 110, unknown: 7 },
    byMaritalStatus: { married: 78, unmarried: 25, divorced: 12, widowed: 5, other: 5 },
    byPlaceOfResidence: { urban: 55, rural: 70 },
    byCasteEthnicity: { 'Brahmin/Chhetri': 35, 'Janajati': 42, 'Madhesi': 28, 'Dalit': 15, 'Other': 5 },
    ocmcServicesProvided: 98, ocmcReferralsMade: 45,
  },
  {
    province: 'Madhesh', district: 'Dhanusha', totalSurvivors: 98, femaleSurvivors: 93, maleSurvivors: 5,
    under15: 15, aged15to49: 72, above49: 11, withDisability: 5, referralCount: 67, followUpCount: 55,
    byPregnancyStatus: { pregnant: 6, notPregnant: 85, unknown: 7 },
    byMaritalStatus: { married: 62, unmarried: 18, divorced: 8, widowed: 6, other: 4 },
    byPlaceOfResidence: { urban: 35, rural: 63 },
    byCasteEthnicity: { 'Brahmin/Chhetri': 18, 'Janajati': 22, 'Madhesi': 40, 'Dalit': 12, 'Other': 6 },
    ocmcServicesProvided: 78, ocmcReferralsMade: 34,
  },
  {
    province: 'Bagmati', district: 'Kathmandu', totalSurvivors: 210, femaleSurvivors: 198, maleSurvivors: 12,
    under15: 28, aged15to49: 165, above49: 17, withDisability: 9, referralCount: 156, followUpCount: 132,
    byPregnancyStatus: { pregnant: 12, notPregnant: 185, unknown: 13 },
    byMaritalStatus: { married: 125, unmarried: 48, divorced: 22, widowed: 8, other: 7 },
    byPlaceOfResidence: { urban: 155, rural: 55 },
    byCasteEthnicity: { 'Brahmin/Chhetri': 65, 'Janajati': 72, 'Madhesi': 32, 'Dalit': 28, 'Other': 13 },
    ocmcServicesProvided: 180, ocmcReferralsMade: 78,
  },
  {
    province: 'Gandaki', district: 'Kaski', totalSurvivors: 75, femaleSurvivors: 70, maleSurvivors: 5,
    under15: 10, aged15to49: 58, above49: 7, withDisability: 5, referralCount: 52, followUpCount: 41,
    byPregnancyStatus: { pregnant: 5, notPregnant: 65, unknown: 5 },
    byMaritalStatus: { married: 48, unmarried: 15, divorced: 6, widowed: 4, other: 2 },
    byPlaceOfResidence: { urban: 42, rural: 33 },
    byCasteEthnicity: { 'Brahmin/Chhetri': 28, 'Janajati': 30, 'Madhesi': 5, 'Dalit': 8, 'Other': 4 },
    ocmcServicesProvided: 62, ocmcReferralsMade: 28,
  },
  {
    province: 'Lumbini', district: 'Rupandehi', totalSurvivors: 88, femaleSurvivors: 83, maleSurvivors: 5,
    under15: 12, aged15to49: 65, above49: 11, withDisability: 5, referralCount: 61, followUpCount: 48,
    byPregnancyStatus: { pregnant: 7, notPregnant: 75, unknown: 6 },
    byMaritalStatus: { married: 55, unmarried: 18, divorced: 8, widowed: 4, other: 3 },
    byPlaceOfResidence: { urban: 48, rural: 40 },
    byCasteEthnicity: { 'Brahmin/Chhetri': 25, 'Janajati': 22, 'Madhesi': 25, 'Dalit': 10, 'Other': 6 },
    ocmcServicesProvided: 72, ocmcReferralsMade: 32,
  },
  {
    province: 'Karnali', district: 'Surkhet', totalSurvivors: 42, femaleSurvivors: 40, maleSurvivors: 2,
    under15: 8, aged15to49: 28, above49: 6, withDisability: 5, referralCount: 28, followUpCount: 20,
    byPregnancyStatus: { pregnant: 5, notPregnant: 33, unknown: 4 },
    byMaritalStatus: { married: 28, unmarried: 8, divorced: 3, widowed: 2, other: 1 },
    byPlaceOfResidence: { urban: 12, rural: 30 },
    byCasteEthnicity: { 'Brahmin/Chhetri': 15, 'Janajati': 12, 'Madhesi': 2, 'Dalit': 10, 'Other': 3 },
    ocmcServicesProvided: 35, ocmcReferralsMade: 15,
  },
  {
    province: 'Sudurpashchim', district: 'Kailali', totalSurvivors: 65, femaleSurvivors: 61, maleSurvivors: 4,
    under15: 9, aged15to49: 48, above49: 8, withDisability: 5, referralCount: 45, followUpCount: 35,
    byPregnancyStatus: { pregnant: 5, notPregnant: 55, unknown: 5 },
    byMaritalStatus: { married: 42, unmarried: 12, divorced: 5, widowed: 3, other: 3 },
    byPlaceOfResidence: { urban: 25, rural: 40 },
    byCasteEthnicity: { 'Brahmin/Chhetri': 22, 'Janajati': 18, 'Madhesi': 5, 'Dalit': 15, 'Other': 5 },
    ocmcServicesProvided: 52, ocmcReferralsMade: 22,
  },
];
