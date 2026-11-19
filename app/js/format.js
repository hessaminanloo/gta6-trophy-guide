// Shared formatting helpers for the views: grade and kind labels, chapter
// labels, and escaping for trophy names and descriptions from the data file.
// chapterLabel prints 'Chapter N' when a trophy carries a chapter, and
// nothing otherwise.
export function gradeLabel(grade) {
  return grade.charAt(0).toUpperCase() + grade.slice(1);
}

export const KIND_LABELS = {
  story: 'Story',
  missable: 'Missable',
  collectibles: 'Collectibles',
  activities: 'Activities',
  online: 'Online',
};

export function kindLabel(kind) {
  return KIND_LABELS[kind] ?? kind;
}

export function chapterLabel(chapter) {
  return chapter == null ? '' : `Chapter ${chapter}`;
}

export function escapeHtml(text) {
  return String(text)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}
