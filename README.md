
# CAPRO website repo
[![Build site and deploy](https://github.com/capro-uio/capro-uio.github.io/actions/workflows/build_production.yaml/badge.svg)](https://github.com/capro-uio/capro-uio.github.io/actions/workflows/build_production.yaml)


## Built with [Hugo](https://gohugo.io/)

Hugo is a static site generator, generating html pages based on markdown and a predefined css/html theme.
The pages can be previewed locally with 

```
hugo serve
```

The terminal will let you know which localhost it is working on, by default it should be `1313`. 

### Built with Github actions

The pages are built with Github actions, in two different workflows.

One will build page previews on PRs to the main branch.
Pleas always have a look at the preview before merging to main

The other will build and deploy the production page to the main website URL.

Team publications are updated one a week, and are cached for the remaining builds to speed up build time.


### Setting up new pages

There are [Hugo Archetypes](https://gohugo.io/content-management/archetypes/) set up for certain type of content:

- testimonials
- portfolio
- team members

To initiate new pages with these archetypes, you can use hugo commands:

```sh
hugo new --kind testimonial testimonial/[new-folder-name]
hugo new --kind portfolio   portfolio/[new-folder-name]
hugo new --kind team        team/[new-folder-name]
```

These will create new [bundled pages](https://gohugo.io/content-management/page-bundles/) for the content you want to add, with markdown files containing
yaml settings that need to be filled in before publishing.
There should be any further instructions in the archetypes themselves.

## Branding

### Font

Heading / Logo font: [Space Grotesk](https://fonts.google.com/specimen/Space+Grotesk), weight 400 / Regular
Body / subtitle: [Spektral](https://fonts.google.com/specimen/Spectral), weight 300 / Light

### Colours

Primary: #cc4c4c
Secondary: #85bfbf
Main grey: #353b43


### Logo

Title: 80pt
subtitle: 50pt, 5pt distance between letters

Logo + Title in primary branding colour

