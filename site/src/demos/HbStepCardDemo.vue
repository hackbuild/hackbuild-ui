<script setup lang="ts">
import { HbStepCard } from '@hackbuild/ui'
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'
import { STEPS } from '../fixtures/agent'

const code = `<HbStepCard :n="3" title="grab(mug)" :thumb="frame" :text="streamed"
  :thought="thought" :result="result" :ms="1930" state="fail" />`
</script>

<template>
  <DemoSection title="Step card" note="One decision of an agent loop tied to its input: the exact frame the model saw beside the streamed text, the thought, and what came of it. The left edge says the state; a thinking step streams. Thought and result clip at a word." :code="code">
    <div class="demo-col" style="max-width: 520px">
      <HbStepCard v-for="s in STEPS" :key="s.n" v-bind="s" />
    </div>
  </DemoSection>
  <PropsTable
    :rows="[
      { prop: 'n', type: 'number', default: '1', notes: 'step 01' },
      { prop: 'title', type: 'string', notes: 'the action chip' },
      { prop: 'thumb', type: 'string', notes: 'the frame, as a URL; or the thumb slot' },
      { prop: 'text', type: 'string', notes: 'streamed reply' },
      { prop: 'thought', type: 'string' },
      { prop: 'result', type: 'string' },
      { prop: 'ms', type: 'number', notes: 'the call time' },
      { prop: 'state', type: `'thinking' | 'ok' | 'fail' | 'done'`, default: 'ok' },
      { prop: 'clip', type: 'number', default: '240', notes: 'characters; 0 keeps all' },
    ]"
  />
</template>
