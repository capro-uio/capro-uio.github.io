# Accessibility gate

Runs on every pull request against the deployed Netlify preview, and fails the
job if anything regresses. The report is posted as a PR comment.

## Running it locally

```sh
hugo server                                    # in one terminal
npm install --prefix scripts/a11y              # once
BASE=http://localhost:1313 npm run audit --prefix scripts/a11y
```

Against a preview instead:

```sh
BASE=https://23--capro-uio.netlify.app npm run audit --prefix scripts/a11y
```

## What it checks

**axe-core** (WCAG 2.0 / 2.1 / 2.2 A + AA, plus best-practice) at desktop and
mobile, including the nav states that only exist after a click.

By default it scans one page per layout — every language's home page, every
section landing page, and the first child of each section — which catches
layout-level regressions without scanning every news post. `--all` scans every
route in the sitemap and is worth running before a release.

**Checks axe cannot make:**

- the skip link is the first tab stop and becomes visible when focused
- no keyboard trap
- a visible focus indicator on every interactive element
- `prefers-reduced-motion` is honoured, and content is still visible when the
  scroll observer never fires
- no horizontal scrolling at 320px (400% zoom) or 640px (200% zoom)
- `lang`, `title`, image `alt` and link labels on each page

## Things that will trip you up

**Settle animations before measuring.** `.reveal` fades in. Sampling a colour
mid-fade composites it against the background and reports a contrast failure
that does not ship. The script disables transitions before revealing anything.

**Do not emulate zoom with `body { zoom }`.** Real browser zoom shrinks the CSS
viewport, so media queries respond to it. `zoom` does not, so the desktop nav
stays on screen at double size and reports an overflow that cannot happen.
Resize the viewport instead — that is what the script does.

**Redirect stubs.** A page with a `<meta http-equiv="refresh">` navigates away
mid-scan and axe audits the destination site. The script detects and skips them
before navigating.

**A clean run is a floor, not a ceiling.** Automated tooling catches roughly a
third of real accessibility problems. It cannot tell you whether alt text is
*meaningful*, whether the copy is understandable, or how the site sounds in a
screen reader. Test with VoiceOver or NVDA before claiming the site is
accessible.
