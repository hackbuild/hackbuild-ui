<script setup lang="ts">
import { ref } from 'vue'
import { HbRecallTrace, type HbRecallHit } from '@hackbuild/ui'
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'

const weights = ref<Record<string, number> | null>({ rel: 1, rec: 0.5, imp: 0.5 })
const hits: HbRecallHit[] = [
  { kind: 'fact', when: '3d ago', text: 'pixel likes the red ball.', parts: [{ key: 'rel', value: 0.91 }, { key: 'rec', value: 0.2 }, { key: 'imp', value: 0.6 }] },
  { kind: 'episode', when: '2m ago', text: 'threw the blue ball twice, pixel ignored it.', parts: [{ key: 'rel', value: 0.55 }, { key: 'rec', value: 0.98 }, { key: 'imp', value: 0.3 }] },
  { kind: 'rule', when: '9d ago', text: 'never throw toward the stairs.', parts: [{ key: 'rel', value: 0.22 }, { key: 'rec', value: 0.05 }, { key: 'imp', value: 0.95 }] },
  { kind: 'gist', when: '1d ago', text: 'mornings are for walks.', parts: [{ key: 'rel', value: 0.12 }, { key: 'rec', value: 0.5 }, { key: 'imp', value: 0.2 }] },
]
const code = `<HbRecallTrace :hits="trace.hits" :query="trace.query" who="pixel" :top="2"
  v-model:weights="weights" tunable :names="{ rel: 'rel', rec: 'rec', imp: 'imp' }" />`
</script>

<template>
  <DemoSection title="Recall trace" note="Every candidate with a bar per part and the final, used ones lit and the rest dimmed. Move a weight and the order redraws." :code="code">
    <div style="max-width: 560px">
      <HbRecallTrace v-model:weights="weights" :hits="hits" query="which ball should i throw" who="pixel" :top="2" how="weighted mean of relevance, recency, importance." tunable />
    </div>
  </DemoSection>
  <PropsTable
    :rows="[
      { prop: 'hits', type: '{text, kind?, when?, score?, parts[] {key, value}, used?}[]' },
      { prop: 'v-model:weights', type: 'Record<string, number> | null', notes: 'null keeps the store score' },
      { prop: 'top', type: 'number', notes: 'count the best n as used' },
      { prop: 'query / who / how', type: 'string' },
      { prop: 'tunable', type: 'boolean' },
      { prop: 'names', type: 'Record<string, string>' },
    ]"
  />
</template>
