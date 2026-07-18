/* =========================================================
   BEETBOX  ·  beat sequencing · channel desk
   ========================================================= */
(() => {
  'use strict';

  // ---------- BEETBOX pixel logo bitmap ----------
  // 4-wide glyphs, 7 rows tall, 1 col gap
  const GLYPH = {
    B: ['1110','1001','1001','1110','1001','1001','1110'],
    E: ['1111','1000','1000','1110','1000','1000','1111'],
    T: ['1111','0010','0010','0010','0010','0010','0010'],
    O: ['0110','1001','1001','1001','1001','1001','0110'],
    X: ['1001','1001','0100','0010','0100','1001','1001'],
  };
  const LOGO = 'BEETBOX';

  function paintLogo() {
    const rows = document.querySelectorAll('.logo-row');
    rows.forEach((rowEl, y) => {
      let html = '';
      [...LOGO].forEach((ch, li) => {
        const g = GLYPH[ch] || GLYPH.O;
        for (let x = 0; x < 4; x++) {
          html += `<i class="${g[y][x] === '1' ? 'on' : ''}"></i>`;
        }
        if (li < LOGO.length - 1) html += `<i></i>`; // gap
      });
      rowEl.innerHTML = html;
    });
  }

  // ---------- Track model ----------
  // Index: 0..11
  const TRACKS = [
    { id: 'lead',     name: 'Lead',     isPitch: true,  defaultNote: 0, voice: 'lead' },
    { id: 'bass',     name: 'Bass',     isPitch: true,  defaultNote: 0, voice: 'bass' },
    { id: 'kick',     name: 'Kick',     isPitch: false, voice: 'kick' },
    { id: 'snare',    name: 'Snare',    isPitch: false, voice: 'snare' },
    { id: 'clap',     name: 'Clap',     isPitch: false, voice: 'clap' },
    { id: 'hihat',    name: 'Hi-hat',   isPitch: false, voice: 'hihat' },
    { id: 'openhat',  name: 'Open hat', isPitch: false, voice: 'openhat' },
    { id: 'rimshot',  name: 'Rimshot',  isPitch: false, voice: 'rimshot' },
    { id: 'tom',      name: 'Tom',      isPitch: false, voice: 'tom' },
    { id: 'cowbell',  name: 'Cowbell',  isPitch: false, voice: 'cowbell' },
    { id: 'shaker',   name: 'Shaker',   isPitch: false, voice: 'shaker' },
    { id: 'crash',    name: 'Crash',    isPitch: false, voice: 'crash' },
  ];

  const STEPS = 16;
  const PITCHES = ['A', 'C', 'D', 'E', 'G', 'A+', 'C+']; // palette (left to right)
  const PITCH_KEYS = ['A','S','D','F','G','H','J'];

  // state.grid[row][step] = { on: bool, pitch: 0..6 (Lead/Bass only) }
  const grid = TRACKS.map(t => {
    const arr = [];
    for (let s = 0; s < STEPS; s++) arr.push({ on: false, pitch: t.defaultNote });
    return arr;
  });
  const muted = TRACKS.map(() => false);
  let currentNote = { lead: 0, bass: 0 };
  let mode = 'lead';

  // ---------- Presets ----------
  // 16-bit-ish: 16 chars of 'X' or '.' per drum row.  Lead/bass use 'X' with pitch letter.
  // We encode presets as compact strings.
  const PRESETS = {
    darkroom: {
      lead:  '...G...D........C+.A+',
      bass:  'A..A..A..A..........E',
      kick:  'X.......X.......X...',
      snare: '....X..............',
      clap:  '........X.........X.',
      hihat: 'XXXXXXXXXXXXXXXX',
      openhat:'..X...X.....X...X..',
      rimshot:'.......X.........X',
      tom:   '................X..',
      cowbell:'..................',
      shaker:'X.X.X.X.X.X.X.X.X.',
      crash: 'X.................'
    },
    grease: {
      lead:  '..E..G.C+.G......A.',
      bass:  'A..D..E..E.G.C..E..',
      kick:  'X.......X.X.....X.X',
      snare: '....X.......X......',
      clap:  '..............X...X',
      hihat: 'X.X.X.X.X.X.X.X.X.X',
      openhat:'....X......X.......',
      rimshot:'...X........X......',
      tom:   '........X........X.',
      cowbell:'...X..X...X...X....',
      shaker:'X.X.X.X.X.X.X.X.X.X',
      crash: 'X.................'
    },
    backstreet: {
      lead:  '..E..G..C+A......D.',
      bass:  'A..A..A..A.A..A.A.A.',
      kick:  'X.......X.......X.X',
      snare: '....X..............',
      clap:  '........X.........X',
      hihat: 'X.X.X.X.X.X.X.X.X.X',
      openhat:'...X...X.....X...X.',
      rimshot:'.......X.........X.',
      tom:   '..................',
      cowbell:'...X...........X...',
      shaker:'X.X.X.X.X.X.X.X.X.X',
      crash: 'X.................'
    },
    daylight: {
      lead:  'C+.A...A....C+.A..E',
      bass:  'C...E.C.G...E...A.C',
      kick:  'X.......X.......X.X',
      snare: '....X.......X......',
      clap:  '....X............X.',
      hihat: 'X.X.X.X.X.X.X.X.X.X',
      openhat:'...X......X........',
      rimshot:'...X......X........',
      tom:   '........X........X.',
      cowbell:'....X.....X........',
      shaker:'X.X.X.X.X.X.X.X.X.X',
      crash: 'X.................'
    },
    acid: {
      lead:  '...A..A+.....C+.A..E',
      bass:  'A.A.A.A.A.A.A.A.A.A.A',
      kick:  'X.X.X.X.X.X.X.X.X.X.X',
      snare: '....X.......X......',
      clap:  '..............X...X',
      hihat: 'X.X.X.X.X.X.X.X.X.X.X',
      openhat:'....X.............X',
      rimshot:'...X......X........',
      tom:   '........X........X.',
      cowbell:'...X..X...X...X....',
      shaker:'X.X.X.X.X.X.X.X.X.X.X',
      crash: 'X.................'
    }
  };

  function loadPreset(name) {
    const p = PRESETS[name];
    if (!p) return;
    TRACKS.forEach((t, ti) => {
      const line = p[t.id] || '';
      for (let s = 0; s < STEPS; s++) {
        const ch = line[s] || '.';
        if (t.isPitch) {
          if (ch === '.') { grid[ti][s].on = false; grid[ti][s].pitch = t.defaultNote; }
          else { grid[ti][s].on = true; grid[ti][s].pitch = PITCHES.indexOf(ch) >= 0 ? PITCHES.indexOf(ch) : t.defaultNote; }
        } else {
          grid[ti][s].on = (ch === 'X');
        }
      }
    });
    renderGrid();
    redrawAscii(true);
  }

  // ---------- Build sequencer DOM ----------
  const seqBody = document.getElementById('seqBody');

  function buildSequencer() {
    // tracks col
    const tracksCol = document.createElement('div');
    tracksCol.className = 'tracks';
    TRACKS.forEach((t, ti) => {
      const row = document.createElement('div');
      row.className = 'track';
      row.dataset.idx = ti;
      row.innerHTML = `<span class="mute-box"></span><span class="ch-label">CH·${String(ti+1).padStart(2,'0')}</span><span class="name">${t.name}</span>`;
      row.addEventListener('click', () => {
        muted[ti] = !muted[ti];
        row.classList.toggle('muted', muted[ti]);
      });
      tracksCol.appendChild(row);
    });

    // grid col
    const gridCol = document.createElement('div');
    gridCol.className = 'grid';
    TRACKS.forEach((t, ti) => {
      const row = document.createElement('div');
      row.className = 'row';
      row.dataset.row = ti;
      for (let s = 0; s < STEPS; s++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.dataset.row = ti;
        cell.dataset.step = s;
        cell.addEventListener('click', (ev) => {
          toggleCell(ti, s, ev.shiftKey || ev.button === 2);
        });
        cell.addEventListener('contextmenu', (ev) => {
          ev.preventDefault();
          if (grid[ti][s].on && t.isPitch) {
            grid[ti][s].pitch = (grid[ti][s].pitch + 6) % 7; // lower
            updateCell(ti, s);
          }
        });
        row.appendChild(cell);
      }
      gridCol.appendChild(row);
    });

    seqBody.appendChild(tracksCol);
    seqBody.appendChild(gridCol);

    // step numbers
    const sn = document.getElementById('stepNumbers');
    for (let s = 0; s < STEPS; s++) {
      const el = document.createElement('span');
      el.textContent = s + 1;
      el.dataset.step = s;
      sn.appendChild(el);
    }
  }

  function updateCell(ti, s) {
    const cell = seqBody.querySelector(`.cell[data-row="${ti}"][data-step="${s}"]`);
    if (!cell) return;
    const t = TRACKS[ti];
    const st = grid[ti][s];
    cell.classList.toggle('on', st.on);
    if (t.isPitch) {
      cell.classList.add('pitch');
      cell.textContent = st.on ? PITCHES[st.pitch] : '';
    } else {
      cell.classList.remove('pitch');
      cell.textContent = '';
    }
  }

  function renderGrid() {
    TRACKS.forEach((t, ti) => {
      for (let s = 0; s < STEPS; s++) updateCell(ti, s);
    });
  }

  function toggleCell(ti, s, isErase) {
    const t = TRACKS[ti];
    if (t.isPitch) {
      if (!grid[ti][s].on) {
        grid[ti][s].on = true;
        grid[ti][s].pitch = currentNote[mode];
      } else if (isErase) {
        grid[ti][s].on = false;
      } else {
        // cycle pitch
        grid[ti][s].pitch = (grid[ti][s].pitch + 1) % 7;
      }
    } else {
      grid[ti][s].on = !grid[ti][s].on;
    }
    updateCell(ti, s);
    // sample trigger
    if (grid[ti][s].on) trigger(t.voice, t.isPitch ? PITCH_FREQ[grid[ti][s].pitch] : null);
  }

  // ---------- Note palette ----------
  const paletteEl = document.getElementById('palette');
  function buildPalette() {
    PITCHES.forEach((p, i) => {
      const b = document.createElement('button');
      b.className = 'note';
      b.dataset.idx = i;
      b.innerHTML = `<span class="name">${p}</span><span class="key">${PITCH_KEYS[i]}</span>`;
      b.addEventListener('click', () => {
        currentNote.lead = i;
        currentNote.bass = i;
        updatePalette();
      });
      paletteEl.appendChild(b);
    });
    updatePalette();
  }
  function updatePalette() {
    paletteEl.querySelectorAll('.note').forEach((el, i) => {
      el.dataset.active = (i === currentNote[mode]) ? 'true' : 'false';
    });
  }

  // ---------- Audio: synth voices ----------
  let audio = null;
  let masterGain = null;
  function ensureAudio() {
    if (audio) return;
    const Ctx = window.AudioContext || window.webkitAudioContext;
    audio = new Ctx();
    masterGain = audio.createGain();
    masterGain.gain.value = 0.35;
    masterGain.connect(audio.destination);
  }
  function setVolume(v) {
    if (!masterGain) return;
    masterGain.gain.setTargetAtTime(v, audio.currentTime, 0.02);
  }

  // Lead/Bass pitch (Hz). Roughly keyed to A minor pentatonic.
  const PITCH_FREQ = [220.00, 261.63, 293.66, 329.63, 392.00, 440.00, 523.25]; // A3 C4 D4 E4 G4 A4 C5

  function envGain(t0, attack, decay, peak) {
    const g = audio.createGain();
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(peak, t0 + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + attack + decay);
    return g;
  }

  function voiceKick(t0, vel = 1) {
    const o = audio.createOscillator();
    o.type = 'sine';
    o.frequency.setValueAtTime(140, t0);
    o.frequency.exponentialRampToValueAtTime(40, t0 + 0.18);
    const g = envGain(t0, 0.002, 0.32, 0.9 * vel);
    o.connect(g).connect(masterGain);
    o.start(t0);
    o.stop(t0 + 0.4);
  }

  function voiceSnare(t0, vel = 1) {
    // noise + body
    const buf = makeNoise(0.25);
    const n = audio.createBufferSource();
    n.buffer = buf;
    const hp = audio.createBiquadFilter();
    hp.type = 'highpass'; hp.frequency.value = 1200;
    const g = envGain(t0, 0.002, 0.18, 0.55 * vel);
    n.connect(hp).connect(g).connect(masterGain);
    n.start(t0); n.stop(t0 + 0.25);

    const o = audio.createOscillator();
    o.type = 'triangle'; o.frequency.value = 220;
    const og = envGain(t0, 0.001, 0.12, 0.35 * vel);
    o.connect(og).connect(masterGain);
    o.start(t0); o.stop(t0 + 0.18);
  }

  function voiceClap(t0, vel = 1) {
    const buf = makeNoise(0.22);
    for (let i = 0; i < 3; i++) {
      const n = audio.createBufferSource();
      n.buffer = buf;
      const bp = audio.createBiquadFilter();
      bp.type = 'bandpass'; bp.frequency.value = 1400; bp.Q.value = 1.2;
      const g = audio.createGain();
      g.gain.setValueAtTime(0, t0 + i*0.012);
      g.gain.linearRampToValueAtTime(0.4 * vel, t0 + i*0.012 + 0.002);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + i*0.012 + 0.16);
      n.connect(bp).connect(g).connect(masterGain);
      n.start(t0 + i*0.012); n.stop(t0 + i*0.012 + 0.2);
    }
  }

  function voiceHihat(t0, vel = 1, open = false) {
    const buf = makeNoise(open ? 0.35 : 0.07);
    const n = audio.createBufferSource();
    n.buffer = buf;
    const hp = audio.createBiquadFilter();
    hp.type = 'highpass'; hp.frequency.value = 7000;
    const g = audio.createGain();
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(0.35 * vel, t0 + 0.001);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + (open ? 0.32 : 0.06));
    n.connect(hp).connect(g).connect(masterGain);
    n.start(t0); n.stop(t0 + (open ? 0.4 : 0.1));
  }

  function voiceRimshot(t0, vel = 1) {
    const o = audio.createOscillator();
    o.type = 'square';
    o.frequency.setValueAtTime(880, t0);
    o.frequency.exponentialRampToValueAtTime(540, t0 + 0.04);
    const g = envGain(t0, 0.001, 0.06, 0.35 * vel);
    o.connect(g).connect(masterGain);
    o.start(t0); o.stop(t0 + 0.08);
  }

  function voiceTom(t0, vel = 1) {
    const o = audio.createOscillator();
    o.type = 'sine';
    o.frequency.setValueAtTime(180, t0);
    o.frequency.exponentialRampToValueAtTime(80, t0 + 0.25);
    const g = envGain(t0, 0.002, 0.28, 0.65 * vel);
    o.connect(g).connect(masterGain);
    o.start(t0); o.stop(t0 + 0.32);
  }

  function voiceCowbell(t0, vel = 1) {
    const o1 = audio.createOscillator(); o1.type = 'square'; o1.frequency.value = 540;
    const o2 = audio.createOscillator(); o2.type = 'square'; o2.frequency.value = 800;
    const g = envGain(t0, 0.001, 0.22, 0.32 * vel);
    o1.connect(g); o2.connect(g);
    g.connect(masterGain);
    o1.start(t0); o2.start(t0);
    o1.stop(t0 + 0.25); o2.stop(t0 + 0.25);
  }

  function voiceShaker(t0, vel = 1) {
    const buf = makeNoise(0.12);
    const n = audio.createBufferSource(); n.buffer = buf;
    const hp = audio.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 5000;
    const g = envGain(t0, 0.002, 0.09, 0.28 * vel);
    n.connect(hp).connect(g).connect(masterGain);
    n.start(t0); n.stop(t0 + 0.15);
  }

  function voiceCrash(t0, vel = 1) {
    const buf = makeNoise(0.9);
    const n = audio.createBufferSource(); n.buffer = buf;
    const hp = audio.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 4000;
    const g = audio.createGain();
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(0.32 * vel, t0 + 0.002);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.85);
    n.connect(hp).connect(g).connect(masterGain);
    n.start(t0); n.stop(t0 + 0.9);
  }

  function voiceLead(t0, freq, vel = 1) {
    const o = audio.createOscillator();
    o.type = 'sawtooth';
    o.frequency.value = freq;
    const lp = audio.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(2400, t0);
    lp.frequency.exponentialRampToValueAtTime(700, t0 + 0.25);
    lp.Q.value = 4;
    const g = envGain(t0, 0.005, 0.25, 0.32 * vel);
    o.connect(lp).connect(g).connect(masterGain);
    o.start(t0); o.stop(t0 + 0.3);
  }

  function voiceBass(t0, freq, vel = 1) {
    const o = audio.createOscillator();
    o.type = 'square';
    o.frequency.value = freq / 2;
    const lp = audio.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(600, t0);
    lp.Q.value = 6;
    const g = envGain(t0, 0.003, 0.28, 0.42 * vel);
    o.connect(lp).connect(g).connect(masterGain);
    o.start(t0); o.stop(t0 + 0.32);
  }

  function makeNoise(seconds) {
    const len = Math.floor(audio.sampleRate * seconds);
    const buf = audio.createBuffer(1, len, audio.sampleRate);
    const ch = buf.getChannelData(0);
    for (let i = 0; i < len; i++) ch[i] = Math.random() * 2 - 1;
    return buf;
  }

  function trigger(voice, freq) {
    if (!audio) return;
    const t0 = audio.currentTime + 0.005;
    switch (voice) {
      case 'kick':    return voiceKick(t0);
      case 'snare':   return voiceSnare(t0);
      case 'clap':    return voiceClap(t0);
      case 'hihat':   return voiceHihat(t0, 1, false);
      case 'openhat': return voiceHihat(t0, 0.9, true);
      case 'rimshot': return voiceRimshot(t0);
      case 'tom':     return voiceTom(t0);
      case 'cowbell': return voiceCowbell(t0);
      case 'shaker':  return voiceShaker(t0);
      case 'crash':   return voiceCrash(t0);
      case 'lead':    return voiceLead(t0, freq);
      case 'bass':    return voiceBass(t0, freq);
    }
  }

  // ---------- Scheduler ----------
  let tempo = 132, swing = 0, volume = 35;
  let playing = false;
  let currentStep = 0;
  let nextNoteTime = 0;
  let timerId = null;
  const lookahead = 25;     // ms
  const scheduleAheadTime = 0.1; // sec

  function stepDuration() { return 60.0 / tempo / 4.0; } // 16th notes

  function scheduleStep(step, time) {
    TRACKS.forEach((t, ti) => {
      if (muted[ti]) return;
      const st = grid[ti][step];
      if (!st.on) return;
      if (t.isPitch) {
        const f = PITCH_FREQ[st.pitch];
        if (ti === 0) voiceLead(time, f);
        else voiceBass(time, f);
      } else {
        switch (t.voice) {
          case 'kick':    voiceKick(time); break;
          case 'snare':   voiceSnare(time); break;
          case 'clap':    voiceClap(time); break;
          case 'hihat':   voiceHihat(time, 1, false); break;
          case 'openhat': voiceHihat(time, 0.9, true); break;
          case 'rimshot': voiceRimshot(time); break;
          case 'tom':     voiceTom(time); break;
          case 'cowbell': voiceCowbell(time); break;
          case 'shaker':  voiceShaker(time); break;
          case 'crash':   voiceCrash(time); break;
        }
      }
    });
  }

  function schedulerTick() {
    while (nextNoteTime < audio.currentTime + scheduleAheadTime) {
      const isSwung = (currentStep % 2) === 1;
      const swingAmt = isSwung ? (swing / 100) * stepDuration() : 0;
      scheduleStep(currentStep, nextNoteTime + swingAmt);
      const stepTime = nextNoteTime + swingAmt;
      pendingSteps.push({ step: currentStep, time: stepTime });
      const dur = stepDuration();
      nextNoteTime += dur;
      currentStep = (currentStep + 1) % STEPS;
    }
  }

  const pendingSteps = [];
  function drawTick() {
    const now = audio ? audio.currentTime : 0;
    while (pendingSteps.length && pendingSteps[0].time <= now) {
      const p = pendingSteps.shift();
      onStep(p.step);
    }
    if (playing) requestAnimationFrame(drawTick);
  }

  function onStep(step) {
    currentStepVisual = step;
    highlightColumn(step);
    spawnAscii(step);
  }

  function highlightColumn(step) {
    seqBody.querySelectorAll('.cell').forEach(c => {
      const s = +c.dataset.step;
      c.classList.toggle('col-current', s === step);
    });
    document.querySelectorAll('.step-numbers span').forEach((el) => {
      el.classList.toggle('current', +el.dataset.step === step);
    });
  }

  function play() {
    ensureAudio();
    if (audio.state === 'suspended') audio.resume();
    playing = true;
    currentStep = 0;
    nextNoteTime = audio.currentTime + 0.05;
    pendingSteps.length = 0;
    timerId = setInterval(schedulerTick, lookahead);
    requestAnimationFrame(drawTick);
    document.getElementById('playBtn').setAttribute('aria-pressed', 'true');
    document.getElementById('playBtn').querySelector('.label').textContent = 'STOP';
    document.getElementById('onAir').dataset.on = 'true';
  }
  function stop() {
    playing = false;
    if (timerId) { clearInterval(timerId); timerId = null; }
    pendingSteps.length = 0;
    seqBody.querySelectorAll('.cell').forEach(c => c.classList.remove('col-current'));
    document.querySelectorAll('.step-numbers span').forEach(el => el.classList.remove('current'));
    document.getElementById('playBtn').setAttribute('aria-pressed', 'false');
    document.getElementById('playBtn').querySelector('.label').textContent = 'PLAY';
    document.getElementById('onAir').dataset.on = 'false';
    currentStepVisual = -1;
  }

  let currentStepVisual = -1;

  // ---------- ASCII visualizer ----------
  const VCOLS = 54, VROWS = 14;
  // each cell: { ch, life, color }
  let vgrid = [];
  for (let y = 0; y < VROWS; y++) {
    const row = [];
    for (let x = 0; x < VCOLS; x++) row.push({ ch: ' ', life: 0, color: '' });
    vgrid.push(row);
  }
  const vgridEl = document.getElementById('vgrid');

  // glyph weights for different hit intensities
  const GLYPHS_LIGHT = ['(', ')', '/', '|', '\\', '-', '+', '·', ':'];
  const GLYPHS_MED   = ['*', '·', '+', '|', '°'];
  const GLYPHS_HEAVY = ['*', 'K', '#', '●', '▲', '✦'];
  const COLORS = {
    dim:    'c-d',
    soft:   'c-t',
    normal: '',
    bright: 'c-w',
    hot:    'c-h',
    cyan:   'c-b',
  };

  function pickFrom(arr) { return arr[(Math.random() * arr.length) | 0]; }

  function setCell(y, x, ch, life, color) {
    vgrid[y][x] = { ch, life, color };
  }

  function spawnAscii(step) {
    // ambient drift across the whole grid on every step (long life, persistent)
    const ambientN = 22 + ((Math.random() * 16) | 0);
    for (let k = 0; k < ambientN; k++) {
      const y = (Math.random() * VROWS) | 0;
      const x = (Math.random() * VCOLS) | 0;
      const color = Math.random() < 0.3 ? COLORS.dim : COLORS.soft;
      setCell(y, x, pickFrom(GLYPHS_LIGHT), 30 + ((Math.random() * 40) | 0), color);
    }
    // per-hit bursts near current step (shorter life, brighter)
    const cols = [step, (step + 1) % VCOLS, (step - 1 + VCOLS) % VCOLS];
    TRACKS.forEach((t, ti) => {
      if (muted[ti]) return;
      const st = grid[ti][step];
      if (!st.on) return;
      let glyphs = GLYPHS_LIGHT;
      let color = COLORS.soft;
      if (t.isPitch) { glyphs = GLYPHS_LIGHT; color = COLORS.normal; }
      else if (['kick','tom'].includes(t.voice)) { glyphs = GLYPHS_HEAVY; color = COLORS.bright; }
      else if (['snare','clap'].includes(t.voice)) { glyphs = GLYPHS_MED; color = COLORS.normal; }
      else if (['hihat','shaker','openhat'].includes(t.voice)) { glyphs = GLYPHS_LIGHT; color = COLORS.cyan; }
      else if (['rimshot','cowbell'].includes(t.voice)) { glyphs = GLYPHS_MED; color = COLORS.soft; }
      else if (t.voice === 'crash') { glyphs = GLYPHS_LIGHT; color = COLORS.hot; }
      const n = 4 + ((Math.random() * 6) | 0);
      for (let k = 0; k < n; k++) {
        const y = (Math.random() * VROWS) | 0;
        const c = cols[(Math.random() * cols.length) | 0];
        setCell(y, c, pickFrom(glyphs), 12 + ((Math.random() * 16) | 0), color);
      }
    });
  }

  function tickAscii() {
    for (let y = 0; y < VROWS; y++) {
      for (let x = 0; x < VCOLS; x++) {
        const c = vgrid[y][x];
        if (c.life > 0) {
          c.life--;
          if (c.life === 0) { c.ch = ' '; c.color = ''; }
        }
      }
    }
    // ongoing ambient noise so the field never empties
    const ambientN = 14 + ((Math.random() * 10) | 0);
    for (let k = 0; k < ambientN; k++) {
      const y = (Math.random() * VROWS) | 0;
      const x = (Math.random() * VCOLS) | 0;
      if (vgrid[y][x].life <= 0) {
        vgrid[y][x] = { ch: pickFrom(GLYPHS_LIGHT), life: 25 + ((Math.random() * 30) | 0), color: Math.random() < 0.3 ? COLORS.dim : COLORS.soft };
      }
    }
  }

  function renderAscii() {
    let out = '';
    for (let y = 0; y < VROWS; y++) {
      for (let x = 0; x < VCOLS; x++) {
        const c = vgrid[y][x];
        if (c.ch === ' ' || c.life <= 0) { out += ' '; continue; }
        out += c.color ? `<span class="${c.color}">${escapeHtml(c.ch)}</span>` : escapeHtml(c.ch);
      }
      out += '\n';
    }
    vgridEl.innerHTML = out;
  }

  function escapeHtml(s) {
    return s.replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  }

  let asciiTimer = null;
  function startAsciiLoop() {
    if (asciiTimer) return;
    asciiTimer = setInterval(() => { tickAscii(); renderAscii(); }, 90);
  }

  function redrawAscii(immediate) {
    if (immediate) {
      // fill with ambient glyphs (high density, long life)
      for (let y = 0; y < VROWS; y++) {
        for (let x = 0; x < VCOLS; x++) {
          if (Math.random() < 0.75) {
            vgrid[y][x] = {
              ch: pickFrom(GLYPHS_LIGHT),
              life: 30 + ((Math.random() * 40) | 0),
              color: Math.random() < 0.25 ? COLORS.dim : COLORS.soft
            };
          } else {
            vgrid[y][x] = { ch: ' ', life: 0, color: '' };
          }
        }
      }
      renderAscii();
    }
  }

  // ---------- Wire up controls ----------
  function wire() {
    document.getElementById('playBtn').addEventListener('click', () => {
      ensureAudio();
      playing ? stop() : play();
    });
    document.getElementById('fullscreenBtn').addEventListener('click', () => {
      if (document.fullscreenElement) document.exitFullscreen();
      else document.documentElement.requestFullscreen?.();
    });
    document.getElementById('moreBtn').addEventListener('click', () => {
      // tiny "menu" — cycle through presets
      const order = Object.keys(PRESETS);
      const idx = order.indexOf(currentPreset);
      const next = order[(idx + 1) % order.length];
      selectPreset(next);
    });

    const tempoEl = document.getElementById('tempo');
    const tempoVal = document.getElementById('tempoVal');
    tempoEl.addEventListener('input', () => {
      tempo = +tempoEl.value; tempoVal.textContent = tempo;
    });
    const swingEl = document.getElementById('swing');
    const swingVal = document.getElementById('swingVal');
    swingEl.addEventListener('input', () => {
      swing = +swingEl.value; swingVal.textContent = swing + '%';
    });
    const volEl = document.getElementById('volume');
    const volVal = document.getElementById('volumeVal');
    volEl.addEventListener('input', () => {
      volume = +volEl.value; volVal.textContent = volume;
      ensureAudio();
      setVolume(volume / 100);
    });

    document.getElementById('clearBtn').addEventListener('click', () => {
      TRACKS.forEach((_, ti) => forSteps(s => { grid[ti][s].on = false; updateCell(ti, s); }));
    });
    document.getElementById('randomBtn').addEventListener('click', () => {
      TRACKS.forEach((t, ti) => {
        for (let s = 0; s < STEPS; s++) {
          if (t.isPitch) {
            grid[ti][s].on = Math.random() < 0.18;
            grid[ti][s].pitch = (Math.random() * 7) | 0;
          } else {
            const density = ti <= 1 ? 0.0 : (['kick','snare','hihat'].includes(t.voice) ? 0.25 : 0.1);
            grid[ti][s].on = Math.random() < density;
          }
          updateCell(ti, s);
        }
      });
      redrawAscii(true);
    });

    document.querySelectorAll('.preset').forEach(btn => {
      btn.addEventListener('click', () => selectPreset(btn.dataset.preset));
    });

    document.getElementById('loopBtn').addEventListener('click', () => {
      const on = document.getElementById('loopBtn').dataset.on === 'true';
      document.getElementById('loopBtn').dataset.on = on ? 'false' : 'true';
    });

    document.querySelectorAll('.mode').forEach(btn => {
      btn.addEventListener('click', () => {
        mode = btn.dataset.mode;
        document.querySelectorAll('.mode').forEach(b => {
          const on = b === btn;
          b.classList.toggle('active', on);
          b.setAttribute('aria-selected', on ? 'true' : 'false');
        });
        updatePalette();
      });
      btn.addEventListener('contextmenu', (ev) => {
        ev.preventDefault();
        // lower
        currentNote[btn.dataset.mode] = (currentNote[btn.dataset.mode] + 6) % 7;
        updatePalette();
      });
    });

    document.addEventListener('keydown', (ev) => {
      if (ev.repeat) return;
      if (ev.target instanceof HTMLInputElement) return;
      if (ev.code === 'Space') { ev.preventDefault(); document.getElementById('playBtn').click(); return; }
      // keyboard palette
      const idx = PITCH_KEYS.indexOf(ev.key.toUpperCase());
      if (idx >= 0) {
        currentNote.lead = idx;
        currentNote.bass = idx;
        updatePalette();
        const note = PITCHES[idx];
        ensureAudio();
        trigger('lead', PITCH_FREQ[idx]);
      }
    });
  }
  function forSteps(fn) { for (let s = 0; s < STEPS; s++) fn(s); }

  let currentPreset = 'darkroom';
  function selectPreset(name) {
    currentPreset = name;
    document.querySelectorAll('.preset').forEach(b => {
      b.dataset.active = (b.dataset.preset === name) ? 'true' : 'false';
    });
    loadPreset(name);
  }

  // ---------- Boot ----------
  paintLogo();
  buildSequencer();
  buildPalette();
  wire();
  selectPreset('darkroom');
  setVolume(volume / 100);
  redrawAscii(true);
  startAsciiLoop();

  // expose for console debugging
  window.__beetbox = { grid, TRACKS, PRESETS, selectPreset, play, stop };
})();
