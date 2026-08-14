/* eslint-disable @typescript-eslint/no-require-imports -- shared CommonJS contract is loaded by Node prebuild and Next server runtime */
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const CONTRACT_VERSION = 1;
const MANIFEST_RELATIVE_PATH = '.vercel-runtime/bigquery-readiness-manifest.json';
const APPROVED_OBJECTS = Object.freeze([
  'combined_activity_summary',
  'indicator_progress_summary',
  'data_quality_summary',
  'ip_submission_status',
]);

function value(env, name) {
  return env[name]?.trim() || undefined;
}

function canonicalize(input) {
  if (Array.isArray(input)) return `[${input.map(canonicalize).join(',')}]`;
  if (input && typeof input === 'object') {
    return `{${Object.keys(input).sort().map((key) => `${JSON.stringify(key)}:${canonicalize(input[key])}`).join(',')}}`;
  }
  return JSON.stringify(input);
}

function configurationHash(payload) {
  return crypto.createHash('sha256').update(canonicalize(payload)).digest('hex');
}

function requestedDataMode(env) {
  const dashboardMode = value(env, 'DASHBOARD_DATA_MODE')?.toLowerCase();
  const dataMode = value(env, 'DATA_MODE')?.toLowerCase();
  if (dashboardMode && dataMode && dashboardMode !== dataMode) {
    throw new Error('Conflicting dashboard data mode configuration.');
  }
  return dashboardMode === 'bigquery' || dataMode === 'bigquery' ? 'bigquery' : 'mock';
}

function detectAuthMode(env) {
  const wifNames = [
    'GCP_PROJECT_NUMBER', 'GCP_SERVICE_ACCOUNT_EMAIL',
    'GCP_WORKLOAD_IDENTITY_POOL_ID', 'GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID',
  ];
  const wifPresent = wifNames.some((name) => value(env, name));
  const adcPresent = Boolean(value(env, 'GOOGLE_APPLICATION_CREDENTIALS'));
  const pemPresent = Boolean(
    value(env, 'GOOGLE_CLIENT_EMAIL')
    || value(env, 'GOOGLE_PRIVATE_KEY_FILE')
    || value(env, 'GOOGLE_PRIVATE_KEY_BASE64')
    || value(env, 'GOOGLE_PRIVATE_KEY'),
  );
  if ([wifPresent, adcPresent, pemPresent].filter(Boolean).length > 1) {
    throw new Error('Conflicting BigQuery authentication configuration.');
  }
  if (wifPresent) return 'VERCEL_GCP_WIF';
  if (adcPresent || pemPresent) return 'EXTERNAL_EVIDENCE';
  return 'NONE';
}

function requireValues(env, names) {
  for (const name of names) {
    if (!value(env, name)) throw new Error(`Missing required Vercel readiness configuration: ${name}`);
  }
}

function createSemanticPayload(env) {
  const dataMode = requestedDataMode(env);
  if (dataMode === 'mock') {
    return {
      contractVersion: CONTRACT_VERSION,
      dataMode: 'mock',
      authMode: 'NONE',
      bigQuery: null,
      wif: null,
      approvedObjects: [...APPROVED_OBJECTS],
    };
  }

  const authMode = detectAuthMode(env);
  if (authMode === 'NONE') {
    throw new Error('Missing BigQuery authentication configuration for live build.');
  }
  requireValues(env, ['BIGQUERY_PROJECT_ID', 'BIGQUERY_DATASET_ID', 'BIGQUERY_LOCATION']);
  if (value(env, 'BIGQUERY_LOCATION') !== 'asia-south1') {
    throw new Error('Invalid Vercel readiness location; expected asia-south1.');
  }

  const bigQuery = {
    projectId: value(env, 'BIGQUERY_PROJECT_ID'),
    datasetId: value(env, 'BIGQUERY_DATASET_ID'),
    location: value(env, 'BIGQUERY_LOCATION'),
    ...(value(env, 'BIGQUERY_MAX_BYTES_BILLED')
      ? { maximumBytesBilled: value(env, 'BIGQUERY_MAX_BYTES_BILLED') }
      : {}),
  };

  if (authMode === 'VERCEL_GCP_WIF') {
    requireValues(env, [
      'GCP_PROJECT_NUMBER', 'GCP_SERVICE_ACCOUNT_EMAIL',
      'GCP_WORKLOAD_IDENTITY_POOL_ID', 'GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID',
    ]);
    return {
      contractVersion: CONTRACT_VERSION,
      dataMode: 'bigquery',
      authMode,
      bigQuery,
      wif: {
        gcpProjectNumber: value(env, 'GCP_PROJECT_NUMBER'),
        serviceAccountEmail: value(env, 'GCP_SERVICE_ACCOUNT_EMAIL'),
        workloadIdentityPoolId: value(env, 'GCP_WORKLOAD_IDENTITY_POOL_ID'),
        workloadIdentityProviderId: value(env, 'GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID'),
      },
      approvedObjects: [...APPROVED_OBJECTS],
    };
  }

  return {
    contractVersion: CONTRACT_VERSION,
    dataMode: 'bigquery',
    authMode,
    bigQuery,
    wif: null,
    approvedObjects: [...APPROVED_OBJECTS],
  };
}

function createManifest(env, sourceCommit) {
  const payload = createSemanticPayload(env);
  return {
    ...payload,
    configurationHash: configurationHash(payload),
    ...(sourceCommit ? { sourceCommit } : {}),
  };
}

function semanticPayloadFromManifest(manifest) {
  return {
    contractVersion: manifest.contractVersion,
    dataMode: manifest.dataMode,
    authMode: manifest.authMode,
    bigQuery: manifest.bigQuery,
    wif: manifest.wif,
    approvedObjects: manifest.approvedObjects,
  };
}

function exactApprovedObjects(objects) {
  return Array.isArray(objects)
    && objects.length === APPROVED_OBJECTS.length
    && objects.every((name, index) => name === APPROVED_OBJECTS[index]);
}

function validateManifest(manifest, env) {
  if (!manifest || typeof manifest !== 'object' || Array.isArray(manifest)) return false;
  if (manifest.contractVersion !== CONTRACT_VERSION) return false;
  if (manifest.dataMode !== 'bigquery' || manifest.authMode !== 'VERCEL_GCP_WIF') return false;
  if (!exactApprovedObjects(manifest.approvedObjects)) return false;
  if (typeof manifest.configurationHash !== 'string' || !/^[a-f0-9]{64}$/.test(manifest.configurationHash)) return false;
  try {
    const expected = createSemanticPayload(env);
    if (expected.authMode !== 'VERCEL_GCP_WIF' || expected.dataMode !== 'bigquery') return false;
    const payload = semanticPayloadFromManifest(manifest);
    return canonicalize(payload) === canonicalize(expected)
      && configurationHash(payload) === manifest.configurationHash
      && configurationHash(expected) === manifest.configurationHash;
  } catch {
    return false;
  }
}

function loadAndValidateManifest(env, manifestPath = path.join(process.cwd(), MANIFEST_RELATIVE_PATH)) {
  try {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    return validateManifest(manifest, env);
  } catch {
    return false;
  }
}

module.exports = {
  APPROVED_OBJECTS,
  CONTRACT_VERSION,
  MANIFEST_RELATIVE_PATH,
  canonicalize,
  configurationHash,
  createManifest,
  createSemanticPayload,
  exactApprovedObjects,
  loadAndValidateManifest,
  validateManifest,
};
