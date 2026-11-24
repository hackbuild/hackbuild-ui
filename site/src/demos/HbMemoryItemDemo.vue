<script setup lang="ts">
import { ref } from 'vue'
import { HbMemoryItem } from '@hackbuild/ui'
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'

const text = ref('the dog is called pixel and likes the red ball.')
const gone = ref(false)
const pinned = ref(true)
const code = `<HbMemoryItem kind="rule" :score="1.03" text="answer in two sentences." />
<HbMemoryItem kind="note" title="dog" :text="text" entity="pixel" when="nov 4 added" @edit="text = $event" @forget="remove" />
<HbMemoryItem kind="rule" text="..." :pinned="pinned" @pin="pinned = $event" />`
</script>

<template>
  <DemoSection title="Memory item" note="Kind chip with the recall score, optional title, text, entity chips. Edit in place (ctrl Enter saves, Escape backs out); forget asks once." :code="code">
    <div class="demo-col" style="max-width: 520px">
      <HbMemoryItem kind="rule" :score="1.03" text="answer in two sentences unless asked for more." used />
      <HbMemoryItem v-if="!gone" kind="note" title="dog" :text="text" entity="pixel" when="nov 4 added" @edit="text = $event" @forget="gone = true" />
      <HbMemoryItem kind="rule" text="always answer in lowercase." :pinned="pinned" when="kept in every prompt" @pin="pinned = $event" />
      <HbMemoryItem kind="episode" text="shared character: this memory is read only." :entity="['bail', 'relief']" readonly />
    </div>
  </DemoSection>
  <PropsTable
    :rows="[
      { prop: 'text / kind', type: 'string' },
      { prop: 'title', type: 'string' },
      { prop: 'entity', type: 'string | string[]' },
      { prop: 'score', type: 'number | null' },
      { prop: 'when', type: 'string' },
      { prop: 'used / readonly / pinned', type: 'boolean' },
      { prop: 'emits', type: 'edit, forget, pin (next pinned state)' },
    ]"
  />
</template>
