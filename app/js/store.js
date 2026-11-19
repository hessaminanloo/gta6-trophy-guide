// Progress storage: the earned set lives in localStorage under one key, so the
// checklist survives a reload and works with the network off. Export writes
// the same set to a JSON file; import reads one back and keeps only ids the
// guide knows, so a stray file can never corrupt the tracker. Demo seeding
// never reaches this module: main.js seeds the demo set in memory only and
// never calls saveProgress for it.
export const STORAGE_KEY = 'leonida-ledger-v1';
export const EXPORT_FILENAME = 'leonida-ledger-progress.json';

function readStoredIds() {
  let raw = null;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
  } catch {
    return [];
  }
  if (!raw) return [];
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }
  return Array.isArray(parsed) ? parsed : [];
}

export function loadProgress() {
  return new Set(readStoredIds().filter((id) => typeof id === 'string'));
}

export function saveProgress(earned) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...earned].sort()));
  } catch {
    // Storage full or unavailable (private mode): the in-memory checklist
    // still works for this visit; the next load starts empty.
  }
}

export function exportProgress(earned) {
  const blob = new Blob(
    [JSON.stringify({ app: 'leonida-ledger', version: 1, earned: [...earned].sort() }, null, 2)],
    { type: 'application/json' },
  );
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = EXPORT_FILENAME;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function parseImport(text, knownIds) {
  const parsed = JSON.parse(text);
  const list = Array.isArray(parsed) ? parsed : parsed.earned;
  if (!Array.isArray(list)) throw new Error('not a progress file');
  const known = new Set(knownIds);
  return new Set(list.filter((id) => typeof id === 'string' && known.has(id)));
}

export function resetProgress() {
  localStorage.removeItem(STORAGE_KEY);
  return new Set();
}
