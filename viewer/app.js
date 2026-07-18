const REFERENCE = {
  id: 'reference',
  label: 'Reference video',
  detail: 'Original Beetbox capture',
  provider: 'Source',
  model: 'beetbox.mov',
  effort: 'n/a',
  runner: 'Original',
  state: 'ready',
  path: 'reference.html'
};

const state = {
  runs: [],
  a: 'reference',
  b: 'codex-sol-xhigh',
  mode: 'split',
  scale: 'fit'
};

const elements = {
  catalog: document.querySelector('#catalog'),
  comparison: document.querySelector('#comparison'),
  count: document.querySelector('#run-count'),
  selectA: document.querySelector('#select-a'),
  selectB: document.querySelector('#select-b')
};

function itemById(id) {
  return id === REFERENCE.id ? REFERENCE : state.runs.find((run) => run.id === id) || REFERENCE;
}

function itemUrl(item, cacheBust = '') {
  if (item.path) {
    const url = new URL(item.path, document.baseURI);
    if (cacheBust) url.searchParams.set('v', cacheBust);
    return url.href;
  }
  const hostname = window.location.hostname || 'localhost';
  return `${window.location.protocol}//${hostname}:${item.port}/${cacheBust ? `?v=${cacheBust}` : ''}`;
}

function suspendPreview(iframe, focusId = null) {
  iframe.contentWindow?.postMessage({ type: 'beetbox:audio-suspend', focusId }, '*');
}

window.addEventListener('message', (event) => {
  if (event.data?.type !== 'beetbox:audio-focus' || typeof event.data.focusId !== 'string') return;
  const iframes = [...document.querySelectorAll('.preview-panel iframe')];
  for (const iframe of iframes) suspendPreview(iframe, event.data.focusId);
});

function providerClass(provider) {
  if (provider === 'OpenAI') return 'openai';
  if (provider === 'Anthropic') return 'anthropic';
  if (provider === 'MiniMax') return 'minimax';
  return 'source';
}

function providerGlyph(provider) {
  if (provider === 'OpenAI') return 'GPT';
  if (provider === 'Anthropic') return 'CLD';
  if (provider === 'MiniMax') return 'MM';
  return 'SRC';
}

function optionLabel(item) {
  if (item.id === 'reference') return 'Reference · original video';
  return `${item.label} · ${item.effort}`;
}

function renderSelects() {
  const items = [REFERENCE, ...state.runs];
  const options = items.map((item) => `<option value="${item.id}">${optionLabel(item)}</option>`).join('');
  elements.selectA.innerHTML = options;
  elements.selectB.innerHTML = options;
  elements.selectA.value = state.a;
  elements.selectB.value = state.b;
}

function visibleRuns() {
  return state.runs;
}

function renderCatalog() {
  const runs = visibleRuns();
  elements.count.textContent = runs.length;
  elements.catalog.innerHTML = runs.map((run) => {
    const selected = run.id === state.a || run.id === state.b;
    const glyph = providerGlyph(run.provider);
    return `<button class="run-card ${providerClass(run.provider)} ${selected ? 'selected' : ''}" data-run="${run.id}" type="button"><span class="run-copy"><strong>${run.label}</strong><small>${run.runner} · ${run.effort}</small></span><span class="provider-glyph">${glyph}</span></button>`;
  }).join('');
  elements.catalog.querySelectorAll('[data-run]').forEach((button) => {
    button.addEventListener('click', () => {
      const id = button.dataset.run;
      if (state.mode === 'solo') state.a = id;
      else state.b = id;
      persist();
      render();
    });
  });
}

function updatePanel(side) {
  const id = state[side];
  const item = itemById(id);
  const panel = document.querySelector(`.preview-panel[data-side="${side}"]`);
  const chip = panel.querySelector('.provider-chip');
  const title = panel.querySelector('.preview-identity strong');
  const detail = panel.querySelector('.preview-identity small');
  const iframe = panel.querySelector('iframe');
  const nextUrl = itemUrl(item);

  chip.textContent = item.provider;
  chip.className = `provider-chip ${providerClass(item.provider)}`;
  title.textContent = item.label;
  detail.textContent = item.id === 'reference' ? item.detail : `${item.runner} · ${item.effort}`;
  panel.classList.toggle('waiting', !['ready', 'missing', 'error'].includes(item.state));
  panel.querySelector('.loading-card').lastChild.textContent = item.state === 'starting' ? 'Preview is starting' : 'Preparing preview';

  if (iframe.dataset.item !== item.id) {
    suspendPreview(iframe);
    iframe.dataset.item = item.id;
    iframe.src = nextUrl;
  }
  panel.querySelector('.reload').onclick = () => { iframe.src = itemUrl(item, Date.now()); };
  panel.querySelector('.open').onclick = () => window.open(nextUrl, '_blank', 'noopener,noreferrer');
}

function fitPreviews() {
  if (state.scale !== 'fit') return;
  document.querySelectorAll('.viewport').forEach((viewport) => {
    const scale = Math.min(viewport.clientWidth / 1454, viewport.clientHeight / 1622);
    const left = Math.max(0, (viewport.clientWidth - 1454 * scale) / 2);
    const top = Math.max(0, (viewport.clientHeight - 1622 * scale) / 2);
    viewport.style.setProperty('--preview-scale', scale.toFixed(4));
    const iframe = viewport.querySelector('iframe');
    iframe.style.left = `${left}px`;
    iframe.style.top = `${top}px`;
  });
}

function render() {
  renderSelects();
  renderCatalog();
  elements.comparison.className = `comparison ${state.mode} ${state.scale}`;
  if (state.mode === 'solo') suspendPreview(document.querySelector('.preview-panel[data-side="b"] iframe'));
  document.querySelectorAll('[data-mode]').forEach((button) => button.classList.toggle('active', button.dataset.mode === state.mode));
  document.querySelectorAll('[data-scale]').forEach((button) => button.classList.toggle('active', button.dataset.scale === state.scale));
  updatePanel('a');
  updatePanel('b');
  requestAnimationFrame(fitPreviews);
}

function persist() {
  const params = new URLSearchParams({ a: state.a, b: state.b, mode: state.mode, scale: state.scale });
  history.replaceState(null, '', `#${params}`);
}

function restore() {
  const params = new URLSearchParams(location.hash.slice(1));
  for (const key of ['a', 'b', 'mode', 'scale']) {
    if (params.has(key)) state[key] = params.get(key);
  }
}

async function fetchRuns(initial = false) {
  const response = await fetch(new URL('runs.json', document.baseURI), { cache: 'no-store' });
  const payload = await response.json();
  const previous = new Map(state.runs.map((run) => [run.id, run.state]));
  state.runs = payload.runs;
  if (initial) {
    restore();
    const validIds = new Set(['reference', ...state.runs.map((run) => run.id)]);
    if (!validIds.has(state.a)) state.a = 'reference';
    if (!validIds.has(state.b) || state.b === 'reference') state.b = state.runs[0]?.id || 'reference';
    render();
    return;
  }

  let shouldRefresh = false;
  for (const run of state.runs) {
    if (previous.get(run.id) !== 'ready' && run.state === 'ready' && [state.a, state.b].includes(run.id)) shouldRefresh = true;
  }
  renderCatalog();
  updatePanel('a');
  updatePanel('b');
  if (shouldRefresh) {
    for (const side of ['a', 'b']) {
      const item = itemById(state[side]);
      if (item.state === 'ready') document.querySelector(`.preview-panel[data-side="${side}"] iframe`).src = itemUrl(item, Date.now());
    }
  }
}

document.querySelectorAll('[data-mode]').forEach((button) => button.addEventListener('click', () => {
  state.mode = button.dataset.mode;
  persist();
  render();
}));
document.querySelectorAll('[data-scale]').forEach((button) => button.addEventListener('click', () => {
  state.scale = button.dataset.scale;
  persist();
  render();
}));
elements.selectA.addEventListener('change', () => { state.a = elements.selectA.value; persist(); render(); });
elements.selectB.addEventListener('change', () => { state.b = elements.selectB.value; persist(); render(); });
document.querySelector('#swap').addEventListener('click', () => { [state.a, state.b] = [state.b, state.a]; persist(); render(); });

let browseIndex = 0;
document.addEventListener('keydown', (event) => {
  if (event.target.matches('select, button, input')) return;
  if (!['ArrowUp', 'ArrowDown'].includes(event.key)) return;
  event.preventDefault();
  const runs = visibleRuns();
  if (!runs.length) return;
  browseIndex = (browseIndex + (event.key === 'ArrowDown' ? 1 : -1) + runs.length) % runs.length;
  if (state.mode === 'solo') state.a = runs[browseIndex].id;
  else state.b = runs[browseIndex].id;
  persist();
  render();
});

new ResizeObserver(fitPreviews).observe(elements.comparison);
window.addEventListener('hashchange', () => { restore(); render(); });

fetchRuns(true).catch((error) => {
  console.error(error);
});
setInterval(() => fetchRuns(false).catch(console.error), 3000);
