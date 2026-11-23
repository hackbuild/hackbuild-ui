<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useLiveAnnounce } from '../composables/useLiveAnnounce'
import { uid as makeUid } from '../utils/uid'

export interface HbSparkRow {
  /** Stable key; defaults to the label. */
  id?: string
  label: string
  /** Recent history, oldest first. */
  values: number[]
  /** The figure; defaults to the newest value. */
  value?: number
  /** Replaces the figure text. */
  display?: string
  /** A dashed rule at this value, where something fires. */
  threshold?: number
  /** Sample indexes where the agent switched what it does. */
  ticks?: number[]
  /** The one pink trace of the view. Leave it off when choice bars share the view. */
  current?: boolean
  /** Chip text; defaults to `over 0.70` past the threshold, else the trend word. */
  state?: string
}

interface Props {
  rows: HbSparkRow[]
  /** Accessible name of the list: 'dog drives'. */
  label?: string
  min?: number
  max?: number
  /** Seconds the history covers, for the words: 'rising over 2 minutes'. */
  window?: number
  /** Samples the trend word reads, newest last. */
  trendSamples?: number
  /** Rows are buttons that open a larger chart under them. */
  expandable?: boolean
  /** Announce threshold crossings in a polite live region. */
  announce?: boolean
  /** At most one announcement per this many ms. */
  announceGap?: number
  digits?: number
}

const props = withDefaults(defineProps<Props>(), {
  label: 'drives',
  min: 0,
  max: 1,
  window: 120,
  trendSamples: 60,
  expandable: true,
  announce: true,
  announceGap: 4000,
  digits: 2,
})

const emit = defineEmits<{ open: [id: string | null] }>()

const open = ref<string | null>(null)
const uid = makeUid('hb-spark')
const live = useLiveAnnounce(props.announceGap)

const W = 100
const H = 24
const BH = 40

function y(v: number, h: number) {
  const span = props.max - props.min || 1
  const f = Math.min(1, Math.max(0, (v - props.min) / span))
  return +(h - f * h).toFixed(2)
}
function points(values: number[], h: number) {
  const n = values.length
  if (n === 0) return ''
  if (n === 1) return `0,${y(values[0]!, h)} ${W},${y(values[0]!, h)}`
  return values.map((v, i) => `${+((i / (n - 1)) * W).toFixed(2)},${y(v, h)}`).join(' ')
}
function tickX(i: number, n: number) {
  return n > 1 ? +((i / (n - 1)) * W).toFixed(2) : 0
}
function span(seconds: number) {
  return seconds >= 90 ? `${Math.round(seconds / 60)} minutes` : `${Math.round(seconds)} s`
}
function trend(values: number[]) {
  const n = Math.min(values.length, props.trendSamples)
  if (n < 2) return 'steady'
  const a = values[values.length - n]!
  const b = values[values.length - 1]!
  const d = (b - a) / (props.max - props.min || 1)
  return d > 0.04 ? 'rising' : d < -0.04 ? 'falling' : 'steady'
}

interface View {
  key: string
  row: HbSparkRow
  value: number
  figure: string
  over: boolean
  chip: string
  words: string
  line: string
  big: string
  th: number | null
  bth: number | null
  ticks: number[]
}

const views = computed<View[]>(() =>
  props.rows.map((row) => {
    const value = row.value ?? row.values[row.values.length - 1] ?? 0
    const over = row.threshold !== undefined && value >= row.threshold
    const t = trend(row.values)
    const seconds = props.window * Math.min(1, Math.min(row.values.length, props.trendSamples) / Math.max(1, row.values.length))
    const chip = row.state ?? (over ? `over ${row.threshold!.toFixed(2)}` : t)
    const figure = row.display ?? value.toFixed(props.digits)
    const n = row.values.length
    let words = `${row.label} ${figure}, ${t} over ${span(seconds)}`
    if (row.threshold !== undefined) words += over ? `, over the ${row.threshold.toFixed(2)} mark` : `, under the ${row.threshold.toFixed(2)} mark`
    if (row.state) words += `, ${row.state}`
    return {
      key: row.id ?? row.label,
      row,
      value,
      figure,
      over,
      chip,
      words,
      line: points(row.values, H),
      big: points(row.values, BH),
      th: row.threshold === undefined ? null : y(row.threshold, H),
      bth: row.threshold === undefined ? null : y(row.threshold, BH),
      ticks: (row.ticks ?? []).filter((i) => i >= 0 && i < n).map((i) => tickX(i, n)),
    }
  }),
)

// threshold crossings, rate limited
const wasOver = new Map<string, boolean>()
watch(views, (list) => {
  for (const v of list) {
    const before = wasOver.get(v.key)
    wasOver.set(v.key, v.over)
    if (!props.announce || before === undefined || before === v.over || v.row.threshold === undefined) continue
    live.say(v.over ? `${v.row.label} over ${v.row.threshold.toFixed(2)}, now ${v.figure}` : `${v.row.label} back under ${v.row.threshold.toFixed(2)}`)
  }
}, { immediate: true })

function note(v: View) {
  const n = v.ticks.length
  return `${v.words}.` + (n ? ` ${n} ${n === 1 ? 'switch' : 'switches'} marked along the foot.` : '')
}

function toggle(key: string) {
  open.value = open.value === key ? null : key
  emit('open', open.value)
}
</script>

<template>
  <div class="hb-sparks-wrap">
    <ul class="hb-sparks" :aria-label="props.label">
      <li v-for="(v, i) in views" :key="v.key">
        <component
          :is="props.expandable ? 'button' : 'div'"
          :type="props.expandable ? 'button' : undefined"
          class="hb-spark"
          :class="{ 'is-cur': v.row.current, 'is-over': v.over }"
          :aria-expanded="props.expandable ? open === v.key : undefined"
          :aria-controls="props.expandable ? `${uid}-${i}` : undefined"
          @click="props.expandable && toggle(v.key)"
        >
          <span class="hb-sr">{{ v.words }}</span>
          <span class="hb-spark-label" aria-hidden="true">{{ v.row.label }}</span>
          <svg class="hb-spark-line" :viewBox="`0 0 ${W} ${H}`" preserveAspectRatio="none" aria-hidden="true" focusable="false">
            <line v-if="v.th !== null" class="hb-spark-th" x1="0" :x2="W" :y1="v.th" :y2="v.th" />
            <line v-for="(x, k) in v.ticks" :key="k" class="hb-spark-tick" :x1="x" :x2="x" :y1="H - 5" :y2="H" />
            <polyline class="hb-spark-trace" :points="v.line" />
          </svg>
          <span class="hb-spark-value" aria-hidden="true">{{ v.figure }}</span>
          <span class="hb-spark-chip" :class="{ 'is-hi': v.over, 'is-lo': !v.over && v.chip === 'steady' }" aria-hidden="true">{{ v.chip }}</span>
        </component>
        <div v-if="props.expandable" :id="`${uid}-${i}`" class="hb-spark-big" :hidden="open !== v.key">
          <template v-if="open === v.key">
            <svg :viewBox="`0 0 ${W} ${BH}`" preserveAspectRatio="none" role="img" :aria-label="v.words" focusable="false">
              <line v-if="v.bth !== null" class="hb-spark-th" x1="0" :x2="W" :y1="v.bth" :y2="v.bth" />
              <line v-for="(x, k) in v.ticks" :key="k" class="hb-spark-tick" :x1="x" :x2="x" :y1="0" :y2="BH" />
              <polyline class="hb-spark-trace" :points="v.big" />
            </svg>
            <div class="hb-spark-axis" aria-hidden="true"><span>{{ span(props.window) }} ago</span><span>now {{ v.figure }}</span></div>
            <p class="hb-spark-note">{{ note(v) }}</p>
          </template>
        </div>
      </li>
    </ul>
    <p v-if="props.announce" class="hb-sr" role="status" aria-live="polite">{{ live.text.value }}</p>
  </div>
</template>
