// The checklist view: one row per trophy with its official name, description
// and grade, a tick box, its target, its kind tags and its missable flag.
import { gradeLabel, KIND_LABELS } from '../kinds.js';
import { filterTrophies, maskForSpoiler } from '../filters.js';

export function renderChecklist(view, trophies, state, actions) {
  view.replaceChildren();
  const shown = filterTrophies(trophies, state);
  const line = document.createElement('p');
  line.className = 'count-line';
  line.textContent = `Showing ${shown.length} of ${trophies.length} trophies — ${state.earned.size} earned. Click a trophy name to read its guide and sources.`;
  view.append(line);

  const table = document.createElement('table');
  const head = document.createElement('thead');
  const hr = document.createElement('tr');
  for (const label of ['Earned', 'Trophy', 'Grade', 'Target', 'Kinds']) {
    const th = document.createElement('th');
    th.textContent = label;
    hr.append(th);
  }
  head.append(hr);
  table.append(head);

  const body = document.createElement('tbody');
  for (const t of shown) {
    const mask = maskForSpoiler(t, state.spoilersOn, state.earned);
    const tr = document.createElement('tr');
    if (state.earned.has(t.id)) tr.className = 'earned';

    const tickCell = document.createElement('td');
    const tick = document.createElement('input');
    tick.type = 'checkbox';
    tick.className = 'tick';
    tick.checked = state.earned.has(t.id);
    tick.setAttribute('aria-label', `Mark ${mask ? 'hidden story trophy' : t.name} earned`);
    tick.addEventListener('change', () => actions.toggleEarned(t.id, tick.checked));
    tickCell.append(tick);
    tr.append(tickCell);

    const nameCell = document.createElement('td');
    nameCell.className = 'name';
    const link = document.createElement('a');
    link.href = `#/trophy/${t.id}`;
    link.textContent = mask ? mask.name : t.name;
    nameCell.append(link);
    const desc = document.createElement('span');
    desc.className = 'desc';
    desc.textContent = mask ? mask.description : t.description;
    nameCell.append(desc);
    if (t.missable && !mask) {
      const flag = document.createElement('span');
      flag.className = 'flag miss';
      flag.textContent = 'MISSABLE';
      nameCell.append(flag);
    }
    tr.append(nameCell);

    const gradeCell = document.createElement('td');
    const pill = document.createElement('span');
    pill.className = `grade ${t.grade}`;
    pill.textContent = gradeLabel(t.grade);
    gradeCell.append(pill);
    tr.append(gradeCell);

    const targetCell = document.createElement('td');
    targetCell.textContent = mask ? '—' : (t.target ?? '');
    tr.append(targetCell);

    const kindsCell = document.createElement('td');
    for (const k of t.kinds) {
      const tag = document.createElement('span');
      tag.className = 'tag';
      tag.textContent = KIND_LABELS[k] ?? k;
      kindsCell.append(tag);
    }
    tr.append(kindsCell);
    body.append(tr);
  }
  table.append(body);
  view.append(table);
}
