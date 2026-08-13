const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const APPROVED_OBJECTS = [
  'combined_activity_summary',
  'indicator_progress_summary',
  'data_quality_summary',
  'ip_submission_status',
];
const FORBIDDEN_OBJECTS = new Set(['participants_flat', 'participants_flat_staging']);

function paths(root = '') {
  const rooted = (value) => root ? path.join(root, value.replace(/^[/\\]+/, '')) : value;
  return {
    environmentFile: rooted('/etc/unfpa-mel-dashboard/bigquery-readonly.env'),
    runtimeEnvironmentFile: rooted('/etc/unfpa-mel/dashboard.env'),
    privateKeyFile: rooted('/etc/unfpa-mel/secrets/google-private-key.pem'),
    evidenceDirectory: rooted('/var/lib/unfpa-mel-dashboard'),
    evidenceFile: rooted('/var/lib/unfpa-mel-dashboard/bigquery-readonly-preflight.json'),
  };
}

function parseEnvironment(text) {
  const environment = {};
  for (const line of text.split(/\r?\n/)) {
    if (!line || line.startsWith('#')) continue;
    const separator = line.indexOf('=');
    if (separator < 1) throw new Error('readonly_environment_invalid');
    const key = line.slice(0, separator);
    if (!/^[A-Z][A-Z0-9_]*$/.test(key) || Object.hasOwn(environment, key)) throw new Error('readonly_environment_invalid');
    environment[key] = line.slice(separator + 1);
  }
  return environment;
}

function loadConfiguration(targetPaths = paths()) {
  const environment = fs.existsSync(targetPaths.environmentFile)
    ? parseEnvironment(fs.readFileSync(targetPaths.environmentFile, 'utf8'))
    : process.env;
  const configuration = {
    projectId: environment.BIGQUERY_PROJECT_ID,
    datasetId: environment.BIGQUERY_DATASET_ID,
    location: environment.BIGQUERY_LOCATION,
    clientEmail: environment.GOOGLE_CLIENT_EMAIL,
    privateKeyFile: environment.GOOGLE_PRIVATE_KEY_FILE,
    applicationCredentials: environment.GOOGLE_APPLICATION_CREDENTIALS,
    maximumBytesBilled: environment.BIGQUERY_MAX_BYTES_BILLED,
    dashboardDataMode: environment.DASHBOARD_DATA_MODE,
    dataMode: environment.DATA_MODE,
  };
  if (configuration.projectId !== 'unfpadatabase') throw new Error('bigquery_project_not_approved');
  if (!/^[A-Za-z_][A-Za-z0-9_]{0,1023}$/.test(configuration.datasetId || '')) throw new Error('bigquery_dataset_invalid');
  if (configuration.location !== 'asia-south1') throw new Error('bigquery_location_not_approved');
  const adcConfigured = Boolean(configuration.applicationCredentials);
  const pemConfigured = Boolean(configuration.clientEmail || configuration.privateKeyFile);
  if (adcConfigured && pemConfigured) throw new Error('bigquery_authentication_mode_conflict');
  if (adcConfigured) {
    const credentialPath = path.resolve(configuration.applicationCredentials);
    const repositoryRoot = path.resolve(__dirname, '../..');
    const relativePath = path.relative(repositoryRoot, credentialPath);
    if (!path.isAbsolute(configuration.applicationCredentials)
      || relativePath === ''
      || (!relativePath.startsWith(`..${path.sep}`) && relativePath !== '..')
      || !fs.existsSync(credentialPath)) {
      throw new Error('google_application_credentials_invalid');
    }
    configuration.applicationCredentials = credentialPath;
  } else {
    if (!configuration.clientEmail || !/^[^@\s]+@[^@\s]+$/.test(configuration.clientEmail)) throw new Error('google_client_email_invalid');
    if (!configuration.privateKeyFile) throw new Error('google_private_key_file_missing');
    if (configuration.privateKeyFile !== targetPaths.privateKeyFile) throw new Error('google_private_key_file_not_approved');
    if (!fs.existsSync(configuration.privateKeyFile)) throw new Error('google_private_key_file_missing');
  }
  if (configuration.maximumBytesBilled && !/^\d+$/.test(configuration.maximumBytesBilled)) throw new Error('bigquery_maximum_bytes_invalid');
  return { environment, configuration };
}

function configurationHash(configuration) {
  return crypto.createHash('sha256').update(JSON.stringify({
    projectId: configuration.projectId,
    datasetId: configuration.datasetId,
    location: configuration.location,
    clientEmail: configuration.clientEmail || '',
    privateKeyFile: configuration.privateKeyFile || '',
    applicationCredentials: configuration.applicationCredentials || '',
    maximumBytesBilled: configuration.maximumBytesBilled || '',
  })).digest('hex');
}

function atomicWrite(file, content, mode = 0o640) {
  fs.mkdirSync(path.dirname(file), { recursive: true, mode: 0o750 });
  const ownership = fs.existsSync(file) ? fs.statSync(file) : null;
  const temporary = path.join(path.dirname(file), `.${path.basename(file)}.${process.pid}.${crypto.randomUUID()}.tmp`);
  fs.writeFileSync(temporary, content, { mode, flag: 'wx' });
  fs.chmodSync(temporary, mode);
  if (ownership && process.platform !== 'win32') fs.chownSync(temporary, ownership.uid, ownership.gid);
  fs.renameSync(temporary, file);
}

async function defaultClientFactory(configuration) {
  const { BigQuery } = require('@google-cloud/bigquery');
  if (configuration.applicationCredentials) {
    return new BigQuery({
      projectId: configuration.projectId,
      keyFilename: configuration.applicationCredentials,
    });
  }
  const privateKey = fs.readFileSync(configuration.privateKeyFile, 'utf8').trim();
  return new BigQuery({
    projectId: configuration.projectId,
    credentials: { client_email: configuration.clientEmail, private_key: privateKey },
  });
}

function approvedObject(name) {
  if (FORBIDDEN_OBJECTS.has(name) || !APPROVED_OBJECTS.includes(name)) throw new Error('reporting_object_not_approved');
  return name;
}

async function inspectReportingObjects(client, configuration) {
  const dataset = client.dataset(configuration.datasetId);
  const [datasetMetadata] = await dataset.getMetadata();
  if (datasetMetadata.location !== 'asia-south1') throw new Error('bigquery_dataset_location_mismatch');
  
  const objects = [];
  const requiredColumns = {
    combined_activity_summary: [
      'event_count',
      'total_reportable_participants',
      'female',
      'male',
      'other',
      'repeat_beneficiary_total',
      'repeat_guest_total',
      'repeat_nonreportable_total',
      'district1',
      'ip_name',
      'reporting_year1',
      'report_quarter1',
      'project1',
      'province1'
    ],
    indicator_progress_summary: [
      'indicator1', 'ip_name', 'reporting_year1',
      'activity1'
    ],
    data_quality_summary: [
      'total_rows', 'ip_name',
      'records_with_quality_issue',
      'run_timestamp'
    ],
    ip_submission_status: [
      'ip_name',
      'total_submissions',
      'total_events',
      'latest_sync_time'
    ]
  };

  const prohibitedPatterns = [/survivor/i, /pii/i, /phone/i, /email/i, /national_id/i, /ssn/i, /password/i, /secret/i, /token/i, /private_key/i];

  for (const requestedName of APPROVED_OBJECTS) {
    const name = approvedObject(requestedName);
    let exists = true;
    let tableMetadata;
    try {
      [tableMetadata] = await dataset.table(name).getMetadata();
    } catch (error) {
      if (error?.code === 404) exists = false;
      else throw error;
    }
    
    let rowCount = 0;
    let organizationCount = 0;
    let reportingYears = [];
    if (exists) {
      // Validate schema columns
      const fields = tableMetadata.schema?.fields || [];
      const columnNames = fields.map((f) => f.name.toLowerCase());
      
      // Check required columns
      const reqCols = requiredColumns[name] || [];
      for (const col of reqCols) {
        if (!columnNames.includes(col.toLowerCase())) {
          throw new Error(`Required column "${col}" is missing in table "${name}".`);
        }
      }

      // Check prohibited sensitive columns
      for (const col of columnNames) {
        for (const pattern of prohibitedPatterns) {
          if (pattern.test(col)) {
            throw new Error(`Prohibited sensitive column "${col}" detected in table "${name}".`);
          }
        }
      }

      // Block DDL/DML and prohibited table names
      const query = `SELECT COUNT(*) AS row_count FROM \`${configuration.projectId}.${configuration.datasetId}.${name}\``;
      if (/participants_flat/i.test(query)) throw new Error('restricted_raw_table_forbidden');
      if (/\b(?:create|drop|alter|insert|update|delete|merge|truncate)\b/i.test(query)) {
        throw new Error('DDL or DML operations are strictly prohibited.');
      }

      const [rows] = await client.query({
        query,
        location: configuration.location,
        useLegacySql: false,
        ...(configuration.maximumBytesBilled ? { maximumBytesBilled: configuration.maximumBytesBilled } : {}),
      });
      rowCount = Number(rows[0]?.row_count ?? 0);
      if (rowCount < 1) {
        throw new Error(`Reporting object "${name}" must have rows (found 0).`);
      }

      const organizationQuery = `SELECT COUNT(DISTINCT ip_name) AS organization_count FROM \`${configuration.projectId}.${configuration.datasetId}.${name}\``;
      const [organizationRows] = await client.query({
        query: organizationQuery,
        location: configuration.location,
        useLegacySql: false,
      });
      organizationCount = Number(organizationRows[0]?.organization_count ?? 0);
      if (organizationCount !== 15) {
        throw new Error(`Reporting object "${name}" does not represent exactly 15 organizations.`);
      }

      // Verify that ip_submission_status represents exactly 15 organizations
      if (name === 'ip_submission_status') {
        const ipQuery = `SELECT COUNT(DISTINCT ip_name) AS ip_count FROM \`${configuration.projectId}.${configuration.datasetId}.ip_submission_status\``;
        const [ipRows] = await client.query({
          ipQuery,
          query: ipQuery,
          location: configuration.location,
          useLegacySql: false,
        });
        const ipCount = Number(ipRows[0]?.ip_count ?? 0);
        if (ipCount !== 15) {
          throw new Error(`ip_submission_status does not represent exactly 15 organizations (found ${ipCount}).`);
        }
      }

      // Verify reporting years are within 2025–2030 in combined_activity_summary
      if (name === 'combined_activity_summary' || name === 'indicator_progress_summary') {
        const yearQuery = `
          SELECT
            ARRAY_AGG(DISTINCT TRIM(CAST(reporting_year1 AS STRING)) ORDER BY TRIM(CAST(reporting_year1 AS STRING))) AS reporting_years,
            COUNTIF(NOT REGEXP_CONTAINS(TRIM(CAST(reporting_year1 AS STRING)), r'^\\d{4}$')) AS malformed_year_count,
            COUNTIF(SAFE_CAST(reporting_year1 AS INT64) NOT BETWEEN 2025 AND 2030) AS out_of_range_year_count
          FROM \`${configuration.projectId}.${configuration.datasetId}.${name}\`
          WHERE reporting_year1 IS NOT NULL AND TRIM(CAST(reporting_year1 AS STRING)) != ''
        `;
        const [yearRows] = await client.query({
          query: yearQuery,
          location: configuration.location,
          useLegacySql: false,
        });
        reportingYears = yearRows[0]?.reporting_years || [];
        if (Number(yearRows[0]?.malformed_year_count ?? 0) !== 0
          || Number(yearRows[0]?.out_of_range_year_count ?? 0) !== 0) {
          throw new Error(`Reporting object "${name}" contains invalid reporting years.`);
        }
      }
    } else {
      throw new Error(`Approved table "${name}" does not exist.`);
    }
    
    objects.push({ name, exists, rowCount, organizationCount, reportingYears });
  }
  return objects;
}

async function runPreflight({
  targetPaths = paths(),
  clientFactory = defaultClientFactory,
  writeEvidence = true,
  now = new Date(),
} = {}) {
  try {
    const { configuration } = loadConfiguration(targetPaths);
    const client = await clientFactory(configuration);
    const objects = await inspectReportingObjects(client, configuration);
    const failures = objects.filter((object) => !object.exists || object.rowCount < 1);
    const output = {
      valid: failures.length === 0,
      project: configuration.projectId,
      dataset: configuration.datasetId,
      location: configuration.location,
      objects,
    };
    if (!failures.length && writeEvidence) {
      atomicWrite(targetPaths.evidenceFile, JSON.stringify({
        version: 1,
        validatedAt: now.toISOString(),
        configurationHash: configurationHash(configuration),
        objects,
      }, null, 2) + '\n');
    }
    return { exitCode: failures.length ? 1 : 0, output };
  } catch {
    return { exitCode: 1, output: { valid: false, reason: 'bigquery_readonly_preflight_failed' } };
  }
}

function activationPlan({ targetPaths = paths(), apply = false, uid = 0, now = new Date() } = {}) {
  const { configuration } = loadConfiguration(targetPaths);
  let evidence;
  try {
    evidence = JSON.parse(fs.readFileSync(targetPaths.evidenceFile, 'utf8'));
  } catch {
    throw new Error('successful_preflight_evidence_required');
  }
  if (evidence.configurationHash !== configurationHash(configuration)) throw new Error('preflight_configuration_mismatch');
  if (!Array.isArray(evidence.objects) || evidence.objects.length !== APPROVED_OBJECTS.length) throw new Error('preflight_evidence_invalid');
  for (const name of APPROVED_OBJECTS) {
    const object = evidence.objects.find((entry) => entry.name === name);
    if (!object?.exists || Number(object.rowCount) < 1) throw new Error('reporting_object_missing_or_empty');
  }
  const age = now.getTime() - Date.parse(evidence.validatedAt);
  if (!Number.isFinite(age) || age < 0 || age > 60 * 60 * 1000) throw new Error('preflight_evidence_expired');
  const result = {
    dryRun: !apply,
    activationReady: true,
    dashboardDataMode: apply ? 'bigquery' : 'mock',
    restartRequired: apply,
    restartCommand: 'sudo systemctl restart unfpa-mel-dashboard.service',
    timersEnabled: false,
    liveGbvEnabled: false,
  };
  if (!apply) return result;
  if (uid !== 0) throw new Error('root_required_for_apply');
  let runtimeEnvironment;
  try {
    runtimeEnvironment = parseEnvironment(fs.readFileSync(targetPaths.runtimeEnvironmentFile, 'utf8'));
  } catch {
    throw new Error('dashboard_runtime_environment_missing');
  }
  runtimeEnvironment.DASHBOARD_DATA_MODE = 'bigquery';
  runtimeEnvironment.DATA_MODE = 'bigquery';
  runtimeEnvironment.ENABLE_GBV_SUPPRESSION = 'true';
  runtimeEnvironment.BIGQUERY_PROJECT_ID = configuration.projectId;
  runtimeEnvironment.BIGQUERY_DATASET_ID = configuration.datasetId;
  runtimeEnvironment.BIGQUERY_LOCATION = configuration.location;
  runtimeEnvironment.GOOGLE_CLIENT_EMAIL = configuration.clientEmail;
  runtimeEnvironment.GOOGLE_PRIVATE_KEY_FILE = configuration.privateKeyFile;
  runtimeEnvironment.BIGQUERY_MAX_BYTES_BILLED = configuration.maximumBytesBilled || '';
  atomicWrite(targetPaths.runtimeEnvironmentFile, Object.entries(runtimeEnvironment).map(([key, value]) => `${key}=${value}`).join('\n') + '\n');
  return result;
}

module.exports = {
  APPROVED_OBJECTS,
  FORBIDDEN_OBJECTS,
  activationPlan,
  approvedObject,
  configurationHash,
  inspectReportingObjects,
  loadConfiguration,
  parseEnvironment,
  paths,
  runPreflight,
};
