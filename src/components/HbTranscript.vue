<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { droppedLine, markParts, segTime, transcriptRows, type DroppedSeg, type TimeFormat, type TranscriptRow, type TranscriptSeg } from '../vanilla/transcript'

export type HbTranscriptSegment = TranscriptSeg
export type HbTranscriptDropped = DroppedSeg

interface Props {
  segments: HbTranscriptSegment[]
  /** Lines the filter dropped, each with its reason. Counted in the note; shown when `showDropped`. */
  dropped?: HbTranscriptDropped[]
  showDropped?: boolean
  /** Playback time in seconds: the segment under it is marked. */
  now?: number | null
  /** Keep the marked segment in view as `now` moves. */
  follow?: boolean
  /** Segments, or their time when editable, are buttons that emit seek. */
  seekable?: boolean
  /** Text and speaker are editable in place; emits edit. */
  editable?: boolean
  /** Shows only lines whose text or speaker holds it, the match marked. */
  query?: string
  /** range: '1.80 to 3.60'; clock: '00:01'; seconds: '1.80'. */
  timeFormat?: TimeFormat
  label?: string
  empty?: string
}

const props = withDefaults(defineProps<Props>(), {
  dropped: () => [], showDropped: false, now: null, follow: false, seekable: false, editable: false,
  query: '', timeFormat: 'range', label: 'transcript', empty: 'no speech found.',
})

const emit = defineEmits<{
  seek: [seconds: number]
  edit: [index: number, patch: { text?: string; speaker?: string }]
}>()

const root = ref<HTMLOListElement | null>(null)
const rows = computed(() => transcriptRows(props.segments, props.dropped, { showDropped: props.showDropped, query: props.query }))
const note = computed(() => droppedLine(props.dropped))
const isNow = (r: TranscriptRow) => !r.dropped && props.now !== null && props.now >= r.seg.start && props.now < r.seg.end
const key = (r: TranscriptRow) => `${r.dropped ? 'd' : 's'}${r.index}`
const emptyText = computed(() => (props.query.trim() && props.segments.length ? `no line holds "${props.query.trim()}".` : props.empty))

function commit(r: TranscriptRow, field: 'text' | 'speaker', e: Event) {
  const el = e.target as HTMLElement | HTMLInputElement
  const v = ('value' in el ? el.value : el.textContent ?? '').trim()
  if (v !== (r.seg[field] ?? '')) emit('edit', r.index, { [field]: v })
}
function textKey(r: TranscriptRow, e: KeyboardEvent) {
  const el = e.target as HTMLElement
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); el.blur() }
  else if (e.key === 'Escape') { el.textContent = r.seg.text; el.blur() }
}

watch(() => props.now, async () => {
  if (!props.follow) return
  await nextTick()
  const ol = root.value
  const row = ol?.querySelector<HTMLElement>('.hb-tseg.is-now')
  if (!ol || !row) return
  const top = row.offsetTop - ol.offsetTop
  if (top < ol.scrollTop || top + row.offsetHeight > ol.scrollTop + ol.clientHeight) ol.scrollTop = Math.max(0, top - ol.clientHeight / 3)
})
</script>

<template>
  <ol ref="root" class="hb-transcript" :class="{ 'is-edit': props.editable }" :aria-label="props.label">
    <li v-if="note" class="hb-tseg-note">{{ note }}</li>
    <li v-for="r in rows" :key="key(r)">
      <component
        :is="props.seekable && !props.editable ? 'button' : 'div'"
        :type="props.seekable && !props.editable ? 'button' : undefined"
        class="hb-tseg"
        :class="{ 'is-now': isNow(r), 'is-partial': r.seg.partial, 'is-dropped': r.dropped }"
        :aria-current="isNow(r) ? 'time' : undefined"
        @click="props.seekable && !props.editable && emit('seek', r.seg.start)"
      >
        <button v-if="props.seekable && props.editable" type="button" class="hb-tseg-t" :aria-label="`play from ${segTime(r.seg, 'clock')}`" @click="emit('seek', r.seg.start)">{{ segTime(r.seg, props.timeFormat) }}</button>
        <span v-else class="hb-tseg-t">{{ segTime(r.seg, props.timeFormat) }}</span>
        <span class="hb-tseg-body">
          <input
            v-if="props.editable && !r.dropped"
            class="hb-tseg-who"
            :value="r.seg.speaker ?? ''"
            placeholder="speaker"
            :aria-label="`speaker at ${segTime(r.seg, 'clock')}`"
            @change="commit(r, 'speaker', $event)"
          >
          <span v-else-if="r.seg.speaker" class="hb-tseg-who">{{ r.seg.speaker }}</span>
          <span
            v-if="props.editable && !r.dropped"
            :key="r.seg.text"
            class="hb-tseg-text"
            contenteditable="true"
            role="textbox"
            :aria-label="`text at ${segTime(r.seg, 'clock')}`"
            @blur="commit(r, 'text', $event)"
            @keydown="textKey(r, $event)"
          >{{ r.seg.text }}</span>
          <span v-else class="hb-tseg-text"><template v-for="(p, j) in markParts(r.seg.text, props.query)" :key="j"><mark v-if="p.hit" class="hb-tseg-hit">{{ p.text }}</mark><template v-else>{{ p.text }}</template></template></span>
          <span v-if="r.dropped" class="hb-tseg-why">[{{ r.why }}]</span>
          <span v-else-if="r.seg.edited" class="hb-tseg-why">edited</span>
        </span>
      </component>
    </li>
    <li v-if="!rows.length"><div class="hb-tseg"><span class="hb-tseg-t">--</span><span class="hb-tseg-text">{{ emptyText }}</span></div></li>
  </ol>
</template>
