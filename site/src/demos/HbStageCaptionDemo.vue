<script setup lang="ts">
import { ref } from 'vue'
import { HbSlider, HbStageCaption, HbStageOverlay } from '@hackbuild/ui'
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'
import { CHAR_NAME, ECHO, REPLY } from '../fixtures/stage'

const max = ref(320)
const code = `<HbStageOverlay>
  <canvas />
  <template #caption>
    <HbStageCaption :echo="'you: ' + heard" :line="reply" who="rook" :max-chars="320" />
  </template>
</HbStageOverlay>`
</script>

<template>
  <DemoSection title="Stage caption" note="The user's words as a small echo, the reply below it with the speaker. A long reply keeps its tail, cut at a word, so the newest words stay on the stage. Presses pass through to the scene." :code="code">
    <div class="demo-col">
      <HbStageOverlay>
        <div style="height: 280px" aria-hidden="true" />
        <template #caption><HbStageCaption :echo="ECHO" :line="REPLY" :who="CHAR_NAME" :max-chars="max" /></template>
      </HbStageOverlay>
      <HbSlider v-model="max" label="max chars" :min="40" :max="400" :step="10" />
    </div>
  </DemoSection>
  <PropsTable
    :rows="[
      { prop: 'echo', type: 'string', notes: 'what the user said' },
      { prop: 'line', type: 'string', notes: 'the reply as it streams' },
      { prop: 'who', type: 'string', notes: 'speaker over the line' },
      { prop: 'maxChars', type: 'number', default: '320', notes: '0 keeps the whole line' },
    ]"
  />
</template>
