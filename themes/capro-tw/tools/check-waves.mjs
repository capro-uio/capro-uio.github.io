#!/usr/bin/env node
/**
 * Verifies the wave data that makes the drift loop seamlessly.
 *
 * The invariant spans three files -- the generator, data/waves.yaml and the
 * --wave-shift values in waves.css -- and a break in it is invisible to every
 * other gate: the build succeeds, axe sees nothing (it suppresses animation
 * before scanning), and the defect only shows up partway through a cycle that
 * runs for a minute or more. Hence an explicit check.
 *
 * Usage: npm run check:waves --prefix themes/capro-tw
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { generate, required, TILE } from './gen-waves.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const dataPath = join(here, '..', 'data', 'waves.yaml');
const cssPath = join(here, '..', 'assets', 'css', 'components', 'waves.css');

const fail = [];
const check = (ok, msg) => {
  if (!ok) fail.push(msg);
};

// Minimal reader for the shape gen-waves.mjs emits; avoids a YAML dependency.
function readLayers(text) {
  const out = [];
  for (const line of text.split('\n')) {
    const key = line.match(/^\s*- key:\s*(\d+)/);
    if (key) {
      out.push({ key: Number(key[1]) });
      continue;
    }
    const m = line.match(/^\s*(drift|shift|d):\s*"?(.*?)"?\s*$/);
    if (m && out.length) {
      out[out.length - 1][m[1]] = m[1] === 'shift' ? Number(m[2]) : m[2];
    }
  }
  return out;
}

function parsePath(d) {
  const nums = d.match(/-?\d*\.?\d+/g).map(Number);
  const segs = [];
  let x = nums[0],
    y = nums[1],
    i = 2;
  while (i + 5 < nums.length + 1 && i + 5 <= nums.length) {
    segs.push({
      x0: x,
      y0: y,
      x1: nums[i],
      y1: nums[i + 1],
      x2: nums[i + 2],
      y2: nums[i + 3],
      x3: nums[i + 4],
      y3: nums[i + 5],
    });
    x = nums[i + 4];
    y = nums[i + 5];
    i += 6;
  }
  return segs;
}

const bez = (a, b, c, d, t) => {
  const u = 1 - t;
  return u * u * u * a + 3 * u * u * t * b + 3 * u * t * t * c + t * t * t * d;
};

function yAt(segs, x) {
  const s = segs.find((s) => x >= Math.min(s.x0, s.x3) && x <= Math.max(s.x0, s.x3));
  if (!s) return NaN;
  let lo = 0,
    hi = 1;
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    if (bez(s.x0, s.x1, s.x2, s.x3, mid) < x) lo = mid;
    else hi = mid;
  }
  return bez(s.y0, s.y1, s.y2, s.y3, (lo + hi) / 2);
}

const committed = readLayers(readFileSync(dataPath, 'utf8'));
const fresh = generate();

check(
  committed.length === fresh.length,
  `data/waves.yaml has ${committed.length} layers, generator produces ${fresh.length}`,
);

for (const f of fresh) {
  const c = committed.find((l) => l.key === f.key);
  if (!c) {
    fail.push(`layer ${f.key} missing from data/waves.yaml`);
    continue;
  }
  // Stale data is the same failure mode the committed CSS bundle has, and the
  // repo already gates that by rebuilding and diffing.
  check(
    c.d === f.d,
    `layer ${f.key}: data/waves.yaml is stale -- run npm run gen:waves`,
  );
  check(
    c.drift === f.drift,
    `layer ${f.key}: drift ${c.drift} != generated ${f.drift}`,
  );
  check(
    c.shift === f.shift,
    `layer ${f.key}: shift ${c.shift} != generated ${f.shift}`,
  );
}

const css = readFileSync(cssPath, 'utf8');

// Nothing else would notice the drift being dropped: the waves would simply
// sit still, which is exactly what a reviewer glancing at a screenshot expects.
check(
  /\.wave\s*\{[^}]*animation:[^}]*infinite/s.test(css),
  'waves.css: .wave no longer declares an infinite animation -- the drift is gone',
);

for (const L of committed) {
  const segs = parsePath(L.d);
  const xs = segs.flatMap((s) => [s.x0, s.x3]);
  const [needLo, needHi] = required(L.drift, L.shift);

  check(
    Math.min(...xs) <= needLo && Math.max(...xs) >= needHi,
    `layer ${L.key}: spans [${Math.min(...xs)}, ${Math.max(...xs)}] but drifting ${L.drift} by ${L.shift} needs [${needLo}, ${needHi}] -- its trailing end would enter the viewport`,
  );

  // Seamlessness: the layer must land on itself after one shift.
  let worst = 0;
  for (let x = 0; x <= TILE; x += 5) {
    const a = yAt(segs, x);
    const b = yAt(segs, L.drift === 'left' ? x + L.shift : x - L.shift);
    if (Number.isNaN(a) || Number.isNaN(b)) {
      worst = Infinity;
      break;
    }
    worst = Math.max(worst, Math.abs(a - b));
  }
  check(
    worst < 0.01,
    `layer ${L.key}: not periodic over its ${L.shift}-unit shift (worst dy ${worst.toFixed(4)}) -- the loop would visibly step`,
  );

  // The CSS half of the invariant.
  const rule = css.match(
    new RegExp(`\\.wave--${L.key}\\s*\\{[^}]*?--wave-shift:\\s*(-?\\d+)px`, 's'),
  );
  check(
    !!rule,
    `layer ${L.key}: no --wave-shift found for .wave--${L.key} in waves.css`,
  );
  if (rule) {
    const want = L.drift === 'left' ? -L.shift : L.shift;
    check(
      Number(rule[1]) === want,
      `layer ${L.key}: waves.css --wave-shift is ${rule[1]}px but data says drift ${L.drift} shift ${L.shift}, i.e. ${want}px`,
    );
  }
}

if (fail.length) {
  console.error('Wave data check FAILED:\n' + fail.map((f) => `  - ${f}`).join('\n'));
  process.exit(1);
}
console.log(
  `Wave data OK — ${committed.length} layers: periodic, correctly covered, and waves.css agrees.`,
);
