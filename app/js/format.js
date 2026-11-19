// Shared labels and escaping for the views. Grade and kind labels are the
// words the cards and the detail pane show; chapterLabel prints
// "Chapter N" when a trophy carries a chapter and nothing otherwise.
// escapeHtml is for text that lands in innerHTML (targets, notes); names and
// descriptions are set with textContent elsewhere and never need it.
const GRADE_TITLES = {
  platinum: 'Platinum',
  gold: 'Gold',
  silver: 'Silver',
  bronze: 'Bronze',
};

export const GRADE_ORDER = ['platinum', 'gold', 'silver', 'bronze'];

export function gradeLabel(grade) {
  return GRADE_TITLES[grade] ?? (grade.charAt(0).toUpperCase() + grade.slice(1));
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
