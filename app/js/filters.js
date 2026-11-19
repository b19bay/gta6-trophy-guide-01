// Filtering, searching and the spoiler rule, kept pure so the checklist view
// and the screenshot renderer agree on what a filter shows.
import { isStory } from './kinds.js';

export function filterTrophies(trophies, { kind, grade, query, earnedOnly, earned }) {
  const q = query.trim().toLowerCase();
  return trophies.filter((t) => {
    if (kind !== 'all' && !t.kinds.includes(kind)) return false;
    if (grade !== 'all' && t.grade !== grade) return false;
    if (earnedOnly && !earned.has(t.id)) return false;
    if (q && !(t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q))) return false;
    return true;
  });
}

// With spoilers on, a story trophy the player has not earned shows a mask
// instead of its name, description and guide.
export function maskForSpoiler(trophy, spoilersOn, earned) {
  if (!spoilersOn || earned.has(trophy.id) || !isStory(trophy)) return null;
  return {
    name: 'Hidden story trophy',
    description: 'Earn it to reveal this trophy. Spoilers are hidden.',
    guide: 'Hidden until earned — turn spoilers on in settings to read this guide early.',
  };
}
