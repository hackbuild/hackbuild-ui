# @virgilvox/hackbuild-ui

The hack.build design system: tokens, one stylesheet, Vue 3 parts and vanilla behaviour for tool screens in paper, ink and one pink.

[![npm](https://img.shields.io/npm/v/@virgilvox/hackbuild-ui)](https://www.npmjs.com/package/@virgilvox/hackbuild-ui) [![licence MIT](https://img.shields.io/badge/licence-MIT-blue)](LICENSE) ![css gzip 71.9 kB measured](https://img.shields.io/badge/css%20gzip-71.9%20kB-blue) ![vanilla gzip 54.5 kB measured](https://img.shields.io/badge/vanilla%20gzip-54.5%20kB-blue) ![types included](https://img.shields.io/badge/types-included-blue)

## What it does

- Gives you every hack.build colour, face, shadow, spacing step and z index as CSS custom properties (`tokens.css`).
- Styles every part as plain CSS over those tokens (`styles.css`), so a page with no framework looks the same as a Vue app.
- Ships Vue 3 components that bind behaviour to those classes: two way state, focus traps, keys and ARIA. They carry no styles of their own.
- Ships the same behaviour as vanilla functions (`/vanilla`) for pages without Vue, including pages opened from `file://`.
- Lays out a tool screen as one of six layouts: stage and rack, canvas and rail, drop first, conversation, gate, form and frame.

## Install

```sh
npm install @virgilvox/hackbuild-ui
```

Vue 3.4 or newer is an optional peer dependency. You need it for the components, not for the CSS or the vanilla layer.

```sh
npm install vue
```

## Quick start

```ts
// The smallest page: the faces, the stylesheet and three parts.
import { createApp, h } from 'vue'
import '@virgilvox/hackbuild-ui/fonts-local.css'
import '@virgilvox/hackbuild-ui/styles.css'
import { HbButton, HbKv, HbPanel } from '@virgilvox/hackbuild-ui'

const App = {
  setup() {
    return () =>
      h(HbPanel, { heading: 'tuning' }, () => [
        h(HbKv, { label: 'center', value: '433.920' }),
        h(HbButton, { variant: 'go', onClick: () => console.log('connect') }, () => 'connect'),
      ])
  },
}

document.body.classList.add('hb')
createApp(App).mount('#app')
```

The page needs `<div id="app"></div>`. The same file is `examples/quick.ts`; `npm run typecheck` compiles it.

Without Vue, link the stylesheet and use the classes. The vanilla layer runs their behaviour:

```ts
import '@virgilvox/hackbuild-ui/styles.css'
import { layout } from '@virgilvox/hackbuild-ui/vanilla'

layout(document.querySelector('.hb-lay') as HTMLElement)
```

## Live example

- [the docs site](https://hackbuild.github.io/hackbuild-ui/): every part with a live demo, its props, events and slots, grouped by layout.
- The six layouts, live: [stage and rack](https://hackbuild.github.io/hackbuild-ui/#/layouts/stage-rack), [canvas and rail](https://hackbuild.github.io/hackbuild-ui/#/layouts/canvas-rail), [drop first](https://hackbuild.github.io/hackbuild-ui/#/layouts/drop-first), [conversation](https://hackbuild.github.io/hackbuild-ui/#/layouts/conversation), [gate](https://hackbuild.github.io/hackbuild-ui/#/layouts/gate), [form and frame](https://hackbuild.github.io/hackbuild-ui/#/layouts/form-frame).
- [the suite](https://hackbuild.github.io/hackbuild-suite/): every tool there is built from these parts.

## Concepts

### Three layers, each usable alone

`tokens.css` holds the values. `styles.css` is the tokens plus the class layer. The Vue parts and the vanilla functions only add behaviour to those classes. Anything a component renders you can also build with the raw classes.

### Put `hb` on the body

`class="hb"` on the body, or on a root wrapper, gives the paper surface, prose defaults and the grain. Add `hb-halftone` for the dot field tool screens use.

### One screen, one shape

A tool screen is one thin bar, one subject that fills, one 380 px rack and one pink action. Pick the layout part that matches your subject (`HbStageRack`, `HbCanvasRail`, `HbDropFirst`, `HbConversationLayout`, `HbGate`, `HbFormFrame`) and fill its slots. [GUIDELINES.md](GUIDELINES.md) is the design law; where any other file disagrees, it wins.

### Faces from disk or inline

`fonts-local.css` loads the five faces from the package's woff2 files. A page opened from `file://`, or one that runs offline, loads `fonts-inline.css` instead. `fonts.css` pulls them from Google Fonts.

### With Tailwind v4

```css
@import "tailwindcss";
@import "@virgilvox/hackbuild-ui/styles.css";
@import "@virgilvox/hackbuild-ui/theme.css";
```

Then `bg-paper`, `text-ink`, `font-display` and `shadow-hard` work in your own markup. See [docs/tailwind.md](docs/tailwind.md).

## API overview

| Export | What it is | Reference |
|---|---|---|
| `@virgilvox/hackbuild-ui` | the Vue parts, composables (`useToast`, `useHotkeys`), the mark paths, types | [catalogue](https://hackbuild.github.io/hackbuild-ui/#/components), [llms.md](llms.md) |
| `@virgilvox/hackbuild-ui/vanilla` | the same behaviour as functions over the classes: `layout`, `tabs`, `menu`, `modal`, `hotkeys` and the rest | [llms.md](llms.md), [docs/components.md](docs/components.md) |
| `@virgilvox/hackbuild-ui/styles.css` | the tokens and the whole class layer | [docs/tokens.md](docs/tokens.md) |
| `@virgilvox/hackbuild-ui/tokens.css` | the tokens alone | [docs/tokens.md](docs/tokens.md) |
| `@virgilvox/hackbuild-ui/theme.css` | the Tailwind v4 bridge | [docs/tailwind.md](docs/tailwind.md) |
| `@virgilvox/hackbuild-ui/fonts-local.css`, `fonts-inline.css`, `fonts.css` | the five faces from disk, inline, or Google Fonts | [docs/getting-started.md](docs/getting-started.md) |
| `@virgilvox/hackbuild-ui/fonts/*` | the woff2 files and their licences | |
| `@virgilvox/hackbuild-ui/brand/*` | the mark, lockups, wordmark and favicon as outlined SVG | [docs/brand.md](docs/brand.md) |

The catalogue on the docs site lists every part with when to use it, its props, models, events and slots, grouped by the layout that uses it.

## Browser support

| Feature | Needs | Without it |
|---|---|---|
| styles | a current Chrome, Edge, Firefox or Safari (CSS custom properties, grid, `:has`) | older browsers are not supported |
| touch | coarse pointers get 44 px targets and 16 px fields | |
| hover | hover styles apply only to a hovering fine pointer, so a tapped button does not stay lit | |
| phones | every part is checked at 320 and 390 px with no sideways scroll; the rack becomes a bottom sheet | |
| `file://` | the vanilla build and `fonts-inline.css` run from disk | `fonts-local.css` needs http |

## Errors and troubleshooting

| message | where | what to do |
|---|---|---|
| `menu: no .hb-menu inside the wrap` | vanilla `menu` | put the `.hb-menu` panel inside the element you pass |
| `barMore: needs .hb-bar-more-btn and .hb-bar-more-panel` | vanilla `barMore` | render both inside the bar |
| `hotkeys: <key> in <scope> is taken by "<label>"` | `hotkeys`, `useHotkeys` | two bindings share a key in one scope; rebind one or give it its own scope |
| `not a character file: ...` | vanilla persona reader | the file is not a character card this reader knows |
| `<Part> is merged since 0.10.0 and goes in 0.11.0; use ...` | console, once | a deprecated part; move to the part the message names |
| `HbButton variant primary is light since 0.10.0` | console, once | use `variant="go"` for the one pink action |
| fonts fall back to a system face | `file://` page | load `fonts-inline.css` |

## Works with

- `@hackbuild/ai-views` in [hackbuild-browser-ai](https://github.com/hackbuild/hackbuild-browser-ai): views of language, vision and speech models built on these parts.
- [hackbuild-suite](https://github.com/hackbuild/hackbuild-suite): the tools and explorers; each consumer pins this package with `tools/pin-ui.mjs`.
- Tailwind v4 through `theme.css`, optional.

## Changelog and licences

[CHANGELOG.md](CHANGELOG.md) lists each version. The code and docs are MIT ([LICENSE](LICENSE)). The five faces are Apache-2.0 and OFL-1.1; their texts ship in `fonts/`. The mark and wordmark are the hack.build identity.

## Development

```sh
npm install
npm run dev         # playground
npm run dev:site    # the docs site
npm run typecheck   # library, playground, site and examples/quick.ts
npm run build       # dist: ES modules, d.ts, styles
npm run build:site  # the docs site into site/dist
npm test            # house rules and vanilla behaviour
npm run docs        # rewrite site/src/catalogue.json, llms.md and docs/llms*.txt
npm run docs:check  # the README template, the catalogue and the llms files are current
npm run lint:voice  # the CLAUDE.md language rules over the docs
```

`npm install` points `core.hooksPath` at `.githooks`, whose `commit-msg` refuses trailers, AI credit, emoji, dashes and a malformed subject. Before shipping, run the checklist in [GUIDELINES.md](GUIDELINES.md#8-checklist-before-shipping-an-artifact).
