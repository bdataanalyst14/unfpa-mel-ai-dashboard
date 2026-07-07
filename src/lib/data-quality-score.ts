import type { Activity } from './types';

export interface DataQualityBreakdown {
  evidenceScore: number;
  validationScore: number;
  disaggregationScore: number;
  timelinessScore: number;
  overallScore: number;
}

export function calculateDataQualityScore(data: Activity[]): DataQualityBreakdown {
  if (data.length === 0) {
    return { evidenceScore: 0, validationScore: 0, disaggregationScore: 0, timelinessScore: 0, overallScore: 0 };
  }

  const evidenceScore = (data.filter(a => a.evidenceStatus === 'Approved').length / data.length) * 100;
  const validationScore = (data.filter(a => a.validationStatus === 'Validated').length / data.length) * 100;

  const disaggregationScore = (data.filter(a =>
    a.femaleParticipants + a.maleParticipants + a.otherParticipants === a.totalParticipants
  ).length / data.length) * 100;

  const timelinessScore = 85; // placeholder/stub for timeliness check

  const overallScore = (evidenceScore * 0.3) + (validationScore * 0.3) + (disaggregationScore * 0.25) + (timelinessScore * 0.15);

  return {
    evidenceScore: Math.round(evidenceScore * 10) / 10,
    validationScore: Math.round(validationScore * 10) / 10,
    disaggregationScore: Math.round(disaggregationScore * 10) / 10,
    timelinessScore,
    overallScore: Math.round(overallScore * 10) / 10,
  };
}

export function getQualityLevel(score: number): 'excellent' | 'good' | 'fair' | 'poor' {
  if (score >= 90) return 'excellent';
  if (score >= 75) return 'good';
  if (score >= 50) return 'fair';
  return 'poor';
}

export function getQualityColor(level: string): string {
  switch (level) {
    case 'excellent': return 'text-emerald-600';
    case 'good': return 'text-blue-600';
    case 'fair': return 'text-amber-600';
    case 'poor': return 'text-red-600';
    default: return 'text-gray-600';
  }
}
