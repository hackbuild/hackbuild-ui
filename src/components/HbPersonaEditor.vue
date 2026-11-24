<script setup lang="ts">
import { computed, ref, useId } from 'vue'
import HbButton from './HbButton.vue'
import HbField from './HbField.vue'
import HbInput from './HbInput.vue'
import HbTextarea from './HbTextarea.vue'
import {
  PERSONA_TEMPLATE,
  costLine,
  insertTemplate,
  matchPersona,
  parsePersona,
  presetLabel,
  tokenEstimate,
  type PersonaFile,
  type PersonaPreset,
} from '../vanilla/persona'

interface Props {
  /** The structured prompt 'insert template' adds. */
  template?: string
  /** Saved presets, owned by the host. */
  presets?: PersonaPreset[]
  /** Prompt cost in tokens. Default: an estimate from the prompt length. */
  cost?: number
  rows?: number
}

const props = withDefaults(defineProps<Props>(), {
  template: PERSONA_TEMPLATE,
  presets: () => [],
  cost: undefined,
  rows: 10,
})

/** The character file being edited. */
const model = defineModel<PersonaFile>({ required: true })

const emit = defineEmits<{
  /** Save the current file as a preset under this label. */
  'save-preset': [preset: PersonaPreset]
  /** A preset was loaded into the editor. */
  'load-preset': [index: number]
  'remove-preset': [index: number]
  /** A character file was read and loaded. */
  import: [file: PersonaFile]
  /** Export the current file; the host writes it out. */
  export: [file: PersonaFile]
}>()

const id = useId()
const name = computed({
  get: () => model.value.name,
  set: (v: string) => { model.value = { ...model.value, name: v } },
})
const prompt = computed({
  get: () => model.value.prompt,
  set: (v: string) => { model.value = { ...model.value, prompt: v } },
})
const tokens = computed(() => props.cost ?? tokenEstimate(model.value.prompt))
const on = computed(() => matchPersona(props.presets, model.value))
const saveName = ref('')
const fileInput = ref<HTMLInputElement | null>(null)
const importError = ref('')

function addTemplate() {
  prompt.value = insertTemplate(prompt.value, props.template, name.value)
}

function save() {
  const label = presetLabel(props.presets, saveName.value || name.value)
  emit('save-preset', { label, file: { ...model.value } })
  saveName.value = ''
}

function load(i: number) {
  const p = props.presets[i]
  if (!p) return
  model.value = { ...p.file }
  emit('load-preset', i)
}

async function onFile(e: Event) {
  const input = e.target as HTMLInputElement
  const f = input.files?.[0]
  input.value = ''
  if (!f) return
  try {
    const file = parsePersona(await f.text())
    importError.value = ''
    model.value = file
    emit('import', file)
  } catch (err) {
    importError.value = `${f.name}: ${(err as Error).message}`
  }
}
</script>

<template>
  <!-- A name, a structured prompt with its cost, presets one press away,
       and the character as a file. -->
  <div class="hb-persona">
    <HbField label="name" :for="`${id}-name`" hint="the label on every message">
      <HbInput :id="`${id}-name`" v-model="name" placeholder="assistant" autocomplete="off" />
    </HbField>
    <HbField label="system prompt" :for="`${id}-prompt`" :hint="costLine(tokens)">
      <HbTextarea :id="`${id}-prompt`" v-model="prompt" :rows="props.rows" placeholder="you are... or insert the template" />
    </HbField>
    <div class="hb-persona-row">
      <HbButton variant="secondary" size="sm" @click="addTemplate">insert template</HbButton>
    </div>

    <div class="hb-persona-presets">
      <span class="hb-label" :id="`${id}-pl`">saved presets</span>
      <div class="hb-persona-chips" role="group" :aria-labelledby="`${id}-pl`">
        <span v-for="(p, i) in props.presets" :key="p.label" class="hb-persona-chip" :class="{ 'is-on': i === on }">
          <button type="button" class="hb-persona-chip-n" :aria-pressed="i === on" @click="load(i)">{{ p.label }}</button>
          <button type="button" class="hb-persona-chip-x" :aria-label="`remove preset ${p.label}`" @click="emit('remove-preset', i)">&times;</button>
        </span>
        <span v-if="!props.presets.length" class="hb-hint">no presets saved yet</span>
      </div>
      <form class="hb-persona-save" @submit.prevent="save">
        <HbInput v-model="saveName" :placeholder="name || 'preset name'" aria-label="preset name" autocomplete="off" />
        <HbButton variant="secondary" size="sm" type="submit">save current</HbButton>
      </form>
    </div>

    <div class="hb-persona-row">
      <HbButton variant="ghost" size="sm" @click="fileInput?.click()">import</HbButton>
      <HbButton variant="ghost" size="sm" @click="emit('export', { ...model })">export</HbButton>
      <input ref="fileInput" type="file" accept="application/json,.json" hidden @change="onFile" />
    </div>
    <p v-if="importError" class="hb-error" role="alert">{{ importError }}</p>
  </div>
</template>
