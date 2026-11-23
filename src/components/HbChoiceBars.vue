<script setup lang="ts">
import { computed, watch } from 'vue'
import { useLiveAnnounce } from '../composables/useLiveAnnounce'

export interface HbChoiceOption {
  id: string
  /** Defaults to the id. */
  label?: string
  /** Raw utility, before commitment. */
  score: number
  /** Commitment or hysteresis bonus the current option gets for staying. Hatched. */
  bonus?: number
  /** A struck part: repetition penalty taken off the score. */
  penalty?: number
  /** Chance it is picked, 0 to 1. */
  prob?: number
  /** The option the agent took. Outlined, the one pink bar. */
  chosen?: boolean
  /** Top scoring; computed when no option says. */
  top?: boolean
}

interface Props {
  options: HbChoiceOption[]
  /** Show at most this many after sorting; 0 shows all. */
  limit?: number
  sort?: 'score' | 'none'
  /** The reason in words: 'play drive 0.51, ball in view'. */
  why?: string
  /** The dials: 'temperature 0.06, commitment 0.12 x 1.11, next look in 3.4 s'. */
  meta?: string
  /** Accessible name of the list. */
  label?: string
  /** Bar scale; defaults to the largest score plus bonus plus penalty. */
  max?: number
  /** Chosen bar in ink: another pink owns the view. */
  quiet?: boolean
  /** Show the key under the bars. */
  legend?: boolean
  /** Announce a new choice and its reason in a polite live region. */
  announce?: boolean
  announceGap?: number
  digits?: number
}

const props = withDefaults(defineProps<Props>(), {
  limit: 0,
  sort: 'score',
  why: '',
  meta: '',
  label: 'options weighed',
  quiet: false,
  legend: true,
  announce: true,
  announceGap: 4000,
  digits: 2,
})

const live = useLiveAnnounce(props.announceGap)

const scale = computed(() => {
  if (props.max && props.max > 0) return props.max
  const m = Math.max(0, ...props.options.map((o) => Math.max(0, o.score) + (o.bonus ?? 0) + (o.penalty ?? 0)))
  return m > 0 ? m : 1
})
const topId = computed(() => {
  const marked = props.options.find((o) => o.top)
  if (marked) return marked.id
  let best: HbChoiceOption | undefined
  for (const o of props.options) if (!best || o.score > best.score) best = o
  return best?.id
})
const rows = computed(() => {
  let list = [...props.options]
  if (props.sort === 'score') list.sort((a, b) => b.score + (b.bonus ?? 0) - (a.score + (a.bonus ?? 0)))
  if (props.limit > 0) {
    const cut = list.slice(0, props.limit)
    const chosen = list.find((o) => o.chosen)
    if (chosen && !cut.includes(chosen)) cut[cut.length - 1] = chosen
    list = cut
  }
  const pct = (v: number) => `${Math.max(0, Math.min(100, (v / scale.value) * 100)).toFixed(2)}%`
  return list.map((o) => {
    const name = o.label ?? o.id
    const top = o.id === topId.value
    const zero = o.score <= 0 && (o.prob ?? 0) < 0.005
    const prob = o.prob === undefined ? '' : `${Math.round(o.prob * 100)}%`
    let words = `${name}, score ${o.score.toFixed(props.digits)}`
    if (o.prob !== undefined) words += `, chance ${Math.round(o.prob * 100)} percent`
    if (o.bonus) words += `, commitment bonus ${o.bonus.toFixed(props.digits)}`
    if (o.penalty) words += `, repeat penalty ${o.penalty.toFixed(props.digits)}`
    if (top) words += ', top score'
    if (o.chosen) words += ', chosen'
    return {
      o, name, top, zero, prob, words,
      base: pct(Math.max(0, o.score)),
      bonus: o.bonus ? pct(o.bonus) : '',
      penalty: o.penalty ? pct(o.penalty) : '',
    }
  })
})
const chosen = computed(() => props.options.find((o) => o.chosen))

watch(() => chosen.value?.id, (id, before) => {
  if (!props.announce || !id || before === undefined) return
  const c = chosen.value!
  live.say(`chose ${c.label ?? c.id}.${props.why ? ' ' + props.why : ''}`)
})
</script>

<template>
  <div class="hb-choice" :class="{ 'is-quiet': props.quiet }">
    <p v-if="props.why" class="hb-choice-why">{{ props.why }}</p>
    <ol class="hb-choice-list" :aria-label="props.label">
      <li v-for="r in rows" :key="r.o.id" class="hb-opt" :class="{ 'is-chosen': r.o.chosen, 'is-top': r.top, 'is-zero': r.zero }">
        <span class="hb-sr">{{ r.words }}</span>
        <span class="hb-opt-label" aria-hidden="true">{{ r.name }}</span>
        <span class="hb-opt-bar" aria-hidden="true">
          <i class="hb-opt-base" :style="{ width: r.base }" />
          <i v-if="r.bonus" class="hb-opt-bonus" :style="{ width: r.bonus }" />
          <i v-if="r.penalty" class="hb-opt-penalty" :style="{ width: r.penalty }" />
        </span>
        <span class="hb-opt-score" aria-hidden="true">{{ r.o.score.toFixed(props.digits) }}</span>
        <span class="hb-opt-prob" aria-hidden="true">{{ r.prob }}</span>
      </li>
    </ol>
    <p v-if="props.legend" class="hb-choice-key" aria-hidden="true">
      <span><i class="hb-opt-base" />score</span>
      <span><i class="hb-opt-bonus" />commitment</span>
      <span><i class="hb-opt-penalty" />repeat penalty</span>
      <span>* chosen</span>
      <span>% chance</span>
    </p>
    <p v-if="props.meta" class="hb-choice-meta">{{ props.meta }}</p>
    <p v-if="props.announce" class="hb-sr" role="status" aria-live="polite">{{ live.text.value }}</p>
  </div>
</template>
