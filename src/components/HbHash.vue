<script setup lang="ts">
import { computed } from 'vue'
import HbVerdict, { type HbVerdictStatus } from './HbVerdict.vue'

interface Props {
  /** The SHA-256 of the bytes, lowercase hex, or empty before it is known. */
  hex?: string
  /** The known SHA-256 for this file, or empty when there is none. */
  expected?: string
  /** Hashing now. */
  checking?: boolean
}

const props = withDefaults(defineProps<Props>(), { hex: '', expected: '', checking: false })

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
    <HbVerdict :status="verdict.status" :text="verdict.text" />
  </span>
</template>
