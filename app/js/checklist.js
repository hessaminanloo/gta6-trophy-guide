// The checklist: one card per trophy, with its checkbox, official name and
// description, grade badge, kind chips, target counter and missable flag. A
// card click (anywhere but the checkbox) opens the trophy in the detail pane.
// gradeProgress feeds the masthead's per-grade breakdown. Spoiler-masked cards
// show "Hidden trophy — earn it to reveal" in place of the name and
// description; the checkbox still works, so a reader who earns one can tick it
// off without seeing the spoiler first.
import { escapeHtml, gradeLabel, kindLabel, GRADE_ORDER } from './format.js';
import { isSpoilerHidden } from './filters.js';

export function gradeProgress(trophies, earned) {
  const totals = {};
  const done = {};
  for (const trophy of trophies) {
    totals[trophy.grade] = (totals[trophy.grade] ?? 0) + 1;
    if (earned.has(trophy.id)) done[trophy.grade] = (done[trophy.grade] ?? 0) + 1;
  }
  return GRADE_ORDER.map(
    (grade) => `${gradeLabel(grade)} ${done[grade] ?? 0}/${totals[grade] ?? 0}`,
  );
}

function metaChips(trophy, masked) {
  const chips = [];
  const grade = document.createElement('span');
  grade.className = `grade grade-${trophy.grade}`;
  grade.textContent = gradeLabel(trophy.grade);
  chips.push(grade);
  for (const kind of trophy.kinds) {
    const chip = document.createElement('span');
    chip.className = 'chip';
    chip.textContent = kindLabel(kind);
    chips.push(chip);
  }
  if (trophy.hidden && !masked) {
    const chip = document.createElement('span');
    chip.className = 'chip chip-hidden';
    chip.textContent = 'Hidden on PSN';
    chips.push(chip);
  }
  if (trophy.target && !masked) {
    const chip = document.createElement('span');
    chip.className = 'chip chip-target';
    chip.textContent = `Target: ${trophy.target}`;
    chips.push(chip);
  }
  return chips;
}

export function trophyCard(trophy, state, onToggle, onSelect) {
  const item = document.createElement('li');
  const earned = state.earned.has(trophy.id);
  const masked = isSpoilerHidden(trophy, state.spoiler, state.earned);
  item.className = 'trophy-card' + (earned ? ' earned' : '') + (state.selectedId === trophy.id ? ' selected' : '');

  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = earned;
  box.setAttribute('aria-label', `Earned: ${trophy.name}`);
  box.addEventListener('change', (event) => {
    event.stopPropagation();
    onToggle(trophy.id, box.checked);
  });
  item.append(box);

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
  for (const chip of metaChips(trophy, masked)) meta.append(chip);
  body.append(meta);
  item.append(body);

  const side = document.createElement('div');
  side.className = 'trophy-grade-col';
  if (trophy.missable === 'yes' && !masked) {
    const flag = document.createElement('span');
    flag.className = 'missable-flag';
    flag.textContent = '⚠ Missable';
    side.append(flag);
  }
  item.append(side);

  item.addEventListener('click', (event) => {
    if (event.target === box) return;
    onSelect(trophy.id);
  });
  return item;
}

export function renderChecklist(listEl, statusEl, emptyEl, trophies, state, onToggle, onSelect) {
  listEl.replaceChildren();
  for (const trophy of trophies) {
    listEl.append(trophyCard(trophy, state, onToggle, onSelect));
  }
  const earnedCount = state.earned.size;
  statusEl.textContent = `Showing ${trophies.length} of ${state.trophies.length} trophies · ${earnedCount} earned · ${state.trophies.length - earnedCount} to go`;
  if (state.kind === 'online') {
    emptyEl.hidden = false;
    emptyEl.textContent = 'There are no online trophies in GTA VI — all 55 are offline single-player (PowerPyx). Nothing to track here.';
  } else {
    emptyEl.hidden = trophies.length !== 0;
    emptyEl.textContent = 'No trophies match these filters. Try clearing the search or choosing another kind.';
  }
}

export function progressText(state) {
  const total = state.trophies.length;
  const earned = state.earned.size;
  const byGrade = {};
  for (const trophy of state.trophies) {
    if (state.earned.has(trophy.id)) byGrade[trophy.grade] = (byGrade[trophy.grade] ?? 0) + 1;
  }
  return { total, earned, byGrade };
}

// The next trophy the masthead suggests: the one missable trophy first (it
// must not be left until after Chapter 1), then the story trophies in order,
// then the first trophy not yet earned.
const NEXT_UP_ORDER = [
  'positive-mental-attitude', 'just-like-paradise', 'paradise-lost', 't-ass-drug-money',
  'vice-city-baby', 'top-of-the-world-ma', 'you-gotta-know-when-to-get-off',
];

export function nextUpTrophy(state) {
  for (const id of NEXT_UP_ORDER) {
    if (!state.earned.has(id)) return state.trophies.find((trophy) => trophy.id === id);
  }
  return state.trophies.find((trophy) => !state.earned.has(trophy.id)) ?? null;
}

export { escapeHtml };
