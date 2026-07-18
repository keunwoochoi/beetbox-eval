// Beetbox drum machine sequencer

const TRACKS = [
  { id: 'lead', name: 'Lead', channel: 1 },
  { id: 'bass', name: 'Bass', channel: 2 },
  { id: 'kick', name: 'Kick', channel: 3 },
  { id: 'snare', name: 'Snare', channel: 4 },
  { id: 'clap', name: 'Clap', channel: 5 },
  { id: 'hihat', name: 'Hi-hat', channel: 6 },
  { id: 'openhat', name: 'Open hat', channel: 7 },
  { id: 'rimshot', name: 'Rimshot', channel: 8 },
  { id: 'tom', name: 'Tom', channel: 9 },
  { id: 'cowbell', name: 'Cowbell', channel: 10 },
  { id: 'shaker', name: 'Shaker', channel: 11 },
  { id: 'crash', name: 'Crash', channel: 12 }
];

// Track name mappings for display
const TRACK_LABELS = {
  'lead': 'Lead',
  'bass': 'Bass',
  'kick': 'Kick',
  'snare': 'Snare',
  'clap': 'Clap',
  'hihat': 'Hi-hat',
  'openhat': 'Open hat',
  'rimshot': 'Rimshot',
  'tom': 'Tom',
  'cowbell': 'Cowbell',
  'shaker': 'Shaker',
  'crash': 'Crash'
};

const STEPS = 16;
const CHANNELS = ['10', '20', '30', '40', '50'];

// State
const state = {
  isPlaying: false,
  currentStep: 0,
  tempo: 132,
  swing: 0,
  volume: 90,
  currentChannel: '10',
  grid: {},
  mutedTracks: new Set(),
  currentPitch: 0,
  onAir: false
};

// Initialize grid
TRACKS.forEach(track => {
  state.grid[track.id] = new Array(STEPS).fill(false);
});

// Visualizer data
let audioData = new Uint8Array(256);

// DOM elements
const playBtn = document.getElementById('play-btn');
const tempoSlider = document.getElementById('tempo-slider');
const tempoValue = document.getElementById('tempo-value');
const swingSlider = document.getElementById('swing-slider');
const swingValue = document.getElementById('swing-value');
const volumeSlider = document.getElementById('volume-slider');
const volumeValue = document.getElementById('volume-value');
const onAirToggle = document.getElementById('on-air-toggle');
const clearBtn = document.getElementById('clear-btn');
const randomBtn = document.getElementById('random-btn');
const tracksList = document.getElementById('tracks-list');
const sequencerGrid = document.getElementById('sequencer-grid');
const stepIndicators = document.getElementById('step-indicators');
const visualizerCanvas = document.getElementById('visualizer-canvas');
const chordBtns = document.querySelectorAll('.chord-btn');

// Initialize
function init() {
  // Create step numbers
  for (let i = 1; i <= STEPS; i++) {
    const num = document.createElement('div');
    num.className = 'step-number';
    num.textContent = i;
    num.dataset.step = i - 1;
    stepIndicators.appendChild(num);
  }

  // Create tracks
  TRACKS.forEach((track, idx) => {
    const trackEl = document.createElement('div');
    trackEl.className = 'track-item';
    trackEl.dataset.track = track.id;

    const indicator = document.createElement('div');
    indicator.className = 'track-mute-indicator';

    const name = document.createElement('div');
    name.className = 'track-name';
    const channelNum = String(idx + 1).padStart(2, '0');
    name.textContent = `CH.${channelNum} ${TRACK_LABELS[track.id].toUpperCase()}`;

    trackEl.appendChild(indicator);
    trackEl.appendChild(name);
    trackEl.addEventListener('click', () => toggleTrackMute(track.id));

    tracksList.appendChild(trackEl);
  });

  // Create grid cells
  TRACKS.forEach(track => {
    const row = document.createElement('div');
    row.className = 'grid-row';

    for (let step = 0; step < STEPS; step++) {
      const cell = document.createElement('div');
      cell.className = 'grid-cell';
      cell.dataset.track = track.id;
      cell.dataset.step = step;
      cell.addEventListener('click', () => toggleCell(track.id, step));

      row.appendChild(cell);
    }

    sequencerGrid.appendChild(row);
  });

  // Add some default pattern (matching the visible pattern in the screenshot)
  const defaultPattern = {
    lead: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    bass: [0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0],
    kick: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
    snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
    clap: [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0],
    hihat: [1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1],
    openhat: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
    rimshot: [0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0],
    tom: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0],
    cowbell: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    shaker: [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
    crash: [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0]
  };

  Object.keys(defaultPattern).forEach(track => {
    state.grid[track] = defaultPattern[track];
  });

  chordBtns[0].classList.add('active');
  updateGridDisplay();

  // Event listeners
  playBtn.addEventListener('click', togglePlayback);
  tempoSlider.addEventListener('input', updateTempo);
  swingSlider.addEventListener('input', updateSwing);
  volumeSlider.addEventListener('input', updateVolume);
  onAirToggle.addEventListener('change', updateOnAir);
  clearBtn.addEventListener('click', clearGrid);
  randomBtn.addEventListener('click', randomizeGrid);

  document.querySelectorAll('.channel-btn').forEach(btn => {
    btn.addEventListener('click', selectChannel);
  });

  chordBtns.forEach(btn => {
    btn.addEventListener('click', selectPitch);
  });

  // Keyboard shortcuts
  document.addEventListener('keydown', handleKeypress);

  // Setup visualizer
  setupVisualizer();

  // Start animation loop
  animationLoop();
}

function togglePlayback() {
  state.isPlaying = !state.isPlaying;
  playBtn.textContent = state.isPlaying ? '⏹ STOP' : '▶ PLAY';
  playBtn.classList.toggle('playing', state.isPlaying);

  if (state.isPlaying) {
    startPlayback();
  }
}

function startPlayback() {
  const stepDuration = (60000 / state.tempo) / (1 + state.swing * 0.01);

  const playStep = () => {
    if (!state.isPlaying) return;

    updateStepIndicators();

    // Trigger sounds for active cells
    TRACKS.forEach(track => {
      if (state.grid[track.id][state.currentStep] && !state.mutedTracks.has(track.id)) {
        playSound(track.id);
      }
    });

    state.currentStep = (state.currentStep + 1) % STEPS;
    setTimeout(playStep, stepDuration);
  };

  playStep();
}

function updateStepIndicators() {
  document.querySelectorAll('.step-number').forEach((el, i) => {
    el.classList.toggle('active', i === state.currentStep);
  });

  document.querySelectorAll('.grid-cell').forEach((cell) => {
    if (parseInt(cell.dataset.step) === state.currentStep) {
      cell.classList.add('playing');
      setTimeout(() => cell.classList.remove('playing'), 100);
    }
  });
}

function toggleCell(trackId, step) {
  state.grid[trackId][step] = !state.grid[trackId][step];
  updateGridDisplay();
}

function updateGridDisplay() {
  document.querySelectorAll('.grid-cell').forEach(cell => {
    const trackId = cell.dataset.track;
    const step = parseInt(cell.dataset.step);
    const isActive = state.grid[trackId][step];

    cell.classList.toggle('active', isActive);

    // Add note labels for certain tracks
    if (isActive) {
      const noteMap = {
        lead: ['A', 'C', 'D', 'E', 'G', 'A+', 'C+'][state.currentPitch],
        bass: ['A', 'C', 'D', 'E', 'G', 'A+', 'C+'][state.currentPitch]
      };
      if (noteMap[trackId]) {
        cell.textContent = noteMap[trackId];
      }
    } else {
      cell.textContent = '';
    }
  });
}

function toggleTrackMute(trackId) {
  if (state.mutedTracks.has(trackId)) {
    state.mutedTracks.delete(trackId);
  } else {
    state.mutedTracks.add(trackId);
  }

  const trackEl = document.querySelector(`[data-track="${trackId}"]`);
  trackEl.classList.toggle('muted', state.mutedTracks.has(trackId));

  const indicator = trackEl.querySelector('.track-mute-indicator');
  indicator.classList.toggle('muted', state.mutedTracks.has(trackId));
}

function updateTempo(e) {
  state.tempo = parseInt(e.target.value);
  tempoValue.textContent = state.tempo;
}

function updateSwing(e) {
  state.swing = parseInt(e.target.value);
  swingValue.textContent = state.swing + '%';
}

function updateVolume(e) {
  state.volume = parseInt(e.target.value);
  volumeValue.textContent = state.volume;
}

function updateOnAir(e) {
  state.onAir = e.target.checked;
}

function selectChannel(e) {
  document.querySelectorAll('.channel-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  e.target.classList.add('active');
  state.currentChannel = e.target.dataset.channel;
}

function selectPitch(e) {
  chordBtns.forEach(btn => {
    btn.classList.remove('active');
  });
  e.target.classList.add('active');
  state.currentPitch = parseInt(e.target.dataset.pitch);
  updateGridDisplay();
}

function clearGrid() {
  if (confirm('Clear all beats?')) {
    TRACKS.forEach(track => {
      state.grid[track.id] = new Array(STEPS).fill(false);
    });
    updateGridDisplay();
  }
}

function randomizeGrid() {
  TRACKS.forEach(track => {
    for (let i = 0; i < STEPS; i++) {
      state.grid[track.id][i] = Math.random() > 0.7;
    }
  });
  updateGridDisplay();
}

function handleKeypress(e) {
  if (e.code === 'Space') {
    e.preventDefault();
    togglePlayback();
  }

  // Number keys for grid columns
  const num = parseInt(e.key);
  if (num >= 1 && num <= 9) {
    // Could implement keyboard input for grid
  }
}

function playSound(trackId) {
  // Create simple beep using Web Audio API
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const now = audioContext.currentTime;

    // Different frequencies for different tracks
    const frequencies = {
      lead: 440,
      bass: 110,
      kick: 60,
      snare: 200,
      clap: 300,
      hihat: 8000,
      openhat: 10000,
      rimshot: 400,
      tom: 150,
      cowbell: 1200,
      shaker: 5000,
      crash: 12000
    };

    const freq = frequencies[trackId] || 440;
    const osc = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    osc.connect(gainNode);
    gainNode.connect(audioContext.destination);

    osc.frequency.value = freq;
    gainNode.gain.setValueAtTime(state.volume / 100, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

    osc.start(now);
    osc.stop(now + 0.1);
  } catch (e) {
    // Audio context might not be available
  }
}

function setupVisualizer() {
  const ctx = visualizerCanvas.getContext('2d');
  const rect = visualizerCanvas.getBoundingClientRect();
  visualizerCanvas.width = rect.width;
  visualizerCanvas.height = rect.height;
}

function drawVisualizer() {
  const ctx = visualizerCanvas.getContext('2d');
  const width = visualizerCanvas.width;
  const height = visualizerCanvas.height;

  // Clear canvas
  ctx.fillStyle = '#0f2a47';
  ctx.fillRect(0, 0, width, height);

  // Generate random visualizer bars with pattern
  ctx.fillStyle = '#00d4ff';
  const barCount = 32;
  const barWidth = width / barCount;

  for (let i = 0; i < barCount; i++) {
    const value = Math.sin(i * 0.3 + state.currentStep * 0.2) * 0.5 + 0.5;
    const barHeight = value * height * 0.8;

    ctx.fillRect(
      i * barWidth + 2,
      height - barHeight,
      barWidth - 4,
      barHeight
    );
  }

  // Add some random symbols overlay (visual effect)
  ctx.fillStyle = 'rgba(0, 212, 255, 0.2)';
  ctx.font = 'bold 12px monospace';
  ctx.fillText('▮ ▮ ▮ ▮ ▮', 20, 30);
}

function animationLoop() {
  drawVisualizer();
  requestAnimationFrame(animationLoop);
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', init);
