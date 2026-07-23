const channelPresets = [
  {
    name: 'CH·10 DARKROOM',
    tempo: 132, swing: 0, volume: 90,
    pattern: [
      [null,null,'G',null,null,null,'D',null,null,null,null,null,'C+',null,null,'A+'],
      ['A',null,null,'A',null,null,'A',null,'A',null,null,'A',null,null,'E',null],
      ['■',null,null,null,'■',null,null,null,'■',null,null,null,'■',null,null,null],
      [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
      [null,null,null,null,'■',null,null,null,null,null,null,null,'■',null,null,null],
      ['■','■',null,'■','■','■',null,'■','■','■',null,'■','■','■',null,'■'],
      [null,null,'■',null,null,null,'■',null,null,null,'■',null,null,null,'■',null],
      [null,null,null,null,null,null,null,'■',null,null,null,null,null,null,null,'■'],
      [null,null,null,null,null,null,null,null,null,null,null,null,null,null,'■',null],
      [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
      ['■',null,'■',null,'■',null,'■',null,'■',null,'■',null,'■',null,'■',null],
      ['■',null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
    ],
  },
  {
    name: 'CH·20 GREASE',
    tempo: 132, swing: 0, volume: 35,
    pattern: [
      [null,null,'G',null,null,null,'D',null,null,null,null,null,'C+',null,null,'A+'],
      ['A',null,null,'A',null,null,'A',null,'A',null,null,'A',null,null,'E',null],
      ['■',null,null,null,null,null,null,null,'■',null,null,null,'■',null,null,null],
      [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
      [null,null,null,null,'■',null,null,null,null,null,null,null,'■',null,null,null],
      ['■','■',null,'■','■','■',null,'■','■','■',null,'■','■','■',null,'■'],
      [null,null,'■',null,null,null,'■',null,null,null,'■',null,null,null,'■',null],
      [null,null,null,null,null,null,null,'■',null,null,null,null,null,null,null,'■'],
      [null,null,null,null,null,null,null,null,null,null,null,null,null,null,'■',null],
      [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
      ['■',null,'■',null,'■',null,'■',null,'■',null,'■',null,'■',null,'■',null],
      ['■',null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
    ],
  },
  {
    name: 'CH·30 BACKSTREET',
    tempo: 132, swing: 0, volume: 35,
    pattern: [
      [null,null,null,null,'C+',null,null,null,null,null,'A',null,'D','D',null,'E'],
      ['A','C',null,null,'D','C','E',null,'E','G','C','E',null,null,null,null],
      ['■',null,'■','■',null,'■',null,null,'■','■','■','■',null,null,'■','■'],
      [null,null,null,null,null,'■',null,null,null,null,null,null,null,null,null,null],
      [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,'■'],
      [null,'■',null,'■','■','■','■','■',null,'■','■','■',null,'■',null,'■'],
      [null,null,null,null,null,null,'■',null,null,null,null,null,null,null,null,'■'],
      [null,null,null,null,'■',null,null,'■',null,'■',null,null,null,'■',null,null],
      [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
      [null,'■',null,null,null,null,'■',null,null,null,null,null,null,null,null,'■'],
      [null,'■',null,'■',null,'■',null,'■','■',null,'■','■',null,'■',null,'■'],
      [null,null,null,null,null,null,null,null,'■',null,null,'■',null,null,null,null],
    ],
  },
  {
    name: 'CH·40 DAYLIGHT',
    tempo: 140, swing: 8, volume: 35,
    pattern: [
      [null,'C+',null,null,null,null,null,'G','C+','C','A',null,null,null,'G',null],
      ['C+',null,'C',null,null,null,'E',null,'C','G',null,'E',null,null,'A','C'],
      ['■',null,null,null,null,'■',null,null,'■',null,null,null,'■',null,null,'■'],
      ['■',null,null,'■',null,null,null,null,'■',null,'■',null,null,'■','■',null],
      [null,null,'■','■',null,null,null,null,null,null,null,null,null,null,null,null],
      ['■','■',null,null,null,'■',null,'■',null,null,'■',null,'■',null,'■','■'],
      [null,null,null,null,null,null,null,'■',null,null,null,null,null,null,null,null],
      [null,null,null,null,null,null,null,null,null,null,null,null,null,'■',null,null],
      [null,null,null,null,null,'■',null,null,null,null,null,null,'■',null,'■','■'],
      [null,null,null,null,null,null,null,null,null,null,'■',null,null,null,null,null],
      [null,null,null,null,null,null,'■',null,'■','■','■',null,null,'■',null,null],
      [null,null,null,null,null,null,null,null,null,null,null,'■',null,null,null,null],
    ],
  },
  {
    name: 'CH·50 ACID',
    tempo: 128, swing: 12, volume: 35,
    pattern: [
      [null,'E',null,'G','C+','G','A',null,'A',null,'A',null,'D','D',null,'E'],
      ['A','C',null,null,'D','C','E',null,'E','G','C','E',null,null,null,null],
      ['■',null,'■','■',null,'■',null,null,'■','■','■','■','■',null,'■','■'],
      [null,null,null,null,null,'■',null,null,null,null,null,null,null,null,null,null],
      [null,null,null,null,null,null,null,null,null,null,null,null,'■',null,null,'■'],
      [null,'■',null,'■','■','■','■','■',null,'■','■','■','■','■',null,'■'],
      [null,null,null,null,null,null,'■',null,null,null,null,null,null,null,null,'■'],
      [null,null,null,null,'■',null,null,'■',null,'■',null,null,null,'■',null,null],
      [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
      [null,'■',null,null,null,null,'■',null,null,null,null,null,null,null,null,'■'],
      [null,'■',null,'■',null,'■',null,'■','■',null,'■','■',null,'■',null,'■'],
      [null,null,null,null,null,null,null,null,'■',null,null,'■','■',null,null,null],
    ],
  },
];

const tracks = ['Lead','Bass','Kick','Snare','Clap','Hi-hat','Open hat','Rimshot','Tom','Cowbell','Shaker','Crash'];
const noteOptions = ['A','C','D','E','G','A+','C+'];
const noteKeys = ['A','S','D','F','G','H','J'];
const drumTracks = new Set([2,3,4,5,6,7,8,9,10,11]);
const asciiPal = ['·','-','+','/','(',')','*','▲','K','#','●'];

let currentPreset = 0;
let currentStep = -1;
let playing = false;
let leadIndex = 0;
let bassIndex = 0;
let selectedVoice = 'Lead';
let loopRec = false;
let timer = null;
let asciiTick = 0;
const muted = Array(tracks.length).fill(false);
const pattern = structuredClone(channelPresets[0].pattern);

const el = {
  transport: document.getElementById('transport'),
  tempo: document.getElementById('tempo'),
  swing: document.getElementById('swing'),
  volume: document.getElementById('volume'),
  tempoValue: document.getElementById('tempoValue'),
  swingValue: document.getElementById('swingValue'),
  volumeValue: document.getElementById('volumeValue'),
  channelButtons: document.getElementById('channelButtons'),
  clearBtn: document.getElementById('clearBtn'),
  randomBtn: document.getElementById('randomBtn'),
  ascii: document.getElementById('ascii'),
  sequencer: document.getElementById('sequencer'),
  loopBtn: document.getElementById('loopBtn'),
  leadTab: document.getElementById('leadTab'),
  bassTab: document.getElementById('bassTab'),
  noteRow: document.getElementById('noteRow'),
};

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let master = audioCtx.createGain();
master.gain.value = 0.55;
master.connect(audioCtx.destination);

function clonePattern(src) { return src.map(row => [...row]); }
function noteToFreq(note, root = 220) {
  const map = { A:0, C:3, D:5, E:7, G:10, 'A+':12, 'C+':15 };
  return root * 2 ** ((map[note] ?? 0) / 12);
}
function setPreset(index) {
  currentPreset = index;
  const preset = channelPresets[index];
  for (let i = 0; i < pattern.length; i++) pattern[i] = [...preset.pattern[i]];
  el.tempo.value = preset.tempo;
  el.swing.value = preset.swing;
  el.volume.value = preset.volume;
  syncSliders();
  renderChannels();
  renderGrid();
}
function syncSliders() {
  el.tempoValue.textContent = el.tempo.value;
  el.swingValue.textContent = `${el.swing.value}%`;
  el.volumeValue.textContent = el.volume.value;
  master.gain.value = Number(el.volume.value) / 100 * 0.6;
}
function renderChannels() {
  el.channelButtons.innerHTML = '';
  channelPresets.forEach((preset, i) => {
    const btn = document.createElement('button');
    btn.className = `channel-btn ${i===currentPreset?'active':''}`;
    btn.textContent = preset.name;
    btn.onclick = () => setPreset(i);
    el.channelButtons.appendChild(btn);
  });
}
function renderGrid() {
  el.sequencer.innerHTML = '';
  const blank = document.createElement('div');
  el.sequencer.appendChild(blank);
  for (let c = 0; c < 16; c++) {
    const n = document.createElement('div');
    n.className = `step-num ${c===currentStep?'current':''}`;
    n.textContent = c + 1;
    el.sequencer.appendChild(n);
  }
  tracks.forEach((track, r) => {
    const label = document.createElement('button');
    label.className = `track-label ${muted[r] ? 'muted' : ''}`;
    label.innerHTML = `<span class="swatch"></span>CH·${String(r+1).padStart(2,'0')} ${track}`;
    label.onclick = () => { muted[r] = !muted[r]; renderGrid(); };
    el.sequencer.appendChild(label);
    for (let c = 0; c < 16; c++) {
      const cell = document.createElement('button');
      const value = pattern[r][c];
      cell.className = `cell ${value ? 'on' : ''} ${c===currentStep ? 'current' : ''}`;
      cell.textContent = value && !drumTracks.has(r) ? value : '';
      cell.oncontextmenu = (e) => {
        e.preventDefault();
        if (r > 1) return;
        cyclePitch(r, c, -1);
      };
      cell.onclick = () => toggleCell(r, c);
      el.sequencer.appendChild(cell);
    }
  });
}
function renderNotes() {
  el.noteRow.innerHTML = '';
  noteOptions.forEach((note, i) => {
    const btn = document.createElement('button');
    btn.className = `note-btn ${currentNoteIndex()===i?'active':''}`;
    btn.innerHTML = `${note}<span>${noteKeys[i]}</span>`;
    btn.onclick = () => {
      setCurrentNoteIndex(i);
      renderNotes();
    };
    el.noteRow.appendChild(btn);
  });
  el.leadTab.classList.toggle('active', selectedVoice === 'Lead');
  el.bassTab.classList.toggle('active', selectedVoice === 'Bass');
}
function currentNoteIndex() { return selectedVoice === 'Lead' ? leadIndex : bassIndex; }
function setCurrentNoteIndex(i) { selectedVoice === 'Lead' ? leadIndex = i : bassIndex = i; }
function toggleCell(r, c) {
  if (r <= 1) {
    const current = pattern[r][c];
    if (current) cyclePitch(r, c, 1);
    else pattern[r][c] = noteOptions[r === 0 ? leadIndex : bassIndex];
  } else {
    pattern[r][c] = pattern[r][c] ? null : '■';
  }
  renderGrid();
}
function cyclePitch(r, c, dir) {
  const current = pattern[r][c];
  const opts = noteOptions;
  const idx = Math.max(0, opts.indexOf(current));
  pattern[r][c] = opts[(idx + dir + opts.length) % opts.length];
  renderGrid();
}
function clearPattern() {
  for (let r = 0; r < pattern.length; r++) {
    for (let c = 0; c < 16; c++) pattern[r][c] = null;
  }
  renderGrid();
}
function randomizePattern() {
  const melodicDensity = [0.22, 0.35];
  for (let c = 0; c < 16; c++) {
    pattern[0][c] = Math.random() < melodicDensity[0] ? noteOptions[(leadIndex + c + (Math.random()*3|0)) % noteOptions.length] : null;
    pattern[1][c] = Math.random() < melodicDensity[1] ? noteOptions[(bassIndex + c + (Math.random()*2|0)) % noteOptions.length] : null;
  }
  for (let r = 2; r < 12; r++) {
    for (let c = 0; c < 16; c++) {
      const p = [0.3,0.18,0.22,0.55,0.2,0.18,0.1,0.06,0.25,0.12][r-2] ?? 0.2;
      pattern[r][c] = Math.random() < p ? '■' : null;
    }
  }
  renderGrid();
}
function updateAscii() {
  const width = 44, height = 15;
  const centerY = 7;
  let out = '';
  for (let y = 0; y < height; y++) {
    let line = '';
    for (let x = 0; x < width; x++) {
      const dx = x / width;
      const wave = Math.sin((x + asciiTick * 0.9) * 0.34) * 2.5 + Math.cos((x * 0.45) + asciiTick * 0.12) * 1.8;
      const yBand = Math.abs(y - (centerY + wave));
      let ch = (x + y + asciiTick) % 7 === 0 ? '+' : ' ';
      if (yBand < 0.6) ch = '/';
      else if (yBand < 1.2) ch = '(';
      else if (yBand < 1.8) ch = ')';
      if (currentStep >= 0 && Math.abs(x - ((currentStep/15) * (width-1))) < 1.5) ch = y % 3 === 0 ? '▲' : '*';
      if (pattern[0][currentStep] && x > width * 0.72 && y > 1 && y < 13) {
        const heart = [' **K K▲▲▲',' ▲KK##▲K ',' ▲K#●●K▲ ',' K#●●●K▲ ',' KK●●#▲▲ ',' KK#KK** ',' ▲▲▲**)('];
        const row = heart[y-2];
        if (row && row[x - 31]) ch = row[x - 31] === ' ' ? ch : row[x - 31];
      }
      if (pattern[1][currentStep] && x < 14 && y > 2 && y < 13) {
        const bassBlob = ['  * )',' *▲**','▲KKK▲','▲K##K','**▲**',' * )'];
        const row = bassBlob[y-4];
        if (row && row[x - 4]) ch = row[x - 4] === ' ' ? ch : row[x - 4];
      }
      if (ch === '+') line += `<span class="c1">+</span>`;
      else if (ch === '*') line += `<span class="c2">*</span>`;
      else if (ch === '▲') line += `<span class="c3">▲</span>`;
      else if (ch === 'K' || ch === '#') line += `<span class="c4">${ch}</span>`;
      else if (ch === '●') line += `<span class="c5">●</span>`;
      else line += ch;
    }
    out += line + '\n';
  }
  el.ascii.innerHTML = out;
}
function tick() {
  const tempo = Number(el.tempo.value);
  const swing = Number(el.swing.value) / 100;
  currentStep = (currentStep + 1) % 16;
  renderGrid();
  updateAscii();
  triggerStep(currentStep);
  const baseMs = (60 / tempo / 4) * 1000;
  const offset = currentStep % 2 ? baseMs * swing * 0.33 : -baseMs * swing * 0.1;
  timer = setTimeout(tick, Math.max(40, baseMs + offset));
}
function playSynth(freq, length = 0.18, type = 'square', gainAmt = 0.15, slide = 0) {
  const now = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  const filter = audioCtx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = type === 'sawtooth' ? 900 : 1400;
  osc.type = type;
  osc.frequency.setValueAtTime(freq, now);
  if (slide) osc.frequency.exponentialRampToValueAtTime(freq * slide, now + length);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(gainAmt, now + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + length);
  osc.connect(filter); filter.connect(gain); gain.connect(master);
  osc.start(now); osc.stop(now + length + 0.02);
}
function noiseBurst(length = 0.08, filterType = 'bandpass', frequency = 1800, gainAmt = 0.08) {
  const now = audioCtx.currentTime;
  const buffer = audioCtx.createBuffer(1, audioCtx.sampleRate * length, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const src = audioCtx.createBufferSource();
  const filter = audioCtx.createBiquadFilter();
  const gain = audioCtx.createGain();
  filter.type = filterType; filter.frequency.value = frequency;
  gain.gain.setValueAtTime(gainAmt, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + length);
  src.buffer = buffer; src.connect(filter); filter.connect(gain); gain.connect(master);
  src.start(now);
}
function kick() { playSynth(60, 0.18, 'sine', 0.3, 0.35); }
function snare() { noiseBurst(0.12, 'highpass', 1600, 0.12); playSynth(180, 0.06, 'triangle', 0.06, 0.8); }
function clap() { [0,0.015,0.03].forEach(d=>setTimeout(()=>noiseBurst(0.08,'bandpass',2200,0.08),d*1000)); }
function hat(open=false) { noiseBurst(open?0.22:0.04,'highpass',open?7000:9000,open?0.08:0.05); }
function rim() { playSynth(520, 0.05, 'square', 0.04, 1.1); }
function tom() { playSynth(140, 0.12, 'sine', 0.12, 0.8); }
function cowbell() { playSynth(580, 0.08, 'square', 0.05, 1.2); playSynth(820, 0.08, 'square', 0.04, 1.1); }
function shaker() { noiseBurst(0.05, 'highpass', 6000, 0.04); }
function crash() { noiseBurst(0.5, 'bandpass', 4200, 0.08); }
function triggerStep(step) {
  if (muted[0] || !pattern[0][step]) {} else playSynth(noteToFreq(pattern[0][step], 330), 0.16, 'square', 0.09, 1.01);
  if (muted[1] || !pattern[1][step]) {} else playSynth(noteToFreq(pattern[1][step], 110), 0.22, 'sawtooth', 0.11, 0.98);
  if (!muted[2] && pattern[2][step]) kick();
  if (!muted[3] && pattern[3][step]) snare();
  if (!muted[4] && pattern[4][step]) clap();
  if (!muted[5] && pattern[5][step]) hat(false);
  if (!muted[6] && pattern[6][step]) hat(true);
  if (!muted[7] && pattern[7][step]) rim();
  if (!muted[8] && pattern[8][step]) tom();
  if (!muted[9] && pattern[9][step]) cowbell();
  if (!muted[10] && pattern[10][step]) shaker();
  if (!muted[11] && pattern[11][step]) crash();
}
function setPlaying(next) {
  playing = next;
  el.transport.textContent = playing ? '■ STOP' : '▶ PLAY';
  el.transport.classList.toggle('playing', playing);
  if (playing) {
    audioCtx.resume();
    clearTimeout(timer);
    tick();
  } else {
    clearTimeout(timer);
    currentStep = -1;
    renderGrid();
    updateAscii();
  }
}

el.transport.onclick = () => setPlaying(!playing);
el.tempo.oninput = syncSliders;
el.swing.oninput = syncSliders;
el.volume.oninput = syncSliders;
el.clearBtn.onclick = clearPattern;
el.randomBtn.onclick = randomizePattern;
el.loopBtn.onclick = () => { loopRec = !loopRec; el.loopBtn.classList.toggle('toggled', loopRec); };
el.leadTab.onclick = () => { selectedVoice = 'Lead'; renderNotes(); };
el.bassTab.onclick = () => { selectedVoice = 'Bass'; renderNotes(); };
document.addEventListener('keydown', (e) => {
  if (e.code === 'Space') { e.preventDefault(); setPlaying(!playing); }
  const idx = noteKeys.indexOf(e.key.toUpperCase());
  if (idx >= 0) { setCurrentNoteIndex(idx); renderNotes(); }
});

const style = document.createElement('style');
style.textContent = `.ascii-board .c1{color:#143c86}.ascii-board .c2{color:#5f9ef6}.ascii-board .c3{color:#58a9ff}.ascii-board .c4{color:#4f90f0}.ascii-board .c5{color:#f7f4f0}`;
document.head.appendChild(style);

syncSliders();
renderChannels();
renderGrid();
renderNotes();
updateAscii();
