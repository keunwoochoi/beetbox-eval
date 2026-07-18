const STEPS = 16;

const trackInfo = [
  ["Lead", "lead"], ["Bass", "bass"], ["Kick", "kick"], ["Snare", "snare"],
  ["Clap", "clap"], ["Hi-hat", "hat"], ["Open hat", "open"], ["Rimshot", "rim"],
  ["Tom", "tom"], ["Cowbell", "cow"], ["Shaker", "shaker"], ["Crash", "crash"]
];

const presets = [
  { number: "10", name: "DARKROOM", tempo: 132, swing: 0 },
  { number: "20", name: "GREASE", tempo: 118, swing: 14 },
  { number: "30", name: "BACKSTREET", tempo: 124, swing: 21 },
  { number: "40", name: "DAYLIGHT", tempo: 106, swing: 4 },
  { number: "50", name: "ACID", tempo: 140, swing: 8 }
];

const notes = ["A", "C", "D", "E", "G", "A+", "C+"];
const keyLabels = ["A", "S", "D", "F", "G", "H", "J"];
const frequencies = { A: 220, C: 261.63, D: 293.66, E: 329.63, G: 392, "A+": 440, "C+": 523.25 };

const patterns = [
  {
    lead: { 2: "G", 6: "D", 12: "C+", 15: "A+" },
    bass: { 0: "A", 3: "A", 6: "A", 8: "A", 11: "A", 14: "E" },
    rows: [
      [0,4,8,12], [], [4,12], [0,3,4,5,7,8,9,11,12,13,15], [2,6,10,14], [7,15], [14], [], [0,2,4,6,8,10,12,14], [0]
    ]
  },
  {
    lead: { 0: "C", 4: "D", 7: "G", 10: "E", 12: "G" },
    bass: { 0: "C", 3: "C", 6: "G", 8: "C", 11: "G", 14: "D" },
    rows: [[0,4,8,12], [3,11], [4,12], [0,2,4,6,8,10,12,14], [6,14], [2,10], [], [3,7,11,15], [0,4,8,12], [15]]
  },
  {
    lead: { 1: "D", 5: "A", 9: "E", 13: "C+" },
    bass: { 0: "D", 4: "D", 8: "A", 12: "C" },
    rows: [[0,4,8,12], [2,6,10,14], [4,12], [0,2,4,6,8,10,12,14], [7,15], [3,11], [14], [], [2,6,10,14], [0,8]]
  },
  {
    lead: { 0: "C", 3: "E", 7: "G", 10: "A", 14: "G" },
    bass: { 0: "C", 4: "G", 8: "A", 12: "G" },
    rows: [[0,8], [4,12], [6,14], [0,2,4,6,8,10,12,14], [3,11], [7,15], [], [5,13], [0,4,8,12], [0]]
  },
  {
    lead: { 0: "A", 2: "E", 4: "A", 6: "A+", 8: "A", 10: "E", 12: "C+", 14: "A+", 15: "E" },
    bass: { 0: "A", 1: "A", 2: "D", 3: "A", 4: "A", 5: "A", 6: "D", 7: "A", 8: "A", 9: "A", 10: "D", 11: "A", 12: "A", 13: "C+", 14: "D", 15: "A" },
    rows: [[0,4,8,12], [], [4,12], [0,3,4,5,7,8,9,11,12,13,15], [2,6,10,14], [1,5,9,13], [2,10], [], [10,14], [8]]
  }
];

let grid = Array.from({ length: 12 }, () => Array(STEPS).fill(false));
let pitches = [Array(STEPS).fill(""), Array(STEPS).fill("")];
let muted = Array(12).fill(false);
let currentPreset = 0;
let currentStep = -1;
let playing = false;
let loopRecording = false;
let mode = "lead";
let timer = null;
let audio = null;
let master = null;
let noiseBuffer = null;
let landscapeSeed = 4;
let landscapePhase = 0;

const $ = (id) => document.getElementById(id);

function buildLogo() {
  const glyphs = {
    B: ["110", "101", "110", "101", "110"],
    E: ["111", "100", "110", "100", "111"],
    T: ["111", "010", "010", "010", "010"],
    O: ["111", "101", "101", "101", "111"],
    X: ["101", "101", "010", "101", "101"]
  };
  const logo = $("pixel-logo");
  for (const char of "BEETBOX") {
    const letter = document.createElement("span");
    letter.className = "pixel-letter";
    for (const row of glyphs[char]) for (const bit of row) {
      const dot = document.createElement("i");
      if (bit === "1") dot.className = "on";
      letter.appendChild(dot);
    }
    logo.appendChild(letter);
  }
}

function buildPresets() {
  presets.forEach((preset, index) => {
    const button = document.createElement("button");
    button.className = `preset${index === currentPreset ? " active" : ""}`;
    button.innerHTML = `<i></i>CH·${preset.number} <strong>${preset.name}</strong>`;
    button.addEventListener("click", () => loadPreset(index));
    $("presets").appendChild(button);
  });
}

function buildGrid() {
  for (let i = 0; i < STEPS; i++) {
    const n = document.createElement("span");
    n.className = `step-number${i % 4 === 0 ? " bar" : ""}`;
    n.textContent = i + 1;
    $("step-numbers").appendChild(n);
  }
  trackInfo.forEach(([name, type], rowIndex) => {
    const row = document.createElement("div");
    row.className = `track-row ${type}`;
    const label = document.createElement("button");
    label.className = "track-label";
    label.innerHTML = `<i></i><span class="channel">CH·${String(rowIndex + 1).padStart(2, "0")}</span><b>${name}</b>`;
    label.addEventListener("click", () => {
      muted[rowIndex] = !muted[rowIndex];
      label.classList.toggle("muted", muted[rowIndex]);
    });
    row.appendChild(label);
    const cells = document.createElement("div");
    cells.className = "step-row";
    for (let step = 0; step < STEPS; step++) {
      const cell = document.createElement("button");
      cell.className = "cell";
      cell.dataset.row = rowIndex;
      cell.dataset.step = step;
      cell.setAttribute("aria-label", `${name}, step ${step + 1}`);
      cell.addEventListener("click", () => toggleCell(rowIndex, step, 1));
      cell.addEventListener("contextmenu", (event) => {
        event.preventDefault();
        toggleCell(rowIndex, step, -1);
      });
      cells.appendChild(cell);
    }
    row.appendChild(cells);
    $("tracks").appendChild(row);
  });
}

function buildKeybed() {
  notes.forEach((note, index) => {
    const key = document.createElement("button");
    key.className = "note-key";
    key.dataset.note = note;
    key.innerHTML = `<span>${note}</span><small>${keyLabels[index]}</small>`;
    key.addEventListener("pointerdown", () => triggerKeyboardNote(note, key));
    $("keybed").appendChild(key);
  });
}

function loadPreset(index) {
  currentPreset = index;
  landscapeSeed = 4 + index * 17;
  document.querySelectorAll(".preset").forEach((item, i) => item.classList.toggle("active", i === index));
  const source = patterns[index];
  grid = Array.from({ length: 12 }, () => Array(STEPS).fill(false));
  pitches = [Array(STEPS).fill(""), Array(STEPS).fill("")];
  for (const [step, pitch] of Object.entries(source.lead)) { grid[0][+step] = true; pitches[0][+step] = pitch; }
  for (const [step, pitch] of Object.entries(source.bass)) { grid[1][+step] = true; pitches[1][+step] = pitch; }
  source.rows.forEach((activeSteps, row) => activeSteps.forEach((step) => { grid[row + 2][step] = true; }));
  $("tempo").value = presets[index].tempo;
  $("swing").value = presets[index].swing;
  updateSliderOutputs();
  renderGrid();
  renderLandscape();
}

function randomize() {
  landscapeSeed = Math.floor(Math.random() * 10000);
  grid = Array.from({ length: 12 }, (_, row) => Array.from({ length: STEPS }, (_, step) => {
    if (row === 0) return Math.random() < .36;
    if (row === 1) return Math.random() < .46;
    const chance = [.32, .2, .16, .52, .2, .12, .08, .08, .28, .06][row - 2];
    return Math.random() < chance * (step % 4 === 0 ? 1.45 : 1);
  }));
  pitches = [Array(STEPS).fill(""), Array(STEPS).fill("")];
  for (let row = 0; row < 2; row++) for (let step = 0; step < STEPS; step++) {
    if (grid[row][step]) pitches[row][step] = notes[Math.floor(Math.random() * notes.length)];
  }
  document.querySelectorAll(".preset").forEach((item) => item.classList.remove("active"));
  renderGrid();
  renderLandscape();
}

function toggleCell(row, step, direction) {
  if (row < 2) {
    if (!grid[row][step]) {
      grid[row][step] = true;
      pitches[row][step] = notes[row === 0 ? 0 : 4];
    } else {
      const at = notes.indexOf(pitches[row][step]);
      const next = at + direction;
      if (next < 0 || next >= notes.length) {
        grid[row][step] = false;
        pitches[row][step] = "";
      } else pitches[row][step] = notes[next];
    }
  } else grid[row][step] = !grid[row][step];
  renderGrid();
  if (grid[row][step]) playTrack(row, step, true);
}

function renderGrid() {
  document.querySelectorAll(".cell").forEach((cell) => {
    const row = +cell.dataset.row;
    const step = +cell.dataset.step;
    cell.classList.toggle("on", grid[row][step]);
    cell.classList.toggle("current", currentStep === step && playing);
    cell.textContent = row < 2 && grid[row][step] ? pitches[row][step] : "";
  });
  document.querySelectorAll(".step-number").forEach((number, step) => number.classList.toggle("current", currentStep === step && playing));
}

function updateSliderOutputs() {
  $("tempo-output").textContent = $("tempo").value;
  $("swing-output").textContent = `${$("swing").value}%`;
  $("volume-output").textContent = $("volume").value;
  if (master) master.gain.setTargetAtTime((+$("volume").value / 100) * .65, audio.currentTime, .02);
}

function ensureAudio() {
  if (audio) return;
  audio = new (window.AudioContext || window.webkitAudioContext)();
  master = audio.createGain();
  master.gain.value = (+$("volume").value / 100) * .65;
  const compressor = audio.createDynamicsCompressor();
  compressor.threshold.value = -15;
  compressor.ratio.value = 8;
  master.connect(compressor).connect(audio.destination);
  noiseBuffer = audio.createBuffer(1, audio.sampleRate, audio.sampleRate);
  const data = noiseBuffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
}

function tone(frequency, duration = .12, type = "square", amount = .12, slideTo = null) {
  ensureAudio();
  const now = audio.currentTime;
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, now);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, now + duration);
  gain.gain.setValueAtTime(amount, now);
  gain.gain.exponentialRampToValueAtTime(.0001, now + duration);
  osc.connect(gain).connect(master);
  osc.start(now); osc.stop(now + duration);
}

function noise(duration = .08, amount = .08, highpass = 0) {
  ensureAudio();
  const now = audio.currentTime;
  const src = audio.createBufferSource();
  const gain = audio.createGain();
  src.buffer = noiseBuffer;
  gain.gain.setValueAtTime(amount, now);
  gain.gain.exponentialRampToValueAtTime(.0001, now + duration);
  if (highpass) {
    const filter = audio.createBiquadFilter();
    filter.type = "highpass"; filter.frequency.value = highpass;
    src.connect(filter).connect(gain);
  } else src.connect(gain);
  gain.connect(master); src.start(now); src.stop(now + duration);
}

function playTrack(row, step, preview = false) {
  if (muted[row]) return;
  if (row === 0 || row === 1) {
    const note = pitches[row][step] || "A";
    const base = frequencies[note] || 220;
    tone(row === 1 ? base / 2 : base, row === 1 ? .2 : .11, row === 1 ? "sawtooth" : "square", row === 1 ? .09 : .065);
  } else if (row === 2) tone(120, .16, "sine", .4, 42);
  else if (row === 3) { noise(.12, .2, 900); tone(180, .06, "triangle", .05); }
  else if (row === 4) noise(.075, .15, 1400);
  else if (row === 5) noise(.03, .07, 6000);
  else if (row === 6) noise(.25, .06, 5000);
  else if (row === 7) tone(760, .035, "square", .05);
  else if (row === 8) tone(150, .13, "sine", .16, 92);
  else if (row === 9) { tone(540, .06, "square", .04); tone(800, .06, "square", .035); }
  else if (row === 10) noise(.025, .04, 4500);
  else if (row === 11) noise(.6, .08, 2500);
  if (!preview) landscapePhase += (row === 2 ? 1.8 : row === 3 ? 1.2 : .25);
}

function advance() {
  currentStep = (currentStep + 1) % STEPS;
  grid.forEach((row, rowIndex) => { if (row[currentStep]) playTrack(rowIndex, currentStep); });
  renderGrid();
  renderLandscape();
  scheduleNext();
}

function scheduleNext() {
  if (!playing) return;
  const beat = 60000 / +$("tempo").value / 4;
  const swing = +$("swing").value / 100;
  const delay = beat * (currentStep % 2 === 0 ? 1 + swing : 1 - swing);
  timer = setTimeout(advance, Math.max(40, delay));
}

function togglePlay() {
  playing = !playing;
  const button = $("play");
  button.classList.toggle("playing", playing);
  button.querySelector(".transport-icon").textContent = playing ? "■" : "▶";
  $("play-label").textContent = playing ? "STOP" : "PLAY";
  $("on-air").classList.toggle("on", playing);
  if (playing) {
    ensureAudio();
    audio.resume();
    currentStep = (currentStep + 1) % STEPS;
    grid.forEach((row, rowIndex) => { if (row[currentStep]) playTrack(rowIndex, currentStep); });
    renderGrid(); renderLandscape(); scheduleNext();
  } else {
    clearTimeout(timer);
    currentStep = -1;
    renderGrid(); renderLandscape();
  }
}

function triggerKeyboardNote(note, keyElement) {
  ensureAudio();
  audio.resume();
  const frequency = frequencies[note];
  tone(mode === "bass" ? frequency / 2 : frequency, mode === "bass" ? .24 : .13, mode === "bass" ? "sawtooth" : "square", .12);
  if (loopRecording && playing && currentStep >= 0) {
    const row = mode === "lead" ? 0 : 1;
    grid[row][currentStep] = true;
    pitches[row][currentStep] = note;
    renderGrid();
  }
  keyElement.classList.add("active");
  setTimeout(() => keyElement.classList.remove("active"), 120);
  landscapePhase += 1;
  renderLandscape();
}

function hash(x, y, seed) {
  const n = Math.sin(x * 127.1 + y * 311.7 + seed * 74.7) * 43758.5453;
  return n - Math.floor(n);
}

function renderLandscape() {
  const box = $("visualizer");
  if (!box.children.length) for (let i = 0; i < 43 * 14; i++) {
    const span = document.createElement("span"); span.className = "glyph"; box.appendChild(span);
  }
  const activeEnergy = currentStep < 0 ? 0 : grid.reduce((sum, row) => sum + (row[currentStep] ? 1 : 0), 0);
  const phase = 1.05 + landscapeSeed * .12 + landscapePhase * .11 + (currentStep < 0 ? 0 : currentStep * .19);
  [...box.children].forEach((glyph, i) => {
    const x = i % 43, y = Math.floor(i / 43);
    const angle = x * .45 + y * .075 + phase;
    const warp = .7 * Math.sin(x * .14 - y * .31 + phase * .7) + .3 * Math.sin(x * .08 + y * .46 - phase);
    const field = Math.sin(angle + warp) + .12 * Math.sin(x * .13 - y * .21 + phase * .7);
    const reverse = Math.sin(x * .25 - phase * .45) * 2.4 + 6.5;
    const r = hash(x, y, landscapeSeed + Math.floor(landscapePhase));
    let char = r > .91 ? "−" : "+", level = r > .91 ? 4 : 1;
    if (field > -.12) {
      char = Math.cos(angle + warp) < -.34 ? ")" : "/";
      level = 3;
    }
    const pulseX = ((currentStep < 0 ? landscapeSeed : currentStep * 2.68 + landscapeSeed) % 43 + 43) % 43;
    const pd = Math.hypot((x - pulseX) * .72, y - reverse);
    if (playing && activeEnergy > 1 && pd < 2.2 + activeEnergy * .18) {
      if (pd < .7 && activeEnergy > 5) { char = "◆"; level = 5; }
      else if (pd < 1.2) { char = "#"; level = 5; }
      else if (pd < 1.8) { char = "K"; level = 2; }
      else { char = r > .45 ? "▲" : "*"; level = 2; }
    } else if (playing && pd < 3.8) { char = r > .58 ? "*" : ")"; level = 2; }
    glyph.textContent = char;
    glyph.className = `glyph l${level}`;
  });
}

buildLogo(); buildPresets(); buildGrid(); buildKeybed(); loadPreset(0);

$("play").addEventListener("click", togglePlay);
$("tempo").addEventListener("input", updateSliderOutputs);
$("swing").addEventListener("input", updateSliderOutputs);
$("volume").addEventListener("input", updateSliderOutputs);
$("clear").addEventListener("click", () => {
  grid = Array.from({ length: 12 }, () => Array(STEPS).fill(false));
  pitches = [Array(STEPS).fill(""), Array(STEPS).fill("")];
  document.querySelectorAll(".preset").forEach((item) => item.classList.remove("active"));
  renderGrid();
});
$("random").addEventListener("click", randomize);
$("loop").addEventListener("click", () => {
  loopRecording = !loopRecording;
  $("loop").classList.toggle("on", loopRecording);
});
document.querySelectorAll(".mode").forEach((button) => button.addEventListener("click", () => {
  mode = button.dataset.mode;
  document.querySelectorAll(".mode").forEach((item) => item.classList.toggle("active", item === button));
}));

window.addEventListener("keydown", (event) => {
  if (event.repeat || event.target.matches("input")) return;
  if (event.code === "Space") { event.preventDefault(); togglePlay(); return; }
  const index = keyLabels.findIndex((key) => key.toLowerCase() === event.key.toLowerCase());
  if (index >= 0) triggerKeyboardNote(notes[index], document.querySelectorAll(".note-key")[index]);
});

document.addEventListener("visibilitychange", () => { if (document.hidden && playing) togglePlay(); });
