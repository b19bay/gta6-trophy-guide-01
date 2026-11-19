// The roadmap view (stages built from the official descriptions) and the
// missables view (every trophy flagged missable, with its warning).
import { gradeLabel } from '../kinds.js';
import { trophyById } from '../data.js';

export function renderRoadmap(view, roadmap, trophies) {
  view.replaceChildren();
  const title = document.createElement('h2');
  title.textContent = roadmap.title;
  view.append(title);
  const intro = document.createElement('p');
  intro.textContent = roadmap.intro;
  view.append(intro);
  const warn = document.createElement('div');
  warn.className = 'warn';
  const warnTitle = document.createElement('b');
  warnTitle.textContent = 'Save warning: ';
  warn.append(warnTitle, document.createTextNode(roadmap.saveWarning));
  view.append(warn);

  for (const stage of roadmap.stages) {
    const box = document.createElement('section');
    box.className = 'stage';
    const step = document.createElement('div');
    step.className = 'step';
    step.textContent = `Stage ${stage.n} — ${stage.trophies.length} trophies`;
    box.append(step);
    const heading = document.createElement('h3');
    heading.textContent = stage.title;
    box.append(heading);
    const text = document.createElement('p');
    text.textContent = stage.text;
    box.append(text);
    const list = document.createElement('ul');
    for (const id of stage.trophies) {
      const t = trophyById(trophies, id);
      if (!t) continue;
      const li = document.createElement('li');
      const link = document.createElement('a');
      link.href = `#/trophy/${t.id}`;
      link.textContent = t.name;
      li.append(link);
      const grade = document.createElement('span');
      grade.className = `grade ${t.grade}`;
      grade.textContent = gradeLabel(t.grade);
      li.append(document.createTextNode(' '), grade);
      if (t.missable) {
        const flag = document.createElement('span');
        flag.className = 'flag miss';
        flag.textContent = 'MISSABLE';
        li.append(document.createTextNode(' '), flag);
      }
      list.append(li);
    }
    box.append(list);
    view.append(box);
  }
}

export function renderMissables(view, trophies) {
  view.replaceChildren();
  const title = document.createElement('h2');
  title.textContent = 'Missable trophies — 8 to watch for';
  view.append(title);
  const intro = document.createElement('p');
  intro.textContent = 'Built from the official descriptions and the earliest launch guides. Only one trophy is flagged as possibly missable by the guides themselves (Positive Mental Attitude); the rest are flagged here because they hinge on a one-time moment — a partner beside you, a showroom, a story choice — and the game reportedly has no mission replay. Keep a manual save at the start of every chapter.';
  view.append(intro);
  const list = document.createElement('div');
  list.className = 'miss-list';
  for (const t of trophies.filter((x) => x.missable)) {
    const box = document.createElement('section');
    box.className = 'detail';
    const heading = document.createElement('h3');
    const link = document.createElement('a');
    link.href = `#/trophy/${t.id}`;
    link.textContent = t.name;
    heading.append(link);
    box.append(heading);
    const desc = document.createElement('p');
    desc.className = 'official';
    desc.textContent = t.description;
    box.append(desc);
    const guide = document.createElement('p');
    guide.className = 'guide';
    guide.textContent = t.guide;
    box.append(guide);
    const sources = document.createElement('p');
    sources.className = 'sources';
    sources.append(document.createTextNode(`Sources: ${t.sources.join(' · ')}`));
    box.append(sources);
    list.append(box);
  }
  view.append(list);
}

export function renderAbout(view) {
  view.replaceChildren();
  const box = document.createElement('section');
  box.className = 'about';
  const title = document.createElement('h2');
  title.textContent = 'Sources & method';
  box.append(title);
  const items = [
    'Official names, descriptions and grades: Exophase — GTA VI trophy list, cross-checked against PSNProfiles — GTA VI trophies. The two agree on every name, description and grade; the 55 break down as 1 platinum, 2 gold, 6 silver, 46 bronze, 28 hidden.',
    'Counts in the targets (42 Shooting Range challenges, 14 drone race locations, 18 meditation spots, 52 areas, 9 gangs, 8 garages, 9 activity types) come from the PSN counts on PSNProfiles and the starter list; the 397 stunts and the 18 card sets (15 for 100%) come from Push Square — GTA 6 Trophy Guide & Roadmap.',
    'The missable warning — no mission replay, manual save per chapter, the Chapter 1 meditation spot — is reported by Output Lag — GTA 6 Trophy List; the “only possibly missable” flag for Positive Mental Attitude is reported by EGamers — GTA 6 Trophy List (from PowerPyx and GTABase). PlanetGTA6 notes the missable list cannot be settled yet, a day after launch.',
    'Every guide is written in our own words for this guide, from the official description plus the sources named beside it. Where no specific method is confirmed yet (The Truth Is Out There), the guide says so instead of inventing one.',
    'The game launched 19 November 2026. Details will change as real guides are published; this guide will be corrected against them, with the source named each time.',
    'Privacy: progress lives in this browser only (localStorage). Export writes a file; nothing is uploaded anywhere. The app makes no network requests.',
  ];
  const ul = document.createElement('ul');
  for (const text of items) {
    const li = document.createElement('li');
    li.textContent = text;
    ul.append(li);
  }
  box.append(ul);
  view.append(box);
}
