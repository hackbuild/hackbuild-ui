<script setup lang="ts">
import { ref } from 'vue'
import { HbGuide } from '@hackbuild/ui'
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'

const last = ref('none')
const code = `<HbGuide :step="2" name="art" goal="drop a logo on the lid." @verb="run" />`
</script>

<template>
  <DemoSection title="Guide" note="The toolbar strip of a bench: the step and its goal, then the verbs pushed right. Never a second bar under it." :code="code">
    <HbGuide :step="2" name="art" goal="drop a logo on the lid." @verb="last = $event" />
    <p class="hb-hint" style="margin: 8px 0 0">last verb: {{ last }}</p>
  </DemoSection>
  <PropsTable
    :rows="[
      { prop: 'step', type: 'number', notes: 'one based' },
      { prop: 'name', type: 'string' },
      { prop: 'goal', type: 'string' },
      { prop: 'verbs', type: '{id, label, icon, disabled?, title?}[]', default: 'undo, redo, open, save, guide' },
      { prop: '@verb', type: '(id: string)' },
    ]"
  />
</template>
