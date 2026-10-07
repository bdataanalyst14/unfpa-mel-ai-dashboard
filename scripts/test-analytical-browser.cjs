const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { spawn } = require('node:child_process');
const assert = require('node:assert/strict');
const { BigQuery } = require('@google-cloud/bigquery');
const { chromium } = require('@playwright/test');
const { encode } = require('next-auth/jwt');
const { inspectReportingObjects, configurationHash } = require('./dashboard/bigquery-readonly');

async function main() {
  const root = path.resolve(__dirname, '..');
  const out = path.join(root, 'test-results/analytical-pass/browser');
  fs.mkdirSync(out, {recursive:true});
  const applicationCredentials = path.join(process.env.APPDATA, 'gcloud/application_default_credentials.json');
  assert.ok(fs.existsSync(applicationCredentials), 'Local ADC required');
  const config = {projectId:'unfpadatabase',datasetId:'unfpadatabase',location:'asia-south1',clientEmail:'',privateKeyFile:'',applicationCredentials,maximumBytesBilled:'1000000000'};
  const client = new BigQuery({projectId:config.projectId,keyFilename:applicationCredentials});
  const objects = await inspectReportingObjects(client,config);
  const evidenceFile = path.join(out,'local-readiness.json');
  fs.writeFileSync(evidenceFile,JSON.stringify({configurationHash:configurationHash(config),objects}));
  const secret = crypto.randomBytes(32).toString('hex');
  const port = 3098;
  const base = `http://127.0.0.1:${port}`;
  const env = {...process.env, NODE_ENV:'production',DATA_MODE:'bigquery',DASHBOARD_DATA_MODE:'bigquery',DASHBOARD_AUTH_REQUIRED:'true',
    GOOGLE_APPLICATION_CREDENTIALS:applicationCredentials,GOOGLE_CLOUD_PROJECT_ID:config.projectId,BIGQUERY_PROJECT_ID:config.projectId,BIGQUERY_DATASET_ID:config.datasetId,BIGQUERY_LOCATION:config.location,BIGQUERY_MAX_BYTES_BILLED:config.maximumBytesBilled,DASHBOARD_EVIDENCE_FILE:evidenceFile,
    AUTH_SECRET:secret,NEXTAUTH_SECRET:secret,NEXTAUTH_URL:base,GOOGLE_OAUTH_CLIENT_ID:'local-qa',GOOGLE_OAUTH_CLIENT_SECRET:'local-qa',DASHBOARD_AUTHORIZED_EMAILS:'activity-qa@example.invalid',DASHBOARD_ADMIN_EMAILS:'',
    GCP_PROJECT_NUMBER:'',GCP_SERVICE_ACCOUNT_EMAIL:'',GCP_WORKLOAD_IDENTITY_POOL_ID:'',GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID:'',GOOGLE_CLIENT_EMAIL:'',GOOGLE_PRIVATE_KEY_FILE:'',GOOGLE_PRIVATE_KEY:'',GOOGLE_PRIVATE_KEY_BASE64:'',VERCEL:'',VERCEL_ENV:'',VERCEL_OIDC_TOKEN:''};
  const log = fs.openSync(path.join(out,'local-server.log'),'w');
  const server = spawn(process.execPath,[path.join(root,'node_modules/next/dist/bin/next'),'start','--hostname','127.0.0.1','--port',String(port)],{cwd:root,env,stdio:['ignore',log,log],windowsHide:true});
  let browser;
  try {
    for(let i=0;i<60;i++){try{if((await fetch(base+'/api/health')).ok)break;}catch{}await new Promise(resolve=>setTimeout(resolve,500));}
    assert.equal((await fetch(base+'/api/dashboard/activity-detail/export')).status,401);
    browser=await chromium.launch({headless:true});
    const context=await browser.newContext();
    const token=await encode({secret,token:{userId:'local-activity-qa',email:'activity-qa@example.invalid',emailVerified:true,role:'AUTHORIZED_USER'},maxAge:3600});
    await context.addCookies([{name:'next-auth.session-token',value:token,url:base,httpOnly:true,sameSite:'Lax'}]);
    const page=await context.newPage();page.setDefaultTimeout(120000);
    const errors=[];page.on('pageerror',error=>errors.push(error.message));page.on('console',message=>{if(message.type()==='error')errors.push(message.text());});
    const api = async (route, params = '') => {
      const response = await context.request.get(`${base}/api/dashboard/page-data?route=${route}&${params}`);
      assert.equal(response.status(),200);
      return response.json();
    };
    const open = async (route, query = '') => { await page.goto(`${base}/dashboard/${route}?${query}`); await page.getByRole('region',{name:'Aggregate metrics'}).waitFor(); };
    await open('executive-overview');
    for(const title of ['Age Profile','Social Inclusion Profile','Disability Profile','Activity / Event Type']) await page.getByRole('heading',{name:title,exact:true}).waitFor();
    const before = await page.getByRole('region',{name:'Aggregate metrics'}).innerText();
    const project = await page.getByLabel('Project',{exact:true}).locator('option').nth(1).getAttribute('value');
    await page.getByLabel('Project',{exact:true}).selectOption(project);
    await page.waitForURL(/project=/);
    const scoped = await api('executive-overview',new URL(page.url()).searchParams.toString());
    const expectedEvents = scoped.metrics.find(metric=>metric.label==='Reported activities').value;
    await page.getByRole('region',{name:'Aggregate metrics'}).getByText(Number(expectedEvents).toLocaleString('en-US'),{exact:true}).waitFor();
    assert.notEqual(await page.getByRole('region',{name:'Aggregate metrics'}).innerText(),before);
    const map = page.locator('svg[aria-label="Nepal reported activity density by event location"]');
    await map.waitFor();
    const titles = await map.locator('title').allTextContents();
    for(const row of scoped.sections.find(section=>section.key==='district').rows) {
      const matches=titles.filter(title=>title.toLowerCase().startsWith(row.label.toLowerCase()+','));
      if(matches.length) assert.ok(matches.every(title=>title.includes(`district: ${row.events}.`)));
    }
    for(const width of [1440,390]) {
      await page.setViewportSize({width,height:900});
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
      await page.screenshot({path:path.join(out,`executive-${width}.png`),fullPage:true});
    }
    await open('participant-reach');
    await page.getByRole('button',{name:'More Filters',exact:true}).click();
    await page.getByLabel('Reporting classification',{exact:true}).selectOption('non-reportable');
    await page.waitForURL(/classification=non-reportable/);
    await page.keyboard.press('Escape');
    const classified=await api('participant-reach','classification=non-reportable');
    const total=classified.metrics.find(metric=>metric.label==='Total participants').value;
    await page.getByRole('region',{name:'Aggregate metrics'}).getByText(Number(total).toLocaleString('en-US'),{exact:true}).waitFor();
    await page.screenshot({path:path.join(out,'participant-non-reportable.png'),fullPage:true});
    await open('activity-progress',`project=${encodeURIComponent(project)}`);
    await page.getByRole('button',{name:'More Filters',exact:true}).click();
    const outcome=await page.getByLabel('Outcome',{exact:true}).locator('option').nth(1).getAttribute('value');
    await page.getByLabel('Outcome',{exact:true}).selectOption(outcome);
    await page.waitForURL(/outcome=/);
    await page.keyboard.press('Escape');
    const hierarchy=await api('activity-progress',new URL(page.url()).searchParams.toString());
    assert.ok(hierarchy.sections.find(section=>section.key==='outcome').rows.every(row=>row.label===outcome));
    await page.getByRole('button',{name:'More Filters',exact:true}).click();
    assert.deepEqual((await page.getByLabel('Output',{exact:true}).locator('option').allTextContents()).slice(1),hierarchy.analyticalControls.options.output);
    await page.keyboard.press('Escape');
    await page.screenshot({path:path.join(out,'activity-hierarchy.png'),fullPage:true});
    await open('activity-detail',`project=${encodeURIComponent(project)}`);
    const detail=await api('activity-detail',new URL(page.url()).searchParams.toString());
    assert.equal(await page.locator('tbody tr').count(),Math.min(25,detail.activityPage.totalRows));
    await page.getByRole('button',{name:'Columns',exact:true}).click();
    await page.getByRole('button',{name:'Select all analytical fields'}).click();
    const { loader }=require('./activity-test-loader.cjs');
    const columnCount=loader()('src/lib/aggregate-contract.ts').activityFields.length;
    assert.equal(await page.getByRole('checkbox',{checked:true}).count(),columnCount);
    await page.keyboard.press('Escape');
    const downloadPromise=page.waitForEvent('download');
    await page.getByRole('button',{name:'Download Full Combined Summary CSV',exact:true}).click();
    const download=await downloadPromise;
    const csv=fs.readFileSync(await download.path(),'utf8');
    assert.doesNotMatch(csv,/event_row_key|actdetails1|participant_id|unique_key/);
    assert.ok(csv.includes('Sex reconciliation'));
    const exportResponse=await context.request.get(`${base}/api/dashboard/activity-detail/export?project=${encodeURIComponent(project)}`);
    assert.equal(exportResponse.status(),200);assert.equal(await exportResponse.text(),csv);
    await page.screenshot({path:path.join(out,'activity-detail.png'),fullPage:true});
    const routes = ['executive-overview','activity-progress','participant-reach','indicator-progress','ip-performance','geographic-coverage','gbv-ocmc-summary','data-quality','management-decision-centre','activity-detail'];
    for (const width of [1440,390]) {
      await page.setViewportSize({width,height:900});
      for (const route of routes) {
        await page.goto(`${base}/dashboard/${route}`);
        await page.locator('h1').waitFor();
        if (['executive-overview','geographic-coverage'].includes(route)) await page.locator('svg[aria-label="Nepal reported activity density by event location"]').waitFor();
        assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`${route} ${width} overflow`);
        await page.screenshot({path:path.join(out,`${route}-${width}.png`),fullPage:true});
      }
    }
    await open('activity-detail');
    for (const preset of ['Programme','Participants','Inclusion','Geography']) {
      await page.getByRole('button',{name:'Columns',exact:true}).click();
      await page.getByRole('button',{name:preset,exact:true}).click();
      const checked = await page.getByRole('checkbox',{checked:true}).count();
      assert.ok(checked > 0);
      await page.keyboard.press('Escape');
      assert.equal(await page.locator('thead th').count(),checked);
    }
    const visibleDownload = page.waitForEvent('download');
    await page.getByRole('button',{name:'Download Visible Columns CSV',exact:true}).click();
    const visibleCsv = fs.readFileSync(await (await visibleDownload).path(),'utf8');
    assert.match(visibleCsv,/Province/);assert.doesNotMatch(visibleCsv,/Reported activities/);
    await open('geographic-coverage');
    await page.getByLabel('Map measure',{exact:true}).selectOption('participants');
    await page.locator('svg path[role="button"]').first().waitFor();
    assert.ok((await page.locator('svg title').first().textContent()).includes('Participant attendance'));
    await page.locator('svg path[role="button"]').first().click();
    await page.waitForURL(/province=/);
    await page.locator('svg path[role="button"]').first().click();
    await page.waitForURL(/district=/);
    assert.ok(await page.getByRole('navigation',{name:'Geographic drill state'}).innerText());
    await page.getByRole('button',{name:'Reset geography',exact:true}).click();
    await page.waitForURL(url => !url.searchParams.has('province') && !url.searchParams.has('district'));
    assert.deepEqual(errors,[]);
    fs.writeFileSync(path.join(out,'verification.json'),JSON.stringify({status:'PASS',checks:['local authenticated routes','project filter updates headline and map','four executive profiles','desktop/mobile overflow','classification updates participants','cascading hierarchy','57 columns','complete filtered CSV','ten routes at desktop/mobile','map measures and click drill','four column presets','visible column CSV','no browser errors','unauthorized export denied']},null,2));
    console.log('PASS local live analytical browser verification');
  } finally { if(browser)await browser.close();server.kill();fs.closeSync(log); }
}
main().catch(error=>{console.error(error.message);process.exitCode=1;});
