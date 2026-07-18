const tracks = [
  'Lead', 'Bass', 'Kick', 'Snare', 'Clap', 'Hi-hat',
  'Open hat', 'Rimshot', 'Tom', 'Cowbell', 'Shaker', 'Crash'
];

const notes = ['A', 'C', 'D', 'E', 'G', 'A⁺', 'C⁺'];
const noteKeys = ['A', 'S', 'D', 'F', 'G', 'H', 'J'];
const tonalRows = new Set([0, 1]);
const basePattern = [
  [0,0,1,0,0,0,1,0,0,0,0,0,1,0,0,1],
  [1,0,0,1,0,0,1,0,1,0,0,1,0,0,1,0],
  [1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],
  [1,1,0,1,1,1,0,1,1,1,0,1,1,1,0,1],
  [0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0],
  [0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [1,0,1,0,0,0,1,0,1,0,1,0,1,0,1,0],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
];

const writtenNotes = [
  {2:'G', 6:'D', 12:'C⁺', 15:'A⁺'},
  {0:'A', 3:'A', 6:'A', 8:'A', 11:'A', 14:'E'}
];

const channels = [
  ['CH·10', 'DARKROOM'], ['CH·20', 'GREASE'], ['CH·30', 'BACKSTREET'],
  ['CH·40', 'DAYLIGHT'], ['CH·50', 'ACID']
];

let pattern = clone(basePattern);
let currentChannel = 0;
let playing = false;
let currentStep = -1;
let timer = null;
let audio = null;
let mode = 'lead';
let phase = 0;
let pitches = [2, 0];
let muted = Array(12).fill(false);

function clone(value) { return JSON.parse(JSON.stringify(value)); }

function buildLogo() {
  const glyphs = {
    B:['11110','10001','10001','11110','10001','10001','11110'],
    E:['11111','10000','10000','11110','10000','10000','11111'],
    T:['11111','00100','00100','00100','00100','00100','00100'],
    O:['01110','10001','10001','10001','10001','10001','01110'],
    X:['10001','10001','01010','00100','01010','10001','10001']
  };
  const logo = document.querySelector('#logo');
  'BEETBOX'.split('').forEach((char, ci) => glyphs[char].forEach((row, y) => row.split('').forEach((on, x) => {
    if (on === '1') {
      const dot = document.createElement('i');
      dot.style.gridColumn = `${ci * 5 + x + 1}`;
      dot.style.gridRow = `${y + 1}`;
      logo.append(dot);
    }
  })));
}

function channelPattern(index) {
  if (index === 0) return clone(basePattern);
  const densities = [0, .2, .28, .34, .24];
  const seed = index * 177 + 19;
  return tracks.map((_, row) => Array.from({length: 16}, (_, step) => {
    if (row < 2) return ((step * 7 + row * 5 + seed) % (index + 4)) === 0;
    const structural = row === 2 ? step % 4 === 0 : row === 5 ? step % 2 === 0 : false;
    return structural || hash(seed + row * 67 + step * 23) < densities[index] * (row > 8 ? .55 : 1);
  }));
}

function hash(n) { const x = Math.sin(n * 12.9898) * 43758.5453; return x - Math.floor(x); }

function buildChannels() {
  const nav = document.querySelector('.channels');
  channels.forEach(([num, name], index) => {
    const button = document.createElement('button');
    button.innerHTML = `<span class="channel-num">${num}</span>${name}`;
    button.classList.toggle('active', index === currentChannel);
    button.onclick = () => {
      currentChannel = index;
      pattern = channelPattern(index);
      nav.querySelectorAll('button').forEach((b, i) => b.classList.toggle('active', i === index));
      renderGrid();
    };
    nav.append(button);
  });
}

function renderGrid() {
  const grid = document.querySelector('#steps');
  grid.textContent = '';
  grid.append(document.createElement('div'));
  for (let step = 0; step < 16; step++) {
    const head = document.createElement('div');
    head.className = `step-head ${step % 4 === 0 ? 'beat' : ''}`;
    head.textContent = step + 1;
    grid.append(head);
  }
  tracks.forEach((name, row) => {
    const label = document.createElement('div');
    label.className = `track ${muted[row] ? 'muted' : ''}`;
    label.innerHTML = `<span class="num">CH·${String(row + 1).padStart(2, '0')}</span>${name}`;
    label.onclick = () => { muted[row] = !muted[row]; renderGrid(); };
    grid.append(label);
    pattern[row].forEach((active, step) => {
      const cell = document.createElement('button');
      cell.className = `cell ${active ? 'on' : ''} ${active && tonalRows.has(row) ? 'tonal' : ''} ${step === currentStep ? 'playhead' : ''}`;
      cell.setAttribute('aria-label', `${name}, step ${step + 1}`);
      if (active && tonalRows.has(row)) {
        cell.textContent = currentChannel === 0 && writtenNotes[row][step]
          ? writtenNotes[row][step]
          : notes[(pitches[row] + step) % notes.length];
      }
      cell.onclick = () => { pattern[row][step] = !pattern[row][step]; renderGrid(); };
      cell.oncontextmenu = event => { event.preventDefault(); pattern[row][step] = !pattern[row][step]; renderGrid(); };
      grid.append(cell);
    });
  });
}

function buildKeys() {
  const wrap = document.querySelector('#keys');
  notes.forEach((note, i) => {
    const key = document.createElement('button');
    key.className = 'key';
    key.innerHTML = `${note}<small>${noteKeys[i]}</small>`;
    key.onclick = () => { pitches[mode === 'lead' ? 0 : 1] = i; renderGrid(); blip(220 * Math.pow(1.122, i), .08, .07); };
    wrap.append(key);
  });
}

function setPlaying(next) {
  playing = next;
  const play = document.querySelector('#play');
  play.classList.toggle('playing', playing);
  play.querySelector('.play-label').textContent = playing ? 'STOP' : 'PLAY';
  document.querySelector('.air').classList.toggle('live', playing);
  if (timer) clearTimeout(timer);
  if (playing) { ensureAudio(); tick(); }
  else { currentStep = -1; renderGrid(); }
}

function tick() {
  if (!playing) return;
  currentStep = (currentStep + 1) % 16;
  playCurrentStep();
  renderGrid();
  const bpm = +document.querySelector('#tempo').value;
  const swing = +document.querySelector('#swing').value / 100;
  const base = 60000 / bpm / 4;
  timer = setTimeout(tick, base * (currentStep % 2 ? 1 + swing : 1 - swing));
}

function ensureAudio() {
  if (!audio) audio = new (window.AudioContext || window.webkitAudioContext)();
  if (audio.state === 'suspended') audio.resume();
}

function playCurrentStep() {
  const volume = +document.querySelector('#volume').value / 100;
  pattern.forEach((row, i) => {
    if (!row[currentStep] || muted[i]) return;
    if (i < 2) blip((i ? 82 : 196) * Math.pow(1.122, (pitches[i] + currentStep) % 7), i ? .14 : .08, .045 * volume);
    else if (i === 2) drum(62, .14, .18 * volume);
    else if (i === 3 || i === 4) noise(.07, .12 * volume);
    else if (i === 5 || i === 6 || i === 10) noise(i === 6 ? .17 : .035, .035 * volume);
    else blip(120 + i * 34, .035, .028 * volume, 'square');
  });
}

function blip(freq, duration, gain, type = 'sine') {
  ensureAudio();
  const osc = audio.createOscillator();
  const amp = audio.createGain();
  osc.type = type; osc.frequency.value = freq;
  amp.gain.setValueAtTime(gain, audio.currentTime);
  amp.gain.exponentialRampToValueAtTime(.0001, audio.currentTime + duration);
  osc.connect(amp).connect(audio.destination); osc.start(); osc.stop(audio.currentTime + duration);
}

function drum(freq, duration, gain) {
  ensureAudio();
  const osc = audio.createOscillator(), amp = audio.createGain();
  osc.frequency.setValueAtTime(freq * 2.1, audio.currentTime);
  osc.frequency.exponentialRampToValueAtTime(freq, audio.currentTime + duration);
  amp.gain.setValueAtTime(gain, audio.currentTime);
  amp.gain.exponentialRampToValueAtTime(.0001, audio.currentTime + duration);
  osc.connect(amp).connect(audio.destination); osc.start(); osc.stop(audio.currentTime + duration);
}

function noise(duration, gain) {
  ensureAudio();
  const buffer = audio.createBuffer(1, Math.ceil(audio.sampleRate * duration), audio.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const source = audio.createBufferSource(), amp = audio.createGain();
  source.buffer = buffer; amp.gain.setValueAtTime(gain, audio.currentTime);
  amp.gain.exponentialRampToValueAtTime(.0001, audio.currentTime + duration);
  source.connect(amp).connect(audio.destination); source.start();
}

function drawAscii() {
  const box = document.querySelector('#ascii');
  box.textContent = '';
  const chars = ['/', '/', '/', '(', '(', '+', '+', '−', '−'];
  for (let y = 0; y < 14; y++) {
    const line = document.createElement('div'); line.className = 'line';
    for (let x = 0; x < 56; x++) {
      const wave = Math.sin(x * .31 + phase) * 2.5 + Math.cos(y * .7 - phase * .7) * 2;
      const ring = Math.abs(Math.hypot(x - 28 - Math.sin(phase) * 11, (y - 6.5) * 3) - 11);
      let index = Math.abs(Math.floor(x * .37 + y * .8 + wave)) % chars.length;
      let char = chars[index];
      const spark = hash(x * 97 + y * 31 + Math.floor(phase * 3));
      if (ring < 1.5) char = x < 28 ? '(' : ')';
      if (spark > .975) char = spark > .99 ? '*' : '−';
      const span = document.createElement('span'); span.textContent = char;
      if (ring < 2 || index < 3) span.className = 'pale';
      if (spark > .975) span.className = spark > .99 ? 'bright' : 'cyan';
      line.append(span);
    }
    box.append(line);
  }
  phase += playing ? .09 : .012;
  requestAnimationFrame(drawAscii);
}

function bind() {
  document.querySelector('#play').onclick = () => setPlaying(!playing);
  ['tempo', 'swing', 'volume'].forEach(id => {
    const input = document.querySelector(`#${id}`), output = document.querySelector(`#${id}Value`);
    input.oninput = () => output.textContent = input.value + (id === 'swing' ? '%' : '');
  });
  document.querySelector('#clear').onclick = () => { pattern = tracks.map(() => Array(16).fill(false)); renderGrid(); };
  document.querySelector('#random').onclick = () => { pattern = tracks.map((_, r) => Array.from({length: 16}, () => Math.random() < (r < 2 ? .18 : .26))); renderGrid(); };
  document.querySelectorAll('.mode').forEach(button => button.onclick = () => {
    mode = button.dataset.mode;
    document.querySelectorAll('.mode').forEach(b => b.classList.toggle('active', b === button));
  });
  document.querySelector('#record').onclick = event => event.currentTarget.classList.toggle('active');
  document.querySelector('#menu').onclick = () => document.querySelector('#info').hidden = false;
  document.querySelector('#closeInfo').onclick = () => document.querySelector('#info').hidden = true;
  document.querySelector('#expand').onclick = () => document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen?.();
  document.addEventListener('keydown', event => {
    if (event.code === 'Space' && !event.repeat) { event.preventDefault(); setPlaying(!playing); }
    const index = noteKeys.indexOf(event.key.toUpperCase());
    if (index >= 0) { pitches[mode === 'lead' ? 0 : 1] = index; renderGrid(); }
  });
}

buildLogo();
buildChannels();
buildKeys();
renderGrid();
bind();
drawAscii();
