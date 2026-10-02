const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

async function main() {
  const root = path.resolve(__dirname, '..');
  
  // start dev server
  const server = spawn('npm', ['run', 'dev'], { 
    cwd: root, 
    shell: true,
    env: { ...process.env, DASHBOARD_AUTH_REQUIRED: 'false' } 
  });
  
  // wait for it to be ready
  await new Promise(r => setTimeout(r, 10000));
  
  const { chromium } = require('playwright');
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  const viewports = [
    { width: 375, height: 812, name: '375' },
    { width: 768, height: 1024, name: '768' },
    { width: 1024, height: 768, name: '1024' },
    { width: 1440, height: 900, name: '1440' }
  ];
  
  const routes = [
    '/dashboard/executive-overview',
    '/dashboard/activity-progress',
    '/dashboard/participant-reach',
    '/dashboard/geographic-coverage'
  ];
  
  for (const vp of viewports) {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    for (const route of routes) {
      await page.goto(`http://localhost:3000${route}`);
      // Wait for network idle
      await page.waitForTimeout(3000); 
      const slug = route.split('/').pop();
      await page.screenshot({ path: path.join(root, `docs/dashboard_qa/screenshots/${slug}-${vp.name}.png`), fullPage: true });
    }
  }
  
  await browser.close();
  server.kill();
  console.log("Screenshots taken.");
}
main().catch(console.error);
