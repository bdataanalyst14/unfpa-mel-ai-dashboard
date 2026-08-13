import 'server-only';

import { gbvServiceData } from '@/data/mock/gbv-services';
import type { GbvServiceRecord } from '@/lib/types';
import type {
  SafeGbvChartDatum,
  SafeGbvDashboardData,
  SafeGbvValue,
} from '@/lib/gbv-safe-types';
import {
  suppressComplementaryValue,
  suppressCount,
  suppressPercentage,
  type SuppressionResult,
} from './suppression';

function safeValue(result: SuppressionResult): SafeGbvValue {
  return {
    displayValue: result.displayValue,
    chartValue: result.value ?? 0,
    suppressed: result.suppressed,
  };
}

type CountCategory = {
  name: string;
  count: number;
  color?: string;
};

function applyComplementarySuppression(
  results: SuppressionResult[],
  total: SuppressionResult,
): SuppressionResult[] {
  const primarySuppressed = results
    .map((result, index) => ({ result, index }))
    .filter(({ result }) => result.suppression_reason === 'small_cell');

  if (total.suppressed || primarySuppressed.length !== 1) return results;

  const complement = results
    .map((result, index) => ({ result, index }))
    .filter(({ result }) => !result.suppressed && result.value !== null)
    .sort((left, right) => (left.result.value ?? 0) - (right.result.value ?? 0))[0];

  if (!complement) return results;

  return results.map((result, index) =>
    index === complement.index ? suppressComplementaryValue() : result,
  );
}

function safeCountSeries(
  categories: CountCategory[],
  total: SuppressionResult,
): SafeGbvChartDatum[] {
  const protectedResults = applyComplementarySuppression(
    categories.map(({ count }) => suppressCount(count)),
    total,
  );

  return categories.map((category, index) => ({
    name: category.name,
    ...(category.color ? { color: category.color } : {}),
    ...safeValue(protectedResults[index]),
  }));
}

function groupCounts(
  records: GbvServiceRecord[],
  key: (record: GbvServiceRecord) => string,
  value: (record: GbvServiceRecord) => number,
): CountCategory[] {
  const totals = new Map<string, number>();
  for (const record of records) {
    const name = key(record);
    totals.set(name, (totals.get(name) ?? 0) + value(record));
  }
  return Array.from(totals, ([name, count]) => ({ name, count }));
}

export function buildSafeGbvDashboardData(
  records: GbvServiceRecord[],
): SafeGbvDashboardData {
  const aggregateTotal = records.reduce((sum, row) => sum + row.totalSurvivors, 0);
  const aggregateFemale = records.reduce((sum, row) => sum + row.femaleSurvivors, 0);
  const aggregateReferrals = records.reduce((sum, row) => sum + row.referralCount, 0);
  const aggregateFollowUps = records.reduce((sum, row) => sum + row.followUpCount, 0);
  const totalResult = suppressCount(aggregateTotal);

  const casteTotals: Record<string, number> = {};
  for (const row of records) {
    for (const [category, count] of Object.entries(row.byCasteEthnicity)) {
      casteTotals[category] = (casteTotals[category] ?? 0) + count;
    }
  }

  const colors = ['#004B87', '#0066B3', '#FF6600', '#FF8533', '#10B981', '#F59E0B', '#6B7280'];
  const provinceCategories = groupCounts(
    records,
    (row) => row.province,
    (row) => row.totalSurvivors,
  ).map((category, index) => ({
    ...category,
    color: colors[index % colors.length],
  }));
  const casteCategories = Object.entries(casteTotals).map(([name, count]) => ({
    name,
    count,
  }));
  const districtTotalResults = applyComplementarySuppression(
    records.map((row) => suppressCount(row.totalSurvivors)),
    totalResult,
  );

  return {
    kpis: {
      total: safeValue(totalResult),
      female: safeValue(suppressCount(aggregateFemale)),
      femaleShare: safeValue(suppressPercentage(aggregateFemale, aggregateTotal)),
      referrals: safeValue(suppressCount(aggregateReferrals)),
      followUps: safeValue(suppressCount(aggregateFollowUps)),
    },
    provinceChart: safeCountSeries(provinceCategories, totalResult),
    casteChart: safeCountSeries(casteCategories, totalResult),
    rows: records.map((row, index) => {
      const total = districtTotalResults[index];
      const sexResults = total.suppression_reason === 'complementary_cell'
        ? [suppressComplementaryValue(), suppressComplementaryValue()]
        : applyComplementarySuppression(
          [
            suppressCount(row.femaleSurvivors),
            suppressCount(row.maleSurvivors),
          ],
          suppressCount(row.totalSurvivors),
        );
      const derivedValuesSuppressed =
        total.suppression_reason === 'complementary_cell';

      return {
        province: row.province,
        district: row.district,
        total: safeValue(total),
        female: safeValue(sexResults[0]),
        male: safeValue(sexResults[1]),
        under15Share: safeValue(
          derivedValuesSuppressed
            ? suppressComplementaryValue()
            : suppressPercentage(row.under15, row.totalSurvivors),
        ),
        referralRate: safeValue(
          derivedValuesSuppressed
            ? suppressComplementaryValue()
            : suppressPercentage(row.referralCount, row.totalSurvivors),
        ),
      };
    }),
  };
}

export function getSafeGbvMockDashboardData(province?: string): SafeGbvDashboardData {
  const rows = province
    ? gbvServiceData.filter((row) => row.province === province)
    : gbvServiceData;
  return buildSafeGbvDashboardData(rows);
}
