/* ==========================================================================
   BEETBOX — beat sequencing · channel desk.
   A 16-step, 12-channel drum machine with two pitched voices, an ASCII
   energy-field visualiser and a fully synthesised (Web Audio) drum kit.
   ========================================================================== */

/* -------------------------------------------------------------- constants */

const STEPS = 16;

/* A-minor pentatonic, one label per playable key */
const SCALE = [
  { label: 'A',  sup: '',  lead: 440.00, bass: 110.00 },
  { label: 'C',  sup: '',  lead: 523.25, bass: 130.81 },
  { label: 'D',  sup: '',  lead: 587.33, bass: 146.83 },
  { label: 'E',  sup: '',  lead: 659.25, bass: 164.81 },
  { label: 'G',  sup: '',  lead: 783.99, bass: 196.00 },
  { label: 'A',  sup: '+', lead: 880.00, bass: 220.00 },
  { label: 'C',  sup: '+', lead: 1046.5, bass: 261.63 },
];
const KEYMAP = ['a', 's', 'd', 'f', 'g', 'h', 'j'];

/* channel order matches the desk: two pitched voices, then the kit */
const TRACKS = [
  { id: 'lead',    name: 'Lead',     kind: 'note' },
  { id: 'bass',    name: 'Bass',     kind: 'note' },
  { id: 'kick',    name: 'Kick',     kind: 'drum' },
  { id: 'snare',   name: 'Snare',    kind: 'drum' },
  { id: 'clap',    name: 'Clap',     kind: 'drum' },
  { id: 'hihat',   name: 'Hi‑hat',  kind: 'drum' },
  { id: 'openhat', name: 'Open hat', kind: 'drum' },
  { id: 'rim',     name: 'Rimshot',  kind: 'drum' },
  { id: 'tom',     name: 'Tom',      kind: 'drum' },
  { id: 'cowbell', name: 'Cowbell',  kind: 'drum' },
  { id: 'shaker',  name: 'Shaker',   kind: 'drum' },
  { id: 'crash',   name: 'Crash',    kind: 'drum' },
];

/* `x` = hit.  note rows use one char per step: `.` = rest, else scale index */
const PRESETS = [
  {
    code: '10', name: 'DARKROOM', tempo: 132, swing: 0,
    lead:    '..4...2.....6..5',
    bass:    '0..0..0.0..0..3.',
    kick:    'x...x...x...x...',
    snare:   '................',
    clap:    '....x.......x...',
    hihat:   'xx.xxx.xxx.xxx.x',
    openhat: '..x...x...x...x.',
    rim:     '.......x.......x',
    tom:     '..............x.',
    cowbell: '................',
    shaker:  'x.x.x.x.x.x.x.x.',
    crash:   'x...............',
  },
  {
    code: '20', name: 'GREASE', tempo: 104, swing: 22,
    lead:    '....3...1...4..6',
    bass:    '0.0..0..2.2..0..',
    kick:    'x..x..x...x.x...',
    snare:   '....x.......x...',
    clap:    '................',
    hihat:   'x.xxx.xxx.xxx.xx',
    openhat: '......x.......x.',
    rim:     '..x.......x.....',
    tom:     '..........x....x',
    cowbell: '................',
    shaker:  '.x.x.x.x.x.x.x.x',
    crash:   'x...............',
  },
  {
    code: '30', name: 'BACKSTREET', tempo: 96, swing: 30,
    lead:    '..1...3...5...2.',
    bass:    '0...0..3..0.4...',
    kick:    'x.....x.x.....x.',
    snare:   '....x.......x...',
    clap:    '....x.......x...',
    hihat:   'x.x.x.x.x.x.x.x.',
    openhat: '.......x.......x',
    rim:     '...x.......x....',
    tom:     '..............x.',
    cowbell: '..x.......x.....',
    shaker:  'xx.xxx.xxx.xxx.x',
    crash:   'x...............',
  },
  {
    code: '40', name: 'DAYLIGHT', tempo: 120, swing: 8,
    lead:    '4...5...6...4..3',
    bass:    '1...1...4...4...',
    kick:    'x...x..xx...x...',
    snare:   '....x.......x...',
    clap:    '................',
    hihat:   'xxxxxxxxxxxxxxxx',
    openhat: '...x.......x....',
    rim:     '................',
    tom:     '...........x....',
    cowbell: '................',
    shaker:  '..x...x...x...x.',
    crash:   'x.............x.',
  },
  {
    code: '50', name: 'ACID', tempo: 140, swing: 8,
    lead:    '0.4.0.5.0.3.6.5.',
    bass:    '0020002000300020',
    kick:    'x...x...x...x...',
    snare:   '....x.......x...',
    clap:    '............x...',
    hihat:   '.x.x.x.x.x.x.x.x',
    openhat: '..x.......x.....',
    rim:     '................',
    tom:     '..............x.',
    cowbell: '................',
    shaker:  '................',
    crash:   '........x.......',
  },
];

/* --------------------------------------------------------------- app state */

const state = {
  playing: false,
  step: -1,
  tempo: 132,
  swing: 0,
  volume: 90,
  preset: 0,
  voice: 'lead',
  loopRec: false,
  muted: {},
  pattern: {},          // trackId -> array(16) of bool | (0..6|null)
};

TRACKS.forEach(t => {
  state.muted[t.id] = false;
  state.pattern[t.id] = new Array(STEPS).fill(t.kind === 'note' ? null : false);
});

function loadPreset(i) {
  const p = PRESETS[i];
  state.preset = i;
  TRACKS.forEach(t => {
    const src = p[t.id] || '';
    state.pattern[t.id] = Array.from({ length: STEPS }, (_, s) => {
      const c = src[s];
      if (t.kind === 'note') return c && c !== '.' ? Number(c) : null;
      return c === 'x';
    });
  });
  state.tempo = p.tempo;
  state.swing = p.swing;
}

/* ============================================================ audio engine */

let ac = null, master = null, comp = null, noiseBuf = null;

function initAudio() {
  if (ac) return;
  ac = new (window.AudioContext || window.webkitAudioContext)();

  comp = ac.createDynamicsCompressor();
  comp.threshold.value = -14;
  comp.knee.value = 22;
  comp.ratio.value = 4;
  comp.attack.value = 0.003;
  comp.release.value = 0.22;

  master = ac.createGain();
  master.gain.value = vol();
  comp.connect(master).connect(ac.destination);

  const n = ac.sampleRate * 2;
  noiseBuf = ac.createBuffer(1, n, ac.sampleRate);
  const d = noiseBuf.getChannelData(0);
  for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
}

const vol = () => Math.pow(state.volume / 100, 1.6) * 0.85;

function noise(t, dur) {
  const s = ac.createBufferSource();
  s.buffer = noiseBuf;
  s.playbackRate.value = 0.85 + Math.random() * 0.3;
  s.start(t);
  s.stop(t + dur + 0.02);
  return s;
}
function env(t, a, d, peak) {
  const g = ac.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(peak, t + a);
  g.gain.exponentialRampToValueAtTime(0.0001, t + a + d);
  return g;
}

const VOICES = {
  kick(t) {
    const o = ac.createOscillator(); o.type = 'sine';
    o.frequency.setValueAtTime(155, t);
    o.frequency.exponentialRampToValueAtTime(44, t + 0.13);
    const g = env(t, 0.002, 0.42, 1.0);
    o.connect(g).connect(comp);
    o.start(t); o.stop(t + 0.5);

    const c = noise(t, 0.02);
    const cf = ac.createBiquadFilter(); cf.type = 'highpass'; cf.frequency.value = 1400;
    const cg = env(t, 0.001, 0.02, 0.28);
    c.connect(cf).connect(cg).connect(comp);
  },
  snare(t) {
    const n = noise(t, 0.22);
    const f = ac.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 1300;
    const g = env(t, 0.002, 0.18, 0.5);
    n.connect(f).connect(g).connect(comp);

    const o = ac.createOscillator(); o.type = 'triangle';
    o.frequency.setValueAtTime(205, t);
    o.frequency.exponentialRampToValueAtTime(150, t + 0.1);
    const og = env(t, 0.002, 0.11, 0.42);
    o.connect(og).connect(comp);
    o.start(t); o.stop(t + 0.2);
  },
  clap(t) {
    for (let i = 0; i < 3; i++) {
      const st = t + i * 0.012;
      const n = noise(st, 0.05);
      const f = ac.createBiquadFilter(); f.type = 'bandpass';
      f.frequency.value = 1150; f.Q.value = 1.1;
      const g = env(st, 0.001, 0.035, 0.42);
      n.connect(f).connect(g).connect(comp);
    }
    const n = noise(t + 0.03, 0.2);
    const f = ac.createBiquadFilter(); f.type = 'bandpass';
    f.frequency.value = 1250; f.Q.value = 0.8;
    const g = env(t + 0.03, 0.004, 0.16, 0.26);
    n.connect(f).connect(g).connect(comp);
  },
  hihat(t) {
    const n = noise(t, 0.06);
    const f = ac.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 8200;
    const g = env(t, 0.001, 0.042, 0.3);
    n.connect(f).connect(g).connect(comp);
  },
  openhat(t) {
    const n = noise(t, 0.4);
    const f = ac.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 7000;
    const g = env(t, 0.002, 0.34, 0.26);
    n.connect(f).connect(g).connect(comp);
  },
  rim(t) {
    const o = ac.createOscillator(); o.type = 'triangle';
    o.frequency.setValueAtTime(1750, t);
    o.frequency.exponentialRampToValueAtTime(420, t + 0.03);
    const g = env(t, 0.001, 0.035, 0.4);
    o.connect(g).connect(comp);
    o.start(t); o.stop(t + 0.08);

    const n = noise(t, 0.03);
    const f = ac.createBiquadFilter(); f.type = 'bandpass';
    f.frequency.value = 2400; f.Q.value = 2;
    const ng = env(t, 0.001, 0.025, 0.22);
    n.connect(f).connect(ng).connect(comp);
  },
  tom(t) {
    const o = ac.createOscillator(); o.type = 'sine';
    o.frequency.setValueAtTime(235, t);
    o.frequency.exponentialRampToValueAtTime(92, t + 0.24);
    const g = env(t, 0.003, 0.3, 0.6);
    o.connect(g).connect(comp);
    o.start(t); o.stop(t + 0.4);
  },
  cowbell(t) {
    const f = ac.createBiquadFilter(); f.type = 'bandpass';
    f.frequency.value = 2640; f.Q.value = 1.4;
    const g = env(t, 0.002, 0.26, 0.3);
    f.connect(g).connect(comp);
    [540, 800].forEach(hz => {
      const o = ac.createOscillator(); o.type = 'square';
      o.frequency.value = hz;
      o.connect(f); o.start(t); o.stop(t + 0.32);
    });
  },
  shaker(t) {
    const n = noise(t, 0.09);
    const f = ac.createBiquadFilter(); f.type = 'bandpass';
    f.frequency.value = 6400; f.Q.value = 1.1;
    const g = ac.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.26, t + 0.018);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.075);
    n.connect(f).connect(g).connect(comp);
  },
  crash(t) {
    const n = noise(t, 1.5);
    const f = ac.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 5200;
    const g = env(t, 0.003, 1.4, 0.24);
    n.connect(f).connect(g).connect(comp);
  },
  lead(t, hz) {
    const g = env(t, 0.006, 0.34, 0.22);
    const f = ac.createBiquadFilter(); f.type = 'lowpass';
    f.frequency.setValueAtTime(hz * 6, t);
    f.frequency.exponentialRampToValueAtTime(hz * 1.6, t + 0.3);
    f.Q.value = 5;
    f.connect(g).connect(comp);
    [-6, 6].forEach(det => {
      const o = ac.createOscillator(); o.type = 'sawtooth';
      o.frequency.value = hz; o.detune.value = det;
      o.connect(f); o.start(t); o.stop(t + 0.45);
    });
  },
  bass(t, hz) {
    const g = env(t, 0.006, 0.3, 0.5);
    const f = ac.createBiquadFilter(); f.type = 'lowpass';
    f.frequency.setValueAtTime(hz * 9, t);
    f.frequency.exponentialRampToValueAtTime(hz * 2.2, t + 0.24);
    f.Q.value = 7;
    f.connect(g).connect(comp);
    const o = ac.createOscillator(); o.type = 'square';
    o.frequency.value = hz;
    const o2 = ac.createOscillator(); o2.type = 'sine';
    o2.frequency.value = hz / 2;
    o.connect(f); o2.connect(f);
    o.start(t); o.stop(t + 0.4);
    o2.start(t); o2.stop(t + 0.4);
  },
};

function trigger(id, t, pitch) {
  if (!ac || state.muted[id]) return;
  if (id === 'lead') VOICES.lead(t, SCALE[pitch].lead);
  else if (id === 'bass') VOICES.bass(t, SCALE[pitch].bass);
  else VOICES[id] && VOICES[id](t);
}

/* ------------------------------------------------------------- scheduling */

const LOOKAHEAD = 0.12;
let nextTime = 0, schedStep = 0, timer = null;

function stepDur() { return 60 / state.tempo / 4; }

function scheduleStep(s, t) {
  TRACKS.forEach((tr, i) => {
    const v = state.pattern[tr.id][s];
    if (tr.kind === 'note') {
      if (v !== null && v !== undefined) { trigger(tr.id, t, v); spawnPulse(i, s, t, 0.55); }
    } else if (v) {
      trigger(tr.id, t);
      spawnPulse(i, s, t, PULSE_AMP[tr.id] ?? 0.5);
    }
  });
  uiSteps.push({ s, t });
}

const uiSteps = [];

function scheduler() {
  const now = ac.currentTime;
  while (nextTime < now + LOOKAHEAD) {
    scheduleStep(schedStep, nextTime);
    const d = stepDur();
    const sw = (state.swing / 100) * d * 0.9;
    nextTime += (schedStep % 2 === 0) ? d + sw : d - sw;
    schedStep = (schedStep + 1) % STEPS;
  }
}

function play() {
  initAudio();
  if (ac.state === 'suspended') ac.resume();
  state.playing = true;
  schedStep = 0;
  nextTime = ac.currentTime + 0.06;
  uiSteps.length = 0;
  timer = setInterval(scheduler, 25);
  scheduler();
  syncTransport();
}

function stop() {
  state.playing = false;
  clearInterval(timer);
  timer = null;
  uiSteps.length = 0;
  state.step = -1;
  paintColumn(-1);
  syncTransport();
}

const togglePlay = () => (state.playing ? stop() : play());

/* ================================================================= UI: DOM */

const $ = sel => document.querySelector(sel);

/* ---- pixel wordmark ---- */

const GLYPHS = {
  B: ['11110', '10010', '11110', '10010', '11110'],
  E: ['11111', '10000', '11110', '10000', '11111'],
  T: ['11111', '00100', '00100', '00100', '00100'],
  O: ['11111', '10001', '10001', '10001', '11111'],
  X: ['10001', '01010', '00100', '01010', '10001'],
};

(function buildLogo() {
  const host = $('#logo');
  'BEETBOX'.split('').forEach(ch => {
    const el = document.createElement('div');
    el.className = 'ltr';
    GLYPHS[ch].forEach(row => row.split('').forEach(bit => {
      const px = document.createElement('div');
      px.className = bit === '1' ? 'px' : 'px off';
      el.appendChild(px);
    }));
    host.appendChild(el);
  });
})();

/* ---- presets ---- */

const presetEls = PRESETS.map((p, i) => {
  const b = document.createElement('button');
  b.className = 'preset';
  b.innerHTML = `<i></i>CH·${p.code} <b>${p.name}</b>`;
  b.addEventListener('click', () => {
    loadPreset(i);
    syncPresets(); syncKnobs(); renderAll();
  });
  $('#presets').appendChild(b);
  return b;
});

function syncPresets() {
  presetEls.forEach((b, i) => b.classList.toggle('on', i === state.preset));
}

/* ---- sequencer grid ---- */

const grid = $('#grid');
const cellEls = {};      // trackId -> [16 elements]
const labelEls = {};
const numEls = [];

(function buildGrid() {
  const head = document.createElement('div');
  head.className = 'g-head';
  head.textContent = 'TRACK click = mute ⇩';
  grid.appendChild(head);

  for (let s = 0; s < STEPS; s++) {
    const n = document.createElement('div');
    n.className = 'g-num' + (s % 4 === 0 ? ' beat' : '');
    n.textContent = s + 1;
    grid.appendChild(n);
    numEls.push(n);
  }

  TRACKS.forEach((tr, ti) => {
    const lab = document.createElement('div');
    lab.className = 't-label';
    lab.innerHTML = `<i></i><span class="ch">CH·${String(ti + 1).padStart(2, '0')}</span>` +
                    `<span class="nm">${tr.name}</span>`;
    lab.addEventListener('click', () => {
      state.muted[tr.id] = !state.muted[tr.id];
      syncMute(tr.id);
    });
    grid.appendChild(lab);
    labelEls[tr.id] = lab;

    cellEls[tr.id] = [];
    for (let s = 0; s < STEPS; s++) {
      const c = document.createElement('div');
      c.className = 'cell';
      c.addEventListener('mousedown', e => onCellDown(e, tr, s));
      c.addEventListener('mouseenter', e => onCellPaint(e, tr, s));
      c.addEventListener('contextmenu', e => {
        e.preventDefault();
        if (tr.kind === 'note') cycleNote(tr.id, s, -1);
        else { state.pattern[tr.id][s] = false; paintCell(tr, s); }
      });
      grid.appendChild(c);
      cellEls[tr.id].push(c);
    }
  });
})();

let paintMode = null;

function onCellDown(e, tr, s) {
  if (e.button !== 0) return;
  initAudio();
  if (tr.kind === 'note') {
    cycleNote(tr.id, s, +1);
    const v = state.pattern[tr.id][s];
    if (v !== null) trigger(tr.id, ac.currentTime, v);
    paintMode = null;
  } else {
    const nv = !state.pattern[tr.id][s];
    state.pattern[tr.id][s] = nv;
    paintMode = nv;
    paintCell(tr, s);
    if (nv) trigger(tr.id, ac.currentTime);
  }
}

function onCellPaint(e, tr, s) {
  if (paintMode === null || !(e.buttons & 1) || tr.kind === 'note') return;
  state.pattern[tr.id][s] = paintMode;
  paintCell(tr, s);
}

window.addEventListener('mouseup', () => { paintMode = null; });

function cycleNote(id, s, dir) {
  const v = state.pattern[id][s];
  let nv;
  if (v === null) nv = dir > 0 ? 0 : SCALE.length - 1;
  else {
    nv = v + dir;
    if (nv < 0 || nv >= SCALE.length) nv = null;
  }
  state.pattern[id][s] = nv;
  paintCell(TRACKS.find(t => t.id === id), s);
}

/* ---- painting ---- */

function noteShade(kind, p) {
  const v = kind === 'lead'
    ? Math.min(255, 202 + p * 10)
    : Math.min(255, 170 + p * 9);
  return `rgb(${v},${v + 2},${v + 5})`;
}

function paintCell(tr, s) {
  const el = cellEls[tr.id][s];
  const v = state.pattern[tr.id][s];
  const isCol = s === state.step;
  el.classList.toggle('col', isCol);

  if (tr.kind === 'note') {
    const on = v !== null && v !== undefined;
    el.classList.toggle('on', on);
    el.classList.toggle('note', on);
    el.innerHTML = on ? SCALE[v].label + (SCALE[v].sup ? '<sup>+</sup>' : '') : '';
    el.style.background = on && !isCol && !state.muted[tr.id]
      ? noteShade(tr.id, v) : '';
  } else {
    el.classList.toggle('on', !!v);
  }
}

function paintRow(tr) { for (let s = 0; s < STEPS; s++) paintCell(tr, s); }
function renderAll() { TRACKS.forEach(paintRow); TRACKS.forEach(t => syncMute(t.id, true)); }

function syncMute(id, quiet) {
  const m = state.muted[id];
  labelEls[id].classList.toggle('muted', m);
  cellEls[id].forEach(c => c.classList.toggle('mut', m));
  if (!quiet) paintRow(TRACKS.find(t => t.id === id));
}

function paintColumn(cur) {
  const prev = state.step;
  state.step = cur;
  numEls.forEach((n, i) => n.classList.toggle('cur', i === cur));
  TRACKS.forEach(tr => {
    if (prev >= 0) paintCell(tr, prev);
    if (cur >= 0) paintCell(tr, cur);
  });
}

/* ---- transport widgets ---- */

const playBtn = $('#playBtn'), onAir = $('#onAir');

playBtn.addEventListener('click', togglePlay);

function syncTransport() {
  playBtn.classList.toggle('playing', state.playing);
  $('#playLabel').textContent = state.playing ? 'STOP' : 'PLAY';
  onAir.classList.toggle('live', state.playing);
}

function bindSlider(inputSel, valSel, key, fmt) {
  const el = $(inputSel), out = $(valSel);
  el.addEventListener('input', () => {
    state[key] = Number(el.value);
    out.textContent = fmt(state[key]);
    if (key === 'volume' && master) master.gain.value = vol();
  });
}
bindSlider('#tempo', '#tempoVal', 'tempo', v => v);
bindSlider('#swing', '#swingVal', 'swing', v => v + '%');
bindSlider('#volume', '#volVal', 'volume', v => v);

function syncKnobs() {
  $('#tempo').value = state.tempo;   $('#tempoVal').textContent = state.tempo;
  $('#swing').value = state.swing;   $('#swingVal').textContent = state.swing + '%';
  $('#volume').value = state.volume; $('#volVal').textContent = state.volume;
  if (master) master.gain.value = vol();
}

/* ---- clear / random ---- */

$('#clearBtn').addEventListener('click', () => {
  TRACKS.forEach(t => state.pattern[t.id] =
    new Array(STEPS).fill(t.kind === 'note' ? null : false));
  renderAll();
});

const DENSITY = {
  kick: .42, snare: .16, clap: .12, hihat: .55, openhat: .14,
  rim: .12, tom: .10, cowbell: .12, shaker: .38, crash: .07,
};

$('#randomBtn').addEventListener('click', () => {
  TRACKS.forEach(t => {
    state.pattern[t.id] = Array.from({ length: STEPS }, (_, s) => {
      if (t.kind === 'note') {
        const chance = t.id === 'bass' ? .45 : .3;
        return Math.random() < chance ? (Math.random() * SCALE.length) | 0 : null;
      }
      let p = DENSITY[t.id];
      if (s % 4 === 0) p *= 1.7;          // favour downbeats
      return Math.random() < p;
    });
  });
  renderAll();
});

/* ---- loop rec + voice toggle ---- */

const loopBtn = $('#loopBtn');
loopBtn.addEventListener('click', () => {
  state.loopRec = !state.loopRec;
  loopBtn.classList.toggle('on', state.loopRec);
});

const voiceBtns = [...document.querySelectorAll('.voice')];
voiceBtns.forEach(b => b.addEventListener('click', () => {
  state.voice = b.dataset.voice;
  voiceBtns.forEach(x => x.classList.toggle('on', x === b));
}));

/* ---- note keys ---- */

const keyEls = SCALE.map((n, i) => {
  const b = document.createElement('button');
  b.className = 'key';
  b.innerHTML = `<span class="note">${n.label}${n.sup ? '<sup>+</sup>' : ''}</span>` +
                `<span class="kbd">${KEYMAP[i].toUpperCase()}</span>`;
  b.addEventListener('mousedown', () => hitNote(i));
  $('#keys').appendChild(b);
  return b;
});

function hitNote(i) {
  initAudio();
  if (ac.state === 'suspended') ac.resume();
  const id = state.voice;
  trigger(id, ac.currentTime, i);
  spawnPulse(id === 'lead' ? 0 : 1, state.step, ac.currentTime, 0.6);

  keyEls[i].classList.add('hit');
  setTimeout(() => keyEls[i].classList.remove('hit'), 110);

  if (state.loopRec) {
    const s = state.playing && state.step >= 0 ? state.step : 0;
    state.pattern[id][s] = i;
    paintCell(TRACKS.find(t => t.id === id), s);
  }
}

/* ---- keyboard ---- */

window.addEventListener('keydown', e => {
  if (e.repeat || e.metaKey || e.ctrlKey || e.altKey) return;
  if (e.code === 'Space') { e.preventDefault(); togglePlay(); return; }
  const i = KEYMAP.indexOf(e.key.toLowerCase());
  if (i >= 0) { e.preventDefault(); hitNote(i); }
});

/* ========================================================= ASCII visualiser */

const CHARS  = [' ', '−', '+', '/', '(', ')', '*', '▲', '●', '⬡', 'K', '#'];
const vizEl = $('#viz');
const VIZ_ROWS = 15;
let VIZ_COLS = 60;

const PULSE_AMP = {
  kick: .95, crash: 1.0, snare: .8, clap: .7, tom: .7, openhat: .5,
  cowbell: .6, rim: .45, hihat: .34, shaker: .3,
};

const pulses = [];
const pending = [];

function spawnPulse(trackIdx, step, when, amp) {
  pending.push({ when, trackIdx, step, amp });
}

function measureCols() {
  const probe = document.createElement('span');
  probe.style.cssText = 'position:absolute;visibility:hidden;white-space:pre';
  probe.className = 'viz';
  probe.textContent = 'M'.repeat(40);
  vizEl.parentNode.appendChild(probe);
  const w = probe.getBoundingClientRect().width / 40;
  probe.remove();
  VIZ_COLS = Math.max(24, Math.floor(vizEl.getBoundingClientRect().width / w));
}

/* stable per-cell grain so neighbouring glyphs never march in lockstep */
function grain(x, y) {
  const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return (n - Math.floor(n)) * 2 - 1;
}

function fieldBase(x, y, t) {
  const a = Math.sin(x * 0.47 + t * 0.72 + Math.sin(y * 0.61 + t * 0.41) * 1.5);
  const b = Math.sin(y * 0.79 - t * 0.55 + Math.sin(x * 0.23 - t * 0.31) * 1.25);
  const c = Math.sin((x * 0.11 + y * 0.19) * 1.4 + t * 0.86);
  const d = Math.sin(x * 1.27 - y * 0.93 + t * 1.4);
  return ((a + b + c) / 3) * 0.72 + d * 0.14 + grain(x, y) * 0.14;
}

let energy = 0, lastFrame = 0;

function renderViz(now) {
  requestAnimationFrame(renderViz);
  if (now - lastFrame < 33) return;
  lastFrame = now;

  const t = now / 1000;

  /* promote scheduled pulses whose audio time has arrived */
  if (ac) {
    const at = ac.currentTime;
    for (let i = pending.length - 1; i >= 0; i--) {
      if (pending[i].when <= at) {
        const p = pending.splice(i, 1)[0];
        const seed = p.trackIdx * 1.73 + p.step * 0.91;
        pulses.push({
          x: (0.5 + 0.42 * Math.sin(seed * 1.31 + p.trackIdx * 0.7)) * VIZ_COLS,
          y: (0.5 + 0.40 * Math.cos(seed * 0.87 + p.trackIdx * 1.9)) * VIZ_ROWS,
          amp: p.amp,
          born: t,
        });
        energy = Math.min(1.0, energy + p.amp * 0.4);
      }
    }
  }
  energy *= 0.90;

  for (let i = pulses.length - 1; i >= 0; i--) {
    if (t - pulses[i].born > 1.6) pulses.splice(i, 1);
  }

  const amb = 0.045 + 0.05 * energy;
  const gain = 0.44 + 0.10 * energy;

  let html = '';
  for (let y = 0; y < VIZ_ROWS; y++) {
    let runLvl = -1, runTxt = '';
    for (let x = 0; x < VIZ_COLS; x++) {
      let v = amb + (0.5 + 0.5 * fieldBase(x, y, t)) * gain;

      let hit = 0;
      for (let i = 0; i < pulses.length; i++) {
        const p = pulses[i];
        const age = t - p.born;
        const decay = Math.exp(-age * 2.6);
        if (decay < 0.03) continue;
        const sx = 2.2 + age * 4.5;
        const sy = 1.3 + age * 2.4;
        const dx = (x - p.x) / sx, dy = (y - p.y) / sy;
        const d2 = dx * dx + dy * dy;
        if (d2 > 9) continue;
        hit += p.amp * decay * Math.exp(-d2 * 0.62);
      }
      v += Math.min(hit, 0.72);

      let lvl = Math.floor(v * 12.4);
      if (lvl < 0) lvl = 0; else if (lvl > 11) lvl = 11;

      /* a few teal accents scattered through the low band */
      let cls = lvl;
      if ((lvl === 2 || lvl === 1) && ((x * 7 + y * 13 + (x * y) % 5) % 23) === 0) cls = 'a';

      if (cls !== runLvl) {
        if (runLvl !== -1) html += `<span class="v${runLvl}">${runTxt}</span>`;
        runLvl = cls; runTxt = '';
      }
      runTxt += CHARS[lvl];
    }
    if (runLvl !== -1) html += `<span class="v${runLvl}">${runTxt}</span>`;
    if (y < VIZ_ROWS - 1) html += '\n';
  }
  vizEl.innerHTML = html;
}

/* ---------------------------------------------------------- playhead paint */

function uiTick() {
  requestAnimationFrame(uiTick);
  if (!state.playing || !ac) return;
  const now = ac.currentTime;
  let cur = null;
  while (uiSteps.length && uiSteps[0].t <= now) cur = uiSteps.shift();
  if (cur && cur.s !== state.step) paintColumn(cur.s);
}

/* ==================================================================== boot */

loadPreset(0);
state.volume = 90;
syncPresets();
syncKnobs();
renderAll();
syncTransport();
measureCols();
window.addEventListener('resize', measureCols);
requestAnimationFrame(renderViz);
requestAnimationFrame(uiTick);
