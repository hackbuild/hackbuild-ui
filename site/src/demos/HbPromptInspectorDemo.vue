<script setup lang="ts">
import { HbPromptInspector } from '@hackbuild/ui'
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'
import { COST, COUNTERS, PLAN, PROMPT, REPLY } from '../fixtures/agent'

const code = `<HbPromptInspector :prompt="messages" :reply="raw" :plan="plan"
  :cost="{ in: 812, out: 41, ms: 1930 }" :counters="[['model calls', 4]]" />`
</script>

<template>
  <DemoSection title="Prompt inspector" note="Exactly what the model saw and answered, with the cost beside it: the last call's tokens and time and the session counters, the last plan, and the full context with the raw reply after >>>. One tab from the chat." :code="code">
    <div class="demo-grid">
      <HbPromptInspector :prompt="PROMPT" :reply="REPLY" :plan="PLAN" :cost="COST" :counters="COUNTERS" />
      <HbPromptInspector />
    </div>
  </DemoSection>
  <PropsTable
    :rows="[
      { prop: 'prompt', type: 'string | { role, content }[]' },
      { prop: 'reply', type: 'string', notes: 'raw, before parsing' },
      { prop: 'plan', type: 'unknown', notes: 'shown as one line of JSON' },
      { prop: 'cost', type: '{ in?, out?, ms? }', notes: 'tokens and ms' },
      { prop: 'counters', type: '[label, value][]', notes: 'model calls, reflex, cache hits' },
    ]"
  />
</template>
