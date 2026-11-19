// Trophy kinds, grades and labels shared by every view.
export const KIND_LABELS = {
  story: 'Story',
  missable: 'Missable',
  collectibles: 'Collectibles',
  activities: 'Activities',
  online: 'Online',
  completion: 'Completion',
};
export const FILTER_KINDS = ['story', 'missable', 'collectibles', 'activities', 'online'];
export const GRADE_ORDER = ['platinum', 'gold', 'silver', 'bronze'];
export const STORAGE_KEY = 'leonida-ledger-progress-v1';
export const SETTINGS_KEY = 'leonida-ledger-settings-v1';

// A trophy is a story trophy when its kind list says so; the spoiler setting
// hides exactly those until they are earned.
export function isStory(trophy) {
  return trophy.kinds.includes('story');
}
export function gradeLabel(grade) {
  return grade.charAt(0).toUpperCase() + grade.slice(1);
}
