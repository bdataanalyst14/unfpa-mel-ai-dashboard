import 'server-only';

import { getDashboardDataMode, getBigQueryConfigStatus } from './bigquery-client';
import {
  getLiveDashboardFilterOptions,
  type DashboardFilterOptions,
} from './dashboard-page-data-service';

export type DashboardRuntime = {
  dataMode: 'bigquery' | 'mock';
  filterOptions?: DashboardFilterOptions;
  filtersAvailable: boolean;
  filterMessage: string;
};

export async function getDashboardRuntime(): Promise<DashboardRuntime> {
  const dataMode = getDashboardDataMode();
  if (dataMode === 'mock') {
    return {
      dataMode,
      filtersAvailable: true,
      filterMessage: 'Demo / mock data filters are active for development and demonstration only.',
    };
  }

  const config = getBigQueryConfigStatus();
  if (!config.dataModeConfigurationValid || !config.configured) {
    return {
      dataMode,
      filtersAvailable: false,
      filterMessage: 'Live filters are unavailable because the approved BigQuery configuration is not ready. No demo or mock data is used.',
    };
  }

  try {
    return {
      dataMode,
      filterOptions: await getLiveDashboardFilterOptions(),
      filtersAvailable: true,
      filterMessage: 'Live filters are sourced from approved aggregate BigQuery data and applied only where each route contract supports them.',
    };
  } catch {
    return {
      dataMode,
      filtersAvailable: false,
      filterMessage: 'Live filters are unavailable because an approved BigQuery aggregate view could not be read. No demo or mock data is used.',
    };
  }
}
