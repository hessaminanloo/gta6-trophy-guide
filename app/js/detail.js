// The detail pane: the selected trophy's official name, description and
// grade, its chapter when it has one, its guide in our own words, and the
// sources that guide cites, each as a link the reader can follow.
// Spoiler-masked trophies show a notice instead of the guide, and trophies
// with no published method say so plainly. The guide's sources are links, not
// pasted text: the reader can follow each one to the original guide.
import { escapeHtml, gradeLabel, kindLabel, chapterLabel } from './format.js';
import { isSpoilerHidden } from './filters.js';

export function renderDetail(detailEl, trophy, state, onToggle) {
  detailEl.replaceChildren();
  if (!trophy) {
    const empty = document.createElement('div');
    empty.className = 'detail-card detail-empty';
    empty.innerHTML = '<h2>Pick a trophy</h2><p>Click any trophy in the list to read its guide and sources here. Tick the box when you earn it — your progress is saved in this browser.</p>';
    detailEl.append(empty);
    return;
  }

  const earned = state.earned.has(trophy.id);
  const masked = isSpoilerHidden(trophy, state.spoiler, state.earned);
  const card = document.createElement('div');
  card.className = 'detail-card';

  const title = document.createElement('h2');
  title.textContent = masked ? 'Hidden trophy' : trophy.name;
  card.append(title);

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
  if (trophy.missable === 'yes') {
    const chip = document.createElement('span');
    chip.className = 'chip chip-missable';
    chip.textContent = 'Missable — see the guide';
    meta.append(chip);
  }
  card.append(meta);

  const chapter = chapterLabel(trophy.chapter);
  if (chapter && !masked) {
    const chapterLine = document.createElement('p');
    chapterLine.className = 'detail-chapter';
    chapterLine.textContent = `Story · ${chapter}`;
    card.append(chapterLine);
  }

  const desc = document.createElement('p');
  desc.className = 'detail-desc';
  desc.textContent = masked
    ? 'Hidden on PlayStation until earned. Turn the spoiler setting off, or earn it, to read the name, description and guide.'
    : trophy.description;
  card.append(desc);

  if (trophy.target && !masked) {
    const target = document.createElement('p');
    target.className = 'detail-desc';
    target.innerHTML = `<strong>Target:</strong> ${escapeHtml(trophy.target)}`;
    card.append(target);
  }

  if (!masked) {
    const guide = document.createElement('div');
    guide.className = 'detail-guide';
    for (const paragraph of trophy.guide.split('\n')) {
      const p = document.createElement('p');
      p.textContent = paragraph;
      guide.append(p);
    }
    card.append(guide);

    if (trophy.guide.startsWith('No published method yet')) {
      const note = document.createElement('p');
      note.className = 'detail-unknown';
      note.textContent = 'Method not yet published: this guide was written on launch day (19 Nov 2026), when no guide had pinned this trophy down. The entry says so rather than inventing a location.';
      card.append(note);
    }

    const sources = document.createElement('div');
    sources.className = 'sources';
    const heading = document.createElement('h3');
    heading.textContent = 'Sources for this guide';
    sources.append(heading);
    const list = document.createElement('ul');
    for (const source of trophy.sources ?? []) {
      const item = document.createElement('li');
      const link = document.createElement('a');
      link.href = source.url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.textContent = source.name;
      item.append(link);
      list.append(item);
    }
    sources.append(list);
    card.append(sources);
  }

  const actions = document.createElement('div');
  actions.className = 'detail-actions';
  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = earned ? '' : 'primary';
  toggle.textContent = earned ? 'Mark as not earned' : 'Mark as earned';
  toggle.addEventListener('click', () => onToggle(trophy.id, !earned));
  actions.append(toggle);
  card.append(actions);

  detailEl.append(card);
}
