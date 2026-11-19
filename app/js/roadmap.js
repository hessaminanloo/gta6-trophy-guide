// The roadmap view: the three steps to the platinum, the chapter order, and
// the collectible counts, all built from the official descriptions and the
// cited guide. Step trophies are clickable and open the trophy in the list.
import { escapeHtml } from './format.js';

export function renderRoadmap(roadmapEl, roadmap, trophiesById, onOpenTrophy) {
  roadmapEl.replaceChildren();

  const title = document.createElement('h2');
  title.textContent = roadmap.title;
  roadmapEl.append(title);

  const lede = document.createElement('p');
  lede.className = 'lede';
  lede.textContent = roadmap.summary;
  roadmapEl.append(lede);

  for (const step of roadmap.steps) {
    const card = document.createElement('article');
    card.className = 'step';
    const hours = document.createElement('p');
    hours.className = 'step-hours';
    hours.textContent = `Step ${step.step} · ${step.hours}`;
    card.append(hours);
    const heading = document.createElement('h3');
    heading.textContent = step.name;
    card.append(heading);
    const text = document.createElement('p');
    text.textContent = step.text;
    card.append(text);
    if (step.watch) {
      const watch = document.createElement('p');
      watch.className = 'watch';
      watch.innerHTML = `<strong>Watch out:</strong> ${escapeHtml(step.watch)}`;
      card.append(watch);
    }
    const names = document.createElement('p');
    names.className = 'step-trophies';
    names.textContent = 'Trophies in this step: ';
    step.trophies.forEach((id, index) => {
      const trophy = trophiesById.get(id);
      if (!trophy) return;
      if (index > 0) names.append(document.createTextNode(' · '));
      const link = document.createElement('a');
      link.href = `#/trophy/${trophy.id}`;
      link.textContent = trophy.name;
      link.addEventListener('click', (event) => {
        event.preventDefault();
        onOpenTrophy(trophy.id);
      });
      names.append(link);
    });
    card.append(names);
    roadmapEl.append(card);
  }

  const chaptersTitle = document.createElement('h3');
  chaptersTitle.textContent = 'Story chapters and their trophies';
  roadmapEl.append(chaptersTitle);
  for (const chapter of roadmap.chapters) {
    const line = document.createElement('p');
    line.innerHTML = `<strong>Chapter ${chapter.chapter}:</strong> ${escapeHtml(chapter.note)} `;
    chapter.trophies.forEach((id, index) => {
      const trophy = trophiesById.get(id);
      if (!trophy) return;
      if (index > 0) line.append(document.createTextNode(' · '));
      const link = document.createElement('a');
      link.href = `#/trophy/${trophy.id}`;
      link.textContent = trophy.name;
      link.addEventListener('click', (event) => {
        event.preventDefault();
        onOpenTrophy(trophy.id);
      });
      line.append(link);
    });
    roadmapEl.append(line);
  }

  const countsTitle = document.createElement('h3');
  countsTitle.textContent = 'The counts that matter';
  roadmapEl.append(countsTitle);
  const table = document.createElement('table');
  table.className = 'counts-table';
  table.innerHTML = '<thead><tr><th>What</th><th>Need</th><th>Of</th><th>Notes</th></tr></thead>';
  const body = document.createElement('tbody');
  for (const count of roadmap.counts) {
    const row = document.createElement('tr');
    const label = document.createElement('td');
    label.textContent = count.label;
    const need = document.createElement('td');
    need.className = 'need';
    need.textContent = count.need;
    const of = document.createElement('td');
    of.textContent = count.of;
    const note = document.createElement('td');
    note.textContent = count.note;
    row.append(label, need, of, note);
    body.append(row);
  }
  table.append(body);
  roadmapEl.append(table);

  const sources = document.createElement('p');
  sources.className = 'lede';
  sources.innerHTML = 'Roadmap built from the official descriptions and PowerPyx’s <a href="https://www.powerpyx.com/gta-6-grand-theft-auto-vi-trophy-guide-roadmap/">GTA 6 Trophy Guide &amp; Roadmap</a> (18 Nov 2026).';
  roadmapEl.append(sources);
}
