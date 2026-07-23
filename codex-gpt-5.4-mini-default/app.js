const trackNames = [
  "CH·01 Lead","CH·02 Bass","CH·03 Kick","CH·04 Snare","CH·05 Clap","CH·06 Hi-hat",
  "CH·07 Open hat","CH·08 Rimshot","CH·09 Tom","CH·10 Cowbell","CH·11 Shaker","CH·12 Crash"
];
const noteLabels = [
  ["A","A"],["C","S"],["D","D"],["E","F"],["G","G"],["A+","H"],["C+","J"]
];
const pitchTokens = ["A","C","D","E","G","A+","C+"];

const state = {
  playing: true,
  tempo: 132,
  swing: 0,
  volume: 90,
  step: 0,
  mode: "LEAD",
  tracks: Array.from({length: 12}, (_, r) => {
    const cells = Array(16).fill(null);
    if (r === 0) [2,6,12,15].forEach((c,i)=>cells[c]=pitchTokens[i % pitchTokens.length]);
    if (r === 1) [0,3,6,8,11,14].forEach((c)=>cells[c]="A");
    if (r === 2) [0,4,8,12].forEach((c)=>cells[c]="");
    if (r === 4) [4,12].forEach((c)=>cells[c]="");
    if (r === 5) [0,1,3,5,7,8,9,11,12,13,15].forEach((c)=>cells[c]="");
    if (r === 6) [2,6,10,14].forEach((c)=>cells[c]="");
    if (r === 7) [7,15].forEach((c)=>cells[c]="");
    if (r === 8) [14].forEach((c)=>cells[c]="");
    if (r === 10) [0,2,4,6,8,10,12,14].forEach((c)=>cells[c]="");
    if (r === 11) [0].forEach((c)=>cells[c]="");
    return { muted:false, cells };
  })
};

const el = (id) => document.getElementById(id);
const trackList = el("trackList");
const stepNumbers = el("stepNumbers");
const stepGrid = el("stepGrid");
const noteRow = el("noteRow");
const canvas = el("glyphCanvas");
const ctx = canvas.getContext("2d");

function buildTrackList(){
  trackList.innerHTML = "";
  trackNames.forEach((name, idx) => {
    const row = document.createElement("div");
    row.className = "track-row";
    row.dataset.track = idx;
    row.innerHTML = `<span class="sq"></span><span class="name">${name}</span>`;
    row.addEventListener("click", () => {
      state.tracks[idx].muted = !state.tracks[idx].muted;
      row.classList.toggle("muted", state.tracks[idx].muted);
    });
    trackList.appendChild(row);
  });
}

function buildGrid(){
  stepNumbers.innerHTML = "";
  stepGrid.innerHTML = "";
  for(let i=0;i<16;i++){
    const n=document.createElement("div");
    n.className="step-number";
    n.textContent=i+1;
    n.dataset.step=i;
    stepNumbers.appendChild(n);
  }
  state.tracks.forEach((track, r) => {
    for(let c=0;c<16;c++){
      const cell=document.createElement("div");
      cell.className="grid-cell";
      cell.dataset.row=r;
      cell.dataset.col=c;
      const value = track.cells[c];
      if(value !== null){
        cell.classList.add("on");
        if(value) cell.innerHTML = `<span>${value}</span>`;
      }
      cell.addEventListener("click", () => {
        track.cells[c] = track.cells[c] === null ? "" : null;
        renderGrid();
      });
      cell.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        if(track.cells[c] !== null){
          track.cells[c] = cyclePitch(track.cells[c], -1);
          renderGrid();
        }
      });
      stepGrid.appendChild(cell);
    }
  });
}

function cyclePitch(cur, dir){
  const idx = pitchTokens.indexOf(cur || "A");
  const next = (idx + dir + pitchTokens.length) % pitchTokens.length;
  return pitchTokens[next];
}

function renderGrid(){
  [...stepGrid.children].forEach((cell) => {
    const r = +cell.dataset.row, c = +cell.dataset.col;
    const track = state.tracks[r];
    cell.classList.toggle("on", track.cells[c] !== null);
    cell.classList.toggle("playhead", c === state.step);
    cell.innerHTML = track.cells[c] ? `<span>${track.cells[c]}</span>` : "";
  });
  [...stepNumbers.children].forEach((n, idx) => {
    n.classList.toggle("active", idx === state.step);
  });
  [...trackList.children].forEach((row, idx) => row.classList.toggle("muted", state.tracks[idx].muted));
}

function buildNotes(){
  noteRow.innerHTML = "";
  noteLabels.forEach(([big, small]) => {
    const d = document.createElement("div");
    d.className = "note";
    d.innerHTML = `<div class="big">${big}</div><div class="small">${small}</div>`;
    noteRow.appendChild(d);
  });
}

function syncControls(){
  el("tempo").value = state.tempo;
  el("swing").value = state.swing;
  el("volume").value = state.volume;
  el("tempoValue").textContent = state.tempo;
  el("swingValue").textContent = `${state.swing}%`;
  el("volumeValue").textContent = state.volume;
  const playBtn = el("playBtn");
  playBtn.classList.toggle("paused", !state.playing);
  el("playLabel").textContent = state.playing ? "PLAY" : "STOP";
  playBtn.setAttribute("aria-pressed", String(state.playing));
}

function setupControls(){
  el("playBtn").addEventListener("click", () => { state.playing = !state.playing; syncControls(); });
  el("tempo").addEventListener("input", (e)=>{ state.tempo = +e.target.value; syncControls(); });
  el("swing").addEventListener("input", (e)=>{ state.swing = +e.target.value; syncControls(); });
  el("volume").addEventListener("input", (e)=>{ state.volume = +e.target.value; syncControls(); });
  document.addEventListener("keydown", (e) => {
    if(e.code === "Space"){ e.preventDefault(); state.playing = !state.playing; syncControls(); }
  });
}

function drawGlyphPanel(t){
  const w = canvas.width, h = canvas.height;
  ctx.clearRect(0,0,w,h);
  ctx.fillStyle = "#0b0b0c";
  ctx.fillRect(0,0,w,h);

  const cols = 46, rows = 16;
  const cellW = w / cols, cellH = h / rows;
  const palette = ["#d8d8d8","#79c6ff","#8cf2ef","#263f6c","#cfe1ff"];
  const activeCol = state.step;
  const motion = state.playing ? t : t * 0.2;
  for(let y=0;y<rows;y++){
    for(let x=0;x<cols;x++){
      const n = Math.sin(x*0.8 + y*1.6 + motion*2.1) + Math.cos(x*1.4 - y*0.7 + motion*1.7);
      const band = Math.abs(Math.sin((x + activeCol*2) * 0.27 + y*0.23 + motion));
      let ch = "/";
      if(band > 0.72) ch = "(";
      else if(band > 0.48) ch = "+";
      else if(band > 0.3) ch = "-";
      if(n > 1.2) ch = "*";
      const idx = Math.floor(((n + 2) / 4) * palette.length) % palette.length;
      const isBright = band > 0.88 || n > 1.45;
      const color = isBright ? (Math.sin(motion*8 + x+y) > 0 ? "#87f0ff" : "#f7f7f7") : palette[idx];
      ctx.fillStyle = color;
      ctx.font = `${Math.max(18, cellH*0.9)}px "IBM Plex Mono", monospace`;
      ctx.fillText(ch, x*cellW + 12, y*cellH + cellH*0.78);
    }
  }
  ctx.globalAlpha = 0.16;
  ctx.fillStyle = "#0e2e63";
  ctx.fillRect(0, h*0.64, w, h*0.36);
  ctx.globalAlpha = 1;
}

function tick(ts){
  const bpm = state.tempo;
  const stepDur = (60 / bpm) / 4 * 1000;
  if(state.playing){
    const step = Math.floor(ts / stepDur) % 16;
    state.step = step;
  }
  drawGlyphPanel(ts / 1000);
  renderGrid();
  requestAnimationFrame(tick);
}

buildTrackList();
buildGrid();
buildNotes();
setupControls();
syncControls();
requestAnimationFrame(tick);
