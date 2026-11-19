// The missables view: the one trophy that can actually be missed, in full,
// and the reasons the rest cannot be — each built from the official
// descriptions and the cited guide, so a reader can see the reasoning.
import { escapeHtml } from './format.js';

const SAFE_REASONS = [
  { title: 'Story trophies cannot be missed', text: 'The 12 story trophies (chapters and main missions) unlock by finishing the story, which is linear. There is no mission replay, but you never need one: completing the story is the requirement.' },
  { title: 'Side questlines stay open after the story', text: 'Andy, Kenton, Billy, Randy, Tyrone and Bret all still offer their quests in free-roam after the credits. PowerPyx notes Kenton goes quiet for a while after Chapter 1 and comes back in Chapters 2–3, and that all trophy-related quest givers are available again later.' },
  { title: 'Optional missions are plentiful', text: 'Some optional missions disappear after a while, but the 100% checklist only needs any 100 of them and there are far more than 100 (PowerPyx estimates 200–300+), so a missed one never blocks a trophy.' },
  { title: 'Collectibles respawn or have spares', text: 'A few magazine collectibles sit in story buildings that later become inaccessible, but they also spawn elsewhere and are not needed in full for any trophy. Cards, WAiNK scans, vehicles and meditation spots all have more locations than the trophies require.' },
  { title: 'Cheats are the real lockout', text: 'Cheats disable trophies and saving. They only unlock after the story, so keep them off for the whole run — a cheated save cannot earn trophies.' },
];

export function renderMissables(missablesEl, trophies, onOpenTrophy) {
  missablesEl.replaceChildren();

  const title = document.createElement('h2');
  title.textContent = 'Missable trophies';
  missablesEl.append(title);

  const lede = document.createElement('p');
  lede.className = 'lede';
  lede.textContent = 'Only one trophy in GTA VI is reported as potentially missable. Everything else can be finished in free-roam after the story.';
  missablesEl.append(lede);

  const missable = trophies.filter((t) => t.missable === 'yes');
  for (const trophy of missable) {
    const hero = document.createElement('article');
    hero.className = 'missable-hero';
    const heading = document.createElement('h3');
    heading.textContent = `⚠ ${trophy.name} — the only potentially missable trophy`;
    hero.append(heading);
    const desc = document.createElement('p');
    desc.textContent = trophy.description;
    hero.append(desc);
    const guide = document.createElement('p');
    guide.textContent = trophy.guide;
    hero.append(guide);
    const open = document.createElement('p');
    const link = document.createElement('a');
    link.href = `#/trophy/${trophy.id}`;
    link.textContent = 'Open its full guide in the checklist';
    link.addEventListener('click', (event) => {
      event.preventDefault();
      onOpenTrophy(trophy.id);
    });
    open.append(link);
    hero.append(open);
    missablesEl.append(hero);
  }

  const safe = document.createElement('section');
  safe.className = 'safe-list';
  const safeTitle = document.createElement('h3');
  safeTitle.textContent = 'Why nothing else can be missed';
  safe.append(safeTitle);
  const list = document.createElement('ul');
  for (const reason of SAFE_REASONS) {
    const item = document.createElement('li');
    item.innerHTML = `<strong>${escapeHtml(reason.title)}.</strong> ${escapeHtml(reason.text)}`;
    list.append(item);
  }
  safe.append(list);
  const sources = document.createElement('p');
  sources.innerHTML = 'Sources: PowerPyx’s <a href="https://www.powerpyx.com/gta-6-grand-theft-auto-vi-trophy-guide-roadmap/">GTA 6 Trophy Guide &amp; Roadmap</a> (“Number of missable trophies: Potentially 1”) and the official trophy list on <a href="https://www.exophase.com/game/grand-theft-auto-vi-psn/trophies/">Exophase</a>. Keep a manual save at the start and end of each chapter anyway — the game has 15 manual save slots and 1 autosave slot, and there is no mission replay.';
  safe.append(sources);
  missablesEl.append(safe);
}
