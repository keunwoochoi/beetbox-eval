const glyphPatterns = [
  ['+', '+', '−', '−', '+', '/', '/', '/', '(', ')', '*', '▲', '#', 'K'],
  ['/', '(', ')', '+', '−', '−', '+', '+', '/', '/', '(', ')', '*', '▲'],
  ['(', ')', '/', '/', '+', '+', '+', '−', '−', '/', '/', '(', ')', '+'],
  ['−', '+', '+', '/', '/', '/', '(', '(', ')', '+', '−', '−', '/', '*'],
];

const tracks = [
  { id: 'lead', name: 'Lead', kind: 'pitch', on: [3, 7, 12, 15], pitches: ['G', 'D', 'C+', 'A+'] },
  { id: 'bass', name: 'Bass', kind: 'pitch', on: [0, 3, 6, 8, 11, 14], pitches: ['A', 'A', 'A', 'A', 'A', 'E'] },
  { id: 'kick', name: 'Kick', on: [0, 4, 8, 12] },
  { id: 'snare', name: 'Snare', on: [] },
  { id: 'clap', name: 'Clap', on: [4, 12] },
  { id: 'hihat', name: 'Hi-hat', on: [0, 1, 3, 4, 5, 7, 8, 9, 11, 12, 13, 15] },
  { id: 'openhat', name: 'Open hat', on: [2, 6, 10, 14] },
  { id: 'rimshot', name: 'Rimshot', on: [7, 15] },
  { id: 'tom', name: 'Tom', on: [14] },
  { id: 'cowbell', name: 'Cowbell', on: [] },
  { id: 'shaker', name: 'Shaker', on: [0, 2, 4, 6, 8, 10, 12, 14] },
  { id: 'crash', name: 'Crash', on: [0] },
];

// Each channel is intentionally a little different: changing channels should feel like
// changing radio stations, not just changing the label above the same loop.
const presets = [
  {
    tempo: 132, swing: 0, volume: 90,
    lead: [3, 7, 12, 15], bass: [0, 3, 6, 8, 11, 14],
    kit: { kick: [0, 4, 8, 12], snare: [], clap: [4, 12], hihat: [0, 1, 3, 4, 5, 7, 8, 9, 11, 12, 13, 15], openhat: [2, 6, 10, 14], rimshot: [7, 15], tom: [14], cowbell: [], shaker: [0, 2, 4, 6, 8, 10, 12, 14], crash: [0] },
  },
  {
    tempo: 140, swing: 8, volume: 35,
    lead: [1, 4, 7, 10, 13, 15], bass: [0, 2, 5, 8, 10, 14],
    kit: { kick: [0, 3, 6, 8, 10, 12, 14], snare: [4, 12], clap: [], hihat: [0, 2, 4, 6, 8, 10, 12, 14], openhat: [3, 7, 11, 15], rimshot: [7, 15], tom: [11, 15], cowbell: [2, 6, 10, 14], shaker: [1, 3, 5, 7, 9, 11, 13, 15], crash: [0, 8] },
  },
  {
    tempo: 118, swing: 16, volume: 58,
    lead: [0, 3, 6, 9, 12], bass: [0, 4, 8, 12],
    kit: { kick: [0, 4, 8, 10, 12], snare: [4, 12], clap: [3, 7, 11, 15], hihat: [0, 2, 4, 6, 8, 10, 12, 14], openhat: [2, 6, 10, 14], rimshot: [3, 11], tom: [7, 15], cowbell: [], shaker: [0, 2, 4, 6, 8, 10, 12, 14], crash: [0] },
  },
  {
    tempo: 126, swing: 4, volume: 68,
    lead: [2, 6, 10, 14], bass: [0, 3, 7, 11, 15],
    kit: { kick: [0, 4, 8, 12], snare: [4, 12], clap: [4, 12], hihat: [0, 1, 2, 4, 5, 6, 8, 9, 10, 12, 13, 14], openhat: [3, 7, 11, 15], rimshot: [7, 15], tom: [10, 14], cowbell: [2, 6, 10, 14], shaker: [0, 2, 4, 6, 8, 10, 12, 14], crash: [0, 8] },
  },
  {
    tempo: 140, swing: 8, volume: 35,
    lead: [0, 2, 4, 6, 8, 10, 12, 14], bass: [0, 1, 2, 4, 5, 6, 8, 9, 10, 12, 13, 14],
    kit: { kick: [0, 3, 4, 6, 8, 10, 12, 14], snare: [4, 12], clap: [3, 7, 11, 15], hihat: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], openhat: [2, 6, 10, 14], rimshot: [1, 5, 9, 13], tom: [7, 15], cowbell: [0, 2, 4, 6, 8, 10, 12, 14], shaker: [1, 3, 5, 7, 9, 11, 13, 15], crash: [0, 8] },
  },
];

const notes = ['A', 'C', 'D', 'E', 'G', 'A+', 'C+'];
const keys = ['A', 'C', 'D', 'E', 'G', 'A+', 'C+'];
const keyHints = ['A', 'S', 'D', 'F', 'G', 'H', 'J'];
const noteFrequency = { A: 220, C: 261.63, D: 293.66, E: 329.63, G: 392, 'A+': 440, 'C+': 523.25 };
const logoLetters = {
  B: ['11110', '10001', '10001', '11110', '10001', '10001', '11110'],
  E: ['11111', '10000', '10000', '11110', '10000', '10000', '11111'],
  T: ['11111', '00100', '00100', '00100', '00100', '00100', '00100'],
  O: ['01110', '10001', '10001', '10001', '10001', '10001', '01110'],
  X: ['10001', '10001', '01010', '00100', '01010', '10001', '10001'],
};

let isPlaying = false;
let currentStep = -1;
let visualPhase = 0;
let timer;
let selectedChannel = 0;
let selectedVoice = 'lead';
let loopRecording = false;
let muted = new Set();
let audioContext;
let masterGain;
let noiseBuffer;

const qs = (selector) => document.querySelector(selector);
const tempo = qs('#tempo');
const swing = qs('#swing');
const volume = qs('#volume');

function buildLogo() {
  const logo = qs('.pixel-logo');
  logo.innerHTML = '';
  logo.style.display = 'flex';
  logo.style.gap = '14px';
  'BEETBOX'.split('').forEach((letter) => {
    const letterGrid = document.createElement('span');
    letterGrid.className = 'pixel-letter';
    letterGrid.style.gridTemplateColumns = 'repeat(5, 7px)';
    letterGrid.style.gridTemplateRows = 'repeat(7, 7px)';
    const pattern = logoLetters[letter];
    pattern.forEach((line) => [...line].forEach((pixel) => {
      const cell = document.createElement('span');
      cell.style.background = pixel === '1' ? 'var(--pale)' : 'transparent';
      letterGrid.appendChild(cell);
    }));
    logo.appendChild(letterGrid);
  });
}

function buildGlyphField() {
  const field = qs('#glyphField');
  field.innerHTML = '';
  const cols = 45;
  for (let row = 0; row < 16; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const el = document.createElement('span');
      const n = (row * 19 + col * 11 + visualPhase * 7 + selectedChannel * 31) % 100;
      let char = glyphPatterns[(row + Math.floor(col / 5) + visualPhase) % glyphPatterns.length][(col + row + visualPhase) % 14];
      if (n < 15) char = '−';
      if (n < 5) char = '+';
      if ((col + visualPhase) % 17 === 0 && row > 2) char = '*';
      if ((col * 3 + row + visualPhase) % 47 === 0) char = '✦';
      el.textContent = char;
      el.className = 'glyph';
      if (char === '/' || char === '(' || char === ')') el.classList.add('light');
      if (char === '*' || char === '▲' || char === '#' || char === 'K' || char === '✦') el.classList.add('bright');
      if (char === '✦') el.classList.add('hot');
      field.appendChild(el);
    }
  }
}

function setSliderValues() {
  qs('#tempoValue').textContent = tempo.value;
  qs('#swingValue').textContent = `${swing.value}%`;
  qs('#volumeValue').textContent = volume.value;
  if (masterGain) masterGain.gain.value = Number(volume.value) / 100 * 0.28;
}

function buildSequencer() {
  qs('#stepNumbers').innerHTML = Array.from({ length: 16 }, (_, i) => `<span class="step-number">${i + 1}</span>`).join('');
  qs('#trackList').innerHTML = tracks.map((track, index) => `<button class="track-name${muted.has(index) ? ' muted' : ''}" data-track="${index}" aria-pressed="${muted.has(index)}"><span>CH·${String(index + 1).padStart(2, '0')}</span> ${track.name}</button>`).join('');
  qs('#stepGrid').innerHTML = '';
  tracks.forEach((track, row) => {
    for (let col = 0; col < 16; col += 1) {
      const cell = document.createElement('button');
      cell.className = 'cell';
      cell.dataset.row = row;
      cell.dataset.col = col;
      cell.setAttribute('aria-label', `${track.name}, step ${col + 1}`);
      if (track.on.includes(col)) cell.classList.add('on');
      if (track.kind === 'pitch' && track.on.includes(col)) {
        cell.classList.add('pitch');
        cell.textContent = track.pitches[track.on.indexOf(col)] || notes[0];
      }
      cell.addEventListener('click', () => toggleCell(row, col));
      cell.addEventListener('contextmenu', (event) => {
        event.preventDefault();
        if (track.kind === 'pitch' && track.on.includes(col)) cyclePitch(row, col, -1);
      });
      qs('#stepGrid').appendChild(cell);
    }
  });
  document.querySelectorAll('.track-name').forEach((button) => button.addEventListener('click', () => {
    const index = Number(button.dataset.track);
    if (muted.has(index)) muted.delete(index); else muted.add(index);
    button.classList.toggle('muted', muted.has(index));
    button.setAttribute('aria-pressed', String(muted.has(index)));
  }));
  updatePlayhead();
}

function toggleCell(row, col) {
  const track = tracks[row];
  const index = track.on.indexOf(col);
  if (index >= 0) {
    track.on.splice(index, 1);
    if (track.kind === 'pitch') track.pitches.splice(index, 1);
  } else {
    track.on.push(col);
    track.on.sort((a, b) => a - b);
    if (track.kind === 'pitch') track.pitches.splice(track.on.indexOf(col), 0, notes[0]);
  }
  buildSequencer();
  updatePlayhead();
}

function cyclePitch(row, col, direction = 1) {
  const track = tracks[row];
  const index = track.on.indexOf(col);
  if (index < 0) return;
  const noteIndex = notes.indexOf(track.pitches[index]);
  track.pitches[index] = notes[(noteIndex + direction + notes.length) % notes.length];
  buildSequencer();
  updatePlayhead();
}

function updatePlayhead() {
  document.querySelectorAll('.cell').forEach((cell) => cell.classList.toggle('current', isPlaying && Number(cell.dataset.col) === currentStep));
  document.querySelectorAll('.step-number').forEach((num, index) => num.classList.toggle('current', isPlaying && index === currentStep));
}

function renderTransport() {
  const button = qs('#playButton');
  button.classList.toggle('is-playing', isPlaying);
  button.setAttribute('aria-pressed', String(isPlaying));
  qs('#playLabel').textContent = isPlaying ? 'STOP' : 'PLAY';
  qs('.play-icon').textContent = isPlaying ? '■' : '▶';
  qs('.on-air').classList.toggle('is-live', isPlaying);
  if (!isPlaying) currentStep = -1;
  updatePlayhead();
}

// A small Web Audio drum machine keeps the recreation self-contained. No external
// audio files or network requests are needed, so it also works offline.
function ensureAudio() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = audioContext.createGain();
    masterGain.gain.value = Number(volume.value) / 100 * 0.28;
    masterGain.connect(audioContext.destination);
    noiseBuffer = audioContext.createBuffer(1, audioContext.sampleRate * 2, audioContext.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < data.length; i += 1) data[i] = Math.random() * 2 - 1;
  }
  if (audioContext.state === 'suspended') audioContext.resume();
}

function envelope(gain, time, attack, decay, peak = 1) {
  gain.gain.cancelScheduledValues(time);
  gain.gain.setValueAtTime(0.0001, time);
  gain.gain.linearRampToValueAtTime(peak, time + attack);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + attack + decay);
}

function tone(frequency, time, duration, type = 'sine', level = 0.12, filterFrequency = 3000) {
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  const filter = audioContext.createBiquadFilter();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, time);
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(filterFrequency, time);
  oscillator.connect(filter).connect(gain).connect(masterGain);
  envelope(gain, time, 0.004, duration, level);
  oscillator.start(time);
  oscillator.stop(time + duration + 0.04);
}

function noise(time, duration, level, filterType = 'highpass', frequency = 3500) {
  const source = audioContext.createBufferSource();
  const filter = audioContext.createBiquadFilter();
  const gain = audioContext.createGain();
  source.buffer = noiseBuffer;
  filter.type = filterType;
  filter.frequency.setValueAtTime(frequency, time);
  source.connect(filter).connect(gain).connect(masterGain);
  envelope(gain, time, 0.001, duration, level);
  source.start(time);
  source.stop(time + duration + 0.02);
}

function playKick(time) {
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(150, time);
  oscillator.frequency.exponentialRampToValueAtTime(48, time + 0.12);
  oscillator.connect(gain).connect(masterGain);
  envelope(gain, time, 0.002, 0.24, 0.65);
  oscillator.start(time);
  oscillator.stop(time + 0.3);
}

function playTrack(track, pitch, time) {
  switch (track.id) {
    case 'lead': tone(noteFrequency[pitch] || 220, time, 0.17, 'sawtooth', 0.12, 1800); break;
    case 'bass': tone((noteFrequency[pitch] || 110) / 2, time, 0.22, 'triangle', 0.2, 900); break;
    case 'kick': playKick(time); break;
    case 'snare': noise(time, 0.14, 0.24, 'highpass', 1200); tone(170, time, 0.07, 'triangle', 0.12, 900); break;
    case 'clap': noise(time, 0.09, 0.2, 'bandpass', 1700); break;
    case 'hihat': noise(time, 0.045, 0.11, 'highpass', 6500); break;
    case 'openhat': noise(time, 0.19, 0.14, 'highpass', 4800); break;
    case 'rimshot': tone(1800, time, 0.04, 'square', 0.06, 4200); break;
    case 'tom': tone(170, time, 0.16, 'sine', 0.15, 1500); break;
    case 'cowbell': tone(540, time, 0.08, 'square', 0.08, 2600); tone(810, time, 0.06, 'square', 0.05, 3000); break;
    case 'shaker': noise(time, 0.04, 0.065, 'highpass', 7200); break;
    case 'crash': noise(time, 0.45, 0.18, 'highpass', 3600); break;
    default: break;
  }
}

function playStep(step) {
  if (!audioContext) return;
  const when = audioContext.currentTime + 0.01;
  tracks.forEach((track, row) => {
    if (muted.has(row)) return;
    const noteIndex = track.on.indexOf(step);
    if (noteIndex >= 0) playTrack(track, track.kind === 'pitch' ? track.pitches[noteIndex] : undefined, when);
  });
}

function scheduleNextTick() {
  if (!isPlaying) return;
  const base = 60000 / Number(tempo.value) / 4;
  const amount = Number(swing.value) / 100;
  const delay = base * (currentStep % 2 === 0 ? 1 - amount : 1 + amount);
  timer = window.setTimeout(tick, Math.max(20, delay));
}

function tick() {
  if (!isPlaying) return;
  currentStep = (currentStep + 1) % 16;
  visualPhase = (visualPhase + 1) % 1000;
  buildGlyphField();
  updatePlayhead();
  playStep(currentStep);
  scheduleNextTick();
}

function togglePlayback() {
  ensureAudio();
  isPlaying = !isPlaying;
  window.clearTimeout(timer);
  renderTransport();
  if (isPlaying) tick();
}

function loadPreset(index) {
  const preset = presets[index];
  selectedChannel = index;
  tempo.value = preset.tempo;
  swing.value = preset.swing;
  volume.value = preset.volume;
  tracks[0].on = [...preset.lead];
  tracks[1].on = [...preset.bass];
  tracks[0].pitches = tracks[0].on.map((_, i) => notes[(i + index) % notes.length]);
  tracks[1].pitches = tracks[1].on.map((_, i) => notes[(i + 2 + index) % notes.length]);
  tracks.forEach((track) => {
    if (preset.kit[track.id]) track.on = [...preset.kit[track.id]];
  });
  document.querySelectorAll('.channel').forEach((button, i) => {
    button.classList.toggle('active', i === index);
    button.setAttribute('aria-pressed', String(i === index));
  });
  setSliderValues();
  buildSequencer();
  buildGlyphField();
  if (isPlaying) {
    window.clearTimeout(timer);
    scheduleNextTick();
  }
}

function clearPattern() {
  tracks.forEach((track) => { track.on = []; if (track.kind === 'pitch') track.pitches = []; });
  buildSequencer();
}

function randomize() {
  tracks.forEach((track, row) => {
    track.on = [];
    for (let col = 0; col < 16; col += 1) {
      const chance = row === 0 ? 0.28 : row === 1 ? 0.42 : row === 5 ? 0.72 : row === 2 ? 0.38 : 0.16;
      if (Math.random() < chance) track.on.push(col);
    }
    if (track.kind === 'pitch') track.pitches = track.on.map(() => notes[Math.floor(Math.random() * notes.length)]);
  });
  tempo.value = 140;
  swing.value = 8;
  volume.value = 35;
  setSliderValues();
  buildSequencer();
  buildGlyphField();
}

function playKeyboardNote(note) {
  ensureAudio();
  tone(noteFrequency[note] || 220, audioContext.currentTime + 0.01, 0.28, selectedVoice === 'bass' ? 'triangle' : 'sawtooth', selectedVoice === 'bass' ? 0.2 : 0.12, selectedVoice === 'bass' ? 1000 : 2200);
  const button = [...document.querySelectorAll('.key')].find((key) => key.dataset.note === note);
  if (button) {
    button.classList.add('pressed');
    window.setTimeout(() => button.classList.remove('pressed'), 130);
  }
  if (loopRecording && isPlaying && currentStep >= 0) {
    const row = selectedVoice === 'lead' ? 0 : 1;
    const track = tracks[row];
    const noteIndex = track.on.indexOf(currentStep);
    if (noteIndex < 0) {
      track.on.push(currentStep);
      track.on.sort((a, b) => a - b);
      track.pitches.splice(track.on.indexOf(currentStep), 0, note);
    } else track.pitches[noteIndex] = note;
    buildSequencer();
  }
}

function wireEvents() {
  qs('#playButton').addEventListener('click', togglePlayback);
  qs('#clearButton').addEventListener('click', clearPattern);
  qs('#randomButton').addEventListener('click', randomize);
  document.querySelectorAll('.channel').forEach((button) => button.addEventListener('click', () => loadPreset(Number(button.dataset.channel))));
  [tempo, swing, volume].forEach((input) => input.addEventListener('input', () => {
    setSliderValues();
    if (isPlaying) {
      window.clearTimeout(timer);
      scheduleNextTick();
    }
  }));
  qs('#leadButton').addEventListener('click', () => { selectedVoice = 'lead'; qs('#leadButton').classList.add('active'); qs('#bassButton').classList.remove('active'); });
  qs('#bassButton').addEventListener('click', () => { selectedVoice = 'bass'; qs('#bassButton').classList.add('active'); qs('#leadButton').classList.remove('active'); });
  qs('#loopButton').addEventListener('click', () => { loopRecording = !loopRecording; qs('#loopButton').classList.toggle('recording', loopRecording); qs('#loopButton').setAttribute('aria-pressed', String(loopRecording)); });
  document.querySelectorAll('.key').forEach((button) => button.addEventListener('click', () => playKeyboardNote(button.dataset.note)));
  qs('#fullscreenButton').addEventListener('click', () => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen?.();
    else document.exitFullscreen?.();
  });
  qs('#moreButton')?.addEventListener('click', () => document.body.classList.toggle('show-shortcuts'));
  document.addEventListener('keydown', (event) => {
    if (event.code === 'Space' && event.target.tagName !== 'INPUT') { event.preventDefault(); togglePlayback(); return; }
    if (event.target.tagName === 'INPUT' || event.metaKey || event.ctrlKey) return;
    const keyIndex = keyHints.indexOf(event.key.toUpperCase());
    if (keyIndex >= 0) playKeyboardNote(keys[keyIndex]);
  });
}

buildLogo();
buildGlyphField();
setSliderValues();
buildSequencer();
qs('#keyRow').innerHTML = keys.map((key, index) => `<button class="key" data-note="${key}" aria-label="Play ${key}"><span>${key}</span><small>${keyHints[index]}</small></button>`).join('');
wireEvents();
