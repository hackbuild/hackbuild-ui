<script setup lang="ts">
import { HbChoiceBars, type HbChoiceOption } from '@hackbuild/ui'
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'

const options: HbChoiceOption[] = [
  { id: 'play', score: 0.51, bonus: 0.06, prob: 0.58, chosen: true },
  { id: 'chase', score: 0.48, prob: 0.31 },
  { id: 'sniff', score: 0.33, penalty: 0.08, prob: 0.08 },
  { id: 'rest', score: 0.12, prob: 0.03 },
]
const code = `<HbChoiceBars :options="options" why="play drive 0.51, ball in view"
  meta="temperature 0.06, commitment 0.12 x 1.11, next look in 3.4 s" legend />`
</script>

<template>
  <DemoSection title="Choice bars" note="Every option weighed, sorted by score. The commitment bonus is hatched, the repetition penalty struck. The chosen bar is the one pink bar; quiet puts it in ink." :code="code">
    <div class="demo-grid">
      <HbChoiceBars :options="options" why="play drive 0.51, ball in view" meta="temperature 0.06, commitment 0.12 x 1.11, next look in 3.4 s" legend :announce="false" />
      <HbChoiceBars :options="options" :limit="2" quiet :announce="false" />
    </div>
  </DemoSection>
  <PropsTable
    :rows="[
      { prop: 'options', type: '{id, label?, score, bonus?, penalty?, prob?, chosen?, top?}[]' },
      { prop: 'limit', type: 'number', default: '0', notes: '0 shows all' },
      { prop: 'sort', type: `'score' | 'none'`, default: 'score' },
      { prop: 'why / meta', type: 'string' },
      { prop: 'max', type: 'number', notes: 'default the largest total' },
      { prop: 'quiet / legend', type: 'boolean' },
      { prop: 'announce / announceGap', type: 'boolean / number' },
      { prop: 'digits', type: 'number' },
    ]"
  />
</template>
