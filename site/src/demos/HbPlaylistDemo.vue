<script setup lang="ts">
import { ref } from 'vue'
import { HbIcon, HbPlaylist, type HbPlaylistItem } from '@hackbuild/ui'
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'

const current = ref(0)

const items: HbPlaylistItem[] = [
  { title: 'hacking your hackerspace', duration: '28:14', date: 'may 2025' },
  { title: 'esp32 led marquee over mqtt', duration: '12:40', date: 'feb 2025' },
  { title: 'omni wheel robot, part one', duration: '18:03', date: 'nov 2024' },
  { title: 'kicad to fab in one evening', duration: '22:51', date: 'aug 2024' },
]

const code = `<HbPlaylist v-model="current" :items="[
  { title: 'hacking your hackerspace', youtube: 'VIDEO_ID', duration: '28:14' },
  { title: 'esp32 led marquee', youtube: 'VIDEO_ID', duration: '12:40' },
]" heading="hardware talks" />`
</script>

<template>
  <DemoSection
    title="Playlist"
    note="The resume video section as one component: pink framed player beside a numbered VT323 track list, playing track flipped pink, prev and next, and an autoplay chip that wraps to the first track. Sources per track: youtube, vimeo or src, same as HbVideoFrame. These demo tracks carry no source, so the well shows the empty slot."
    :code="code"
  >
    <HbPlaylist v-model="current" :items="items" heading="hardware talks">
      <template #empty>
        <div style="position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; color: var(--hb-paper)">
          <HbIcon name="play" :size="36" />
          <span style="font-family: var(--hb-readout); font-size: 16px">track {{ current + 1 }} playing here</span>
        </div>
      </template>
    </HbPlaylist>
  </DemoSection>

  <PropsTable
    :rows="[
      { prop: 'items', type: 'Array<{title, youtube?, vimeo?, src?, duration?, date?}>', notes: 'required' },
      { prop: 'v-model', type: 'number', default: '0', notes: 'playing track index' },
      { prop: 'v-model:autoplay', type: 'boolean', default: 'false', notes: 'next wraps to the first track' },
      { prop: 'heading', type: 'string', default: `'playlist'` },
      { prop: '@change', type: 'emit', notes: 'new index' },
      { prop: '#empty', type: 'slot', notes: 'the well when a track has no source' },
    ]"
  />
</template>
