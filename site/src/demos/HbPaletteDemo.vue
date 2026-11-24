<script setup lang="ts">
import { ref } from 'vue'
import { HbButton, HbKbd, HbPalette, type HbPaletteSection } from '@hackbuild/ui'
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'
import { suiteGroups } from '../fixtures/suite'

const open = ref(false)
const ran = ref('none yet')
const sections: HbPaletteSection[] = [
  {
    label: 'tools',
    items: suiteGroups.flatMap((g) => g.tools.map((t) => ({ key: `tool:${t.key}`, label: t.label, hint: g.label }))),
  },
  {
    label: 'models',
    items: [
      { key: 'model:qwen', label: 'qwen 2.5 0.5b', hint: 'chat, 0.4 GB vendor' },
      { key: 'model:whisper', label: 'whisper base', hint: 'transcription, 0.15 GB vendor' },
    ],
  },
  {
    label: 'commands',
    items: [
      { key: 'save', label: 'save now', kbd: 'ctrl+s' },
      { key: 'open', label: 'open or import', kbd: 'ctrl+o' },
      { key: 'export', label: 'export panel', kbd: 'ctrl+shift+e' },
      { key: 'keys', label: 'key map', kbd: 'shift+?' },
    ],
  },
]

const code = `<HbPalette v-model:open="open" :sections="sections" @run="(key) => run(key)" />`
</script>

<template>
  <DemoSection
    title="Commands"
    note="Opens on / and ctrl+k (cmd+k on a Mac) anywhere outside a field. Type to filter tools, models and commands; up and down move, enter runs, esc clears the query and then closes. Focus goes back where it was."
    :code="code"
  >
    <div class="demo-row">
      <HbButton @click="open = true">open the palette</HbButton>
      <span>or press <HbKbd>/</HbKbd></span>
      <span>ran: <code>{{ ran }}</code></span>
    </div>
    <HbPalette v-model:open="open" :sections="sections" @run="(k) => (ran = k)" />
  </DemoSection>

  <PropsTable
    :rows="[
      { prop: 'sections', type: 'HbPaletteSection[]', notes: '{ label, items[] { key, label, hint, kbd, words } }' },
      { prop: 'v-model:open', type: 'boolean', default: 'false' },
      { prop: 'keys', type: 'boolean', default: 'true', notes: 'bind / and ctrl+k in the shared registry' },
      { prop: 'run', type: 'emit', notes: '(key), after the palette closes' },
    ]"
  />
</template>
