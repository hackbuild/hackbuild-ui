<script setup lang="ts">
import { computed } from 'vue'
import { contextUse, type ContextSegment } from '../vanilla/chat'
import HbCallout from './HbCallout.vue'

interface Props {
  /** What fills the context this turn: instructions, memory, recent turns. */
  segments: ContextSegment[]
  /** The model's context window in tokens. */
  budget: number
  /** One pill for a header: 'ctx 37%'. */
  pill?: boolean
  warnAt?: number
  fullAt?: number
  /** Show the full banner with its two fixes. */
  banner?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  pill: false,
  warnAt: 0.75,
  fullAt: 0.95,
  banner: true,
})

const emit = defineEmits<{ new: []; trim: [] }>()

const use = computed(() => contextUse(props.segments, props.budget, props.warnAt, props.fullAt))
const pct = computed(() => Math.round((use.value.used / use.value.budget) * 100))
</script>

<template>
  <span v-if="props.pill" class="hb-ctxmeter-pill" :class="`is-${use.tone}`" :title="use.words">ctx {{ pct }}%</span>
  <div v-else class="hb-ctxmeter" :class="`is-${use.tone}`">
    <div class="hb-ctxmeter-hd"><span class="hb-ctxmeter-label">context</span><span class="hb-ctxmeter-words">{{ use.words }}</span></div>
    <div class="hb-ctxmeter-bar" role="meter" aria-label="context used" aria-valuemin="0" :aria-valuemax="use.budget" :aria-valuenow="use.used" :aria-valuetext="use.words">
      <i v-for="(r, n) in use.rows" :key="r.key" :class="`hb-ctxmeter-p${n % 6}`" :style="{ width: Math.min(100, r.fraction * 100) + '%' }" />
    </div>
    <ul class="hb-ctxmeter-legend">
      <li v-for="(r, n) in use.rows" :key="r.key"><i :class="`hb-ctxmeter-p${n % 6}`" aria-hidden="true" />{{ r.label }} <b>{{ r.tokens.toLocaleString('en-US') }}</b></li>
    </ul>
    <HbCallout v-if="props.banner && use.tone === 'full'" variant="warn" title="context full" class="hb-ctxmeter-banner">
      <slot name="full">the context is full. start a new chat, or drop the oldest turns.</slot>
      <template #actions>
        <button type="button" class="hb-btn hb-btn-sm" @click="emit('new')">new chat</button>
        <button type="button" class="hb-btn hb-btn-2 hb-btn-sm" @click="emit('trim')">drop oldest turns</button>
      </template>
    </HbCallout>
  </div>
</template>
