<script setup lang="ts">
import { ref } from 'vue'
import { HbTranscript, type HbTranscriptSegment } from '@hackbuild/ui'
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'

const now = ref(2.4)
const segments: HbTranscriptSegment[] = [
  { start: 0, end: 1.8, text: 'pixel, sit.' },
  { start: 1.8, end: 3.6, text: 'good. now the red ball.' },
  { start: 3.6, end: 5.1, text: 'fetch it from the', partial: true },
]
const code = `<HbTranscript :segments="segments" :now="now" seekable @seek="now = $event" />`
</script>

<template>
  <DemoSection title="Transcript" note="Timed segments. The one under the playhead is marked, a partial one may still change. seekable makes each a button." :code="code">
    <div class="demo-grid">
      <HbTranscript :segments="segments" :now="now" seekable @seek="now = $event" />
      <HbTranscript :segments="[]" />
    </div>
  </DemoSection>
  <PropsTable
    :rows="[
      { prop: 'segments', type: '{start, end, text, partial?}[]', notes: 'seconds' },
      { prop: 'now', type: 'number | null', default: 'null' },
      { prop: 'seekable', type: 'boolean', default: 'false' },
      { prop: 'label / empty', type: 'string' },
      { prop: '@seek', type: '(seconds: number)' },
    ]"
  />
</template>
