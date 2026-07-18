const $ = (selector, root = document) => root.querySelector(selector);

const COLORS = {
  ink: '#101010',
  white: '#f6f6f3',
  gray: '#88959b',
  navy: '#082643',
  blue: '#8ec9f5',
  aqua: '#68f4ef',
  bright: '#4e9fee'
};

const logoGlyphs = {
  B: ['111', '101', '110', '101', '111'],
  E: ['111', '100', '110', '100', '111'],
  T: ['111', '010', '010', '010', '010'],
  O: ['111', '101', '101', '101', '111'],
  X: ['101', '101', '010', '101', '101']
};

const tracks = [
  { name: 'Lead', type: 'lead' },
  { name: 'Bass', type: 'bass' },
  { name: 'Kick', type: 'kick' },
  { name: 'Snare', type: 'snare' },
  { name: 'Clap', type: 'clap' },
  { name: 'Hi-hat', type: 'hat' },
  { name: 'Open hat', type: 'openhat' },
  { name: 'Rimshot', type: 'rim' },
  { name: 'Tom', type: 'tom' },
  { name: 'Cowbell', type: 'cowbell' },
  { name: 'Shaker', type: 'shaker' },
  { name: 'Crash', type: 'crash' }
];

const notes = ['A', 'C', 'D', 'E', 'G', 'A+', 'C+'];
const keys = ['A', 'S', 'D', 'F', 'G', 'H', 'J'];
const majorSteps = new Set([0, 4, 8, 12]);

const blankPattern = () => tracks.map(() => Array(16).fill(null));
const setSteps = (row, steps, value = true) => steps.forEach((step) => { row[step - 1] = value; });
const melodic = (row, values) => values.forEach(([step, value]) => { row[step - 1] = value; });

function makeDarkroom() {
  const p = blankPattern();
  melodic(p[0], [[3, 'G'], [7, 'D'], [13, 'C+'], [16, 'A+']]);
  melodic(p[1], [[1, 'A'], [4, 'A'], [7, 'A'], [9, 'A'], [12, 'A'], [15, 'E']]);
  setSteps(p[2], [1, 5, 9, 13]);
  setSteps(p[4], [5, 13]);
  setSteps(p[5], [1, 2, 4, 5, 6, 8, 9, 10, 12, 13, 14, 16]);
  setSteps(p[6], [3, 7, 11, 15]);
  setSteps(p[7], [8, 16]);
  setSteps(p[8], [15]);
  setSteps(p[10], [1, 3, 5, 7, 9, 11, 13, 15]);
  setSteps(p[11], [1]);
  return p;
}

function makeGrease() {
  const p = blankPattern();
  melodic(p[0], [[1, 'E'], [4, 'G'], [5, 'C+'], [6, 'G'], [7, 'A'], [9, 'A'], [11, 'A'], [13, 'D'], [14, 'D'], [16, 'E']]);
  melodic(p[1], [[1, 'A'], [2, 'C'], [5, 'D'], [6, 'C'], [7, 'E'], [9, 'E'], [10, 'G'], [11, 'C'], [12, 'E']]);
  setSteps(p[2], [1, 3, 4, 6, 9, 11, 12, 13, 15, 16]);
  setSteps(p[3], [6, 13]);
  setSteps(p[4], [4, 13, 16]);
  setSteps(p[5], [2, 4, 5, 6, 7, 8, 10, 11, 12, 14, 16]);
  setSteps(p[6], [3, 7, 11, 16]);
  setSteps(p[7], [5, 8, 10, 14]);
  setSteps(p[8], [6, 11, 13, 15, 16]);
  setSteps(p[9], [2, 7, 14, 16]);
  setSteps(p[10], [2, 4, 6, 8, 9, 11, 12, 14]);
  setSteps(p[11], [9, 12]);
  return p;
}

function makeBackstreet() {
  const p = blankPattern();
  melodic(p[0], [[1, 'C+'], [3, 'C'], [8, 'G'], [9, 'C+'], [10, 'C'], [11, 'A'], [15, 'G']]);
  melodic(p[1], [[1, 'C+'], [3, 'C'], [7, 'E'], [9, 'C'], [10, 'G'], [12, 'E'], [15, 'A'], [16, 'C']]);
  setSteps(p[2], [1, 6, 9, 13, 16]);
  setSteps(p[3], [1, 4, 5, 11, 14, 15]);
  setSteps(p[4], [3, 4, 5]);
  setSteps(p[5], [1, 2, 5, 6, 8, 11, 14, 16]);
  setSteps(p[6], [4, 8, 13]);
  setSteps(p[7], [14]);
  setSteps(p[8], [6, 13, 15, 16]);
  setSteps(p[9], [11]);
  setSteps(p[10], [9, 10, 11, 14]);
  setSteps(p[11], [12]);
  return p;
}

function makeDaylight() {
  const p = blankPattern();
  melodic(p[0], [[1, 'A'], [2, 'C'], [4, 'E'], [6, 'G'], [9, 'A'], [11, 'C+'], [13, 'E'], [16, 'A+']]);
  melodic(p[1], [[1, 'A'], [3, 'A'], [5, 'C'], [7, 'C'], [9, 'D'], [11, 'E'], [13, 'G'], [15, 'E']]);
  setSteps(p[2], [1, 5, 8, 9, 13]);
  setSteps(p[3], [4, 12]);
  setSteps(p[4], [6, 14]);
  setSteps(p[5], [1, 3, 5, 7, 9, 11, 13, 15]);
  setSteps(p[6], [2, 6, 10, 14]);
  setSteps(p[7], [4, 8, 12, 16]);
  setSteps(p[8], [7, 15]);
  setSteps(p[9], [3, 11]);
  setSteps(p[10], [2, 4, 6, 8, 10, 12, 14, 16]);
  setSteps(p[11], [1, 9]);
  return p;
}

function makeAcid() {
  const p = blankPattern();
  melodic(p[0], [[1, 'A'], [3, 'E'], [5, 'A'], [7, 'A+'], [9, 'A'], [11, 'E'], [13, 'C+'], [15, 'A+'], [16, 'E']]);
  melodic(p[1], [[1, 'A'], [2, 'A'], [3, 'D'], [4, 'A'], [5, 'A'], [6, 'A'], [7, 'D'], [8, 'A'], [9, 'A'], [10, 'A'], [11, 'D'], [12, 'A'], [13, 'A'], [14, 'C+'], [15, 'D'], [16, 'A']]);
  setSteps(p[2], [1, 4, 5, 6, 9, 11, 13]);
  setSteps(p[3], [6, 13]);
  setSteps(p[4], [5, 13]);
  setSteps(p[5], [2, 4, 5, 6, 8, 10, 11, 12, 14, 16]);
  setSteps(p[6], [3, 7, 11]);
  setSteps(p[7], [6, 14]);
  setSteps(p[8], [11, 13, 15]);
  setSteps(p[9], [2, 7, 16]);
  setSteps(p[10], [2, 4, 6, 8, 9, 11, 12, 14]);
  setSteps(p[11], [9]);
  return p;
}

const stations = [
  { code: 'CH·10', name: 'DARKROOM', tempo: 132, swing: 0, pattern: makeDarkroom() },
  { code: 'CH·20', name: 'GREASE', tempo: 124, swing: 12, pattern: makeGrease() },
  { code: 'CH·30', name: 'BACKSTREET', tempo: 112, swing: 22, pattern: makeBackstreet() },
  { code: 'CH·40', name: 'DAYLIGHT', tempo: 118, swing: 32, pattern: makeDaylight() },
  { code: 'CH·50', name: 'ACID', tempo: 140, swing: 8, pattern: makeAcid() }
];

const state = {
  station: 0,
  playing: false,
  currentStep: -1,
  muted: Array(tracks.length).fill(false),
  mode: 'lead',
  selectedNote: 'A',
  recording: false,
  patterns: stations.map((station) => structuredClone(station.pattern)),
  viewSeed: 2.41,
  scopeClock: 0
};

function buildLogo() {
  const logo = $('#pixelLogo');
  for (const character of 'BEETBOX') {
    const letter = document.createElement('span');
    letter.className = 'pixel-letter';
    for (const row of logoGlyphs[character]) {
      for (const cell of row) {
        const pixel = document.createElement('i');
        pixel.className = `pixel${cell === '1' ? ' on' : ''}`;
        letter.append(pixel);
      }
    }
    logo.append(letter);
  }
}

function buildStations() {
  const tabs = $('#stationTabs');
  stations.forEach((station, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `station-tab${index === state.station ? ' active' : ''}`;
    button.innerHTML = `<i></i>${station.code} <strong>${station.name}</strong>`;
    button.addEventListener('click', () => selectStation(index));
    tabs.append(button);
  });
}

function buildGrid() {
  const grid = $('#stepGrid');
  grid.replaceChildren();
  const caption = document.createElement('div');
  caption.className = 'grid-caption';
  caption.textContent = 'TRACK click = mute ⇩';
  grid.append(caption);
  for (let step = 0; step < 16; step += 1) {
    const number = document.createElement('div');
    number.className = `step-number${majorSteps.has(step) ? ' major' : ''}`;
    number.dataset.stepNumber = String(step);
    number.textContent = String(step + 1);
    grid.append(number);
  }

  tracks.forEach((track, row) => {
    const label = document.createElement('button');
    label.type = 'button';
    label.className = `track-label${state.muted[row] ? ' muted' : ''}`;
    label.dataset.trackLabel = String(row);
    label.innerHTML = `<i></i><span>${tracks.length > 9 && row < 9 ? `CH·0${row + 1}` : `CH·${String(row + 1).padStart(2, '0')}`}</span><strong>${track.name}</strong>`;
    label.title = `Mute ${track.name}`;
    label.addEventListener('click', () => {
      state.muted[row] = !state.muted[row];
      renderGrid();
    });
    grid.append(label);

    for (let step = 0; step < 16; step += 1) {
      const cell = document.createElement('button');
      cell.type = 'button';
      cell.className = 'step-cell';
      cell.dataset.row = String(row);
      cell.dataset.step = String(step);
      cell.setAttribute('aria-label', `${track.name}, step ${step + 1}`);
      cell.addEventListener('click', () => editCell(row, step, 1));
      cell.addEventListener('contextmenu', (event) => {
        event.preventDefault();
        editCell(row, step, -1);
      });
      grid.append(cell);
    }
  });
  renderGrid();
}

function buildNotePads() {
  const pads = $('#notePads');
  notes.forEach((note, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'note-pad';
    button.dataset.note = note;
    button.innerHTML = `${note}<small>${keys[index]}</small>`;
    button.addEventListener('pointerdown', () => playPad(note, button));
    button.addEventListener('pointerup', () => releasePad(button));
    button.addEventListener('pointerleave', () => releasePad(button));
    pads.append(button);
  });
}

function activePattern() {
  return state.patterns[state.station];
}

function selectStation(index) {
  state.station = index;
  state.currentStep = state.playing ? state.currentStep : -1;
  state.viewSeed = 2.41 + index * 4.72;
  $$('.station-tab').forEach((tab, tabIndex) => tab.classList.toggle('active', tabIndex === index));
  const station = stations[index];
  $('#tempo').value = String(station.tempo);
  $('#swing').value = String(station.swing);
  syncControls();
  renderGrid();
}

function editCell(row, step, direction) {
  const pattern = activePattern();
  if (row < 2) {
    const current = pattern[row][step];
    if (!current) {
      pattern[row][step] = state.selectedNote;
    } else {
      const index = notes.indexOf(current);
      const next = index + direction;
      pattern[row][step] = next < 0 || next >= notes.length ? null : notes[next];
    }
  } else {
    pattern[row][step] = pattern[row][step] ? null : true;
  }
  state.viewSeed += .37;
  renderGrid();
}

function renderGrid() {
  const pattern = activePattern();
  $$('.step-number').forEach((number, step) => number.classList.toggle('current', state.playing && step === state.currentStep));
  $$('.track-label').forEach((label, row) => label.classList.toggle('muted', state.muted[row]));
  $$('.step-cell').forEach((cell) => {
    const row = Number(cell.dataset.row);
    const step = Number(cell.dataset.step);
    const value = pattern[row][step];
    cell.className = `step-cell ${tracks[row].type}${row < 2 ? ' melodic' : ''}${value ? ' on' : ''}${state.playing && step === state.currentStep ? ' current' : ''}`;
    cell.textContent = row < 2 && value ? value : '';
  });
}

function clearPattern() {
  state.patterns[state.station] = blankPattern();
  state.viewSeed += 1.9;
  renderGrid();
}

function randomPattern() {
  const p = blankPattern();
  const melodicDensity = state.station === 4 ? .54 : .28;
  for (let row = 0; row < p.length; row += 1) {
    for (let step = 0; step < 16; step += 1) {
      let chance = .14;
      if (row < 2) chance = melodicDensity;
      else if (row === 5 || row === 10) chance = .56;
      else if (row === 2) chance = .32;
      if (Math.random() < chance) p[row][step] = row < 2 ? notes[Math.floor(Math.random() * notes.length)] : true;
    }
  }
  state.patterns[state.station] = p;
  state.viewSeed = Math.random() * 30;
  renderGrid();
}

function syncControls() {
  $('#tempoValue').textContent = $('#tempo').value;
  $('#swingValue').textContent = `${$('#swing').value}%`;
  $('#volumeValue').textContent = $('#volume').value;
  if (audio.master) audio.master.gain.setTargetAtTime(Number($('#volume').value) / 125, audio.context.currentTime, .01);
}

function togglePlayback() {
  state.playing ? stopPlayback() : startPlayback();
}

function startPlayback() {
  ensureAudio();
  state.playing = true;
  state.currentStep = -1;
  audio.nextNoteTime = audio.context.currentTime + .045;
  audio.nextStep = 0;
  audio.timer = window.setInterval(scheduler, 20);
  $('#playButton').classList.add('playing');
  $('.transport-copy').textContent = 'STOP';
  $('#onAir').classList.add('live');
  renderGrid();
}

function stopPlayback() {
  state.playing = false;
  window.clearInterval(audio.timer);
  state.currentStep = -1;
  $('#playButton').classList.remove('playing');
  $('.transport-copy').textContent = 'PLAY';
  $('#onAir').classList.remove('live');
  renderGrid();
}

const audio = {
  context: null,
  master: null,
  noise: null,
  timer: null,
  nextStep: 0,
  nextNoteTime: 0
};

function ensureAudio() {
  if (audio.context) {
    if (audio.context.state === 'suspended') audio.context.resume();
    return;
  }
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return;
  audio.context = new AudioCtx();
  audio.master = audio.context.createGain();
  audio.master.gain.value = Number($('#volume').value) / 125;
  const compressor = audio.context.createDynamicsCompressor();
  compressor.threshold.value = -8;
  compressor.knee.value = 8;
  compressor.ratio.value = 7;
  compressor.attack.value = .002;
  compressor.release.value = .18;
  audio.master.connect(compressor).connect(audio.context.destination);
  const buffer = audio.context.createBuffer(1, audio.context.sampleRate * 2, audio.context.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i += 1) data[i] = Math.random() * 2 - 1;
  audio.noise = buffer;
}

function scheduler() {
  if (!state.playing || !audio.context) return;
  while (audio.nextNoteTime < audio.context.currentTime + .1) {
    const step = audio.nextStep;
    let when = audio.nextNoteTime;
    const swing = Number($('#swing').value) / 100;
    const secondsPerSixteenth = 60 / Number($('#tempo').value) / 4;
    if (step % 2) when += secondsPerSixteenth * swing * .55;
    scheduleStep(step, when);
    const visualDelay = Math.max(0, (when - audio.context.currentTime) * 1000);
    window.setTimeout(() => {
      if (!state.playing) return;
      state.currentStep = step;
      state.scopeClock += .24;
      renderGrid();
    }, visualDelay);
    audio.nextNoteTime += secondsPerSixteenth;
    audio.nextStep = (step + 1) % 16;
  }
}

function scheduleStep(step, when) {
  const pattern = activePattern();
  pattern.forEach((row, index) => {
    if (row[step] && !state.muted[index]) triggerSound(tracks[index].type, row[step], when);
  });
}

const noteSemitones = { A: 0, C: 3, D: 5, E: 7, G: 10, 'A+': 12, 'C+': 15 };
const hz = (note, bass = false) => (bass ? 55 : 220) * (2 ** (noteSemitones[note] / 12));

function envelope(gain, when, peak, attack, decay) {
  gain.gain.setValueAtTime(.0001, when);
  gain.gain.exponentialRampToValueAtTime(Math.max(.001, peak), when + attack);
  gain.gain.exponentialRampToValueAtTime(.0001, when + decay);
}

function triggerSound(type, value, when = audio.context?.currentTime || 0) {
  if (!audio.context || !audio.master) return;
  const ctx = audio.context;
  if (type === 'lead' || type === 'bass') {
    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();
    osc.type = type === 'bass' ? 'square' : 'sawtooth';
    osc.frequency.value = hz(value, type === 'bass');
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(type === 'bass' ? 540 : 1300, when);
    filter.frequency.exponentialRampToValueAtTime(type === 'bass' ? 120 : 390, when + .18);
    envelope(gain, when, type === 'bass' ? .12 : .07, .007, type === 'bass' ? .22 : .14);
    osc.connect(filter).connect(gain).connect(audio.master);
    osc.start(when); osc.stop(when + .25);
    return;
  }
  if (type === 'kick' || type === 'tom') {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(type === 'kick' ? 145 : 210, when);
    osc.frequency.exponentialRampToValueAtTime(type === 'kick' ? 42 : 80, when + .13);
    envelope(gain, when, type === 'kick' ? .7 : .25, .002, type === 'kick' ? .25 : .18);
    osc.connect(gain).connect(audio.master);
    osc.start(when); osc.stop(when + .3);
    return;
  }
  if (type === 'cowbell') {
    [560, 845].forEach((frequency) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square'; osc.frequency.value = frequency;
      envelope(gain, when, .055, .002, .09);
      osc.connect(gain).connect(audio.master); osc.start(when); osc.stop(when + .1);
    });
    return;
  }
  const source = ctx.createBufferSource();
  const filter = ctx.createBiquadFilter();
  const gain = ctx.createGain();
  source.buffer = audio.noise;
  const settings = {
    snare: [900, .18, .16], clap: [1250, .12, .11], hat: [6100, .055, .045],
    openhat: [5200, .08, .22], rim: [2500, .1, .035], shaker: [7000, .035, .035], crash: [3600, .11, .75]
  }[type] || [3000, .08, .1];
  filter.type = type === 'snare' || type === 'clap' ? 'bandpass' : 'highpass';
  filter.frequency.value = settings[0];
  envelope(gain, when, settings[1], .002, settings[2]);
  source.connect(filter).connect(gain).connect(audio.master);
  source.start(when); source.stop(when + settings[2] + .05);
}

let heldPadOscillator = null;
function playPad(note, button) {
  state.selectedNote = note;
  ensureAudio();
  button.classList.add('pressed');
  triggerSound(state.mode, note, audio.context?.currentTime || 0);
  if (state.recording && state.playing && state.currentStep >= 0) {
    activePattern()[state.mode === 'lead' ? 0 : 1][state.currentStep] = note;
    renderGrid();
  }
}

function releasePad(button) {
  button.classList.remove('pressed');
  heldPadOscillator = null;
}

const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

function setupControls() {
  $('#playButton').addEventListener('click', togglePlayback);
  ['tempo', 'swing', 'volume'].forEach((id) => $(`#${id}`).addEventListener('input', syncControls));
  $('#clearButton').addEventListener('click', clearPattern);
  $('#randomButton').addEventListener('click', randomPattern);
  $('#recordButton').addEventListener('click', () => {
    state.recording = !state.recording;
    $('#recordButton').classList.toggle('active', state.recording);
  });
  $$('#instrumentButtons button').forEach((button) => button.addEventListener('click', () => {
    state.mode = button.dataset.mode;
    $$('#instrumentButtons button').forEach((item) => item.classList.toggle('active', item === button));
  }));
  window.addEventListener('keydown', (event) => {
    if (event.code === 'Space' && !event.repeat) {
      event.preventDefault();
      togglePlayback();
      return;
    }
    const index = keys.indexOf(event.key.toUpperCase());
    if (index >= 0 && !event.repeat) playPad(notes[index], $$('.note-pad')[index]);
  });
  window.addEventListener('keyup', (event) => {
    const index = keys.indexOf(event.key.toUpperCase());
    if (index >= 0) releasePad($$('.note-pad')[index]);
  });
}

const canvas = $('#scopeCanvas');
const ctx = canvas.getContext('2d');
let lastScopeTime = performance.now();

function hash(x, y, seed) {
  const value = Math.sin(x * 91.173 + y * 17.719 + seed * 49.113) * 43758.5453;
  return value - Math.floor(value);
}

function drawScope(now) {
  const rect = canvas.getBoundingClientRect();
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const width = Math.round(rect.width * dpr);
  const height = Math.round(rect.height * dpr);
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, rect.width, rect.height);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '700 20px Menlo, Monaco, Consolas, monospace';

  const cols = 38;
  const rows = 14;
  const cw = rect.width / cols;
  const rh = 32.2;
  const elapsed = (now - lastScopeTime) / 1000;
  lastScopeTime = now;
  state.scopeClock += elapsed * (state.playing ? .95 : .25);
  const t = state.scopeClock + state.viewSeed;
  const pulseStep = state.currentStep < 0 ? 0 : state.currentStep;

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const wave = Math.sin(col * .34 + t) + .54 * Math.sin(col * .71 - t * .68 + row * .08) + .18 * Math.cos(row * .65 + t);
      const contour = wave + Math.sin(row * .19 + col * .08) * .18;
      let char;
      let color;
      if (contour < -.76) { char = hash(col, row, state.viewSeed) > .43 ? '−' : '+'; color = COLORS.navy; }
      else if (contour < -.18) { char = '+'; color = COLORS.navy; }
      else if (contour < .45) { char = '/'; color = COLORS.blue; }
      else { char = Math.sin(col * .34 + t) > 0 ? ')' : '('; color = COLORS.blue; }

      const center1 = ((t * 2.6 + state.station * 7.2) % 52) - 7;
      const center2 = ((t * 1.45 + 21 + state.station * 4.1) % 50) - 6;
      const dx1 = (col - center1) / 3.1;
      const dy1 = (row - (5.8 + Math.sin(t) * 1.7)) / 3.25;
      const dx2 = (col - center2) / 2.5;
      const dy2 = (row - (7.5 + Math.cos(t * .7) * 2.1)) / 2.8;
      const blob = Math.min(dx1 * dx1 + dy1 * dy1, dx2 * dx2 + dy2 * dy2);
      if (state.playing && blob < 1.0) {
        const h = hash(col, row, Math.floor(t * 2.3) + state.station * 3);
        if (blob < .18) { char = h > .55 ? '◆' : '#'; color = COLORS.white; }
        else if (blob < .42) { char = h > .55 ? 'K' : '▲'; color = COLORS.bright; }
        else { char = '*'; color = COLORS.bright; }
      } else if (hash(col, row, Math.floor(t * .58)) > .974) {
        char = hash(col + 2, row, t) > .5 ? '+' : '−';
        color = COLORS.aqua;
      }

      if (state.playing && col === Math.floor((pulseStep / 16) * cols) && hash(col, row, 3) > .72) color = COLORS.aqua;
      ctx.fillStyle = color;
      ctx.fillText(char, (col + .5) * cw, 18 + row * rh);
    }
  }
  requestAnimationFrame(drawScope);
}

buildLogo();
buildStations();
buildGrid();
buildNotePads();
setupControls();
syncControls();
requestAnimationFrame(drawScope);
