# hackbuild-ui

The hack.build design system and Vue component library. Warm paper, black
ink, one hot pink, typewriter type, hard shadows that look slightly
off-register like a bad photocopy.

Three layers, each usable without the ones above it:

1. `tokens.css`. Every color, face, shadow, spacing step, and z index as
   CSS custom properties.
2. `hackbuild.css`. The class layer: every component as plain CSS,
   framework free. This is what the static style guide and acceptance test
   pages run on.
3. `@virgilvox/hackbuild-ui`. Vue 3 components that bind behavior to
   those classes. They ship no styles of their own, so the CSS stays the
   single source of truth.

A Tailwind v4 bridge (`theme.css`) maps the tokens into Tailwind theme
variables for app code. Tailwind is optional and never required by the
library itself.

The bench layer (GUIDELINES.md section 9, version 0.3.0) adds the classes
and six components a design bench needs: HbSteps, HbGuide,
HbStageOverlay, HbMaterials, HbParamRow and HbWelcome.
`playground/bench.html` drives them end to end.

## Install

```sh
npm install @virgilvox/hackbuild-ui
```

Vue 3.4 or newer is a peer dependency.

## Quick start

```ts
// main.ts
import { createApp } from 'vue'
import '@virgilvox/hackbuild-ui/fonts.css'    // or self-host the five faces
import '@virgilvox/hackbuild-ui/styles.css'
import App from './App.vue'

createApp(App).mount('#app')
```

```vue
<script setup lang="ts">
import { HbButton, HbPanel, HbKv } from '@virgilvox/hackbuild-ui'
</script>

<template>
  <HbPanel heading="Tuning">
    <HbKv label="center" value="433.920" />
    <HbButton>connect</HbButton>
  </HbPanel>
</template>
```

Put `class="hb"` on the body (or a root wrapper) to get the paper page
surface, prose defaults, and the grain overlay. Add `hb-halftone` for the
dot field used by tool UIs.

## With Tailwind v4

```css
/* app.css */
@import "tailwindcss";
@import "@virgilvox/hackbuild-ui/styles.css";
@import "@virgilvox/hackbuild-ui/theme.css";
```

Then `bg-paper`, `text-ink`, `font-display`, `shadow-hard` and the other
theme utilities work in your own markup. See docs/tailwind.md.

## Package map

| Path | What it is |
|---|---|
| `src/styles/tokens.css` | Design tokens. The source of truth. |
| `src/styles/hackbuild.css` | The class layer. Every component as CSS. |
| `src/styles/tailwind.css` | Tailwind v4 theme bridge. |
| `src/styles/fonts.css` | Google Fonts convenience import. |
| `src/components/` | Vue components, Hb prefix, no style blocks. |
| `src/composables/` | useToast. |
| `assets/brand/` | The mark, lockups, wordmark, favicon. Outlined paths. |
| `docs/` | Getting started, tokens, components, Tailwind, brand. |
| `playground/` | Vite app exercising every component. |
| `playground/bench.html` | The bench layer (GUIDELINES.md section 9) driven end to end. |
| `site/` | The design system website: component gallery, tokens, brand, full page demos. |
| `hackbuild-design-system.html` | The living style guide, self contained. |
| `hackbuild-kerf-replica.html` | The acceptance test: KERF rebuilt from system classes. |
| `GUIDELINES.md` | The design law. Where files disagree, it wins. |
| `tools/`, `.githooks/` | House rule checks on commit messages and package metadata, with their tests. |

## Exports

| Specifier | Contents |
|---|---|
| `@virgilvox/hackbuild-ui` | Components, composables, `cx`, types. |
| `@virgilvox/hackbuild-ui/styles.css` | Tokens plus the full class layer. |
| `@virgilvox/hackbuild-ui/tokens.css` | Tokens alone. |
| `@virgilvox/hackbuild-ui/theme.css` | Tailwind v4 bridge. |
| `@virgilvox/hackbuild-ui/fonts.css` | Font import. |
| `@virgilvox/hackbuild-ui/brand/*` | Brand SVGs, for example `@virgilvox/hackbuild-ui/brand/hackbuild-mark.svg`. |

## Development

```sh
npm install
npm run dev        # playground at the printed port
npm run dev:site   # the design system website
npm run typecheck  # vue-tsc over library, playground and site
npm run build      # dist: ES modules, d.ts, styles
npm run build:site # static site into site/dist
npm test           # house rules: commit-msg hook, licence, author, install name
```

`npm install` points `core.hooksPath` at `.githooks`, whose `commit-msg`
refuses trailers, AI credit, emoji, dashes and a malformed subject
(CLAUDE.md). Before a push, `BASE_REF=main npm run lint:commits` runs the
same hook over every commit the push adds and checks each author and
committer.

Before shipping anything, run the checklist at the end of GUIDELINES.md,
and look at the playground in a real browser at desktop width and 390 px.

## Documentation

- docs/getting-started.md
- docs/tokens.md
- docs/components.md
- docs/icons.md
- docs/tailwind.md
- docs/brand.md

## Changelog and licence

CHANGELOG.md lists each version. The package is MIT, see
LICENSE.
