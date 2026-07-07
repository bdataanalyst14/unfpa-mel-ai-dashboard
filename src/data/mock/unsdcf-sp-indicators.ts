import type { UnsdcfIndicator } from '@/lib/types';

export const unsdcfIndicators: UnsdcfIndicator[] = [
  { id: 'UN-01', framework: 'UNSDCF', code: 'UNSDCF.1.1', description: 'Maternal mortality ratio reduced', baseline: 239, target: 150, actual: 186, achievementPct: 59.6, status: 'Watch' },
  { id: 'UN-02', framework: 'UNSDCF', code: 'UNSDCF.1.2', description: 'Modern contraceptive prevalence among married women', baseline: 43, target: 55, actual: 49, achievementPct: 89.1, status: 'On Track' },
  { id: 'UN-03', framework: 'CP9', code: 'CP9.1.1', description: 'Quality SRH services accessible in target districts', baseline: 35, target: 65, actual: 58, achievementPct: 89.2, status: 'On Track' },
  { id: 'UN-04', framework: 'CP9', code: 'CP9.2.1', description: 'Adolescents reached with CSE and SRH', baseline: 8000, target: 22000, actual: 19500, achievementPct: 88.6, status: 'On Track' },
  { id: 'UN-05', framework: 'SP', code: 'SP.1.1', description: 'Countries with reduced unmet need for FP', baseline: 0, target: 1, actual: 1, achievementPct: 100, status: 'On Track' },
  { id: 'UN-06', framework: 'SP', code: 'SP.2.1', description: 'Countries with reduced maternal deaths', baseline: 0, target: 1, actual: 0, achievementPct: 0, status: 'Off Track' },
  { id: 'UN-07', framework: 'SP', code: 'SP.3.1', description: 'Countries addressing GBV through multisectoral approach', baseline: 0, target: 1, actual: 1, achievementPct: 100, status: 'On Track' },
  { id: 'UN-08', framework: 'UNSDCF', code: 'UNSDCF.2.1', description: 'Reduction in child marriage prevalence', baseline: 40, target: 25, actual: 32, achievementPct: 53.3, status: 'Watch' },
];
