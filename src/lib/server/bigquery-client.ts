import 'server-only';

import { BigQuery, type Query } from '@google-cloud/bigquery';

const IDENTIFIER_PATTERN = /^[A-Za-z0-9_-]+$/;

let client: BigQuery | undefined;

export type BigQueryConfigStatus = {
  dataMode: 'bigquery' | 'mock';
  projectIdPresent: boolean;
  datasetPresent: boolean;
  locationPresent: boolean;
  clientEmailPresent: boolean;
  privateKeyPresent: boolean;
  configured: boolean;
};

function requiredEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required server configuration: ${name}`);
  }
  return value;
}

function optionalEnv(...names: string[]): string | undefined {
  for (const name of names) {
    const value = process.env[name]?.trim();
    if (value) return value;
  }
  return undefined;
}

export function getDashboardDataMode(): 'bigquery' | 'mock' {
  const mode = optionalEnv('DASHBOARD_DATA_MODE', 'DATA_MODE')?.toLowerCase();
  return mode === 'bigquery' ? 'bigquery' : 'mock';
}

export function getBigQueryProjectId(): string {
  const projectId =
    optionalEnv('BIGQUERY_PROJECT_ID', 'GOOGLE_CLOUD_PROJECT', 'GOOGLE_CLOUD_PROJECT_ID') ??
    requiredEnv('BIGQUERY_PROJECT_ID');
  if (!IDENTIFIER_PATTERN.test(projectId)) {
    throw new Error('Invalid BigQuery project configuration.');
  }
  return projectId;
}

export function getBigQueryDatasetId(): string {
  const datasetId =
    optionalEnv('BIGQUERY_DATASET', 'BIGQUERY_DATASET_ID') ??
    requiredEnv('BIGQUERY_DATASET');
  if (!IDENTIFIER_PATTERN.test(datasetId)) {
    throw new Error('Invalid BigQuery dataset configuration.');
  }
  return datasetId;
}

function getPrivateKey(): string | undefined {
  const base64Key = optionalEnv('GOOGLE_PRIVATE_KEY_BASE64');
  if (base64Key) {
    return Buffer.from(base64Key, 'base64').toString('utf8').replace(/\\n/g, '\n').trim();
  }
  return process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n').trim();
}

export function getBigQueryConfigStatus(): BigQueryConfigStatus {
  const projectId = optionalEnv(
    'BIGQUERY_PROJECT_ID',
    'GOOGLE_CLOUD_PROJECT',
    'GOOGLE_CLOUD_PROJECT_ID',
  );
  const datasetId = optionalEnv('BIGQUERY_DATASET', 'BIGQUERY_DATASET_ID');
  const clientEmail = optionalEnv('GOOGLE_CLIENT_EMAIL');
  const privateKey = getPrivateKey();
  const dataMode = getDashboardDataMode();

  return {
    dataMode,
    projectIdPresent: Boolean(projectId),
    datasetPresent: Boolean(datasetId),
    locationPresent: Boolean(optionalEnv('BIGQUERY_LOCATION')),
    clientEmailPresent: Boolean(clientEmail),
    privateKeyPresent: Boolean(privateKey),
    configured: dataMode === 'bigquery' && Boolean(projectId && datasetId),
  };
}

function getBigQueryClient(): BigQuery {
  if (client) return client;

  const projectId = getBigQueryProjectId();
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL?.trim();
  const privateKey = getPrivateKey();

  if ((clientEmail && !privateKey) || (!clientEmail && privateKey)) {
    throw new Error('Incomplete BigQuery service account configuration.');
  }

  client = new BigQuery({
    projectId,
    ...(clientEmail && privateKey
      ? { credentials: { client_email: clientEmail, private_key: privateKey } }
      : {}),
  });

  return client;
}

export async function runSafeBigQuery<T extends Record<string, unknown>>(
  query: string,
  params: Record<string, unknown> = {},
): Promise<T[]> {
  try {
    const maximumBytesBilled = process.env.BIGQUERY_MAX_BYTES_BILLED?.trim();
    const options: Query = {
      query,
      params,
      location: process.env.BIGQUERY_LOCATION?.trim() || 'asia-south1',
      useLegacySql: false,
      ...(maximumBytesBilled ? { maximumBytesBilled } : {}),
    };
    const [rows] = await getBigQueryClient().query(options);
    return rows as T[];
  } catch {
    throw new Error('BigQuery request failed. Check server configuration and reporting-table access.');
  }
}
