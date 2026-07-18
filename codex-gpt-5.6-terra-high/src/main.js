import './style.css';

const tracks = ['Lead', 'Bass', 'Kick', 'Snare', 'Clap', 'Hi-hat', 'Open hat', 'Rimshot', 'Tom', 'Cowbell', 'Shaker', 'Crash'];
const presets = ['DARKROOM', 'GREASE', 'BACKSTREET', 'DAYLIGHT', 'ACID'];
const notes = ['A', 'C', 'D', 'E', 'G', 'A⁺', 'C⁺'];
const shortcuts = ['A','S','D','F','G','H','J'];
const pitches = ['', 'A', 'C', 'D', 'E', 'G', 'A⁺', 'C⁺'];
const initial = [
  [0,0,5,0,0,0,3,0,0,0,0,0,7,0,0,6],
  [1,0,0,1,0,0,1,0,1,0,0,1,0,0,4,0],
  [1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],
  [1,1,0,1,1,1,0,1,1,1,0,1,1,1,0,1],
  [0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0],
  [0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
];
let pattern = initial.map(r => [...r]);
let activePreset = 0, playStep = -1, playing = false, mode = 'lead';
let timer, muted = new Set(), audio;

const $ = s => document.querySelector(s);
const grid = $('#grid'), trackNames = $('#track-names'), labels = $('#step-labels');

function renderChannels() {
  $('#channels').innerHTML = presets.map((name, i) => `<button class="${i === activePreset ? 'selected' : ''}" data-preset="${i}"><i></i>CH·${String((i+1)*10).padStart(2,'0')} ${name}</button>`).join('');
  document.querySelectorAll('[data-preset]').forEach(button => button.onclick = () => { activePreset = +button.dataset.preset; renderChannels(); randomize(); });
}
function renderNames() {
  trackNames.innerHTML = tracks.map((name,i) => `<button class="track ${muted.has(i) ? 'muted' : ''}" data-track="${i}"><i></i> CH·${String(i+1).padStart(2,'0')} <strong>${name}</strong></button>`).join('');
  document.querySelectorAll('[data-track]').forEach(el => el.onclick = () => { const n=+el.dataset.track; muted.has(n) ? muted.delete(n) : muted.add(n); renderNames(); });
}
function renderGrid() {
  grid.innerHTML = pattern.flatMap((row, r) => row.map((value, c) => `<button class="cell ${value ? 'on' : ''} ${c===playStep ? 'playing' : ''}" data-r="${r}" data-c="${c}">${r < 2 && value ? pitches[value] : ''}</button>`)).join('');
  grid.querySelectorAll('.cell').forEach(cell => {
    cell.onclick = () => editCell(cell, 1);
    cell.oncontextmenu = e => { e.preventDefault(); editCell(cell, -1); };
  });
}
function editCell(cell, dir) {
  const r = +cell.dataset.r, c = +cell.dataset.c;
  if (r < 2 && mode === (r === 0 ? 'lead' : 'bass')) pattern[r][c] = (pattern[r][c] + dir + 8) % 8;
  else pattern[r][c] = pattern[r][c] ? 0 : 1;
  renderGrid();
}
function randomize() {
  const density = activePreset === 4 ? .35 : activePreset === 3 ? .22 : .17;
  pattern = pattern.map((row, r) => row.map((v,c) => {
    if (r < 2) return Math.random() < density ? 1 + Math.floor(Math.random()*7) : 0;
    const chance = r === 5 ? .65 : r === 2 ? .24 : r === 3 ? .16 : density;
    return Math.random() < chance ? 1 : 0;
  })); renderGrid();
}
function clear() { pattern = pattern.map(row=>row.map(()=>0)); renderGrid(); }
function audioBeep(row, val) {
  if (!audio || muted.has(row)) return;
  const now = audio.currentTime, gain = audio.createGain(); gain.connect(audio.destination); gain.gain.setValueAtTime(0.0001, now);
  const kick = row === 2, snare = row === 3 || row === 4, hat = row >= 5;
  if (snare || hat) {
    const buffer = audio.createBuffer(1, audio.sampleRate*.06, audio.sampleRate), d=buffer.getChannelData(0); for(let i=0;i<d.length;i++) d[i]=Math.random()*2-1;
    const noise=audio.createBufferSource(); noise.buffer=buffer; const filter=audio.createBiquadFilter(); filter.type='highpass'; filter.frequency.value=hat?6500:1500; noise.connect(filter).connect(gain); noise.start(now);
    gain.gain.exponentialRampToValueAtTime(hat?.10:.15,now+.002); gain.gain.exponentialRampToValueAtTime(.0001,now+.07);
  } else { const osc=audio.createOscillator(); osc.type=kick?'sine':row===1?'sawtooth':'square'; osc.frequency.setValueAtTime(kick?120: row===1?70:180*Math.pow(2,(val-1)/12),now); if(kick) osc.frequency.exponentialRampToValueAtTime(42,now+.09); osc.connect(gain); osc.start(now); osc.stop(now+.13); gain.gain.exponentialRampToValueAtTime(row===1?.05:.08,now+.005); gain.gain.exponentialRampToValueAtTime(.0001,now+.13); }
}
function advance() { playStep = (playStep + 1) % 16; pattern.forEach((row, r)=> { if(row[playStep]) audioBeep(r,row[playStep]); }); renderGrid(); }
function togglePlay() { playing = !playing; const p=$('#play'); p.classList.toggle('stop',playing); p.innerHTML = playing ? '<span class="pause">■</span><span>STOP</span>' : '<span class="triangle">▶</span><span>PLAY</span>'; if(playing) { audio ||= new (window.AudioContext||window.webkitAudioContext)(); audio.resume(); advance(); timer=setInterval(advance, (60000 / +$('#tempo').value) / 4); } else { clearInterval(timer); playStep=-1; renderGrid(); } }
function buildViz() { const chars=['/','/','+','+','+','/','+','(','(','+','+','/','/','+','/','-','-']; let html=''; for(let r=0;r<16;r++){ for(let c=0;c<44;c++){ let curve=Math.sin(c*.28+r*.18)*3+Math.sin(c*.52-r*.31)*2; let edge=Math.abs(r-7.5); const strong=Math.abs(curve) > edge-2; const ch=strong?chars[(c+r*3)%chars.length]:(Math.random()>.72?'+':'–'); const bright=strong && Math.random()>.32?'bright':''; const cyan=Math.random()>.92?'cyan':''; html += `<span class="${bright} ${cyan}">${ch}</span>`; } } $('#visualizer').innerHTML=html; }
function init(){ labels.innerHTML=Array.from({length:16},(_,i)=>`<b>${i+1}</b>`).join(''); renderChannels(); renderNames(); renderGrid(); buildViz(); setInterval(buildViz, 900); $('#play').onclick=togglePlay; $('#random').onclick=randomize; $('#header-random').onclick=randomize; $('#clear').onclick=clear; $('#loop').onclick=e=>e.currentTarget.classList.toggle('on'); document.querySelectorAll('.mode').forEach(b=>b.onclick=()=>{mode=b.dataset.mode; document.querySelectorAll('.mode').forEach(x=>x.classList.toggle('active',x===b));}); $('#keys').innerHTML=notes.map((n,i)=>`<button data-note="${i+1}"><b>${n}</b><small>${shortcuts[i]}</small></button>`).join(''); document.querySelectorAll('#keys button').forEach(b=>b.onclick=()=>{ pattern[mode==='lead'?0:1] = pattern[mode==='lead'?0:1].map(v=>v?+b.dataset.note:0); renderGrid(); }); ['tempo','swing','volume'].forEach(id=>$('#'+id).oninput=e=>$('#'+id+'-value').textContent=id==='swing'?e.target.value+'%':e.target.value); document.addEventListener('keydown',e=>{if(e.code==='Space'&&!e.repeat){e.preventDefault();togglePlay();} const ix=shortcuts.indexOf(e.key.toUpperCase());if(ix>=0){document.querySelector(`#keys button[data-note="${ix+1}"]`)?.click()}}); }
init();
