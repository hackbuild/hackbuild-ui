<script setup lang="ts">
import { ref } from 'vue'
import { HbInput, HbTranscript, HbToggleRow, type HbTranscriptSegment } from '@hackbuild/ui'
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'
import { dropped, segments as fixture } from '../fixtures/transcript'

const now = ref(5.0)
const live: HbTranscriptSegment[] = [
  { start: 0, end: 1.8, text: 'pixel, sit.' },
  { start: 1.8, end: 3.6, text: 'good. now the red ball.' },
  { start: 3.6, end: 5.1, text: 'fetch it from the', partial: true },
]
const segs = ref<HbTranscriptSegment[]>(fixture.map((s) => ({ ...s })))
const showDropped = ref(true)
const query = ref('')
function edit(i: number, patch: { text?: string; speaker?: string }) {
  segs.value = segs.value.map((s, k) => (k === i ? { ...s, ...patch, edited: true } : s))
}
const code = `<HbTranscript :segments="doc.segments" :dropped="doc.dropped" :show-dropped="showDropped"
  :query="query" :now="time" follow seekable editable time-format="clock"
  @seek="time = $event" @edit="(i, patch) => applyEdit(i, patch)" />`
</script>

<template>
  <DemoSection title="Transcript" note="Timed segments. The one under the playhead is marked, a partial one may still change. Dropped lines are counted, and when shown sit in time order, struck through with their reason. Search keeps the lines that hold the words. Editable rows take a speaker and the text in place: Enter saves, Escape backs out." :code="code">
    <div class="demo-col">
      <div class="demo-row">
        <HbToggleRow v-model="showDropped" label="show dropped lines" />
        <HbInput v-model="query" placeholder="search" aria-label="search the transcript" />
      </div>
      <HbTranscript :segments="segs" :dropped="dropped" :show-dropped="showDropped" :query="query" :now="now" follow seekable editable time-format="clock" @seek="now = $event" @edit="edit" />
      <HbTranscript :segments="live" :now="2.4" seekable />
      <HbTranscript :segments="[]" />
    </div>
  </DemoSection>
  <PropsTable
    :rows="[
      { prop: 'segments', type: '{start, end, text, partial?, speaker?, confidence?, words?, edited?}[]', notes: 'seconds' },
      { prop: 'dropped', type: '{start, end, text, why}[]', default: '[]' },
      { prop: 'showDropped', type: 'boolean', default: 'false' },
      { prop: 'query', type: 'string', default: `''` },
      { prop: 'now', type: 'number | null', default: 'null' },
      { prop: 'follow', type: 'boolean', default: 'false', notes: 'keeps the marked row in view' },
      { prop: 'seekable', type: 'boolean', default: 'false' },
      { prop: 'editable', type: 'boolean', default: 'false' },
      { prop: 'timeFormat', type: 'range | clock | seconds', default: 'range' },
      { prop: 'label / empty', type: 'string' },
      { prop: '@seek', type: '(seconds: number)' },
      { prop: '@edit', type: '(index, {text?, speaker?})' },
    ]"
  />
</template>
