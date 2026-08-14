const fs = require('node:fs');
const path = require('node:path');
const {
  MANIFEST_RELATIVE_PATH,
  createManifest,
} = require('../../src/lib/server/readiness-manifest-contract');

function safeSourceCommit(env) {
  const candidate = env.VERCEL_GIT_COMMIT_SHA || env.GITHUB_SHA;
  return candidate && /^[a-f0-9]{40}$/i.test(candidate.trim()) ? candidate.trim().toLowerCase() : undefined;
}

function generate({ env = process.env, root = path.resolve(__dirname, '../..') } = {}) {
  const manifest = createManifest(env, safeSourceCommit(env));
  const outputPath = path.join(root, MANIFEST_RELATIVE_PATH);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.rmSync(outputPath, { force: true });
  fs.writeFileSync(outputPath, `${JSON.stringify(manifest, null, 2)}\n`, { mode: 0o444 });
  return { manifest, outputPath };
}

if (require.main === module) {
  try {
    const { manifest } = generate();
    console.log(`Generated server-only readiness manifest for ${manifest.dataMode}/${manifest.authMode}.`);
  } catch (error) {
    console.error(`Readiness manifest generation failed: ${error.message}`);
    process.exitCode = 1;
  }
}

module.exports = { generate, safeSourceCommit };
