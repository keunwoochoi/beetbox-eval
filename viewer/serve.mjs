import { createReadStream } from 'node:fs';
import { access, stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { dirname, extname, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runDefinitions } from './runs.mjs';

const viewerDir = dirname(fileURLToPath(import.meta.url));
const repoDir = resolve(viewerDir, '..');
const promptDir = join(repoDir, 'prompt');
const dashboardPort = Number(process.env.PORT || 4000);
const host = process.env.HOST || '0.0.0.0';
const viteBin = join(viewerDir, 'node_modules', 'vite', 'bin', 'vite.js');

const runs = runDefinitions.map((run) => ({ ...run, state: 'queued', message: '' }));

const children = new Map();
let stopping = false;
const mimeTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.json': 'application/json; charset=utf-8',
  '.mov': 'video/quicktime',
  '.mp4': 'video/mp4',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp'
};

function publicRun(run) {
  const { folder, ...safe } = run;
  return safe;
}

function stripAnsi(value) {
  return value.replace(/\u001b\[[0-9;]*m/g, '');
}

async function launchRun(run) {
  const root = join(repoDir, run.folder);
  try {
    await access(join(root, 'index.html'));
  } catch {
    run.state = 'missing';
    run.message = 'No index.html was generated';
    return;
  }

  run.state = 'starting';
  const child = spawn(process.execPath, [viteBin, '--host', host, '--port', String(run.port), '--strictPort', '--clearScreen', 'false'], {
    cwd: root,
    env: { ...process.env, BROWSER: 'none', FORCE_COLOR: '0' },
    stdio: ['ignore', 'pipe', 'pipe']
  });
  children.set(run.id, child);

  const handleOutput = (buffer) => {
    const output = stripAnsi(buffer.toString());
    if (/ready in|Local:\s+http/i.test(output)) {
      run.state = 'ready';
      run.message = '';
    }
    if (/error when starting|is already in use|failed to load/i.test(output)) {
      run.state = 'error';
      run.message = output.trim().split('\n').at(-1) || 'Preview server failed';
    }
    if (process.env.VERBOSE_RUNS === '1') process.stdout.write(`[${run.id}] ${output}`);
  };

  child.stdout.on('data', handleOutput);
  child.stderr.on('data', handleOutput);
  child.on('error', (error) => {
    run.state = 'error';
    run.message = error.message;
  });
  child.on('exit', (code, signal) => {
    children.delete(run.id);
    if (!stopping) {
      run.state = 'error';
      run.message = `Preview exited (${signal || code})`;
    }
  });
}

function safePath(root, pathname) {
  const candidate = resolve(root, `.${pathname}`);
  return candidate === root || candidate.startsWith(`${root}${sep}`) ? candidate : null;
}

async function sendFile(response, path) {
  try {
    const info = await stat(path);
    if (!info.isFile()) throw new Error('Not a file');
    response.writeHead(200, {
      'Content-Type': mimeTypes[extname(path).toLowerCase()] || 'application/octet-stream',
      'Content-Length': info.size,
      'Cache-Control': extname(path) === '.html' ? 'no-cache' : 'public, max-age=300'
    });
    createReadStream(path).pipe(response);
  } catch {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Not found');
  }
}

const server = createServer(async (request, response) => {
  const url = new URL(request.url || '/', `http://${request.headers.host || 'localhost'}`);
  if (url.pathname === '/api/runs' || url.pathname === '/runs.json') {
    response.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
    response.end(JSON.stringify({ dashboardPort, runs: runs.map(publicRun) }));
    return;
  }
  if (url.pathname === '/api/health') {
    response.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
    response.end(JSON.stringify({ ok: true, ready: runs.filter((run) => run.state === 'ready').length, total: runs.length }));
    return;
  }
  if (url.pathname.startsWith('/reference/')) {
    const path = safePath(promptDir, url.pathname.slice('/reference'.length));
    if (!path) {
      response.writeHead(403).end();
      return;
    }
    await sendFile(response, path);
    return;
  }

  const pathname = url.pathname === '/' ? '/index.html' : url.pathname;
  const path = safePath(viewerDir, pathname);
  if (!path || path === join(viewerDir, 'serve.mjs') || path === join(viewerDir, 'package.json')) {
    response.writeHead(403).end();
    return;
  }
  await sendFile(response, path);
});

server.listen(dashboardPort, host, () => {
  console.log(`Beetbox Model Arena: http://localhost:${dashboardPort}/`);
});

await Promise.all(runs.map(launchRun));
function shutdown(signal) {
  if (stopping) return;
  stopping = true;
  console.log(`\nStopping previews (${signal})...`);
  server.close();
  for (const child of children.values()) child.kill('SIGTERM');
  setTimeout(() => {
    for (const child of children.values()) child.kill('SIGKILL');
    process.exit(0);
  }, 1500).unref();
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
