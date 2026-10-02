const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const { webpack } = require('next/dist/compiled/webpack/webpack');
const postcss = require('postcss');
const tailwind = require('tailwindcss');
const { chromium } = require('@playwright/test');

const root = path.resolve(__dirname, '..');
const output = path.join(root, 'test-results', 'ui-reconciliation');
const routes = ['executive-overview', 'activity-progress', 'indicator-progress', 'participant-reach', 'data-quality', 'gbv-ocmc', 'ip-performance', 'activity-detail', 'management-decision-centre', 'geographic-coverage'];

async function main() {
  fs.mkdirSync(output, { recursive: true });
  fs.writeFileSync(path.join(output, 'loader.cjs'), `const ts = require('typescript'); module.exports = function(source) { return ts.transpileModule(source, { compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 } }).outputText; };`);
  fs.writeFileSync(path.join(output, 'navigation.js'), `
    export function usePathname() { return '/dashboard/' + (new URLSearchParams(location.search).get('route') || 'executive-overview'); }
    export function useSearchParams() { return new URLSearchParams(location.search); }
    export function useRouter() { return { push: target => { const next = new URL(target, location.origin); next.searchParams.set('route', next.pathname.split('/').pop()); location.href = '/?' + next.searchParams; } }; }
  `);
  fs.writeFileSync(path.join(output, 'link.jsx'), `export default function Link({href, children, prefetch, ...props}) { const url = new URL(href, location.origin); url.searchParams.set('route', url.pathname.split('/').pop()); return <a href={'/?' + url.searchParams} {...props}>{children}</a>; }`);
  fs.writeFileSync(path.join(output, 'auth.js'), `export function signOut() { throw new Error('Sign-out must not run in offline component QA'); }`);
  fs.writeFileSync(path.join(output, 'entry.jsx'), `
    import { createRoot } from 'react-dom/client';
    import View from '@/components/dashboard/production-dashboard-view';
    import Shell from '@/components/layout/dashboard-shell';
    import Filters from '@/components/layout/top-filter-bar';
    import { DashboardFilterProvider } from '@/components/dashboard/dashboard-filter-provider';
    const params = new URLSearchParams(location.search);
    const route = params.get('route') || 'executive-overview';
    const state = params.get('state') || (['gbv-ocmc', 'data-quality'].includes(route) ? 'disabled_pending_validation' : 'live_bigquery');
    const allPairs = [['Total events', '240'], ['Total participants', '1800'], ['Reportable participants', '1200'], ['Districts covered', '12'], ['Implementing partners', '8'], ['Female participants', '1000'], ['Male participants', '796'], ['Other participants', '<5'], ['Participants with disability', '20'], ['Provinces covered', '5'], ['Palikas covered', '40'], ['Indicators reported', '12'], ['Projects', '6'], ['Reporting partners', '8'], ['Total submissions', '60']];
    const routeLabels = { 'geographic-coverage':['Provinces covered','Districts covered','Palikas covered','Total events'], 'participant-reach':['Total participants','Reportable participants','Female participants','Male participants','Other participants','Participants with disability'], 'indicator-progress':['Indicators reported','Total events','Total participants','Reportable participants'], 'ip-performance':['Reporting partners','Total submissions','Total events'], 'activity-progress':['Total events','Total participants','Reportable participants','Projects','Implementing partners'] };
    const pairs = (routeLabels[route] || ['Total events','Total participants','Reportable participants','Districts covered','Implementing partners','Female participants','Male participants','Other participants']).map(label => allPairs.find(pair => pair[0] === label));
    const names = {'participant-reach':'Participant & Reach','data-quality':'Data Quality & Evidence','gbv-ocmc':'GBV / OCMC Service Summary','ip-performance':'IP / Partner Performance'};
    const filters = Object.fromEntries(['year', 'quarter', 'project', 'implementingPartner', 'province', 'district', 'municipality'].map(key => [key, params.get(key) || '']));
    const data = { route, pageName: names[route] || route.split('-').map(word => word[0].toUpperCase() + word.slice(1)).join(' '), metrics: state === 'live_bigquery' ? (route === 'activity-detail' ? [{label:'Training - events',value:'20'},{label:'Training - participants',value:'100'},{label:'Outreach - events',value:'<5'},{label:'Outreach - participants',value:'20'}] : pairs.map(([label,value]) => ({label,value}))) : [], metadata: { componentState: state, dataSource: 'bigquery', freshnessTimestamp: state === 'live_bigquery' ? '2026-09-28T06:00:00Z' : null, filtersApplied: filters, message: 'OFFLINE COMPONENT QA ONLY. Synthetic test fixtures; no live BigQuery or authentication.', suppressionApplied: true } };
    const count = (key, label, value) => ({key,label,value: value === '<5' ? null : Number(value),displayValue:value,suppressed:value === '<5'});
    const participants = ['executive-overview','participant-reach','geographic-coverage'].includes(route) && state === 'live_bigquery' && !params.has('noParticipants') ? { metadata: {dataSource:'bigquery',note:'Offline suppressed fixture.'}, demographics:[{name:'Demographics',metrics:[count('below_15','Below 15','<5'),count('age_15_19','15–19','200'),count('age_20_24','20–24','400'),count('hilldalit','Hill Dalit','100'),count('muslim','Muslim','<5'),count('withdisability','With disability','20'),count('nodisability','No disability','1780')]}], districts:[{name:'Kathmandu',metrics:[count('totalParticipants','Total participants','1200')]},{name:'Morang',metrics:[count('totalParticipants','Total participants','600')]},{name:'Kailali',metrics:[count('totalParticipants','Total participants','<5')]},{name:'Unmatched district',metrics:[count('totalParticipants','Total participants','0')]}] } : undefined;
    const options = {year:['2026'],quarter:['Q3'],project:['A programme with a deliberately long name to test mobile filter widths'],implementingPartner:['Partner A'],province:['Bagmati'],district:['Kathmandu'],municipality:['Kathmandu Metropolitan City']};
    createRoot(document.getElementById('root')).render(<DashboardFilterProvider dataMode="bigquery" liveOptions={options}><Shell dataMode="bigquery"><Filters /><View route={route} data={data} participants={participants} /></Shell></DashboardFilterProvider>);
  `);
  await new Promise((resolve, reject) => {
    webpack({ mode: 'development', devtool: false, entry: path.join(output, 'entry.jsx'), output: { path: output, filename: 'bundle.js' }, resolve: { extensions: ['.tsx', '.ts', '.jsx', '.js'], alias: { '@': path.join(root, 'src'), 'next/navigation$': path.join(output, 'navigation.js'), 'next/link$': path.join(output, 'link.jsx'), 'next-auth/react$': path.join(output, 'auth.js') } }, module: { rules: [{ test: /\.[jt]sx?$/, exclude: /node_modules/, use: path.join(output, 'loader.cjs') }] } }, (error, stats) => error ? reject(error) : stats.hasErrors() ? reject(new Error(stats.toString({ all: false, errors: true }))) : resolve());
  });
  const css = await postcss([tailwind(require(path.join(root, 'tailwind.config.js')))]).process('@tailwind base; @tailwind components; @tailwind utilities;', { from: undefined });
  fs.writeFileSync(path.join(output, 'style.css'), css.css);
  const server = http.createServer((req, res) => {
    const asset = req.url.split('?')[0];
    if (asset === '/maps/local-units.geojson') { res.setHeader('Content-Type', 'application/json'); return res.end(fs.readFileSync(path.join(root, 'public', asset))); }
    if (asset === '/bundle.js' || asset === '/style.css') { res.setHeader('Content-Type', asset.endsWith('.js') ? 'text/javascript' : 'text/css'); return res.end(fs.readFileSync(path.join(output, asset))); }
    res.setHeader('Content-Type', 'text/html');
    res.end('<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/style.css"><title>Offline UI reconciliation QA</title></head><body><div id="root"></div><script src="/bundle.js"></script></body></html>');
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  let browser;
  const results = [];
  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    const origin = 'http://127.0.0.1:' + server.address().port;
    for (const width of [375, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      for (const route of routes) {
        await page.goto(origin + '/?route=' + route);
        await page.getByRole('heading', { level: 1 }).waitFor();
        if (['executive-overview', 'geographic-coverage'].includes(route)) {
          await page.getByRole('img', { name: 'Nepal local-unit coverage map' }).waitFor();
          assert.equal(await page.locator('svg[aria-label="Nepal local-unit coverage map"] path').count(), 777);
          assert.ok(await page.getByText(/777 boundary features/).isVisible());
        }
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
        assert.equal(overflow, false, route + ' overflow at ' + width);
        await page.screenshot({ path: path.join(output, route + '-' + width + '.png'), fullPage: true });
        results.push({ route, width, overflow, screenshot: route + '-' + width + '.png' });
      }
    }
    await page.setViewportSize({ width: 375, height: 850 });
    await page.goto(origin + '/?route=executive-overview');
    await page.getByRole('button', { name: 'Open navigation' }).click();
    await page.getByRole('dialog').waitFor();
    await page.keyboard.press('Escape');
    await page.getByRole('dialog').waitFor({ state: 'hidden' });
    assert.equal(await page.getByRole('button', { name: 'Open navigation' }).evaluate(node => node === document.activeElement), true);
    await page.getByRole('button', { name: 'More Filters' }).click();
    assert.equal(await page.getByLabel('Fund Code').isDisabled(), true);
    assert.equal(await page.getByLabel('Date range').isDisabled(), true);
    await page.getByLabel('Province', { exact: true }).selectOption('Bagmati');
    await page.waitForURL(/province=Bagmati/);
    await page.getByRole('button', { name: 'Clear filters' }).click();
    await page.waitForURL(url => !url.searchParams.has('province'));
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.getByRole('button', { name: 'Collapse navigation' }).click();
    assert.equal(await page.locator('aside').evaluate(node => Math.round(node.getBoundingClientRect().width)), 80);
    await page.getByRole('button', { name: 'Expand navigation' }).click();
    await page.goto(origin + '/?route=activity-detail');
    await page.getByLabel('Search activity').fill('outreach');
    assert.equal(await page.locator('tbody tr').count(), 1);
    assert.match(await page.locator('tbody').innerText(), /<5/);
    await page.getByLabel('Search activity').fill('missing');
    await page.getByText('No activity groups match this search.').waitFor();
    await page.goto(origin + '/?route=participant-reach');
    assert.ok(await page.getByText('Small count withheld; no bar displayed.').count() >= 3);
    await page.goto(origin + '/?route=geographic-coverage');
    await page.getByRole('img', { name: 'Nepal local-unit coverage map' }).waitFor();
    assert.ok(await page.locator('svg path[fill="#004B87"]').count() > 0);
    assert.ok(await page.locator('svg path[fill="#E2E8F0"]').count() > 0);
    const suppressedPaths = await page.locator('svg[aria-label="Nepal local-unit coverage map"] path').evaluateAll(nodes => nodes.filter(node => node.textContent.includes('KAILALI')).map(node => ({ fill: node.getAttribute('fill'), text: node.textContent })));
    assert.ok(suppressedPaths.length > 0);
    assert.ok(suppressedPaths.every(item => item.fill === '#E2E8F0' && item.text.includes('<5')));
    assert.ok(await page.getByText(/Some district names do not match/).isVisible());
    for (const state of ['no_data', 'unavailable', 'disabled_pending_validation']) {
      await page.goto(origin + '/?route=executive-overview&state=' + state);
      await page.getByRole('img', { name: 'Nepal local-unit coverage map' }).waitFor();
      assert.doesNotMatch(await page.locator('body').innerText(), /1,?800|1,?200/);
      await page.screenshot({ path: path.join(output, 'executive-' + state + '.png'), fullPage: true });
    }
    await page.goto(origin + '/?route=geographic-coverage&noParticipants=1');
    await page.getByRole('img', { name: 'Nepal local-unit coverage map' }).waitFor();
    assert.equal(await page.locator('svg[aria-label="Nepal local-unit coverage map"] path[fill="#E2E8F0"]').count(), 777);
    assert.deepEqual(errors, []);
    fs.writeFileSync(path.join(output, 'results.json'), JSON.stringify({ scope: 'Offline actual-component browser QA; synthetic fixtures only, no authenticated/live-data validation.', results, assertions: '40 route/viewport checks; 777 map paths; privacy labels; unsupported filters; filter URL and clear; mobile focus/Escape; desktop collapse; activity search; no-data, unavailable and disabled states.', errors }, null, 2));
    console.log('UI reconciliation browser QA passed: 10 routes × 4 viewports plus interaction, map, suppression and unavailable-state checks. Evidence: test-results/ui-reconciliation. Offline fixtures only.');
  } finally {
    if (browser) await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
}

main().catch(error => { console.error(error); process.exitCode = 1; });
