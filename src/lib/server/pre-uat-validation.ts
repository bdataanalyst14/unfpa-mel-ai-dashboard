import 'server-only';

import { getDashboardAuthorization } from './auth-guard';
import {
  getBigQueryConfigStatus,
  getBigQueryDatasetId,
  getBigQueryProjectId,
  getDashboardDataMode,
  runSafeBigQuery,
} from './bigquery-client';

type ValidationCode =
  | 'BLOCKED_AUTHORIZATION'
  | 'BLOCKED_CONFIGURATION'
  | 'BLOCKED_COST_LIMIT'
  | 'BLOCKED_EMPTY_VIEW'
  | 'FAILED_READ_OR_SCHEMA'
  | 'PASSED_READ_AND_SCHEMA';

export type PreUatValidationResult = {
  code: ValidationCode;
  completedViews: number;
  lineageVerified: false;
  uatApproved: false;
};

function result(code: ValidationCode, completedViews = 0): PreUatValidationResult {
  return { code, completedViews, lineageVerified: false, uatApproved: false };
}

const projections = [
  ['repeatdata', 'COUNT(*)'],
  ['activity_summary', 'COUNT(*)'],
  ['combined_activity_summary', `
    SUM(event_count), SUM(total_participants), SUM(total_reportable_participants),
    SUM(female), SUM(male), SUM(other), SUM(withdisability),
    MAX(TRIM(reporting_year1)), MAX(TRIM(report_quarter1)), MAX(TRIM(project1)),
    MAX(TRIM(ip_name)), MAX(TRIM(province1)), MAX(TRIM(district1)), MAX(TRIM(palika1))
  `],
  ['indicator_progress_summary', `
    MAX(TRIM(indicator1)), MAX(TRIM(activity1)), MAX(TRIM(reporting_year1))
  `],
  ['data_quality_summary', `
    SUM(total_rows), SUM(records_with_quality_issue), MAX(run_timestamp)
  `],
  ['ip_submission_status', `
    MAX(TRIM(ip_name)), SUM(total_submissions), SUM(total_events), MAX(latest_sync_time)
  `],
] as const;

export async function validatePreUatReadAccess(): Promise<PreUatValidationResult> {
  let completedViews = 0;
  try {
    const authorization = await getDashboardAuthorization();
    if (!authorization.allowed || authorization.role !== 'ADMIN') {
      return result('BLOCKED_AUTHORIZATION');
    }
    const config = getBigQueryConfigStatus();
    if (getDashboardDataMode() !== 'bigquery' || !config.dataModeConfigurationValid
      || !config.configured || config.authMode !== 'vercel-wif') {
      return result('BLOCKED_CONFIGURATION');
    }
    const costLimit = process.env.BIGQUERY_MAX_BYTES_BILLED?.trim() ?? '';
    if (!/^\d+$/.test(costLimit) || BigInt(costLimit) < BigInt(1) || BigInt(costLimit) > BigInt(1_000_000_000)) {
      return result('BLOCKED_COST_LIMIT');
    }
    const project = getBigQueryProjectId();
    const dataset = getBigQueryDatasetId();
    for (const [view, projection] of projections) {
      const source = `\`${project}.${dataset}.${view}\``;
      await runSafeBigQuery(`SELECT ${projection} FROM ${source} WHERE FALSE LIMIT 0`);
      const rows = await runSafeBigQuery<{ available: boolean }>(
        `SELECT COUNT(*) > 0 AS available FROM ${source}`,
      );
      if (rows.length !== 1 || rows[0].available !== true) {
        return result('BLOCKED_EMPTY_VIEW', completedViews);
      }
      completedViews += 1;
    }
    return result('PASSED_READ_AND_SCHEMA', completedViews);
  } catch {
    return result('FAILED_READ_OR_SCHEMA', completedViews);
  }
}
