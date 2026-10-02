const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const assert = require('node:assert/strict');
const { webpack } = require('next/dist/compiled/webpack/webpack');
const { chromium } = require('@playwright/test');
const root = path.resolve(__dirname, '..');
const out = path.join(root, '.qa-production-ui');
const routes = ['executive-overview','activity-progress','participant-reach','indicator-progress','ip-performance','geographic-coverage','gbv-ocmc','data-quality','management-decision-centre','activity-detail'];
async function main() {
  fs.mkdirSync(out, {recursive:true});
  const css = await require('postcss')([require('tailwindcss')(require('../tailwind.config.js'))]).process(fs.readFileSync(path.join(root,'src/app/globals.css'),'utf8'),{from:path.join(root,'src/app/globals.css')});
  fs.writeFileSync(path.join(out,'style.css'),css.css);
  await new Promise((resolve,reject)=>webpack({mode:'development',devtool:false,entry:path.join(root,'tests/ui-harness/entry.tsx'),output:{path:out,filename:'bundle.js'},resolve:{extensions:['.tsx','.ts','.js'],alias:{'@':path.join(root,'src'),'next-auth/react$':path.join(root,'tests/ui-harness/navigation.tsx'),'next/navigation$':path.join(root,'tests/ui-harness/navigation.tsx'),'next/link$':path.join(root,'tests/ui-harness/navigation.tsx')}},module:{rules:[{test:/\.tsx?$/,use:path.join(root,'tests/ui-harness/loader.cjs')}]},stats:'errors-only'},(err,stats)=>err||stats.hasErrors()?reject(err||new Error(stats.toString({all:false,errors:true}))):resolve()));
  const server=http.createServer((req,res)=>{
    const name=req.url.split('?')[0];
    const file=name==='/bundle.js'?path.join(out,'bundle.js'):name==='/style.css'?path.join(out,'style.css'):name==='/maps/local-units.geojson'?path.join(root,'public/maps/local-units.geojson'):null;
    res.setHeader('Content-Type',name.endsWith('.js')?'application/javascript':name.endsWith('.css')?'text/css':name.endsWith('.geojson')?'application/json':'text/html');
    res.end(file?fs.readFileSync(file):'<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><link rel="stylesheet" href="/style.css"></head><body><div id="root"></div><script src="/bundle.js"></script></body></html>');
  });
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const base=`http://127.0.0.1:${server.address().port}`;
  let browser;
  const errors=[];
  try {
    browser=await chromium.launch({headless:true});
    const page=await browser.newPage();
    page.on('pageerror',err=>{errors.push(err.message);console.error(err.message);});
    for(const width of [1440,390]) {
      await page.setViewportSize({width,height:900});
      for(const route of routes) {
        await page.goto(`${base}/dashboard/${route}`);
        await page.locator('h1').waitFor();
        if(['executive-overview','geographic-coverage'].includes(route)) {
          await page.locator('svg[aria-label="Nepal local-unit coverage map"]').waitFor();
          assert.equal(await page.locator('svg[aria-label="Nepal local-unit coverage map"] path').count(),777);
        }
        assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`${route} ${width} overflow`);
        assert.equal(await page.getByText('Not supported',{exact:true}).count(),0);
        await page.screenshot({path:path.join(out,`${width}-${route}.png`),fullPage:true});
        console.log(`PASS ${width} ${route}`);
      }
    }
    await page.goto(`${base}/dashboard/activity-detail`);
    const scroller = page.getByRole('region',{name:'Scrollable activity table'});
    assert.equal(await scroller.evaluate(node=>node.scrollWidth>node.clientWidth),true);
    await scroller.evaluate(node=>{node.scrollLeft=node.scrollWidth;});
    assert.ok(await scroller.evaluate(node=>node.scrollLeft)>0);
    await page.getByRole('button',{name:'Next',exact:true}).click();
    assert.match(await page.locator('section').last().innerText(),/Page 2 of 3/);
    await page.getByRole('button',{name:'Reported activities',exact:false}).first().click();
    await page.getByRole('searchbox').fill('ACT-001');
    assert.equal(await page.locator('tbody tr').count(),1);
    const downloadPromise=page.waitForEvent('download');
    await page.getByRole('button',{name:'Download CSV'}).click();
    const download=await downloadPromise;
    const csv=fs.readFileSync(await download.path(),'utf8');
    assert.match(csv,/ACT-001/);assert.match(csv,/<5/);assert.doesNotMatch(csv,/ACT-002/);assert.equal(csv.split('\r\n').length,2);
    await page.getByRole('searchbox').fill('no-such-activity');
    assert.equal(await page.getByRole('button',{name:'Download CSV'}).isDisabled(),true);
    await page.goto(`${base}/dashboard/activity-detail`);
    await page.getByLabel('Province',{exact:true}).selectOption('Bagmati');
    await page.waitForURL(/province=Bagmati/);
    assert.equal(await page.getByLabel('District',{exact:true}).locator('option').count(),2);
    assert.equal(await page.locator('tbody tr').count(),7);
    await page.getByRole('button',{name:'Open navigation',exact:true}).click();
    await page.getByRole('dialog').getByRole('link',{name:'Executive Overview',exact:true}).click();
    await page.waitForURL(/executive-overview/);
    assert.equal(await page.getByRole('dialog').count(),0);
    await page.goto(`${base}/dashboard/executive-overview?state=unavailable`);
    await page.getByRole('heading',{name:'No production data available',exact:true}).waitFor();
    assert.equal(await page.getByRole('region',{name:'Aggregate metrics'}).count(),0);
    assert.deepEqual(errors.filter(e => !e.includes("Unexpected token '<'")),[]);
    fs.writeFileSync(path.join(out,'qa.json'),JSON.stringify({scope:'offline production components; no live credentials or API',routes,viewports:[1440,390],mapFeatures:777,csv:'passed',filters:'passed',navigation:'passed',runtimeErrors:errors},null,2));
    console.log('PASS production component interactions, CSV, suppression, cascades, mobile navigation, no-data state');
  } finally { if(browser)await browser.close();await new Promise(resolve=>server.close(resolve)); }
}
main().catch(error=>{console.error(error);process.exitCode=1;});
