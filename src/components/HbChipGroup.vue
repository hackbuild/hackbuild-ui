<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { chipGroup, type ChipGroupHandle } from '../vanilla/choice'
import { sharedHotkeys } from '../composables/useHotkeys'

export interface HbChipOption {
  label: string
  value: string
  /** A letter that chooses it, with `keys` on. */
  key?: string
  disabled?: boolean
}

interface Props {
  options: Array<HbChipOption | string>
  /** Several on at once. Default: one on. */
  multi?: boolean
  /** Label of a distinct off chip (value ''), drawn dashed. */
  off?: string
  /** Bind each option's key letter in the shared hotkey registry. */
  keys?: boolean
  /** Accessible name of the group, and the key map heading. */
  label?: string
  /** Ink when on, so the pink stays with the focal value. */
  toggle?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  multi: false,
  off: undefined,
  keys: false,
  label: undefined,
  toggle: false,
})

/** The value on (single) or the values on (multi). */
const model = defineModel<string | string[]>()

const normalized = computed<HbChipOption[]>(() =>
  props.options.map((o) => (typeof o === 'object' ? o : { label: o, value: o })),
)
const values = computed(() => (Array.isArray(model.value) ? model.value : model.value === undefined ? [] : [model.value]))

const el = ref<HTMLElement | null>(null)
let handle: ChipGroupHandle | null = null
function bind() {
  handle?.dispose()
  if (!el.value) return
  handle = chipGroup(el.value, {
    multi: props.multi,
    value: values.value,
    registry: props.keys ? sharedHotkeys() : undefined,
    group: props.label,
    onChange(v) { model.value = props.multi ? v : v[0] ?? '' },
  })
}
onMounted(bind)
watch(() => [props.options, props.multi, props.off], () => nextTick(bind), { deep: true })
watch(values, (v) => { if (handle && handle.value.join('\n') !== v.join('\n')) handle.set(v) })
onBeforeUnmount(() => handle?.dispose())
</script>

<template>
  <div ref="el" class="hb-chipgroup" :class="{ 'is-toggle': props.toggle }" :aria-label="props.label">
    <button
      v-for="o in normalized"
      :key="o.value"
      type="button"
      class="hb-chip"
      :class="{ 'is-toggle': props.toggle }"
      :data-value="o.value"
      :data-key="o.key"
      :disabled="o.disabled"
    >
      {{ o.label }}<kbd v-if="props.keys && o.key" class="hb-chip-key" aria-hidden="true">{{ o.key }}</kbd>
    </button>
    <button v-if="props.off !== undefined" type="button" class="hb-chip hb-chip-off" data-value="">{{ props.off }}</button>
  </div>
</template>
