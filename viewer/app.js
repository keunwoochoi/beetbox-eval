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
  a: 'codex-sol-xhigh',
  b: 'reference',
  mode: 'solo',
  sortKey: null,
  sortDirection: null
};

const previewCacheBust = Date.now();
const compactMedia = window.matchMedia('(max-width: 820px)');

const mobileSortHost = document.querySelector('[data-mobile-sort-host]');
const desktopSortHeader = document.querySelector('.sidebar .catalog-header');
if (mobileSortHost && desktopSortHeader) {
  const mobileSortHeader = desktopSortHeader.cloneNode(true);
  mobileSortHeader.classList.add('mobile-catalog-header');
  mobileSortHost.replaceWith(mobileSortHeader);
}

const elements = {
  catalog: document.querySelector('#catalog'),
  mobileCatalog: document.querySelector('#mobile-catalog'),
  mobileTrigger: document.querySelector('#mobile-model-trigger'),
  mobileDialog: document.querySelector('#mobile-model-dialog'),
  mobileLabel: document.querySelector('#mobile-model-label'),
  mobileEffort: document.querySelector('#mobile-model-effort'),
  comparison: document.querySelector('#comparison'),
  referenceToggle: document.querySelector('#reference-toggle')
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

function pauseAllPreviews() {
  document.querySelectorAll('.preview-panel iframe').forEach((iframe) => {
    iframe.contentWindow?.postMessage({ type: 'beetbox:audio-pause' }, '*');
  });
}

window.addEventListener('message', (event) => {
  if (event.data?.type !== 'beetbox:audio-focus' || typeof event.data.focusId !== 'string') return;
  const iframes = [...document.querySelectorAll('.preview-panel iframe')];
  for (const iframe of iframes) suspendPreview(iframe, event.data.focusId);
});

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') pauseAllPreviews();
});

function visibleRuns() {
  if (!state.sortKey) return state.runs;
  const ratingValue = { pass: 2, warn: 1, fail: 0, unrated: -1 };
  const indexed = state.runs.map((run, index) => ({ run, index }));
  indexed.sort((left, right) => {
    const leftValue = state.sortKey === 'price'
      ? left.run.inputPrice
      : ratingValue[left.run.evaluation?.[state.sortKey] || 'unrated'];
    const rightValue = state.sortKey === 'price'
      ? right.run.inputPrice
      : ratingValue[right.run.evaluation?.[state.sortKey] || 'unrated'];
    const difference = leftValue - rightValue;
    if (difference === 0) return left.index - right.index;
    return state.sortDirection === 'asc' ? difference : -difference;
  });
  return indexed.map(({ run }) => run);
}

function updateSortHeaders() {
  document.querySelectorAll('[data-sort]').forEach((button) => {
    const active = button.dataset.sort === state.sortKey;
    button.classList.toggle('active', active);
    button.dataset.direction = active ? state.sortDirection : '';
    button.setAttribute('aria-pressed', String(active));
    const columnName = button.querySelector('.sort-short')?.textContent || button.textContent;
    button.title = active
      ? `Sorted ${state.sortDirection === 'asc' ? 'ascending' : 'descending'}; click to reverse`
      : `Sort by ${columnName.trim()}`;
  });
}

function scoreDot(run, axis) {
  const rating = run.evaluation?.[axis] || 'unrated';
  const axisLabels = { audio: 'Audio', visual: 'Visual prompt analysis', music: 'Music' };
  const ratingLabels = { pass: 'strong', warn: 'partial', fail: 'failed', unrated: 'not rated' };
  const label = `${axisLabels[axis]}: ${ratingLabels[rating]}`;
  return `<span class="score-cell"><small>${axisLabels[axis]}</small><span class="score-dot ${rating}" role="img" aria-label="${label}" title="${label}"></span></span>`;
}

function priceTag(run) {
  const label = `$${run.inputPrice} per 1 million uncached input tokens`;
  return `<span class="price-cell"><small>$/M</small><span class="price-tag" aria-label="${label}" title="${label}">${run.inputPrice}</span></span>`;
}

function renderCatalogInto(container) {
  if (!container) return;
  const runs = visibleRuns();
  const scrollTop = container.scrollTop;
  container.innerHTML = runs.map((run) => {
    const selected = run.id === state.a || run.id === state.b;
    return `<button class="run-card ${selected ? 'selected' : ''}" data-run="${run.id}" type="button"><span class="run-copy"><strong>${run.label}</strong><small>${run.effort}</small></span>${scoreDot(run, 'audio')}${scoreDot(run, 'visual')}${scoreDot(run, 'music')}${priceTag(run)}</button>`;
  }).join('');
  container.scrollTop = scrollTop;
  container.querySelectorAll('[data-run]').forEach((button) => {
    button.addEventListener('click', () => {
      state.a = button.dataset.run;
      if (container === elements.mobileCatalog) elements.mobileDialog?.close();
      persist();
      render();
    });
  });
}

function renderCatalog() {
  updateSortHeaders();
  renderCatalogInto(elements.catalog);
  renderCatalogInto(elements.mobileCatalog);
  const selected = itemById(state.a);
  if (elements.mobileLabel) elements.mobileLabel.textContent = selected.label;
  if (elements.mobileEffort) elements.mobileEffort.textContent = selected.effort;
}

document.querySelectorAll('[data-sort]').forEach((button) => {
  button.addEventListener('click', () => {
    const key = button.dataset.sort;
    if (state.sortKey === key) {
      state.sortDirection = state.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      state.sortKey = key;
      state.sortDirection = key === 'price' ? 'asc' : 'desc';
    }
    browseIndex = 0;
    elements.catalog.scrollTop = 0;
    if (elements.mobileCatalog) elements.mobileCatalog.scrollTop = 0;
    renderCatalog();
  });
});

elements.mobileTrigger?.addEventListener('click', () => {
  elements.mobileTrigger.setAttribute('aria-expanded', 'true');
  elements.mobileDialog?.showModal();
});
document.querySelector('[data-mobile-model-close]')?.addEventListener('click', () => {
  elements.mobileDialog?.close();
});
elements.mobileDialog?.addEventListener('click', (event) => {
  if (event.target === elements.mobileDialog) elements.mobileDialog.close();
});
elements.mobileDialog?.addEventListener('toggle', () => {
  elements.mobileTrigger?.setAttribute('aria-expanded', String(elements.mobileDialog.open));
});
elements.mobileDialog?.addEventListener('close', () => {
  elements.mobileTrigger?.setAttribute('aria-expanded', 'false');
});

function updatePanel(side) {
  const id = state[side];
  const item = itemById(id);
  const panel = document.querySelector(`.preview-panel[data-side="${side}"]`);
  const iframe = panel.querySelector('iframe');
  const nextUrl = itemUrl(item, previewCacheBust);

  panel.classList.toggle('reference-preview', item.id === 'reference');
  panel.classList.toggle('waiting', !['ready', 'missing', 'error'].includes(item.state));
  panel.querySelector('.loading-card').lastChild.textContent = item.state === 'starting' ? 'Preview is starting' : 'Preparing preview';

  if (iframe.dataset.item !== item.id) {
    suspendPreview(iframe);
    iframe.dataset.item = item.id;
    iframe.src = nextUrl;
  }
}

function fitPreviews() {
  document.querySelectorAll('.viewport').forEach((viewport) => {
    if (!viewport.clientWidth || !viewport.clientHeight) return;
    const iframe = viewport.querySelector('iframe');
    const item = itemById(iframe.dataset.item);
    const previewWidth = item.previewWidth || 1454;
    const previewHeight = item.previewHeight || Math.round(previewWidth * (1622 / 1454));
    const widthScale = viewport.clientWidth / previewWidth;
    const compactLayout = window.matchMedia('(max-width: 820px)').matches;
    const visibleDepth = viewport.clientHeight / viewport.clientWidth;
    const preferredDepth = 0.96;
    const minimumFraming = 0.8;
    const framing = Math.min(1, Math.max(minimumFraming, visibleDepth / preferredDepth));
    let scale = widthScale * framing;
    try {
      const documentHeight = Math.max(
        iframe.contentDocument?.body?.scrollHeight || 0,
        iframe.contentDocument?.documentElement?.scrollHeight || 0
      );
      const currentFrameHeight = Number.parseFloat(iframe.style.height) || 0;
      if (currentFrameHeight && documentHeight > currentFrameHeight + 8) {
        const contentScale = viewport.clientHeight / documentHeight;
        scale = Math.max(widthScale * minimumFraming, Math.min(scale, contentScale));
      }
    } catch {
      // Local multi-port previews are cross-origin; aspect-aware framing remains the fallback.
    }
    if (compactLayout) {
      scale = Math.min(widthScale, viewport.clientHeight / previewHeight);
    }
    const frameHeight = compactLayout ? previewHeight : viewport.clientHeight / scale;
    viewport.style.setProperty('--preview-scale', scale.toFixed(4));
    iframe.style.width = `${previewWidth}px`;
    iframe.style.height = `${frameHeight}px`;
    iframe.style.left = `${Math.max(0, (viewport.clientWidth - (previewWidth * scale)) / 2)}px`;
    iframe.style.top = compactLayout
      ? `${Math.max(0, (viewport.clientHeight - (previewHeight * scale)) / 2)}px`
      : '0px';
  });
}

function render() {
  if (compactMedia.matches) state.mode = 'solo';
  renderCatalog();
  elements.comparison.className = `comparison ${state.mode} fit`;
  elements.referenceToggle.textContent = state.mode === 'solo' ? 'Show reference' : 'Hide reference';
  elements.referenceToggle.classList.toggle('active', state.mode === 'split');
  elements.referenceToggle.setAttribute('aria-pressed', String(state.mode === 'split'));
  if (state.mode === 'solo') suspendPreview(document.querySelector('.preview-panel[data-side="b"] iframe'));
  updatePanel('a');
  updatePanel('b');
  requestAnimationFrame(fitPreviews);
}

function persist() {
  const values = compactMedia.matches ? { a: state.a } : { a: state.a, mode: state.mode };
  const params = new URLSearchParams(values);
  history.replaceState(null, '', `#${params}`);
}

function restore() {
  const params = new URLSearchParams(location.hash.slice(1));
  for (const key of ['a', 'mode']) {
    if (params.has(key)) state[key] = params.get(key);
  }
  if (compactMedia.matches) state.mode = 'solo';
}

async function fetchRuns(initial = false) {
  const response = await fetch(new URL('runs.json', document.baseURI), { cache: 'no-store' });
  const payload = await response.json();
  const previous = new Map(state.runs.map((run) => [run.id, run.state]));
  state.runs = payload.runs;
  if (initial) {
    restore();
    const validIds = new Set(['reference', ...state.runs.map((run) => run.id)]);
    if (!validIds.has(state.a)) state.a = state.runs[0]?.id || 'reference';
    state.b = 'reference';
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

elements.referenceToggle.addEventListener('click', () => {
  if (compactMedia.matches) return;
  state.mode = state.mode === 'solo' ? 'split' : 'solo';
  persist();
  render();
});

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
document.querySelectorAll('.preview-panel iframe').forEach((iframe) => {
  iframe.addEventListener('load', () => requestAnimationFrame(fitPreviews));
});
window.addEventListener('hashchange', () => { restore(); render(); });
compactMedia.addEventListener('change', () => {
  if (compactMedia.matches) {
    state.mode = 'solo';
    elements.mobileDialog?.close();
  }
  persist();
  render();
});

fetchRuns(true).catch((error) => {
  console.error(error);
});
setInterval(() => fetchRuns(false).catch(console.error), 3000);
