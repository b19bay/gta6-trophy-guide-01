// Boot: loads the trophy list and the roadmap, wires the controls, routes
// between checklist, roadmap, missables, about and trophy detail views.
import { FILTER_KINDS, KIND_LABELS } from './kinds.js';
import { loadTrophies, loadRoadmap, countByGrade, trophyById } from './data.js';
import { loadEarned, saveEarned, loadSettings, saveSettings, exportProgress, importProgress } from './store.js';
import { renderChecklist } from './views/checklist.js';
import { renderDetail } from './views/detail.js';
import { renderRoadmap, renderMissables, renderAbout } from './views/roadmap.js';

const view = document.getElementById('view');
const searchInput = document.getElementById('search');
const kindChips = document.getElementById('kindChips');
const gradeSelect = document.getElementById('grade');
const spoilersBox = document.getElementById('spoilers');
const earnedOnlyBox = document.getElementById('earnedOnly');

const settings = loadSettings();
const state = {
  kind: settings.kind ?? 'all',
  grade: settings.grade ?? 'all',
  query: '',
  spoilersOn: settings.spoilersOn ?? false,
  earnedOnly: settings.earnedOnly ?? false,
  earned: loadEarned(),
};
let trophies = [];
let roadmap = null;

function persistSettings() {
  saveSettings({
    kind: state.kind,
    grade: state.grade,
    spoilersOn: state.spoilersOn,
    earnedOnly: state.earnedOnly,
  });
}

function renderProgress() {
  const n = state.earned.size;
  const total = trophies.length || 55;
  document.getElementById('progressCount').textContent = `${n} / ${total}`;
  document.getElementById('progressFill').style.width = `${Math.round((n / total) * 100)}%`;
  document.getElementById('progressPct').textContent =
    n === total ? 'Platinum earned — Leonida Legend!' : `${Math.round((n / total) * 100)}% to the platinum`;
}

const actions = {
  toggleEarned(id, on) {
    if (on) state.earned.add(id);
    else state.earned.delete(id);
    saveEarned(state.earned);
    renderProgress();
    route();
  },
};

function buildChips() {
  kindChips.replaceChildren();
  const all = document.createElement('button');
  all.type = 'button';
  all.className = `chip${state.kind === 'all' ? ' on' : ''}`;
  all.textContent = 'All kinds';
  all.addEventListener('click', () => {
    state.kind = 'all';
    persistSettings();
    buildChips();
    route();
  });
  kindChips.append(all);
  for (const kind of FILTER_KINDS) {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = `chip${state.kind === kind ? ' on' : ''}`;
    chip.textContent = KIND_LABELS[kind];
    chip.addEventListener('click', () => {
      state.kind = kind;
      persistSettings();
      buildChips();
      route();
    });
    kindChips.append(chip);
  }
}

function route() {
  const hash = location.hash || '#/list';
  for (const a of document.querySelectorAll('#tabs a')) {
    a.classList.toggle('active', hash.startsWith(`#/${a.dataset.tab}`) || (a.dataset.tab === 'list' && hash.startsWith('#/trophy')));
  }
  if (hash.startsWith('#/trophy/')) {
    const id = Number(hash.slice('#/trophy/'.length));
    const trophy = trophyById(trophies, id);
    if (trophy) renderDetail(view, trophy, state, actions);
    else renderChecklist(view, trophies, state, actions);
    return;
  }
  if (hash.startsWith('#/roadmap')) renderRoadmap(view, roadmap, trophies);
  else if (hash.startsWith('#/missables')) renderMissables(view, trophies);
  else if (hash.startsWith('#/about')) renderAbout(view);
  else renderChecklist(view, trophies, state, actions);
}

async function boot() {
  trophies = await loadTrophies();
  roadmap = await loadRoadmap();
  const counts = document.createElement('p');
  counts.className = 'count-line';
  counts.textContent = `Official list: ${countByGrade(trophies)} — 28 hidden. No online trophies.`;
  document.querySelector('.sub').after(counts);

  searchInput.value = '';
  searchInput.addEventListener('input', () => {
    state.query = searchInput.value;
    if (!location.hash.startsWith('#/list') && !location.hash.startsWith('#/trophy')) location.hash = '#/list';
    route();
  });
  gradeSelect.value = state.grade;
  gradeSelect.addEventListener('change', () => {
    state.grade = gradeSelect.value;
    persistSettings();
    route();
  });
  spoilersBox.checked = state.spoilersOn;
  spoilersBox.addEventListener('change', () => {
    state.spoilersOn = spoilersBox.checked;
    persistSettings();
    route();
  });
  earnedOnlyBox.checked = state.earnedOnly;
  earnedOnlyBox.addEventListener('change', () => {
    state.earnedOnly = earnedOnlyBox.checked;
    persistSettings();
    route();
  });
  document.getElementById('export').addEventListener('click', () => exportProgress(state.earned, trophies));
  document.getElementById('import').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      state.earned = await importProgress(file, trophies);
      saveEarned(state.earned);
      renderProgress();
      route();
    } catch (err) {
      alert(`Could not import that file: ${err.message}`);
    }
    e.target.value = '';
  });
  window.addEventListener('hashchange', route);
  buildChips();
  renderProgress();
  route();
}

boot();
