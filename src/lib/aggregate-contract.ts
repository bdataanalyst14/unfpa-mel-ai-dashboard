export type AggregateRow = Record<string, string>;

export type AggregateSection = {
  key: string;
  title: string;
  rows: AggregateRow[];
};

export type ActivityColumn = [string, string];
export type ActivityColumnGroup = { group: string; columns: ActivityColumn[] };

export const activityColumnGroups: ActivityColumnGroup[] = [
  {
    group: 'Reporting',
    columns: [
      ['year', 'Year'], ['quarter', 'Quarter'], ['project', 'Project'], ['partner', 'IP / Partner']
    ]
  },
  {
    group: 'Geography',
    columns: [
      ['province', 'Province'], ['district', 'District'], ['municipality', 'Municipality / LG']
    ]
  },
  {
    group: 'Results Hierarchy',
    columns: [
      ['outcome', 'Outcome'], ['output', 'Output'],
      ['subactcode', 'Sub-activity Code'], ['subact', 'Sub-activity'], ['activity', 'Activity Name']
    ]
  },
  {
    group: 'Implementation',
    columns: [
      ['events', 'Reported activities'], ['start_date', 'Start Date'], ['end_date', 'End Date'],
      ['eventtype', 'Event Type'], ['entry_mode', 'Reporting Mode'], ['source_type', 'Source Type'],
      ['fundcode', 'Fund Code'], ['submission_count', 'Submission contributions']
    ]
  },
  {
    group: 'Participants',
    columns: [
      ['participants', 'Total Participants'], ['reportable', 'Reportable Participants'],
      ['repeat_reportable_total', 'Repeat Reportable'], ['repeat_nonreportable_total', 'Repeat Non-Reportable'],
      ['repeat_guest_total', 'Repeat Guest'], ['repeat_beneficiary_total', 'Repeat Beneficiary']
    ]
  },
  {
    group: 'Sex',
    columns: [
      ['female', 'Female'], ['male', 'Male'], ['other_sex', 'Other Sex'], ['gender_total', 'Published sex total']
    ]
  },
  {
    group: 'Age',
    columns: [
      ['below_15', 'Below 15'], ['age_15_19', '15-19'], ['age_16_24', '16-24'], ['age_20_24', '20-24'],
      ['age_25_49', '25-49'], ['age_25_54', '25-54'], ['age_50_and_above', '50+'], ['age_55_and_above', '55+'], ['age_total', 'Published age total']
    ]
  },
  {
    group: 'Social Inclusion',
    columns: [
      ['hilldalit', 'Hill Dalit'], ['teraidalit', 'Terai Dalit'], ['hilljanajati', 'Hill Janajati'],
      ['teraijanajati', 'Terai Janajati'], ['madhesi', 'Madhesi'], ['muslim', 'Muslim'],
      ['bc', 'Brahmin/Chhetri'], ['other_cast', 'Other Caste'], ['caste_total', 'Published social inclusion total']
    ]
  },
  {
    group: 'Aggregate validation',
    columns: [
      ['gender_disagg_sum', 'Sex category sum'], ['gender_check', 'Sex reconciliation'],
      ['age_disagg_sum', 'Age category sum'], ['age_check', 'Age reconciliation'],
      ['caste_disagg_sum', 'Social inclusion category sum'], ['caste_check', 'Social inclusion reconciliation'],
    ]
  },
  {
    group: 'Disability',
    columns: [
      ['pwd_total', 'Published disability total'], ['withdisability', 'With Disability'], ['nodisability', 'No Disability']
    ]
  }
];

export const defaultVisibleColumns = [
  'year', 'quarter', 'project', 'partner', 'province', 'district', 'municipality',
  'outcome', 'output', 'subactcode', 'activity', 'events', 'participants', 'reportable'
];

export const allActivityColumns = activityColumnGroups.flatMap(g => g.columns);

const dimensionSources: Record<string, string> = {
  year: 'reporting_year1', quarter: 'report_quarter1', project: 'project1', partner: 'ip_name',
  province: 'province1', district: 'district1', municipality: 'palika1', outcome: 'outcome1', output: 'output1',
  subactcode: 'subactcode1', subact: 'subact1', activity: 'activity1', start_date: 'start_date1', end_date: 'end_date1',
  eventtype: 'eventtype1', entry_mode: 'participant_entry_mode', source_type: 'source_type', fundcode: 'fundcode1',
  gender_check: 'gender_check', age_check: 'age_check', caste_check: 'caste_check',
};
const measureSources: Record<string, string> = { events: 'event_count', participants: 'total_participants', reportable: 'total_reportable_participants', other_sex: 'other' };
export const activityFields = activityColumnGroups.flatMap(group => group.columns.map(([key, label]) => ({
  key, label, group: group.group, source: dimensionSources[key] ?? measureSources[key] ?? key,
  kind: dimensionSources[key] ? 'dimension' as const : 'measure' as const,
  defaultVisible: defaultVisibleColumns.includes(key),
})));
export const activitySearchKeys = ['subactcode', 'subact', 'activity', 'project', 'partner', 'outcome', 'output', 'province', 'district', 'municipality'];
export const activityExtraFilters = ['outcome', 'output', 'activity', 'subact', 'subactcode', 'eventtype', 'entry_mode', 'fundcode'] as const;
export const activityPresets: Record<string, string[]> = {
  Programme: ['project', 'outcome', 'output', 'activity', 'subactcode', 'subact'],
  Participants: activityFields.filter(field => ['Participants', 'Sex', 'Age'].includes(field.group)).map(field => field.key),
  Inclusion: activityFields.filter(field => ['Social Inclusion', 'Disability'].includes(field.group)).map(field => field.key),
  Geography: activityFields.filter(field => field.group === 'Geography').map(field => field.key),
};
export type ActivityRequest = { search: string; sort: string; direction: 'asc' | 'desc'; page: number; pageSize: number } & Record<typeof activityExtraFilters[number], string>;
export type ActivityPage = { request: ActivityRequest; totalRows: number; totalPages: number; options: Record<string, string[]> };
