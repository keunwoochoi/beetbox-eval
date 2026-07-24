/* ==================================================================
   BEETBOX — beat sequencing · channel desk.
   16-step sequencer, 12 channels, two melodic voices, WebAudio synth
   and a reactive ASCII channel-scope.
   ================================================================== */

'use strict';

/* ------------------------------------------------------------ model */

const STEPS = 16;

const TRACKS = [
  { id: 'lead',  name: 'Lead',     kind: 'note' },
  { id: 'bass',  name: 'Bass',     kind: 'note' },
  { id: 'kick',  name: 'Kick',     kind: 'drum' },
  { id: 'snare', name: 'Snare',    kind: 'drum' },
  { id: 'clap',  name: 'Clap',     kind: 'drum' },
  { id: 'hat',   name: 'Hi-hat',   kind: 'drum' },
  { id: 'open',  name: 'Open hat', kind: 'drum' },
  { id: 'rim',   name: 'Rimshot',  kind: 'drum' },
  { id: 'tom',   name: 'Tom',      kind: 'drum' },
  { id: 'cow',   name: 'Cowbell',  kind: 'drum' },
  { id: 'shak',  name: 'Shaker',   kind: 'drum' },
  { id: 'crash', name: 'Crash',    kind: 'drum' }
];

/* A minor pentatonic, one octave and a bit.  "+" marks the upper octave. */
const NOTES = [
  { label: 'A',  sup: '',  freq: 220.00, key: 'a' },
  { label: 'C',  sup: '',  freq: 261.63, key: 's' },
  { label: 'D',  sup: '',  freq: 293.66, key: 'd' },
  { label: 'E',  sup: '',  freq: 329.63, key: 'f' },
  { label: 'G',  sup: '',  freq: 392.00, key: 'g' },
  { label: 'A',  sup: '+', freq: 440.00, key: 'h' },
  { label: 'C',  sup: '+', freq: 523.25, key: 'j' }
];

const A = 0, C = 1, D = 2, E = 3, G = 4, Ah = 5, Ch = 6;

/* `.` = empty, digits index into NOTES for the two melodic rows. */
function drum(s) {
  return s.split('').map(c => (c === 'x' ? 1 : 0));
}
function line(a) {
  const out = new Array(STEPS).fill(null);
  for (const [i, n] of a) out[i - 1] = n;
  return out;
}
function fill(n) { return new Array(STEPS).fill(n); }

const PRESETS = [
  {
    id: '10', name: 'DARKROOM', tempo: 132, swing: 0,
    p: {
      lead:  line([[3, G], [7, D], [13, Ch], [16, Ah]]),
      bass:  line([[1, A], [4, A], [7, A], [9, A], [12, A], [15, E]]),
      kick:  drum('x...x...x...x...'),
      snare: drum('................'),
      clap:  drum('....x.......x...'),
      hat:   drum('xx.xxx.xxx.xxx.x'),
      open:  drum('..x...x...x...x.'),
      rim:   drum('.......x.......x'),
      tom:   drum('..............x.'),
      cow:   drum('................'),
      shak:  drum('x.x.x.x.x.x.x.x.'),
      crash: drum('x...............')
    }
  },
  {
    id: '20', name: 'GREASE', tempo: 98, swing: 44,
    p: {
      lead:  line([[1, E], [4, G], [7, E], [8, D], [11, C], [14, D], [16, E]]),
      bass:  line([[1, A], [3, A], [6, C], [8, A], [9, A], [11, A], [14, D], [16, C]]),
      kick:  drum('x..x..x...x..x..'),
      snare: drum('....x.......x..x'),
      clap:  drum('................'),
      hat:   drum('x.xxx.xxx.xxx.xx'),
      open:  drum('......x.......x.'),
      rim:   drum('..x........x....'),
      tom:   drum('...........x....'),
      cow:   drum('....x...x...x...'),
      shak:  drum('.x.x.x.x.x.x.x.x'),
      crash: drum('x...............')
    }
  },
  {
    id: '30', name: 'BACKSTREET', tempo: 88, swing: 26,
    p: {
      lead:  line([[2, C], [5, D], [9, E], [12, C], [15, A]]),
      bass:  line([[1, A], [4, A], [7, G], [9, A], [11, C], [14, A]]),
      kick:  drum('x.....x.x.....x.'),
      snare: drum('....x.......x...'),
      clap:  drum('....x.......x...'),
      hat:   drum('x.x.x.x.x.x.x.x.'),
      open:  drum('.......x.......x'),
      rim:   drum('..............x.'),
      tom:   drum('.........x......'),
      cow:   drum('................'),
      shak:  drum('..x...x...x...x.'),
      crash: drum('x...............')
    }
  },
  {
    id: '40', name: 'DAYLIGHT', tempo: 124, swing: 6,
    p: {
      lead:  line([[1, Ch], [3, Ah], [5, G], [8, E], [9, G], [11, Ah], [13, Ch], [16, G]]),
      bass:  line([[1, A], [3, A], [5, E], [7, E], [9, C], [11, C], [13, D], [15, D]]),
      kick:  drum('x...x...x...x...'),
      snare: drum('....x.......x...'),
      clap:  drum('....x.......x...'),
      hat:   drum('..x...x...x...x.'),
      open:  drum('..x...x...x...x.'),
      rim:   drum('................'),
      tom:   drum('................'),
      cow:   drum('........x.......'),
      shak:  drum('xxxxxxxxxxxxxxxx'),
      crash: drum('x.......x.......')
    }
  },
  {
    id: '50', name: 'ACID', tempo: 140, swing: 8,
    p: {
      lead:  line([[1, A], [3, E], [5, A], [7, Ah], [9, A], [11, E], [13, Ch], [15, Ah], [16, E]]),
      bass:  [A, A, D, A, A, A, D, A, A, A, D, A, A, Ch, D, A],
      kick:  drum('x...x...x...x...'),
      snare: drum('....x.......x...'),
      clap:  drum('............x...'),
      hat:   drum('.x.x.x.x.x.x.x.x'),
      open:  drum('..x.......x.....'),
      rim:   drum('................'),
      tom:   drum('..........x...x.'),
      cow:   drum('................'),
      shak:  drum('................'),
      crash: drum('........x.......')
    }
  }
];

const state = {
  pattern: {},
  muted: {},
  playing: false,
  tempo: 132,
  swing: 0,
  volume: 90,
  preset: 0,
  rec: false,
  target: 'lead',
  step: -1
};

function loadPreset(i) {
  const pre = PRESETS[i];
  for (const t of TRACKS) {
    const src = pre.p[t.id];
    state.pattern[t.id] = src ? src.slice() : (t.kind === 'note' ? fill(null) : fill(0));
  }
  state.tempo = pre.tempo;
  state.swing = pre.swing;
  state.preset = i;
}

function clearPattern() {
  for (const t of TRACKS) {
    state.pattern[t.id] = t.kind === 'note' ? fill(null) : fill(0);
  }
  state.preset = -1;
}

function randomPattern() {
  const dens = {
    kick: 0.42, snare: 0.16, clap: 0.14, hat: 0.55, open: 0.14,
    rim: 0.14, tom: 0.12, cow: 0.14, shak: 0.34, crash: 0.1
  };
  for (const t of TRACKS) {
    if (t.kind === 'note') {
      const row = fill(null);
      const chance = t.id === 'bass' ? 0.5 : 0.36;
      for (let i = 0; i < STEPS; i++) {
        if (Math.random() < chance) row[i] = Math.floor(Math.random() * NOTES.length);
      }
      state.pattern[t.id] = row;
    } else {
      const d = dens[t.id] ?? 0.2;
      state.pattern[t.id] = Array.from({ length: STEPS }, () => (Math.random() < d ? 1 : 0));
    }
  }
  state.preset = -1;
}

/* ------------------------------------------------------------ audio */

let ac = null;
let master = null;
let noiseBuf = null;

function audio() {
  if (ac) return ac;
  ac = new (window.AudioContext || window.webkitAudioContext)();
  master = ac.createGain();
  master.gain.value = gainFor(state.volume);
  const comp = ac.createDynamicsCompressor();
  comp.threshold.value = -14;
  comp.knee.value = 20;
  comp.ratio.value = 8;
  comp.attack.value = 0.003;
  comp.release.value = 0.18;
  master.connect(comp).connect(ac.destination);

  const len = Math.floor(ac.sampleRate * 2);
  noiseBuf = ac.createBuffer(1, len, ac.sampleRate);
  const ch = noiseBuf.getChannelData(0);
  for (let i = 0; i < len; i++) ch[i] = Math.random() * 2 - 1;
  return ac;
}

function gainFor(v) { return Math.pow(v / 100, 1.6) * 0.85; }

function noiseSrc() {
  const s = ac.createBufferSource();
  s.buffer = noiseBuf;
  s.loop = true;
  s.playbackRate.value = 0.8 + Math.random() * 0.4;
  return s;
}

function env(node, t, peak, attack, decay) {
  const g = node.gain;
  g.setValueAtTime(0.0001, t);
  g.exponentialRampToValueAtTime(Math.max(peak, 0.0002), t + attack);
  g.exponentialRampToValueAtTime(0.0001, t + attack + decay);
}

const VOICES = {
  kick(t) {
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(155, t);
    o.frequency.exponentialRampToValueAtTime(44, t + 0.11);
    env(g, t, 1.0, 0.002, 0.36);
    o.connect(g).connect(master);
    o.start(t); o.stop(t + 0.45);

    const n = noiseSrc(), hp = ac.createBiquadFilter(), ng = ac.createGain();
    hp.type = 'highpass'; hp.frequency.value = 1200;
    env(ng, t, 0.16, 0.001, 0.02);
    n.connect(hp).connect(ng).connect(master);
    n.start(t); n.stop(t + 0.06);
  },
  snare(t) {
    const n = noiseSrc(), hp = ac.createBiquadFilter(), g = ac.createGain();
    hp.type = 'highpass'; hp.frequency.value = 1500;
    env(g, t, 0.55, 0.002, 0.16);
    n.connect(hp).connect(g).connect(master);
    n.start(t); n.stop(t + 0.24);

    const o = ac.createOscillator(), og = ac.createGain();
    o.type = 'triangle';
    o.frequency.setValueAtTime(196, t);
    o.frequency.exponentialRampToValueAtTime(122, t + 0.1);
    env(og, t, 0.34, 0.002, 0.11);
    o.connect(og).connect(master);
    o.start(t); o.stop(t + 0.16);
  },
  clap(t) {
    const bp = ac.createBiquadFilter();
    bp.type = 'bandpass'; bp.frequency.value = 1250; bp.Q.value = 1.1;
    const out = ac.createGain(); out.gain.value = 0.6;
    bp.connect(out).connect(master);
    for (let i = 0; i < 3; i++) {
      const n = noiseSrc(), g = ac.createGain();
      env(g, t + i * 0.011, 0.55, 0.001, 0.016);
      n.connect(g).connect(bp);
      n.start(t + i * 0.011); n.stop(t + i * 0.011 + 0.04);
    }
    const n = noiseSrc(), g = ac.createGain();
    env(g, t + 0.028, 0.4, 0.003, 0.14);
    n.connect(g).connect(bp);
    n.start(t + 0.028); n.stop(t + 0.22);
  },
  hat(t) { hihat(t, 0.05, 0.3); },
  open(t) { hihat(t, 0.32, 0.26); },
  rim(t) {
    const o = ac.createOscillator(), g = ac.createGain(), bp = ac.createBiquadFilter();
    bp.type = 'bandpass'; bp.frequency.value = 1750; bp.Q.value = 4;
    o.type = 'square'; o.frequency.value = 420;
    env(g, t, 0.5, 0.001, 0.035);
    o.connect(bp).connect(g).connect(master);
    o.start(t); o.stop(t + 0.06);
    const n = noiseSrc(), ng = ac.createGain(), hp = ac.createBiquadFilter();
    hp.type = 'highpass'; hp.frequency.value = 2600;
    env(ng, t, 0.24, 0.001, 0.03);
    n.connect(hp).connect(ng).connect(master);
    n.start(t); n.stop(t + 0.05);
  },
  tom(t) {
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(240, t);
    o.frequency.exponentialRampToValueAtTime(96, t + 0.24);
    env(g, t, 0.68, 0.003, 0.3);
    o.connect(g).connect(master);
    o.start(t); o.stop(t + 0.4);
  },
  cow(t) {
    const bp = ac.createBiquadFilter();
    bp.type = 'bandpass'; bp.frequency.value = 2200; bp.Q.value = 2;
    const g = ac.createGain();
    env(g, t, 0.3, 0.002, 0.26);
    bp.connect(g).connect(master);
    for (const f of [542, 812]) {
      const o = ac.createOscillator();
      o.type = 'square'; o.frequency.value = f;
      o.connect(bp);
      o.start(t); o.stop(t + 0.3);
    }
  },
  shak(t) {
    const n = noiseSrc(), bp = ac.createBiquadFilter(), g = ac.createGain();
    bp.type = 'bandpass'; bp.frequency.value = 7200; bp.Q.value = 1.2;
    env(g, t, 0.26, 0.006, 0.06);
    n.connect(bp).connect(g).connect(master);
    n.start(t); n.stop(t + 0.12);
  },
  crash(t) {
    const n = noiseSrc(), hp = ac.createBiquadFilter(), g = ac.createGain();
    hp.type = 'highpass'; hp.frequency.value = 5200;
    env(g, t, 0.34, 0.002, 1.3);
    n.connect(hp).connect(g).connect(master);
    n.start(t); n.stop(t + 1.45);
  }
};

function hihat(t, decay, peak) {
  const n = noiseSrc(), hp = ac.createBiquadFilter(), g = ac.createGain();
  hp.type = 'highpass'; hp.frequency.value = 8200;
  const bp = ac.createBiquadFilter();
  bp.type = 'bandpass'; bp.frequency.value = 10500; bp.Q.value = 0.8;
  env(g, t, peak, 0.001, decay);
  n.connect(hp).connect(bp).connect(g).connect(master);
  n.start(t); n.stop(t + decay + 0.08);
}

function playLead(t, freq) {
  const g = ac.createGain(), f = ac.createBiquadFilter();
  f.type = 'lowpass'; f.Q.value = 7;
  f.frequency.setValueAtTime(3400, t);
  f.frequency.exponentialRampToValueAtTime(760, t + 0.24);
  env(g, t, 0.2, 0.006, 0.26);
  f.connect(g).connect(master);
  for (const [type, det, lvl] of [['square', 0, 1], ['sawtooth', 7, 0.5]]) {
    const o = ac.createOscillator(), og = ac.createGain();
    o.type = type; o.frequency.value = freq; o.detune.value = det;
    og.gain.value = lvl;
    o.connect(og).connect(f);
    o.start(t); o.stop(t + 0.4);
  }
}

function playBass(t, freq) {
  const g = ac.createGain(), f = ac.createBiquadFilter();
  f.type = 'lowpass'; f.Q.value = 9;
  f.frequency.setValueAtTime(1400, t);
  f.frequency.exponentialRampToValueAtTime(240, t + 0.22);
  env(g, t, 0.36, 0.006, 0.26);
  f.connect(g).connect(master);
  const o = ac.createOscillator();
  o.type = 'sawtooth'; o.frequency.value = freq / 2;
  o.connect(f);
  o.start(t); o.stop(t + 0.4);
  const s = ac.createOscillator(), sg = ac.createGain();
  s.type = 'sine'; s.frequency.value = freq / 4;
  sg.gain.value = 0.7;
  s.connect(sg).connect(f);
  s.start(t); s.stop(t + 0.4);
}

function voice(id, t, noteIdx) {
  if (!ac) return;
  if (id === 'lead') { playLead(t, NOTES[noteIdx].freq); return; }
  if (id === 'bass') { playBass(t, NOTES[noteIdx].freq); return; }
  const fn = VOICES[id];
  if (fn) fn(t);
}

/* -------------------------------------------------------- scheduler */

const LOOKAHEAD = 0.12;
const TICK = 22;

let nextTime = 0;
let nextStep = 0;
let timer = null;
const queue = [];

function stepDur() { return 60 / state.tempo / 4; }

function swingOffset(step) {
  return (step % 2 === 1) ? stepDur() * (state.swing / 100) * 0.5 : 0;
}

function schedule() {
  const dur = stepDur();
  while (nextTime < ac.currentTime + LOOKAHEAD) {
    const s = nextStep;
    const at = nextTime + swingOffset(s);
    let hits = 0;
    for (const t of TRACKS) {
      if (state.muted[t.id]) continue;
      const v = state.pattern[t.id][s];
      if (t.kind === 'note') {
        if (v !== null && v !== undefined) { voice(t.id, at, v); hits++; }
      } else if (v) { voice(t.id, at); hits++; }
    }
    queue.push({ step: s, time: at, hits });
    nextStep = (s + 1) % STEPS;
    nextTime += dur;
  }
}

function start() {
  audio();
  if (ac.state === 'suspended') ac.resume();
  state.playing = true;
  nextStep = 0;
  nextTime = ac.currentTime + 0.06;
  queue.length = 0;
  schedule();
  timer = setInterval(schedule, TICK);
  syncTransport();
}

function stop() {
  state.playing = false;
  clearInterval(timer);
  timer = null;
  queue.length = 0;
  state.step = -1;
  paintPlayhead();
  syncTransport();
}

function toggle() { state.playing ? stop() : start(); }

/* ------------------------------------------------------------- view */

const el = {
  logo: document.getElementById('logo'),
  play: document.getElementById('play'),
  onair: document.getElementById('onair'),
  presets: document.getElementById('presets'),
  stepHead: document.getElementById('step-head'),
  rows: document.getElementById('rows'),
  rec: document.getElementById('rec'),
  keys: document.getElementById('keys'),
  field: document.getElementById('field')
};

/* --- 3x5 pixel wordmark ------------------------------------------- */

const FONT = {
  B: ['111', '101', '110', '101', '111'],
  E: ['111', '100', '110', '100', '111'],
  T: ['111', '010', '010', '010', '010'],
  O: ['111', '101', '101', '101', '111'],
  X: ['101', '101', '010', '101', '101']
};

const logoPx = [];
function buildLogo() {
  for (const ch of 'BEETBOX') {
    const gl = document.createElement('div');
    gl.className = 'gl';
    for (const row of FONT[ch]) {
      for (const c of row) {
        const px = document.createElement('i');
        px.className = c === '1' ? 'px' : 'px off';
        gl.appendChild(px);
        if (c === '1') logoPx.push(px);
      }
    }
    el.logo.appendChild(gl);
  }
}

function flickerLogo() {
  for (const px of logoPx) {
    const r = Math.random();
    px.style.opacity = r < 0.09 ? '0.31' : (r < 0.21 ? '0.66' : '1');
  }
}
function steadyLogo() { for (const px of logoPx) px.style.opacity = '1'; }

/* --- presets ------------------------------------------------------ */

function buildPresets() {
  PRESETS.forEach((p, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'preset';
    b.innerHTML = `<i></i><span class="cid">CH&middot;${p.id}</span><span class="pnm">${p.name}</span>`;
    b.addEventListener('click', () => {
      loadPreset(i);
      syncSliders();
      paintCells();
      paintPresets();
    });
    el.presets.appendChild(b);
  });
}

function paintPresets() {
  [...el.presets.children].forEach((b, i) => b.classList.toggle('on', i === state.preset));
}

/* --- sequencer ---------------------------------------------------- */

const cellEls = {};
const rowEls = {};
const numEls = [];

function buildGrid() {
  for (let i = 0; i < STEPS; i++) {
    const n = document.createElement('div');
    n.className = 'snum' + (i % 4 === 0 ? ' acc' : '') + (i % 4 === 0 && i > 0 ? ' beat' : '');
    n.textContent = String(i + 1);
    el.stepHead.appendChild(n);
    numEls.push(n);
  }

  for (const t of TRACKS) {
    const row = document.createElement('div');
    row.className = 'row';

    const nameBtn = document.createElement('button');
    nameBtn.type = 'button';
    nameBtn.className = 'tname';
    const num = String(TRACKS.indexOf(t) + 1).padStart(2, '0');
    nameBtn.innerHTML = `<i class="sq"></i><span class="cid">CH&middot;${num}</span><span class="nm">${t.name}</span>`;
    nameBtn.addEventListener('click', () => {
      state.muted[t.id] = !state.muted[t.id];
      row.classList.toggle('muted', !!state.muted[t.id]);
    });
    row.appendChild(nameBtn);

    const steps = document.createElement('div');
    steps.className = 'steps';
    const cells = [];
    for (let i = 0; i < STEPS; i++) {
      const c = document.createElement('div');
      c.className = 'cell' + (i % 4 === 0 && i > 0 ? ' beat' : '');
      c.addEventListener('mousedown', ev => {
        if (ev.button === 2) return;
        ev.preventDefault();
        hitCell(t, i, 1);
      });
      c.addEventListener('contextmenu', ev => {
        ev.preventDefault();
        hitCell(t, i, -1);
      });
      steps.appendChild(c);
      cells.push(c);
    }
    row.appendChild(steps);
    el.rows.appendChild(row);
    cellEls[t.id] = cells;
    rowEls[t.id] = row;
  }
}

function hitCell(t, i, dir) {
  audio();
  if (ac.state === 'suspended') ac.resume();
  const row = state.pattern[t.id];
  if (t.kind === 'note') {
    const cur = row[i];
    let next;
    if (cur === null || cur === undefined) {
      next = dir > 0 ? 0 : NOTES.length - 1;
    } else {
      next = cur + dir;
      if (next < 0 || next >= NOTES.length) next = null;
    }
    row[i] = next;
    if (next !== null) voice(t.id, ac.currentTime, next);
  } else {
    row[i] = row[i] ? 0 : 1;
    if (row[i]) voice(t.id, ac.currentTime);
  }
  state.preset = -1;
  paintPresets();
  paintCell(t, i);
}

function noteShade(idx) {
  const v = Math.min(255, 180 + 24 * idx);
  return `rgb(${v},${v},${v})`;
}

function paintCell(t, i) {
  const c = cellEls[t.id][i];
  const v = state.pattern[t.id][i];
  if (t.kind === 'note') {
    const has = v !== null && v !== undefined;
    c.classList.toggle('note', has);
    c.classList.toggle('on', has);
    if (has) {
      const n = NOTES[v];
      c.innerHTML = n.label + (n.sup ? '<sup>+</sup>' : '');
      c.style.setProperty('--shade', noteShade(v));
    } else {
      c.textContent = '';
      c.style.removeProperty('--shade');
    }
  } else {
    c.classList.toggle('on', !!v);
  }
  if (i === state.step) c.classList.add('at');
}

function paintCells() {
  for (const t of TRACKS) for (let i = 0; i < STEPS; i++) paintCell(t, i);
  paintPlayhead();
}

let lastStep = -1;
function paintPlayhead() {
  if (lastStep === state.step) return;
  if (lastStep >= 0) {
    for (const t of TRACKS) cellEls[t.id][lastStep].classList.remove('at');
    numEls[lastStep].classList.remove('at');
  }
  if (state.step >= 0) {
    for (const t of TRACKS) cellEls[t.id][state.step].classList.add('at');
    numEls[state.step].classList.add('at');
  }
  lastStep = state.step;
}

/* --- keys --------------------------------------------------------- */

const keyEls = [];
function buildKeys() {
  NOTES.forEach((n, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'key';
    b.innerHTML = `<span class="n">${n.label}${n.sup ? '<sup>+</sup>' : ''}</span><span class="k">${n.key.toUpperCase()}</span>`;
    b.addEventListener('mousedown', ev => { ev.preventDefault(); strike(i); });
    el.keys.appendChild(b);
    keyEls.push(b);
  });
}

function strike(i) {
  audio();
  if (ac.state === 'suspended') ac.resume();
  const target = state.target;
  voice(target, ac.currentTime + 0.001, i);
  flash(i);
  if (state.rec) {
    const s = state.playing && state.step >= 0 ? state.step : 0;
    state.pattern[target][s] = i;
    state.preset = -1;
    paintPresets();
    paintCell(TRACKS.find(t => t.id === target), s);
  }
  bump(0.5);
}

function flash(i) {
  const k = keyEls[i];
  k.classList.add('hit');
  clearTimeout(k._t);
  k._t = setTimeout(() => k.classList.remove('hit'), 110);
}

/* --- transport / sliders ------------------------------------------ */

function syncTransport() {
  el.play.classList.toggle('live', state.playing);
  el.play.querySelector('.ico').innerHTML = state.playing ? '&#9632;' : '&#9654;';
  el.play.querySelector('.txt').textContent = state.playing ? 'STOP' : 'PLAY';
  el.onair.classList.toggle('live', state.playing);
  if (!state.playing) steadyLogo();
}

const sliders = {
  tempo: document.getElementById('tempo'),
  swing: document.getElementById('swing'),
  volume: document.getElementById('volume')
};
const readouts = {
  tempo: document.getElementById('tempo-val'),
  swing: document.getElementById('swing-val'),
  volume: document.getElementById('volume-val')
};

function syncSliders() {
  sliders.tempo.value = state.tempo;
  sliders.swing.value = state.swing;
  sliders.volume.value = state.volume;
  readouts.tempo.textContent = state.tempo;
  readouts.swing.textContent = state.swing + '%';
  readouts.volume.textContent = state.volume;
}

for (const k of Object.keys(sliders)) {
  sliders[k].addEventListener('input', () => {
    state[k] = Number(sliders[k].value);
    if (k === 'volume' && master) master.gain.value = gainFor(state.volume);
    syncSliders();
  });
}

/* ------------------------------------------------- ascii channel-scope */

const CELL = 16.23, ROWS = 14;
let COLS = 38;
const RAMP = [
  { g: ' ',  c: null },
  { g: '-',  c: '#16294a' },
  { g: '+',  c: '#1b3660' },
  { g: '/',  c: '#acd0ec' },
  { g: '(',  c: '#acd0ec' },
  { g: ')',  c: '#acd0ec' },
  { g: '*',  c: '#47a0f8' },
  { g: '▴', c: '#47a0f8' },
  { g: 'K',  c: '#47a0f8' },
  { g: '▲', c: '#47a0f8' },
  { g: '#',  c: '#ffffff' },
  { g: '⬢', c: '#ffffff' },
  { g: '⬣', c: '#ffffff' }
];
const ACCENT = '#7fdce4';

const ctx2d = el.field.getContext('2d');
let cellW = CELL, dpr = 1, fieldW = 612;
let heat = new Float32Array(COLS * ROWS);
let cursorY = ROWS - 0.5;
let pulse = 0;
let fieldT = 0;

function sizeField() {
  const w = fieldW = el.field.clientWidth || 612;
  cellW = CELL;
  const cols = Math.max(10, Math.round(w / cellW));
  if (cols !== COLS) { COLS = cols; heat = new Float32Array(COLS * ROWS); }
  const h = cellW * ROWS;
  dpr = Math.min(window.devicePixelRatio || 1, 3);
  el.field.style.height = h + 'px';
  el.field.width = Math.round(w * dpr);
  el.field.height = Math.round(h * dpr);
  ctx2d.setTransform(dpr, 0, 0, dpr, 0, 0);
}

/* deterministic value noise ---------------------------------------- */
function hash3(x, y, z) {
  let h = x * 374761393 + y * 668265263 + z * 2147483647;
  h = (h ^ (h >> 13)) * 1274126177;
  h = h ^ (h >> 16);
  return ((h >>> 0) % 100000) / 100000;
}
function smooth(t) { return t * t * (3 - 2 * t); }
function vnoise(x, y, z) {
  const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
  const xf = smooth(x - xi), yf = smooth(y - yi), zf = smooth(z - zi);
  let s = 0;
  for (let dz = 0; dz < 2; dz++) {
    const wz = dz ? zf : 1 - zf;
    for (let dy = 0; dy < 2; dy++) {
      const wy = dy ? yf : 1 - yf;
      for (let dx = 0; dx < 2; dx++) {
        const wx = dx ? xf : 1 - xf;
        s += wx * wy * wz * hash3(xi + dx, yi + dy, zi + dz);
      }
    }
  }
  return s;
}
/* Three layers: drifting cloud, mid-scale eddies, per-cell shimmer.
   The x-shear is what gives the field its diagonal grain. */
function texture(c, r, t) {
  return 0.54 * vnoise(c * 0.125 + r * 0.09, r * 0.19, t * 0.16)
       + 0.32 * vnoise(c * 0.40 + r * 0.24, r * 0.55, t * 0.34)
       + 0.14 * vnoise(c * 1.63, r * 1.87, t * 0.95);
}

function bump(amount) { pulse = Math.min(2.4, pulse + amount); }

function inject(cx, cy, amp) {
  const rad = 3.5;
  const c0 = Math.max(0, Math.floor(cx - rad)), c1 = Math.min(COLS - 1, Math.ceil(cx + rad));
  const r0 = Math.max(0, Math.floor(cy - rad)), r1 = Math.min(ROWS - 1, Math.ceil(cy + rad));
  for (let r = r0; r <= r1; r++) {
    for (let c = c0; c <= c1; c++) {
      const dx = (c + 0.5) - cx, dy = (r + 0.5) - cy;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d > rad) continue;
      const f = Math.pow(1 - d / rad, 1.7);
      const i = r * COLS + c;
      heat[i] = Math.min(1.35, heat[i] + amp * f);
    }
  }
}

let lastField = 0;
function updateField(now, dt) {
  fieldT += dt;

  for (let i = 0; i < heat.length; i++) heat[i] *= 0.87;

  if (state.playing) {
    cursorY -= dt * 10;
    while (cursorY < -1) cursorY += ROWS + 2;
    const frac = stepFraction();
    const cx = ((state.step >= 0 ? state.step : 0) + frac + 0.5) / STEPS * COLS;
    inject(cx, cursorY, 0.22 + pulse * 0.8);
    pulse *= 0.82;
  } else {
    pulse *= 0.9;
  }

  drawField();
}

function drawField() {
  ctx2d.clearRect(0, 0, fieldW, cellW * ROWS);
  const fs = cellW * 0.8626;
  ctx2d.font = `${fs}px Menlo, "SF Mono", ui-monospace, monospace`;
  ctx2d.textBaseline = 'alphabetic';
  ctx2d.textAlign = 'left';
  const base = cellW * 0.862;

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const n = texture(c, r, fieldT);
      let idx = Math.round(3.35 + (n - 0.5) * 10.6 + heat[r * COLS + c] * 9.5);
      if (idx < 0) idx = 0;
      if (idx > RAMP.length - 1) idx = RAMP.length - 1;
      const spec = RAMP[idx];
      if (!spec.c) continue;
      const acc = hash3(c * 7 + 3, r * 11 + 5, Math.floor(fieldT * 2.4)) > 0.9955;
      ctx2d.fillStyle = acc ? ACCENT : spec.c;
      ctx2d.fillText(spec.g, c * cellW, base + r * cellW);
    }
  }
}

/* -------------------------------------------------------- run loop */

function stepFraction() {
  if (!ac || !state.playing) return 0;
  const d = stepDur();
  const cur = queue.length ? queue[0].time : 0;
  const t = ac.currentTime - cur;
  return Math.max(0, Math.min(1, t / d));
}

function frame(now) {
  if (state.playing && ac) {
    let advanced = false;
    while (queue.length > 1 && queue[1].time <= ac.currentTime) queue.shift();
    if (queue.length && queue[0].time <= ac.currentTime && queue[0].step !== state.step) {
      state.step = queue[0].step;
      advanced = true;
    }
    if (advanced) {
      paintPlayhead();
      flickerLogo();
      bump(0.45 + Math.min(6, queue[0].hits) * 0.15);
    }
  }

  if (now - lastField > 62) {
    updateField(now, Math.min(0.2, (now - lastField) / 1000));
    lastField = now;
  }

  requestAnimationFrame(frame);
}

/* ------------------------------------------------------------ input */

el.play.addEventListener('click', toggle);

document.getElementById('clear').addEventListener('click', () => {
  clearPattern(); paintCells(); paintPresets();
});
document.getElementById('random').addEventListener('click', () => {
  randomPattern(); paintCells(); paintPresets();
});

el.rec.addEventListener('click', () => {
  state.rec = !state.rec;
  el.rec.classList.toggle('on', state.rec);
});

for (const b of document.querySelectorAll('.seg-btn')) {
  b.addEventListener('click', () => {
    state.target = b.dataset.target;
    document.querySelectorAll('.seg-btn').forEach(x => x.classList.toggle('on', x === b));
  });
}

const held = new Set();
window.addEventListener('keydown', ev => {
  if (ev.metaKey || ev.ctrlKey || ev.altKey || ev.repeat) return;
  const k = ev.key.toLowerCase();
  if (k === ' ' || ev.code === 'Space') {
    ev.preventDefault();
    toggle();
    return;
  }
  if (held.has(k)) return;
  const i = NOTES.findIndex(n => n.key === k);
  if (i >= 0) {
    held.add(k);
    ev.preventDefault();
    strike(i);
  }
});
window.addEventListener('keyup', ev => held.delete(ev.key.toLowerCase()));

window.addEventListener('resize', () => { sizeField(); drawField(); });
document.addEventListener('contextmenu', ev => {
  if (ev.target.closest('.cell')) ev.preventDefault();
});

/* -------------------------------------------------------------- go */

buildLogo();
buildPresets();
buildGrid();
buildKeys();
loadPreset(0);
syncSliders();
paintCells();
paintPresets();
syncTransport();
sizeField();
requestAnimationFrame(frame);
