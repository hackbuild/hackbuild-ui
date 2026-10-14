# Getting started

## What you are adopting

A design system with a strong opinion. Paper and ink surfaces, one pink
accent, four typefaces with fixed jobs, hard offset shadows, zero border
radius. The rules live in GUIDELINES.md and the components enforce most of
them for you.

## Install

```sh
npm install @virgilvox/hackbuild-ui
```

Requires Vue 3.4 or newer.

## Wire it up

```ts
// main.ts
import { createApp } from 'vue'
import '@virgilvox/hackbuild-ui/fonts.css'
import '@virgilvox/hackbuild-ui/styles.css'
import App from './App.vue'

createApp(App).mount('#app')
```

```html
<!-- index.html -->
<body class="hb hb-halftone">
  <div id="app"></div>
</body>
```

The `hb` class turns on the paper surface, prose defaults, focus rings, and
the grain overlay. `hb-halftone` swaps grain for the dot field, which suits
dense tool UIs. Pick one texture per artifact, never both.

If you skip `fonts.css`, load the same five families yourself:
Permanent Marker, Special Elite, VT323, IBM Plex Mono (400 to 700), and
Libre Baskerville italic.

## A tool shell in one file

```vue
<script setup lang="ts">
import { ref } from 'vue'
import {
  HbAppShell, HbHeader, HbTabs, HbToolbar, HbStatusBar,
  HbPanel, HbKv, HbButton, HbPill, HbStage,
} from '@virgilvox/hackbuild-ui'

const tab = ref<string | number>('spectrum')
const connected = ref(false)
</script>

<template>
  <HbAppShell>
    <template #header>
      <HbHeader title="kerf" accent="." tagline="make things. break things. repeat.">
        <HbPill :status="connected ? 'live' : 'err'">
          {{ connected ? 'streaming' : 'no device' }}
        </HbPill>
      </HbHeader>
    </template>
    <template #tabs>
      <HbTabs v-model="tab" :tabs="['spectrum', 'scanner', 'bench']" />
    </template>
    <template #toolbar>
      <HbToolbar>
        <HbButton size="sm" @click="connected = !connected">connect</HbButton>
      </HbToolbar>
    </template>

    <HbStage label="spectrum" graph>
      <canvas class="hb-scope" height="240" />
    </HbStage>

    <template #rail>
      <HbPanel heading="Instrument">
        <HbKv label="center" value="101.100" />
        <HbKv label="floor" value="-97 dBm" />
      </HbPanel>
    </template>

    <template #statusbar>
      <HbStatusBar>
        <span>fps <b>60</b></span>
        <span>dropped <b>0</b></span>
      </HbStatusBar>
    </template>
  </HbAppShell>
</template>
```

That is the whole recipe every bench tool follows: pinned header, tabs,
toolbar, a stage for the machine to draw on, a rail of panels, a status
strip of figures. Below 900 px the shell unpins and the rail stacks under
the work column on its own.

## Mobile first

Every component is responsive out of the box. The rules that matter:

- No horizontal scroll at 390 px, ever. Wide tables and code scroll inside
  their own wrapper (`HbTable` already does this).
- Tap targets stay at or above 40 px. Tiles are 96 px minimum.
- The header drops its tagline below 900 px. Tab strips scroll sideways
  rather than wrapping to two lines.
- Put rail content in an `HbDrawer` when it should be reachable but out of
  the way on phones.

## Without Vue

The whole system works as plain CSS. Link `styles.css` (or copy
`hackbuild.css` and `tokens.css`) and write markup with the `hb-` classes.
The style guide page and the KERF replica in this repo are built exactly
that way, and they are the reference for what correct markup looks like.
