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
  {
    to: '#/demos/suite-shell',
    label: 'suite header and nav',
    text: 'Workspace and level, status pills, the activity line, then seven groups with their tools. Under 761 px the nav is one group / tool button that opens a sheet with search.',
  },
  {
    to: '#/demos/suite-chat',
    label: 'suite chat over the status strip',
    text: 'A chat in the work column with a mic and a one line note. On a phone the page scrolls as one and the composer sticks above the status strip.',
  },
  {
    to: '#/demos/shell-rack',
    label: 'shell: stage and rack',
    text: 'The stage beside a numbered rack of tabs. Under 901 px the rack is a sheet, opened from the dock; stage and split modes.',
  },
  {
    to: '#/demos/phone-rack',
    label: 'phone: stage and rack',
    text: 'The room on a phone: the stage fills the screen over the docked composer, the seven rack tabs open as a bottom sheet with one caption line kept on the stage, a touch pad on the stage.',
  },
  {
    to: '#/demos/stage-chat',
    label: 'stage left, chat right',
    text: 'A character tool: the stage wide on the left and chat in a column on the right from 1024 px; on a phone the stage comes first at 38dvh with chat under it. Send the last reply to another tool from a list that says why a tool cannot take it.',
  },
  {
    to: '#/demos/stage-tool',
    label: 'stage tool',
    text: 'A motion tool: the toolbar, the stage, a strip and the transport in the main column, the rack on the right from 1024 px. Each part keeps its own row; the hint keys read on the dark plate.',
  },
  {
    to: '#/demos/shell-bench',
    label: 'shell: stepped bench',
    text: 'Numbered steps and the guide sentence in the strips, the stage beside a parameter rail, next pinned in the dock.',
  },
  {
    to: '#/demos/shell-transcript',
    label: 'shell: transcript',
    text: 'A short stage over the conversation with the composer pinned above the status strip; stage, split and chat modes.',
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
