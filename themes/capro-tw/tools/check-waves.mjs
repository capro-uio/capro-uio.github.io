#!/usr/bin/env node
/**
 * Verifies the wave data that makes the drift loop seamlessly.
 *
 * Usage: npm run check:waves --prefix themes/capro-tw
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { generate, toYaml, dataPath, TILE } from './gen-waves.mjs';

const cssPath = join(
  dirname(fileURLToPath(import.meta.url)),
  '..',
  'assets',
  'css',
  'components',
  'waves.css',
);

const fail = [];
const check = (ok, msg) => {
  if (!ok) fail.push(msg);
};

const layers = generate();

check(
  readFileSync(dataPath, 'utf8') === toYaml(layers),
  'data/waves.yaml does not match the generator -- run npm run gen:waves',
);

function parsePath(d) {
  const nums = d.match(/-?\d*\.?\d+/g).map(Number);
  const segs = [];
  let x = nums[0];
  let y = nums[1];
  for (let i = 2; i + 5 < nums.length; i += 6) {
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
  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    if (bez(s.x0, s.x1, s.x2, s.x3, mid) < x) lo = mid;
    else hi = mid;
  }
  return bez(s.y0, s.y1, s.y2, s.y3, (lo + hi) / 2);
}

const css = readFileSync(cssPath, 'utf8');

check(
  /\.wave\s*\{[^}]*animation:[^}]*infinite/s.test(css),
  'waves.css: .wave no longer declares an infinite animation -- the drift is gone',
);

for (const L of layers) {
  const segs = parsePath(L.d);

  // Probing x +/- shift across the visible band covers both halves at once: a
  // path drawn too short has no point to compare against, so yAt returns NaN
  // and this fails the same way a non-periodic one does.
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
    `layer ${L.key}: drifting ${L.drift} by ${L.shift} does not land on itself (worst dy ${worst}) -- the loop would step, or the path is drawn too short`,
  );

  const rule = css.match(
    new RegExp(`\\.wave--${L.key}\\s*\\{[^}]*?--wave-shift:\\s*(-?\\d+)px`, 's'),
  );
  check(!!rule, `layer ${L.key}: no --wave-shift for .wave--${L.key} in waves.css`);
  if (rule) {
    const want = L.drift === 'left' ? -L.shift : L.shift;
    check(
      Number(rule[1]) === want,
      `layer ${L.key}: waves.css --wave-shift is ${rule[1]}px but the data says ${want}px`,
    );
  }
}

if (fail.length) {
  console.error('Wave data check FAILED:\n' + fail.map((f) => `  - ${f}`).join('\n'));
  process.exit(1);
}
console.log(`Wave data OK — ${layers.length} layers: seamless, and waves.css agrees.`);
