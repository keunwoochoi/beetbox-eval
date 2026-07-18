import { cp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { basename, dirname, extname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runDefinitions } from '../viewer/runs.mjs';

const scriptsDir = dirname(fileURLToPath(import.meta.url));
const repoDir = resolve(scriptsDir, '..');
const outputDir = join(repoDir, '_site');
const viewerDir = join(repoDir, 'viewer');
const referenceDir = join(repoDir, 'prompt');

const excludedDirectories = new Set(['.git', 'beetbox_frames', 'dist', 'node_modules']);
const excludedFiles = new Set(['.DS_Store', '.gitignore', 'PROMPT.md', 'README.md', 'beetbox.mov', 'package-lock.json', 'package.json']);
const viewerAssets = ['app.js', 'audio-focus.js', 'index.html', 'reference.html', 'styles.css'];
const audioFocusSource = await readFile(join(viewerDir, 'audio-focus.js'), 'utf8');

function shouldCopyRunAsset(source, runRoot) {
  if (source === runRoot) return true;
  const parts = relative(runRoot, source).split(/[\\/]/);
  if (parts.some((part) => excludedDirectories.has(part))) return false;
  return !excludedFiles.has(basename(source));
}

async function rewriteRootRelativeHtml(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  await Promise.all(entries.map(async (entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      await rewriteRootRelativeHtml(path);
      return;
    }
    if (extname(entry.name).toLowerCase() !== '.html') return;
    const source = await readFile(path, 'utf8');
    let rewritten = source.replace(/(\b(?:href|src)\s*=\s*["'])\/(?!\/)/gi, '$1./');
    if (entry.name === 'index.html' && !rewritten.includes('data-beetbox-audio-focus')) {
      rewritten = rewritten.replace(/<head([^>]*)>/i, `$&\n<script data-beetbox-audio-focus>\n${audioFocusSource}\n</script>`);
    }
    await writeFile(path, rewritten);
  }));
}

async function exportRun(run) {
  const source = join(repoDir, run.folder);
  const destination = join(outputDir, 'runs', run.folder);
  await cp(source, destination, {
    recursive: true,
    filter: (path) => shouldCopyRunAsset(path, source)
  });
  await rewriteRootRelativeHtml(destination);
  await readFile(join(destination, 'index.html'));
}

await rm(outputDir, { recursive: true, force: true });
await mkdir(outputDir, { recursive: true });

await Promise.all(viewerAssets.map((asset) => cp(join(viewerDir, asset), join(outputDir, asset))));
await mkdir(join(outputDir, 'reference'), { recursive: true });
await cp(join(referenceDir, 'beetbox.mov'), join(outputDir, 'reference', 'beetbox.mov'));
await cp(join(referenceDir, 'beetbox_frames'), join(outputDir, 'reference', 'beetbox_frames'), {
  recursive: true,
  filter: (path) => path === join(referenceDir, 'beetbox_frames') || extname(path).toLowerCase() === '.jpg'
});

await Promise.all(runDefinitions.map(exportRun));

const runs = runDefinitions.map(({ folder, port, ...run }) => ({
  ...run,
  path: `runs/${folder}/`,
  state: 'ready',
  message: ''
}));

await writeFile(join(outputDir, 'runs.json'), `${JSON.stringify({ runs }, null, 2)}\n`);
await writeFile(join(outputDir, '.nojekyll'), '');

console.log(`Exported ${runs.length} arena runs to ${relative(repoDir, outputDir)}/`);
