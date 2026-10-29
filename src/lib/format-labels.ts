export const categoryLabelMap: Record<string, string> = {
  // Age groups
  below_15: 'Below 15',
  'below 15': 'Below 15',
  age_15_19: '15–19',
  'age 15 19': '15–19',
  '15_19': '15–19',
  '15 19': '15–19',
  age_16_24: '16–24',
  'age 16 24': '16–24',
  '16_24': '16–24',
  '16 24': '16–24',
  age_20_24: '20–24',
  'age 20 24': '20–24',
  '20_24': '20–24',
  '20 24': '20–24',
  age_25_49: '25–49',
  'age 25 49': '25–49',
  '25_49': '25–49',
  '25 49': '25–49',
  age_25_54: '25–54',
  'age 25 54': '25–54',
  '25_54': '25–54',
  '25 54': '25–54',
  age_50_and_above: '50 and above',
  'age 50 and above': '50 and above',
  '50_and_above': '50 and above',
  '50 and above': '50 and above',
  age_55_and_above: '55 and above',
  'age 55 and above': '55 and above',
  '55_and_above': '55 and above',
  '55 and above': '55 and above',

  // Social inclusion / Caste & Ethnicity
  hilldalit: 'Hill Dalit',
  'hill dalit': 'Hill Dalit',
  teraidalit: 'Terai Dalit',
  'terai dalit': 'Terai Dalit',
  hilljanajati: 'Hill Janajati',
  'hill janajati': 'Hill Janajati',
  teraijanajati: 'Terai Janajati',
  'terai janajati': 'Terai Janajati',
  madhesi: 'Madhesi',
  muslim: 'Muslim',
  bc: 'Brahmin / Chhetri',
  'brahmin/chhetri': 'Brahmin / Chhetri',
  'brahmin / chhetri': 'Brahmin / Chhetri',
  other_cast: 'Other Caste',
  'other cast': 'Other Caste',
  'other caste': 'Other Caste',

  // Disability
  withdisability: 'With Disability',
  'with disability': 'With Disability',
  nodisability: 'Without Disability',
  'no disability': 'Without Disability',
  'without disability': 'Without Disability',

  // Sex
  female: 'Female',
  'female participants': 'Female',
  male: 'Male',
  'male participants': 'Male',
  other: 'Other Sex',
  other_sex: 'Other Sex',
  'other sex': 'Other Sex',
  'other participants': 'Other Sex',

  // Geographic Matrix & Hierarchy codes
  projectgeography: 'Project by Event District',
  partnergeography: 'Partner by Event District',
  subactcode: 'Sub-activity Code',
  subact: 'Sub-activity',
  eventtype: 'Activity / Event Type',
};

export function formatCategoryLabel(key: string, fallbackLabel?: string): string {
  if (!key) return fallbackLabel || '';
  const rawNormalized = key.toLowerCase().trim();
  const normalized = rawNormalized.replace(/[-_]+/g, ' ');
  return categoryLabelMap[rawNormalized] || categoryLabelMap[normalized] || fallbackLabel || key;
}
