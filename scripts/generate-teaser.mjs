import { chromium } from '../viewer/node_modules/playwright-core/index.mjs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { join, resolve } from 'node:path';

const repoDir = resolve(import.meta.dirname, '..');
const outputDir = resolve(process.argv[2] || join(repoDir, 'media', 'teaser-work'));
const finalPath = resolve(process.argv[3] || join(repoDir, 'media', 'beetbox-eval-teaser.mp4'));
const baseUrl = process.env.BEETBOX_BASE_URL || 'http://127.0.0.1:4800';
const chromePath = process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const draft = process.env.TEASER_DRAFT === '1';
const reuseCaptures = draft || process.env.TEASER_REUSE === '1';
const refreshReport = process.env.TEASER_REFRESH_REPORT === '1';
const videoPreset = draft ? 'ultrafast' : 'slow';
const videoCrf = draft ? '25' : '10';
const barDuration = 60 / 132 * 4;
const introDuration = 0.5;
const outroDuration = 5;
const arenaUrl = 'keunwoochoi.github.io/beetbox-eval';
const reportUrl = 'https://github.com/keunwoochoi/beetbox-eval';
const promptVideoPath = join(repoDir, 'prompt', 'beetbox.mov');
const companyLogos = {
  anthropic: { url: 'https://cdn.prod.website-files.com/67ce28cfec624e2b733f8a52/67d31dd7aa394792257596c5_webclip.png', extension: 'png' },
  openai: { url: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/OpenAI_Logo.svg', extension: 'svg', crop: '320x320+0+0' },
  moonshot: { url: 'https://www.kimi.com/favicon-light.ico', extension: 'ico' },
  qwen: { url: 'https://img.alicdn.com/imgextra/i4/O1CN01OXv3EM1FN8t9W4P79_!!6000000000474-2-tps-80-80.png', extension: 'png' }
};
const draftCacheIndexes = {
  'claude-code-fable-5-xhigh': 1,
  'claude-code-opus-5-medium': 2,
  'claude-code-opus-5-low': 3,
  'codex-gpt-5.6-sol-xhigh': 4,
  'opencode-kimi-k3': 5,
  'opencode-qwen3.7-plus': 6,
  'claude-code-opus-4.8-xhigh': 7,
  'codex-gpt-5.6-luna-high': 8,
  'claude-code-sonnet-5-high': 9
};

const runs = [
  { folder: 'claude-code-fable-5-xhigh', label: 'Claude Fable 5 (xhigh)', company: 'anthropic', selector: '#playBtn', width: 727, height: 811, gainDb: -2, ratings: { audio: 'pass', visual: 'pass', music: 'pass' } },
  { folder: 'claude-code-opus-5-medium', label: 'Claude Opus 5 (medium)', company: 'anthropic', selector: '#playBtn', width: 1010, height: 1415, gainDb: 0, ratings: { audio: 'pass', visual: 'pass', music: 'pass' } },
  { folder: 'claude-code-opus-5-low', label: 'Claude Opus 5 (low)', company: 'anthropic', selector: '#play', width: 1180, height: 1580, gainDb: 0, ratings: { audio: 'pass', visual: 'warn', music: 'pass' } },
  { folder: 'codex-gpt-5.6-sol-xhigh', label: 'GPT-5.6 Sol (xhigh)', company: 'openai', selector: '#transportButton', width: 1454, height: 1622, gainDb: 9, ratings: { audio: 'pass', visual: 'pass', music: 'pass' } },
  { folder: 'opencode-kimi-k3', label: 'Kimi K3 (default)', company: 'moonshot', selector: '#playBtn', width: 1454, height: 1622, gainDb: -1, ratings: { audio: 'pass', visual: 'pass', music: 'pass' } },
  { folder: 'opencode-qwen3.7-plus', label: 'Qwen3.7 Plus (default)', company: 'qwen', selector: '#btnPlay', width: 1454, height: 1622, gainDb: -2, ratings: { audio: 'pass', visual: 'pass', music: 'warn' } },
  { folder: 'claude-code-opus-4.8-xhigh', label: 'Claude Opus 4.8 (xhigh)', company: 'anthropic', selector: '#playBtn', width: 1454, height: 1622, gainDb: -2, ratings: { audio: 'pass', visual: 'pass', music: 'warn' } },
  { folder: 'codex-gpt-5.6-luna-high', label: 'GPT-5.6 Luna (high)', company: 'openai', selector: '#playButton', width: 1454, height: 1622, gainDb: 15, ratings: { audio: 'pass', visual: 'pass', music: 'pass' } },
  { folder: 'claude-code-sonnet-5-high', label: 'Claude Sonnet 5 (high)', company: 'anthropic', selector: '#playBtn', width: 1454, height: 1622, gainDb: -13, ratings: { audio: 'warn', visual: 'pass', music: 'pass' } }
];

const audioCaptureScript = () => {
  const NativeAudioContext = window.AudioContext || window.webkitAudioContext;
  if (!NativeAudioContext || !window.MediaRecorder) return;

  const nativeConnect = window.AudioNode.prototype.connect;
  const captureDestinations = new WeakMap();
  const duplicatedNodes = new WeakMap();
  const recorders = [];

  function destinationFor(context) {
    if (captureDestinations.has(context)) return captureDestinations.get(context);
    const destination = context.createMediaStreamDestination();
    captureDestinations.set(context, destination);
    const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') ? 'audio/webm;codecs=opus' : 'audio/webm';
    const recorder = new MediaRecorder(destination.stream, { mimeType });
    const chunks = [];
    recorder.addEventListener('dataavailable', (event) => {
      if (event.data.size) chunks.push(event.data);
    });
    recorder.start(50);
    recorders.push({ recorder, chunks, mimeType });
    return destination;
  }

  window.AudioNode.prototype.connect = function captureConnect(target, ...args) {
    const result = nativeConnect.call(this, target, ...args);
    const context = this.context;
    if (context && target === context.destination) {
      let destinations = duplicatedNodes.get(this);
      if (!destinations) {
        destinations = new WeakSet();
        duplicatedNodes.set(this, destinations);
      }
      const captureDestination = destinationFor(context);
      if (!destinations.has(captureDestination)) {
        nativeConnect.call(this, captureDestination);
        destinations.add(captureDestination);
      }
    }
    return result;
  };

  function CapturedAudioContext(...args) {
    const context = Reflect.construct(NativeAudioContext, args);
    destinationFor(context);
    context.resume().catch(() => {});
    return context;
  }

  CapturedAudioContext.prototype = NativeAudioContext.prototype;
  Object.setPrototypeOf(CapturedAudioContext, NativeAudioContext);
  window.AudioContext = CapturedAudioContext;
  window.webkitAudioContext = CapturedAudioContext;

  window.__stopBeetboxAudioCapture = async () => {
    const results = await Promise.all(recorders.map(({ recorder, chunks, mimeType }) => new Promise((resolve) => {
      recorder.addEventListener('stop', async () => {
        const blob = new Blob(chunks, { type: mimeType });
        const reader = new FileReader();
        reader.addEventListener('loadend', () => resolve({ mimeType, data: String(reader.result).split(',')[1] }));
        reader.readAsDataURL(blob);
      }, { once: true });
      recorder.stop();
    })));
    return results[0] || null;
  };
};

function run(command, args) {
  return new Promise((resolvePromise, reject) => {
    const commandArgs = command === 'ffmpeg' ? ['-hide_banner', '-loglevel', 'error', ...args] : args;
    const child = spawn(command, commandArgs, { stdio: 'inherit' });
    child.on('error', reject);
    child.on('exit', (code) => {
      if (code === 0) resolvePromise();
      else reject(new Error(`${command} exited with ${code}`));
    });
  });
}

function escapeConcatPath(path) {
  return path.replaceAll("'", "'\\''");
}

async function captureRun(browser, runDefinition, index) {
  const runDir = join(outputDir, `run-${String(index + 1).padStart(2, '0')}`);
  const framesDir = join(runDir, 'frames');
  await mkdir(framesDir, { recursive: true });

  const context = await browser.newContext({
    viewport: { width: runDefinition.width, height: runDefinition.height },
    deviceScaleFactor: 1
  });
  await context.addInitScript(audioCaptureScript);
  const page = await context.newPage();
  await page.goto(`${baseUrl}/runs/${runDefinition.folder}/?teaser=${Date.now()}`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts?.ready);
  await page.addStyleTag({ content: 'html, body { overflow: hidden !important; } ::-webkit-scrollbar { display: none !important; }' });
  await page.waitForTimeout(350);
  await page.locator(runDefinition.selector).waitFor({ state: 'visible' });

  const client = await context.newCDPSession(page);
  const frames = [];
  let acceptingFrames = true;
  client.on('Page.screencastFrame', async ({ data, metadata, sessionId }) => {
    if (acceptingFrames) frames.push({ data, timestamp: metadata.timestamp });
    await client.send('Page.screencastFrameAck', { sessionId }).catch(() => {});
  });

  await client.send('Page.startScreencast', {
    format: 'jpeg',
    quality: 100,
    maxWidth: 1080,
    maxHeight: 1206,
    everyNthFrame: 1
  });

  await page.waitForTimeout(80);
  await page.locator(runDefinition.selector).click();
  await page.waitForTimeout(barDuration * 1000);
  acceptingFrames = false;
  await client.send('Page.stopScreencast');
  const audio = await page.evaluate(() => window.__stopBeetboxAudioCapture?.());
  await context.close();

  if (frames.length < 10) throw new Error(`Only captured ${frames.length} frames for ${runDefinition.label}`);
  if (!audio?.data) throw new Error(`No Web Audio recording captured for ${runDefinition.label}`);

  const concatLines = ['ffconcat version 1.0'];
  for (let frameIndex = 0; frameIndex < frames.length; frameIndex += 1) {
    const framePath = join(framesDir, `${String(frameIndex).padStart(4, '0')}.jpg`);
    await writeFile(framePath, Buffer.from(frames[frameIndex].data, 'base64'));
    concatLines.push(`file '${escapeConcatPath(framePath)}'`);
    if (frameIndex < frames.length - 1) {
      const observedDuration = frames[frameIndex + 1].timestamp - frames[frameIndex].timestamp;
      const duration = Math.min(0.1, Math.max(1 / 120, observedDuration || 1 / 30));
      concatLines.push(`duration ${duration.toFixed(6)}`);
    }
  }
  const lastFramePath = join(framesDir, `${String(frames.length - 1).padStart(4, '0')}.jpg`);
  concatLines.push(`file '${escapeConcatPath(lastFramePath)}'`);

  const concatPath = join(runDir, 'frames.ffconcat');
  const audioPath = join(runDir, 'audio.webm');
  const clipPath = join(runDir, 'clip.mp4');
  await writeFile(concatPath, `${concatLines.join('\n')}\n`);
  await writeFile(audioPath, Buffer.from(audio.data, 'base64'));

  await run('ffmpeg', [
    '-y',
    '-f', 'concat',
    '-safe', '0',
    '-i', concatPath,
    '-i', audioPath,
    '-t', barDuration.toFixed(6),
    '-vf', 'fps=30,scale=1080:1206:force_original_aspect_ratio=decrease,pad=1080:1206:(ow-iw)/2:(oh-ih)/2:color=0x090b09',
    '-c:v', 'libx264',
    '-preset', videoPreset,
    '-crf', videoCrf,
    '-pix_fmt', 'yuv420p',
    '-c:a', 'aac',
    '-b:a', '192k',
    '-ar', '48000',
    '-ac', '2',
    '-movflags', '+faststart',
    clipPath
  ]);

  return { ...runDefinition, clipPath };
}

async function captureReport(browser) {
  process.stdout.write('\nCapturing the technical report...\n');
  const context = await browser.newContext({
    viewport: { width: 1080, height: 7000 },
    deviceScaleFactor: 1,
    colorScheme: 'light'
  });
  const page = await context.newPage();
  await page.goto(reportUrl, { waitUntil: 'networkidle', timeout: 60000 });
  const heading = page.getByRole('heading', { name: 'Tech Report: Making Beetbox Eval Arena', exact: true });
  await heading.waitFor({ state: 'visible' });
  const box = await heading.boundingBox();
  if (!box) throw new Error('Could not locate the technical report heading');
  const reportPath = join(outputDir, 'technical-report.png');
  await page.screenshot({
    path: reportPath,
    clip: {
      x: 0,
      y: Math.max(0, box.y - 80),
      width: 1080,
      height: 5100
    }
  });
  await context.close();
  return reportPath;
}

async function captureOutroArena(browser) {
  process.stdout.write('\nCapturing the animated arena outro...\n');
  const arenaDir = join(outputDir, 'outro-arena');
  const framesDir = join(arenaDir, 'frames');
  await mkdir(framesDir, { recursive: true });
  const context = await browser.newContext({
    viewport: { width: 1080, height: 800 },
    deviceScaleFactor: 1
  });
  const page = await context.newPage();
  await page.goto(`${baseUrl}/#a=claude-fable-xhigh&mode=solo`, { waitUntil: 'networkidle' });
  const fable = page.frameLocator('.preview-panel[data-side="a"] iframe');
  await fable.locator('#playBtn').waitFor({ state: 'visible' });
  await page.waitForTimeout(500);

  const client = await context.newCDPSession(page);
  const frames = [];
  let acceptingFrames = true;
  client.on('Page.screencastFrame', async ({ data, metadata, sessionId }) => {
    if (acceptingFrames) frames.push({ data, timestamp: metadata.timestamp });
    await client.send('Page.screencastFrameAck', { sessionId }).catch(() => {});
  });
  await client.send('Page.startScreencast', {
    format: 'jpeg',
    quality: draft ? 78 : 100,
    maxWidth: 1080,
    maxHeight: 800,
    everyNthFrame: 1
  });

  await fable.locator('#playBtn').click();
  for (let index = 0; index < 5; index += 1) {
    await page.waitForTimeout(index === 0 ? 700 : 1000);
    await fable.locator('#randomBtn').click();
  }
  acceptingFrames = false;
  await client.send('Page.stopScreencast');
  await context.close();

  const concatLines = ['ffconcat version 1.0'];
  for (let frameIndex = 0; frameIndex < frames.length; frameIndex += 1) {
    const framePath = join(framesDir, `${String(frameIndex).padStart(4, '0')}.jpg`);
    await writeFile(framePath, Buffer.from(frames[frameIndex].data, 'base64'));
    concatLines.push(`file '${escapeConcatPath(framePath)}'`);
    if (frameIndex < frames.length - 1) {
      const observedDuration = frames[frameIndex + 1].timestamp - frames[frameIndex].timestamp;
      const duration = Math.min(0.1, Math.max(1 / 120, observedDuration || 1 / 30));
      concatLines.push(`duration ${duration.toFixed(6)}`);
    }
  }
  const lastFramePath = join(framesDir, `${String(frames.length - 1).padStart(4, '0')}.jpg`);
  concatLines.push(`file '${escapeConcatPath(lastFramePath)}'`);
  const concatPath = join(arenaDir, 'frames.ffconcat');
  const arenaPath = join(arenaDir, 'arena.mp4');
  await writeFile(concatPath, `${concatLines.join('\n')}\n`);
  await run('ffmpeg', [
    '-y',
    '-f', 'concat',
    '-safe', '0',
    '-i', concatPath,
    '-t', String(outroDuration),
    '-vf', 'fps=30,scale=1080:800:force_original_aspect_ratio=decrease,pad=1080:800:(ow-iw)/2:(oh-ih)/2:color=0x090b09',
    '-c:v', 'libx264',
    '-preset', videoPreset,
    '-crf', videoCrf,
    '-pix_fmt', 'yuv420p',
    arenaPath
  ]);
  return arenaPath;
}

async function prepareCompanyLogos() {
  const logoDir = join(outputDir, 'logos');
  await mkdir(logoDir, { recursive: true });
  const logoPaths = {};
  for (const [company, source] of Object.entries(companyLogos)) {
    const sourcePath = join(logoDir, `${company}.${source.extension}`);
    const logoPath = join(logoDir, `${company}.png`);
    const response = await fetch(source.url);
    if (!response.ok) throw new Error(`Could not download ${company} logo: ${response.status}`);
    await writeFile(sourcePath, Buffer.from(await response.arrayBuffer()));
    const normalizeArgs = [
      '-background', 'none',
      source.extension === 'ico' ? `${sourcePath}[0]` : sourcePath
    ];
    if (source.crop) normalizeArgs.push('-crop', source.crop, '+repage');
    normalizeArgs.push(
      '-resize', '80x80',
      '-gravity', 'center',
      '-extent', '96x96'
    );
    if (source.white) normalizeArgs.push('-channel', 'RGB', '-evaluate', 'set', '100%', '+channel');
    normalizeArgs.push(
      `PNG32:${logoPath}`
    );
    await run('magick', normalizeArgs);
    logoPaths[company] = logoPath;
  }
  return logoPaths;
}

function drawTextFilter(text, y, size, color = 'white') {
  const escaped = text.replaceAll('\\', '\\\\').replaceAll(':', '\\:').replaceAll("'", "\\'");
  return `drawtext=fontfile=/System/Library/Fonts/Supplemental/Arial.ttf:text='${escaped}':fontcolor=${color}:fontsize=${size}:x=(w-text_w)/2:y=${y}`;
}

function drawRatingsFilters(ratings) {
  const colors = { pass: '0xb8ff3d', warn: '0xf2c94c', fail: '0xff5c5c' };
  return [
    `drawtext=fontfile=/System/Library/Fonts/Supplemental/Arial.ttf:text='AUDIO':fontcolor=0x30332f:fontsize=24:x=(w/2)-278:y=665`,
    `drawtext=fontfile=/System/Library/Fonts/Supplemental/Arial.ttf:text='●':fontcolor=${colors[ratings.audio]}:fontsize=34:x=(w/2)-188:y=656`,
    `drawtext=fontfile=/System/Library/Fonts/Supplemental/Arial.ttf:text='VISUAL':fontcolor=0x30332f:fontsize=24:x=(w/2)-72:y=665`,
    `drawtext=fontfile=/System/Library/Fonts/Supplemental/Arial.ttf:text='●':fontcolor=${colors[ratings.visual]}:fontsize=34:x=(w/2)+33:y=656`,
    `drawtext=fontfile=/System/Library/Fonts/Supplemental/Arial.ttf:text='MUSIC':fontcolor=0x30332f:fontsize=24:x=(w/2)+148:y=665`,
    `drawtext=fontfile=/System/Library/Fonts/Supplemental/Arial.ttf:text='●':fontcolor=${colors[ratings.music]}:fontsize=34:x=(w/2)+242:y=656`
  ];
}

function drawTextAtFilter(text, x, y, size, color = 'white') {
  const escaped = text.replaceAll('\\', '\\\\').replaceAll(':', '\\:').replaceAll("'", "\\'");
  return `drawtext=fontfile=/System/Library/Fonts/Supplemental/Arial.ttf:text='${escaped}':fontcolor=${color}:fontsize=${size}:x=${x}:y=${y}`;
}

async function assemble(clips, reportPath, logoPaths, arenaOutroPath) {
  await mkdir(resolve(finalPath, '..'), { recursive: true });
  const preparedPaths = [];

  for (let index = 0; index < clips.length; index += 1) {
    const preparedPath = join(outputDir, `prepared-${String(index + 1).padStart(2, '0')}.mp4`);
    const estimatedTitleWidth = clips[index].label.length * 24;
    const groupX = Math.round((1080 - estimatedTitleWidth - 68) / 2);
    const backgroundFilter = [
      'scale=930:-2',
      'pad=1080:1920:(ow-iw)/2:760:color=0x090b09',
      'drawbox=x=50:y=95:w=980:h=650:color=0xc4c7c0@0.97:t=fill',
      'drawbox=x=386:y=191:w=308:h=342:color=0x30332f@1:t=fill',
      'drawbox=x=160:y=550:w=760:h=2:color=0x777c75@0.72:t=fill',
      drawTextFilter('Prompt: reimplement this beetbox.', 120, 32, '0x30332f'),
      drawTextAtFilter('↓', 619, 155, 34, '0x30332f'),
      ...drawRatingsFilters(clips[index].ratings),
      drawTextFilter(arenaUrl, 'h-84', 32, '0x72786f')
    ].join(',');
    const filter = [
      `[0:v]${backgroundFilter}[base]`,
      '[1:v]scale=48:48:force_original_aspect_ratio=decrease,format=rgba[logo]',
      '[2:v]scale=296:330:force_original_aspect_ratio=decrease,pad=300:334:(ow-iw)/2:(oh-ih)/2:color=0x090b09[prompt]',
      '[base][prompt]overlay=x=390:y=195[withprompt]',
      `[withprompt][logo]overlay=x=${groupX}:y=575,${drawTextAtFilter(clips[index].label, groupX + 66, 576, 48, '0x111310')}[outv]`
    ].join(';');
    const promptOffset = ((index * barDuration) % 19.288333).toFixed(6);
    await run('ffmpeg', [
      '-y',
      '-i', clips[index].clipPath,
      '-loop', '1',
      '-i', logoPaths[clips[index].company],
      '-ss', promptOffset,
      '-i', promptVideoPath,
      '-filter_complex', filter,
      '-map', '[outv]',
      '-map', '0:a',
      '-r', '30',
      '-c:v', 'libx264',
      '-preset', videoPreset,
      '-crf', videoCrf,
      '-pix_fmt', 'yuv420p',
      '-af', `volume=${clips[index].gainDb}dB,alimiter=limit=0.72:level=false`,
      '-c:a', 'aac',
      '-b:a', '192k',
      '-ar', '48000',
      '-ac', '2',
      '-t', barDuration.toFixed(6),
      preparedPath
    ]);
    preparedPaths.push(preparedPath);
  }

  const introPath = join(outputDir, 'intro.mp4');
  const introFramePath = join(outputDir, 'intro-frame.jpg');
  await run('ffmpeg', [
    '-y',
    '-ss', '0.3',
    '-i', clips[0].clipPath,
    '-frames:v', '1',
    '-q:v', '2',
    introFramePath
  ]);
  const introFilter = [
    'scale=1040:-2',
    'pad=1080:1920:(ow-iw)/2:(oh-ih)/2:color=0x090b09',
    'hue=s=0',
    'eq=brightness=-0.34:contrast=0.72',
    'drawbox=x=120:y=850:w=840:h=220:color=0x30332f@0.96:t=fill',
    drawTextFilter('PLAY WITH SOUND', '(h-text_h)/2', 68),
    drawTextFilter(arenaUrl, 'h-84', 32, '0x8a8f88')
  ].join(',');
  await run('ffmpeg', [
    '-y',
    '-loop', '1',
    '-i', introFramePath,
    '-f', 'lavfi',
    '-i', 'anullsrc=channel_layout=stereo:sample_rate=48000',
    '-vf', introFilter,
    '-t', String(introDuration),
    '-r', '30',
    '-c:v', 'libx264',
    '-preset', videoPreset,
    '-crf', videoCrf,
    '-pix_fmt', 'yuv420p',
    '-c:a', 'aac',
    '-b:a', '192k',
    '-shortest',
    introPath
  ]);

  const outroPath = join(outputDir, 'outro.mp4');
  const outroFilter = [
    '[0:v]scale=1080:800:force_original_aspect_ratio=decrease,pad=1080:800:(ow-iw)/2:(oh-ih)/2:color=0x090b09[arena]',
    `[1:v]crop=1080:1120:0:'min(max((in_h-out_h)*t/${outroDuration},0),in_h-out_h)'[report]`,
    '[arena][report]vstack=inputs=2[background]',
    `[background]drawbox=x=0:y=0:w=1080:h=1920:color=0x858983@0.44:t=fill,drawbox=x=55:y=1360:w=970:h=390:color=0x151714@0.86:t=fill,${drawTextFilter('Come play with these boxes!', 1430, 60)},${drawTextFilter('or read my report', 1545, 42)},${drawTextFilter(arenaUrl, 1660, 36, '0xb8ff3d')}[outv]`
  ].join(';');
  await run('ffmpeg', [
    '-y',
    '-i', arenaOutroPath,
    '-loop', '1',
    '-framerate', '30',
    '-i', reportPath,
    '-f', 'lavfi',
    '-i', 'anullsrc=channel_layout=stereo:sample_rate=48000',
    '-filter_complex', outroFilter,
    '-map', '[outv]',
    '-map', '2:a',
    '-t', String(outroDuration),
    '-r', '30',
    '-c:v', 'libx264',
    '-preset', videoPreset,
    '-crf', videoCrf,
    '-pix_fmt', 'yuv420p',
    '-c:a', 'aac',
    '-b:a', '192k',
    '-shortest',
    outroPath
  ]);

  const concatPath = join(outputDir, 'teaser.ffconcat');
  const concatLines = ['ffconcat version 1.0', `file '${escapeConcatPath(introPath)}'`, ...preparedPaths.map((path) => `file '${escapeConcatPath(path)}'`), `file '${escapeConcatPath(outroPath)}'`];
  await writeFile(concatPath, `${concatLines.join('\n')}\n`);
  const joinedPath = join(outputDir, 'joined.mp4');
  await run('ffmpeg', ['-y', '-f', 'concat', '-safe', '0', '-i', concatPath, '-c', 'copy', joinedPath]);
  await run('ffmpeg', [
    '-y',
    '-i', joinedPath,
    '-c:v', 'copy',
    '-c:a', 'aac',
    '-b:a', '192k',
    '-ar', '48000',
    '-ac', '2',
    '-movflags', '+faststart',
    finalPath
  ]);
}

await mkdir(outputDir, { recursive: true });
const browser = await chromium.launch({
  executablePath: chromePath,
  headless: true,
  args: ['--autoplay-policy=no-user-gesture-required', '--disable-background-timer-throttling']
});

try {
  const clips = [];
  const logoPaths = await prepareCompanyLogos();
  if (reuseCaptures) {
    for (let index = 0; index < runs.length; index += 1) {
      clips.push({
        ...runs[index],
        clipPath: join(outputDir, `run-${String(draftCacheIndexes[runs[index].folder]).padStart(2, '0')}`, 'clip.mp4')
      });
    }
  } else {
    for (let index = 0; index < runs.length; index += 1) {
      process.stdout.write(`\nCapturing ${runs[index].label}...\n`);
      clips.push(await captureRun(browser, runs[index], index));
    }
  }
  const reportPath = reuseCaptures && !refreshReport ? join(outputDir, 'technical-report.png') : await captureReport(browser);
  const arenaOutroPath = await captureOutroArena(browser);
  await assemble(clips, reportPath, logoPaths, arenaOutroPath);
} finally {
  await browser.close();
}

const stats = await readFile(finalPath);
console.log(`\nCreated ${finalPath} (${(stats.byteLength / 1024 / 1024).toFixed(1)} MB)`);
