<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import HbChipGroup from './HbChipGroup.vue'
import HbToggleRow from './HbToggleRow.vue'
import { withExt } from '../vanilla/save'
import { uid } from '../utils/uid'

export interface HbExportFormat {
  key: string
  /** The chip: 'srt', '3mf project'. */
  label: string
  /** '.srt'. */
  ext: string
  /** One line on what the file holds. */
  note?: string
  /** The format is text and can go to the clipboard. */
  copy?: boolean
}

export interface HbExportCheck {
  tone: 'ok' | 'warn' | 'err'
  text: string
}

export interface HbExportReadout {
  label: string
  value: string | number
}

export interface HbExportRequest {
  format: string
  filename: string
  includeLocal: boolean
}

interface Props {
  formats: HbExportFormat[]
  /** The file name without its extension; the person can change it. */
  name?: string
  /** Files flagged local only. Left out unless the box is ticked. */
  localOnly?: string[]
  /** Two column figures under the buttons. */
  readout?: HbExportReadout[]
  /** Reasons to trust the file, or not. */
  checks?: HbExportCheck[]
  /** Export is refused while set: the reason, said in place. */
  busy?: string
  label?: string
}

const props = withDefaults(defineProps<Props>(), {
  name: 'export',
  localOnly: () => [],
  readout: () => [],
  checks: () => [],
  busy: '',
  label: 'export',
})

const format = defineModel<string>('format', { default: '' })

const emit = defineEmits<{
  export: [request: HbExportRequest]
  copy: [format: string]
}>()

if (!format.value && props.formats.length) format.value = props.formats[0].key
const current = computed(() => props.formats.find((f) => f.key === format.value) ?? props.formats[0])
const base = ref(props.name)
watch(() => props.name, (n) => { base.value = n })
const includeLocal = ref(false)
const filename = computed(() => withExt(base.value, current.value?.ext ?? ''))
const errs = computed(() => props.checks.filter((c) => c.tone === 'err').length)
const id = uid('hb-export')

function run() {
  if (props.busy || !current.value) return
  emit('export', { format: current.value.key, filename: filename.value, includeLocal: includeLocal.value })
}
const TAG = { ok: 'ok', warn: 'warn', err: 'err' } as const
</script>

<template>
  <!-- Format chips, the file name, export and copy, then the readout and
       the checks: the reasons to trust the file sit under the buttons. -->
  <section class="hb-export" :aria-labelledby="`${id}-h`">
    <h3 :id="`${id}-h`" class="hb-export-head">{{ props.label }}</h3>
    <HbChipGroup
      v-model="format"
      class="hb-export-formats"
      :options="props.formats.map((f) => ({ label: f.label, value: f.key }))"
      :label="`${props.label} format`"
      toggle
    />
    <p v-if="current?.note" class="hb-export-note">{{ current.note }}</p>
    <div class="hb-export-name">
      <label class="hb-label" :for="`${id}-n`">file name</label>
      <div class="hb-export-namebox">
        <input :id="`${id}-n`" v-model="base" class="hb-input" type="text" spellcheck="false" autocomplete="off" @keydown.enter.prevent="run" />
        <span class="hb-export-ext">{{ current?.ext }}</span>
      </div>
    </div>
    <HbToggleRow
      v-if="props.localOnly.length"
      v-model="includeLocal"
      class="hb-export-local"
      label="include local only files"
      :description="`${includeLocal ? 'these go in the file' : 'left out'}: ${props.localOnly.join(', ')}`"
    />
    <slot name="extra" />
    <div class="hb-export-btns">
      <button type="button" class="hb-btn" :disabled="!!props.busy" @click="run">export {{ current?.ext }}</button>
      <button v-if="current?.copy" type="button" class="hb-btn hb-btn-2" :disabled="!!props.busy" @click="emit('copy', current.key)">copy</button>
    </div>
    <p v-if="props.busy" class="hb-export-busy" role="status">{{ props.busy }}</p>
    <slot name="readout">
      <dl v-if="props.readout.length" class="hb-export-readout">
        <div v-for="r in props.readout" :key="r.label"><dt>{{ r.label }}</dt><dd>{{ r.value }}</dd></div>
      </dl>
    </slot>
    <slot name="checks">
      <ul v-if="props.checks.length" class="hb-export-checks" :aria-label="`checks, ${errs} failing`">
        <li v-for="(c, i) in props.checks" :key="i" :class="`is-${c.tone}`"><b>{{ TAG[c.tone] }}</b><span>{{ c.text }}</span></li>
      </ul>
    </slot>
  </section>
</template>
