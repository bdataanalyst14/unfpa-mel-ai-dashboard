export const analyticalColumns = {
  outcome: 'outcome1', output: 'output1', activity: 'activity1', subact: 'subact1', subactcode: 'subactcode1', eventtype: 'eventtype1', entry_mode: 'participant_entry_mode',
} as const;
export type AnalyticalKey = keyof typeof analyticalColumns | 'classification' | 'participantType';
export type AnalyticalFilters = Record<AnalyticalKey, string>;
export type AnalyticalControls = { values: AnalyticalFilters; options: Partial<Record<AnalyticalKey, string[]>> };
export const analyticalLabels: Record<AnalyticalKey, string> = {
  outcome: 'Outcome', output: 'Output', activity: 'Activity', subact: 'Sub-activity', subactcode: 'Sub-activity code', eventtype: 'Activity / Event Type',
  entry_mode: 'Reporting mode', classification: 'Reporting classification', participantType: 'Participant / beneficiary type',
};
export function parseAnalyticalFilters(input: Record<string, unknown>, route: string): AnalyticalFilters {
  const supported = route === 'activity-progress' ? ['outcome', 'output', 'activity', 'subact', 'subactcode', 'eventtype']
    : route === 'participant-reach' ? ['eventtype', 'entry_mode', 'classification', 'participantType'] : [];
  return Object.fromEntries(Object.keys(analyticalLabels).map(key => {
    const raw = input[key];
    if (raw !== undefined && (typeof raw !== 'string' || raw.length > 1000 || (raw && !supported.includes(key)))) throw new Error('Unsupported analytical filter');
    return [key, typeof raw === 'string' ? raw.trim() : ''];
  })) as AnalyticalFilters;
}
