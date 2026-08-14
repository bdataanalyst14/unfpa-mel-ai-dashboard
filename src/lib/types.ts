export type EvidenceStatus = 'Approved' | 'Pending' | 'Missing';
export type ValidationStatus = 'Validated' | 'Pending' | 'Rejected';
export type IndicatorStatus = 'On Track' | 'Watch' | 'Off Track' | 'No Data';
export type Severity = 'high' | 'medium' | 'low';
export type UserRole = 'AUTHORIZED_USER' | 'ADMIN';

export interface Activity {
  id: string;
  ip: string;
  year: number;
  quarter: string;
  project: string;
  outcome: string;
  output: string;
  activity: string;
  subactivity: string;
  fundCode: string;
  eventType: string;
  startDate: string;
  endDate: string;
  province: string;
  district: string;
  palika: string;
  achievementPct: number;
  evidenceStatus: EvidenceStatus;
  validationStatus: ValidationStatus;
  totalParticipants: number;
  femaleParticipants: number;
  maleParticipants: number;
  otherParticipants: number;
  beneficiaries: number;
  guests: number;
  youthParticipants: number;
  participantsWithDisability: number;
  marginalizedGroups: number;
}

export interface CombinedSummary {
  totalEvents: number;
  reportableParticipants: number;
  femaleParticipants: number;
  maleParticipants: number;
  otherParticipants: number;
  beneficiaries: number;
  guests: number;
  nonReportableParticipants: number;
  districtsCovered: number;
  ipsReporting: number;
  indicatorsOnTrack: number;
  indicatorsWatch: number;
  indicatorsOffTrack: number;
  missingEvidence: number;
  dataQualityScore: number;
  pendingValidation: number;
  approvedSubmissions: number;
  lateSubmissions: number;
}

export interface ExecutiveOverviewFilters {
  year?: string;
  quarter?: string;
  project?: string;
  province?: string;
  district?: string;
  implementingPartner?: string;
}

export interface ExecutiveOverviewData {
  summary: CombinedSummary;
  participantSex: Array<{
    name: 'Female' | 'Male' | 'Other';
    value: number;
    color: string;
  }>;
  insights: AiInsight[];
  metadata: {
    dataSource: 'mock' | 'bigquery';
    sourceLabel: string;
    lastRefreshed: string | null;
    note: string;
  };
}

export interface CpdIndicator {
  id: string;
  code: string;
  description: string;
  outputCluster: string;
  baseline: number;
  target: number;
  actual: number;
  achievementPct: number;
  status: IndicatorStatus;
  year: number;
  quarter: string;
}

export interface UnsdcfIndicator {
  id: string;
  framework: string;
  code: string;
  description: string;
  baseline: number;
  target: number;
  actual: number;
  achievementPct: number;
  status: IndicatorStatus;
}

export interface GbvServiceRecord {
  province: string;
  district: string;
  totalSurvivors: number;
  femaleSurvivors: number;
  maleSurvivors: number;
  under15: number;
  aged15to49: number;
  above49: number;
  withDisability: number;
  referralCount: number;
  followUpCount: number;
  byPregnancyStatus: { pregnant: number; notPregnant: number; unknown: number };
  byMaritalStatus: { married: number; unmarried: number; divorced: number; widowed: number; other: number };
  byPlaceOfResidence: { urban: number; rural: number };
  byCasteEthnicity: Record<string, number>;
  ocmcServicesProvided: number;
  ocmcReferralsMade: number;
}

export interface AiInsight {
  id: string;
  category: string;
  severity: Severity;
  title: string;
  description: string;
  recommendation: string;
  relatedIndicators: string[];
  dateGenerated: string;
}

export interface IpPerformance {
  ipName: string;
  totalActivities: number;
  completedActivities: number;
  totalParticipants: number;
  evidenceCompletionRate: number;
  lateSubmissions: number;
  dataQualityScore: number;
  indicatorsContributed: number;
  districts: string[];
}

export interface MonthlyTrend {
  month: string;
  activities: number;
  participants: number;
}

export interface ProjectProgress {
  project: string;
  planned: number;
  completed: number;
  completionRate: number;
}
