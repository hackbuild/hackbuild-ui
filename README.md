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
3. `@hackbuild/ui`. Vue 3 components that bind behavior to those classes.
   They ship no styles of their own, so the CSS stays the single source of
   truth.

A Tailwind v4 bridge (`theme.css`) maps the tokens into Tailwind theme
variables for app code. Tailwind is optional and never required by the
library itself.

## Install

```sh
npm install @hackbuild/ui
```

Vue 3.4 or newer is a peer dependency.

## Quick start

```ts
// main.ts
import { createApp } from 'vue'
import '@hackbuild/ui/fonts.css'    // or self-host the five faces
import '@hackbuild/ui/styles.css'
import App from './App.vue'

createApp(App).mount('#app')
```

```vue
<script setup lang="ts">
import { HbButton, HbPanel, HbKv } from '@hackbuild/ui'
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
@import "@hackbuild/ui/styles.css";
@import "@hackbuild/ui/theme.css";
```

Then `bg-paper`, `text-ink`, `font-display`, `shadow-hard` and friends work
in your own markup. See docs/tailwind.md.

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
| `site/` | The design system website: component gallery, tokens, brand, full page demos. |
| `hackbuild-design-system.html` | The living style guide, self contained. |
| `hackbuild-kerf-replica.html` | The acceptance test: KERF rebuilt from system classes. |
| `GUIDELINES.md` | The design law. Where files disagree, it wins. |

## Exports

| Specifier | Contents |
|---|---|
| `@hackbuild/ui` | Components, composables, `cx`, types. |
| `@hackbuild/ui/styles.css` | Tokens plus the full class layer. |
| `@hackbuild/ui/tokens.css` | Tokens alone. |
| `@hackbuild/ui/theme.css` | Tailwind v4 bridge. |
| `@hackbuild/ui/fonts.css` | Font import. |
| `@hackbuild/ui/brand/*` | Brand SVGs, for example `@hackbuild/ui/brand/hackbuild-mark.svg`. |

## Development

```sh
npm install
npm run dev        # playground at the printed port
npm run dev:site   # the design system website
npm run typecheck  # vue-tsc over library, playground and site
npm run build      # dist: ES modules, d.ts, styles
npm run build:site # static site into site/dist
```

Before shipping anything, run the checklist at the end of GUIDELINES.md,
and look at the playground in a real browser at desktop width and 390 px.

## Documentation

- docs/getting-started.md
- docs/tokens.md
- docs/components.md
- docs/tailwind.md
- docs/brand.md
