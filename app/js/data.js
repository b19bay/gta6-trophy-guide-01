// Loads the guide's data files (local files only, no network beyond this origin).
import { GRADE_ORDER } from './kinds.js';

export async function loadTrophies() {
  const response = await fetch('data/trophies.json');
  const doc = await response.json();
  const trophies = doc.trophies ?? doc;
  return [...trophies].sort((a, b) => a.id - b.id);
}

export async function loadRoadmap() {
  const response = await fetch('data/roadmap.json');
  return response.json();
}

export function countByGrade(trophies) {
  const counts = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
  for (const t of trophies) counts[t.grade] = (counts[t.grade] ?? 0) + 1;
  return GRADE_ORDER.map((g) => `${counts[g]} ${g}`).join(', ');
}

export function trophyById(trophies, id) {
  return trophies.find((t) => t.id === id);
}
