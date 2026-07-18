const TRACKS = [
  { name: "Lead", type: "lead" },
  { name: "Bass", type: "bass" },
  { name: "Kick", type: "kick" },
  { name: "Snare", type: "snare" },
  { name: "Clap", type: "clap" },
  { name: "Hi-hat", type: "hat" },
  { name: "Open hat", type: "openhat" },
  { name: "Rimshot", type: "rim" },
  { name: "Tom", type: "tom" },
  { name: "Cowbell", type: "cowbell" },
  { name: "Shaker", type: "shaker" },
  { name: "Crash", type: "crash" },
];

const NOTES = ["A", "C", "D", "E", "G", "A+", "C+"];
const HOTKEYS = ["a", "s", "d", "f", "g", "h", "j"];
const NOTE_FREQS = { A: 220, C: 261.63, D: 293.66, E: 329.63, G: 392, "A+": 440, "C+": 523.25 };

const blankPattern = () => TRACKS.map(() => Array(16).fill(null));

function makePattern(rows) {
  const pattern = blankPattern();
  rows.forEach((row, track) => {
    row.forEach((value, step) => {
      if (value !== 0 && value !== null && value !== undefined) pattern[track][step] = value === 1 ? true : value;
    });
  });
  return pattern;
}

const PRESETS = [
  {
    number: "10", name: "DARKROOM", tempo: 132, swing: 0,
    pattern: makePattern([
      [0,0,"G",0,0,0,"D",0,0,0,0,0,"C+",0,0,"A+"],
      ["A",0,0,"A",0,0,"A",0,"A",0,0,"A",0,0,"E",0],
      [1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0],
      [],
      [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],
      [1,1,0,1,1,1,0,1,1,1,0,1,1,1,0,1],
      [0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0],
      [0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0],
      [],
      [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0],
      [1],
    ]),
  },
  {
    number: "20", name: "GREASE", tempo: 118, swing: 18,
    pattern: makePattern([
      [0,"E",0,"G","C+","G",0,0,0,0,"A",0,"D","D",0,"E"],
      ["A","C",0,0,"D","C","E",0,"E","G","C","E",0,0,0,0],
      [1,0,1,1,0,1,0,0,1,0,1,1,0,0,1,1],
      [0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1],
      [0,1,0,1,0,1,1,1,0,1,1,0,1,1,0,1],
      [0,0,0,0,0,0,1,0,0,0,1,0,0,0,1,0],
      [0,0,1,0,1,0,0,1,0,0,0,1,0,1,0,0],
      [],
      [0,1,0,0,0,0,1,0,0,0,0,0,0,0,0,1],
      [0,1,0,1,0,1,0,0,1,0,1,1,0,1,0,1],
      [0,0,0,0,0,0,0,0,1],
    ]),
  },
  {
    number: "30", name: "BACKSTREET", tempo: 104, swing: 27,
    pattern: makePattern([
      ["C",0,0,"G",0,"A",0,"C+",0,"A",0,0,"G",0,"E",0],
      ["A",0,"C",0,"D",0,"E",0,"G",0,"E",0,"D",0,"C",0],
      [1,0,0,1,1,0,0,0,1,0,0,1,1,0,0,0],
      [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],
      [0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0],
      [1,0,1,0,1,0,1,1,1,0,1,0,1,0,1,1],
      [0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0],
      [0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0],
      [0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1],
      [],
      [0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0],
      [1],
    ]),
  },
  {
    number: "40", name: "DAYLIGHT", tempo: 124, swing: 12,
    pattern: makePattern([
      ["G",0,"A",0,"C+",0,"A+",0,"G",0,"E",0,"D",0,"C",0],
      ["C",0,"G",0,"A",0,"E",0,"C",0,"G",0,"A",0,"E",0],
      [1,0,0,0,1,0,1,0,1,0,0,0,1,0,1,0],
      [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],
      [0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0],
      [1,1,0,1,1,1,0,1,1,1,0,1,1,1,0,1],
      [0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0],
      [0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1],
      [0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0],
      [0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0],
      [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0],
      [1],
    ]),
  },
  {
    number: "50", name: "ACID", tempo: 140, swing: 8,
    pattern: makePattern([
      ["A",0,"E",0,"A",0,"A+",0,"A",0,"E",0,"C+",0,"A+","E"],
      ["A","A","D","A","A","A","D","A","A","A","D","A","A","C+","D","A"],
      [1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0],
      [0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1],
      [0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0],
      [],
      [0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0],
      [],
      [],
      [0,0,0,0,0,0,0,0,1],
    ]),
  },
];

const state = {
  pattern: PRESETS[0].pattern.map((row) => [...row]),
  selectedPreset: 0,
  playing: false,
  currentStep: -1,
  muted: Array(12).fill(false),
  mode: "lead",
  recording: false,
  timer: null,
  visualTick: 0,
};

const beetbox = document.querySelector(".beetbox");
const logo = document.querySelector(".dot-logo");
const channelNav = document.querySelector("#channels");
const trackList = document.querySelector("#trackList");
const stepNumbers = document.querySelector("#stepNumbers");
const keyboard = document.querySelector("#keyboard");
const visualizer = document.querySelector("#visualizer");
const transportButton = document.querySelector("#transportButton");
const recordButton = document.querySelector("#recordButton");

let audioContext = null;
let masterGain = null;

function renderLogo() {
  const glyphs = {
    B: ["111", "101", "110", "101", "111"],
    E: ["111", "100", "110", "100", "111"],
    T: ["111", "010", "010", "010", "010"],
    O: ["111", "101", "101", "101", "111"],
    X: ["101", "101", "010", "101", "101"],
  };
  [..."BEETBOX"].forEach((letter) => {
    const el = document.createElement("span");
    el.className = "dot-letter";
    glyphs[letter].join("").split("").forEach((bit) => {
      const dot = document.createElement("i");
      dot.className = bit === "1" ? "dot on" : "dot";
      el.append(dot);
    });
    logo.append(el);
  });
}

function renderChannels() {
  channelNav.innerHTML = "";
  PRESETS.forEach((preset, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `channel-button${state.selectedPreset === index ? " selected" : ""}`;
    button.innerHTML = `${state.selectedPreset === index ? "<i></i>" : ""}<span>CH·${preset.number} <b>${preset.name}</b></span>`;
    button.addEventListener("click", () => loadPreset(index));
    channelNav.append(button);
  });
}

function renderStepNumbers() {
  stepNumbers.innerHTML = "";
  for (let step = 0; step < 16; step += 1) {
    const number = document.createElement("span");
    number.textContent = step + 1;
    if (step % 4 === 0) number.classList.add("downbeat");
    if (state.playing && step === state.currentStep) number.classList.add("current");
    stepNumbers.append(number);
  }
}

function renderTracks() {
  trackList.innerHTML = "";
  TRACKS.forEach((track, trackIndex) => {
    const row = document.createElement("div");
    row.className = `track-row ${track.type}${state.muted[trackIndex] ? " muted" : ""}`;

    const label = document.createElement("button");
    label.type = "button";
    label.className = "track-label";
    label.setAttribute("aria-label", `${state.muted[trackIndex] ? "Unmute" : "Mute"} ${track.name}`);
    label.innerHTML = `<i></i><span>CH·${String(trackIndex + 1).padStart(2, "0")}</span><b>${track.name}</b>`;
    label.addEventListener("click", () => {
      state.muted[trackIndex] = !state.muted[trackIndex];
      renderTracks();
    });

    const cells = document.createElement("div");
    cells.className = "cells";
    state.pattern[trackIndex].forEach((value, step) => {
      const cell = document.createElement("button");
      cell.type = "button";
      cell.className = `cell${value ? " active" : ""}${state.playing && state.currentStep === step ? " current" : ""}`;
      cell.textContent = typeof value === "string" ? value : "";
      cell.setAttribute("aria-label", `${track.name}, step ${step + 1}${value ? ", active" : ""}`);
      cell.addEventListener("click", () => alterCell(trackIndex, step, 1));
      cell.addEventListener("contextmenu", (event) => {
        event.preventDefault();
        alterCell(trackIndex, step, -1);
      });
      cells.append(cell);
    });

    row.append(label, cells);
    trackList.append(row);
  });
}

function renderKeyboard() {
  NOTES.forEach((note, index) => {
    const key = document.createElement("button");
    key.type = "button";
    key.className = "key";
    key.dataset.note = note;
    key.innerHTML = `${note}<kbd>${HOTKEYS[index]}</kbd>`;
    key.addEventListener("pointerdown", () => triggerKeyboardNote(note, key));
    keyboard.append(key);
  });
}

function alterCell(track, step, direction) {
  const current = state.pattern[track][step];
  if (track < 2) {
    const index = typeof current === "string" ? NOTES.indexOf(current) : -1;
    if (!current) state.pattern[track][step] = direction > 0 ? NOTES[0] : NOTES.at(-1);
    else if ((direction > 0 && index === NOTES.length - 1) || (direction < 0 && index === 0)) state.pattern[track][step] = null;
    else state.pattern[track][step] = NOTES[index + direction];
  } else {
    state.pattern[track][step] = current ? null : true;
  }
  state.selectedPreset = -1;
  renderChannels();
  renderTracks();
  if (state.pattern[track][step]) playTrack(track, state.pattern[track][step]);
}

function loadPreset(index) {
  const preset = PRESETS[index];
  state.pattern = preset.pattern.map((row) => [...row]);
  state.selectedPreset = index;
  document.querySelector("#tempo").value = preset.tempo;
  document.querySelector("#swing").value = preset.swing;
  updateControlOutputs();
  renderChannels();
  renderTracks();
  drawVisualizer();
}

function clearPattern() {
  state.pattern = blankPattern();
  state.selectedPreset = -1;
  renderChannels();
  renderTracks();
  drawVisualizer();
}

function randomizePattern() {
  const next = blankPattern();
  for (let track = 0; track < TRACKS.length; track += 1) {
    for (let step = 0; step < 16; step += 1) {
      const chance = track === 1 ? 0.62 : track < 2 ? 0.28 : track === 5 ? 0.55 : 0.21;
      if (Math.random() < chance) next[track][step] = track < 2 ? NOTES[Math.floor(Math.random() * NOTES.length)] : true;
    }
  }
  state.pattern = next;
  state.selectedPreset = -1;
  renderChannels();
  renderTracks();
  drawVisualizer();
}

function updateControlOutputs() {
  document.querySelector("#tempoOutput").textContent = document.querySelector("#tempo").value;
  document.querySelector("#swingOutput").textContent = `${document.querySelector("#swing").value}%`;
  document.querySelector("#volumeOutput").textContent = document.querySelector("#volume").value;
  if (masterGain) masterGain.gain.value = Number(document.querySelector("#volume").value) / 100 * 0.55;
}

function initAudio() {
  if (audioContext) return;
  audioContext = new (window.AudioContext || window.webkitAudioContext)();
  masterGain = audioContext.createGain();
  masterGain.gain.value = Number(document.querySelector("#volume").value) / 100 * 0.55;
  masterGain.connect(audioContext.destination);
}

function tone(frequency, duration = 0.12, type = "sine", volume = 0.2, slide = null) {
  if (!audioContext) return;
  const now = audioContext.currentTime;
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, now);
  if (slide) oscillator.frequency.exponentialRampToValueAtTime(slide, now + duration);
  gain.gain.setValueAtTime(volume, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
  oscillator.connect(gain).connect(masterGain);
  oscillator.start(now);
  oscillator.stop(now + duration);
}

function noise(duration, volume, highpass = 0) {
  if (!audioContext) return;
  const length = Math.max(1, Math.floor(audioContext.sampleRate * duration));
  const buffer = audioContext.createBuffer(1, length, audioContext.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i += 1) data[i] = Math.random() * 2 - 1;
  const source = audioContext.createBufferSource();
  const gain = audioContext.createGain();
  const now = audioContext.currentTime;
  source.buffer = buffer;
  gain.gain.setValueAtTime(volume, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
  if (highpass) {
    const filter = audioContext.createBiquadFilter();
    filter.type = "highpass";
    filter.frequency.value = highpass;
    source.connect(filter).connect(gain);
  } else source.connect(gain);
  gain.connect(masterGain);
  source.start();
}

function playTrack(track, value) {
  if (state.muted[track]) return;
  initAudio();
  if (track === 0) tone(NOTE_FREQS[value] * 2, 0.13, "square", 0.08);
  else if (track === 1) tone(NOTE_FREQS[value] / 2, 0.22, "sawtooth", 0.1);
  else if (track === 2) tone(130, 0.16, "sine", 0.55, 42);
  else if (track === 3) noise(0.12, 0.35, 650);
  else if (track === 4) { noise(0.07, 0.24, 1200); setTimeout(() => noise(0.06, 0.14, 1200), 32); }
  else if (track === 5) noise(0.045, 0.2, 5400);
  else if (track === 6) noise(0.24, 0.18, 5000);
  else if (track === 7) tone(780, 0.045, "square", 0.12);
  else if (track === 8) tone(180, 0.16, "sine", 0.24, 95);
  else if (track === 9) { tone(540, 0.08, "square", 0.08); tone(800, 0.08, "square", 0.07); }
  else if (track === 10) noise(0.06, 0.13, 3500);
  else noise(0.65, 0.15, 3000);
}

function scheduleNextStep() {
  if (!state.playing) return;
  state.currentStep = (state.currentStep + 1) % 16;
  state.pattern.forEach((row, track) => {
    if (row[state.currentStep]) playTrack(track, row[state.currentStep]);
  });
  renderStepNumbers();
  renderTracks();
  state.visualTick += 1;
  drawVisualizer();

  const tempo = Number(document.querySelector("#tempo").value);
  const swing = Number(document.querySelector("#swing").value) / 100;
  const base = 60000 / tempo / 4;
  const delay = base * (state.currentStep % 2 ? 1 + swing : 1 - swing);
  state.timer = window.setTimeout(scheduleNextStep, delay);
}

function togglePlayback() {
  initAudio();
  if (audioContext.state === "suspended") audioContext.resume();
  state.playing = !state.playing;
  beetbox.classList.toggle("is-playing", state.playing);
  transportButton.classList.toggle("playing", state.playing);
  transportButton.querySelector(".transport-label").textContent = state.playing ? "STOP" : "PLAY";
  if (state.playing) scheduleNextStep();
  else {
    window.clearTimeout(state.timer);
    state.timer = null;
    state.currentStep = -1;
    renderStepNumbers();
    renderTracks();
    drawVisualizer();
  }
}

function triggerKeyboardNote(note, element) {
  initAudio();
  const frequency = NOTE_FREQS[note] * (state.mode === "lead" ? 2 : 0.5);
  tone(frequency, state.mode === "lead" ? 0.15 : 0.28, state.mode === "lead" ? "square" : "sawtooth", 0.14);
  element.classList.add("active");
  window.setTimeout(() => element.classList.remove("active"), 110);
  if (state.recording && state.playing && state.currentStep >= 0) {
    const track = state.mode === "lead" ? 0 : 1;
    state.pattern[track][state.currentStep] = note;
    state.selectedPreset = -1;
    renderChannels();
    renderTracks();
  }
}

function drawVisualizer() {
  const width = 50;
  const height = 15;
  const beat = state.currentStep < 0 ? 0 : state.currentStep;
  const activeHits = state.pattern.reduce((sum, row) => sum + (row[beat] ? 1 : 0), 0);
  visualizer.innerHTML = "";

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const span = document.createElement("span");
      const waveA = Math.sin((x + state.visualTick * 1.4) * 0.38) * 3.7 + 7;
      const waveB = Math.sin((x - state.visualTick * 0.8) * 0.24 + 1.8) * 4.4 + 7;
      const distance = Math.min(Math.abs(y - waveA), Math.abs(y - waveB));
      const seeded = Math.abs(Math.sin(x * 12.9898 + y * 78.233 + state.selectedPreset * 3.1));
      let char = seeded > 0.53 ? "+" : seeded > 0.23 ? "-" : "*";
      let className = "";

      if (distance < 0.67) {
        char = x % 7 < 2 ? "(" : x % 7 > 4 ? ")" : "/";
        className = "wave";
      } else if (distance < 1.22) {
        char = x % 3 === 0 ? "/" : ")";
        className = "wave";
      }

      const pulseX = state.playing ? (beat / 15) * 49 : -20;
      const pulseDistance = Math.hypot((x - pulseX) * 0.7, y - 7);
      if (state.playing && pulseDistance < Math.max(2.1, activeHits * 0.7)) {
        const symbols = ["*", "▲", "K", "#", "⬢"];
        char = symbols[(x + y + state.visualTick) % symbols.length];
        className = char === "#" || char === "⬢" ? "peak" : "hit";
      } else if (seeded > 0.965) {
        char = "+";
        className = "glint";
      }

      span.className = className;
      span.textContent = char;
      visualizer.append(span);
    }
  }
}

transportButton.addEventListener("click", togglePlayback);
document.querySelector("#clearButton").addEventListener("click", clearPattern);
document.querySelector("#randomButton").addEventListener("click", randomizePattern);
recordButton.addEventListener("click", () => {
  state.recording = !state.recording;
  recordButton.classList.toggle("recording", state.recording);
});

document.querySelectorAll(".mode-button").forEach((button) => {
  button.addEventListener("click", () => {
    state.mode = button.dataset.mode;
    document.querySelectorAll(".mode-button").forEach((item) => item.classList.toggle("selected", item === button));
  });
  button.addEventListener("contextmenu", (event) => event.preventDefault());
});

["tempo", "swing", "volume"].forEach((id) => {
  document.querySelector(`#${id}`).addEventListener("input", updateControlOutputs);
});

document.addEventListener("keydown", (event) => {
  if (event.repeat) return;
  if (event.code === "Space" && !event.target.matches("input")) {
    event.preventDefault();
    togglePlayback();
    return;
  }
  const noteIndex = HOTKEYS.indexOf(event.key.toLowerCase());
  if (noteIndex !== -1) triggerKeyboardNote(NOTES[noteIndex], keyboard.children[noteIndex]);
});

renderLogo();
renderChannels();
renderStepNumbers();
renderTracks();
renderKeyboard();
drawVisualizer();
