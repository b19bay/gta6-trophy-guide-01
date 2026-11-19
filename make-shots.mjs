// Screenshot driver: runs the app's own renderer (app/src/shots.js) over the
// app's own data and writes one draw-list JSON per screenshot. A rasterizer
// (rasterize.py) turns the draw lists into JPEG. Run: node make-shots.mjs
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderShot } from './app/src/shots.js';

const here = dirname(fileURLToPath(import.meta.url));
const trophies = JSON.parse(readFileSync(join(here, 'app', 'data', 'trophies.json'), 'utf8')).trophies;
const roadmap = JSON.parse(readFileSync(join(here, 'app', 'data', 'roadmap.json'), 'utf8'));

// Seeded progress for the screenshots: 13 of 55 earned, as the house guides
// seed theirs, so the progress bar and ticked rows show at work.
const seededEarned = [2, 3, 4, 8, 15, 16, 20, 21, 33, 35, 42, 46, 55];

const shots = [
  { file: '1-cover.json', view: 'cover' },
  { file: '2-roadmap.json', view: 'roadmap' },
  { file: '3-tracker.json', view: 'tracker' },
  { file: '4-guide.json', view: 'guide' },
];

const outDir = process.env.SHOTS_OUT ?? '/tmp/gta6-shots';
mkdirSync(outDir, { recursive: true });
for (const shot of shots) {
  const sheet = renderShot(shot.view, trophies, roadmap, seededEarned);
  writeFileSync(join(outDir, shot.file), JSON.stringify(sheet));
  console.log(`${shot.file}: ${sheet.width}x${sheet.height}, ${sheet.ops.length} ops`);
}
