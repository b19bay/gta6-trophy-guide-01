// Screenshot renderer: draws the guide's own views to a list of draw ops from
// the SAME trophies.json data and the SAME design tokens as style.css, so the
// screenshots are real output of this app, not mockups. Pure JS, no DOM: a
// small rasterizer turns the ops into JPEG. Tokens match style.css exactly.
export const TOKENS = {
  paper: '#f6f3ee', card: '#ffffff', ink: '#1d2129', muted: '#626a75',
  line: '#ddd6c8', accent: '#d24e2a', accentSoft: '#fbe9e2',
  platinum: '#7fa8c9', gold: '#c9a227', silver: '#8e96a3', bronze: '#b9784c',
  danger: '#b3261e', dangerSoft: '#fdecea', okSoft: '#f4f8f2', warnSoft: '#fff4e0',
  warnLine: '#e8c87a', headSoft: '#efece4', barTrack: '#e5dfd2',
};
export const SHOT_WIDTH = 1280;
export const SHOT_HEIGHT = 800;

// Width of one character, as a fraction of the font size (DejaVu Sans metrics:
// DejaVu runs about 10% wider than Arial, so the factor below covers it).
// The rasterizer uses the same family, so wrapped text fits.
const NARROW = new Set(['i', 'I', 'l', 'j', '.', ',', "'", '!', ':', ';', '|', '’']);
const WIDE = new Set(['m', 'M', 'w', 'W']);
export function measureText(text, size, bold = false) {
  let w = 0;
  for (const ch of String(text)) {
    if (ch === ' ') w += 0.278;
    else if (NARROW.has(ch)) w += 0.28;
    else if (WIDE.has(ch)) w += ch === ch.toUpperCase() ? 0.92 : 0.83;
    else if (ch >= '0' && ch <= '9') w += 0.556;
    else if (ch === ch.toUpperCase() && ch !== ch.toLowerCase()) w += 0.67;
    else if (ch === 'f' || ch === 't') w += 0.33;
    else if (ch === 'r') w += 0.36;
    else if (ch === '(' || ch === ')') w += 0.33;
    else if (ch === '-') w += 0.36;
    else if (ch === '&') w += 0.78;
    else if (ch === '…' || ch === '—') w += 0.9;
    else w += 0.52;
  }
  return w * size * (bold ? 1.06 : 1) * 1.18;
}

export function wrapText(text, size, bold, maxWidth) {
  const words = String(text).split(/\s+/).filter(Boolean);
  const lines = [];
  let line = '';
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (measureText(next, size, bold) <= maxWidth || !line) line = next;
    else {
      lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  return lines;
}

export function truncate(text, size, bold, maxWidth) {
  if (measureText(text, size, bold) <= maxWidth) return text;
  let out = '';
  for (const ch of String(text)) {
    if (measureText(`${out}${ch}…`, size, bold) > maxWidth) break;
    out += ch;
  }
  return `${out}…`;
}

function gradeColor(grade) {
  return TOKENS[grade] ?? TOKENS.bronze;
}

function newSheet() {
  return { width: SHOT_WIDTH, height: SHOT_HEIGHT, ops: [] };
}
function rect(ops, x, y, w, h, fill, radius = 0) {
  ops.push({ t: 'rect', x, y, w, h, fill, radius });
}
function text(ops, x, y, str, size, color, bold = false) {
  ops.push({ t: 'text', x, y, str, size, color, bold });
}
function line(ops, x1, y1, x2, y2, color, width = 1) {
  ops.push({ t: 'line', x1, y1, x2, y2, color, width });
}
function para(ops, x, y, str, size, color, maxWidth, bold = false, maxLines = 0) {
  let lines = wrapText(str, size, bold, maxWidth);
  if (maxLines > 0 && lines.length > maxLines) {
    lines = lines.slice(0, maxLines);
    lines[maxLines - 1] = `${lines[maxLines - 1].replace(/…?$/, '')}…`;
  }
  lines.forEach((ln, i) => text(ops, x, y + i * Math.round(size * 1.45), ln, size, color, bold));
  return y + lines.length * Math.round(size * 1.45);
}

function header(ops, trophies, earned, subtitle) {
  rect(ops, 0, 0, SHOT_WIDTH, SHOT_HEIGHT, TOKENS.paper);
  text(ops, 28, 46, 'Leonida Ledger', 34, TOKENS.ink, true);
  text(ops, 28 + measureText('Leonida Ledger', 34, true) + 26, 46, '— GTA VI', 34, TOKENS.accent, true);
  text(ops, 28, 70, subtitle, 13, TOKENS.muted);
  const n = earned.length;
  const total = trophies.length;
  const pct = Math.round((n / total) * 100);
  text(ops, 1000, 44, `${n} / ${total}`, 28, TOKENS.ink, true);
  rect(ops, 1000, 56, 252, 12, TOKENS.barTrack, 6);
  rect(ops, 1000, 56, Math.max(8, Math.round(252 * (n / total))), 12, TOKENS.accent, 6);
  text(ops, 1000, 88, `${pct}% to the platinum`, 13, TOKENS.muted);
  line(ops, 28, 100, 1252, 100, TOKENS.accent, 2);
}

function chipsRow(ops, y, activeKind, spoilersOn) {
  const kinds = ['All kinds', 'Story', 'Missable', 'Collectibles', 'Activities', 'Online'];
  let x = 28;
  for (const kind of kinds) {
    const active = kind === activeKind;
    const w = Math.ceil(measureText(kind, 13) + 24);
    rect(ops, x, y, w, 30, active ? TOKENS.ink : TOKENS.card, 15);
    text(ops, x + 12, y + 20, kind, 13, active ? '#ffffff' : TOKENS.ink);
    x += w + 8;
  }
  const label = spoilersOn ? '☑ Hide story spoilers' : '☐ Hide story spoilers';
  text(ops, x + 8, y + 20, label, 13, TOKENS.ink, spoilersOn);
  rect(ops, 1000, y, 252, 30, TOKENS.card, 6);
  text(ops, 1012, y + 20, 'Search trophies…', 13, TOKENS.muted);
  return y + 30;
}

function gradePill(ops, x, y, grade) {
  const label = grade.charAt(0).toUpperCase() + grade.slice(1);
  const w = Math.ceil(measureText(label, 11, true) + 16);
  rect(ops, x, y, w, 20, gradeColor(grade), 10);
  text(ops, x + 8, y + 14, label, 11, '#ffffff', true);
  return w;
}

function trophyRow(ops, t, x, y, w, earned, mask) {
  const done = earned.includes(t.id);
  rect(ops, x, y, w, 64, done ? TOKENS.okSoft : TOKENS.card);
  rect(ops, x + 10, y + 20, 20, 20, done ? TOKENS.accent : TOKENS.card, 4);
  if (done) text(ops, x + 14, y + 36, '✓', 15, '#ffffff', true);
  const name = mask ? 'Hidden story trophy' : t.name;
  text(ops, x + 42, y + 22, truncate(name, 14, true, 300), 14, TOKENS.ink, true);
  text(ops, x + 42, y + 42, truncate(mask ? 'Earn it to reveal this trophy.' : t.description, 12, false, 300), 12, TOKENS.muted);
  let px = x + 356;
  px += gradePill(ops, px, y + 20, t.grade) + 8;
  if (t.missable && !mask) {
    const label = 'MISSABLE';
    const fw = Math.ceil(measureText(label, 11, true) + 14);
    rect(ops, px, y + 20, fw, 20, TOKENS.dangerSoft, 10);
    text(ops, px + 7, y + 34, label, 11, TOKENS.danger, true);
    px += fw + 8;
  }
  text(ops, px, y + 36, mask ? '—' : truncate(t.target ?? '', 12, false, Math.max(60, x + w - px - 12)), 12, TOKENS.muted);
  line(ops, x, y + 64, x + w, y + 64, TOKENS.line, 1);
}

function detailCard(ops, t, x, y, w, h, earned) {
  rect(ops, x, y, w, h, TOKENS.card, 14);
  rect(ops, x, y, 5, h, TOKENS.accent);
  let cy = y + 30;
  text(ops, x + 22, cy, truncate(t.name, 20, true, w - 44), 20, TOKENS.ink, true);
  cy += 12;
  let px = x + 22;
  px += gradePill(ops, px, cy, t.grade) + 8;
  if (t.missable) {
    const label = 'MISSABLE';
    const fw = Math.ceil(measureText(label, 11, true) + 14);
    rect(ops, px, cy, fw, 20, TOKENS.dangerSoft, 10);
    text(ops, px + 7, cy + 14, label, 11, TOKENS.danger, true);
  }
  cy += 34;
  cy = para(ops, x + 22, cy, `Official: “${t.description}”`, 13, TOKENS.muted, w - 44) + 4;
  cy = para(ops, x + 22, cy, `Target: ${t.target ?? ''}`, 13, TOKENS.ink, w - 44, true) + 6;
  cy = para(ops, x + 22, cy, t.guide, 14, TOKENS.ink, w - 44) + 10;
  line(ops, x + 22, cy, x + w - 22, cy, TOKENS.line, 1);
  cy += 24;
  text(ops, x + 22, cy, 'Sources:', 13, TOKENS.ink, true);
  cy += 22;
  for (const s of t.sources) {
    cy = para(ops, x + 22, cy, `• ${s}`, 12, TOKENS.muted, w - 44) + 2;
  }
  return cy;
}

function isStory(t) {
  return t.kinds.includes('story');
}

function renderCover(trophies, roadmap, earned) {
  const sheet = newSheet();
  const ops = sheet.ops;
  header(ops, trophies, earned, 'GTA VI trophy guide & tracker — 55 trophies: 1 platinum, 2 gold, 6 silver, 46 bronze (28 hidden). Offline.');
  chipsRow(ops, 116, 'All kinds', false);
  text(ops, 28, 178, 'Showing 55 of 55 trophies — 13 earned. Click a trophy name to read its guide and sources.', 13, TOKENS.muted);
  const rows = trophies.slice(0, 7);
  let y = 192;
  rect(ops, 28, y, 760, 30, TOKENS.headSoft);
  text(ops, 70, y + 20, 'TROPHY', 11, TOKENS.muted, true);
  text(ops, 384, y + 20, 'GRADE', 11, TOKENS.muted, true);
  text(ops, 500, y + 20, 'TARGET', 11, TOKENS.muted, true);
  y += 30;
  for (const t of rows) {
    trophyRow(ops, t, 28, y, 760, earned, false);
    y += 64;
  }
  const featured = trophies.find((t) => t.id === 2);
  detailCard(ops, featured, 812, 192, 440, 478, earned);
  text(ops, 812, 690, 'Guide open beside the checklist —', 13, TOKENS.muted);
  text(ops, 812, 708, 'every guide names its sources.', 13, TOKENS.muted);
  text(ops, 28, 780, 'Export progress  •  Import progress  •  Spoiler setting  •  Filters: story / missable / collectibles / activities / online', 12, TOKENS.muted);
  return sheet;
}

function renderRoadmap(trophies, roadmap, earned) {
  const sheet = newSheet();
  const ops = sheet.ops;
  header(ops, trophies, earned, 'Roadmap to the platinum — Vice Got a Price!  •  Built from the official trophy descriptions.');
  text(ops, 28, 136, 'Roadmap to the platinum', 26, TOKENS.ink, true);
  let y = 150;
  y = para(ops, 28, y, 'Play the story first, then clean up. No online trophies, no difficulty trophies — roughly 200 hours, long not hard.', 13, TOKENS.muted, 1224) + 6;
  rect(ops, 28, y, 1224, 44, TOKENS.warnSoft, 10);
  text(ops, 44, y + 18, 'Save warning: ', 13, TOKENS.ink, true);
  para(ops, 44 + measureText('Save warning: ', 13, true) + 12, y + 18, 'no mission replay is reported — keep a manual save at the start of every chapter and before the final mission. Keep cheats off.', 13, TOKENS.ink, 1224 - 44 - measureText('Save warning: ', 13, true));
  y += 58;
  for (const stage of roadmap.stages) {
    const h = 74;
    rect(ops, 28, y, 1224, h, TOKENS.card, 10);
    text(ops, 44, y + 24, `STAGE ${stage.n}`, 11, TOKENS.accent, true);
    text(ops, 44, y + 46, truncate(stage.title, 16, true, 560), 16, TOKENS.ink, true);
    para(ops, 620, y + 22, stage.text, 12, TOKENS.muted, 600, false, 3);
    const names = stage.trophies.map((id) => trophies.find((t) => t.id === id)?.name ?? '').filter(Boolean);
    text(ops, 44, y + 66, truncate(`${stage.trophies.length} trophies: ${names.join(' · ')}`, 11, false, 560), 11, TOKENS.muted);
    y += h + 8;
    if (y > 780) break;
  }
  return sheet;
}

function renderTracker(trophies, roadmap, earned) {
  const sheet = newSheet();
  const ops = sheet.ops;
  header(ops, trophies, earned, 'Tracker — filters and the spoiler setting at work. Progress is saved in this browser.');
  chipsRow(ops, 116, 'Story', true);
  text(ops, 28, 178, 'Filter: Story — 21 trophies. Spoilers ON: story trophies you have not earned stay hidden.', 13, TOKENS.muted);
  const rows = trophies.filter(isStory).slice(0, 7);
  let y = 192;
  rect(ops, 28, y, 760, 30, TOKENS.headSoft);
  text(ops, 70, y + 20, 'TROPHY', 11, TOKENS.muted, true);
  text(ops, 384, y + 20, 'GRADE', 11, TOKENS.muted, true);
  text(ops, 500, y + 20, 'TARGET', 11, TOKENS.muted, true);
  y += 30;
  for (const t of rows) {
    const mask = !earned.includes(t.id);
    trophyRow(ops, t, 28, y, 760, earned, mask);
    y += 64;
  }
  rect(ops, 812, 192, 440, 300, TOKENS.card, 14);
  let cy = 222;
  text(ops, 834, cy, 'Spoiler setting', 18, TOKENS.ink, true);
  cy += 30;
  cy = para(ops, 834, cy, 'ON: story trophy names and descriptions stay hidden until you earn them. Turn it off any time to read every guide.', 13, TOKENS.muted, 396) + 8;
  rect(ops, 834, cy, 396, 44, TOKENS.accentSoft, 8);
  text(ops, 850, cy + 18, '☑  Hide story spoilers', 14, TOKENS.ink, true);
  text(ops, 850, cy + 36, '☐  Earned only', 14, TOKENS.muted);
  cy += 64;
  cy = para(ops, 834, cy, 'Export writes your progress to a file; Import reads it back. Nothing is uploaded anywhere.', 13, TOKENS.muted, 396) + 8;
  text(ops, 834, cy + 16, 'Export progress', 13, TOKENS.accent, true);
  text(ops, 1000, cy + 16, 'Import progress', 13, TOKENS.accent, true);
  rect(ops, 812, 512, 440, 158, TOKENS.card, 14);
  text(ops, 834, 542, 'Missable watchlist — 8 trophies', 16, TOKENS.ink, true);
  para(ops, 834, 570, 'Positive Mental Attitude (Ch. 1 meditation) · Hot Together · Retail Therapy · Catch Me If You Can · Capital Offense · Personal Best · Actions Speak Louder · Bad Luck, I Guess', 13, TOKENS.muted, 396);
  text(ops, 28, 780, 'Every filter — story / missable / collectibles / activities / online — plus grade and search.', 12, TOKENS.muted);
  return sheet;
}

function renderGuide(trophies, roadmap, earned) {
  const sheet = newSheet();
  const ops = sheet.ops;
  header(ops, trophies, earned, 'A trophy guide with its citations — every guide names its sources.');
  const t = trophies.find((x) => x.id === 28);
  detailCard(ops, t, 28, 116, 760, 470, earned);
  rect(ops, 812, 116, 440, 470, TOKENS.card, 14);
  let cy = 146;
  text(ops, 834, cy, 'Why this one matters', 18, TOKENS.ink, true);
  cy += 30;
  cy = para(ops, 834, cy, 'The only trophy early guides flag as possibly missable. One meditation spot (Lucia’s balcony) is reported to belong to Chapter 1 only, and the game reportedly has no mission replay.', 13, TOKENS.muted, 396) + 10;
  cy = para(ops, 834, cy, 'Do the Chapter 1 spot before that chapter ends, and keep a manual save at the start of every chapter.', 13, TOKENS.ink, 396, true) + 10;
  line(ops, 834, cy, 1230, cy, TOKENS.line, 1);
  cy += 26;
  text(ops, 834, cy, 'Cited, not copied', 16, TOKENS.ink, true);
  cy += 26;
  cy = para(ops, 834, cy, 'Each guide is written in our own words from the official description plus the sources named beside it. Where no method is confirmed yet, the guide says so instead of inventing one.', 13, TOKENS.muted, 396) + 10;
  text(ops, 834, cy + 20, 'No Rockstar artwork. Works offline.', 13, TOKENS.accent, true);
  text(ops, 28, 622, 'More missable trophies to watch for', 16, TOKENS.ink, true);
  const minis = [33, 34, 37, 45].map((id) => trophies.find((x) => x.id === id));
  let mx = 28;
  for (const m of minis) {
    rect(ops, mx, 640, 296, 120, TOKENS.card, 10);
    text(ops, mx + 16, 668, truncate(m.name, 14, true, 264), 14, TOKENS.ink, true);
    gradePill(ops, mx + 16, 678, m.grade);
    para(ops, mx + 16, 716, m.description, 12, TOKENS.muted, 264, false, 2);
    mx += 312;
  }
  return sheet;
}

// Renders one of the four screenshot views from the app's own data.
// earned is an array of trophy ids shown as ticked (seeded for screenshots).
export function renderShot(view, trophies, roadmap, earned = []) {
  if (view === 'roadmap') return renderRoadmap(trophies, roadmap, earned);
  if (view === 'tracker') return renderTracker(trophies, roadmap, earned);
  if (view === 'guide') return renderGuide(trophies, roadmap, earned);
  return renderCover(trophies, roadmap, earned);
}
