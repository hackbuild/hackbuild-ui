<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { eventLog, kindOf, EVENT_KINDS, type EventKind, type EventLogHandle } from '../vanilla/log'

export interface HbEventRow {
  id: string | number
  /** you, me, act, fail, warn, sense, note, think, load, or one of `kinds`. */
  kind: string
  text: string
  /** Time prefix, 24 hour: '14:02:11'. */
  t?: string
  /** A row that is replaced in place: a download, a thinking line. */
  live?: boolean
  /** 0 to 1 draws the bar on a live row; leave it out when the total is unknown. */
  fraction?: number
}

interface Props {
  rows: HbEventRow[]
  /** Tag and tone per kind, over the defaults. */
  kinds?: Record<string, EventKind>
  /** Heading of the log. */
  label?: string
  /** Rows kept, newest last. */
  max?: number
  /** Kind filter chips. */
  filters?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  kinds: () => ({}),
  label: 'log',
  max: 160,
  filters: true,
})

/** Stay on the newest row. Scrolling up turns it off. */
const follow = defineModel<boolean>('follow', { default: true })

const map = computed(() => ({ ...EVENT_KINDS, ...props.kinds }))
const kept = computed(() => {
  const done = props.rows.filter((r) => !r.live)
  const live = props.rows.filter((r) => r.live)
  return [...done.slice(-props.max), ...live]
})
const kindList = computed(() => [...new Set(props.rows.map((r) => r.kind))])
const hidden = ref<string[]>([])
const shown = computed(() => kept.value.filter((r) => !hidden.value.includes(r.kind)))
const unseen = ref(0)

function flip(kind: string) {
  hidden.value = hidden.value.includes(kind) ? hidden.value.filter((k) => k !== kind) : [...hidden.value, kind]
}
const look = (r: HbEventRow) => kindOf(map.value, r.kind)
const pct = (f: number) => `${Math.round(Math.max(0, Math.min(1, f)) * 100)}%`

const el = ref<HTMLElement | null>(null)
let handle: EventLogHandle | null = null
onMounted(() => {
  if (!el.value) return
  handle = eventLog(el.value, {
    max: Infinity,
    follow: follow.value,
    onFollow(on) {
      follow.value = on
      if (on) unseen.value = 0
    },
  })
  handle.sync()
})
watch(follow, (on) => { if (handle && handle.following !== on) handle.follow(on) })
watch(() => props.rows.length, (n, was) => {
  if (!follow.value && n > was) unseen.value += n - was
  nextTick(() => handle?.sync())
})
watch(hidden, () => nextTick(() => handle?.sync()))
onBeforeUnmount(() => handle?.dispose())

function jump() {
  follow.value = true
  unseen.value = 0
}
</script>

<template>
  <!-- One timeline for speech, actions, failures, perception and loads.
       Tag column, then the text; live rows are replaced in place. -->
  <section class="hb-evlog">
    <div class="hb-evlog-head">
      <span class="hb-evlog-label">{{ props.label }}</span>
      <span class="hb-evlog-count" aria-label="rows">{{ props.rows.filter((r) => !r.live).length }}</span>
      <span class="hb-spacer" />
      <slot name="actions" />
      <button
        type="button"
        class="hb-chip is-toggle hb-evlog-follow"
        :class="{ 'is-on': follow }"
        :aria-pressed="follow"
        title="keep the newest row in view"
        @click="follow = !follow"
      >follow</button>
    </div>
    <div v-if="props.filters && kindList.length > 1" class="hb-evlog-filters" role="group" :aria-label="`${props.label} kinds shown`">
      <button
        v-for="k in kindList"
        :key="k"
        type="button"
        class="hb-chip is-toggle"
        :class="{ 'is-on': !hidden.includes(k) }"
        :aria-pressed="!hidden.includes(k)"
        @click="flip(k)"
      >{{ kindOf(map, k).tag }}</button>
    </div>
    <div ref="el" class="hb-evlog-box">
      <div class="hb-evlog-rows" role="log" :aria-label="props.label" tabindex="0">
        <div
          v-for="r in shown"
          :key="r.id"
          class="hb-evlog-row"
          :class="[look(r).tone ? `is-${look(r).tone}` : '', { 'is-live': r.live }]"
          :data-kind="r.kind"
        >
          <b class="hb-evlog-tag">{{ look(r).tag }}</b>
          <span v-if="r.t" class="hb-evlog-t">{{ r.t }}</span>
          <span class="hb-evlog-text">{{ r.text }}</span>
          <span v-if="r.live && r.fraction !== undefined" class="hb-evlog-bar" role="progressbar" :aria-valuenow="Math.round(r.fraction * 100)" aria-valuemin="0" aria-valuemax="100"><i :style="{ width: pct(r.fraction) }" /></span>
        </div>
        <p v-if="!shown.length" class="hb-evlog-empty">nothing logged yet</p>
      </div>
      <button v-if="!follow && unseen" type="button" class="hb-btn hb-btn-sm hb-evlog-jump" @click="jump">{{ unseen }} new, jump down</button>
    </div>
  </section>
</template>
