// main.js — boots Leonida Ledger and wires the toolbar to the views.
//
// Layout: a header with the progress summary, a toolbar (search, kind
// filters, the spoiler switch, export/import), the checklist grid with a
// detail pane beside it, and a roadmap page. State changes flow one way:
// mutate the store, then repaint the parts that depend on it.

import { loadData, summarise } from './data.js';
import { KINDS, applyFilters } from './filters.js';
import { renderChecklist, renderDetail, renderProgress, renderRoadmap } from './render.js';
import { Store } from './store.js';

const ui = {
  kind: 'all',
  query: '',
  view: 'checklist',
  selectedId: null,
};

function download(filename, text) {
  const blob = new Blob([text], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function boot() {
  const { trophyData, trophies, roadmap } = await loadData();
  const store = new Store(window.location);
  const summary = summarise(trophies);
  const byName = new Map(trophies.map((t) => [t.name, t]));
  const byId = new Map(trophies.map((t) => [t.id, t]));

  const progressRoot = document.querySelector('#progress');
  const grid = document.querySelector('#grid');
  const detail = document.querySelector('#detail');
  const roadmapRoot = document.querySelector('#roadmap');
  const checklistView = document.querySelector('#checklist-view');
  const roadmapView = document.querySelector('#roadmap-view');
  const countNote = document.querySelector('#count-note');
  const demoNote = document.querySelector('#demo-note');

  document.querySelector('#list-makeup').textContent =
    `${summary.total} trophies — ${summary.grades.platinum} platinum, ${summary.grades.gold} gold, ` +
    `${summary.grades.silver} silver, ${summary.grades.bronze} bronze; ${summary.hidden} hidden, ${summary.missable} missable.`;
  if (store.demo) demoNote.hidden = false;

  function repaint() {
    renderProgress(progressRoot, trophies, store);
    const shown = applyFilters(trophies, ui);
    countNote.textContent = `Showing ${shown.length} of ${trophies.length}`;
    renderChecklist(grid, shown, store, { onToggle, onOpen });
    if (ui.selectedId != null && byId.has(ui.selectedId)) {
      renderDetail(detail, byId.get(ui.selectedId), store, trophyData.sources, { onToggle });
    }
    renderRoadmap(roadmapRoot, roadmap, store, byName);
  }

  function onToggle(trophy, on) {
    store.setEarned(trophy.id, on);
    repaint();
  }

  function onOpen(trophy) {
    ui.selectedId = trophy.id;
    renderDetail(detail, trophy, store, trophyData.sources, { onToggle });
    detail.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }

  // Toolbar: search.
  const search = document.querySelector('#search');
  search.addEventListener('input', () => {
    ui.query = search.value;
    repaint();
  });

  // Toolbar: kind filter chips.
  const chips = document.querySelector('#kind-chips');
  for (const kind of KINDS) {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'chip' + (kind === ui.kind ? ' is-active' : '');
    chip.dataset.kind = kind;
    chip.textContent = kind === 'all' ? 'All' : kind[0].toUpperCase() + kind.slice(1);
    chip.addEventListener('click', () => {
      ui.kind = kind;
      chips.querySelectorAll('.chip').forEach((c) => c.classList.toggle('is-active', c.dataset.kind === kind));
      repaint();
    });
    chips.append(chip);
  }

  // Toolbar: spoiler switch.
  const spoilerToggle = document.querySelector('#spoiler-toggle');
  spoilerToggle.checked = store.spoilers;
  spoilerToggle.addEventListener('change', () => {
    store.setSpoilers(spoilerToggle.checked);
    repaint();
  });

  // Toolbar: export and import.
  document.querySelector('#export-button').addEventListener('click', () => {
    download('leonida-ledger-progress.json', store.exportText());
  });
  const fileInput = document.querySelector('#import-file');
  document.querySelector('#import-button').addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', async () => {
    const file = fileInput.files[0];
    if (!file) return;
    try {
      store.importText(await file.text());
      repaint();
    } catch (err) {
      window.alert(err.message);
    }
    fileInput.value = '';
  });

  // View tabs: checklist and roadmap.
  const tabButtons = document.querySelectorAll('[data-view]');
  function setView(view) {
    ui.view = view;
    checklistView.hidden = view !== 'checklist';
    roadmapView.hidden = view !== 'roadmap';
    tabButtons.forEach((b) => b.classList.toggle('is-active', b.dataset.view === view));
  }
  tabButtons.forEach((b) => b.addEventListener('click', () => setView(b.dataset.view)));

  // Open on a sensible default: a trophy whose guide shows straight away
  // (not spoiler-masked), so the first paint already shows a guide and its
  // sources beside the checklist. Opening the app never mutates the save.
  const opener = trophies.find((t) => t.name === 'The Shootist') || trophies[0];
  if (opener) ui.selectedId = opener.id;

  repaint();
  window.__ledger = { store, trophies, roadmap, repaint, setView, onOpen };
}

boot().catch((err) => {
  const main = document.querySelector('main');
  const p = document.createElement('p');
  p.className = 'empty-note';
  p.textContent = `The guide could not load its data: ${err.message}`;
  main.prepend(p);
});
