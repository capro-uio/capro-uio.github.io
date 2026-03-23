# capro-tw

CAPRO Hugo theme built with Tailwind CSS 4 and Alpine.js. Visual design inspired by the capro-hugo theme, originally based on the [Timer theme](https://github.com/themefisher/timer-hugo) by Themefisher.

## Requirements

- Hugo >= 0.154.0 (extended not required)
- Node.js (for theme development only)

## How it works

Theme users run only Hugo. All npm dependencies are pre-built inside the theme via `postinstall` — vendor CSS, JS, and font files are committed to the repo so Hugo can reference them directly.

### Asset pipeline

The npm build produces three categories of vendor assets:

| Category | Source | Output |
|---|---|---|
| **CSS** | Tailwind CLI, Themify Icons | `assets/css/vendor/` |
| **JS** | Alpine.js, Leaflet | `assets/js/vendor/` |
| **SCSS** | FontAwesome | `assets/scss/vendor/` |
| **Fonts** | FontAwesome, Themify, Space Grotesk, Spectral, Leaflet images | `static/webfonts/` |

Hugo then processes these in `layouts/partials/head/css.html`:

- **Tailwind + Themify Icons** are concatenated, minified, and fingerprinted into a single `capro.min.css`
- **FontAwesome** is compiled from SCSS via Hugo Pipes and loaded with deferred `media="print"` swap

### Themify Icons

The `themify-icons` npm package ships SCSS with `.icon-` class prefixes, but this theme uses `.ti-` prefixes. The build script `scripts/build-themify-css.js` reads the icon definitions from the package, remaps them to `.ti-` classes, prepends the `@font-face` declaration with correct font paths, and writes the result to `assets/css/vendor/themify-icons.css`.

## Theme development

All commands run from the theme directory (`themes/capro-tw/`).

### Initial setup

```sh
npm install
```

This triggers `postinstall`, which runs the full build: cleans vendor directories, builds Tailwind CSS, and syncs all dependencies.

### npm scripts

| Script | Description |
|---|---|
| `npm run build` | Full clean build (clean + setup + build:css + sync:deps) |
| `npm run build:css` | Rebuild Tailwind CSS only |
| `npm run update` | Update all npm packages and rebuild |
| `npm run clean` | Remove all vendor directories |

### Updating dependencies

```sh
npm run update
```

This runs `npm update` followed by a full rebuild, ensuring all vendor assets reflect the latest package versions.

### Adding a new vendor dependency

1. `npm install <package>`
2. Add a `sync:<name>` script to copy the needed files into the appropriate vendor directory
3. Wire it into the `sync:deps` chain
4. If the package needs transformation (like Themify Icons), add a build script in `scripts/`

## Project structure

```
themes/capro-tw/
├── assets/
│   ├── css/
│   │   ├── components/     # Theme CSS components
│   │   ├── main.css         # Tailwind entry point
│   │   └── vendor/          # Generated: tailwind.css, leaflet.css, themify-icons.css
│   ├── js/
│   │   ├── vendor/          # Generated: alpine.min.js, leaflet.js
│   │   ├── counter.js
│   │   ├── map.js
│   │   ├── orcid-pubs.js
│   │   └── scroll-reveal.js
│   └── scss/
│       ├── fontawesome.scss  # Hugo SCSS entry point for FontAwesome
│       └── vendor/           # Generated: FontAwesome SCSS partials
├── layouts/
├── scripts/
│   └── build-themify-css.js  # Generates Themify Icons CSS from npm source
├── static/
│   └── webfonts/             # Generated: all self-hosted font files
├── package.json
└── theme.toml
```

Directories marked **Generated** are wiped by `npm run clean` and rebuilt by `npm run build`. They should be committed so that Hugo works without Node.js.
