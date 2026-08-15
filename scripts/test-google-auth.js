const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

const root = path.resolve(__dirname, '..');

function loadTs(relativePath, overrides = {}) {
  const filename = path.join(root, relativePath);
  const output = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { esModuleInterop: true, jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
    fileName: filename,
  }).outputText;
  const loaded = { exports: {} };
  const localRequire = (request) => Object.prototype.hasOwnProperty.call(overrides, request) ? overrides[request] : require(request);
  Function('require', 'module', 'exports', output)(localRequire, loaded, loaded.exports);
  return loaded.exports;
}

const original = { ...process.env };
function env(values) {
  for (const key of ['GOOGLE_OAUTH_CLIENT_ID', 'GOOGLE_OAUTH_CLIENT_SECRET', 'AUTH_SECRET', 'NEXTAUTH_SECRET', 'DASHBOARD_AUTHORIZED_EMAILS', 'DASHBOARD_ADMIN_EMAILS', 'DASHBOARD_AUTHORIZED_EMAIL_DOMAIN', 'DASHBOARD_AUTH_REQUIRED', 'DATA_MODE', 'DASHBOARD_DATA_MODE']) delete process.env[key];
  Object.assign(process.env, values);
}

async function main() {
  env({ DASHBOARD_AUTH_REQUIRED: 'true', DASHBOARD_AUTHORIZED_EMAILS: ' User@Example.org ', DASHBOARD_ADMIN_EMAILS: 'Admin@Example.org' });
  const policy = loadTs('src/lib/server/auth-policy.ts');
  assert.equal(policy.resolveConfiguredRole('user@example.org'), 'AUTHORIZED_USER');
  assert.equal(policy.resolveConfiguredRole('ADMIN@example.org'), 'ADMIN');
  assert.equal(policy.resolveConfiguredRole('unknown@example.org'), null);
  assert.equal(policy.resolveConfiguredRole(undefined), null);
  assert.equal(policy.authorizeSession(null).reason, 'unauthenticated');
  assert.equal(policy.authorizeSession({ user: { id: 'google-1', emailVerified: true, email: 'unknown@example.org', role: null } }).allowed, false);
  assert.equal(policy.authorizeSession({ user: { id: 'google-1', emailVerified: true, email: 'user@example.org', role: 'AUTHORIZED_USER' } }).allowed, true);
  assert.equal(policy.authorizeSession({ user: { id: 'google-2', emailVerified: true, email: 'admin@example.org', role: 'ADMIN' } }).role, 'ADMIN');
  assert.equal(policy.authorizeSession({ user: { id: 'google-1', emailVerified: true, email: undefined, role: 'AUTHORIZED_USER' } }).allowed, false);
  assert.equal(policy.authorizeSession({ user: { id: 'google-1', emailVerified: false, email: 'user@example.org', role: 'AUTHORIZED_USER' } }).allowed, false);
  assert.equal(policy.authorizeSession({ user: { id: '', emailVerified: true, email: 'user@example.org', role: 'AUTHORIZED_USER' } }).reason, 'malformed_session');
  env({ DASHBOARD_AUTH_REQUIRED: 'true' });
  assert.equal(policy.resolveConfiguredRole('user@example.org'), null);
  assert.equal(policy.authorizeSession({ user: { id: 'google-1', emailVerified: true, email: 'user@example.org', role: 'AUTHORIZED_USER' } }).allowed, false);
  env({ DASHBOARD_AUTH_REQUIRED: 'true', DASHBOARD_AUTHORIZED_EMAIL_DOMAIN: 'example.org' });
  assert.equal(policy.resolveConfiguredRole('user@example.org'), null);

  env({ GOOGLE_OAUTH_CLIENT_ID: 'fixture-client-id', GOOGLE_OAUTH_CLIENT_SECRET: 'fixture-client-secret', NEXTAUTH_SECRET: 'fixture-auth-secret', DASHBOARD_AUTH_REQUIRED: 'true', DASHBOARD_AUTHORIZED_EMAILS: 'user@example.org', DASHBOARD_ADMIN_EMAILS: 'admin@example.org' });
  const auth = loadTs('src/auth.ts', {
    'next-auth/providers/google': (options) => ({ id: 'google', options }),
    '@/lib/server/auth-policy': { resolveConfiguredRole: policy.resolveConfiguredRole },
  });
  assert.equal(auth.authConfigurationComplete, true);
  assert.equal(auth.authOptions.providers[0].id, 'google');
  assert.equal(await auth.authOptions.callbacks.signIn({ profile: { sub: '1', email: 'user@example.org', email_verified: true } }), true);
  assert.equal(await auth.authOptions.callbacks.signIn({ profile: { sub: '1', email_verified: true } }), false);
  assert.equal(await auth.authOptions.callbacks.signIn({ profile: { sub: '1', email: 'user@example.org', email_verified: false } }), false);
  const jwt = await auth.authOptions.callbacks.jwt({ token: {}, profile: { sub: 'google-user', email: 'user@example.org', email_verified: true, name: 'Fixture User' } });
  jwt.accessToken = 'must-not-expose'; jwt.id_token = 'must-not-expose'; jwt.refresh_token = 'must-not-expose';
  const session = await auth.authOptions.callbacks.session({ session: { user: {} }, token: jwt });
  assert.deepEqual(session.user, { id: 'google-user', email: 'user@example.org', name: 'Fixture User', emailVerified: true, role: 'AUTHORIZED_USER' });
  assert.equal(session.accessToken, undefined);
  assert.equal(session.id_token, undefined);
  assert.equal(session.refresh_token, undefined);

  env({ DASHBOARD_AUTH_REQUIRED: 'true' });
  const incompleteAuth = loadTs('src/auth.ts', {
    'next-auth/providers/google': (options) => ({ id: 'google', options }),
    '@/lib/server/auth-policy': { resolveConfiguredRole: policy.resolveConfiguredRole },
  });
  assert.equal(incompleteAuth.authConfigurationComplete, false);
  assert.equal(incompleteAuth.authOptions.providers.length, 0);

  const redirectFor = async (sessionValue) => {
    const guard = loadTs('src/lib/server/auth-guard.ts', {
      'next-auth': { getServerSession: async () => sessionValue },
      'next/navigation': { redirect: (location) => { throw new Error(`redirect:${location}`); } },
      '@/auth': { authOptions: { secret: 'fixture', providers: [{}] } },
      '@/lib/server/auth-policy': { authenticationRequired: () => true, authorizeSession: policy.authorizeSession },
    });
    await assert.rejects(() => guard.requireDashboardPageAccess(), /redirect:/);
    try { await guard.requireDashboardPageAccess(); } catch (error) { return error.message; }
    return '';
  };
  assert.equal(await redirectFor(null), 'redirect:/auth/signin');
  assert.equal(await redirectFor({ user: { id: 'google-3', emailVerified: true, email: 'unknown@example.org', role: null } }), 'redirect:/auth/unauthorized');

  const response = { json: (data, init) => ({ status: init?.status ?? 200, data }) };
  let bigQueryCalls = 0;
  const request = { nextUrl: { searchParams: { get: () => null } } };
  for (const status of [401, 403]) {
    const route = loadTs('src/app/api/dashboard/page-data/route.ts', {
      'next/server': { NextResponse: response },
      '@/lib/server/auth-guard': { requireDashboardApiAccess: async () => ({ allowed: false, status }) },
      '@/lib/server/dashboard-page-data-service': { getDashboardPageData: async () => { bigQueryCalls += 1; return {}; } },
    });
    assert.equal((await route.GET(request)).status, status);
  }
  assert.equal(bigQueryCalls, 0);
  const allowedRoute = loadTs('src/app/api/dashboard/page-data/route.ts', {
    'next/server': { NextResponse: response },
    '@/lib/server/auth-guard': { requireDashboardApiAccess: async () => ({ allowed: true, status: 401 }) },
    '@/lib/server/dashboard-page-data-service': { getDashboardPageData: async () => { bigQueryCalls += 1; return {}; } },
  });
  await allowedRoute.GET(request);
  assert.equal(bigQueryCalls, 1);

  const routeSource = fs.readFileSync(path.join(root, 'src/app/api/dashboard/page-data/route.ts'), 'utf8');
  const routeBody = routeSource.slice(routeSource.indexOf('export async function GET'));
  assert.ok(routeBody.indexOf('requireDashboardApiAccess') < routeBody.indexOf('getDashboardPageData'));
  assert.match(fs.readFileSync(path.join(root, 'src/app/dashboard/layout.tsx'), 'utf8'), /requireDashboardPageAccess/);
  assert.match(fs.readFileSync(path.join(root, 'proxy.ts'), 'utf8'), /\/dashboard\/:path\*/);
  const health = fs.readFileSync(path.join(root, 'src/app/api/health/route.ts'), 'utf8');
  assert.doesNotMatch(health, /DATA_MODE|BIGQUERY_PROJECT|GCP_|AUTH_SECRET|token/i);
  const shell = fs.readFileSync(path.join(root, 'src/components/layout/dashboard-shell.tsx'), 'utf8');
  assert.match(shell, /signOut\(\{ callbackUrl: '\/auth\/signin' \}\)/);
  const authSource = fs.readFileSync(path.join(root, 'src/auth.ts'), 'utf8');
  assert.doesNotMatch(authSource, /accessToken|id_token|refresh_token/);
  assert.match(authSource, /next-auth\/providers\/google/);
  assert.doesNotMatch(authSource, /azure|entra|tenant/i);

  console.log('Google authentication and deny-by-default authorization tests passed.');
}

main().catch((error) => { console.error(error); process.exitCode = 1; }).finally(() => {
  for (const key of Object.keys(process.env)) delete process.env[key];
  Object.assign(process.env, original);
});
