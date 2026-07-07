import type { CpdIndicator } from '@/lib/types';

export const cpdIndicators: CpdIndicator[] = [
  { id: 'CPD-01', code: 'CPD.O1.1', description: 'Proportion of births attended by skilled health personnel', outputCluster: 'SRHR', baseline: 58, target: 77, actual: 72, achievementPct: 93.5, status: 'On Track', year: 2025, quarter: 'Q2' },
  { id: 'CPD-02', code: 'CPD.O1.2', description: 'Contraceptive prevalence rate (modern methods)', outputCluster: 'SRHR', baseline: 43, target: 52, actual: 48, achievementPct: 92.3, status: 'On Track', year: 2025, quarter: 'Q2' },
  { id: 'CPD-03', code: 'CPD.O1.3', description: 'Unmet need for family planning', outputCluster: 'SRHR', baseline: 24, target: 17, actual: 19, achievementPct: 71.4, status: 'Watch', year: 2025, quarter: 'Q2' },
  { id: 'CPD-04', code: 'CPD.O2.1', description: 'Adolescent birth rate (per 1,000 girls aged 15-19)', outputCluster: 'AYSRHR', baseline: 63, target: 45, actual: 52, achievementPct: 61.1, status: 'Watch', year: 2025, quarter: 'Q2' },
  { id: 'CPD-05', code: 'CPD.O2.2', description: 'Youth accessing comprehensive sexuality education', outputCluster: 'AYSRHR', baseline: 12000, target: 25000, actual: 21500, achievementPct: 86.0, status: 'On Track', year: 2025, quarter: 'Q2' },
  { id: 'CPD-06', code: 'CPD.O3.1', description: 'GBV survivors receiving multisectoral services', outputCluster: 'GEWE', baseline: 1800, target: 3500, actual: 3100, achievementPct: 88.6, status: 'On Track', year: 2025, quarter: 'Q2' },
  { id: 'CPD-07', code: 'CPD.O3.2', description: 'Functional OCMC health facilities', outputCluster: 'GEWE', baseline: 42, target: 77, actual: 69, achievementPct: 89.6, status: 'On Track', year: 2025, quarter: 'Q2' },
  { id: 'CPD-08', code: 'CPD.O3.3', description: 'Women participating in social norm change programmes', outputCluster: 'GEWE', baseline: 5000, target: 15000, actual: 8200, achievementPct: 54.7, status: 'Watch', year: 2025, quarter: 'Q2' },
  { id: 'CPD-09', code: 'CPD.O4.1', description: 'Population data systems using disaggregated census data', outputCluster: 'PD', baseline: 2, target: 7, actual: 5, achievementPct: 71.4, status: 'Watch', year: 2025, quarter: 'Q2' },
  { id: 'CPD-10', code: 'CPD.O4.2', description: 'Evidence-based policy briefs produced', outputCluster: 'PD', baseline: 3, target: 12, actual: 11, achievementPct: 91.7, status: 'On Track', year: 2025, quarter: 'Q2' },
  { id: 'CPD-11', code: 'CPD.O1.4', description: 'Health facilities providing EmONC services', outputCluster: 'SRHR', baseline: 120, target: 180, actual: 165, achievementPct: 91.7, status: 'On Track', year: 2025, quarter: 'Q2' },
  { id: 'CPD-12', code: 'CPD.O2.3', description: 'Peer educators trained and active', outputCluster: 'AYSRHR', baseline: 400, target: 1200, actual: 980, achievementPct: 81.7, status: 'On Track', year: 2025, quarter: 'Q2' },
  { id: 'CPD-13', code: 'CPD.O3.4', description: 'Male engagement sessions conducted', outputCluster: 'GEWE', baseline: 50, target: 200, actual: 65, achievementPct: 32.5, status: 'Off Track', year: 2025, quarter: 'Q2' },
  { id: 'CPD-14', code: 'CPD.O1.5', description: 'Midwives deployed in underserved areas', outputCluster: 'SRHR', baseline: 85, target: 150, actual: 140, achievementPct: 93.3, status: 'On Track', year: 2025, quarter: 'Q2' },
  { id: 'CPD-15', code: 'CPD.O3.5', description: 'Community mediation centres addressing GBV', outputCluster: 'GEWE', baseline: 30, target: 75, actual: 32, achievementPct: 42.7, status: 'Off Track', year: 2025, quarter: 'Q2' },
  { id: 'CPD-16', code: 'CPD.O2.4', description: 'Youth-friendly SRH service points established', outputCluster: 'AYSRHR', baseline: 25, target: 60, actual: 52, achievementPct: 86.7, status: 'On Track', year: 2025, quarter: 'Q2' },
  { id: 'CPD-17', code: 'CPD.O4.3', description: 'Local govts using population data for planning', outputCluster: 'PD', baseline: 15, target: 50, actual: 42, achievementPct: 84.0, status: 'On Track', year: 2025, quarter: 'Q2' },
  { id: 'CPD-18', code: 'CPD.O1.6', description: 'Post-partum family planning uptake rate', outputCluster: 'SRHR', baseline: 22, target: 40, actual: 35, achievementPct: 87.5, status: 'On Track', year: 2025, quarter: 'Q2' },
  { id: 'CPD-19', code: 'CPD.O3.6', description: 'Referral pathways for GBV services functional', outputCluster: 'GEWE', baseline: 10, target: 30, actual: 8, achievementPct: 26.7, status: 'Off Track', year: 2025, quarter: 'Q2' },
  { id: 'CPD-20', code: 'CPD.O2.5', description: 'Schools integrating CSE in curriculum', outputCluster: 'AYSRHR', baseline: 100, target: 500, actual: 115, achievementPct: 23.0, status: 'Off Track', year: 2025, quarter: 'Q2' },
];
