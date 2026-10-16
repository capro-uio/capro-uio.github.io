#!/usr/bin/env node
/**
 * Accessibility gate.
 *
 * Two passes against a running site:
 *   1. axe-core (WCAG 2.0/2.1/2.2 A + AA, plus best-practice) over a sample of
 *      routes at desktop and mobile, including the nav states that only exist
 *      after a click.
 *   2. Checks axe cannot make: skip link, keyboard order, focus indicators,
 *      reduced motion, reflow at 320/640px, and per-page alt/lang/title.
 *
 * Usage:
 *   BASE=https://… node scripts/a11y/run.mjs [--all] [--report out.md]
 *
 * --all scans every route in the sitemap instead of one page per layout.
 * Exits non-zero if anything fails.
 */
import puppeteer from 'puppeteer';
import axePkg from 'axe-core';
import { writeFileSync } from 'node:fs';

const axeSource = axePkg.source;
const args = process.argv.slice(2);
const BASE = (process.env.BASE || 'http://localhost:1313').replace(/\/$/, '');
const SCAN_ALL = args.includes('--all');
const REPORT = args.includes('--report') ? args[args.indexOf('--report') + 1] : null;

const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'];
const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900, isMobile: false },
  { name: 'mobile', width: 390, height: 844, isMobile: true },
];

const violations = [];
const checks = [];
const note = (check, pass, detail = '') => checks.push({ check, pass, detail });

/** Every <loc> in the sitemap, following sitemap indexes. */
async function allRoutes() {
  const grab = async (u) => {
    const r = await fetch(u);
    if (!r.ok) return [];
    const x = await r.text();
    return [...x.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  };
  const roots = await grab(`${BASE}/sitemap.xml`);
  const locs = [];
  for (const l of roots) locs.push(...(l.endsWith('.xml') ? await grab(l) : [l]));
  const paths = locs
    .map((l) => l.replace(/^https?:\/\/[^/]+/, '') || '/')
    .filter((p) => !/\/(categories|tags)\//.test(p));
  return [...new Set(['/', ...paths])].sort();
}

/**
 * One route per distinct layout: the home page of each language, every
 * section landing page, and the first child of each section. Catches
 * layout-level regressions without scanning every news post.
 */
function sampleByLayout(routes) {
  const keep = new Set();
  const childSeen = new Set();
  for (const r of routes) {
    const parts = r.split('/').filter(Boolean);
    const lang = parts[0] === 'no' ? 'no' : 'en';
    const rest = lang === 'no' ? parts.slice(1) : parts;
    if (rest.length === 0)
      keep.add(r); // home, per language
    else if (rest.length === 1)
      keep.add(r); // section landing page
    else {
      const key = `${lang}:${rest[0]}`; // first child of each section
      if (!childSeen.has(key)) {
        childSeen.add(key);
        keep.add(r);
      }
    }
  }
  return [...keep].sort();
}

/** Meta-refresh stubs navigate away mid-scan; axe would audit the destination. */
async function isRedirectStub(url) {
  const html = await fetch(BASE + url)
    .then((r) => r.text())
    .catch(() => '');
  return /http-equiv=["']?refresh/i.test(html);
}

async function settle(page) {
  await page.evaluate(() => {
    // Kill transitions first, then reveal: otherwise axe samples elements
    // mid-fade and composites a darker colour than actually ships.
    const s = document.createElement('style');
    s.textContent =
      '*,*::before,*::after{transition:none !important;animation:none !important}';
    document.head.appendChild(s);
    document.querySelectorAll('.reveal').forEach((e) => e.classList.add('visible'));
  });
  // Leaflet renders after networkidle2 fires. Without this the map's
  // attribution is sometimes absent at scan time, so results flip between
  // runs. Wait for it when a map is on the page.
  if (await page.$('#contact-map')) {
    await page
      .waitForFunction(
        () => !!document.querySelector('.leaflet-control-attribution a'),
        { timeout: 8000 },
      )
      .catch(() => {});
  }
  await new Promise((r) => setTimeout(r, 350));
}

async function axeScan(page, url, viewport, state, prep) {
  await page.goto(BASE + url, { waitUntil: 'networkidle2' });
  await settle(page);
  if (prep) await prep(page);
  await page.evaluate(axeSource);
  const res = await page.evaluate(
    async (tags) =>
      window.axe.run(document, { runOnly: { type: 'tag', values: tags } }),
    TAGS,
  );
  for (const v of res.violations) {
    violations.push({
      url,
      viewport: viewport.name,
      state,
      id: v.id,
      impact: v.impact,
      help: v.help,
      helpUrl: v.helpUrl,
      count: v.nodes.length,
      nodes: v.nodes.slice(0, 3).map((n) => ({
        target: n.target.join(' '),
        summary: (n.failureSummary || '').replace(/\s+/g, ' ').slice(0, 220),
      })),
    });
  }
}

const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
});

const everything = await allRoutes();
const routes = [];
for (const r of SCAN_ALL ? everything : sampleByLayout(everything)) {
  if (await isRedirectStub(r)) continue;
  // A stale sitemap entry would otherwise be audited as the 404 page under
  // the wrong URL. The 404 is worth checking, but on purpose (below).
  const code = await fetch(BASE + r, { method: 'HEAD' })
    .then((x) => x.status)
    .catch(() => 0);
  if (code === 200) routes.push(r);
}
routes.push('/404.html'); // a page real users land on

// ---------------------------------------------------------------- axe pass
for (const viewport of VIEWPORTS) {
  const page = await browser.newPage();
  await page.setViewport(viewport);
  for (const url of routes) {
    try {
      await axeScan(page, url, viewport, 'default');
    } catch (e) {
      violations.push({
        url,
        viewport: viewport.name,
        state: 'default',
        id: 'SCAN_ERROR',
        impact: 'critical',
        help: String(e).slice(0, 160),
        count: 1,
        nodes: [],
      });
    }
  }
  // nav states that only exist after a click
  const sel = viewport.isMobile
    ? 'header button[aria-label="Toggle navigation"]'
    : '.nav-group__btn';
  try {
    await axeScan(
      page,
      '/',
      viewport,
      viewport.isMobile ? 'mobile-menu-open' : 'nav-open',
      async (p) => {
        const el = await p.$(sel);
        if (!el) return; // control absent on this branch
        await el.click();
        await new Promise((r) => setTimeout(r, 400));
      },
    );
  } catch {
    /* control not present; nothing to audit */
  }
  await page.close();
}

// ------------------------------------------------------------- manual pass
{
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  const first = routes.find((r) => r !== '/') || '/';

  // skip link
  await page.goto(BASE + first, { waitUntil: 'networkidle2' });
  await page.keyboard.press('Tab');
  await new Promise((r) => setTimeout(r, 300));
  const sl = await page.evaluate(() => {
    const a = document.activeElement;
    return { href: a.getAttribute('href'), top: a.getBoundingClientRect().top };
  });
  note('skip link is the first tab stop', sl.href === '#main', `href=${sl.href}`);
  note('skip link is visible when focused', sl.top >= 0, `top=${Math.round(sl.top)}`);

  // keyboard: no trap
  await page.goto(BASE + '/', { waitUntil: 'networkidle2' });
  const stops = new Set();
  for (let i = 0; i < 25; i++) {
    await page.keyboard.press('Tab');
    const d = await page.evaluate(() => {
      const a = document.activeElement;
      return !a || a === document.body
        ? null
        : `${a.tagName}.${(a.className || '').toString().split(' ')[0]}:${(a.textContent || '').trim().slice(0, 18)}`;
    });
    if (d) stops.add(d);
  }
  note(
    'no keyboard trap in the first 25 stops',
    stops.size > 5,
    `${stops.size} distinct stops`,
  );

  // focus indicators
  const fi = await page.evaluate(() => {
    const out = [];
    for (const s of [
      'a[href="#main"]',
      '.btn',
      'footer a',
      '.nav-group__btn',
      'header nav a',
    ]) {
      const el = document.querySelector(s);
      if (!el) continue;
      el.focus();
      const cs = getComputedStyle(el);
      out.push({
        s,
        ok: (parseFloat(cs.outlineWidth) || 0) > 0 && cs.outlineStyle !== 'none',
        outline: `${cs.outlineStyle} ${cs.outlineWidth}`,
      });
    }
    return out;
  });
  for (const f of fi) note(`focus indicator on ${f.s}`, f.ok, f.outline);
  await page.close();
}

{
  // reduced motion: content must not depend on the scroll observer
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.emulateMediaFeatures([
    { name: 'prefers-reduced-motion', value: 'reduce' },
  ]);
  await page.goto(BASE + '/', { waitUntil: 'networkidle2' });
  const r = await page.evaluate(() => {
    const el = document.querySelector('.reveal') || document.body;
    const cs = getComputedStyle(el);
    const reveals = [...document.querySelectorAll('.reveal')];
    return {
      transition: cs.transitionDuration,
      animation: cs.animationDuration,
      scroll: getComputedStyle(document.documentElement).scrollBehavior,
      allVisible:
        reveals.length === 0 ||
        reveals.every((e) => parseFloat(getComputedStyle(e).opacity) > 0.9),
    };
  });
  const near0 = (v) => v.split(',').every((x) => parseFloat(x) <= 0.02);
  note('reduced motion: transitions suppressed', near0(r.transition), r.transition);
  note('reduced motion: animations suppressed', near0(r.animation), r.animation);
  note('reduced motion: smooth scroll disabled', r.scroll === 'auto', r.scroll);
  note('reduced motion: content visible without the observer', r.allVisible);
  await page.close();
}

{
  // Reflow (WCAG 1.4.10). Browser zoom shrinks the CSS viewport, so media
  // queries respond to it; emulating with body{zoom} does not and gives
  // false desktop-nav overflow. Resize the viewport instead.
  const sample = routes.slice(0, 8);
  for (const [label, vp] of [
    ['320px (400% zoom)', { width: 320, height: 800 }],
    ['640px (200% zoom)', { width: 640, height: 900 }],
  ]) {
    const page = await browser.newPage();
    await page.setViewport(vp);
    for (const url of sample) {
      await page.goto(BASE + url, { waitUntil: 'networkidle2' });
      await new Promise((r) => setTimeout(r, 200));
      const m = await page.evaluate(() => ({
        sw: document.documentElement.scrollWidth,
        iw: window.innerWidth,
      }));
      note(
        `reflow ${label} ${url}`,
        m.sw <= m.iw + 1,
        `scrollWidth ${m.sw} vs ${m.iw}`,
      );
    }
    await page.close();
  }
}

{
  // per-page basics
  const page = await browser.newPage();
  for (const url of routes.slice(0, 10)) {
    await page.goto(BASE + url, { waitUntil: 'networkidle2' });
    const r = await page.evaluate(() => ({
      lang: document.documentElement.lang,
      title: document.title,
      noAlt: [...document.images].filter((i) => !i.hasAttribute('alt')).length,
      unlabelled: [...document.querySelectorAll('a')].filter(
        (a) =>
          !a.textContent.trim() &&
          !a.getAttribute('aria-label') &&
          !a.querySelector('img[alt]:not([alt=""])'),
      ).length,
    }));
    note(`lang set ${url}`, !!r.lang, r.lang);
    note(`title set ${url}`, !!r.title, r.title);
    note(`images have alt ${url}`, r.noAlt === 0, `${r.noAlt} missing`);
    note(`links are labelled ${url}`, r.unlabelled === 0, `${r.unlabelled} unlabelled`);
  }
  await page.close();
}

await browser.close();

// ------------------------------------------------------------------ report
const byId = new Map();
for (const v of violations) {
  if (!byId.has(v.id)) byId.set(v.id, { ...v, pages: new Set(), instances: 0 });
  const e = byId.get(v.id);
  e.pages.add(v.url);
  e.instances += v.count;
}
const order = { critical: 0, serious: 1, moderate: 2, minor: 3 };
const grouped = [...byId.values()].sort(
  (a, b) => (order[a.impact] ?? 9) - (order[b.impact] ?? 9),
);
const failed = checks.filter((c) => !c.pass);
const pass = grouped.length === 0 && failed.length === 0;

const md = [];
md.push(pass ? '## ✅ Accessibility: no issues' : '## ❌ Accessibility issues found');
md.push('');
md.push(
  `axe-core over ${routes.length} route${routes.length === 1 ? '' : 's'} × ${VIEWPORTS.length} viewports${SCAN_ALL ? ' (full sitemap)' : ' (one page per layout)'}, plus ${checks.length} manual checks.`,
);
md.push('');
if (grouped.length) {
  md.push(
    `### axe violations — ${grouped.reduce((s, g) => s + g.instances, 0)} instances, ${grouped.length} type${grouped.length === 1 ? '' : 's'}`,
  );
  md.push('');
  md.push('| Impact | Rule | Pages | Instances |');
  md.push('|---|---|---|---|');
  for (const g of grouped) {
    md.push(
      `| ${g.impact ?? 'n/a'} | [${g.id}](${g.helpUrl ?? '#'}) — ${g.help} | ${g.pages.size} | ${g.instances} |`,
    );
  }
  md.push('');
  md.push('<details><summary>First failing node per rule</summary>');
  md.push('');
  for (const g of grouped) {
    md.push(`**${g.id}** — \`${[...g.pages][0]}\``);
    for (const n of g.nodes.slice(0, 1)) md.push(`- \`${n.target}\`: ${n.summary}`);
    md.push('');
  }
  md.push('</details>');
  md.push('');
}
if (failed.length) {
  md.push(`### Manual checks — ${failed.length} of ${checks.length} failing`);
  md.push('');
  for (const f of failed)
    md.push(`- **${f.check}**${f.detail ? ` — ${f.detail}` : ''}`);
  md.push('');
}
if (pass) md.push(`All ${checks.length} manual checks passed.`);
md.push('');
md.push(
  '<sub>Automated tooling catches roughly a third of accessibility problems. A clean run is a floor, not a ceiling.</sub>',
);

const out = md.join('\n');
if (REPORT) writeFileSync(REPORT, out);
console.log(out);

if (!pass) process.exit(1);
