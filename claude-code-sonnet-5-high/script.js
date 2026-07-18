'use strict';

/* =========================================================
   BEETBOX — beat sequencing · channel desk.
   Vanilla JS + Web Audio synthesis, no dependencies.
   ========================================================= */

/* ---------------- Track / pitch definitions ---------------- */

const TRACKS = [
  { id: 'lead',    ch: '01', name: 'Lead',     pitched: true },
  { id: 'bass',    ch: '02', name: 'Bass',     pitched: true },
  { id: 'kick',    ch: '03', name: 'Kick' },
  { id: 'snare',   ch: '04', name: 'Snare' },
  { id: 'clap',    ch: '05', name: 'Clap' },
  { id: 'hihat',   ch: '06', name: 'Hi-hat' },
  { id: 'openhat', ch: '07', name: 'Open hat' },
  { id: 'rimshot', ch: '08', name: 'Rimshot' },
  { id: 'tom',     ch: '09', name: 'Tom' },
  { id: 'cowbell', ch: '10', name: 'Cowbell' },
  { id: 'shaker',  ch: '11', name: 'Shaker' },
  { id: 'crash',   ch: '12', name: 'Crash' },
];

const PITCHES = ['A', 'C', 'D', 'E', 'G', 'A+', 'C+'];
const PITCH_KEYS = ['A', 'S', 'D', 'F', 'G', 'H', 'J'];

const BASE_FREQ = { A: 220.00, C: 261.63, D: 293.66, E: 329.63, G: 392.00, 'A+': 440.00, 'C+': 523.25 };
const leadFreq = note => BASE_FREQ[note] * 2;
const bassFreq = note => BASE_FREQ[note] * 0.5;

const STEPS = 16;

function emptyPattern() {
  const p = {};
  TRACKS.forEach(t => { p[t.id] = t.pitched ? new Array(STEPS).fill(null) : new Array(STEPS).fill(false); });
  return p;
}

/* ---------------- Presets ---------------- */

function onSteps(list) {
  const arr = new Array(STEPS).fill(false);
  list.forEach(i => arr[i - 1] = true);
  return arr;
}
function noteSteps(map) {
  const arr = new Array(STEPS).fill(null);
  Object.keys(map).forEach(k => arr[+k - 1] = map[k]);
  return arr;
}

const PRESETS = {
  darkroom: {
    label: 'DARKROOM', tempo: 132, swing: 0,
    pattern: {
      lead: noteSteps({ 3: 'G', 7: 'D', 13: 'C+', 16: 'A+' }),
      bass: noteSteps({ 1: 'A', 4: 'A', 7: 'A', 9: 'A', 12: 'A', 15: 'E' }),
      kick: onSteps([1, 5, 9, 13]),
      snare: onSteps([]),
      clap: onSteps([5, 13]),
      hihat: onSteps([1, 2, 4, 5, 6, 8, 9, 10, 12, 13, 14, 16]),
      openhat: onSteps([3, 7, 11, 15]),
      rimshot: onSteps([8, 16]),
      tom: onSteps([15]),
      cowbell: onSteps([]),
      shaker: onSteps([1, 3, 5, 7, 9, 11, 13, 15]),
      crash: onSteps([1]),
    },
  },
  grease: {
    label: 'GREASE', tempo: 108, swing: 26,
    pattern: {
      lead: noteSteps({ 2: 'E', 6: 'G', 9: 'E', 14: 'C' }),
      bass: noteSteps({ 1: 'A', 3: 'C', 5: 'A', 7: 'D', 9: 'A', 11: 'C', 13: 'A', 15: 'E' }),
      kick: onSteps([1, 7, 9, 12]),
      snare: onSteps([5, 13]),
      clap: onSteps([5, 13]),
      hihat: onSteps([1, 3, 5, 7, 9, 11, 13, 15]),
      openhat: onSteps([4, 8, 12, 16]),
      rimshot: onSteps([3, 11]),
      tom: onSteps([16]),
      cowbell: onSteps([3, 7, 11, 15]),
      shaker: onSteps([2, 4, 6, 8, 10, 12, 14, 16]),
      crash: onSteps([1]),
    },
  },
  backstreet: {
    label: 'BACKSTREET', tempo: 100, swing: 12,
    pattern: {
      lead: noteSteps({ 1: 'C', 4: 'E', 8: 'G', 9: 'C', 12: 'E', 16: 'D' }),
      bass: noteSteps({ 1: 'C', 5: 'A', 9: 'D', 13: 'G' }),
      kick: onSteps([1, 9, 11]),
      snare: onSteps([5, 13]),
      clap: onSteps([5, 13]),
      hihat: onSteps([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]),
      openhat: onSteps([7, 15]),
      rimshot: onSteps([3, 11]),
      tom: onSteps([14, 15]),
      cowbell: onSteps([]),
      shaker: onSteps([3, 7, 11, 15]),
      crash: onSteps([1]),
    },
  },
  daylight: {
    label: 'DAYLIGHT', tempo: 124, swing: 0,
    pattern: {
      lead: noteSteps({ 1: 'G', 3: 'A+', 5: 'E', 7: 'G', 9: 'C+', 11: 'A+', 13: 'G', 15: 'E' }),
      bass: noteSteps({ 1: 'C', 5: 'G', 9: 'A', 13: 'E' }),
      kick: onSteps([1, 5, 9, 13]),
      snare: onSteps([5, 13]),
      clap: onSteps([5, 13]),
      hihat: onSteps([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]),
      openhat: onSteps([]),
      rimshot: onSteps([]),
      tom: onSteps([]),
      cowbell: onSteps([3, 7, 11, 15]),
      shaker: onSteps([1, 3, 5, 7, 9, 11, 13, 15]),
      crash: onSteps([1, 9]),
    },
  },
  acid: {
    label: 'ACID', tempo: 140, swing: 8,
    pattern: {
      lead: noteSteps({ 2: 'C+', 8: 'G', 9: 'C+', 11: 'A', 14: 'D' }),
      bass: noteSteps({
        1: 'A', 2: 'A', 3: 'C', 5: 'A', 6: 'A', 7: 'D', 9: 'A', 10: 'A',
        11: 'C', 12: 'A', 13: 'A', 14: 'A+', 15: 'D', 16: 'A',
      }),
      kick: onSteps([1, 5, 9, 13]),
      snare: onSteps([1, 5, 9, 13]),
      clap: onSteps([3, 7, 11, 15]),
      hihat: onSteps([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]),
      openhat: onSteps([7]),
      rimshot: onSteps([10]),
      tom: onSteps([5, 6]),
      cowbell: onSteps([11]),
      shaker: onSteps([3, 7, 11, 15]),
      crash: onSteps([1, 12]),
    },
  },
};

/* ---------------- App state ---------------- */

const state = {
  tempo: 132,
  swing: 0,
  volume: 90,
  playing: false,
  currentStep: -1,
  pattern: clonePattern(PRESETS.darkroom.pattern),
  muted: new Set(),
  activePreset: 'darkroom',
  activeLB: 'lead',
  currentPitch: { lead: 'A', bass: 'A' },
  recording: false,
};

function clonePattern(p) {
  const out = {};
  Object.keys(p).forEach(k => { out[k] = p[k].slice(); });
  return out;
}

/* ---------------- DOM refs ---------------- */

const el = {
  playBtn: document.getElementById('playBtn'),
  tempoSlider: document.getElementById('tempoSlider'),
  tempoVal: document.getElementById('tempoVal'),
  swingSlider: document.getElementById('swingSlider'),
  swingVal: document.getElementById('swingVal'),
  volumeSlider: document.getElementById('volumeSlider'),
  volumeVal: document.getElementById('volumeVal'),
  onair: document.getElementById('onair'),
  presets: document.getElementById('presets'),
  clearBtn: document.getElementById('clearBtn'),
  randomBtn: document.getElementById('randomBtn'),
  seqGrid: document.getElementById('seqGrid'),
  loopRecBtn: document.getElementById('loopRecBtn'),
  lbTabs: document.getElementById('lbTabs'),
  pitchRow: document.getElementById('pitchRow'),
  ascii: document.getElementById('ascii'),
  logo: document.getElementById('logo'),
};

/* ---------------- Grid building ---------------- */

const cellRefs = {}; // trackId -> [cellEl,...]
const colHeadRefs = [];

function buildGrid() {
  el.seqGrid.innerHTML = '';

  const corner = document.createElement('div');
  corner.className = 'corner-head';
  el.seqGrid.appendChild(corner);

  for (let i = 0; i < STEPS; i++) {
    const h = document.createElement('div');
    h.className = 'col-head' + (i % 4 === 0 ? ' accent' : '');
    h.textContent = String(i + 1);
    el.seqGrid.appendChild(h);
    colHeadRefs.push(h);
  }

  TRACKS.forEach(track => {
    const label = document.createElement('button');
    label.type = 'button';
    label.className = 'track-label';
    label.innerHTML =
      '<span class="mute-box" aria-hidden="true"></span>' +
      '<span class="ch-num">CH&middot;' + track.ch + '</span> ' + track.name;
    label.addEventListener('click', () => toggleMute(track.id));
    el.seqGrid.appendChild(label);

    const row = [];
    for (let i = 0; i < STEPS; i++) {
      const cell = document.createElement('button');
      cell.type = 'button';
      cell.className = 'cell';
      cell.addEventListener('click', () => onCellClick(track, i));
      el.seqGrid.appendChild(cell);
      row.push(cell);
    }
    cellRefs[track.id] = row;
  });

  renderPattern();
}

function renderPattern() {
  const labels = el.seqGrid.querySelectorAll('.track-label');
  TRACKS.forEach((track, idx) => {
    const values = state.pattern[track.id];
    const muted = state.muted.has(track.id);
    cellRefs[track.id].forEach((cell, i) => {
      const v = values[i];
      const on = track.pitched ? v !== null : !!v;
      cell.classList.toggle('on', on);
      cell.classList.toggle('bass-note', track.id === 'bass');
      cell.classList.toggle('muted-cell', muted);
      cell.textContent = track.pitched && on ? v : '';
    });
    labels[idx].classList.toggle('is-muted', muted);
  });
}

function toggleMute(trackId) {
  if (state.muted.has(trackId)) state.muted.delete(trackId);
  else state.muted.add(trackId);
  renderPattern();
}

function onCellClick(track, i) {
  if (track.pitched) {
    const cur = state.pattern[track.id][i];
    state.pattern[track.id][i] = cur === null ? state.currentPitch[track.id] : null;
  } else {
    state.pattern[track.id][i] = !state.pattern[track.id][i];
  }
  clearPresetHighlight();
  renderPattern();
}

/* ---------------- Playhead UI ---------------- */

function updatePlayheadUI(step) {
  colHeadRefs.forEach((h, i) => h.classList.toggle('playhead', i === step && state.playing));
  TRACKS.forEach(track => {
    cellRefs[track.id].forEach((cell, i) => {
      cell.classList.toggle('playhead', i === step && state.playing);
    });
  });
}

/* ---------------- Mute box / muted-cell styling injected via CSS class hook ---------------- */
/* (handled with .is-muted on track-label and .muted-cell on cells; see style.css additions below via JS-injected style) */

const extraStyle = document.createElement('style');
extraStyle.textContent = `
  .track-label.is-muted { color: var(--dim-text); opacity: .55; }
  .track-label.is-muted .mute-box { background: var(--dim-text); }
  .cell.muted-cell { opacity: .35; }
`;
document.head.appendChild(extraStyle);

/* ---------------- Presets / Clear / Random ---------------- */

function clearPresetHighlight() {
  state.activePreset = null;
  document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
}

function applyPreset(id) {
  const preset = PRESETS[id];
  if (!preset) return;
  state.activePreset = id;
  state.tempo = preset.tempo;
  state.swing = preset.swing;
  state.pattern = clonePattern(preset.pattern);
  el.tempoSlider.value = state.tempo;
  el.tempoVal.textContent = state.tempo;
  el.swingSlider.value = state.swing;
  el.swingVal.textContent = state.swing + '%';
  document.querySelectorAll('.preset-btn').forEach(b => b.classList.toggle('active', b.dataset.preset === id));
  renderPattern();
}

function clearPattern() {
  state.pattern = emptyPattern();
  clearPresetHighlight();
  renderPattern();
}

function randomChance(p) { return Math.random() < p; }

const RANDOM_DENSITY = {
  lead: 0.14, bass: 0.32, kick: 0.28, snare: 0.14, clap: 0.14,
  hihat: 0.55, openhat: 0.16, rimshot: 0.16, tom: 0.10, cowbell: 0.10,
  shaker: 0.42, crash: 0.07,
};

function randomizePattern() {
  const p = emptyPattern();
  TRACKS.forEach(track => {
    const density = RANDOM_DENSITY[track.id] ?? 0.2;
    for (let i = 0; i < STEPS; i++) {
      const boost = (i % 4 === 0) ? 1.3 : 1.0;
      const on = randomChance(Math.min(0.95, density * boost));
      if (track.pitched) {
        p[track.id][i] = on ? PITCHES[Math.floor(Math.random() * PITCHES.length)] : null;
      } else {
        p[track.id][i] = on;
      }
    }
  });
  state.pattern = p;
  clearPresetHighlight();
  renderPattern();
}

/* ---------------- Lead/Bass tabs + pitch row ---------------- */

function buildPitchRow() {
  el.pitchRow.innerHTML = '';
  PITCHES.forEach((note, i) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'pitch-btn';
    btn.dataset.note = note;
    btn.innerHTML =
      '<span class="pitch-name">' + note + '</span>' +
      '<span class="pitch-key">' + PITCH_KEYS[i] + '</span>';
    btn.addEventListener('click', () => selectPitch(note, true));
    el.pitchRow.appendChild(btn);
  });
  refreshPitchRowActive();
}

function refreshPitchRowActive() {
  const cur = state.currentPitch[state.activeLB];
  el.pitchRow.querySelectorAll('.pitch-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.note === cur);
  });
}

function selectPitch(note, preview) {
  state.currentPitch[state.activeLB] = note;
  refreshPitchRowActive();
  if (preview) previewTrack(state.activeLB, note);
  maybeLiveRecord(note);
}

function cyclePitch(trackId, dir) {
  const cur = state.currentPitch[trackId];
  let idx = PITCHES.indexOf(cur);
  idx = (idx + dir + PITCHES.length) % PITCHES.length;
  state.currentPitch[trackId] = PITCHES[idx];
  refreshPitchRowActive();
  previewTrack(trackId, state.currentPitch[trackId]);
  maybeLiveRecord(state.currentPitch[trackId]);
}

function setActiveLB(trackId) {
  state.activeLB = trackId;
  el.lbTabs.querySelectorAll('.lb-tab').forEach(b => b.classList.toggle('active', b.dataset.track === trackId));
  refreshPitchRowActive();
}

function maybeLiveRecord(note) {
  if (state.recording && state.playing && state.currentStep >= 0) {
    state.pattern[state.activeLB][state.currentStep] = note;
    clearPresetHighlight();
    renderPattern();
  }
}

el.lbTabs.addEventListener('click', e => {
  const btn = e.target.closest('.lb-tab');
  if (!btn) return;
  const trackId = btn.dataset.track;
  if (state.activeLB === trackId) {
    cyclePitch(trackId, 1);
  } else {
    setActiveLB(trackId);
  }
});
el.lbTabs.addEventListener('contextmenu', e => {
  const btn = e.target.closest('.lb-tab');
  if (!btn) return;
  e.preventDefault();
  setActiveLB(btn.dataset.track);
  cyclePitch(btn.dataset.track, -1);
});

/* ---------------- Loop rec ---------------- */

el.loopRecBtn.addEventListener('click', () => {
  state.recording = !state.recording;
  el.loopRecBtn.classList.toggle('recording', state.recording);
});

/* ---------------- Transport controls ---------------- */

el.tempoSlider.addEventListener('input', () => {
  state.tempo = +el.tempoSlider.value;
  el.tempoVal.textContent = state.tempo;
});
el.swingSlider.addEventListener('input', () => {
  state.swing = +el.swingSlider.value;
  el.swingVal.textContent = state.swing + '%';
});
el.volumeSlider.addEventListener('input', () => {
  state.volume = +el.volumeSlider.value;
  el.volumeVal.textContent = state.volume;
  setMasterVolume(state.volume);
});

el.playBtn.addEventListener('click', togglePlay);
el.clearBtn.addEventListener('click', clearPattern);
el.randomBtn.addEventListener('click', randomizePattern);

el.presets.addEventListener('click', e => {
  const btn = e.target.closest('.preset-btn');
  if (!btn) return;
  applyPreset(btn.dataset.preset);
});

document.addEventListener('keydown', e => {
  if (e.repeat) return;
  const tag = (e.target && e.target.tagName) || '';
  if (tag === 'INPUT' || tag === 'TEXTAREA') return;

  if (e.code === 'Space') {
    e.preventDefault();
    togglePlay();
    return;
  }
  const key = e.key.toUpperCase();
  const idx = PITCH_KEYS.indexOf(key);
  if (idx !== -1) {
    selectPitch(PITCHES[idx], true);
  }
});

/* ---------------- Audio engine ---------------- */

let audioCtx = null;
let masterGain = null;
let noiseBuffer = null;

function ensureAudio() {
  if (audioCtx) return;
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  masterGain = audioCtx.createGain();
  setMasterVolume(state.volume);
  masterGain.connect(audioCtx.destination);
  noiseBuffer = makeNoiseBuffer();
}

function setMasterVolume(v) {
  if (masterGain) masterGain.gain.setTargetAtTime(v / 100 * 0.9, audioCtx.currentTime, 0.01);
}

function makeNoiseBuffer() {
  const len = audioCtx.sampleRate * 2;
  const buf = audioCtx.createBuffer(1, len, audioCtx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
  return buf;
}

function noiseSource() {
  const src = audioCtx.createBufferSource();
  src.buffer = noiseBuffer;
  src.loop = true;
  src.loopStart = 0;
  src.loopEnd = 2;
  src.start(0, Math.random() * 1.5);
  return src;
}

function env(gainNode, time, attack, peak, decayTo, release) {
  const g = gainNode.gain;
  g.cancelScheduledValues(time);
  g.setValueAtTime(0.0001, time);
  g.linearRampToValueAtTime(peak, time + attack);
  g.exponentialRampToValueAtTime(Math.max(decayTo, 0.0001), time + attack + release);
}

/* ---- Drum synths ---- */

function playKick(time) {
  const osc = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(155, time);
  osc.frequency.exponentialRampToValueAtTime(42, time + 0.16);
  g.gain.setValueAtTime(1.0, time);
  g.gain.exponentialRampToValueAtTime(0.001, time + 0.32);
  osc.connect(g).connect(masterGain);
  osc.start(time); osc.stop(time + 0.34);

  const click = audioCtx.createOscillator();
  const cg = audioCtx.createGain();
  click.type = 'square';
  click.frequency.setValueAtTime(900, time);
  cg.gain.setValueAtTime(0.4, time);
  cg.gain.exponentialRampToValueAtTime(0.001, time + 0.02);
  click.connect(cg).connect(masterGain);
  click.start(time); click.stop(time + 0.03);
}

function playSnare(time) {
  const src = noiseSource();
  const bp = audioCtx.createBiquadFilter();
  bp.type = 'highpass'; bp.frequency.value = 900;
  const g = audioCtx.createGain();
  g.gain.setValueAtTime(0.9, time);
  g.gain.exponentialRampToValueAtTime(0.001, time + 0.18);
  src.connect(bp).connect(g).connect(masterGain);
  src.stop(time + 0.2);

  const osc = audioCtx.createOscillator();
  const og = audioCtx.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(190, time);
  og.gain.setValueAtTime(0.5, time);
  og.gain.exponentialRampToValueAtTime(0.001, time + 0.12);
  osc.connect(og).connect(masterGain);
  osc.start(time); osc.stop(time + 0.13);
}

function playClap(time) {
  for (let i = 0; i < 3; i++) {
    const t = time + i * 0.012;
    const src = noiseSource();
    const bp = audioCtx.createBiquadFilter();
    bp.type = 'bandpass'; bp.frequency.value = 1100; bp.Q.value = 1.2;
    const g = audioCtx.createGain();
    g.gain.setValueAtTime(0.55, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
    src.connect(bp).connect(g).connect(masterGain);
    src.stop(t + 0.09);
  }
  const tail = noiseSource();
  const bp2 = audioCtx.createBiquadFilter();
  bp2.type = 'bandpass'; bp2.frequency.value = 1100; bp2.Q.value = 1.0;
  const g2 = audioCtx.createGain();
  g2.gain.setValueAtTime(0.45, time + 0.03);
  g2.gain.exponentialRampToValueAtTime(0.001, time + 0.25);
  tail.connect(bp2).connect(g2).connect(masterGain);
  tail.stop(time + 0.26);
}

function playHat(time, open) {
  const src = noiseSource();
  const hp = audioCtx.createBiquadFilter();
  hp.type = 'highpass'; hp.frequency.value = 7500;
  const g = audioCtx.createGain();
  const dur = open ? 0.28 : 0.055;
  g.gain.setValueAtTime(0.5, time);
  g.gain.exponentialRampToValueAtTime(0.001, time + dur);
  src.connect(hp).connect(g).connect(masterGain);
  src.stop(time + dur + 0.02);
}

function playRimshot(time) {
  const osc = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  osc.type = 'square';
  osc.frequency.setValueAtTime(420, time);
  g.gain.setValueAtTime(0.5, time);
  g.gain.exponentialRampToValueAtTime(0.001, time + 0.05);
  osc.connect(g).connect(masterGain);
  osc.start(time); osc.stop(time + 0.06);

  const src = noiseSource();
  const hp = audioCtx.createBiquadFilter();
  hp.type = 'highpass'; hp.frequency.value = 4000;
  const ng = audioCtx.createGain();
  ng.gain.setValueAtTime(0.3, time);
  ng.gain.exponentialRampToValueAtTime(0.001, time + 0.04);
  src.connect(hp).connect(ng).connect(masterGain);
  src.stop(time + 0.05);
}

function playTom(time) {
  const osc = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(180, time);
  osc.frequency.exponentialRampToValueAtTime(85, time + 0.22);
  g.gain.setValueAtTime(0.8, time);
  g.gain.exponentialRampToValueAtTime(0.001, time + 0.26);
  osc.connect(g).connect(masterGain);
  osc.start(time); osc.stop(time + 0.28);
}

function playCowbell(time) {
  const g = audioCtx.createGain();
  const bp = audioCtx.createBiquadFilter();
  bp.type = 'bandpass'; bp.frequency.value = 800; bp.Q.value = 2.5;
  g.gain.setValueAtTime(0.35, time);
  g.gain.exponentialRampToValueAtTime(0.001, time + 0.3);
  bp.connect(g).connect(masterGain);
  [587, 845].forEach(f => {
    const osc = audioCtx.createOscillator();
    osc.type = 'square';
    osc.frequency.value = f;
    osc.connect(bp);
    osc.start(time); osc.stop(time + 0.32);
  });
}

function playShaker(time) {
  const src = noiseSource();
  const hp = audioCtx.createBiquadFilter();
  hp.type = 'highpass'; hp.frequency.value = 6000;
  const g = audioCtx.createGain();
  g.gain.setValueAtTime(0.28, time);
  g.gain.exponentialRampToValueAtTime(0.001, time + 0.09);
  src.connect(hp).connect(g).connect(masterGain);
  src.stop(time + 0.1);
}

function playCrash(time) {
  const src = noiseSource();
  const hp = audioCtx.createBiquadFilter();
  hp.type = 'highpass'; hp.frequency.value = 5500;
  const g = audioCtx.createGain();
  g.gain.setValueAtTime(0.5, time);
  g.gain.exponentialRampToValueAtTime(0.001, time + 1.4);
  src.connect(hp).connect(g).connect(masterGain);
  src.stop(time + 1.5);
}

/* ---- Pitched synths ---- */

function playLeadFreq(freq, time) {
  const g = audioCtx.createGain();
  const lp = audioCtx.createBiquadFilter();
  lp.type = 'lowpass'; lp.frequency.value = 3200;
  g.connect(lp).connect(masterGain);
  env(g, time, 0.006, 0.4, 0.001, 0.28);
  [0, -6].forEach(detune => {
    const osc = audioCtx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.value = freq;
    osc.detune.value = detune;
    osc.connect(g);
    osc.start(time); osc.stop(time + 0.32);
  });
}

function playBassFreq(freq, time) {
  const g = audioCtx.createGain();
  const lp = audioCtx.createBiquadFilter();
  lp.type = 'lowpass'; lp.frequency.value = 900;
  g.connect(lp).connect(masterGain);
  env(g, time, 0.004, 0.75, 0.001, 0.32);
  const osc = audioCtx.createOscillator();
  osc.type = 'triangle';
  osc.frequency.value = freq;
  osc.connect(g);
  osc.start(time); osc.stop(time + 0.36);

  const sub = audioCtx.createOscillator();
  const sg = audioCtx.createGain();
  sub.type = 'sine'; sub.frequency.value = freq / 2;
  sg.gain.value = 0.5;
  sub.connect(sg).connect(g);
  sub.start(time); sub.stop(time + 0.36);
}

const INSTRUMENTS = {
  kick: (t) => playKick(t),
  snare: (t) => playSnare(t),
  clap: (t) => playClap(t),
  hihat: (t) => playHat(t, false),
  openhat: (t) => playHat(t, true),
  rimshot: (t) => playRimshot(t),
  tom: (t) => playTom(t),
  cowbell: (t) => playCowbell(t),
  shaker: (t) => playShaker(t),
  crash: (t) => playCrash(t),
};

function previewTrack(trackId, note) {
  ensureAudio();
  if (audioCtx.state === 'suspended') audioCtx.resume();
  const t = audioCtx.currentTime + 0.02;
  if (trackId === 'lead') playLeadFreq(leadFreq(note), t);
  else if (trackId === 'bass') playBassFreq(bassFreq(note), t);
}

/* ---------------- Scheduler (lookahead clock) ---------------- */

let nextStepTime = 0;
let schedStep = 0;
let schedulerTimer = null;
const LOOKAHEAD_MS = 25;
const SCHEDULE_AHEAD = 0.12;

function secondsPerStep() {
  return 60.0 / state.tempo / 4;
}

function scheduleStep(step, time) {
  TRACKS.forEach(track => {
    if (state.muted.has(track.id)) return;
    const v = state.pattern[track.id][step];
    if (track.pitched) {
      if (v === null) return;
      const freq = track.id === 'lead' ? leadFreq(v) : bassFreq(v);
      (track.id === 'lead' ? playLeadFreq : playBassFreq)(freq, time);
    } else {
      if (!v) return;
      INSTRUMENTS[track.id](time);
    }
  });

  const delayMs = Math.max(0, (time - audioCtx.currentTime) * 1000);
  setTimeout(() => {
    state.currentStep = step;
    updatePlayheadUI(step);
    pulseAscii(step);
  }, delayMs);
}

function advanceStep() {
  const sps = secondsPerStep();
  const swingRatio = (state.swing / 100) * 0.6;
  const isEven = schedStep % 2 === 0;
  const delta = isEven ? sps * (1 + swingRatio) : sps * (1 - swingRatio);
  nextStepTime += delta;
  schedStep = (schedStep + 1) % STEPS;
}

function schedulerTick() {
  while (nextStepTime < audioCtx.currentTime + SCHEDULE_AHEAD) {
    scheduleStep(schedStep, nextStepTime);
    advanceStep();
  }
  schedulerTimer = setTimeout(schedulerTick, LOOKAHEAD_MS);
}

function togglePlay() {
  ensureAudio();
  if (audioCtx.state === 'suspended') audioCtx.resume();
  state.playing = !state.playing;
  el.playBtn.classList.toggle('playing', state.playing);
  el.playBtn.querySelector('.play-label').textContent = state.playing ? 'STOP' : 'PLAY';
  el.onair.classList.toggle('live', state.playing);

  if (state.playing) {
    schedStep = 0;
    nextStepTime = audioCtx.currentTime + 0.05;
    schedulerTick();
  } else {
    clearTimeout(schedulerTimer);
    state.currentStep = -1;
    updatePlayheadUI(-1);
  }
}

/* ---------------- Logo (dot-matrix canvas) ---------------- */

const GLYPHS = {
  B: ['11110', '10001', '11110', '10001', '11110'],
  E: ['11111', '10000', '11110', '10000', '11111'],
  T: ['11111', '00100', '00100', '00100', '00100'],
  O: ['01110', '10001', '10001', '10001', '01110'],
  X: ['10001', '01010', '00100', '01010', '10001'],
};

function drawLogo() {
  const word = 'BEETBOX';
  const canvas = el.logo;
  const dpr = window.devicePixelRatio || 1;
  const dot = 7, gap = 3, letterGap = 11;
  const cols = 5, rows = 5;
  const letterW = cols * (dot + gap) - gap;
  const totalW = word.length * (letterW + letterGap) - letterGap;
  const totalH = rows * (dot + gap) - gap;

  canvas.style.width = totalW + 'px';
  canvas.style.height = totalH + 'px';
  canvas.width = totalW * dpr;
  canvas.height = totalH * dpr;

  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, totalW, totalH);
  ctx.fillStyle = '#f5f7fa';

  let x = 0;
  for (const ch of word) {
    const g = GLYPHS[ch];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (g[r][c] === '1') {
          ctx.fillRect(x + c * (dot + gap), r * (dot + gap), dot, dot);
        }
      }
    }
    x += letterW + letterGap;
  }
}

/* ---------------- ASCII ambient visualizer ---------------- */

const asciiCtx = el.ascii.getContext('2d');
let asciiCols = 0, asciiRows = 0;
const CHAR_W = 22, CHAR_H = 37.5;
const DIM_CHARS = ['-', '+'];
const MID_CHARS = ['/', '(', ')'];
const BRIGHT_CHARS = ['*', '#'];
const PEAK_CHARS = ['▲', '●', '⬡', 'K'];

let driftT = 0;
const pulses = [];

function resizeAscii() {
  const rect = el.ascii.parentElement.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  el.ascii.width = rect.width * dpr;
  el.ascii.height = 450 * dpr;
  el.ascii.style.width = rect.width + 'px';
  el.ascii.style.height = '450px';
  asciiCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  asciiCols = Math.floor(rect.width / CHAR_W);
  asciiRows = Math.floor(450 / CHAR_H);
}

function hash2(x, y) {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453123;
  return s - Math.floor(s);
}

function smoothNoise(x, y) {
  const xi = Math.floor(x), yi = Math.floor(y);
  const xf = x - xi, yf = y - yi;
  const h00 = hash2(xi, yi), h10 = hash2(xi + 1, yi);
  const h01 = hash2(xi, yi + 1), h11 = hash2(xi + 1, yi + 1);
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const top = h00 + u * (h10 - h00);
  const bottom = h01 + u * (h11 - h01);
  return top + v * (bottom - top);
}

function fbm(x, y) {
  let total = 0, amp = 0.55, freq = 1;
  for (let i = 0; i < 4; i++) {
    total += smoothNoise(x * freq, y * freq) * amp;
    freq *= 2.03;
    amp *= 0.52;
  }
  return total;
}

const FBM_MAX = 1.15;

function noiseVal(x, y, t) {
  const raw = fbm(x * 0.12 + t * 0.35, y * 0.16 - t * 0.22) / FBM_MAX;
  return Math.pow(Math.max(0, Math.min(1, raw)), 1.15);
}

function blobGap(x, y, t) {
  const cx = asciiCols / 2 + Math.sin(t * 0.18) * asciiCols * 0.28;
  const cy = asciiRows / 2 + Math.cos(t * 0.13) * asciiRows * 0.32;
  const dx = x - cx, dy = (y - cy) * 1.8;
  const d2 = dx * dx + dy * dy;
  return Math.exp(-d2 / 40);
}

function pulseAscii(step) {
  if (!asciiCols) return;
  const x = (step / STEPS) * asciiCols + asciiCols / (STEPS * 2);
  const y = Math.random() * asciiRows;
  pulses.push({ x, y, born: performance.now() });
  if (pulses.length > 10) pulses.shift();
}

function pulseIntensity(x, y, now) {
  let s = 0;
  for (const p of pulses) {
    const age = (now - p.born) / 1000;
    if (age > 0.6) continue;
    const dx = x - p.x, dy = y - p.y;
    const falloff = Math.exp(-age * 6) * Math.exp(-(dx * dx) / 12 - (dy * dy) / 7);
    s += falloff * 0.4;
  }
  return s;
}

function drawAscii() {
  driftT += 0.02;
  const now = performance.now();
  asciiCtx.clearRect(0, 0, el.ascii.width, el.ascii.height);
  asciiCtx.font = '20px "JetBrains Mono", monospace';
  asciiCtx.textBaseline = 'top';

  for (let ry = 0; ry < asciiRows; ry++) {
    for (let rx = 0; rx < asciiCols; rx++) {
      let n = noiseVal(rx, ry, driftT);
      n -= blobGap(rx, ry, driftT) * 0.75;
      n += pulseIntensity(rx, ry, now);
      n = Math.max(0, Math.min(1, n));

      if (n < 0.13) continue;

      const pick = hash2(rx * 3.7 + 11.3, ry * 5.9 - 4.1);
      let char, color;
      if (n < 0.4) { char = DIM_CHARS[Math.floor(pick * DIM_CHARS.length)]; color = '#3f5470'; }
      else if (n < 0.58) { char = MID_CHARS[Math.floor(pick * MID_CHARS.length)]; color = '#5b7599'; }
      else if (n < 0.76) { char = BRIGHT_CHARS[Math.floor(pick * BRIGHT_CHARS.length)]; color = '#4a9ef6'; }
      else { char = PEAK_CHARS[Math.floor(pick * PEAK_CHARS.length)]; color = '#8fd6ff'; }

      asciiCtx.fillStyle = color;
      asciiCtx.fillText(char, rx * CHAR_W, ry * CHAR_H);
    }
  }
  requestAnimationFrame(drawAscii);
}

/* ---------------- Init ---------------- */

function init() {
  buildGrid();
  buildPitchRow();
  applyPresetSilently('darkroom');
  setActiveLB('lead');
  drawLogo();
  resizeAscii();
  requestAnimationFrame(drawAscii);
  window.addEventListener('resize', resizeAscii);
}

function applyPresetSilently(id) {
  const preset = PRESETS[id];
  state.tempo = preset.tempo;
  state.swing = preset.swing;
  state.pattern = clonePattern(preset.pattern);
  state.activePreset = id;
  el.tempoSlider.value = state.tempo;
  el.tempoVal.textContent = state.tempo;
  el.swingSlider.value = state.swing;
  el.swingVal.textContent = state.swing + '%';
  el.volumeSlider.value = state.volume;
  el.volumeVal.textContent = state.volume;
  document.querySelectorAll('.preset-btn').forEach(b => b.classList.toggle('active', b.dataset.preset === id));
  renderPattern();
}

init();
