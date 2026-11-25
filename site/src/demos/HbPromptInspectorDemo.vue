<script setup lang="ts">
import { HbPromptInspector } from '@hackbuild/ui'
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'
import { COST, COUNTERS, PLAN, PROMPT, REPLY, TOOLS } from '../fixtures/agent'

const code = `<HbPromptInspector :prompt="messages" :reply="raw" :plan="plan"
  :cost="{ in: 812, out: 41, ms: 1930 }" :counters="[['model calls', 4]]"
  :tools="[{ name: 'walk', args: ['target'], desc: 'walk to a thing' }]" />`
</script>

<template>
  <DemoSection title="Prompt inspector" note="Exactly what the model saw and answered, with the cost beside it: the last call's tokens and time and the session counters, the tools it sees as name(args) and one line, the last plan, and the full context with the raw reply after >>>. One tab from the chat." :code="code">
    <div class="demo-grid">
      <HbPromptInspector :prompt="PROMPT" :reply="REPLY" :plan="PLAN" :cost="COST" :counters="COUNTERS" :tools="TOOLS" />
      <HbPromptInspector :tools="[]" />
    </div>
  </DemoSection>
  <PropsTable
    :rows="[
      { prop: 'prompt', type: 'string | { role, content }[]' },
      { prop: 'reply', type: 'string', notes: 'raw, before parsing' },
      { prop: 'plan', type: 'unknown', notes: 'shown as one line of JSON' },
      { prop: 'cost', type: '{ in?, out?, ms? }', notes: 'tokens and ms' },
      { prop: 'counters', type: '[label, value][]', notes: 'model calls, reflex, cache hits' },
      { prop: 'tools', type: '({ name, desc?, args? } | string)[]', notes: 'left out: no card; empty: free text' },
    ]"
  />
</template>
