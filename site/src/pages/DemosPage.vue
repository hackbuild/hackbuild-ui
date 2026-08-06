<script setup lang="ts">
import { HbCard, HbShell } from '@hackbuild/ui'

const demos = [
  {
    to: '#/demos/bench',
    label: 'bench tool',
    text: 'The full instrument recipe: pinned chrome, dial, meters, a live spectrum on a stage, presets, bookmarks, console and status strip.',
  },
  {
    to: '#/demos/zine',
    label: 'zine page',
    text: 'The page idiom: marker hero with an ink block, alternating paper and ink sections, stickers and one pink call to action.',
  },
  {
    to: '#/demos/settings',
    label: 'settings',
    text: 'A form-heavy tool page: fields, segs, switches, sliders and folds arranged the way a real config screen ends up.',
  },
]
</script>

<template>
  <HbShell class="site-main">
    <h1>demos</h1>
    <p class="hb-prose" style="margin-top: 8px">
      Full pages built from nothing but the system, the way the acceptance
      test file rebuilds KERF. Each opens without the site chrome.
    </p>
    <div class="home-grid" style="margin-top: 24px">
      <HbCard v-for="demo in demos" :key="demo.to" interactive as="a" :href="demo.to">
        <h3>{{ demo.label }}</h3>
        <p style="margin: 8px 0 0; color: var(--hb-ink-2)">{{ demo.text }}</p>
      </HbCard>
    </div>
  </HbShell>
</template>
