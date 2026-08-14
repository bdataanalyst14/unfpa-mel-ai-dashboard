const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

const root = path.resolve(__dirname, '..');
const policySource = fs.readFileSync(path.join(root, 'src/lib/server/auth-policy.ts'), 'utf8');
const compiled = ts.transpileModule(policySource, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText;
const policyModule = { exports: {} };
vm.runInNewContext(compiled, { module: policyModule, exports: policyModule.exports, process, console });
const policy = policyModule.exports;

function loadTs(relativePath, overrides = {}) {
  const filename = path.join(root, relativePath);
  const source = fs.readFileSync(filename, 'utf8');
  const output = ts.transpileModule(source, {
    compilerOptions: { esModuleInterop: true, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
    fileName: filename,
  }).outputText;
  const loaded = { exports: {} };
  const localRequire = (request) => Object.prototype.hasOwnProperty.call(overrides, request) ? overrides[request] : require(request);
  Function('require', 'module', 'exports', output)(localRequire, loaded, loaded.exports);
  return loaded.exports;
}

const original = { ...process.env };
function env(values) {
  for (const key of ['AZURE_AD_TENANT_ID', 'DASHBOARD_AUTHORIZED_EMAILS', 'DASHBOARD_ADMIN_EMAILS', 'DASHBOARD_AUTHORIZED_EMAIL_DOMAIN']) delete process.env[key];
  Object.assign(process.env, values);
}

env({ AZURE_AD_TENANT_ID: 'tenant-placeholder', DASHBOARD_AUTHORIZED_EMAILS: 'user@example.org', DASHBOARD_ADMIN_EMAILS: 'admin@example.org' });
assert.equal(policy.isTenantAllowed('tenant-placeholder'), true);
assert.equal(policy.isTenantAllowed('wrong-tenant'), false);
assert.equal(policy.isTenantAllowed(undefined), false);
assert.equal(policy.resolveConfiguredRole('user@example.org'), 'AUTHORIZED_USER');
assert.equal(policy.resolveConfiguredRole('admin@example.org'), 'ADMIN');
assert.equal(policy.resolveConfiguredRole('unknown@example.org'), null);
assert.equal(policy.authorizeSession(null).allowed, false);
assert.equal(policy.authorizeSession({ user: { email: 'user@example.org', tenantId: 'wrong-tenant', role: 'AUTHORIZED_USER' } }).allowed, false);
assert.equal(policy.authorizeSession({ user: { email: 'unknown@example.org', tenantId: 'tenant-placeholder', role: 'AUTHORIZED_USER' } }).allowed, false);
assert.equal(policy.authorizeSession({ user: { email: 'user@example.org', tenantId: 'tenant-placeholder', role: 'AUTHORIZED_USER' } }).allowed, true);
assert.equal(policy.authorizeSession({ user: { email: 'admin@example.org', tenantId: 'tenant-placeholder', role: 'ADMIN' } }).role, 'ADMIN');
env({ AZURE_AD_TENANT_ID: 'tenant-placeholder', DASHBOARD_AUTHORIZED_EMAIL_DOMAIN: 'example.org' });
assert.equal(policy.resolveConfiguredRole('person@example.org'), 'AUTHORIZED_USER');
assert.equal(policy.resolveConfiguredRole('person@other.org'), null);
env({ DATA_MODE: 'mock', DASHBOARD_DATA_MODE: 'mock' });
assert.equal(policy.authenticationRequired(), false);
env({ DATA_MODE: 'bigquery', DASHBOARD_DATA_MODE: 'bigquery' });
assert.equal(policy.authenticationRequired(), true);

const route = fs.readFileSync(path.join(root, 'src/app/api/dashboard/page-data/route.ts'), 'utf8');
const executive = fs.readFileSync(path.join(root, 'src/app/api/dashboard/executive-overview/route.ts'), 'utf8');
const guard = fs.readFileSync(path.join(root, 'src/lib/server/auth-guard.ts'), 'utf8');
assert.match(route, /requireDashboardApiAccess/);
assert.match(executive, /requireDashboardApiAccess/);
const routeBody = route.slice(route.indexOf('export async function GET'));
const executiveBody = executive.slice(executive.indexOf('export async function GET'));
assert.ok(routeBody.indexOf('const authorization = await requireDashboardApiAccess') < routeBody.indexOf('getDashboardPageData'));
assert.ok(executiveBody.indexOf('const authorization = await requireDashboardApiAccess') < executiveBody.indexOf('getExecutiveOverviewData'));
assert.match(guard, /getServerSession/);

const health = fs.readFileSync(path.join(root, 'src/app/api/health/route.ts'), 'utf8');
assert.doesNotMatch(health, /DATA_MODE|BIGQUERY_PROJECT|GCP_|AUTH_SECRET|token/i);
const auth = fs.readFileSync(path.join(root, 'src/auth.ts'), 'utf8');
assert.match(auth, /authConfigurationComplete = Boolean\(tenantId && clientId && clientSecret && authSecret\)/);
assert.doesNotMatch(auth, /accessToken|id_token.*session|token.*response/i);
assert.match(auth, /openid profile email/);
const roleAccess = fs.readFileSync(path.join(root, 'src/lib/role-access.ts'), 'utf8');
assert.doesNotMatch(roleAccess, /return ['"]manager['"]/i);
assert.match(roleAccess, /return null/);
assert.match(guard, /authentication_error/);

(async () => {
let bigQueryCalls = 0;
const response = { json: (data, init) => ({ status: init?.status ?? 200, data }) };
const guardedRoute = loadTs('src/app/api/dashboard/page-data/route.ts', {
  'next/server': { NextResponse: response },
  '@/lib/server/auth-guard': { requireDashboardApiAccess: async () => ({ allowed: false, status: 401 }) },
  '@/lib/server/dashboard-page-data-service': { getDashboardPageData: async () => { bigQueryCalls += 1; return {}; } },
});
const request = { nextUrl: { searchParams: { get: () => null } } };
const deniedResponse = await guardedRoute.GET(request);
assert.equal(deniedResponse.status, 401);
assert.equal(bigQueryCalls, 0);
const allowedRoute = loadTs('src/app/api/dashboard/page-data/route.ts', {
  'next/server': { NextResponse: response },
  '@/lib/server/auth-guard': { requireDashboardApiAccess: async () => ({ allowed: true, status: 401 }) },
  '@/lib/server/dashboard-page-data-service': { getDashboardPageData: async () => { bigQueryCalls += 1; return {}; } },
});
await allowedRoute.GET(request);
assert.equal(bigQueryCalls, 1);

Object.keys(process.env).forEach((key) => delete process.env[key]);
Object.assign(process.env, original);
console.log('Entra authentication and deny-by-default authorization tests passed.');
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
