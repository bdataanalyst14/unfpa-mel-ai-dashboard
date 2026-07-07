import type { AiInsight } from '@/lib/types';

export const aiInsights: AiInsight[] = [
  {
    id: 'AI-001', category: 'Risk', severity: 'high',
    title: 'Male engagement activities critically behind target',
    description: 'CPD.O3.4 (Male engagement sessions) is at only 32.5% achievement. At current pace, the annual target of 200 sessions will not be met.',
    recommendation: 'Convene IPs responsible for GEWE Output 3 to develop an accelerated delivery plan for Q3-Q4.',
    relatedIndicators: ['CPD-13'], dateGenerated: '2025-06-15',
  },
  {
    id: 'AI-002', category: 'Risk', severity: 'high',
    title: 'GBV referral pathways falling short',
    description: 'Only 8 of 30 targeted referral pathways are functional (26.7%). Service continuity for survivors is at risk.',
    recommendation: 'Prioritise pathway activation in Madhesh and Karnali provinces where gaps are most acute.',
    relatedIndicators: ['CPD-19'], dateGenerated: '2025-06-15',
  },
  {
    id: 'AI-003', category: 'Opportunity', severity: 'medium',
    title: 'SRHR midwife deployment ahead of schedule',
    description: 'Midwife deployment (CPD.O1.5) is at 93.3%, well ahead of the annual curve. Resources may be reallocated.',
    recommendation: 'Consider redirecting surplus midwife deployment budget to EmONC facility upgrades.',
    relatedIndicators: ['CPD-14', 'CPD-11'], dateGenerated: '2025-06-14',
  },
  {
    id: 'AI-004', category: 'Data Quality', severity: 'medium',
    title: '23 activities missing evidence documentation',
    description: 'Evidence completion rate is 93.3% but 23 activities have no uploaded evidence. Most are from WOREC and FPAN.',
    recommendation: 'Issue a data quality reminder to WOREC and FPAN with a 2-week deadline for evidence uploads.',
    relatedIndicators: [], dateGenerated: '2025-06-13',
  },
  {
    id: 'AI-005', category: 'Performance', severity: 'low',
    title: 'CSE school integration underperforming',
    description: 'Only 115 of 500 targeted schools have integrated CSE (23%). This is the lowest performing indicator.',
    recommendation: 'Engage Ministry of Education for policy-level support; consider revising the target methodology.',
    relatedIndicators: ['CPD-20'], dateGenerated: '2025-06-12',
  },
  {
    id: 'AI-006', category: 'Geographic', severity: 'medium',
    title: 'Karnali Province has weakest implementation coverage',
    description: 'Only 3 of 10 Karnali districts have recorded activities in Q2. GBV survivor count is lowest nationally.',
    recommendation: 'Deploy additional IP capacity in Karnali; consider remote monitoring modality for hard-to-reach districts.',
    relatedIndicators: [], dateGenerated: '2025-06-11',
  },
  {
    id: 'AI-007', category: 'Compliance', severity: 'low',
    title: '14 late submissions detected this quarter',
    description: '14 activity reports were submitted more than 15 days after the activity end date, primarily from 3 IPs.',
    recommendation: 'Reinforce reporting SOP with IPs; consider automated email reminders at day 7 and day 12.',
    relatedIndicators: [], dateGenerated: '2025-06-10',
  },
  {
    id: 'AI-008', category: 'Narrative', severity: 'low',
    title: 'Draft quarterly narrative placeholder available',
    description: 'Based on demo sample data, a draft narrative placeholder for Q2 2025 can be generated covering SRHR, GEWE, AYSRHR, and PD outcomes.',
    recommendation: 'Review the draft narrative as prototype content only; do not use for donor reporting until programme validation and release gates pass.',
    relatedIndicators: [], dateGenerated: '2025-06-15',
  },
];
