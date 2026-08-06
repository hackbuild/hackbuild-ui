<script setup lang="ts">
import { ref } from 'vue'
import { HbButton, HbChip, HbSeg, HbToolbar } from '@hackbuild/ui'
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'

const band = ref<string | number>('wfm')
const squelch = ref(true)

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
    note="Verbs and global settings on sunk paper. Branding stays in the header; figures stay in the status strip. Push things right with .hb-spacer."
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

  <PropsTable :rows="[{ prop: 'ink', type: 'boolean', default: 'false', notes: 'ink toolbar for instrument shells' }]" />
</template>
