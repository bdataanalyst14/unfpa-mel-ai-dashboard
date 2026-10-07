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
  const out = path.join(root, 'test-results/activity-detail');
  fs.mkdirSync(out, {recursive:true});
  const applicationCredentials = path.join(process.env.APPDATA, 'gcloud/application_default_credentials.json');
  assert.ok(fs.existsSync(applicationCredentials), 'Local ADC required');
  const config = {projectId:'unfpadatabase',datasetId:'unfpadatabase',location:'asia-south1',clientEmail:'',privateKeyFile:'',applicationCredentials,maximumBytesBilled:'1000000000'};
  const client = new BigQuery({projectId:config.projectId,keyFilename:applicationCredentials});
  const objects = await inspectReportingObjects(client,config);
  const evidenceFile = path.join(out,'local-readiness.json');
  fs.writeFileSync(evidenceFile,JSON.stringify({configurationHash:configurationHash(config),objects}));
  const secret = crypto.randomBytes(32).toString('hex');
  const port = 3097;
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
    const open=async suffix=>{await page.goto(base+'/dashboard/activity-detail'+suffix);await page.getByRole('heading',{name:'Activity aggregates',exact:true}).waitFor();};
    const rows=()=>page.locator('tbody tr');
    const metrics=()=>page.getByRole('region',{name:'Aggregate metrics'}).innerText();
    await open('');
    assert.equal(await rows().count(),25);
    assert.match(await metrics(),/4,663/);assert.match(await metrics(),/158,382/);assert.match(await metrics(),/152,252/);
    for(const width of [1440,390]) {
      await page.setViewportSize({width,height:900});
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
      await page.screenshot({path:path.join(out,`live-${width}.png`),fullPage:true});
      const before=await metrics();
      await page.getByRole('button',{name:'Columns',exact:true}).click();
      await page.getByRole('button',{name:'Select all analytical fields'}).click();
      assert.equal(await page.getByRole('checkbox',{checked:true}).count(),57);
      await page.screenshot({path:path.join(out,`columns-${width}.png`)});
      await page.keyboard.press('Escape');
      assert.equal(await page.locator('thead th').count(),57);assert.equal(await metrics(),before);
      const region=page.getByRole('region',{name:'Scrollable activity table'});
      await region.evaluate(node=>{node.scrollLeft=node.scrollWidth;});assert.ok(await region.evaluate(node=>node.scrollLeft)>0);
      await page.getByRole('button',{name:'Columns',exact:true}).click();await page.getByRole('button',{name:'Reset to default'}).click();await page.keyboard.press('Escape');
      assert.equal(await page.locator('thead th').count(),14);
      await page.getByRole('button',{name:'Data definitions',exact:true}).click();await page.getByRole('dialog').waitFor();await page.screenshot({path:path.join(out,`definitions-${width}.png`)});await page.keyboard.press('Escape');
    }
    await page.getByRole('button',{name:'Next',exact:true}).click();await page.getByText('Page 2 of 121',{exact:true}).waitFor();assert.equal(await rows().count(),25);
    await page.getByRole('combobox',{name:'Rows per page'}).selectOption('100');await page.getByText('Page 1 of 31',{exact:true}).waitFor();assert.equal(await rows().count(),100);
    await page.getByRole('button',{name:'Total Participants',exact:true}).click();await page.waitForURL(/sort=participants/);await page.getByText('Page 1 of 31',{exact:true}).waitFor();
    await page.getByRole('searchbox').fill('CDEU1323');await page.getByRole('button',{name:'Search',exact:true}).click();await page.waitForURL(/search=CDEU1323/);await page.getByText(/446 matching aggregate rows/).waitFor();
    assert.match(await metrics(),/707/);
    const downloadPromise=page.waitForEvent('download');await page.getByRole('button',{name:'Download Full Combined Summary CSV',exact:true}).click();const download=await downloadPromise;const csv=fs.readFileSync(await download.path(),'utf8');
    assert.match(csv,/CDEU1323/);assert.match(csv,/<5/);assert.doesNotMatch(csv,/event_row_key|Activity Details|Indicator/);assert.match(csv,/Published age total/);
    fs.writeFileSync(path.join(out,'search-export.csv'),csv);
    await open('');await page.getByRole('button',{name:'More Filters',exact:true}).click();
    const output=page.getByRole('dialog').getByRole('combobox',{name:'Reporting Mode'});await output.selectOption('summary');await page.waitForURL(/entry_mode=summary/);await page.getByRole('heading',{name:'Activity aggregates',exact:true}).waitFor();await page.keyboard.press('Escape');
    await open('');await page.getByRole('combobox',{name:'Province',exact:true}).selectOption('Karnali');await page.waitForURL(/province=Karnali/);await page.getByText(/810 matching aggregate rows/).waitFor();
    assert.match(await metrics(),/1,148/);
    await page.getByRole('combobox',{name:'District',exact:true}).selectOption('Rukum West');await page.waitForURL(/district=Rukum/);await page.getByText(/137 matching aggregate rows/).waitFor();
    await page.getByRole('combobox',{name:'Municipality / LG',exact:true}).selectOption('Sanibheri Rural Municipality');await page.waitForURL(/municipality=Sanibheri/);await page.getByText(/137 matching aggregate rows/).waitFor();
    await page.getByRole('combobox',{name:'Province',exact:true}).selectOption('Bagmati');await page.waitForURL(/province=Bagmati/);
    assert.equal(new URL(page.url()).searchParams.has('district'),false);assert.equal(new URL(page.url()).searchParams.has('municipality'),false);
    await open('?search=zz-no-matching-activity');assert.equal(await rows().count(),0);assert.ok(await page.getByRole('button',{name:'Download Full Combined Summary CSV',exact:true}).isDisabled());
    assert.deepEqual(errors,[]);
    fs.writeFileSync(path.join(out,'live-browser.json'),JSON.stringify({status:'PASS',scope:'Actual local production Next.js app, live read-only ADC, ephemeral local test JWT session; Google OAuth exchange not exercised',viewports:[1440,390],assertions:['KPI totals','25/100 pagination','server sorting','server search','full search CSV','57 columns','visibility invariant','reset','definitions','More Filters','geographic cascade','empty state','unauthorized export denied','no overflow','no runtime or hydration errors'],errors},null,2));
    console.log('PASS actual local live Activity Detail browser QA at 1440px and 390px');
  } finally { if(browser)await browser.close();server.kill();fs.closeSync(log); }
}
main().catch(error=>{console.error(error instanceof assert.AssertionError ? error.message : String(error.message).slice(0,1200));process.exitCode=1;});
