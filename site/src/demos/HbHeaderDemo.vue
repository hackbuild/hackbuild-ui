<script setup lang="ts">
import { ref } from 'vue'
import { HbHeader, HbIcon, HbPill, HbSeg } from '@hackbuild/ui'
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'

const mode = ref<string | number>('easy')

const code = `<HbHeader title="kerf" accent="." tagline="make things. break things. repeat.">
  <HbPill status="live">streaming</HbPill>
  <span style="margin-left: auto" />
  <HbSeg v-model="mode" :options="['easy', 'advanced']" />
</HbHeader>`

const iconCode = `<header class="hb-header">
  <h1>hackle<span>.</span></h1>
  <button type="button" class="hb-iconbtn" aria-label="commands">
    <HbIcon name="search" />
  </button>
</header>`
</script>

<template>
  <DemoSection
    title="Tool header"
    note="Identity and state. The title is the tool name, not hack.build; the mark carries the brand. Verbs live in the toolbar, never here. The title keeps its words whole: the parts beside it wrap first, and a title wider than the row ends in an ellipsis. The tagline drops below 900 px."
    :code="code"
  >
    <div style="margin: -16px">
      <HbHeader title="kerf" accent="." tagline="make things. break things. repeat.">
        <HbPill status="live">streaming</HbPill>
        <span style="margin-left: auto" />
        <HbSeg v-model="mode" :options="['easy', 'advanced']" />
      </HbHeader>
    </div>
  </DemoSection>

  <DemoSection
    title="Header icon button"
    note="A square .hb-iconbtn in a bare .hb-header goes ghost on the ink with no .hb-on-ink on the header: paper stroke, pink on hover and focus. 44 px on a coarse pointer and under 641 px, 34 px with a mouse. It never shrinks in a nowrap row. Always an aria-label."
    :code="iconCode"
  >
    <div style="margin: -16px">
      <header class="hb-header">
        <h1>hackle<span>.</span></h1>
        <span style="margin-left: auto" />
        <button type="button" class="hb-iconbtn" aria-label="commands" title="commands (ctrl k or /)"><HbIcon name="search" /></button>
      </header>
    </div>
  </DemoSection>

  <PropsTable
    :rows="[
      { prop: 'title', type: 'string', default: '', notes: 'the tool name' },
      { prop: 'accent', type: 'string', default: '', notes: 'trailing part rendered pink' },
      { prop: 'tagline', type: 'string', default: '', notes: 'dropped below 900 px' },
      { prop: 'mark', type: 'boolean', default: 'true', notes: 'hide when slotting a custom logo' },
    ]"
  />
</template>
