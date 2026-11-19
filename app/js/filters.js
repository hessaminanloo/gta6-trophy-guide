// Filtering and the spoiler rule. A trophy is spoiler-hidden when the spoiler
// setting is on, the trophy is hidden on PlayStation, and it has not been
// earned yet — its name, description and guide are then masked everywhere
// until it is ticked off. The online filter always matches nothing: GTA VI
// has no online trophies, and the empty state says so instead of pretending
// otherwise. 28 of the 55 trophies are hidden on PlayStation, so with spoiler
// mode on an un-earned list shows 28 masked cards minus any the reader has
// already earned.
import { KIND_LABELS } from './format.js';

const KIND_KEYS = ['story', 'missable', 'collectibles', 'activities', 'online'];

export function kindCounts(trophies) {
  const counts = { all: trophies.length, story: 0, missable: 0, collectibles: 0, activities: 0, online: 0 };
  for (const t of trophies) {
    if (t.kinds.includes('story')) counts.story += 1;
    if (t.missable === 'yes') counts.missable += 1;
    if (t.kinds.includes('collectibles')) counts.collectibles += 1;
    if (t.kinds.includes('activities')) counts.activities += 1;
  }
  return counts;
}

export function isSpoilerHidden(trophy, spoilerOn, earned) {
  return spoilerOn && trophy.hidden && !earned.has(trophy.id);
}

function kindMatches(trophy, kind) {
  if (kind === 'all') return true;
  if (kind === 'online') return false;
  if (kind === 'missable') return trophy.missable === 'yes';
  return trophy.kinds.includes(kind);
}

export function filterTrophies(trophies, state) {
  const query = state.query.trim().toLowerCase();
  return trophies.filter((t) => {
    if (!kindMatches(t, state.kind)) return false;
    if (state.grade !== 'all' && t.grade !== state.grade) return false;
    if (state.earnedFilter === 'earned' && !state.earned.has(t.id)) return false;
    if (state.earnedFilter === 'remaining' && state.earned.has(t.id)) return false;
    if (query) {
      const haystack = `${t.name} ${t.description} ${t.guide} ${t.target ?? ''}`.toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    return true;
  });
}

export function kindName(kind) {
  return kind === 'all' ? 'All' : (KIND_LABELS[kind] ?? kind);
}

export { KIND_KEYS };
