#!/usr/bin/env node
/**
 * Content accessibility lint. No browser, no build — reads the Markdown.
 *
 * The rendered-page audit cannot catch these: an image written `![](photo.png)`
 * renders as `alt=""`, which has the alt attribute and so passes every runtime
 * check, while telling a screen reader nothing.
 *
 * Usage: node scripts/a11y/content.mjs [--content DIR]
 * Exits non-zero on any error.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const args = process.argv.slice(2);
const ROOT = args.includes('--content')
  ? args[args.indexOf('--content') + 1]
  : 'content';

/**
 * Sections whose images are labelled correctly by the template from the page
 * title or person's name — a portrait captioned with its subject's name is
 * right, and asking authors to restate it invites worse alt text, not better.
 * Anywhere else, a lead image is content and needs a decision.
 */
const FALLBACK_IS_CORRECT = new Set(['team', 'testimonial', 'portfolio']);
const IMAGE_EXT = /\.(png|jpe?g|webp|gif|avif|svg)$/i;

const errors = [];
const warnings = [];

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else out.push(p);
  }
  return out;
}

function splitFrontMatter(text) {
  if (!text.startsWith('---')) return { fm: '', body: text };
  const end = text.indexOf('\n---', 3);
  if (end === -1) return { fm: '', body: text };
  return { fm: text.slice(4, end), body: text.slice(end + 4) };
}

/** Strip fenced code blocks so examples in prose are not linted as content. */
function withoutFences(body) {
  const lines = body.split('\n');
  let fenced = false;
  return lines
    .map((l) => {
      if (/^\s*```/.test(l)) {
        fenced = !fenced;
        return '';
      }
      return fenced ? '' : l;
    })
    .join('\n');
}

const files = walk(ROOT).filter((f) => f.endsWith('.md'));

for (const file of files) {
  const text = readFileSync(file, 'utf8');
  const { fm, body } = splitFrontMatter(text);
  const prose = withoutFences(body);
  const rel = relative(process.cwd(), file);
  const lineOf = (idx) => text.slice(0, idx).split('\n').length;

  // 1. Markdown images with empty alt. `![](x.png)` is the single easiest way
  //    to ship an unlabelled image, and it passes every runtime check.
  for (const m of prose.matchAll(/!\[([^\]]*)\]\(([^)\s]+)/g)) {
    const [, alt, src] = m;
    if (alt.trim() === '') {
      errors.push(
        `${rel}:${lineOf(text.indexOf(m[0]))} image has empty alt: ![](${src})`,
      );
    } else if (/^(image|img|photo|picture|screenshot|logo)\b/i.test(alt.trim())) {
      warnings.push(`${rel}: alt "${alt}" describes the medium, not the content`);
    } else if (IMAGE_EXT.test(alt.trim())) {
      errors.push(`${rel}: alt is a filename: "${alt}"`);
    }
  }

  // 2. Raw <img> in Markdown, which bypasses the Markdown rule above.
  for (const m of prose.matchAll(/<img\b[^>]*>/gi)) {
    if (!/\balt\s*=/i.test(m[0])) {
      errors.push(
        `${rel}:${lineOf(text.indexOf(m[0]))} <img> without an alt attribute`,
      );
    }
  }

  // 3. Hugo figure shortcodes.
  for (const m of prose.matchAll(/\{\{<\s*figure\b[^>]*?>\}\}/gi)) {
    if (!/\balt\s*=/i.test(m[0])) {
      errors.push(`${rel}:${lineOf(text.indexOf(m[0]))} figure shortcode without alt=`);
    }
  }

  // 4. Bundled lead images outside the sections where the template fallback is
  //    correct. These are content, so the author has to decide what they say.
  const isIndex =
    /(^|[\\/])(index|_index)\.[\w-]+\.md$|(^|[\\/])(index|_index)\.md$/.test(file);
  if (!isIndex) continue;
  const bundleDir = file.slice(0, file.lastIndexOf(sep));
  const images = readdirSync(bundleDir).filter((f) => IMAGE_EXT.test(f));
  if (images.length === 0) continue;

  const section = relative(ROOT, bundleDir).split(sep)[0];
  if (FALLBACK_IS_CORRECT.has(section)) continue;

  const declaresAlt = /^image_alt\s*:/m.test(fm) || /^\s+alt\s*:/m.test(fm);
  const declaresDecorative =
    /^image_decorative\s*:\s*true/m.test(fm) || /^\s+decorative\s*:\s*true/m.test(fm);
  if (!declaresAlt && !declaresDecorative) {
    errors.push(
      `${rel}: bundles ${images.length} image(s) (${images.slice(0, 2).join(', ')}) but sets ` +
        'neither image_alt nor image_decorative — the template would fall back to the page title',
    );
  }
}

for (const w of warnings) console.log(`warn   ${w}`);
for (const e of errors) console.log(`ERROR  ${e}`);
console.log(
  `\n${files.length} content files checked — ${errors.length} error(s), ${warnings.length} warning(s)`,
);
if (errors.length) process.exit(1);
