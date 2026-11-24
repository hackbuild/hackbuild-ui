<script setup lang="ts">
import { ref } from 'vue'
import { HbToggleRow } from '@hackbuild/ui'
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'

const blink = ref(true)
const sway = ref(false)
const look = ref(true)
const code = `<HbToggleRow v-model="blink" label="blink" description="eyes close every few seconds" />`
</script>

<template>
  <DemoSection
    title="Behaviour toggles"
    note="Label, one line of why, and the switch, as one 44 px button with role switch. A press anywhere on the row flips it."
    :code="code"
  >
    <div style="max-width: 420px">
      <HbToggleRow v-model="blink" label="blink" description="eyes close every few seconds" />
      <HbToggleRow v-model="sway" label="idle sway" description="the body shifts its weight while idle" />
      <HbToggleRow v-model="look" label="look at the pointer" description="the head follows the pointer over the stage" />
      <HbToggleRow label="lip sync" description="needs a voice; load one in the model manager" disabled />
    </div>
  </DemoSection>

  <PropsTable
    :rows="[
      { prop: 'label', type: 'string' },
      { prop: 'description', type: 'string', notes: 'one line on what on does' },
      { prop: 'v-model', type: 'boolean', default: 'false' },
      { prop: 'disabled', type: 'boolean', default: 'false', notes: 'say why in the description' },
    ]"
  />
</template>
