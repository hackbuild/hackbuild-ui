<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import HbChipGroup from './HbChipGroup.vue'
import HbCallout from './HbCallout.vue'
import HbIcon from './HbIcon.vue'
import HbToggleRow from './HbToggleRow.vue'
import { uid } from '../utils/uid'
import {
  CUSTOM_MODES, checkText, customErrors, customFields, customId, deriveId,
  type CustomCheck, type CustomMode, type CustomValues,
} from '../vanilla/custom'
import { mbText } from '../vanilla/models'
import { noteOnce } from '../utils/note'

noteOnce('HbCustomModelForm', 'HbCustomModelForm is merged since 0.10.0 and goes in 0.11.0; use HbModelSheet (your own)')

export interface HbCustomEntry {
  id: string
  mode: CustomMode
  /** The weights url, repo or endpoint, shown as the chip's title. */
  source?: string
}

export interface HbCustomBase {
  id: string
  label?: string
}

interface Props {
  /** Ways in, in order. Default all four. */
  modes?: CustomMode[]
  /** Base models whose .wasm an mlc entry can reuse. */
  bases?: HbCustomBase[]
  /** The webllm runtime version, named in the .wasm hint. */
  runtime?: string
  /** The last check, from the parent's repo lookup. */
  check?: CustomCheck | null
  /** Entries added before, newest first. */
  saved?: HbCustomEntry[]
}

const props = withDefaults(defineProps<Props>(), {
  modes: () => ['onnx', 'mlc', 'gguf', 'endpoint'],
  bases: () => [],
  runtime: '',
  check: null,
  saved: () => [],
})

const mode = defineModel<CustomMode>('mode', { default: 'onnx' })
const values = defineModel<CustomValues>({ default: () => ({ lib: 'base', f16: true }) })

const emit = defineEmits<{
  check: [mode: CustomMode, values: CustomValues]
  add: [entry: HbCustomEntry, values: CustomValues]
  pick: [id: string]
  remove: [id: string]
}>()

const id = uid('hb-cm')
const touched = ref<Record<string, boolean>>({})
watch(mode, () => { touched.value = {} })

const def = computed(() => CUSTOM_MODES[mode.value])
const fields = computed(() => customFields(mode.value, values.value))
const errors = computed(() => customErrors(mode.value, values.value, props.saved.map((s) => s.id)))
const ok = computed(() => Object.keys(errors.value).length === 0)
const entryId = computed(() => customId(mode.value, values.value))
const busy = computed(() => props.check?.state === 'checking')
const modeOptions = computed(() => props.modes.map((m) => ({ value: m, label: CUSTOM_MODES[m].label })))
const modeModel = computed({ get: () => mode.value as string, set: (v: string) => { if (v) mode.value = v as CustomMode } })

function set(key: string, v: string | boolean) {
  const next = { ...values.value, [key]: v }
  if (mode.value === 'mlc' && key === 'url' && !String(values.value.id ?? '').trim()) next.idHint = deriveId(String(v))
  values.value = next
}
function str(k: string) { return String(values.value[k] ?? '') }
function errOf(k: string) { return touched.value[k] || touched.value.__all ? errors.value[k] : undefined }
function hintOf(k: string, hint?: string) {
  if (k === 'wasm' && props.runtime) return `${hint} this page runs webllm ${props.runtime}.`
  if (k === 'id' && !str('id') && str('url')) return `saved as ${deriveId(str('url')) || 'the last part of the url'}.`
  return hint
}
function onCheck() {
  touched.value = { __all: true }
  if (ok.value) emit('check', mode.value, { ...values.value })
}
function onAdd() {
  touched.value = { __all: true }
  if (!ok.value) return
  const source = mode.value === 'mlc' || mode.value === 'endpoint' ? str('url') : str('repo')
  emit('add', { id: entryId.value, mode: mode.value, source }, { ...values.value })
}
</script>

<template>
  <form class="hb-cmf" :aria-label="'add a custom model'" novalidate @submit.prevent="onAdd">
    <HbChipGroup v-model="modeModel" :options="modeOptions" label="how the model is shipped" />
    <p class="hb-cmf-runtime">runs on {{ def.runtime }}</p>
    <HbCallout v-if="def.caveat" variant="warn" title="reality check" class="hb-cmf-caveat">{{ def.caveat }}</HbCallout>

    <div class="hb-cmf-fields">
      <div v-for="f in fields" :key="mode + f.key" class="hb-field" :class="{ 'is-check': f.type === 'check' }">
        <template v-if="f.type === 'check'">
          <HbToggleRow :label="f.label" :description="f.hint" :model-value="!!values[f.key]" @update:model-value="(v: boolean) => set(f.key, v)" />
        </template>
        <template v-else>
          <span class="hb-field-head">
            <label class="hb-label" :for="`${id}-${f.key}`">{{ f.label }}</label>
            <span v-if="f.optional" class="hb-prow-tag">optional</span>
          </span>
          <select
            v-if="f.key === 'lib'"
            :id="`${id}-${f.key}`"
            class="hb-select"
            :value="str('lib') || 'base'"
            @change="set('lib', ($event.target as HTMLSelectElement).value)"
          >
            <option value="base">reuse the .wasm of a base model</option>
            <option value="url">paste a .wasm url</option>
          </select>
          <select
            v-else-if="f.key === 'base'"
            :id="`${id}-${f.key}`"
            class="hb-select"
            :class="{ 'is-invalid': errOf('base') }"
            :value="str('base')"
            :aria-invalid="!!errOf('base')"
            @change="set('base', ($event.target as HTMLSelectElement).value); touched.base = true"
          >
            <option value="" disabled>pick the same architecture</option>
            <option v-for="b in props.bases" :key="b.id" :value="b.id">{{ b.label || b.id }}</option>
          </select>
          <input
            v-else
            :id="`${id}-${f.key}`"
            class="hb-input"
            :class="{ 'is-invalid': errOf(f.key) }"
            :type="f.type === 'number' ? 'number' : f.type === 'url' ? 'url' : 'text'"
            :inputmode="f.type === 'number' ? 'numeric' : undefined"
            :min="f.type === 'number' ? 512 : undefined"
            :step="f.type === 'number' ? 512 : undefined"
            :placeholder="f.key === 'id' && values.idHint ? String(values.idHint) : f.placeholder"
            :value="str(f.key)"
            :aria-invalid="!!errOf(f.key)"
            :aria-describedby="`${id}-${f.key}-foot`"
            spellcheck="false"
            autocapitalize="off"
            @input="set(f.key, ($event.target as HTMLInputElement).value)"
            @blur="touched[f.key] = true"
          >
          <span :id="`${id}-${f.key}-foot`" class="hb-field-foot">
            <span v-if="errOf(f.key)" class="hb-error">{{ errOf(f.key) }}</span>
            <span v-else-if="hintOf(f.key, f.hint)" class="hb-hint">{{ hintOf(f.key, f.hint) }}</span>
          </span>
        </template>
      </div>
    </div>

    <div class="hb-cmf-check-out" :class="props.check ? `is-${props.check.state}` : 'is-idle'" aria-live="polite">
      <span class="hb-cmf-check-word">{{ checkText(props.check) }}</span>
      <span v-if="props.check?.sizeMB" class="hb-cmf-check-size">{{ mbText(props.check.sizeMB) }} (measured, head requests)</span>
      <ul v-if="props.check?.lines?.length" class="hb-cmf-check-lines">
        <li v-for="(l, i) in props.check.lines" :key="i">{{ l }}</li>
      </ul>
    </div>

    <div class="hb-cmf-acts">
      <button v-if="mode !== 'endpoint'" type="button" class="hb-btn hb-btn-2" :disabled="busy" @click="onCheck">{{ busy ? 'checking' : 'check the repo' }}</button>
      <button type="submit" class="hb-btn">add {{ entryId || 'model' }}</button>
    </div>

    <div class="hb-cmf-saved">
      <span class="hb-label">yours</span>
      <p v-if="!props.saved.length" class="hb-cmf-empty">no custom models added yet.</p>
      <ul v-else class="hb-cmf-chips">
        <li v-for="s in props.saved" :key="s.id" class="hb-cmf-chip">
          <button type="button" class="hb-cmf-chip-name" :title="s.source" @click="emit('pick', s.id)">
            {{ s.id }}<span class="hb-cmf-chip-mode">{{ CUSTOM_MODES[s.mode].label }}</span>
          </button>
          <button type="button" class="hb-cmf-chip-x" :aria-label="`remove ${s.id}`" @click="emit('remove', s.id)"><HbIcon name="x" :size="14" /></button>
        </li>
      </ul>
    </div>
  </form>
</template>
