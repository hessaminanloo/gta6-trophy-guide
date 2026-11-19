// render.js — turns trophy data and tracker state into DOM.
//
// Three views share the work: the checklist grid, the detail pane that opens
// beside it with one trophy's guide and sources, and the roadmap page. All
// rendering is plain DOM built from the data files; nothing is fetched here.

import { displayDescription, displayName, isMasked } from './filters.js';

export const GRADE_LABEL = {
  platinum: 'Platinum',
  gold: 'Gold',
  silver: 'Silver',
  bronze: 'Bronze',
};

export const KIND_LABEL = {
  story: 'Story',
  missable: 'Missable',
  collectibles: 'Collectibles',
  activities: 'Activities',
  online: 'Online',
};

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

export function renderProgress(root, trophies, store) {
  root.replaceChildren();
  const earned = store.earnedCount();
  const head = el('div', 'progress-head');
  head.append(
    el('span', 'progress-count', `${earned}`),
    el('span', 'progress-of', `of ${trophies.length} earned`),
  );
  const bar = el('div', 'progress-bar');
  const fill = el('div', 'progress-fill');
  fill.style.width = `${trophies.length ? (earned / trophies.length) * 100 : 0}%`;
  bar.append(fill);
  const byGrade = el('div', 'progress-grades');
  for (const grade of ['platinum', 'gold', 'silver', 'bronze']) {
    const all = trophies.filter((t) => t.grade === grade);
    const got = all.filter((t) => store.isEarned(t.id)).length;
    const chip = el('span', `grade-chip grade-${grade}`, `${GRADE_LABEL[grade]} ${got}/${all.length}`);
    byGrade.append(chip);
  }
  root.append(head, bar, byGrade);
}

export function trophyCard(trophy, store, { onToggle, onOpen }) {
  const card = el('article', `card grade-edge-${trophy.grade}`);
  if (store.isEarned(trophy.id)) card.classList.add('is-earned');
  card.dataset.trophyId = String(trophy.id);

  const top = el('div', 'card-top');
  const check = el('input', 'card-check');
  check.type = 'checkbox';
  check.checked = store.isEarned(trophy.id);
  check.setAttribute('aria-label', `Mark ${trophy.name} as earned`);
  check.addEventListener('change', () => onToggle(trophy, check.checked));
  const grade = el('span', `grade-badge grade-${trophy.grade}`, GRADE_LABEL[trophy.grade]);
  top.append(check, grade);
  if (trophy.missable) top.append(el('span', 'missable-badge', 'Missable'));
  if (trophy.hidden) top.append(el('span', 'hidden-badge', 'Hidden'));
  card.append(top);

  card.append(el('h3', 'card-name', displayName(trophy, store)));
  card.append(el('p', 'card-desc', displayDescription(trophy, store)));

  const meta = el('div', 'card-meta');
  meta.append(el('span', 'kind-tag', KIND_LABEL[trophy.kind] || trophy.kind));
  if (trophy.target) meta.append(el('span', 'target-tag', `Target ${trophy.target}`));
  card.append(meta);

  const open = el('button', 'card-open', isMasked(trophy, store) ? 'Reveal & guide' : 'Read the guide');
  open.type = 'button';
  open.addEventListener('click', () => onOpen(trophy));
  card.append(open);
  return card;
}

export function renderChecklist(root, trophies, store, handlers) {
  root.replaceChildren();
  if (!trophies.length) {
    root.append(el('p', 'empty-note', 'No trophies match. Clear the search or pick another filter.'));
    return;
  }
  for (const trophy of trophies) root.append(trophyCard(trophy, store, handlers));
}

export function renderDetail(root, trophy, store, sourceNames, { onToggle }) {
  root.replaceChildren();
  root.classList.add('has-detail');
  const masked = isMasked(trophy, store);

  const head = el('div', 'detail-head');
  head.append(el('span', `grade-badge grade-${trophy.grade}`, GRADE_LABEL[trophy.grade]));
  if (trophy.missable) head.append(el('span', 'missable-badge', 'Missable'));
  root.append(head);

  root.append(el('h2', 'detail-name', displayName(trophy, store)));
  root.append(el('p', 'detail-desc', displayDescription(trophy, store)));

  if (masked) {
    const note = el(
      'p',
      'detail-note',
      'Spoilers are on, so this trophy stays masked until you earn it. Reveal it to read the guide now.',
    );
    const reveal = el('button', 'reveal-button', 'Reveal this trophy');
    reveal.type = 'button';
    reveal.addEventListener('click', () => {
      store.reveal(trophy.id);
      renderDetail(root, trophy, store, sourceNames, { onToggle });
    });
    root.append(note, reveal);
    return;
  }

  root.append(el('h3', 'detail-subhead', 'How to earn it'));
  root.append(el('p', 'detail-guide', trophy.guide));

  const facts = el('ul', 'detail-facts');
  const kindItem = el('li', '', `Kind: ${KIND_LABEL[trophy.kind] || trophy.kind}`);
  facts.append(kindItem);
  if (trophy.target) facts.append(el('li', '', `PlayStation progress target: ${trophy.target}`));
  if (trophy.hidden) facts.append(el('li', '', 'Hidden on PlayStation until earned'));
  if (trophy.missable) facts.append(el('li', '', 'Missable: can be locked out — see the roadmap'));
  root.append(facts);

  root.append(el('h3', 'detail-subhead', 'Sources'));
  const list = el('ul', 'detail-sources');
  for (const key of trophy.sources) {
    list.append(el('li', '', sourceNames[key] || key));
  }
  root.append(list);

  const toggle = el('button', 'detail-toggle', store.isEarned(trophy.id) ? 'Mark as not earned' : 'Mark as earned');
  toggle.type = 'button';
  toggle.addEventListener('click', () => onToggle(trophy, !store.isEarned(trophy.id)));
  root.append(toggle);
}

export function renderRoadmap(root, roadmap, store, trophiesByName) {
  root.replaceChildren();
  root.append(el('h2', 'roadmap-title', roadmap.title));
  root.append(el('p', 'roadmap-intro', roadmap.intro));

  for (const step of roadmap.steps) {
    const section = el('section', 'roadmap-step');
    section.append(el('h3', '', `Step ${step.n} — ${step.name}`));
    section.append(el('p', 'roadmap-goal', step.goal));
    section.append(el('p', 'roadmap-detail', step.detail));
    const list = el('ul', 'roadmap-trophies');
    for (const name of step.trophies) {
      const trophy = trophiesByName.get(name);
      const item = el('li', store && trophy && store.isEarned(trophy.id) ? 'done' : '', name);
      list.append(item);
    }
    section.append(list);
    root.append(section);
  }

  const miss = el('section', 'roadmap-missables');
  miss.append(el('h3', '', 'Missable trophies'));
  for (const m of roadmap.missables) {
    miss.append(el('p', 'roadmap-missable', `${m.name} — ${m.why}`));
  }
  root.append(miss);

  const counts = el('section', 'roadmap-counts');
  counts.append(el('h3', '', 'The list in numbers'));
  counts.append(el('p', '', roadmap.counts.note));
  const table = el('ul', 'counts-list');
  const g = roadmap.counts.byGrade;
  const k = roadmap.counts.byKind;
  table.append(
    el('li', '', `Grades: ${g.platinum} platinum, ${g.gold} gold, ${g.silver} silver, ${g.bronze} bronze`),
    el('li', '', `Kinds: ${k.story} story, ${k.missable} missable, ${k.collectibles} collectibles, ${k.activities} activities, ${k.online} online`),
    el('li', '', `Hidden on PlayStation: ${roadmap.counts.hidden}`),
  );
  counts.append(table);
  root.append(counts);
}
