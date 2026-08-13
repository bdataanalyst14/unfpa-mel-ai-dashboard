const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {
  APPROVED_OBJECTS,
  activationPlan,
  approvedObject,
  loadConfiguration,
  paths,
  runPreflight,
} = require('./dashboard/bigquery-readonly');

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'unfpa-bigquery-readonly-'));
const targetPaths = paths(root);

function prepare() {
  fs.mkdirSync(path.dirname(targetPaths.environmentFile), { recursive: true });
  fs.mkdirSync(path.dirname(targetPaths.privateKeyFile), { recursive: true });
  fs.mkdirSync(path.dirname(targetPaths.runtimeEnvironmentFile), { recursive: true });
  fs.writeFileSync(targetPaths.privateKeyFile, 'fixture-private-key\n');
  fs.writeFileSync(targetPaths.environmentFile, [
    'BIGQUERY_PROJECT_ID=unfpadatabase',
    'BIGQUERY_DATASET_ID=reporting',
    'BIGQUERY_LOCATION=asia-south1',
    'GOOGLE_CLIENT_EMAIL=readonly@unfpadatabase.iam.gserviceaccount.com',
    `GOOGLE_PRIVATE_KEY_FILE=${targetPaths.privateKeyFile}`,
    'BIGQUERY_MAX_BYTES_BILLED=1000000',
    'DASHBOARD_DATA_MODE=mock',
    'DATA_MODE=mock',
    'ENABLE_GBV_SUPPRESSION=true',
    '',
  ].join('\n'));
  fs.writeFileSync(targetPaths.runtimeEnvironmentFile, 'DASHBOARD_DATA_MODE=mock\nDATA_MODE=mock\nENABLE_GBV_SUPPRESSION=true\n');
}

function client({ missing, empty } = {}) {
  const queries = [];
  const fieldsMap = {
    combined_activity_summary: [
      'event_count', 'total_reportable_participants', 'female', 'male', 'other',
      'repeat_beneficiary_total', 'repeat_guest_total', 'repeat_nonreportable_total',
      'district1', 'ip_name', 'reporting_year1', 'report_quarter1', 'project1', 'province1'
    ].map(name => ({ name })),
    indicator_progress_summary: [
      'indicator1', 'activity1', 'ip_name', 'reporting_year1'
    ].map(name => ({ name })),
    data_quality_summary: [
      'total_rows', 'records_with_quality_issue', 'run_timestamp', 'ip_name'
    ].map(name => ({ name })),
    ip_submission_status: [
      'ip_name', 'total_submissions', 'total_events', 'latest_sync_time'
    ].map(name => ({ name }))
  };

  return {
    queries,
    dataset() {
      return {
        async getMetadata() {
          return [{ location: 'asia-south1' }];
        },
        table(name) {
          return {
            async getMetadata() {
              if (name === missing) {
                const error = new Error('missing');
                error.code = 404;
                throw error;
              }
              const fields = fieldsMap[name] || [];
              return [{ schema: { fields } }];
            },
          };
        },
      };
    },
    async query(options) {
      const q = options.query || options.ipQuery || '';
      queries.push(q);
      if (q.includes('AS organization_count')) {
        return [[{ organization_count: 15 }]];
      }
      if (q.includes('COUNT(DISTINCT ip_name)')) {
        return [[{ ip_count: 15 }]];
      }
      if (q.includes('AS reporting_years')) {
        return [[{
          reporting_years: ['2025', '2026', '2029'],
          malformed_year_count: 0,
          out_of_range_year_count: 0,
        }]];
      }
      const name = APPROVED_OBJECTS.find((object) => q.includes(`.${object}`));
      return [[{ row_count: name === empty ? 0 : 7 }]];
    },
  };
}

async function main() {
  try {
    prepare();
    assert.throws(() => approvedObject('participants_flat'), /reporting_object_not_approved/);

    const successfulClient = client();
    const success = await runPreflight({ targetPaths, clientFactory: async () => successfulClient });
    assert.equal(success.exitCode, 0);
    assert.deepEqual(success.output.objects.map((object) => object.name), APPROVED_OBJECTS);
    assert(successfulClient.queries.every((query) => !query.includes('participants_flat')));
    assert(!JSON.stringify(success.output).includes('fixture-private-key'));

    const adcFile = path.join(root, 'approved-service-account.json');
    fs.writeFileSync(adcFile, '{"fixture":"credential-contents-must-not-be-read"}\n');
    fs.writeFileSync(targetPaths.environmentFile, [
      'BIGQUERY_PROJECT_ID=unfpadatabase',
      'BIGQUERY_DATASET_ID=reporting',
      'BIGQUERY_LOCATION=asia-south1',
      `GOOGLE_APPLICATION_CREDENTIALS=${adcFile}`,
      'BIGQUERY_MAX_BYTES_BILLED=1000000',
      'DASHBOARD_DATA_MODE=mock',
      'DATA_MODE=mock',
      '',
    ].join('\n'));
    const adcConfiguration = loadConfiguration(targetPaths).configuration;
    assert.equal(adcConfiguration.applicationCredentials, adcFile);
    assert.equal(adcConfiguration.clientEmail, undefined);
    assert.equal(adcConfiguration.privateKeyFile, undefined);
    const adcClient = client();
    const adcSuccess = await runPreflight({
      targetPaths,
      clientFactory: async () => adcClient,
      writeEvidence: false,
    });
    assert.equal(adcSuccess.exitCode, 0);
    assert(!JSON.stringify(adcSuccess.output).includes('credential-contents-must-not-be-read'));

    fs.appendFileSync(targetPaths.environmentFile, 'GOOGLE_CLIENT_EMAIL=conflict@example.com\n');
    assert.throws(() => loadConfiguration(targetPaths), /bigquery_authentication_mode_conflict/);
    fs.writeFileSync(targetPaths.environmentFile, [
      'BIGQUERY_PROJECT_ID=unfpadatabase',
      'BIGQUERY_DATASET_ID=reporting',
      'BIGQUERY_LOCATION=asia-south1',
      'GOOGLE_CLIENT_EMAIL=incomplete@example.com',
      'DASHBOARD_DATA_MODE=mock',
      'DATA_MODE=mock',
      '',
    ].join('\n'));
    assert.throws(() => loadConfiguration(targetPaths), /google_private_key_file_missing/);
    prepare();

    const missing = await runPreflight({ targetPaths, clientFactory: async () => client({ missing: APPROVED_OBJECTS[0] }), writeEvidence: false });
    assert.equal(missing.exitCode, 1);
    const empty = await runPreflight({ targetPaths, clientFactory: async () => client({ empty: APPROVED_OBJECTS[1] }), writeEvidence: false });
    assert.equal(empty.exitCode, 1);

    const dryRun = activationPlan({ targetPaths });
    assert.equal(dryRun.dryRun, true);
    assert.equal(dryRun.dashboardDataMode, 'mock');
    assert.match(fs.readFileSync(targetPaths.runtimeEnvironmentFile, 'utf8'), /^DATA_MODE=mock$/m);

    fs.rmSync(targetPaths.evidenceFile);
    assert.throws(() => activationPlan({ targetPaths }), /successful_preflight_evidence_required/);
    await runPreflight({ targetPaths, clientFactory: async () => client() });
    assert.throws(() => activationPlan({ targetPaths, apply: true, uid: 1000 }), /root_required_for_apply/);
    const applied = activationPlan({ targetPaths, apply: true, uid: 0 });
    assert.equal(applied.timersEnabled, false);
    assert.match(applied.restartCommand, /^sudo systemctl restart /);
    assert.match(fs.readFileSync(targetPaths.environmentFile, 'utf8'), /^DATA_MODE=mock$/m);
    assert.match(fs.readFileSync(targetPaths.runtimeEnvironmentFile, 'utf8'), /^DATA_MODE=bigquery$/m);

    const wrapper = fs.readFileSync(path.join(__dirname, '..', 'ops', 'ubuntu', 'install-pipeline-configuration.sh'), 'utf8');
    assert.match(wrapper, /command -v npm/);
    assert(!wrapper.includes('/usr/bin/npm'));
    assert(!/systemctl\s+(enable|start)/.test(wrapper));
    const customPathSimulation = wrapper.replace('npm_bin="$(command -v npm || true)"', 'npm_bin="/usr/local/bin/npm"');
    assert(customPathSimulation.includes('npm_bin="/usr/local/bin/npm"'));
    assert(customPathSimulation.includes('"$npm_bin" run pipeline:configure'));

    console.log('Dashboard BigQuery read-only configuration tests passed.');
  } finally {
    const resolved = path.resolve(root);
    if (resolved.startsWith(path.resolve(os.tmpdir()) + path.sep)) fs.rmSync(resolved, { recursive: true, force: true });
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
