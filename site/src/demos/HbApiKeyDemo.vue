<script setup lang="ts">
import { ref } from 'vue'
import { HbApiKey } from '@hackbuild/ui'
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'

const key = ref('')
const valid = ref(false)
const typed = ref('sk-ant-api03-demo-not-a-real-key-9xQz')

const code = `<HbApiKey v-model="key" v-model:valid="ok" :pattern="/^sk-ant-/" />
// the key lives in the parent's memory for the session. nothing writes it to storage.`
</script>

<template>
  <DemoSection
    title="Api key"
    note="Asked for at the row that needs it, checked by shape, shown as the first 4 and the last 4. The note by the field says where it goes and that it is never saved. A key that matches the shape can still be refused by the endpoint."
    :code="code"
  >
    <div class="demo-col" style="max-width: 480px">
      <HbApiKey v-model="key" v-model:valid="valid" pattern="^sk-ant-" placeholder="sk-ant-api03-..." />
      <span class="hb-hint">valid: {{ valid }}</span>
      <HbApiKey v-model="typed" label="filled" pattern="^sk-ant-" />
    </div>
  </DemoSection>

  <PropsTable
    :rows="[
      { prop: 'v-model', type: 'string', notes: 'held in memory by the parent' },
      { prop: 'v-model:valid', type: 'boolean' },
      { prop: 'pattern', type: 'RegExp | string | null', notes: 'empty: 8 or more characters' },
      { prop: 'label / placeholder / note', type: 'string' },
    ]"
  />
</template>
