<script setup lang="ts">
import { ref } from 'vue'
import { HbButton, HbChip, HbIcon, HbSeed, HbSeg, HbToolbar } from '@hackbuild/ui'
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'

const band = ref<string | number>('wfm')
const squelch = ref(true)
const seed = ref(7)
const narrow = ref(true)

const fitCode = `<HbToolbar overflow>
  <HbButton variant="secondary"><HbIcon name="refresh" :size="14" /><span class="hb-bar-lbl">restart</span></HbButton>
  ...
  <template #more><HbSeed v-model="seed" /></template>
  <template #end>
    <span class="hb-spacer" />
    <HbButton variant="secondary"><HbIcon name="sliders" :size="14" /><span class="hb-bar-lbl">tune</span></HbButton>
  </template>
</HbToolbar>`

const code = `<HbToolbar>
  <HbButton size="sm">connect</HbButton>
  <HbSeg v-model="band" :options="['wfm', 'nfm', 'am']" />
  <HbChip v-model="squelch">squelch</HbChip>
  <span class="hb-spacer" />
  <span class="hb-readout">2.048 msps</span>
</HbToolbar>`
</script>

<template>
  <DemoSection
    title="Toolbar"
    note="Verbs and global settings on sunk paper. Branding stays in the header; figures stay in the status strip. Push things right with .hb-spacer. An empty toolbar takes no room."
    :code="code"
  >
    <div style="margin: -16px">
      <HbToolbar>
        <HbButton size="sm">connect</HbButton>
        <HbSeg v-model="band" :options="['wfm', 'nfm', 'am']" />
        <HbChip v-model="squelch">squelch</HbChip>
        <span class="hb-spacer" />
        <span class="hb-readout">2.048 msps</span>
      </HbToolbar>
    </div>
  </DemoSection>

  <DemoSection
    title="One row, fitted to its column"
    note="With overflow the bar folds by its own width, not the window's: under 641 px, or when its row would wrap, labels drop to icons and the more slot goes behind the menu button. Verbs that still do not fit move into the menu after it, last first; the end slot stays in the row. Switch the column width to see both."
    :code="fitCode"
  >
    <div class="demo-col">
      <HbChip v-model="narrow" toggle>narrow column</HbChip>
      <div :style="{ maxWidth: narrow ? '300px' : '100%', border: '2px solid var(--hb-ink)' }">
        <HbToolbar overflow>
          <HbButton variant="secondary"><HbIcon name="refresh" :size="14" /><span class="hb-bar-lbl">restart</span></HbButton>
          <HbButton variant="secondary"><HbIcon name="upload" :size="14" /><span class="hb-bar-lbl">body</span></HbButton>
          <HbButton variant="secondary"><HbIcon name="layer-group" :size="14" /><span class="hb-bar-lbl">panels</span></HbButton>
          <HbButton variant="secondary"><HbIcon name="record" :size="14" /><span class="hb-bar-lbl">record</span></HbButton>
          <template #more>
            <HbSeed v-model="seed" />
            <HbButton variant="secondary">stop</HbButton>
          </template>
          <template #end>
            <span class="hb-spacer" />
            <HbButton variant="secondary"><HbIcon name="sliders" :size="14" /><span class="hb-bar-lbl">tune</span></HbButton>
          </template>
        </HbToolbar>
      </div>
    </div>
  </DemoSection>

  <PropsTable
    :rows="[
      { prop: 'ink', type: 'boolean', default: 'false', notes: 'ink toolbar for instrument shells' },
      { prop: 'overflow', type: 'boolean', default: 'false', notes: 'one row, fitted to the bar width; slots more and end' },
      { prop: 'moreLabel', type: 'string', default: `'more tools'`, notes: 'name of the menu button' },
      { prop: 'v-model:open', type: 'boolean', notes: 'the more panel, folded bar only' },
    ]"
  />
</template>
