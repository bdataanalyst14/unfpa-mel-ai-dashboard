require('dotenv').config({ path: '.env.local' });
process.env.DASHBOARD_DATA_MODE = 'bigquery';
process.env.DATA_MODE = 'bigquery';

const { getLiveDashboardFilterOptions, getDashboardPageData } = require('./src/lib/server/dashboard-page-data-service.ts');

// We need to use ts-node or similar, let's write a small wrapper that compiles ts
