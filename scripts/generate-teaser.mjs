import { chromium } from '../viewer/node_modules/playwright-core/index.mjs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { join, resolve } from 'node:path';

const repoDir = resolve(import.meta.dirname, '..');
const outputDir = resolve(process.argv[2] || join(repoDir, 'media', 'teaser-work'));
const finalPath = resolve(process.argv[3] || join(repoDir, 'media', 'beetbox-eval-teaser.mp4'));
const baseUrl = process.env.BEETBOX_BASE_URL || 'http://127.0.0.1:4800';
const chromePath = process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const barDuration = 60 / 132 * 4;
const introDuration = 0.5;
const outroDuration = 5;
const arenaUrl = 'keunwoochoi.github.io/beetbox-eval';
const reportUrl = 'https://github.com/keunwoochoi/beetbox-eval';

const runs = [
  { folder: 'claude-code-fable-5-xhigh', label: 'Claude Fable 5 (xhigh)', selector: '#playBtn', width: 727, height: 811, gainDb: -2, ratings: { audio: 'pass', visual: 'pass', music: 'pass' } },
  { folder: 'claude-code-opus-5-xhigh', label: 'Claude Opus 5 (xhigh)', selector: '#play', width: 727, height: 816, gainDb: 0, ratings: { audio: 'pass', visual: 'pass', music: 'pass' } },
  { folder: 'claude-code-opus-5-medium', label: 'Claude Opus 5 (medium)', selector: '#playBtn', width: 1010, height: 1415, gainDb: 0, ratings: { audio: 'pass', visual: 'pass', music: 'pass' } },
  { folder: 'claude-code-opus-5-low', label: 'Claude Opus 5 (low)', selector: '#play', width: 1180, height: 1580, gainDb: 0, ratings: { audio: 'pass', visual: 'warn', music: 'pass' } },
  { folder: 'codex-gpt-5.6-sol-xhigh', label: 'GPT-5.6 Sol (xhigh)', selector: '#transportButton', width: 1454, height: 1622, gainDb: 9, ratings: { audio: 'pass', visual: 'pass', music: 'pass' } },
  { folder: 'opencode-kimi-k3', label: 'Kimi K3 (default)', selector: '#playBtn', width: 1454, height: 1622, gainDb: -1, ratings: { audio: 'pass', visual: 'pass', music: 'pass' } },
  { folder: 'opencode-qwen3.7-plus', label: 'Qwen3.7 Plus (default)', selector: '#btnPlay', width: 1454, height: 1622, gainDb: -2, ratings: { audio: 'pass', visual: 'pass', music: 'warn' } },
  { folder: 'claude-code-opus-4.8-xhigh', label: 'Claude Opus 4.8 (xhigh)', selector: '#playBtn', width: 1454, height: 1622, gainDb: -2, ratings: { audio: 'pass', visual: 'pass', music: 'warn' } },
  { folder: 'codex-gpt-5.6-luna-high', label: 'GPT-5.6 Luna (high)', selector: '#playButton', width: 1454, height: 1622, gainDb: 15, ratings: { audio: 'pass', visual: 'pass', music: 'pass' } },
  { folder: 'claude-code-sonnet-5-high', label: 'Claude Sonnet 5 (high)', selector: '#playBtn', width: 1454, height: 1622, gainDb: -13, ratings: { audio: 'warn', visual: 'pass', music: 'pass' } }
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
    quality: 92,
    maxWidth: 900,
    maxHeight: 1004,
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
    '-vf', 'fps=30,scale=900:1004:force_original_aspect_ratio=decrease,pad=900:1004:(ow-iw)/2:(oh-ih)/2:color=0x090b09',
    '-c:v', 'libx264',
    '-preset', 'fast',
    '-crf', '18',
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

function drawTextFilter(text, y, size, color = 'white') {
  const escaped = text.replaceAll('\\', '\\\\').replaceAll(':', '\\:').replaceAll("'", "\\'");
  return `drawtext=fontfile=/System/Library/Fonts/Supplemental/Arial.ttf:text='${escaped}':fontcolor=${color}:fontsize=${size}:x=(w-text_w)/2:y=${y}`;
}

function drawRatingsFilters(ratings) {
  const colors = { pass: '0xb8ff3d', warn: '0xf2c94c', fail: '0xff5c5c' };
  return [
    `drawtext=fontfile=/System/Library/Fonts/Supplemental/Arial.ttf:text='AUDIO':fontcolor=0x8c9287:fontsize=24:x=(w/2)-278:y=326`,
    `drawtext=fontfile=/System/Library/Fonts/Supplemental/Arial.ttf:text='●':fontcolor=${colors[ratings.audio]}:fontsize=34:x=(w/2)-188:y=317`,
    `drawtext=fontfile=/System/Library/Fonts/Supplemental/Arial.ttf:text='VISUAL':fontcolor=0x8c9287:fontsize=24:x=(w/2)-72:y=326`,
    `drawtext=fontfile=/System/Library/Fonts/Supplemental/Arial.ttf:text='●':fontcolor=${colors[ratings.visual]}:fontsize=34:x=(w/2)+33:y=317`,
    `drawtext=fontfile=/System/Library/Fonts/Supplemental/Arial.ttf:text='MUSIC':fontcolor=0x8c9287:fontsize=24:x=(w/2)+148:y=326`,
    `drawtext=fontfile=/System/Library/Fonts/Supplemental/Arial.ttf:text='●':fontcolor=${colors[ratings.music]}:fontsize=34:x=(w/2)+242:y=317`
  ];
}

async function assemble(clips, reportPath) {
  await mkdir(resolve(finalPath, '..'), { recursive: true });
  const preparedPaths = [];

  for (let index = 0; index < clips.length; index += 1) {
    const preparedPath = join(outputDir, `prepared-${String(index + 1).padStart(2, '0')}.mp4`);
    const filter = [
      'scale=1040:-2',
      'pad=1080:1920:(ow-iw)/2:(oh-ih)/2:color=0x090b09',
      drawTextFilter(clips[index].label, 238, 48),
      ...drawRatingsFilters(clips[index].ratings),
      drawTextFilter(arenaUrl, 'h-76', 26, '0x72786f')
    ].join(',');
    await run('ffmpeg', [
      '-y',
      '-i', clips[index].clipPath,
      '-vf', filter,
      '-r', '30',
      '-c:v', 'libx264',
      '-preset', 'fast',
      '-crf', '18',
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
    drawTextFilter('PLAY WITH SOUND', '(h-text_h)/2', 68),
    drawTextFilter(arenaUrl, 'h-76', 26, '0x8a8f88')
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
    '-preset', 'fast',
    '-crf', '18',
    '-pix_fmt', 'yuv420p',
    '-c:a', 'aac',
    '-b:a', '192k',
    '-shortest',
    introPath
  ]);

  const outroPath = join(outputDir, 'outro.mp4');
  const outroFilter = [
    `crop=1080:1920:0:'min(max((in_h-out_h)*t/${outroDuration},0),in_h-out_h)'`,
    'hue=s=0',
    'eq=brightness=-0.32:contrast=0.68',
    'drawbox=x=0:y=570:w=1080:h=780:color=black@0.62:t=fill',
    drawTextFilter('VISIT BEETBOX EVAL ARENA', 700, 54),
    drawTextFilter('Play with every implementation.', 820, 38),
    drawTextFilter('Read the technical report.', 878, 38),
    drawTextFilter(arenaUrl, 1010, 34, '0xb8ff3d')
  ].join(',');
  await run('ffmpeg', [
    '-y',
    '-loop', '1',
    '-framerate', '30',
    '-i', reportPath,
    '-f', 'lavfi',
    '-i', 'anullsrc=channel_layout=stereo:sample_rate=48000',
    '-vf', outroFilter,
    '-t', String(outroDuration),
    '-r', '30',
    '-c:v', 'libx264',
    '-preset', 'fast',
    '-crf', '18',
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
    '-af', 'alimiter=limit=0.70:level=false',
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
  for (let index = 0; index < runs.length; index += 1) {
    process.stdout.write(`\nCapturing ${runs[index].label}...\n`);
    clips.push(await captureRun(browser, runs[index], index));
  }
  const reportPath = await captureReport(browser);
  await assemble(clips, reportPath);
} finally {
  await browser.close();
}

const stats = await readFile(finalPath);
console.log(`\nCreated ${finalPath} (${(stats.byteLength / 1024 / 1024).toFixed(1)} MB)`);
