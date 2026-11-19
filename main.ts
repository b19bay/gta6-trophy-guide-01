// Leonida Ledger — a GTA VI trophy guide and tracker (Node 22, standard library only).
// The guide is this directory's app/ folder: plain static files a browser opens at
// app/index.html (ES modules, CSS, no build step), offline: it loads nothing over the
// network, and its trophy list and guides are app/data/trophies.json. The program hands
// it in: it validates the entry first (the authored block below), then copies app/ and
// screenshots/ from beside this file to /output and writes /output/dossier.json, the
// summary the judge reads (your screenshots, the first load's files and bytes, and your
// source), with the vendored make.fun library. Leave vendor/makefun-frontend.ts as it is:
// the scorer requires dossier.json to be byte for byte what its own copy writes.
//
// Serve it locally with `node serve.ts`, then open http://localhost:8080.
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// Screenshots are rendered by the app's own code: node make-shots.mjs, then
// python3 rasterize.py /tmp/gta6-shots screenshots

import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

// --- Authored pre-submit validation (fails loudly before any output is written) ---
// The 55 official trophy names, as PlayStation publishes them (Exophase and
// PSNProfiles agree on every name, description and grade).
const EXPECTED_NAMES: string[] = [
  'Vice Got a Price!', 'Just Like Paradise', 'Paradise Lost', 'T**s Ass Drug Money',
  'Vice City, Baby!', 'Top Of The World, Ma', 'You Gotta Know When to Get Off', 'Trust',
  'Break the Bank', 'Family Matters', 'DWNFALL', 'Hi-Jacked', 'Snow Storm', 'A Long Road',
  'Cunning Stunts', 'Master of None', 'The Shootist', 'Top Fun', 'Earn Cash, Not Kudos',
  'Baited My Tackle', 'Stick Fiddler', 'Road to Rehabilitation', 'This Was No Boat Accident',
  'The Lone Rider', 'Strangers & Freaks', 'Supply & Demand', 'Spin On This!',
  'Positive Mental Attitude', 'Fair Game', "Don't Touch My Deck", 'You WAiNKer!',
  'One Last Thing', 'Hot Together', 'Retail Therapy', 'Whip It Good', 'Gunslinger',
  'Catch Me If You Can', 'Challenging Tank', 'Sneakthief', 'Maximum Withdrawal',
  'A Classic Blitz Play', 'The Goodtime State', 'Pest Control', 'In The Beginning…',
  'Capital Offense', 'Let’s Go Bowling', 'Personal Best', 'Actions Speak Louder',
  'Bad Luck, I Guess', 'The Truth Is Out There', 'Ten Pin', 'Dime on the Dollar',
  'Treat Yo Self', 'Little Boxes', 'On the Spot',
];

function fail(message: string): never {
  throw new Error(`PRE-SUBMIT VALIDATION FAILED: ${message}`);
}

function walkFiles(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walkFiles(full, out);
    else if (entry.isFile()) out.push(full);
  }
  return out;
}

function validateEntry(here: string): void {
  // 1. Trophy data: all 55 official names, each with a non-blank guide.
  const trophiesPath = join(here, 'app', 'data', 'trophies.json');
  const doc = JSON.parse(readFileSync(trophiesPath, 'utf8'));
  const trophies = doc.trophies ?? doc;
  if (!Array.isArray(trophies) || trophies.length !== 55) {
    fail(`trophies.json holds ${Array.isArray(trophies) ? trophies.length : 'no array'}, expected 55`);
  }
  const names = new Set(trophies.map((t: { name: string }) => t.name));
  for (const expected of EXPECTED_NAMES) {
    if (!names.has(expected)) fail(`trophies.json is missing trophy "${expected}"`);
  }
  for (const t of trophies) {
    if (typeof t.guide !== 'string' || t.guide.trim() === '') fail(`trophy "${t.name}" has a blank guide`);
    if (!Array.isArray(t.sources) || t.sources.length === 0) fail(`trophy "${t.name}" names no source`);
  }
  const grades: Record<string, number> = {};
  for (const t of trophies) grades[t.grade] = (grades[t.grade] ?? 0) + 1;
  if (grades.platinum !== 1 || grades.gold !== 2 || grades.silver !== 6 || grades.bronze !== 46) {
    fail(`grade split is ${JSON.stringify(grades)}, expected 1 platinum / 2 gold / 6 silver / 46 bronze`);
  }
  // 2. No network references anywhere in app/: any URL scheme is refused.
  const appFiles = walkFiles(join(here, 'app'));
  let appBytes = 0;
  for (const file of appFiles) {
    const size = statSync(file).size;
    appBytes += size;
    const text = readFileSync(file, 'utf8');
    if (text.includes('://')) fail(`network reference in ${file}`);
  }
  if (appFiles.length > 993) fail(`app/ holds ${appFiles.length} files, over the 993 cap`);
  if (appBytes > 48 * 1024 * 1024) fail(`app/ is ${appBytes} bytes, over the 48 MiB cap`);
  // 3. Screenshots: 3 or 4 images, each at most 256 KiB.
  const shotsDir = join(here, 'screenshots');
  if (!existsSync(shotsDir)) fail('screenshots/ is missing');
  const shots = readdirSync(shotsDir).filter((n) => !n.startsWith('.'));
  if (shots.length < 3 || shots.length > 4) fail(`screenshots/ holds ${shots.length} files, expected 3 or 4`);
  for (const name of shots) {
    if (!/\.(png|jpe?g)$/i.test(name)) fail(`screenshot "${name}" is not a PNG or JPEG`);
    const size = statSync(join(shotsDir, name)).size;
    if (size > 256 * 1024) fail(`screenshot "${name}" is ${size} bytes, over the 256 KiB cap`);
  }
  console.log(`validated: 55 trophies with cited guides, ${appFiles.length} app files (${appBytes} bytes), ${shots.length} screenshots`);
}

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

validateEntry(here);

mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });

// The scorer's own caps (reference/gate.json): only text_max_bytes shapes the bytes; the others refuse an entry the
// scorer would refuse (more than 4 screenshots or one over 256 KiB; more than 993 files and directories in app/ or
// 48 MiB of app files: app/ counts beside /output's own 1000-entry cap, its screenshots/ and dossier.json).
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, { text_max_bytes: 163840, screenshots: { max: 4, max_bytes: 262144 }, app_max_files: 993, app_max_bytes: 50331648 }),
);
