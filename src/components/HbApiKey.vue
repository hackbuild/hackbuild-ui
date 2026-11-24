<script setup lang="ts">
import { computed, watch } from 'vue'
import { uid } from '../utils/uid'
import { keyCheck, KEY_NOTE } from '../vanilla/keys'

interface Props {
  label?: string
  /** The shape a key must match: /^sk-ant-/ for anthropic. Empty: 8 or more characters. */
  pattern?: RegExp | string | null
  placeholder?: string
  /** Where the key goes and that it is not stored. */
  note?: string
}

const props = withDefaults(defineProps<Props>(), {
  label: 'api key',
  pattern: null,
  placeholder: 'paste your key',
  note: KEY_NOTE,
})

/** The key. Held by the parent in memory; this part never writes it anywhere. */
const key = defineModel<string>({ default: '' })
/** True when the key matches the pattern. */
const valid = defineModel<boolean>('valid', { default: false })

const id = uid('hb-key')
const check = computed(() => keyCheck(key.value, props.pattern))
watch(() => check.value.valid, (v) => { valid.value = v }, { immediate: true })
</script>

<template>
  <div class="hb-apikey" :class="`is-${check.state}`">
    <label class="hb-label" :for="id">{{ props.label }}</label>
    <div class="hb-apikey-row">
      <input
        :id="id"
        v-model="key"
        class="hb-input"
        :class="{ 'is-invalid': check.state === 'waiting' }"
        type="password"
        autocomplete="off"
        spellcheck="false"
        autocapitalize="off"
        :placeholder="props.placeholder"
        :aria-invalid="check.state === 'waiting'"
        :aria-describedby="`${id}-note ${id}-state`"
      >
      <span v-if="check.masked" class="hb-apikey-mask" aria-label="key as stored in memory">{{ check.masked }}</span>
    </div>
    <span :id="`${id}-state`" class="hb-apikey-state" aria-live="polite">{{ check.words }}</span>
    <span :id="`${id}-note`" class="hb-apikey-note">{{ props.note }}</span>
  </div>
</template>
