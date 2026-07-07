# Data Model Documentation

This document explains the data models, interfaces, and schemas utilized by the UNFPA Nepal MEL Intelligence Dashboard prototype.

## Types and Interfaces

All models are defined in [types.ts](file:///h:/My%20Drive/unfpa-mel-ai-dashboard/src/lib/types.ts).

### 1. Activity Record
Represents a single program event, workshop, orientation, or service delivery activity logged by implementing partners.

```typescript
export interface Activity {
  id: string; // Unique activity code
  ip: string; // Implementing Partner name
  year: number;
  quarter: string; // Q1, Q2, Q3, Q4
  project: string; // CP9 SRHR, CP9 GEWE, etc.
  outcome: string;
  output: string;
  activity: string;
  subactivity: string;
  fundCode: string;
  eventType: string; // Training, Workshop, Review Meeting, etc.
  startDate: string; // YYYY-MM-DD
  endDate: string;
  province: string;
  district: string;
  palika: string;
  achievementPct: number; // Completion/target achievement percentage
  evidenceStatus: 'Approved' | 'Pending' | 'Missing';
  validationStatus: 'Validated' | 'Pending' | 'Rejected';
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
```

### 2. CPD Indicator
Represents Country Programme Document indicator metrics comparing baseline, targets, and achieved values.

```typescript
export interface CpdIndicator {
  id: string;
  code: string;
  description: string;
  outputCluster: string; // SRHR, GEWE, AYSRHR, PD
  baseline: number;
  target: number;
  actual: number;
  achievementPct: number;
  status: 'On Track' | 'Watch' | 'Off Track' | 'No Data';
}
```

### 3. GBV Service Record
Represents aggregated Gender-Based Violence (GBV) service visits and OCMC caseload.

```typescript
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
```
