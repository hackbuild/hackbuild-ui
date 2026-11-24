<script setup lang="ts">
import { ref } from 'vue'
import { HbSteps } from '@hackbuild/ui'
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'

const step = ref<string | number>('art')
const steps = [
  { label: 'shape', value: 'shape', done: true },
  { label: 'art', value: 'art' },
  { label: 'materials', value: 'materials' },
  { label: 'print', value: 'print' },
]
const code = `<HbSteps v-model="step" :steps="steps" label="bench steps" />`
</script>

<template>
  <DemoSection title="Steps" note="The numbered step strip of a bench. Arrow keys, Home and End move along it. When it no longer fits it collapses to a select." :code="code">
    <HbSteps v-model="step" :steps="steps" label="bench steps" />
    <p class="hb-hint" style="margin: 8px 0 0">step: {{ step }}</p>
  </DemoSection>
  <PropsTable
    :rows="[
      { prop: 'steps', type: '({label, value, done?} | string)[]' },
      { prop: 'v-model', type: 'string | number' },
      { prop: 'label', type: 'string', default: 'steps' },
      { prop: '@change', type: '(value: string | number)' },
    ]"
  />
</template>
