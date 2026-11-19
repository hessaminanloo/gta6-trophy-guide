// data.js — loads the guide's two data files and counts them up.
//
// The trophy list and the roadmap are plain JSON under app/data/, fetched
// relative to the page so the app works from any static host (and from a
// local file during development) without ever leaving its own files.

export async function loadData() {
  const [trophyRes, roadmapRes] = await Promise.all([
    fetch('data/trophies.json'),
    fetch('data/roadmap.json'),
  ]);
  if (!trophyRes.ok) throw new Error(`trophies.json: HTTP ${trophyRes.status}`);
  if (!roadmapRes.ok) throw new Error(`roadmap.json: HTTP ${roadmapRes.status}`);
  const trophyData = await trophyRes.json();
  const roadmap = await roadmapRes.json();
  return { trophyData, trophies: trophyData.trophies, roadmap };
}

export function countBy(trophies, key) {
  const counts = {};
  for (const t of trophies) counts[t[key]] = (counts[t[key]] || 0) + 1;
  return counts;
}

export function summarise(trophies) {
  return {
    total: trophies.length,
    grades: countBy(trophies, 'grade'),
    kinds: countBy(trophies, 'kind'),
    hidden: trophies.filter((t) => t.hidden).length,
    missable: trophies.filter((t) => t.missable).length,
  };
}
