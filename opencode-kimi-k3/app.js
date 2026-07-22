'use strict';

/* ============================================================
   BEETBOX — beat sequencing · channel desk
   ============================================================ */

// ---------- musical data ----------

const SCALE = ['A', 'C', 'D', 'E', 'G', 'A⁺', 'C⁺'];
const LEAD_FREQ = [220.0, 261.63, 293.66, 329.63, 392.0, 440.0, 523.25];
const BASS_FREQ = [55.0, 65.41, 73.42, 82.41, 98.0, 110.0, 130.81];
const PAD_KEYS = ['A', 'S', 'D', 'F', 'G', 'H', 'J'];

const ROWS = [
  { id: 'lead',    num: '01', name: 'Lead',    melodic: true },
  { id: 'bass',    num: '02', name: 'Bass',    melodic: true },
  { id: 'kick',    num: '03', name: 'Kick' },
  { id: 'snare',   num: '04', name: 'Snare' },
  { id: 'clap',    num: '05', name: 'Clap' },
  { id: 'hat',     num: '06', name: 'Hi-hat' },
  { id: 'open',    num: '07', name: 'Open hat' },
  { id: 'rim',     num: '08', name: 'Rimshot' },
  { id: 'tom',     num: '09', name: 'Tom' },
  { id: 'cowbell', num: '10', name: 'Cowbell' },
  { id: 'shaker',  num: '11', name: 'Shaker' },
  { id: 'crash',   num: '12', name: 'Crash' },
];
const N = ROWS.length;
const STEPS = 16;

// helper: build a 16-step row from {step: value} (steps are 1-based)
function row(map, melodic) {
  const r = new Array(STEPS).fill(null);
  if (!map) return r;
  for (const k in map) r[Number(k) - 1] = melodic ? map[k] : 1;
  return r;
}
// note name -> scale index
const NI = n => SCALE.indexOf(n);

function presetGrid(g) {
  const out = {};
  for (const r of ROWS) out[r.id] = row(g[r.id], r.melodic);
  return out;
}

const PRESETS = [
  {
    ch: '10', name: 'DARKROOM', tempo: 132, swing: 0,
    grid: presetGrid({
      lead:   { 3: NI('G'), 7: NI('D'), 13: NI('C⁺'), 16: NI('A⁺') },
      bass:   { 1: NI('A'), 4: NI('A'), 7: NI('A'), 9: NI('A'), 12: NI('A'), 15: NI('E') },
      kick:   { 1: 1, 5: 1, 9: 1, 13: 1 },
      clap:   { 5: 1, 13: 1 },
      hat:    { 1: 1, 2: 1, 4: 1, 5: 1, 6: 1, 8: 1, 9: 1, 10: 1, 12: 1, 13: 1, 14: 1, 16: 1 },
      open:   { 3: 1, 7: 1, 11: 1, 15: 1 },
      rim:    { 8: 1, 16: 1 },
      tom:    { 15: 1 },
      shaker: { 1: 1, 3: 1, 5: 1, 7: 1, 9: 1, 11: 1, 13: 1, 15: 1 },
      crash:  { 1: 1 },
    }),
  },
  {
    ch: '20', name: 'GREASE', tempo: 126, swing: 12,
    grid: presetGrid({
      lead:   { 2: NI('C'), 6: NI('E'), 9: NI('D'), 11: NI('G'), 14: NI('A⁺') },
      bass:   { 1: NI('A'), 3: NI('A'), 6: NI('D'), 8: NI('E'), 9: NI('A'), 11: NI('A'), 14: NI('G') },
      kick:   { 1: 1, 4: 1, 7: 1, 9: 1, 12: 1 },
      snare:  { 5: 1, 13: 1 },
      clap:   { 13: 1 },
      hat:    { 1: 1, 2: 1, 3: 1, 4: 1, 5: 1, 6: 1, 7: 1, 8: 1, 9: 1, 10: 1, 11: 1, 12: 1, 13: 1, 14: 1, 16: 1 },
      open:   { 15: 1 },
      rim:    { 4: 1, 12: 1 },
      tom:    { 16: 1 },
      cowbell:{ 3: 1, 7: 1, 11: 1 },
      shaker: { 2: 1, 4: 1, 6: 1, 8: 1, 10: 1, 12: 1, 14: 1, 16: 1 },
      crash:  { 1: 1, 9: 1 },
    }),
  },
  {
    ch: '30', name: 'BACKSTREET', tempo: 122, swing: 0,
    grid: presetGrid({
      lead:   { 1: NI('E'), 5: NI('G'), 8: NI('A'), 12: NI('E'), 15: NI('D') },
      bass:   { 1: NI('A'), 5: NI('A'), 8: NI('G'), 11: NI('A'), 13: NI('E') },
      kick:   { 1: 1, 3: 1, 9: 1, 11: 1 },
      snare:  { 5: 1, 13: 1 },
      hat:    { 1: 1, 3: 1, 5: 1, 7: 1, 9: 1, 11: 1, 13: 1, 15: 1 },
      open:   { 7: 1, 15: 1 },
      tom:    { 12: 1, 16: 1 },
      shaker: { 1: 1, 5: 1, 9: 1, 13: 1 },
    }),
  },
  {
    ch: '40', name: 'DAYLIGHT', tempo: 118, swing: 4,
    grid: presetGrid({
      lead:   { 2: NI('C⁺'), 8: NI('G'), 9: NI('C⁺'), 10: NI('C'), 11: NI('A'), 15: NI('G') },
      bass:   { 1: NI('C⁺'), 3: NI('C'), 6: NI('E'), 9: NI('C'), 10: NI('G'), 12: NI('E'), 15: NI('A'), 16: NI('C') },
      kick:   { 1: 1, 5: 1, 9: 1, 13: 1, 16: 1 },
      snare:  { 1: 1, 4: 1, 9: 1, 11: 1, 13: 1, 14: 1 },
      clap:   { 4: 1, 5: 1 },
      hat:    { 1: 1, 2: 1, 5: 1, 7: 1, 9: 1, 10: 1, 12: 1, 14: 1, 15: 1 },
      open:   { 8: 1 },
      rim:    { 13: 1 },
      tom:    { 5: 1, 6: 1, 13: 1 },
      cowbell:{ 11: 1 },
      shaker: { 6: 1, 9: 1, 10: 1, 11: 1, 15: 1 },
      crash:  { 14: 1 },
    }),
  },
  {
    ch: '50', name: 'ACID', tempo: 140, swing: 8,
    grid: presetGrid({
      lead:   { 1: NI('A'), 3: NI('E'), 5: NI('A'), 7: NI('A⁺'), 9: NI('A'), 11: NI('E'), 13: NI('C⁺'), 15: NI('A⁺'), 16: NI('E') },
      bass:   { 1: NI('A'), 2: NI('A'), 3: NI('D'), 4: NI('A'), 5: NI('A'), 6: NI('A'), 7: NI('D'), 8: NI('A'),
                9: NI('A'), 10: NI('A'), 11: NI('D'), 12: NI('A'), 13: NI('A'), 14: NI('C⁺'), 15: NI('D'), 16: NI('A') },
      kick:   { 1: 1, 5: 1, 9: 1, 13: 1 },
      snare:  { 5: 1, 13: 1 },
      clap:   { 13: 1 },
      hat:    { 2: 1, 4: 1, 6: 1, 8: 1, 10: 1, 12: 1, 14: 1, 16: 1 },
      open:   { 3: 1, 11: 1 },
      tom:    { 11: 1, 15: 1 },
      crash:  { 9: 1 },
    }),
  },
];

function cloneGrid(g) {
  const out = {};
  for (const id in g) out[id] = g[id].slice();
  return out;
}

// ---------- state ----------

const state = {
  channel: 0,
  dirty: false,
  tempo: PRESETS[0].tempo,
  swing: PRESETS[0].swing,
  volume: 90,
  playing: false,
  step: -1,
  grid: cloneGrid(PRESETS[0].grid),
  mutes: {},
  loopRec: false,
  padInst: 'lead',
};

// ---------- DOM ----------

const $ = id => document.getElementById(id);
const playBtn = $('playBtn'), onair = $('onair');
const tempoEl = $('tempo'), swingEl = $('swing'), volumeEl = $('volume');
const tempoVal = $('tempoVal'), swingVal = $('swingVal'), volumeVal = $('volumeVal');
const channelsEl = $('channels'), trackListEl = $('trackList');
const stepNumsEl = $('stepNums'), gridEl = $('grid');
const loopRecBtn = $('loopRecBtn'), leadTab = $('leadTab'), bassTab = $('bassTab');
const padsEl = $('pads');

// channel tabs
const chanBtns = PRESETS.map((p, i) => {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = 'btn chan' + (i === state.channel ? ' active' : '');
  b.innerHTML = `<span class="sq"></span>CH·${p.ch} ${p.name}`;
  b.addEventListener('click', () => selectChannel(i));
  channelsEl.appendChild(b);
  return b;
});

// track labels
const trackEls = ROWS.map(r => {
  const d = document.createElement('div');
  d.className = 'track-label';
  d.innerHTML = `<span class="sq"></span><span class="ch">CH·${r.num}</span>&nbsp;${r.name}`;
  d.addEventListener('click', () => toggleMute(r.id));
  trackListEl.appendChild(d);
  return d;
});

// step numbers
const stepNumEls = [];
for (let s = 0; s < STEPS; s++) {
  const sp = document.createElement('span');
  sp.textContent = s + 1;
  stepNumsEl.appendChild(sp);
  stepNumEls.push(sp);
}

// grid cells
const cells = {}; // cells[rowId][step] -> element
ROWS.forEach((r) => {
  cells[r.id] = [];
  for (let s = 0; s < STEPS; s++) {
    const c = document.createElement('div');
    c.className = 'cell';
    c.dataset.row = r.id;
    c.dataset.step = s;
    c.addEventListener('mousedown', e => {
      if (e.button === 0) editCell(r, s, +1);
    });
    c.addEventListener('contextmenu', e => {
      e.preventDefault();
      editCell(r, s, -1);
    });
    gridEl.appendChild(c);
    cells[r.id].push(c);
  }
});

// pads
const padEls = SCALE.map((note, i) => {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = 'pad';
  b.innerHTML = `<span class="note">${note}</span><span class="key">${PAD_KEYS[i]}</span>`;
  b.addEventListener('mousedown', () => hitPad(i));
  padsEl.appendChild(b);
  return b;
});

// ---------- rendering ----------

function renderCell(r, s) {
  const v = state.grid[r.id][s];
  const el = cells[r.id][s];
  const on = v !== null && v !== undefined;
  el.classList.toggle('on', on);
  el.classList.toggle('muted', !!state.mutes[r.id]);
  el.textContent = on && r.melodic ? SCALE[v] : '';
}

function renderGrid() {
  for (const r of ROWS) for (let s = 0; s < STEPS; s++) renderCell(r, s);
}

function renderMutes() {
  ROWS.forEach((r, i) => {
    trackEls[i].classList.toggle('muted', !!state.mutes[r.id]);
    for (let s = 0; s < STEPS; s++) cells[r.id][s].classList.toggle('muted', !!state.mutes[r.id]);
  });
}

function renderChannels() {
  chanBtns.forEach((b, i) => b.classList.toggle('active', i === state.channel && !state.dirty));
}

function setPlayhead(s) {
  if (state.step >= 0) {
    for (const r of ROWS) cells[r.id][state.step].classList.remove('ph');
    stepNumEls[state.step].classList.remove('ph');
  }
  state.step = s;
  if (s >= 0) {
    for (const r of ROWS) cells[r.id][s].classList.add('ph');
    stepNumEls[s].classList.add('ph');
  }
}

function markDirty() {
  state.dirty = true;
  renderChannels();
}

function updateSliderFill(el) {
  const p = (el.value - el.min) / (el.max - el.min) * 100;
  el.style.setProperty('--p', p + '%');
}

// ---------- editing ----------

function editCell(r, s, dir) {
  const cur = state.grid[r.id][s];
  let next;
  if (r.melodic) {
    if (cur === null || cur === undefined) next = dir > 0 ? 0 : SCALE.length - 1;
    else {
      next = cur + dir;
      if (next >= SCALE.length || next < 0) next = null;
    }
  } else {
    next = cur ? null : 1;
  }
  state.grid[r.id][s] = next;
  renderCell(r, s);
  markDirty();
}

function toggleMute(id) {
  state.mutes[id] = !state.mutes[id];
  renderMutes();
}

function selectChannel(i) {
  const p = PRESETS[i];
  state.channel = i;
  state.dirty = false;
  state.grid = cloneGrid(p.grid);
  state.tempo = p.tempo;
  state.swing = p.swing;
  tempoEl.value = p.tempo; swingEl.value = p.swing;
  tempoVal.textContent = p.tempo;
  swingVal.textContent = p.swing + '%';
  updateSliderFill(tempoEl); updateSliderFill(swingEl);
  renderGrid();
  renderChannels();
}

function clearGrid() {
  for (const r of ROWS) state.grid[r.id].fill(null);
  renderGrid();
  markDirty();
}

function randomGrid() {
  const R = Math.random;
  const prob = p => R() < p;
  const note = () => Math.floor(R() * SCALE.length);
  const bassNote = () => (R() < 0.45 ? 0 : note());
  for (const r of ROWS) {
    const a = state.grid[r.id];
    for (let s = 0; s < STEPS; s++) {
      switch (r.id) {
        case 'lead':    a[s] = prob(0.26) ? note() : null; break;
        case 'bass':    a[s] = prob(s % 2 === 0 ? 0.42 : 0.14) ? bassNote() : null; break;
        case 'kick':    a[s] = prob(s % 4 === 0 ? 0.92 : 0.10) ? 1 : null; break;
        case 'snare':   a[s] = prob(s % 8 === 4 ? 0.85 : 0.05) ? 1 : null; break;
        case 'clap':    a[s] = prob(s % 8 === 4 ? 0.45 : 0.04) ? 1 : null; break;
        case 'hat':     a[s] = prob(s % 2 === 0 ? 0.72 : 0.45) ? 1 : null; break;
        case 'open':    a[s] = prob(s % 4 === 2 ? 0.35 : 0.03) ? 1 : null; break;
        case 'rim':     a[s] = prob(0.08) ? 1 : null; break;
        case 'tom':     a[s] = prob(s % 4 === 3 ? 0.25 : 0.05) ? 1 : null; break;
        case 'cowbell': a[s] = prob(0.07) ? 1 : null; break;
        case 'shaker':  a[s] = prob(s % 2 === 0 ? 0.5 : 0.22) ? 1 : null; break;
        case 'crash':   a[s] = prob(s === 0 ? 0.55 : 0.02) ? 1 : null; break;
      }
    }
  }
  renderGrid();
  markDirty();
}

// ============================================================
//  audio
// ============================================================

let ctx = null, master = null, delaySend = null, noiseBuf = null;

function ensureCtx() {
  if (ctx) return ctx;
  ctx = new (window.AudioContext || window.webkitAudioContext)();
  master = ctx.createGain();
  master.gain.value = state.volume / 100 * 0.9;
  master.connect(ctx.destination);

  // simple feedback delay for the lead
  delaySend = ctx.createGain();
  const delay = ctx.createDelay(1);
  delay.delayTime.value = 0.27;
  const fb = ctx.createGain(); fb.gain.value = 0.32;
  const wet = ctx.createGain(); wet.gain.value = 0.18;
  delaySend.connect(delay); delay.connect(fb); fb.connect(delay);
  delay.connect(wet); wet.connect(master);

  noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
  const d = noiseBuf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  return ctx;
}

function applyVolume() {
  if (master) master.gain.setTargetAtTime(state.volume / 100 * 0.9, ctx.currentTime, 0.01);
}

function envGain(t, peak, attack, decay) {
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(peak, t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay);
  g.connect(master);
  return g;
}

function noise(t, filterType, freq, q, peak, decay) {
  const src = ctx.createBufferSource();
  src.buffer = noiseBuf;
  const f = ctx.createBiquadFilter();
  f.type = filterType; f.frequency.value = freq; f.Q.value = q;
  const g = envGain(t, peak, 0.002, decay);
  src.connect(f); f.connect(g);
  src.start(t); src.stop(t + decay + 0.1);
}

function tone(t, type, f0, f1, dur, peak) {
  const o = ctx.createOscillator();
  o.type = type;
  o.frequency.setValueAtTime(f0, t);
  if (f1 && f1 !== f0) o.frequency.exponentialRampToValueAtTime(f1, t + dur);
  const g = envGain(t, peak, 0.003, dur);
  o.connect(g);
  o.start(t); o.stop(t + dur + 0.1);
}

const DRUMS = {
  kick(t) {
    tone(t, 'sine', 160, 45, 0.26, 0.95);
    noise(t, 'highpass', 3000, 0.7, 0.25, 0.02);
  },
  snare(t) {
    noise(t, 'bandpass', 1800, 0.9, 0.55, 0.17);
    tone(t, 'triangle', 190, 160, 0.09, 0.35);
  },
  clap(t) {
    for (let i = 0; i < 3; i++) noise(t + i * 0.022, 'bandpass', 1300, 1.4, 0.35, 0.045);
    noise(t + 0.066, 'bandpass', 1300, 1.2, 0.3, 0.14);
  },
  hat(t)   { noise(t, 'highpass', 7600, 0.7, 0.28, 0.045); },
  open(t)  { noise(t, 'highpass', 7000, 0.7, 0.24, 0.34); },
  rim(t)   { noise(t, 'bandpass', 4200, 6, 0.5, 0.028); tone(t, 'square', 1750, 1700, 0.025, 0.18); },
  tom(t)   { tone(t, 'sine', 195, 88, 0.24, 0.7); },
  cowbell(t) {
    tone(t, 'square', 845, 845, 0.16, 0.16);
    tone(t, 'square', 562, 562, 0.16, 0.16);
    noise(t, 'bandpass', 900, 2, 0.12, 0.16);
  },
  shaker(t) { noise(t, 'bandpass', 5200, 1.4, 0.2, 0.075); },
  crash(t)  { noise(t, 'highpass', 4800, 0.6, 0.5, 1.4); },
};

function playLead(t, idx) {
  const f = LEAD_FREQ[idx];
  const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f;
  const o2 = ctx.createOscillator(); o2.type = 'square'; o2.frequency.value = f * 1.005;
  const flt = ctx.createBiquadFilter(); flt.type = 'lowpass'; flt.frequency.value = 2600; flt.Q.value = 2;
  const g = envGain(t, 0.22, 0.005, 0.24);
  o.connect(flt); o2.connect(flt); flt.connect(g);
  g.connect(delaySend);
  o.start(t); o.stop(t + 0.4); o2.start(t); o2.stop(t + 0.4);
}

function playBass(t, idx) {
  const f = BASS_FREQ[idx];
  const o = ctx.createOscillator(); o.type = 'square'; o.frequency.value = f;
  const flt = ctx.createBiquadFilter(); flt.type = 'lowpass'; flt.frequency.value = 620; flt.Q.value = 5;
  const g = envGain(t, 0.5, 0.004, 0.2);
  o.connect(flt); flt.connect(g);
  o.start(t); o.stop(t + 0.35);
}

// ============================================================
//  sequencer
// ============================================================

let schedTimer = null, nextTime = 0, schedStep = 0;

function scheduleStep(s, t) {
  const uiDelay = Math.max(0, (t - ctx.currentTime) * 1000);
  setTimeout(() => { if (state.playing) setPlayhead(s); }, uiDelay);
  for (const r of ROWS) {
    const v = state.grid[r.id][s];
    if (v === null || v === undefined || state.mutes[r.id]) continue;
    if (r.id === 'lead') playLead(t, v);
    else if (r.id === 'bass') playBass(t, v);
    else DRUMS[r.id](t);
    setTimeout(() => vizPulse(r.id), uiDelay);
  }
}

function schedulerTick() {
  const stepDur = 60 / state.tempo / 4;
  while (nextTime < ctx.currentTime + 0.12) {
    let t = nextTime;
    if (schedStep % 2 === 1) t += (state.swing / 100) * stepDur; // swing pushes off-16ths late
    scheduleStep(schedStep, t);
    nextTime += stepDur;
    schedStep = (schedStep + 1) % STEPS;
  }
}

async function togglePlay() {
  ensureCtx();
  if (state.playing) {
    state.playing = false;
    clearInterval(schedTimer);
    setPlayhead(-1);
    playBtn.innerHTML = '&#9654; PLAY';
    playBtn.classList.remove('playing');
    onair.classList.remove('on');
  } else {
    await ctx.resume();
    state.playing = true;
    schedStep = 0;
    nextTime = ctx.currentTime + 0.06;
    schedulerTick();
    schedTimer = setInterval(schedulerTick, 25);
    playBtn.innerHTML = '&#9632; STOP';
    playBtn.classList.add('playing');
    onair.classList.add('on');
  }
}

// ---------- pads ----------

function hitPad(i) {
  ensureCtx();
  ctx.resume();
  const t = ctx.currentTime + 0.001;
  if (state.padInst === 'lead') playLead(t, i); else playBass(t, i);
  vizPulse(state.padInst);
  const el = padEls[i];
  el.classList.add('hit');
  setTimeout(() => el.classList.remove('hit'), 140);
  if (state.loopRec && state.playing && state.step >= 0) {
    state.grid[state.padInst][state.step] = i;
    renderCell(ROWS.find(r => r.id === state.padInst), state.step);
    markDirty();
  }
}

// ============================================================
//  ASCII visualizer
// ============================================================

const vizCanvas = $('viz');
const vctx = vizCanvas.getContext('2d');
const VW = { cw: 21, ch: 24, cols: 0, rows: 0, w: 0, h: 0 };
const FIELD_GLYPHS = ['-', '+', '/', '(', ')', '*'];
const blobs = [];
const creature = { x: 20, y: 7 };

function hash2(x, y) {
  let h = (x * 374761393 + y * 668265263) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
}

function vizResize() {
  const dpr = window.devicePixelRatio || 1;
  const w = vizCanvas.clientWidth, h = 380;
  vizCanvas.width = w * dpr;
  vizCanvas.height = h * dpr;
  vctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  VW.w = w; VW.h = h;
  VW.cols = Math.floor(w / VW.cw);
  VW.rows = Math.floor(h / VW.ch);
}
window.addEventListener('resize', vizResize);
vizResize();

const BLOB_DEFS = {
  kick:    { r: 5,   life: 1.1, n: 1, palette: ['▲', 'K', '#', '●'], colors: ['#e8f2ff', '#7fb2ff', '#4f8df0'] },
  snare:   { r: 4,   life: 0.9, n: 1, palette: ['*', '#', '▲', 'K'], colors: ['#e8f2ff', '#7fb2ff'] },
  clap:    { r: 4,   life: 0.9, n: 1, palette: ['*', '#', '▲'],      colors: ['#e8f2ff', '#9fc4ff'] },
  hat:     { r: 2,   life: 0.6, n: 1, palette: ['+', '*', '/'],      colors: ['#7fb2ff', '#4f8df0'] },
  open:    { r: 3.2, life: 1.0, n: 1, palette: ['*', '+'],           colors: ['#9fc4ff', '#43e2c8'] },
  rim:     { r: 2.2, life: 0.6, n: 1, palette: ['+', '*'],           colors: ['#9fc4ff'] },
  tom:     { r: 3.4, life: 0.9, n: 1, palette: ['▲', '('],           colors: ['#7fb2ff', '#4f8df0'] },
  cowbell: { r: 3.2, life: 0.9, n: 1, palette: ['K', '#'],           colors: ['#e8f2ff', '#9fc4ff'] },
  shaker:  { r: 2,   life: 0.6, n: 1, palette: ['+', '*'],           colors: ['#7fb2ff'] },
  crash:   { r: 6.5, life: 1.6, n: 2, palette: ['*', '▲', '#'],      colors: ['#e8f2ff', '#7fb2ff', '#43e2c8'] },
  lead:    { r: 3,   life: 0.8, n: 1, palette: ['▲', '+', '*'],      colors: ['#43e2c8', '#9fc4ff'] },
  bass:    { r: 4,   life: 1.0, n: 1, palette: ['●', '(', 'K'],      colors: ['#7fb2ff', '#4f8df0'] },
};

function vizPulse(rowId) {
  const def = BLOB_DEFS[rowId];
  if (!def || !VW.cols) return;
  // creature random-walks; occasionally teleports
  if (Math.random() < 0.3) {
    creature.x = 4 + Math.random() * (VW.cols - 8);
    creature.y = 2 + Math.random() * (VW.rows - 4);
  } else {
    creature.x += (Math.random() - 0.5) * 14;
    creature.y += (Math.random() - 0.5) * 6;
    creature.x = Math.max(2, Math.min(VW.cols - 3, creature.x));
    creature.y = Math.max(1, Math.min(VW.rows - 2, creature.y));
  }
  for (let i = 0; i < def.n; i++) {
    blobs.push({
      x: creature.x + (Math.random() - 0.5) * 4,
      y: creature.y + (Math.random() - 0.5) * 3,
      vx: (Math.random() - 0.5) * 4,
      vy: (Math.random() - 0.5) * 2,
      r: def.r * (0.8 + Math.random() * 0.4),
      life: def.life, maxLife: def.life,
      palette: def.palette,
      color: def.colors[Math.floor(Math.random() * def.colors.length)],
    });
  }
  if (blobs.length > 36) blobs.splice(0, blobs.length - 36);
}

let lastFrame = 0;
function vizFrame(ts) {
  requestAnimationFrame(vizFrame);
  const time = ts / 1000;
  const dt = Math.min(0.05, time - (lastFrame || time));
  lastFrame = time;
  if (!VW.cols) return;

  vctx.fillStyle = '#0b0e14';
  vctx.fillRect(0, 0, VW.w, VW.h);
  vctx.font = '15px ui-monospace, Menlo, Consolas, monospace';
  vctx.textAlign = 'center';
  vctx.textBaseline = 'middle';

  // advance blobs
  for (let i = blobs.length - 1; i >= 0; i--) {
    const b = blobs[i];
    b.x += b.vx * dt; b.y += b.vy * dt;
    b.life -= dt;
    if (b.life <= 0) blobs.splice(i, 1);
  }
  const active = state.playing;

  const tSlow = time * 0.6;
  for (let y = 0; y < VW.rows; y++) {
    for (let x = 0; x < VW.cols; x++) {
      const px = x * VW.cw + VW.cw / 2;
      const py = y * VW.ch + VW.ch / 2;

      // blob influence
      let boost = 0, blob = null;
      for (let i = 0; i < blobs.length; i++) {
        const b = blobs[i];
        const dx = x - b.x, dy = y - b.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < b.r) {
          const v = (1 - d / b.r) * (b.life / b.maxLife);
          if (v > boost) { boost = v; blob = b; }
        }
      }

      if (blob && boost > 0.32) {
        const gi = Math.floor(hash2(x, y + Math.floor(time * 7)) * blob.palette.length);
        vctx.globalAlpha = Math.min(1, boost * 1.7);
        vctx.fillStyle = blob.color;
        vctx.fillText(blob.palette[gi], px, py);
      } else {
        // base shimmering field
        const seed = hash2(x, y);
        const v = Math.sin(x * 0.35 + tSlow * 1.4 + seed * 6.28)
                + Math.sin(y * 0.55 - tSlow * 1.1)
                + Math.sin((x * 0.2 + y * 0.3) + tSlow * 0.8 + seed * 3);
        const v01 = (v / 3 + 1) / 2;
        const gi = Math.min(FIELD_GLYPHS.length - 1, Math.floor(v01 * FIELD_GLYPHS.length));
        const tw = (Math.sin(time * 2.2 + seed * 40) + 1) / 2;
        let a = 0.14 + 0.26 * v01 + 0.14 * tw;
        if (!active) a *= 0.9;
        if (seed > 0.94) vctx.fillStyle = '#43e2c8';
        else if (seed > 0.86) vctx.fillStyle = '#7fb2ff';
        else vctx.fillStyle = '#4a6fc0';
        vctx.globalAlpha = Math.min(0.85, a);
        vctx.fillText(FIELD_GLYPHS[gi], px, py);
      }
    }
  }
  vctx.globalAlpha = 1;
}
requestAnimationFrame(vizFrame);

// ============================================================
//  logo (dot-matrix BEETBOX)
// ============================================================

(function drawLogo() {
  const F = {
    B: ['11110','10001','10001','11110','10001','10001','11110'],
    E: ['11111','10000','10000','11110','10000','10000','11111'],
    T: ['11111','00100','00100','00100','00100','00100','00100'],
    O: ['01110','10001','10001','10001','10001','10001','01110'],
    X: ['10001','10001','01010','00100','01010','10001','10001'],
  };
  const word = 'BEETBOX';
  const cv = $('logo');
  const dpr = window.devicePixelRatio || 1;
  const dot = 4, gap = 2, charGap = 8;
  const wpx = word.length * 5 * (dot + gap) + (word.length - 1) * charGap;
  const hpx = 7 * (dot + gap) - gap;
  cv.width = wpx * dpr; cv.height = hpx * dpr;
  cv.style.width = wpx + 'px'; cv.style.height = hpx + 'px';
  const c = cv.getContext('2d');
  c.setTransform(dpr, 0, 0, dpr, 0, 0);
  let ox = 0;
  let n = 0;
  for (const chr of word) {
    const bmp = F[chr];
    for (let y = 0; y < 7; y++) {
      for (let x = 0; x < 5; x++) {
        if (bmp[y][x] !== '1') continue;
        n++;
        // slight erosion for the printed-dot look
        if (hash2(n * 7 + x, y * 31 + n) < 0.06) c.fillStyle = 'rgba(233,238,247,0.25)';
        else c.fillStyle = '#e9eef7';
        c.fillRect(ox + x * (dot + gap), y * (dot + gap), dot, dot);
      }
    }
    ox += 5 * (dot + gap) + charGap;
  }
})();

// ============================================================
//  events
// ============================================================

playBtn.addEventListener('click', togglePlay);
$('clearBtn').addEventListener('click', clearGrid);
$('randomBtn').addEventListener('click', randomGrid);

tempoEl.addEventListener('input', () => {
  state.tempo = Number(tempoEl.value);
  tempoVal.textContent = state.tempo;
  updateSliderFill(tempoEl);
});
swingEl.addEventListener('input', () => {
  state.swing = Number(swingEl.value);
  swingVal.textContent = state.swing + '%';
  updateSliderFill(swingEl);
});
volumeEl.addEventListener('input', () => {
  state.volume = Number(volumeEl.value);
  volumeVal.textContent = state.volume;
  updateSliderFill(volumeEl);
  applyVolume();
});

loopRecBtn.addEventListener('click', () => {
  state.loopRec = !state.loopRec;
  loopRecBtn.classList.toggle('active', state.loopRec);
});

function setPadInst(inst) {
  state.padInst = inst;
  leadTab.classList.toggle('active', inst === 'lead');
  bassTab.classList.toggle('active', inst === 'bass');
}
leadTab.addEventListener('click', () => setPadInst('lead'));
bassTab.addEventListener('click', () => setPadInst('bass'));

window.addEventListener('keydown', e => {
  if (e.repeat) return;
  if (e.code === 'Space') {
    e.preventDefault();
    togglePlay();
    return;
  }
  const ki = PAD_KEYS.indexOf(e.key.toUpperCase());
  if (ki >= 0) hitPad(ki);
});

// ---------- init ----------

renderGrid();
renderMutes();
renderChannels();
updateSliderFill(tempoEl);
updateSliderFill(swingEl);
updateSliderFill(volumeEl);
