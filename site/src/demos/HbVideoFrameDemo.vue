<script setup lang="ts">
import { HbIcon, HbVideoFrame } from '@hackbuild/ui'
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'

const code = `<HbVideoFrame youtube="dQw4w9WgXcQ" title="shop tour" />
<HbVideoFrame vimeo="https://vimeo.com/123456789" />
<HbVideoFrame src="/talks/hackerspace.mp4" />`
</script>

<template>
  <DemoSection
    title="Video frame"
    note="The one pink border in a video section: a 16 by 9 well on the void. YouTube goes through youtube-nocookie with modest branding, the way the resume site does it. Vimeo and plain files work too, or slot your own player."
    :code="code"
  >
    <div style="max-width: 560px">
      <HbVideoFrame title="placeholder well">
        <div style="position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; color: var(--hb-paper)">
          <HbIcon name="play" :size="40" />
          <span style="font-family: var(--hb-readout); font-size: 17px">select a video to play</span>
        </div>
      </HbVideoFrame>
    </div>
    <p style="margin: 12px 0 0; color: var(--hb-ink-3); font-size: 12.5px">
      The live embed is not loaded on this page to keep the gallery offline;
      pass a youtube, vimeo or src prop and it fills the well.
    </p>
  </DemoSection>

  <PropsTable
    :rows="[
      { prop: 'youtube', type: 'string', notes: 'id or url, embeds via youtube-nocookie' },
      { prop: 'vimeo', type: 'string', notes: 'id or url' },
      { prop: 'src', type: 'string', notes: 'file url, native video element' },
      { prop: 'title', type: 'string', default: `'video'`, notes: 'accessible name for the embed' },
      { prop: '#default', type: 'slot', notes: 'custom player or placeholder' },
    ]"
  />
</template>
