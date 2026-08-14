const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { MANIFEST_RELATIVE_PATH } = require('../../src/lib/server/readiness-manifest-contract');

const root = path.resolve(__dirname, '../..');
assert(fs.existsSync(path.join(root, MANIFEST_RELATIVE_PATH)), 'Generated readiness manifest is missing.');

const serverRoot = path.join(root, '.next/server');
const traceFiles = [];
function visit(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) visit(fullPath);
    else if (entry.name.endsWith('.nft.json')) traceFiles.push(fullPath);
  }
}
visit(serverRoot);
const traced = traceFiles.some((file) => {
  const trace = JSON.parse(fs.readFileSync(file, 'utf8'));
  return Array.isArray(trace.files)
    && trace.files.some((item) => item.replaceAll('\\', '/').endsWith(MANIFEST_RELATIVE_PATH));
});
assert(traced, 'Readiness manifest is not included in any Next.js server output trace.');
console.log('Server-only readiness manifest bundle trace verified.');
