// Leonida Ledger boot: loads the trophy list and the roadmap, wires the
// toolbar, tabs and hash routing, and renders. The app fetches only its own
// files (data/trophies.json, data/roadmap.json) and works with the network off.
// Screenshot aids, documented in shots.json: ?demo=1 seeds 13 earned trophies,
// ?spoiler=1 turns the spoiler setting on, ?open=<id> opens a trophy's guide,
// ?view=roadmap|missables picks the opening tab.
import { loadProgress, saveProgress, exportProgress, parseImport, resetProgress } from './store.js';
import { kindCounts, filterTrophies } from './filters.js';
import { renderChecklist, nextUpTrophy } from './checklist.js';
import { renderDetail } from './detail.js';
import { renderRoadmap } from './roadmap.js';
import { renderMissables } from './missables.js';

const DEMO_EARNED = [
  'just-like-paradise', 'paradise-lost', 'trust', 'baited-my-tackle',
  'stick-fiddler', 'whip-it-good', 'you-wainker', 'master-of-none',
  'the-goodtime-state', 'hot-together', 'gunslinger', 'treat-yo-self',
  'on-the-spot',
];

const params = new URLSearchParams(location.search);
const state = {
  trophies: [],
  roadmap: null,
  earned: loadProgress(),
  spoiler: params.get('spoiler') === '1',
  kind: params.get('kind') ?? 'all',
  grade: params.get('grade') ?? 'all',
  earnedFilter: 'all',
  query: '',
  view: params.get('view') ?? 'checklist',
  selectedId: params.get('open') ?? null,
};

if (params.get('demo') === '1') {
  state.earned = new Set(DEMO_EARNED);
  saveProgress(state.earned);
}

const $ = (id) => document.getElementById(id);
const listEl = $('trophy-list');
const statusEl = $('list-status');
const emptyEl = $('empty-note');
const detailEl = $('detail');
const toolbarEl = $('toolbar');

function renderAll() {
  const filtered = filterTrophies(state.trophies, state);
  renderChecklist(listEl, statusEl, emptyEl, filtered, state, toggleEarned, selectTrophy);
  const selected = state.trophies.find((t) => t.id === state.selectedId) ?? null;
  renderDetail(detailEl, selected, state, toggleEarned);
  renderProgress();
  renderTabs();
}

function renderProgress() {
  const total = state.trophies.length;
  const earned = state.earned.size;
  $('earned-count').textContent = String(earned);
  const bar = $('progress-bar');
  bar.setAttribute('aria-valuenow', String(earned));
  $('progress-fill').style.width = total ? `${Math.round((earned / total) * 100)}%` : '0%';
  const next = nextUpTrophy(state);
  $('progress-next').innerHTML = next
    ? `Next up: <strong>${next.name}</strong> — ${next.description}`
    : 'All 55 earned. Leonida Legend.';
}

function renderTabs() {
  for (const tab of document.querySelectorAll('.tab')) {
    tab.classList.toggle('active', tab.dataset.view === state.view);
  }
  $('view-checklist').hidden = state.view !== 'checklist';
  $('view-roadmap').hidden = state.view !== 'roadmap';
  $('view-missables').hidden = state.view !== 'missables';
  toolbarEl.style.display = state.view === 'checklist' ? '' : 'none';
}

function toggleEarned(id, earned) {
  if (earned) state.earned.add(id);
  else state.earned.delete(id);
  saveProgress(state.earned);
  renderAll();
}

function selectTrophy(id) {
  state.selectedId = id;
  state.view = 'checklist';
  renderAll();
  if (location.hash !== `#/trophy/${id}`) history.replaceState(null, '', `#/trophy/${id}`);
}

function openTrophyFromElsewhere(id) {
  selectTrophy(id);
  document.getElementById('view-checklist').scrollIntoView();
}

function routeFromHash() {
  const hash = location.hash;
  if (!hash) {
    // No hash on first load: keep the view from the ?view= parameter.
    renderAll();
    return;
  }
  if (hash === '#/roadmap') {
    state.view = 'roadmap';
  } else if (hash === '#/missables') {
    state.view = 'missables';
  } else if (hash.startsWith('#/trophy/')) {
    const id = hash.slice('#/trophy/'.length);
    if (state.trophies.some((t) => t.id === id)) state.selectedId = id;
    state.view = 'checklist';
  } else {
    state.view = 'checklist';
  }
  renderAll();
}

function wireToolbar() {
  const counts = kindCounts(state.trophies);
  for (const el of document.querySelectorAll('[data-count]')) {
    el.textContent = `(${counts[el.dataset.count] ?? 0})`;
  }
  const kindRadios = document.querySelectorAll('input[name="kind"]');
  for (const radio of kindRadios) {
    radio.checked = radio.value === state.kind;
    radio.addEventListener('change', () => {
      state.kind = radio.value;
      renderAll();
    });
  }
  const gradeSelect = $('grade');
  gradeSelect.value = state.grade;
  gradeSelect.addEventListener('change', () => {
    state.grade = gradeSelect.value;
    renderAll();
  });
  $('earned-filter').addEventListener('change', (event) => {
    state.earnedFilter = event.target.value;
    renderAll();
  });
  $('search').addEventListener('input', (event) => {
    state.query = event.target.value;
    renderAll();
  });
  const spoilerBox = $('spoiler');
  spoilerBox.checked = state.spoiler;
  spoilerBox.addEventListener('change', () => {
    state.spoiler = spoilerBox.checked;
    renderAll();
  });
  $('export').addEventListener('click', () => exportProgress(state.earned));
  $('import').addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    try {
      const imported = parseImport(await file.text(), state.trophies.map((t) => t.id));
      state.earned = imported;
      saveProgress(state.earned);
      renderAll();
    } catch {
      alert('That file is not a Leonida Ledger progress export.');
    }
    event.target.value = '';
  });
  $('reset').addEventListener('click', () => {
    if (confirm('Clear all earned trophies? This cannot be undone — export your progress first if you want to keep it.')) {
      state.earned = resetProgress();
      renderAll();
    }
  });
  for (const tab of document.querySelectorAll('.tab')) {
    tab.addEventListener('click', () => {
      location.hash = tab.dataset.view === 'checklist' ? '#/' : `#/${tab.dataset.view}`;
    });
  }
  window.addEventListener('hashchange', routeFromHash);
}

async function bootMain() {
  const [trophiesDoc, roadmapDoc] = await Promise.all([
    (await fetch('data/trophies.json')).json(),
    (await fetch('data/roadmap.json')).json(),
  ]);
  state.trophies = trophiesDoc.trophies;
  state.roadmap = roadmapDoc;
  const byId = new Map(state.trophies.map((t) => [t.id, t]));
  if (!state.selectedId && state.trophies.length) state.selectedId = state.trophies[0].id;
  renderRoadmap($('roadmap'), state.roadmap, byId, openTrophyFromElsewhere);
  renderMissables($('missables'), state.trophies, openTrophyFromElsewhere);
  wireToolbar();
  routeFromHash();
}

bootMain();
