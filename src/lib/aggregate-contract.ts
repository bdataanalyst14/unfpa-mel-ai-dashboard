export type AggregateRow = Record<string, string>;

export type AggregateSection = {
  key: string;
  title: string;
  rows: AggregateRow[];
};

export const activityColumns = [
  ['year', 'Year'], ['quarter', 'Quarter'], ['project', 'Project'],
  ['partner', 'IP / Partner'], ['province', 'Province'], ['district', 'District'],
  ['municipality', 'Municipality / LG'], ['activity', 'Activity code / name'],
  ['events', 'Reported activities'], ['participants', 'Participants'], ['reportable', 'Reportable participants'],
] as const;
