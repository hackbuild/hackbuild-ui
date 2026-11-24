<script setup lang="ts">
import { computed } from 'vue'
import HbSlider from './HbSlider.vue'
import { recallLine, recallRank, scoreText, type RecallHit, type RecallWeights } from '../vanilla/memory'

export type HbRecallHit = RecallHit

export interface Props {
  hits: HbRecallHit[]
  /** What was searched for. */
  query?: string
  /** Who recalled: the character name, right of the head. */
  who?: string
  /** How candidates were scored, one sentence. */
  how?: string
  /** Count the best this many as used. Without it each hit's `used` holds. */
  top?: number
  /** Show a slider per weight; moving one redraws the order. */
  tunable?: boolean
  /** Short names for the part keys: { rel: 'relevance' }. */
  names?: Record<string, string>
}

const props = withDefaults(defineProps<Props>(), {
  query: '',
  who: '',
  how: '',
  top: undefined,
  tunable: false,
  names: () => ({}),
})

/** Weight per part key. Null: the store's own score orders the hits. */
const weights = defineModel<RecallWeights | null>('weights', { default: null })

const ranked = computed(() => recallRank(props.hits, weights.value, props.top))
const used = computed(() => ranked.value.filter((h) => h.used).length)
const keys = computed(() => Object.keys(weights.value ?? {}))

function setWeight(key: string, value: number) {
  weights.value = { ...(weights.value ?? {}), [key]: value }
}
const pct = (v: number) => Math.max(0, Math.min(1, v))
</script>

<template>
  <!-- Every candidate with its parts as bars, used or dimmed, so a reader
       sees why a memory won and what lost. -->
  <section class="hb-recall" aria-label="recall trace">
    <div class="hb-recall-hd"><span>last recall</span><span v-if="props.who" class="hb-hd-aux">{{ props.who }}</span></div>
    <p v-if="props.query" class="hb-recall-q"><span class="hb-label">query</span> {{ props.query }}</p>
    <p class="hb-recall-line">{{ recallLine(ranked.length, used) + (props.how ? ' ' + props.how : '') }}</p>
    <div v-if="props.tunable && keys.length" class="hb-recall-weights">
      <HbSlider
        v-for="k in keys"
        :key="k"
        :label="props.names[k] ?? k"
        :model-value="weights?.[k] ?? 1"
        :min="0"
        :max="2"
        :step="0.05"
        :format="(v: number) => v.toFixed(2)"
        @update:model-value="setWeight(k, $event)"
      />
    </div>
    <p v-if="!ranked.length" class="hb-recall-empty">run a turn to see what was recalled.</p>
    <ol v-else class="hb-recall-list">
      <li v-for="(h, i) in ranked" :key="i" class="hb-recall-hit" :class="{ 'is-used': h.used }">
        <div class="hb-recall-top">
          <span v-if="h.kind" class="hb-recall-kind">{{ h.kind }}</span>
          <span class="hb-recall-mark">{{ h.used ? 'used' : 'not used' }}<template v-if="h.when">, {{ h.when }}</template></span>
        </div>
        <p class="hb-recall-text">{{ h.text }}</p>
        <div class="hb-recall-bars">
          <template v-for="p in h.parts" :key="p.key">
            <span class="hb-recall-k">{{ props.names[p.key] ?? p.key }}</span>
            <span class="hb-recall-bar"><i :style="{ '--hb-v': pct(p.value) }" /></span>
            <span class="hb-recall-v">{{ scoreText(p.value) }}</span>
          </template>
          <span class="hb-recall-k is-final">final</span>
          <span class="hb-recall-bar is-final"><i :style="{ '--hb-v': pct(h.final) }" /></span>
          <span class="hb-recall-v is-final">{{ scoreText(h.final) }}</span>
        </div>
      </li>
    </ol>
  </section>
</template>
