/* BEETBOX — beat sequencing · channel desk. */
(() => {
'use strict';

const STEPS = 16;
const $ = s => document.querySelector(s);

/* ------------------------------------------------------------------ */
/* wordmark — 5x7 dot matrix                                           */
/* ------------------------------------------------------------------ */
const FONT = {
  B:['11110','10001','10001','11110','10001','10001','11110'],
  E:['11111','10000','10000','11110','10000','10000','11111'],
  T:['11111','00100','00100','00100','00100','00100','00100'],
  O:['01110','10001','10001','10001','10001','10001','01110'],
  X:['10001','10001','01010','00100','01010','10001','10001'],
};
(function wordmark(){
  const host = $('#wordmark');
  for (const c of 'BEETBOX') {
    const d = document.createElement('div');
    d.className = 'ch';
    for (const row of FONT[c]) for (const bit of row) {
      const i = document.createElement('i');
      if (bit === '1') i.className = 'on';
      d.appendChild(i);
    }
    host.appendChild(d);
  }
})();

/* ------------------------------------------------------------------ */
/* model                                                               */
/* ------------------------------------------------------------------ */
const TRACKS = [
  {id:'lead',   name:'Lead',     type:'pitch'},
  {id:'bass',   name:'Bass',     type:'pitch'},
  {id:'kick',   name:'Kick',     type:'drum'},
  {id:'snare',  name:'Snare',    type:'drum'},
  {id:'clap',   name:'Clap',     type:'drum'},
  {id:'hat',    name:'Hi-hat',   type:'drum'},
  {id:'ohat',   name:'Open hat', type:'drum'},
  {id:'rim',    name:'Rimshot',  type:'drum'},
  {id:'tom',    name:'Tom',      type:'drum'},
  {id:'cowbell',name:'Cowbell',  type:'drum'},
  {id:'shaker', name:'Shaker',   type:'drum'},
  {id:'crash',  name:'Crash',    type:'drum'},
];

// scale used by the pitch lanes / keyboard
const SCALE = [
  {label:'A',  freq:220.00, key:'a'},
  {label:'C',  freq:261.63, key:'s'},
  {label:'D',  freq:293.66, key:'d'},
  {label:'E',  freq:329.63, key:'f'},
  {label:'G',  freq:392.00, key:'g'},
  {label:'A+', freq:440.00, key:'h'},
  {label:'C+', freq:523.25, key:'j'},
];

const PRESETS = [
  {code:'10', name:'DARKROOM',   tempo:132, swing:0},
  {code:'20', name:'GREASE',     tempo:106, swing:22},
  {code:'30', name:'BACKSTREET', tempo:124, swing:12},
  {code:'40', name:'DAYLIGHT',   tempo:118, swing:8},
  {code:'50', name:'ACID',       tempo:140, swing:0},
];

const state = {
  playing:false, step:0, bpm:132, swing:0, volume:90,
  lane:'lead', rec:false, preset:0,
  grid:{}, mute:{},
};
TRACKS.forEach(t => { state.grid[t.id] = new Array(STEPS).fill(null); state.mute[t.id] = false; });

const b = (...ix) => { const a = new Array(STEPS).fill(null); ix.forEach(i => a[i] = 1); return a; };
const p = obj => { const a = new Array(STEPS).fill(null); for (const k in obj) a[k] = obj[k]; return a; };

function loadPreset(n){
  state.preset = n;
  const P = PRESETS[n];
  state.bpm = P.tempo; state.swing = P.swing;
  TRACKS.forEach(t => { state.grid[t.id] = new Array(STEPS).fill(null); state.mute[t.id] = false; });
  const g = state.grid;
  if (n === 0){ // DARKROOM
    g.kick = b(0,4,8,12); g.hat = b(0,1,3,4,5,7,8,9,11,12,13,15);
    g.ohat = b(2,6,10,14); g.clap = b(4,12); g.rim = b(7,15); g.tom = b(14);
    g.shaker = b(0,2,4,6,8,10,12,14); g.crash = b(0);
    g.lead = p({2:0, 6:2, 12:6, 15:5}); g.bass = p({0:0, 3:0, 6:0, 8:0, 11:0, 14:3});
  } else if (n === 1){ // GREASE
    g.kick = b(0,3,6,8,11,14); g.snare = b(4,12); g.hat = b(2,6,10,14);
    g.ohat = b(3,11); g.cowbell = b(0,7); g.shaker = b(1,5,9,13); g.rim = b(10);
    g.lead = p({0:4, 4:2, 7:1, 10:0, 13:2}); g.bass = p({0:0, 4:0, 6:2, 8:1, 12:0});
  } else if (n === 2){ // BACKSTREET
    g.kick = b(0,6,10); g.snare = b(4,12); g.clap = b(4,12);
    g.hat = b(0,2,4,6,8,10,12,14); g.ohat = b(7,15); g.shaker = b(1,3,5,7,9,11,13,15);
    g.crash = b(0); g.tom = b(11,14);
    g.lead = p({1:6, 5:4, 9:3, 14:1}); g.bass = p({0:1, 2:1, 6:3, 8:1, 10:4, 12:1});
  } else if (n === 3){ // DAYLIGHT
    g.kick = b(0,4,8,12); g.snare = b(4,12); g.hat = b(2,6,10,14);
    g.clap = b(12); g.cowbell = b(0,4,8,12); g.shaker = b(0,2,4,6,8,10,12,14);
    g.lead = p({0:0, 3:2, 6:4, 8:5, 11:4, 14:2}); g.bass = p({0:0, 6:2, 8:4, 12:2});
  } else { // ACID
    g.kick = b(0,2,4,6,8,10,12,14); g.snare = b(4,12); g.ohat = b(1,5,9,13);
    g.hat = b(0,2,4,6,8,10,12,14); g.crash = b(0,8); g.rim = b(3,11); g.tom = b(6,7);
    g.lead = p({0:6, 1:5, 3:6, 5:4, 6:6, 8:3, 10:6, 11:2, 13:6, 15:1});
    g.bass = p({0:0, 1:0, 3:2, 4:0, 6:1, 7:0, 9:2, 10:0, 12:3, 14:0});
  }
  syncControls();
  renderPresets(); renderGrid();
}

/* ------------------------------------------------------------------ */
/* audio                                                               */
/* ------------------------------------------------------------------ */
let ac = null, master = null, analyser = null, freqData = null;

function audio(){
  if (ac) return ac;
  ac = new (window.AudioContext || window.webkitAudioContext)();
  master = ac.createGain();
  master.gain.value = state.volume / 100 * 0.8;
  const comp = ac.createDynamicsCompressor();
  comp.threshold.value = -14; comp.ratio.value = 4;
  analyser = ac.createAnalyser();
  analyser.fftSize = 128; analyser.smoothingTimeConstant = 0.72;
  freqData = new Uint8Array(analyser.frequencyBinCount);
  master.connect(comp); comp.connect(analyser); analyser.connect(ac.destination);
  return ac;
}

function env(node, t, a, d, peak){
  const g = ac.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(peak, t + a);
  g.gain.exponentialRampToValueAtTime(0.0001, t + a + d);
  node.connect(g); g.connect(master);
  return g;
}

let noiseBuf = null;
function noise(){
  if (!noiseBuf){
    noiseBuf = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  const s = ac.createBufferSource(); s.buffer = noiseBuf; s.loop = true; return s;
}

function noiseHit(t, dur, type, freq, q, peak){
  const s = noise(), f = ac.createBiquadFilter();
  f.type = type; f.frequency.value = freq; if (q) f.Q.value = q;
  s.connect(f);
  env(f, t, 0.001, dur, peak);
  s.start(t); s.stop(t + dur + 0.05);
}

const VOICES = {
  kick(t){
    const o = ac.createOscillator(); o.type = 'sine';
    o.frequency.setValueAtTime(150, t);
    o.frequency.exponentialRampToValueAtTime(44, t + 0.13);
    env(o, t, 0.002, 0.34, 1.0);
    o.start(t); o.stop(t + 0.42);
    noiseHit(t, 0.02, 'highpass', 1200, 0.7, 0.25);
  },
  snare(t){
    noiseHit(t, 0.17, 'highpass', 1400, 0.8, 0.5);
    const o = ac.createOscillator(); o.type = 'triangle';
    o.frequency.setValueAtTime(190, t);
    o.frequency.exponentialRampToValueAtTime(120, t + 0.1);
    env(o, t, 0.002, 0.11, 0.4); o.start(t); o.stop(t + 0.16);
  },
  clap(t){
    for (let i = 0; i < 3; i++) noiseHit(t + i * 0.011, 0.05, 'bandpass', 1600, 1.4, 0.35);
    noiseHit(t + 0.033, 0.19, 'bandpass', 1300, 1.1, 0.4);
  },
  hat(t){ noiseHit(t, 0.045, 'highpass', 8000, 1, 0.24); },
  ohat(t){ noiseHit(t, 0.30, 'highpass', 7200, 1, 0.22); },
  rim(t){
    const o = ac.createOscillator(); o.type = 'square';
    o.frequency.setValueAtTime(1750, t);
    env(o, t, 0.001, 0.035, 0.28); o.start(t); o.stop(t + 0.06);
    noiseHit(t, 0.03, 'bandpass', 2400, 3, 0.2);
  },
  tom(t){
    const o = ac.createOscillator(); o.type = 'sine';
    o.frequency.setValueAtTime(240, t);
    o.frequency.exponentialRampToValueAtTime(96, t + 0.24);
    env(o, t, 0.002, 0.28, 0.6); o.start(t); o.stop(t + 0.34);
  },
  cowbell(t){
    [540, 800].forEach(f => {
      const o = ac.createOscillator(); o.type = 'square'; o.frequency.value = f;
      env(o, t, 0.002, 0.19, 0.18); o.start(t); o.stop(t + 0.24);
    });
  },
  shaker(t){ noiseHit(t, 0.06, 'bandpass', 6200, 1.6, 0.17); },
  crash(t){ noiseHit(t, 1.5, 'highpass', 5200, 0.6, 0.28); },
};

function playPitch(lane, idx, t, dur){
  const f = SCALE[idx].freq * (lane === 'bass' ? 0.25 : 1);
  const o = ac.createOscillator();
  o.type = lane === 'bass' ? 'sawtooth' : 'square';
  o.frequency.setValueAtTime(f, t);
  const filt = ac.createBiquadFilter();
  filt.type = 'lowpass';
  filt.frequency.setValueAtTime(lane === 'bass' ? 420 : 2600, t);
  filt.frequency.exponentialRampToValueAtTime(lane === 'bass' ? 160 : 900, t + dur);
  filt.Q.value = lane === 'bass' ? 7 : 3;
  o.connect(filt);
  env(filt, t, 0.006, dur, lane === 'bass' ? 0.42 : 0.20);
  o.start(t); o.stop(t + dur + 0.1);
}

function trigger(id, idx, t, dur){
  if (state.mute[id]) return;
  if (id === 'lead' || id === 'bass') playPitch(id, idx, t, dur);
  else VOICES[id] && VOICES[id](t);
}

/* ------------------------------------------------------------------ */
/* scheduler                                                           */
/* ------------------------------------------------------------------ */
let nextTime = 0, nextStep = 0, timer = null;
const LOOKAHEAD = 0.12;
const stepDur = () => 60 / state.bpm / 4;

function schedule(){
  while (nextTime < ac.currentTime + LOOKAHEAD){
    const sd = stepDur();
    const off = (nextStep % 2 === 1) ? sd * (state.swing / 100) : 0;
    const t = nextTime + off;
    const s = nextStep;
    for (const tr of TRACKS){
      const v = state.grid[tr.id][s];
      if (v === null || v === undefined) continue;
      trigger(tr.id, tr.type === 'pitch' ? v : 0, t, sd * (tr.id === 'bass' ? 1.6 : 1.2));
    }
    paintAt(t, s);
    nextTime += sd;
    nextStep = (s + 1) % STEPS;
  }
}

let paintQueue = [];
function paintAt(t, s){ paintQueue.push({t, s}); }

function start(){
  audio(); if (ac.state === 'suspended') ac.resume();
  state.playing = true;
  nextStep = 0; nextTime = ac.currentTime + 0.06;
  timer = setInterval(schedule, 25);
  schedule();
  $('#play').classList.add('playing');
  $('#playLabel').textContent = 'STOP';
  $('#onair').classList.add('live');
}
function stop(){
  state.playing = false;
  clearInterval(timer); timer = null;
  paintQueue = [];
  state.step = -1;
  $('#play').classList.remove('playing');
  $('#playLabel').textContent = 'PLAY';
  $('#onair').classList.remove('live');
  paintPlayhead();
}
function toggle(){ state.playing ? stop() : start(); }

/* ------------------------------------------------------------------ */
/* rendering                                                           */
/* ------------------------------------------------------------------ */
function renderPresets(){
  const host = $('#presets'); host.innerHTML = '';
  PRESETS.forEach((P, i) => {
    const el = document.createElement('button');
    el.className = 'preset' + (i === state.preset ? ' on' : '');
    el.innerHTML = `<i></i>CH·${P.code} <b>${P.name}</b>`;
    el.onclick = () => loadPreset(i);
    host.appendChild(el);
  });
}

function renderKeys(){
  const host = $('#keys'); host.innerHTML = '';
  SCALE.forEach((s, i) => {
    const el = document.createElement('button');
    el.className = 'key'; el.dataset.i = i;
    el.innerHTML = `<span class="n">${s.label.replace('+','<sup>+</sup>')}</span><span class="k">${s.key.toUpperCase()}</span>`;
    el.onmousedown = () => hitKey(i);
    host.appendChild(el);
  });
}

const cellEls = {}, headEls = [];
function renderGrid(){
  const nums = $('#stepNums');
  if (!nums.childElementCount){
    for (let i = 0; i < STEPS; i++){
      const d = document.createElement('div');
      d.textContent = i + 1;
      if (i % 4 === 0) d.classList.add('accent');
      nums.appendChild(d); headEls.push(d);
    }
  }
  const host = $('#tracks');
  if (!host.childElementCount){
    TRACKS.forEach((t, ti) => {
      const row = document.createElement('div'); row.className = 'mrow';
      const nm = document.createElement('div'); nm.className = 'tname';
      nm.innerHTML = `<span class="box"></span><span class="cid">CH·${String(ti+1).padStart(2,'0')}</span> ${t.name}`;
      nm.onclick = () => {
        state.mute[t.id] = !state.mute[t.id];
        nm.classList.toggle('muted', state.mute[t.id]);
      };
      const steps = document.createElement('div'); steps.className = 'steps';
      cellEls[t.id] = [];
      for (let i = 0; i < STEPS; i++){
        const c = document.createElement('button');
        c.className = 'cell';
        c.onclick = e => { e.preventDefault(); cellClick(t, i, +1); };
        c.oncontextmenu = e => { e.preventDefault(); cellClick(t, i, -1); };
        steps.appendChild(c); cellEls[t.id].push(c);
      }
      row.append(nm, steps); host.appendChild(row);
    });
  }
  TRACKS.forEach(t => {
    for (let i = 0; i < STEPS; i++) paintCell(t, i);
    host.children[TRACKS.indexOf(t)].firstChild.classList.toggle('muted', state.mute[t.id]);
  });
}

function paintCell(t, i){
  const c = cellEls[t.id][i], v = state.grid[t.id][i];
  c.className = 'cell' + (i % 4 === 0 ? '' : ' off4');
  c.innerHTML = '';
  if (v === null || v === undefined) return;
  if (t.type === 'pitch'){
    c.classList.add('note');
    if (t.id === 'bass') c.classList.add('bass');
    c.innerHTML = SCALE[v].label.replace('+','<sup>+</sup>');
  } else c.classList.add('on');
  lastPainted = -2; // playhead class was wiped; force a repaint
}

function cellClick(t, i, dir){
  const g = state.grid[t.id];
  if (t.type === 'drum'){
    g[i] = g[i] ? null : 1;
  } else {
    if (g[i] === null || g[i] === undefined) g[i] = dir > 0 ? 0 : SCALE.length - 1;
    else {
      const n = g[i] + dir;
      g[i] = (n < 0 || n >= SCALE.length) ? null : n;
    }
  }
  paintCell(t, i);
  if (!state.playing && g[i] !== null && g[i] !== undefined){
    audio(); if (ac.state === 'suspended') ac.resume();
    trigger(t.id, t.type === 'pitch' ? g[i] : 0, ac.currentTime + 0.01, 0.25);
  }
}

let lastPainted = -1;
function paintPlayhead(){
  const s = state.step;
  if (s === lastPainted) return;
  TRACKS.forEach(t => {
    for (let i = 0; i < STEPS; i++){
      cellEls[t.id][i].classList.toggle('here', i === s);
    }
  });
  headEls.forEach((d, i) => d.classList.toggle('here', i === s));
  lastPainted = s;
}

function syncControls(){
  $('#tempo').value = state.bpm; $('#tempoOut').textContent = state.bpm;
  $('#swing').value = state.swing; $('#swingOut').textContent = state.swing + '%';
  $('#volume').value = state.volume; $('#volumeOut').textContent = state.volume;
  if (master) master.gain.value = state.volume / 100 * 0.8;
}

/* ------------------------------------------------------------------ */
/* visualizer — glyph field driven by the analyser                     */
/* ------------------------------------------------------------------ */
const VCOLS = 48, VROWS = 15;
const RAMP = [' ', '-', '+', '/', '(', ')', '*', '▲', 'K', '#', '●'];
const COLORS = ['#0d2murky','#132f5c','#1b4380','#2360a8','#2f7fd0','#4c9ce8','#7fc4ff','#a9d3f7','#cfe6ff','#eef6ff','#ffffff'];
COLORS[0] = '#0f2748';
const TEAL = ['#1c6a72','#22a08f','#2fd6c0','#5cf0e8'];

const vizEl = $('#viz');
const vizCells = [];
(function buildViz(){
  for (let r = 0; r < VROWS; r++){
    const line = document.createElement('div');
    const row = [];
    for (let c = 0; c < VCOLS; c++){
      const s = document.createElement('span');
      s.textContent = ' ';
      line.appendChild(s); row.push(s);
    }
    vizEl.appendChild(line); vizCells.push(row);
  }
})();

// stable per-cell jitter so the field never looks like a clean gradient
const jitter = [];
for (let r = 0; r < VROWS; r++){
  jitter.push([]);
  for (let c = 0; c < VCOLS; c++) jitter[r].push(Math.random());
}

let level = 0, bassE = 0, midE = 0, hiE = 0;

function readAudio(){
  if (!analyser) { level *= 0.94; bassE *= 0.94; midE *= 0.94; hiE *= 0.94; return; }
  analyser.getByteFrequencyData(freqData);
  const n = freqData.length;
  let lo = 0, mid = 0, hi = 0;
  for (let i = 0; i < n; i++){
    const v = freqData[i] / 255;
    if (i < n * 0.12) lo += v; else if (i < n * 0.45) mid += v; else hi += v;
  }
  bassE = lo / (n * 0.12); midE = mid / (n * 0.33); hiE = hi / (n * 0.55);
  level = (bassE * 0.55 + midE * 0.3 + hiE * 0.15);
}

let t0 = performance.now();
function frame(now){
  requestAnimationFrame(frame);

  // playhead: consume scheduled paints
  if (state.playing && ac){
    while (paintQueue.length && paintQueue[0].t <= ac.currentTime){
      state.step = paintQueue.shift().s;
    }
    paintPlayhead();
  }

  readAudio();

  const t = (now - t0) / 1000;
  const cx = VCOLS * 0.5 + Math.sin(t * 0.31) * VCOLS * 0.22;
  const cy = VROWS * 0.5 + Math.cos(t * 0.24) * VROWS * 0.28;
  const pulse = 0.35 + level * 1.5;

  for (let r = 0; r < VROWS; r++){
    for (let c = 0; c < VCOLS; c++){
      const dx = (c - cx) / VCOLS * 2.4;
      const dy = (r - cy) / VROWS * 1.6;
      const d = Math.sqrt(dx * dx + dy * dy);

      let v = 0;
      v += Math.sin(d * 6.5 - t * 2.2 + bassE * 5) * 0.5 + 0.5;
      v += Math.sin(c * 0.31 + t * 0.9) * 0.22;
      v += Math.sin(r * 0.47 - t * 0.65 + midE * 3) * 0.22;
      v *= (1.15 - d * 0.55);
      v = v * (0.42 + pulse) + hiE * 0.35 * jitter[r][c];
      v += (jitter[r][c] - 0.5) * 0.34;
      v = 0.18 + v * 0.82; // keep the field dense — blanks are rare

      v = Math.max(0, Math.min(1, v));
      const idx = Math.min(RAMP.length - 1, Math.round(Math.pow(v, 1.35) * (RAMP.length - 1)));
      const el = vizCells[r][c];
      const ch = RAMP[idx];
      if (el.textContent !== ch) el.textContent = ch;

      let col;
      if (jitter[r][c] > 0.955 && idx > 1 && idx < 7) col = TEAL[Math.min(3, idx - 1)];
      else col = COLORS[idx];
      if (el.style.color !== col) el.style.color = col;
    }
  }
}
requestAnimationFrame(frame);

/* ------------------------------------------------------------------ */
/* keys + recording                                                    */
/* ------------------------------------------------------------------ */
function hitKey(i){
  audio(); if (ac.state === 'suspended') ac.resume();
  const el = $('#keys').children[i];
  el.classList.add('hit'); setTimeout(() => el.classList.remove('hit'), 110);
  playPitch(state.lane, i, ac.currentTime + 0.005, 0.35);
  if (state.rec && state.playing){
    const s = (state.step + 1) % STEPS;
    state.grid[state.lane][s] = i;
    paintCell(TRACKS.find(t => t.id === state.lane), s);
  } else if (state.rec){
    const t = TRACKS.find(t => t.id === state.lane);
    const s = state.grid[state.lane].findIndex(v => v === null || v === undefined);
    if (s >= 0){ state.grid[state.lane][s] = i; paintCell(t, s); }
  }
}

/* ------------------------------------------------------------------ */
/* wiring                                                              */
/* ------------------------------------------------------------------ */
$('#play').onclick = toggle;

$('#tempo').oninput = e => { state.bpm = +e.target.value; $('#tempoOut').textContent = state.bpm; };
$('#swing').oninput = e => { state.swing = +e.target.value; $('#swingOut').textContent = state.swing + '%'; };
$('#volume').oninput = e => {
  state.volume = +e.target.value; $('#volumeOut').textContent = state.volume;
  if (master) master.gain.value = state.volume / 100 * 0.8;
};

$('#clear').onclick = () => {
  TRACKS.forEach(t => state.grid[t.id] = new Array(STEPS).fill(null));
  renderGrid();
};

$('#random').onclick = () => {
  const dens = {kick:.34,snare:.16,clap:.12,hat:.5,ohat:.16,rim:.12,tom:.1,cowbell:.14,shaker:.42,crash:.08};
  TRACKS.forEach(t => {
    const g = state.grid[t.id] = new Array(STEPS).fill(null);
    if (t.type === 'pitch'){
      for (let i = 0; i < STEPS; i++) if (Math.random() < (t.id === 'bass' ? 0.4 : 0.3)) g[i] = (Math.random() * SCALE.length) | 0;
    } else {
      for (let i = 0; i < STEPS; i++) if (Math.random() < dens[t.id]) g[i] = 1;
    }
  });
  renderGrid();
};

$('#rec').onclick = e => {
  state.rec = !state.rec;
  e.currentTarget.classList.toggle('on', state.rec);
};

document.querySelectorAll('.lane').forEach(el => {
  el.onclick = () => {
    state.lane = el.dataset.lane;
    document.querySelectorAll('.lane').forEach(o => o.classList.toggle('on', o === el));
  };
});

document.addEventListener('keydown', e => {
  if (e.target.tagName === 'INPUT') return;
  if (e.code === 'Space'){ e.preventDefault(); toggle(); return; }
  const i = SCALE.findIndex(s => s.key === e.key.toLowerCase());
  if (i >= 0 && !e.repeat) hitKey(i);
});

renderPresets(); renderKeys(); renderGrid(); loadPreset(0); syncControls();

})();
