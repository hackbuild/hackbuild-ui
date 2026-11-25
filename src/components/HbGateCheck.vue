<script setup lang="ts">
import { computed } from 'vue'
import { gateCheckView, type GateCheckState } from '../vanilla/layout'

interface Props {
  /** The part being readied: thinking, voice, memory, body. */
  label: string
  /** 0 to 1. */
  value?: number
  /** wait, load (pink fill), ok, err. */
  state?: GateCheckState
  /** The words at the right: waiting, 40%, ready, the failure. */
  note?: string
}

const props = withDefaults(defineProps<Props>(), { value: 0, state: 'wait', note: '' })
const view = computed(() => gateCheckView(props.state, props.value, props.note))
const pct = computed(() => view.value.pct)
const words = computed(() => view.value.words)
</script>

<template>
  <!-- One part on a gate card (ferrule's checks): VT323 label, a thin
       bar, the note. Per part progress lives here, not on the page. -->
  <div class="hb-gatecheck" :class="`is-${props.state}`">
    <b>{{ props.label }}</b>
    <div class="hb-gatecheck-bar" role="progressbar" :aria-label="props.label" aria-valuemin="0" aria-valuemax="100" :aria-valuenow="pct"><i :style="{ width: `${pct}%` }" /></div>
    <span class="hb-gatecheck-note">{{ words }}</span>
  </div>
</template>
