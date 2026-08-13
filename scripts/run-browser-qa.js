const { spawn } = require('node:child_process');
const fs = require('node:fs');
const net = require('node:net');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const headed = process.argv.includes('--headed');
const playwrightArgs = process.argv.slice(2).filter((argument) => argument !== '--headed');
const startupTimeoutMs = 45_000;
const logs = [
  path.join(root, '.playwright-server.stdout.log'),
  path.join(root, '.playwright-server.stderr.log'),
];

function run(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: root,
      env: process.env,
      stdio: 'inherit',
      shell: false,
      windowsHide: true,
      ...options,
    });
    child.once('error', reject);
    child.once('exit', (code, signal) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} exited with ${code ?? signal}`));
    });
  });
}

function portAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.unref();
    server.once('error', () => resolve(false));
    server.listen({ host: '127.0.0.1', port }, () => {
      server.close(() => resolve(true));
    });
  });
}

async function selectPort() {
  for (let port = 3000; port <= 3010; port += 1) {
    if (await portAvailable(port)) return port;
  }
  throw new Error('No available QA port between 3000 and 3010.');
}

async function waitForHealth(port, server) {
  const deadline = Date.now() + startupTimeoutMs;
  while (Date.now() < deadline) {
    if (server.exitCode !== null) {
      throw new Error(`Production server exited before readiness with ${server.exitCode}.`);
    }
    try {
      const response = await fetch(`http://127.0.0.1:${port}/api/health`);
      if (response.ok) return;
    } catch {
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`Production server did not become ready within ${startupTimeoutMs}ms.`);
}

async function stopExactProcess(child) {
  if (!child || child.exitCode !== null) return;
  child.kill();
  await Promise.race([
    new Promise((resolve) => child.once('exit', resolve)),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`Server process ${child.pid} did not stop within 10 seconds.`)), 10_000),
    ),
  ]);
}

async function main() {
  let server;
  let stdout;
  let stderr;
  let failure;

  try {
    await run(process.execPath, [path.join(root, 'node_modules', 'next', 'dist', 'bin', 'next'), 'build', '--webpack']);
    const port = await selectPort();
    stdout = fs.openSync(logs[0], 'w');
    stderr = fs.openSync(logs[1], 'w');
    server = spawn(
      process.execPath,
      [
        path.join(root, 'node_modules', 'next', 'dist', 'bin', 'next'),
        'start',
        '--hostname',
        '127.0.0.1',
        '--port',
        String(port),
      ],
      {
        cwd: root,
        env: {
          ...process.env,
          NODE_ENV: 'production',
          DATA_MODE: 'mock',
          DASHBOARD_DATA_MODE: 'mock',
          PLAYWRIGHT_QA: '1',
        },
        detached: false,
        shell: false,
        windowsHide: true,
        stdio: ['ignore', stdout, stderr],
      },
    );
    server.once('error', (error) => {
      failure = error;
    });
    await waitForHealth(port, server);
    if (failure) throw failure;
    await run(
      process.execPath,
      [path.join(root, 'node_modules', '@playwright', 'test', 'cli.js'), 'test', ...playwrightArgs],
      {
        env: {
          ...process.env,
          PLAYWRIGHT_BASE_URL: `http://127.0.0.1:${port}`,
          PLAYWRIGHT_HEADED: headed ? '1' : '0',
        },
      },
    );
  } finally {
    await stopExactProcess(server);
    if (stdout !== undefined) fs.closeSync(stdout);
    if (stderr !== undefined) fs.closeSync(stderr);
    for (const log of logs) {
      fs.rmSync(log, { force: true });
    }
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
