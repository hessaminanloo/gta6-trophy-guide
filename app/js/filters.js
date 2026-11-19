// filters.js — which trophies the checklist shows, and what a spoiler-masked
// trophy looks like until it is earned or revealed.
//
// Spoiler rule: with spoilers on, a trophy that is hidden on PlayStation or
// belongs to the story shows as "Hidden trophy" — name and description
// masked — until the player earns it or taps to reveal it.

export const KINDS = ['all', 'story', 'missable', 'collectibles', 'activities', 'online'];

export function isMasked(trophy, store) {
  if (!store.spoilers) return false;
  if (store.isEarned(trophy.id) || store.isRevealed(trophy.id)) return false;
  return trophy.hidden || trophy.kind === 'story';
}

export function displayName(trophy, store) {
  return isMasked(trophy, store) ? 'Hidden trophy' : trophy.name;
}

export function displayDescription(trophy, store) {
  return isMasked(trophy, store)
    ? 'Hidden until earned. Turn spoilers off, or reveal this trophy, to read it.'
    : trophy.description;
}

export function applyFilters(trophies, { kind = 'all', query = '' } = {}) {
  const q = query.trim().toLowerCase();
  return trophies.filter((t) => {
    if (kind !== 'all' && t.kind !== kind) return false;
    if (!q) return true;
    return (
      t.name.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.guide.toLowerCase().includes(q)
    );
  });
}
