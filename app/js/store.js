// Saved progress: a set of earned trophy ids in localStorage, plus export/import.
import { STORAGE_KEY, SETTINGS_KEY } from './kinds.js';

export function loadEarned() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const ids = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(ids) ? ids.filter((n) => Number.isInteger(n)) : []);
  } catch {
    return new Set();
  }
}

export function saveEarned(earned) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...earned].sort((a, b) => a - b)));
}

export function loadSettings() {
  try {
    return JSON.parse(localStorage.getItem(SETTINGS_KEY) ?? '{}') ?? {};
  } catch {
    return {};
  }
}

export function saveSettings(settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

// Export writes a plain JSON file of earned ids; import reads one back and
// keeps only ids that exist in the trophy list.
export function exportProgress(earned, trophies) {
  const names = [...earned]
    .map((id) => trophies.find((t) => t.id === id))
    .filter(Boolean)
    .map((t) => t.name);
  const blob = new Blob(
    [JSON.stringify({ app: 'leonida-ledger', earned: [...earned].sort((a, b) => a - b), names }, null, 2)],
    { type: 'application/json' },
  );
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'leonida-ledger-progress.json';
  a.click();
  URL.revokeObjectURL(a.href);
}

export async function importProgress(file, trophies) {
  const doc = JSON.parse(await file.text());
  const ids = Array.isArray(doc) ? doc : doc.earned;
  if (!Array.isArray(ids)) throw new Error('That file does not hold a list of earned trophies.');
  const valid = new Set(trophies.map((t) => t.id));
  const earned = new Set(ids.filter((n) => Number.isInteger(n) && valid.has(n)));
  return earned;
}
