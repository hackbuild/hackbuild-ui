<script setup lang="ts">
import { computed } from 'vue'
import HbDropzone from './HbDropzone.vue'
import HbHash from './HbHash.vue'
import HbLicence from './HbLicence.vue'
import HbProgress, { type HbProgressState } from './HbProgress.vue'

export type HbSizeSource = 'measured' | 'vendor' | 'inferred' | 'unknown'

interface Props {
  /** The file or model: 'quadruped codebook network'. */
  title: string
  /** Instrument head instead of the editorial one. Match the rest of the page. */
  instrument?: boolean
  urlLabel?: string
  /** Drop zone words; empty hides the drop zone. */
  dropHint?: string
  accept?: string
  multiple?: boolean
  /** Size in MB, or null when unknown. */
  sizeMB?: number | null
  /** Where the size came from. */
  sizeSource?: HbSizeSource
  licence?: string
  commercial?: boolean | null
  licenceHref?: string
  /** SHA-256 of the loaded bytes. */
  sha256?: string
  /** The known SHA-256, or empty. */
  expectedSha256?: string
  hashing?: boolean
  loaded?: number
  total?: number | null
  state?: HbProgressState
  /** The error, named. Shown under the actions. */
  error?: string
  /** Words on the load button; the size and licence are added. */
  loadLabel?: string
}

const props = withDefaults(defineProps<Props>(), {
  instrument: false,
  urlLabel: 'url',
  dropHint: 'or drop the file here',
  accept: '',
  multiple: false,
  sizeMB: null,
  sizeSource: 'unknown',
  licence: '',
  commercial: null,
  licenceHref: '',
  sha256: '',
  expectedSha256: '',
  hashing: false,
  loaded: 0,
  total: null,
  state: 'idle',
  error: '',
  loadLabel: 'load',
})

const url = defineModel<string>('url', { default: '' })

const emit = defineEmits<{
  /** Load from the url. */
  load: [url: string]
  /** Load from dropped or picked files. */
  files: [files: File[]]
  cancel: []
  resume: []
}>()

const size = computed(() => {
  if (props.sizeMB === null) return 'size unknown'
  const v = props.sizeMB >= 1024 ? `${(props.sizeMB / 1024).toFixed(1)} GB` : props.sizeMB >= 10 ? `${Math.round(props.sizeMB)} MB` : `${props.sizeMB.toFixed(1)} MB`
  return `${v}, ${props.sizeSource}`
})
const button = computed(() => {
  const bits = [props.sizeMB === null ? '' : size.value.split(',')[0], props.licence].filter(Boolean)
  return bits.length ? `${props.loadLabel} (${bits.join(', ')})` : props.loadLabel
})
const running = computed(() => props.state === 'running')
</script>

<template>
  <section class="hb-panel hb-loader" :aria-label="props.title">
    <h3 :class="props.instrument ? 'hb-panel-hd-inst' : 'hb-panel-hd'">{{ props.title }}</h3>
    <div class="hb-loader-src">
      <label class="hb-ctl is-wide">{{ props.urlLabel }}
        <input v-model="url" class="hb-input" type="url" :disabled="running" spellcheck="false">
      </label>
      <HbDropzone v-if="props.dropHint" :hint="props.dropHint" :accept="props.accept" :multiple="props.multiple" :disabled="running" @files="emit('files', $event)" />
    </div>
    <div class="hb-loader-meta">
      <div class="hb-kv"><span>size</span><span>{{ size }}</span></div>
      <div class="hb-kv"><span>sha-256</span><HbHash :hex="props.sha256" :expected="props.expectedSha256" :checking="props.hashing" /></div>
    </div>
    <HbLicence v-if="props.licence" :licence="props.licence" :commercial="props.commercial" :href="props.licenceHref"><slot name="licence" /></HbLicence>
    <HbProgress
      v-if="props.state !== 'idle'"
      :loaded="props.loaded"
      :total="props.total"
      :state="props.state"
      :error="props.error"
      :actions="false"
    />
    <div class="hb-loader-actions">
      <button v-if="!running" type="button" class="hb-btn" :disabled="!url" @click="emit('load', url)">{{ button }}</button>
      <button v-if="running" type="button" class="hb-btn hb-btn-2" @click="emit('cancel')">cancel</button>
      <button v-if="props.state === 'paused' || props.state === 'failed'" type="button" class="hb-btn hb-btn-2" @click="emit('resume')">resume</button>
      <slot name="actions" />
    </div>
    <div v-if="props.error" class="hb-callout is-err" role="alert">{{ props.error }}</div>
  </section>
</template>
