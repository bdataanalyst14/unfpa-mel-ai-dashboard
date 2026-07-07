import type { Activity, CombinedSummary } from './types';

export function getTotalEvents(data: Activity[]): number {
  return data.length;
}

export function getReportableParticipants(data: Activity[]): number {
  return data.reduce((sum, a) => sum + a.totalParticipants, 0);
}

export function getFemaleParticipants(data: Activity[]): number {
  return data.reduce((sum, a) => sum + a.femaleParticipants, 0);
}

export function getMaleParticipants(data: Activity[]): number {
  return data.reduce((sum, a) => sum + a.maleParticipants, 0);
}

export function getOtherSexParticipants(data: Activity[]): number {
  return data.reduce((sum, a) => sum + a.otherParticipants, 0);
}

export function getBeneficiaries(data: Activity[]): number {
  return data.reduce((sum, a) => sum + a.beneficiaries, 0);
}

export function getGuests(data: Activity[]): number {
  return data.reduce((sum, a) => sum + a.guests, 0);
}

export function getDistrictsCovered(data: Activity[]): number {
  return new Set(data.map(a => a.district)).size;
}

export function getIPsReporting(data: Activity[]): number {
  return new Set(data.map(a => a.ip)).size;
}

export function getEvidenceCompletionRate(data: Activity[]): number {
  if (data.length === 0) return 0;
  const approved = data.filter(a => a.evidenceStatus === 'Approved').length;
  return (approved / data.length) * 100;
}

export function getActivityAchievementRate(data: Activity[]): number {
  if (data.length === 0) return 0;
  return data.reduce((sum, a) => sum + a.achievementPct, 0) / data.length;
}

export function getIndicatorAchievementRate(indicators: { achievementPct: number }[]): number {
  if (indicators.length === 0) return 0;
  return indicators.reduce((sum, i) => sum + i.achievementPct, 0) / indicators.length;
}

export function getDataQualityScore(summary: CombinedSummary): number {
  return summary.dataQualityScore;
}

export function getMissingEvidenceCount(data: Activity[]): number {
  return data.filter(a => a.evidenceStatus === 'Missing').length;
}

export function getValidationPendingCount(data: Activity[]): number {
  return data.filter(a => a.validationStatus === 'Pending').length;
}

export function getGenderCheckFailedCount(data: Activity[]): number {
  return data.filter(a => a.femaleParticipants + a.maleParticipants + a.otherParticipants !== a.totalParticipants).length;
}

export function getAgeCheckFailedCount(data: Activity[]): number {
  return data.filter(a => a.youthParticipants > a.totalParticipants).length;
}

export function getCasteCheckFailedCount(data: Activity[]): number {
  return data.filter(a => a.marginalizedGroups > a.totalParticipants).length;
}
