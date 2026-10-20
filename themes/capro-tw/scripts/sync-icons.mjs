import { mkdirSync, readFileSync, writeFileSync, readdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';

const SRC = 'node_modules/@fortawesome/fontawesome-free/svgs';
const OUT = 'assets/icons';

// Every icon the site renders. Font Awesome Free, icons under CC BY 4.0.
const ICONS = {
  solid: [
    'arrow-up-right-from-square',
    'bars',
    'box',
    'brain',
    'chalkboard',
    'chalkboard-user',
    'chart-line',
    'chevron-left',
    'chevron-right',
    'chevron-up',
    'clipboard-list',
    'database',
    'flask',
    'folder-tree',
    'hard-drive',
    'infinity',
    'location-dot',
    'pen-ruler',
    'quote-left',
    'rocket',
    'square-check',
    'table-columns',
    'user',
    'xmark',
  ],
  brands: ['github', 'linkedin', 'mastodon', 'orcid', 'twitter'],
};

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

let n = 0;
for (const [style, names] of Object.entries(ICONS)) {
  for (const name of names) {
    const from = join(SRC, style, `${name}.svg`);
    let svg = readFileSync(from, 'utf8');
    // The per-file licence comment would be inlined into every page; the
    // attribution lives in assets/icons/README.md instead.
    svg = svg.replace(/<!--[\s\S]*?-->/g, '').trim();
    writeFileSync(join(OUT, `${name}.svg`), svg + '\n');
    n++;
  }
}

const have = readdirSync(OUT).filter((f) => f.endsWith('.svg')).length;
if (have !== n) throw new Error(`wrote ${n} icons but found ${have}`);
console.log(`synced ${n} icons into ${OUT}`);
