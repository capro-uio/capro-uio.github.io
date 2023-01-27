
# CAPRO website repo
[![Build site and deploy](https://github.com/capro-uio/capro-uio.github.io/actions/workflows/build_production.yaml/badge.svg)](https://github.com/capro-uio/capro-uio.github.io/actions/workflows/build_production.yaml)


## Setting up new pages

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

