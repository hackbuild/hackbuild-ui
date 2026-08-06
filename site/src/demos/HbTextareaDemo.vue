<script setup lang="ts">
import { ref } from 'vue'
import { HbField, HbTextarea } from '@hackbuild/ui'
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'

const notes = ref('')

const code = `<HbTextarea v-model="notes" :rows="4" placeholder="what did you hear" />`
</script>

<template>
  <DemoSection title="Textarea" :code="code">
    <HbField label="session notes" for="ta-a" hint="stamped into the capture header">
      <HbTextarea id="ta-a" v-model="notes" placeholder="what did you hear" />
    </HbField>
  </DemoSection>

  <PropsTable
    :rows="[
      { prop: 'v-model', type: 'string' },
      { prop: 'invalid', type: 'boolean', default: 'false' },
      { prop: 'rows', type: 'number', default: '4' },
    ]"
  />
</template>
