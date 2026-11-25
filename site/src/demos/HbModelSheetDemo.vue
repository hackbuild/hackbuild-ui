<script setup lang="ts">
import { ref } from 'vue'
import { HbButton, HbModelSheet } from '@hackbuild/ui'
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'
import { useFakeLoad } from '../pages/layouts/useFakeLoad'
import { chatRows } from '../fixtures/picker'

const { rows, load } = useFakeLoad(chatRows)
const open = ref(false)
const chosen = ref('steady')
const said = ref('')
const code = `<HbModelSheet v-model:open="open" v-model:chosen="chosen" :rows="rows"
  @load="load" @cancel="stop" @remove="forget" @option="setOption" @custom="addOwn" />`
</script>

<template>
  <DemoSection title="Open picker" note="A 520 px sheet, full height on a phone. Search, three filters (fits this machine on), eight groups in order, 44 px rows with a chevron detail, the chosen row's options, the your own forms (gguf, onnx hub repo, mlc url, endpoint), and one pink load at the foot." :code="code">
    <HbButton @click="open = true">open the picker</HbButton>
    <p v-if="said" class="hb-label" style="margin-top:8px">{{ said }}</p>
    <HbModelSheet
      v-model:open="open"
      v-model:chosen="chosen"
      :rows="rows"
      @load="(id) => load([id])"
      @remove="(id) => (said = `remove ${id}`)"
      @option="(_id, k, v) => (said = `${k} ${v}`)"
      @custom="(k) => (said = `add ${k}`)"
    />
  </DemoSection>
  <PropsTable
    :rows="[
      { prop: 'rows', type: 'ModelRow[]' },
      { prop: 'v-model:open', type: 'boolean' },
      { prop: 'v-model:chosen', type: 'string' },
      { prop: 'title', type: 'string', default: 'pick a model' },
      { prop: 'own', type: 'boolean', default: 'true' },
      { prop: 'filters', type: 'Partial<ModelFilters>' },
      { prop: '@choose @load @cancel @remove @option @custom', type: 'events' },
    ]"
  />
</template>
