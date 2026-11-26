<script setup lang="ts">
import { HbMemoryInspector, type HbInspectRecall } from '@hackbuild/ui'
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'

const recall: HbInspectRecall = {
  query: 'where did the dog sleep',
  mode: 'hybrid',
  rows: [
    { rank: 1, kind: 'event', text: 'the dog slept under the bench by the door after the walk', score: '0.842', used: true, parts: { bm25: '#1 3.120', cosine: '#2 0.611', rrf: '0.033' } },
    { rank: 2, kind: 'fact', text: 'the dog has a blanket in the kitchen', score: '0.701', used: true, parts: { bm25: '#3 1.904', cosine: '#1 0.702', rrf: '0.032' } },
    { rank: 3, kind: 'event', text: 'it rained in the yard on tuesday and the ball stayed outside overnight', score: '0.412', used: false, parts: { bm25: 'none', cosine: '#3 0.388', rrf: '0.016' } },
  ],
}
const code = `<HbMemoryInspector :recall="{ query, mode, rows: [{ rank, kind, text, score, used, parts }] }" />`
</script>

<template>
  <DemoSection title="Memory inspector" note="What a recall found, best first, sized for the 380 px rack: rank, kind and score on one line, the text under it, used or left out. The scorer parts wait behind why. Rows are display text; a view builds them from its store." :code="code">
    <div style="max-width: 380px; display: flex; flex-direction: column; gap: 16px">
      <HbMemoryInspector :recall="recall" />
      <HbMemoryInspector :recall="null" />
    </div>
    <p class="hb-fixture"><b>fixture</b> the recall and its scores are made up.</p>
  </DemoSection>
  <PropsTable
    :rows="[
      { prop: 'recall', type: '{ query, mode?, rows } | null', notes: 'rows: { rank, kind, text, score, used, parts? }' },
      { prop: 'empty', type: 'string', notes: 'shown before any recall' },
    ]"
  />
</template>
