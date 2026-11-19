// The trophy detail view: official name, description and grade, the guide in
// our own words, its target, its missable note and its named sources.
import { gradeLabel, KIND_LABELS } from '../kinds.js';
import { maskForSpoiler } from '../filters.js';

export function renderDetail(view, trophy, state, actions) {
  view.replaceChildren();
  const mask = maskForSpoiler(trophy, state.spoilersOn, state.earned);
  const box = document.createElement('section');
  box.className = 'detail';

  const back = document.createElement('a');
  back.href = '#/list';
  back.textContent = '← Back to the checklist';
  box.append(back);

  const title = document.createElement('h2');
  title.textContent = mask ? mask.name : trophy.name;
  box.append(title);

  const meta = document.createElement('p');
  const pill = document.createElement('span');
  pill.className = `grade ${trophy.grade}`;
  pill.textContent = gradeLabel(trophy.grade);
  meta.append(pill);
  if (trophy.missable) {
    const flag = document.createElement('span');
    flag.className = 'flag miss';
    flag.textContent = 'MISSABLE — do it when the chance appears';
    meta.append(flag);
  }
  for (const k of trophy.kinds) {
    const tag = document.createElement('span');
    tag.className = 'tag';
    tag.textContent = KIND_LABELS[k] ?? k;
    meta.append(tag);
  }
  box.append(meta);

  const official = document.createElement('p');
  official.className = 'official';
  official.textContent = `Official: “${mask ? mask.description : trophy.description}”`;
  box.append(official);

  const target = document.createElement('p');
  const targetLabel = document.createElement('b');
  targetLabel.textContent = 'Target: ';
  target.append(targetLabel, document.createTextNode(trophy.target ?? ''));
  box.append(target);

  const guide = document.createElement('p');
  guide.className = 'guide';
  guide.textContent = mask ? mask.guide : trophy.guide;
  box.append(guide);

  const sources = document.createElement('p');
  sources.className = 'sources';
  const sourcesLabel = document.createElement('b');
  sourcesLabel.textContent = 'Sources: ';
  sources.append(sourcesLabel);
  if (mask) {
    sources.append(document.createTextNode('Hidden until earned.'));
  } else {
    sources.append(document.createTextNode(trophy.sources.join(' · ')));
    sources.append(document.createElement('br'));
    sources.append(document.createTextNode('Guide written in our own words for this guide; the facts above are drawn from the sources named, never copied.'));
  }
  box.append(sources);

  const tickLabel = document.createElement('label');
  tickLabel.className = 'toggle';
  const tick = document.createElement('input');
  tick.type = 'checkbox';
  tick.className = 'tick';
  tick.checked = state.earned.has(trophy.id);
  tick.addEventListener('change', () => actions.toggleEarned(trophy.id, tick.checked));
  tickLabel.append(tick, document.createTextNode(' Mark as earned'));
  box.append(tickLabel);

  view.append(box);
}
