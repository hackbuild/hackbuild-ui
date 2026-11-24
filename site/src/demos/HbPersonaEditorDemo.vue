<script setup lang="ts">
import { ref } from 'vue'
import { HbConsole, HbPersonaEditor, type HbConsoleLine, type PersonaFile, type PersonaPreset } from '@hackbuild/ui'
import { personaJson } from '@hackbuild/ui/vanilla'
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'
import { PRESETS, ROOK } from '../fixtures/agent'

const file = ref<PersonaFile>({ ...ROOK })
const presets = ref<PersonaPreset[]>([...PRESETS])
const log = ref<HbConsoleLine[]>([])
const note = (text: string) => { log.value = [...log.value, { text }] }

function onExport(f: PersonaFile) {
  note(`export ${f.name || 'untitled'}.json, ${personaJson(f).length} bytes`)
}
const code = `<HbPersonaEditor v-model="character" :presets="presets"
  @save-preset="(p) => presets.push(p)"
  @remove-preset="(i) => presets.splice(i, 1)"
  @export="download" />`
</script>

<template>
  <DemoSection title="Persona editor" note="The name labels every message. The template gives a small model headings to hold a persona; the cost under the prompt is an estimate at four characters a token. A preset is the whole character: prompt, model, sampling and voice. The name to save under is inline, not a dialog." :code="code">
    <div class="demo-col" style="max-width: 560px">
      <HbPersonaEditor
        v-model="file"
        :presets="presets"
        @save-preset="(p) => { presets = [...presets, p]; note(`saved ${p.label}`) }"
        @remove-preset="(i) => { note(`removed ${presets[i]?.label}`); presets = presets.filter((_, k) => k !== i) }"
        @load-preset="(i) => note(`loaded ${presets[i]?.label}`)"
        @import="(f) => note(`imported ${f.name}`)"
        @export="onExport"
      />
      <HbConsole :lines="log" height="100px" empty="preset and file events land here" />
    </div>
  </DemoSection>
  <PropsTable
    :rows="[
      { prop: 'v-model', type: 'PersonaFile { v, name, prompt, first?, model?, params?, voice?, avatar? }' },
      { prop: 'presets', type: 'PersonaPreset[] { label, file }', notes: 'owned by the host' },
      { prop: 'template', type: 'string', default: 'PERSONA_TEMPLATE' },
      { prop: 'cost', type: 'number', notes: 'tokens; default an estimate' },
      { prop: 'rows', type: 'number', default: '10' },
      { prop: 'events', type: 'save-preset, load-preset, remove-preset, import, export' },
    ]"
  />
</template>
