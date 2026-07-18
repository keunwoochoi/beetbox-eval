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

const presets = [
  { tempo: 132, swing: 0, volume: 90, lead: [3, 7, 12, 15], bass: [0, 3, 6, 8, 11, 14] },
  { tempo: 140, swing: 8, volume: 35, lead: [1, 4, 7, 10, 13, 15], bass: [0, 2, 5, 8, 10, 14] },
  { tempo: 118, swing: 16, volume: 58, lead: [0, 3, 6, 9, 12], bass: [0, 4, 8, 12] },
  { tempo: 126, swing: 4, volume: 68, lead: [2, 6, 10, 14], bass: [0, 3, 7, 11, 15] },
  { tempo: 140, swing: 8, volume: 35, lead: [0, 4, 7, 10, 14], bass: [0, 2, 4, 6, 8, 10, 12, 14] },
];

const notes = ['A', 'C', 'D', 'E', 'G', 'A+', 'C+'];
const keys = ['A', 'C', 'D', 'E', 'G', 'A+', 'C+'];
const keyHints = ['A', 'S', 'D', 'F', 'G', 'H', 'J'];
const logoLetters = {
  B: ['11110','10001','10001','11110','10001','10001','11110'],
  E: ['11111','10000','10000','11110','10000','10000','11111'],
  T: ['11111','00100','00100','00100','00100','00100','00100'],
  O: ['01110','10001','10001','10001','10001','10001','01110'],
  X: ['10001','10001','01010','00100','01010','10001','10001'],
};

let isPlaying = false;
let currentStep = -1;
let visualPhase = 0;
let timer;
let selectedChannel = 0;
let selectedVoice = 'lead';
let loopRecording = false;
let muted = new Set();

const qs = (selector) => document.querySelector(selector);
const tempo = qs('#tempo');
const swing = qs('#swing');
const volume = qs('#volume');

function buildLogo() {
  const logo = qs('.pixel-logo');
  'BEETBOX'.split('').forEach((letter, letterIndex) => {
    const pattern = logoLetters[letter];
    pattern.forEach((line) => [...line].forEach((pixel) => {
      const cell = document.createElement('span');
      cell.style.background = pixel === '1' ? 'var(--pale)' : 'transparent';
      logo.appendChild(cell);
    }));
    if (letterIndex < 6) {
      Array.from({ length: 7 }, () => {
        const spacer = document.createElement('span');
        spacer.style.background = 'transparent';
        logo.appendChild(spacer);
      });
    }
  });
  logo.style.gridTemplateColumns = `repeat(${7 * 7}, 7px)`;
  logo.style.gridTemplateRows = 'repeat(7, 7px)';
  logo.style.gridAutoFlow = 'column';
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
      if ((col + visualPhase) % 17 === 0 && row > 2) char = '★';
      if ((col * 3 + row + visualPhase) % 47 === 0) char = '✦';
      el.textContent = char;
      el.className = 'glyph';
      if (char === '/' || char === '(' || char === ')') el.classList.add('light');
      if (char === '*' || char === '▲' || char === '#' || char === 'K' || char === '★' || char === '✦') el.classList.add('bright');
      if (char === '✦') el.classList.add('hot');
      field.appendChild(el);
    }
  }
}

function setSliderValues() {
  qs('#tempoValue').textContent = tempo.value;
  qs('#swingValue').textContent = `${swing.value}%`;
  qs('#volumeValue').textContent = volume.value;
}

function buildSequencer() {
  qs('#stepNumbers').innerHTML = Array.from({ length: 16 }, (_, i) => `<span class="step-number">${i + 1}</span>`).join('');
  qs('#trackList').innerHTML = tracks.map((track, index) => `<button class="track-name" data-track="${index}"><span>CH·${String(index + 1).padStart(2, '0')}</span> ${track.name}</button>`).join('');
  qs('#stepGrid').innerHTML = '';
  tracks.forEach((track, row) => {
    for (let col = 0; col < 16; col += 1) {
      const cell = document.createElement('button');
      cell.className = 'cell';
      cell.dataset.row = row;
      cell.dataset.col = col;
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
  }));
}

function toggleCell(row, col) {
  const track = tracks[row];
  const index = track.on.indexOf(col);
  if (index >= 0) track.on.splice(index, 1);
  else {
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
  qs('#playLabel').textContent = isPlaying ? 'STOP' : 'PLAY';
  qs('.play-icon').textContent = isPlaying ? '■' : '▶';
  qs('.on-air').classList.toggle('is-live', isPlaying);
  if (!isPlaying) currentStep = -1;
  updatePlayhead();
}

function tick() {
  currentStep = (currentStep + 1) % 16;
  visualPhase = (visualPhase + 1) % 1000;
  buildGlyphField();
  updatePlayhead();
}

function togglePlayback() {
  isPlaying = !isPlaying;
  clearInterval(timer);
  renderTransport();
  if (isPlaying) {
    tick();
    timer = setInterval(tick, 60000 / Number(tempo.value) / 4);
  }
}

function loadPreset(index) {
  const preset = presets[index];
  selectedChannel = index;
  tempo.value = preset.tempo;
  swing.value = preset.swing;
  volume.value = preset.volume;
  tracks[0].on = [...preset.lead];
  tracks[1].on = [...preset.bass];
  tracks.forEach((track) => {
    if (track.id === 'kick') track.on = index === 1 ? [0, 3, 6, 8, 10, 12, 14] : [0, 4, 8, 12];
    if (track.id === 'snare') track.on = index === 4 ? [4, 12] : [];
    if (track.id === 'clap') track.on = index === 2 ? [3, 7, 11, 15] : [4, 12];
  });
  tracks[0].pitches = tracks[0].on.map((_, i) => notes[(i + index) % notes.length]);
  tracks[1].pitches = tracks[1].on.map((_, i) => notes[(i + 2 + index) % notes.length]);
  document.querySelectorAll('.channel').forEach((button, i) => button.classList.toggle('active', i === index));
  setSliderValues();
  buildSequencer();
  buildGlyphField();
}

function clearPattern() {
  tracks.forEach((track) => { track.on = []; track.pitches = []; });
  buildSequencer();
}

function randomize() {
  tracks.forEach((track, row) => {
    track.on = [];
    for (let col = 0; col < 16; col += 1) {
      const chance = row < 2 ? .3 : row === 5 ? .72 : row === 2 ? .38 : .13;
      if (Math.random() < chance) track.on.push(col);
    }
    if (track.kind === 'pitch') {
      track.pitches = track.on.map(() => notes[Math.floor(Math.random() * notes.length)]);
    }
  });
  tempo.value = 140;
  swing.value = 8;
  volume.value = 35;
  setSliderValues();
  buildSequencer();
  buildGlyphField();
}

function wireEvents() {
  qs('#playButton').addEventListener('click', togglePlayback);
  qs('#clearButton').addEventListener('click', clearPattern);
  qs('#randomButton').addEventListener('click', randomize);
  document.querySelectorAll('.channel').forEach((button) => button.addEventListener('click', () => loadPreset(Number(button.dataset.channel))));
  [tempo, swing, volume].forEach((input) => input.addEventListener('input', () => {
    setSliderValues();
    if (isPlaying) { clearInterval(timer); timer = setInterval(tick, 60000 / Number(tempo.value) / 4); }
  }));
  qs('#leadButton').addEventListener('click', () => { selectedVoice = 'lead'; qs('#leadButton').classList.add('active'); qs('#bassButton').classList.remove('active'); });
  qs('#bassButton').addEventListener('click', () => { selectedVoice = 'bass'; qs('#bassButton').classList.add('active'); qs('#leadButton').classList.remove('active'); });
  qs('#loopButton').addEventListener('click', () => { loopRecording = !loopRecording; qs('#loopButton').classList.toggle('recording', loopRecording); });
  qs('#fullscreenButton').addEventListener('click', () => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen?.();
    else document.exitFullscreen?.();
  });
  document.addEventListener('keydown', (event) => {
    if (event.code === 'Space' && event.target.tagName !== 'INPUT') { event.preventDefault(); togglePlayback(); }
    const keyIndex = keyHints.indexOf(event.key.toUpperCase());
    if (keyIndex >= 0 && event.target.tagName !== 'INPUT') cyclePitch(selectedVoice === 'lead' ? 0 : 1, keyIndex % 16);
  });
}

buildLogo();
buildGlyphField();
setSliderValues();
buildSequencer();
qs('#keyRow').innerHTML = keys.map((key, index) => `<button class="key"><span>${key}</span><small>${keyHints[index]}</small></button>`).join('');
wireEvents();
