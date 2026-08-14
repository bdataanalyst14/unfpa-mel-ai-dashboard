import 'server-only';

import { BigQuery, type Query } from '@google-cloud/bigquery';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

import { readPrivateKeyFile } from './private-key-file';
import { createVercelWifAuthClient, type VercelWifConfig } from './vercel-gcp-wif';

const IDENTIFIER_PATTERN = /^[A-Za-z0-9_-]+$/;
const PRIVATE_KEY_DIRECTORY = '/etc/unfpa-mel/secrets';

let cachedNonWifClient: BigQuery | undefined;

export type BigQueryConfigStatus = {
  dataMode: 'bigquery' | 'mock';
  projectIdPresent: boolean;
  datasetPresent: boolean;
  locationPresent: boolean;
  clientEmailPresent: boolean;
  privateKeyPresent: boolean;
  applicationCredentialsPresent: boolean;
  authMode: 'vercel-wif' | 'adc' | 'pem' | 'none';
  wifConfigured: boolean;
  adcConfigured: boolean;
  pemConfigured: boolean;
  configured: boolean;
};

type PreflightEvidenceObject = {
  name?: unknown;
  exists?: unknown;
  rowCount?: unknown;
};

// Approved aggregate objects that are strictly allowed
export const APPROVED_OBJECTS = [
  'combined_activity_summary',
  'indicator_progress_summary',
  'data_quality_summary',
  'ip_submission_status',
];

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
  const privateKeyFile = optionalEnv('GOOGLE_PRIVATE_KEY_FILE');
  if (privateKeyFile) {
    return readPrivateKeyFile(privateKeyFile, PRIVATE_KEY_DIRECTORY);
  }

  const base64Key = optionalEnv('GOOGLE_PRIVATE_KEY_BASE64');
  if (base64Key) {
    return Buffer.from(base64Key, 'base64').toString('utf8').replace(/\\n/g, '\n').trim();
  }
  return process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n').trim();
}

type BigQueryAuthentication =
  | { mode: 'vercel-wif'; config: VercelWifConfig }
  | { mode: 'adc'; applicationCredentials: string }
  | { mode: 'pem'; clientEmail: string; privateKey: string; privateKeyFile: string };

export function getBigQueryAuthentication(): BigQueryAuthentication {
  const applicationCredentials = optionalEnv('GOOGLE_APPLICATION_CREDENTIALS');
  const clientEmail = optionalEnv('GOOGLE_CLIENT_EMAIL');
  const privateKeyFile = optionalEnv('GOOGLE_PRIVATE_KEY_FILE');
  const inlinePrivateKey = optionalEnv('GOOGLE_PRIVATE_KEY_BASE64', 'GOOGLE_PRIVATE_KEY');
  const pemConfigured = Boolean(clientEmail || privateKeyFile || inlinePrivateKey);
  const wifValues = {
    projectNumber: optionalEnv('GCP_PROJECT_NUMBER'),
    serviceAccountEmail: optionalEnv('GCP_SERVICE_ACCOUNT_EMAIL'),
    poolId: optionalEnv('GCP_WORKLOAD_IDENTITY_POOL_ID'),
    providerId: optionalEnv('GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID'),
  };
  const wifConfigured = Object.values(wifValues).some(Boolean);
  const configuredModes = [wifConfigured, Boolean(applicationCredentials), pemConfigured].filter(Boolean).length;

  if (configuredModes > 1) {
    throw new Error('Conflicting BigQuery authentication configuration.');
  }
  if (wifConfigured) {
    if (Object.values(wifValues).some((value) => !value)) {
      throw new Error('Incomplete Vercel WIF authentication configuration.');
    }
    return { mode: 'vercel-wif', config: wifValues as VercelWifConfig };
  }
  if (applicationCredentials) {
    const credentialPath = path.resolve(applicationCredentials);
    const relativePath = path.relative(process.cwd(), credentialPath);
    if (
      !path.isAbsolute(applicationCredentials)
      || relativePath === ''
      || (!relativePath.startsWith(`..${path.sep}`) && relativePath !== '..')
      || !fs.existsSync(credentialPath)
    ) {
      throw new Error('Invalid BigQuery authentication configuration.');
    }
    return { mode: 'adc', applicationCredentials: credentialPath };
  }

  const privateKey = getPrivateKey();
  if (!clientEmail || !privateKey) {
    throw new Error('Incomplete BigQuery service account configuration.');
  }
  return { mode: 'pem', clientEmail, privateKey, privateKeyFile: privateKeyFile || '' };
}

function getEvidenceFilePath(): string {
  const customFile = optionalEnv('DASHBOARD_EVIDENCE_FILE');
  if (customFile) return customFile;

  const testRoot = optionalEnv('DASHBOARD_BIGQUERY_TEST_ROOT');
  if (testRoot) {
    return path.join(testRoot, '/var/lib/unfpa-mel-dashboard/bigquery-readonly-preflight.json');
  }
  return '/var/lib/unfpa-mel-dashboard/bigquery-readonly-preflight.json';
}

function computeConfigurationHash(config: {
  projectId: string;
  datasetId: string;
  location: string;
  clientEmail: string;
  privateKeyFile: string;
  applicationCredentials: string;
  maximumBytesBilled: string;
}): string {
  return crypto
    .createHash('sha256')
    .update(
      JSON.stringify({
        projectId: config.projectId,
        datasetId: config.datasetId,
        location: config.location,
        clientEmail: config.clientEmail,
        privateKeyFile: config.privateKeyFile,
        applicationCredentials: config.applicationCredentials,
        maximumBytesBilled: config.maximumBytesBilled,
      })
    )
    .digest('hex');
}

export function getBigQueryConfigStatus(): BigQueryConfigStatus {
  const projectId = optionalEnv(
    'BIGQUERY_PROJECT_ID',
    'GOOGLE_CLOUD_PROJECT',
    'GOOGLE_CLOUD_PROJECT_ID',
  );
  const datasetId = optionalEnv('BIGQUERY_DATASET', 'BIGQUERY_DATASET_ID');
  let authentication: BigQueryAuthentication | undefined;
  try {
    authentication = getBigQueryAuthentication();
  } catch {
    authentication = undefined;
  }
  const clientEmail = authentication?.mode === 'pem' ? authentication.clientEmail : undefined;
  const privateKey = authentication?.mode === 'pem' ? authentication.privateKey : undefined;
  const applicationCredentials = authentication?.mode === 'adc'
    ? authentication.applicationCredentials
    : undefined;
  const dataMode = getDashboardDataMode();
  const location = optionalEnv('BIGQUERY_LOCATION');
  const authMode = authentication?.mode ?? 'none';

  const locationValid = location === 'asia-south1';

  let evidenceValid = false;
  if (dataMode === 'bigquery' && projectId && datasetId && locationValid && authentication) {
    try {
      const evidencePath = getEvidenceFilePath();
      if (fs.existsSync(evidencePath)) {
        const evidenceContent = fs.readFileSync(evidencePath, 'utf8');
        const evidence = JSON.parse(evidenceContent);

        const runtimeConfig = {
          projectId: projectId,
          datasetId: datasetId,
          location: location || 'asia-south1',
          clientEmail: clientEmail || '',
          privateKeyFile: optionalEnv('GOOGLE_PRIVATE_KEY_FILE') || '',
          applicationCredentials: applicationCredentials || '',
          maximumBytesBilled: optionalEnv('BIGQUERY_MAX_BYTES_BILLED') || '',
        };
        const computedHash = computeConfigurationHash(runtimeConfig);

        if (evidence.configurationHash === computedHash && Array.isArray(evidence.objects)) {
          let objectsPassed = true;
          for (const name of APPROVED_OBJECTS) {
            const obj = (evidence.objects as PreflightEvidenceObject[]).find(
              (candidate) => candidate.name === name,
            );
            if (!obj || !obj.exists || Number(obj.rowCount) < 1) {
              objectsPassed = false;
              break;
            }
          }
          if (objectsPassed) {
            evidenceValid = true;
          }
        }
      }
    } catch {
      evidenceValid = false;
    }
  }

  const configured =
    dataMode === 'bigquery' &&
    Boolean(projectId && datasetId && locationValid && authentication && evidenceValid);

  return {
    dataMode,
    projectIdPresent: Boolean(projectId),
    datasetPresent: Boolean(datasetId),
    locationPresent: locationValid,
    clientEmailPresent: Boolean(clientEmail),
    privateKeyPresent: Boolean(privateKey),
    applicationCredentialsPresent: Boolean(applicationCredentials),
    authMode,
    wifConfigured: authMode === 'vercel-wif',
    adcConfigured: authMode === 'adc',
    pemConfigured: authMode === 'pem',
    configured,
  };
}

export function getBigQueryClient(): BigQuery {
  const projectId = getBigQueryProjectId();
  const authentication = getBigQueryAuthentication();

  // WIF is deliberately request-scoped. Its supplier resolves the Vercel OIDC
  // token lazily in the active request context; no subject token is retained globally.
  if (authentication.mode === 'vercel-wif') {
    return new BigQuery({
      projectId,
      authClient: createVercelWifAuthClient(authentication.config),
    });
  }

  if (cachedNonWifClient) return cachedNonWifClient;

  cachedNonWifClient = new BigQuery({
    projectId,
    ...(authentication.mode === 'adc'
      ? { keyFilename: authentication.applicationCredentials }
      : {
          credentials: {
            client_email: authentication.clientEmail,
            private_key: authentication.privateKey,
          },
        }),
  });

  return cachedNonWifClient;
}

export function validateQuerySafety(query: string): void {
  // 1. Strip comments
  // Remove single line comments
  let cleanQuery = query.replace(/--.*$/gm, ' ');
  // Remove multi-line comments
  cleanQuery = cleanQuery.replace(/\/\*[\s\S]*?\*\//g, ' ');
  // Remove extra whitespaces/newlines for easier regex matching
  cleanQuery = cleanQuery.replace(/\s+/g, ' ').trim();

  // 2. Reject multiple statements (semi-colon injection)
  if (cleanQuery.includes(';')) {
    const parts = cleanQuery.split(';').map(p => p.trim()).filter(Boolean);
    if (parts.length > 1) {
      throw new Error('Multiple SQL statements are not permitted.');
    }
  }

  // 3. Reject DDL/DML keywords (case-insensitive)
  const ddlDmlRegex = /\b(create|drop|alter|insert|update|delete|merge|truncate|grant|revoke)\b/i;
  if (ddlDmlRegex.test(cleanQuery)) {
    throw new Error('DDL and DML statements are strictly prohibited.');
  }

  // 4. Reject forbidden substrings anywhere in the raw query (case-insensitive)
  if (/participants_flat/i.test(query)) {
    throw new Error('Access to participants_flat is prohibited.');
  }
  if (/staging/i.test(query)) {
    throw new Error('Access to staging tables is prohibited.');
  }
  if (/\bparticipants_flat\b|\bparticipants_flat_staging\b/i.test(query)) {
    throw new Error('Access to participant-level tables is prohibited.');
  }

  // 5. Extract CTE names defined in the query
  const cteNames: string[] = [];
  const cteRegex = /(?:with|,)\s+([a-zA-Z0-9_]+)\s+as\s*\(/gi;
  let cteMatch;
  while ((cteMatch = cteRegex.exec(cleanQuery)) !== null) {
    cteNames.push(cteMatch[1].trim().toLowerCase());
  }

  // 6. Extract all table references in FROM and JOIN clauses
  const tableRefRegex = /(?:from|join)\s+`?([a-zA-Z0-9_\-\.\$\{\}]+)`?/gi;
  let match;
  let hasReferences = false;

  const configuredProject = (process.env.BIGQUERY_PROJECT_ID || '').trim().toLowerCase();
  const configuredDataset = (process.env.BIGQUERY_DATASET_ID || process.env.BIGQUERY_DATASET || '').trim().toLowerCase();

  while ((match = tableRefRegex.exec(cleanQuery)) !== null) {
    hasReferences = true;
    const fullPath = match[1] || '';
    const segments = fullPath.replace(/`/g, '').split('.');

    if (segments.length === 3) {
      const [proj, ds, tbl] = segments.map(s => s.toLowerCase());

      // If project is specified, it must match configured project
      if (configuredProject && proj !== configuredProject && proj !== '${projectid}' && proj !== 'unfpadatabase') {
        throw new Error(`Access to unapproved project "${proj}" is prohibited.`);
      }

      // If dataset is specified, it must match configured dataset
      if (configuredDataset && ds !== configuredDataset && ds !== '${datasetid}') {
        throw new Error(`Access to unapproved dataset "${ds}" is prohibited.`);
      }

      const cleanTable = tbl.replace(/[^a-z0-9_-]/g, '');
      if (!APPROVED_OBJECTS.includes(cleanTable) && !cteNames.includes(cleanTable)) {
        throw new Error(`Access to table "${cleanTable}" is prohibited.`);
      }
    } else if (segments.length === 2) {
      const [ds, tbl] = segments.map(s => s.toLowerCase());

      // If dataset is specified, it must match configured dataset
      if (configuredDataset && ds !== configuredDataset && ds !== '${datasetid}') {
        throw new Error(`Access to unapproved dataset "${ds}" is prohibited.`);
      }

      const cleanTable = tbl.replace(/[^a-z0-9_-]/g, '');
      if (!APPROVED_OBJECTS.includes(cleanTable) && !cteNames.includes(cleanTable)) {
        throw new Error(`Access to table "${cleanTable}" is prohibited.`);
      }
    } else if (segments.length === 1) {
      const tbl = segments[0].toLowerCase();
      const cleanTable = tbl.replace(/[^a-z0-9_-]/g, '');

      if (!APPROVED_OBJECTS.includes(cleanTable) && !cteNames.includes(cleanTable)) {
        throw new Error(`Access to table "${cleanTable}" is prohibited.`);
      }
    } else {
      throw new Error(`Invalid table reference structure: "${fullPath}"`);
    }
  }

  if (!hasReferences) {
    throw new Error('Query must reference at least one approved table.');
  }
}

export async function runSafeBigQuery<T extends Record<string, unknown>>(
  query: string,
  params: Record<string, unknown> = {},
): Promise<T[]> {
  const location = process.env.BIGQUERY_LOCATION?.trim();
  if (location !== 'asia-south1') {
    throw new Error('BigQuery request failed. Invalid location configured.');
  }

  // Enforce query table validation
  validateQuerySafety(query);

  try {
    const maximumBytesBilled = process.env.BIGQUERY_MAX_BYTES_BILLED?.trim();
    const options: Query = {
      query,
      params,
      location: 'asia-south1',
      useLegacySql: false,
      ...(maximumBytesBilled ? { maximumBytesBilled } : {}),
    };
    const [rows] = await getBigQueryClient().query(options);
    return rows as T[];
  } catch {
    throw new Error('BigQuery request failed. Check server configuration and reporting-table access.');
  }
}
