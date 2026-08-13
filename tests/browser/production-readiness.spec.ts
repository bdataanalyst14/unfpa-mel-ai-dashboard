import { expect, test, type Page } from '@playwright/test';

const routes = [
  '/dashboard',
  '/dashboard/executive-overview',
  '/dashboard/activity-detail',
  '/dashboard/activity-progress',
  '/dashboard/data-quality',
  '/dashboard/gbv-ocmc',
  '/dashboard/gbv-ocmc-summary',
  '/dashboard/geographic-coverage',
  '/dashboard/indicator-progress',
  '/dashboard/ip-performance',
  '/dashboard/management-decision-centre',
  '/dashboard/participant-reach',
];

const viewports = [
  { name: 'mobile', width: 375, height: 812 },
  { name: 'tablet-portrait', width: 768, height: 1024 },
  { name: 'tablet-landscape', width: 1024, height: 768 },
  { name: 'desktop', width: 1440, height: 900 },
];

const secretMarkers = [
  'BEGIN PRIVATE KEY',
  'GOOGLE_PRIVATE_KEY',
  'BIGQUERY_PRIVATE_KEY',
  'GOOGLE_APPLICATION_CREDENTIALS',
  'service-account.json',
  'gbvServiceData',
  'totalSurvivors',
];

const failuresByPage = new WeakMap<Page, string[]>();

function installFailureGuards(page: Page) {
  const failures: string[] = [];
  failuresByPage.set(page, failures);
  const requiredHosts = new Set(['127.0.0.1']);

  page.on('pageerror', (error) => failures.push(`pageerror: ${error.message}`));
  page.on('console', (message) => {
    if (
      message.type() === 'error' &&
      message.text() !== 'Failed to load resource: the server responded with a status of 404 (Not Found)'
    ) {
      failures.push(`console: ${message.text()}`);
    }
  });
  page.on('requestfailed', (request) => {
    if (
      requiredHosts.has(new URL(request.url()).hostname) &&
      request.failure()?.errorText !== 'net::ERR_ABORTED'
    ) {
      failures.push(`requestfailed: ${request.method()} ${request.url()} ${request.failure()?.errorText}`);
    }
  });
  page.on('response', (response) => {
    const url = new URL(response.url());
    if (
      requiredHosts.has(url.hostname) &&
      ((response.status() >= 500) ||
        (response.status() === 404 &&
          !['/route-that-does-not-exist', '/not-a-dashboard-route'].includes(url.pathname)))
    ) {
      failures.push(`response: ${response.status()} ${response.url()}`);
    }
  });

}

test.afterEach(async ({ page }) => {
  const failures = failuresByPage.get(page) ?? [];
  expect(failures, failures.join('\n')).toEqual([]);
});

async function expectNoHorizontalOverflow(page: Page) {
  await expect
    .poll(() =>
      page.evaluate(() => ({
        document: document.documentElement.scrollWidth,
        viewport: document.documentElement.clientWidth,
      })),
    )
    .toEqual(
      await page.evaluate(() => ({
        document: document.documentElement.clientWidth,
        viewport: document.documentElement.clientWidth,
      })),
    );
}

test.describe('production routes and responsive layout', () => {
  for (const viewport of viewports) {
    test(`${viewport.name} ${viewport.width}x${viewport.height} renders every registered route`, async ({
      page,
    }) => {
      installFailureGuards(page);
      await page.setViewportSize(viewport);

      const root = await page.request.get('/', { maxRedirects: 0 });
      expect(root.status()).toBe(307);
      expect(root.headers().location).toBe('/dashboard/executive-overview');

      const health = await page.request.get('/api/health');
      expect(health.status()).toBe(200);
      expect(health.headers()['cache-control']).toContain('no-store');

      for (const route of routes) {
        const response = await page.goto(route);
        expect(response?.status(), route).toBe(200);
        await expect(page.getByRole('main')).toBeVisible();
        await expect(page.getByRole('region', { name: 'Global filters' })).toBeVisible();
        await expectNoHorizontalOverflow(page);
      }

      const missing = await page.goto('/route-that-does-not-exist');
      expect(missing?.status()).toBe(404);
      await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible();
      await expectNoHorizontalOverflow(page);
    });
  }
});

test('five filters synchronize, persist, navigate, reset, and never show stale data', async ({
  page,
}) => {
  installFailureGuards(page);
  await page.goto('/dashboard/executive-overview');

  const filters = [
    ['Year', '2025', 'year'],
    ['Quarter', 'Q1', 'quarter'],
    ['Project', 'CP9 SRHR', 'project'],
    ['Implementing Partner', 'ADRA Nepal', 'implementingPartner'],
    ['Province', 'Koshi', 'province'],
  ] as const;

  for (const [label, value, query] of filters) {
    await page.getByRole('combobox', { name: label }).selectOption(value);
    await expect.poll(() => new URL(page.url()).searchParams.get(query)).toBe(value);
    await expect(page.getByRole('region', { name: 'Filtered mock dashboard results' })).toBeVisible();
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: 'Clear' }).click();
    await expect.poll(() => new URL(page.url()).searchParams.has(query)).toBe(false);
    await page.waitForLoadState('networkidle');
  }

  for (const [label, value, query] of filters) {
    await page.getByRole('combobox', { name: label }).selectOption(value);
    await expect.poll(() => new URL(page.url()).searchParams.get(query)).toBe(value);
    await page.waitForLoadState('networkidle');
  }

  const table = page.getByRole('region', { name: 'Filtered mock dashboard results' });
  await expect(table).toContainText('CP9 SRHR');
  await expect(table).toContainText('ADRA Nepal');
  await expect(table).toContainText('Koshi');

  await page.reload();
  for (const [label, value] of filters) {
    await expect(page.getByRole('combobox', { name: label })).toHaveValue(value);
  }

  await page.getByRole('combobox', { name: 'Province' }).selectOption('Gandaki');
  await expect.poll(() => new URL(page.url()).searchParams.get('province')).toBe('Gandaki');
  await page.waitForLoadState('networkidle');
  await expect(page.getByRole('region', { name: 'Empty filtered dashboard results' })).toBeVisible();
  await expect(page.getByText('No data available for the selected filters')).toBeVisible();

  await page.goBack();
  await page.waitForLoadState('networkidle');
  await expect(page.getByRole('combobox', { name: 'Province' })).toHaveValue('Koshi');
  await expect(table).toContainText('Koshi');
  await page.goForward();
  await page.waitForLoadState('networkidle');
  await expect(page.getByRole('combobox', { name: 'Province' })).toHaveValue('Gandaki');

  await page.goBack();
  await page.waitForLoadState('networkidle');
  await expect(page.getByRole('combobox', { name: 'Province' })).toHaveValue('Koshi');
  await page.getByRole('link', { name: 'Activity Detail' }).click();
  await expect(page).toHaveURL(/\/dashboard\/activity-detail/);
  await page.waitForLoadState('networkidle');
  for (const [, value, query] of filters) {
    expect(new URL(page.url()).searchParams.get(query)).toBe(value);
  }

  await page.goto('/dashboard/activity-detail');
  await expect(page).toHaveURL(/\/dashboard\/activity-detail$/);
  for (const [label] of filters) {
    await expect(page.getByRole('combobox', { name: label, exact: true })).toHaveValue('');
  }

  await page.goto(
    '/dashboard/executive-overview?year=2039&quarter=Q9&project=Unknown&implementingPartner=Unknown&province=Unknown',
  );
  for (const [label] of filters) {
    await expect(page.getByRole('combobox', { name: label, exact: true })).toHaveValue('');
  }
});

test('empty states cover KPI, chart, table, map, and CSV', async ({ page }) => {
  installFailureGuards(page);
  await page.goto(
    '/dashboard/geographic-coverage?project=CP9%20SRHR&implementingPartner=ADRA%20Nepal&province=Gandaki',
  );
  await expect(page.getByText('No data available for the selected filters')).toBeVisible();
  for (const kind of ['kpi', 'chart', 'table', 'map', 'csv']) {
    await expect(page.locator(`[data-empty-kind="${kind}"]`)).toBeVisible();
  }
  await expect(page.getByRole('button', { name: 'Export CSV' })).toBeDisabled();
});

test('filtered CSV downloads safely with the expected filename and content', async ({
  page,
}) => {
  installFailureGuards(page);
  await page.goto('/dashboard/activity-detail?project=CP9%20SRHR&province=Koshi');
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export CSV' }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('unfpa-mel-filtered-activities.csv');
  const stream = await download.createReadStream();
  const chunks: Buffer[] = [];
  for await (const chunk of stream) chunks.push(Buffer.from(chunk));
  const csv = Buffer.concat(chunks).toString('utf8');
  expect(csv.length).toBeGreaterThan(100);
  expect(csv).toContain('"Activity ID"');
  expect(csv).toContain('"CP9 SRHR"');
  expect(csv).toContain('"Koshi"');
  for (const line of csv.split(/\r?\n/).slice(1)) {
    expect(line).not.toMatch(/^["']?[=+\-@]/);
  }
});

test('mobile sidebar, keyboard focus, landmarks, loading and not-found states', async ({
  page,
}) => {
  installFailureGuards(page);
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/dashboard/executive-overview');

  const open = page.getByRole('button', { name: 'Open navigation' });
  await expect(open).toHaveAttribute('aria-expanded', 'false');
  await open.click();
  await expect(open).toHaveAttribute('aria-expanded', 'true');
  await expect(page.getByRole('navigation', { name: 'Dashboard navigation' })).toBeVisible();
  await page.getByRole('button', { name: 'Close navigation' }).click();
  await expect(open).toHaveAttribute('aria-expanded', 'false');

  await page.keyboard.press('Tab');
  const focused = page.locator(':focus');
  await expect(focused).toBeVisible();
  expect(await focused.evaluate((element) => element.matches('a,button,select,[tabindex]'))).toBe(true);
  expect(
    await focused.evaluate((element) => {
      const style = getComputedStyle(element);
      return style.outlineStyle !== 'none' || style.boxShadow !== 'none';
    }),
  ).toBe(true);

  await expect(page.getByRole('main')).toHaveCount(1);
  await expect(page.getByRole('navigation', { name: 'Dashboard navigation' })).toHaveCount(1);
  await expect(page.getByRole('region', { name: 'Global filters' })).toHaveCount(1);

  await open.click();
  await page.getByRole('link', { name: 'Activity Detail' }).click();
  await expect(page).toHaveURL(/\/dashboard\/activity-detail/);

  const missing = await page.goto('/not-a-dashboard-route');
  expect(missing?.status()).toBe(404);
  await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Return to Executive Overview' })).toBeVisible();
});

test('GBV remains suppressed across HTML, accessibility, APIs and client bundles', async ({
  page,
}) => {
  installFailureGuards(page);
  const response = await page.goto('/dashboard/gbv-ocmc-summary?province=Karnali');
  expect(response?.status()).toBe(200);
  await expect(page.getByText('<5', { exact: true }).first()).toBeVisible();
  const body = await page.locator('body').innerText();
  expect(body).toContain('<5');
  expect(body).not.toMatch(/\b(?:1|2|3|4)\s+(?:survivors?|cases?|services?)\b/i);
  await expect(page.getByRole('button', { name: /Export CSV/i })).toHaveCount(0);

  const accessibleSnapshot = await page.locator('body').ariaSnapshot();
  expect(accessibleSnapshot).toContain('<5');
  expect(accessibleSnapshot).not.toMatch(/\b(?:1|2|3|4)\s+(?:survivors?|cases?)\b/i);

  const html = await response?.text();
  expect(html).toContain('Loading dashboard filters');
  expect(html).not.toMatch(/\b(?:1|2|3|4)\s+(?:survivors?|cases?|services?)\b/i);
  for (const marker of secretMarkers) expect(html).not.toContain(marker);

  const api = await page.request.get('/api/dashboard/page-data?route=gbv-ocmc-summary&province=Karnali');
  expect(api.status()).toBe(200);
  expect(api.headers()['cache-control']).toContain('private');
  expect(api.headers()['cache-control']).toContain('no-store');
  const payload = await api.text();
  expect(payload).toContain('"suppressionApplied":true');
  expect(payload).toContain('"validationStatus":"blocked_privacy_suppression_not_verified"');
  expect(payload).not.toMatch(/"(?:value|chartValue)"\s*:\s*[1-4](?:[,}])/);
  for (const marker of secretMarkers) expect(payload).not.toContain(marker);

  const scripts = await page.locator('script[src]').evaluateAll((elements) =>
    elements.map((element) => (element as HTMLScriptElement).src),
  );
  for (const script of scripts) {
    const source = await (await page.request.get(script)).text();
    for (const marker of secretMarkers) expect(source, `${marker} in ${script}`).not.toContain(marker);
  }
});

test('dashboard error boundary renders sanitized recovery UI', async ({ page }) => {
  const response = await page.goto('/dashboard/executive-overview?qaError=boundary');
  expect(response?.status()).toBe(200);
  await expect(
    page.getByRole('heading', { name: 'Dashboard content could not be loaded' }),
  ).toBeVisible();
  await expect(
    page.getByRole('alert').filter({ hasText: 'Dashboard content could not be loaded' }),
  ).not.toContainText('Intentional browser-QA error');
  await expect(page.getByRole('button', { name: 'Try again' })).toBeVisible();
});

test('server-rendered loading fallback is safe and accessible', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  const response = await page.goto('/dashboard/executive-overview');
  expect(response?.status()).toBe(200);
  await expect(page.getByText('Loading dashboard filters...')).toBeVisible();
  expect(await page.locator('body').innerText()).not.toMatch(/BEGIN PRIVATE KEY|GOOGLE_PRIVATE_KEY/);
  await context.close();
});
