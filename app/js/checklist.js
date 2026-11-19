// The checklist: one card per trophy, with its checkbox, official name and
// description, grade badge, kind chips, target counter and missable flag. A
// card click (anywhere but the checkbox) opens the trophy in the detail pane.
// gradeProgress feeds the masthead's per-grade breakdown. Spoiler-masked cards
// show 'Hidden trophy — earn it to reveal' in place of the name and
// description; the checkbox still works, so a reader who earns one can tick it
// off without seeing the spoiler first.
import { escapeHtml, gradeLabel, kindLabel } from './format.js';
import { isSpoilerHidden } from './filters.js';

export function gradeProgress(trophies, earned) {
  const totals = {};
  const done = {};
  for (const t of trophies) {
    totals[t.grade] = (totals[t.grade] ?? 0) + 1;
    if (earned.has(t.id)) done[t.grade] = (done[t.grade] ?? 0) + 1;
  }
  return ['platinum', 'gold', 'silver', 'bronze'].map(
    (grade) => `${gradeLabel(grade)} ${done[grade] ?? 0}/${totals[grade] ?? 0}`,
  );
}

export function trophyCard(trophy, state, onToggle, onSelect) {
  const li = document.createElement('li');
  const earned = state.earned.has(trophy.id);
  const masked = isSpoilerHidden(trophy, state.spoiler, state.earned);
  li.className = 'trophy-card' + (earned ? ' earned' : '') + (state.selectedId === trophy.id ? ' selected' : '');

  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = earned;
  box.setAttribute('aria-label', `Earned: ${trophy.name}`);
  box.addEventListener('change', (event) => {
    event.stopPropagation();
    onToggle(trophy.id, box.checked);
  });
  li.append(box);

  const body = document.createElement('div');
  const name = document.createElement('div');
  name.className = 'trophy-name';
  name.textContent = masked ? 'Hidden trophy — earn it to reveal' : trophy.name;
  body.append(name);

  const desc = document.createElement('div');
  desc.className = 'trophy-desc';
  desc.textContent = masked ? 'This trophy stays hidden on PlayStation until you earn it.' : trophy.description;
  body.append(desc);

  const meta = document.createElement('div');
  meta.className = 'trophy-meta';
  const grade = document.createElement('span');
  grade.className = `grade grade-${trophy.grade}`;
  grade.textContent = gradeLabel(trophy.grade);
  meta.append(grade);
  for (const kind of trophy.kinds) {
    const chip = document.createElement('span');
    chip.className = 'chip';
    chip.textContent = kindLabel(kind);
    meta.append(chip);
  }
  if (trophy.hidden && !masked) {
    const chip = document.createElement('span');
    chip.className = 'chip chip-hidden';
    chip.textContent = 'Hidden on PSN';
    meta.append(chip);
  }
  if (trophy.target && !masked) {
    const chip = document.createElement('span');
    chip.className = 'chip chip-target';
    chip.textContent = `Target: ${trophy.target}`;
    meta.append(chip);
  }
  body.append(meta);
  li.append(body);

  const side = document.createElement('div');
  side.className = 'trophy-grade-col';
  if (trophy.missable === 'yes' && !masked) {
    const flag = document.createElement('span');
    flag.className = 'missable-flag';
    flag.textContent = '⚠ Missable';
    side.append(flag);
  }
  li.append(side);

  li.addEventListener('click', (event) => {
    if (event.target === box) return;
    onSelect(trophy.id);
  });
  return li;
}

export function renderChecklist(listEl, statusEl, emptyEl, trophies, state, onToggle, onSelect) {
  listEl.replaceChildren();
  for (const t of trophies) {
    listEl.append(trophyCard(t, state, onToggle, onSelect));
  }
  const earnedCount = state.earned.size;
  statusEl.textContent = `Showing ${trophies.length} of ${state.trophies.length} trophies · ${earnedCount} earned · ${state.trophies.length - earnedCount} to go`;
  emptyEl.hidden = trophies.length !== 0;
  if (state.kind === 'online') {
    emptyEl.hidden = false;
    emptyEl.textContent = 'There are no online trophies in GTA VI — all 55 are offline single-player (PowerPyx). Nothing to track here.';
  } else {
    emptyEl.textContent = 'No trophies match these filters. Try clearing the search or choosing another kind.';
  }
}

export function progressText(state) {
  const total = state.trophies.length;
  const earned = state.earned.size;
  const byGrade = {};
  for (const t of state.trophies) {
    if (state.earned.has(t.id)) byGrade[t.grade] = (byGrade[t.grade] ?? 0) + 1;
  }
  return { total, earned, byGrade };
}

const NEXT_UP_ORDER = [
  'positive-mental-attitude', 'just-like-paradise', 'paradise-lost', 't-ass-drug-money',
  'vice-city-baby', 'top-of-the-world-ma', 'you-gotta-know-when-to-get-off',
];

export function nextUpTrophy(state) {
  for (const id of NEXT_UP_ORDER) {
    if (!state.earned.has(id)) return state.trophies.find((t) => t.id === id);
  }
  return state.trophies.find((t) => !state.earned.has(t.id)) ?? null;
}

export { escapeHtml };
