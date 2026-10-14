<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import HbSelect from './HbSelect.vue'

export interface HbStepOption {
  /** Shown uppercase on the tile, PRINT for the last step of one process. */
  label: string
  value: string | number
  /** Finished steps carry the ok badge. */
  done?: boolean
}

interface Props {
  steps: Array<HbStepOption | string>
  /** Accessible name for the strip and the collapsed select. */
  label?: string
}

const props = withDefaults(defineProps<Props>(), {
  label: 'steps',
})

const model = defineModel<string | number>()

const emit = defineEmits<{
  change: [value: string | number]
}>()

const normalized = computed<HbStepOption[]>(() =>
  props.steps.map((step) => (typeof step === 'object' ? step : { label: step, value: step })),
)

const options = computed(() =>
  normalized.value.map((step, index) => ({
    label: `${index + 1} ${step.label}${step.done ? ', done' : ''}`,
    value: step.value,
  })),
)

const strip = ref<HTMLElement | null>(null)
const host = ref<HTMLElement | null>(null)
const buttons = ref<HTMLButtonElement[]>([])
/** Width the strip needed when it collapsed; it expands again past it. */
const needed = ref(0)
const collapsed = ref(false)
let observer: ResizeObserver | undefined

function overflowing(): boolean {
  const el = strip.value
  if (!el) return false
  if (el.scrollWidth > el.clientWidth + 1) return true
  return buttons.value.some((b) => b.scrollWidth > b.clientWidth + 1)
}

async function measure() {
  if (!host.value) return
  const width = host.value.clientWidth
  if (collapsed.value) {
    if (width > needed.value) {
      collapsed.value = false
      await nextTick()
      if (overflowing()) collapsed.value = true
    }
    return
  }
  if (overflowing()) {
    needed.value = width
    collapsed.value = true
  }
}

function select(value: string | number) {
  model.value = value
  emit('change', value)
}

function onKey(event: KeyboardEvent, index: number) {
  const last = normalized.value.length - 1
  let next = -1
  if (event.key === 'ArrowRight') next = index === last ? 0 : index + 1
  else if (event.key === 'ArrowLeft') next = index === 0 ? last : index - 1
  else if (event.key === 'Home') next = 0
  else if (event.key === 'End') next = last
  if (next < 0) return
  event.preventDefault()
  select(normalized.value[next].value)
  buttons.value[next]?.focus()
}

onMounted(() => {
  measure()
  if (typeof ResizeObserver !== 'undefined' && host.value) {
    observer = new ResizeObserver(() => { measure() })
    observer.observe(host.value)
  }
})

onBeforeUnmount(() => observer?.disconnect())

watch(() => props.steps, () => nextTick(measure), { deep: true })
</script>

<template>
  <!-- The tabs strip of a bench. Numbered, equal width, collapses to a
       select before a tile would clip. -->
  <div ref="host" class="hb-steps-host">
    <HbSelect
      v-if="collapsed"
      class="hb-steps-select"
      :model-value="model"
      :options="options"
      :aria-label="props.label"
      @update:model-value="select"
    />
    <nav v-else ref="strip" class="hb-tabs hb-steps" role="tablist" :aria-label="props.label">
      <button
        v-for="(step, index) in normalized"
        :key="step.value"
        ref="buttons"
        type="button"
        role="tab"
        class="hb-tab"
        :class="{ 'is-done': step.done }"
        :aria-selected="model === step.value"
        :tabindex="model === step.value || (model === undefined && index === 0) ? 0 : -1"
        @click="select(step.value)"
        @keydown="onKey($event, index)"
      >
        <span class="n" aria-hidden="true">{{ index + 1 }}</span>{{ step.label }}<span v-if="step.done" class="hb-sr">, done</span>
      </button>
    </nav>
  </div>
</template>
