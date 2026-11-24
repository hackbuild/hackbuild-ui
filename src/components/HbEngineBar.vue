<script setup lang="ts">
import { computed } from 'vue'
import { mbText } from '../vanilla/models'

export type HbEngineState = 'none' | 'stored' | 'downloading' | 'loading' | 'loaded' | 'fault'

interface Props {
  /** The model's label, or empty when none is picked. */
  model?: string
  state?: HbEngineState
  /** 'webgpu', 'cpu', 'your endpoint'. */
  device?: string
  /** Tokens a second from the last reply, or null. */
  rate?: number | null
  /** Tools sharing the loaded model: 'chat', 'room'. */
  sharedWith?: string[]
  /** Download size in MB, named on the load button. */
  sizeMB?: number | null
  /** 0 to 1 while downloading or loading, or null when unknown. */
  pct?: number | null
  /** The error, named, in the fault state. */
  error?: string
  label?: string
}

const props = withDefaults(defineProps<Props>(), {
  model: '',
  state: 'none',
  device: '',
  rate: null,
  sharedWith: () => [],
  sizeMB: null,
  pct: null,
  error: '',
  label: 'engine',
})

const emit = defineEmits<{ change: []; load: []; cancel: []; unload: [] }>()

const words = computed(() => {
  const m = props.model
  switch (props.state) {
    case 'none': return 'no model. pick one.'
    case 'stored': return `${m} stored. press load.`
    case 'downloading': return `downloading ${m}${props.pct === null ? '' : `, ${Math.floor(props.pct * 100)}%`}`
    case 'loading': return `loading ${m} into memory${props.pct === null ? '' : `, ${Math.floor(props.pct * 100)}%`}`
    case 'fault': return `${m} failed. ${props.error}`.trim()
    default: return m
  }
})
const facts = computed(() =>
  props.state === 'loaded'
    ? [props.device, props.rate === null ? '' : `${props.rate.toFixed(0)} tok/s`].filter(Boolean).join(', ')
    : '',
)
const busy = computed(() => props.state === 'downloading' || props.state === 'loading')
</script>

<template>
  <div class="hb-engine" :class="`is-${props.state}`" role="group" :aria-label="props.label">
    <span class="hb-engine-dot" aria-hidden="true" />
    <span class="hb-engine-text" :role="props.state === 'fault' ? 'alert' : 'status'">
      <span class="hb-engine-model">{{ words }}</span>
      <span v-if="facts" class="hb-engine-facts">{{ facts }}</span>
      <span v-if="props.state === 'loaded' && props.sharedWith.length" class="hb-engine-shared">shared with: {{ props.sharedWith.join(', ') }}</span>
    </span>
    <span v-if="busy" class="hb-engine-bar" :class="{ 'is-busy': props.pct === null }" aria-hidden="true"><i :style="{ width: (props.pct === null ? 30 : props.pct * 100) + '%' }" /></span>
    <span class="hb-engine-acts">
      <button v-if="props.state === 'stored'" type="button" class="hb-btn hb-btn-sm" @click="emit('load')">{{ props.sizeMB ? `load ${mbText(props.sizeMB)}` : 'load' }}</button>
      <button v-if="busy" type="button" class="hb-btn hb-btn-2 hb-btn-sm" @click="emit('cancel')">cancel</button>
      <button v-if="props.state === 'loaded'" type="button" class="hb-btn hb-btn-2 hb-btn-sm" @click="emit('unload')">unload</button>
      <button type="button" class="hb-btn hb-btn-2 hb-btn-sm" :class="{ 'hb-engine-pick': props.state === 'none' }" @click="emit('change')">{{ props.state === 'none' ? 'pick a model' : 'change' }}</button>
    </span>
  </div>
</template>
