<script setup lang="ts">
import { computed } from 'vue'
import HbVerdict, { type HbVerdictStatus } from './HbVerdict.vue'
import HbIcon from './HbIcon.vue'
import { useCopy } from '../composables/useCopy'
import { noteOnce } from '../utils/note'

noteOnce('HbHash', 'HbHash is merged since 0.10.0 and goes in 0.11.0; use HbModelSheet row detail')

export interface Props {
  /** The SHA-256 of the bytes, lowercase hex, or empty before it is known. */
  hex?: string
  /** The known SHA-256 for this file, or empty when there is none. */
  expected?: string
  /** Hashing now. */
  checking?: boolean
  /** A copy mark after the hex once it is known. */
  copy?: boolean
}

const props = withDefaults(defineProps<Props>(), { hex: '', expected: '', checking: false, copy: false })
const { state: copyState, copy: copyHex } = useCopy()
const copyWords = computed(() => (copyState.value === 'copied' ? 'copied' : copyState.value === 'failed' ? 'copy failed' : 'copy hash'))

const verdict = computed<{ status: HbVerdictStatus; text: string }>(() => {
  if (props.checking) return { status: 'running', text: 'hashing' }
  if (!props.hex) return { status: 'not run', text: 'not hashed' }
  if (!props.expected) return { status: 'warn', text: 'no known hash' }
  return props.hex.toLowerCase() === props.expected.toLowerCase()
    ? { status: 'pass', text: 'matches' }
    : { status: 'fail', text: 'does not match' }
})
</script>

<template>
  <span class="hb-hash">
    <span class="hb-hash-hex" :title="props.hex || undefined">{{ props.hex || (props.expected ? `known ${props.expected}` : 'sha-256 unknown') }}</span>
    <button
      v-if="props.copy && props.hex"
      type="button"
      class="hb-copymark"
      :class="`is-${copyState}`"
      :aria-label="copyWords"
      :title="copyWords"
      @click="copyHex(props.hex)"
    ><HbIcon :name="copyState === 'copied' ? 'check' : copyState === 'failed' ? 'x' : 'copy'" :size="12" /></button>
    <HbVerdict :status="verdict.status" :text="verdict.text" />
  </span>
</template>
