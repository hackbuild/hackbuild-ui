<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { toggleRow } from '../vanilla/choice'

interface Props {
  label: string
  /** One line on what turning it on does. */
  description?: string
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  description: '',
  disabled: false,
})

const on = defineModel<boolean>({ default: false })

const el = ref<HTMLButtonElement | null>(null)
let handle: ReturnType<typeof toggleRow> | null = null
onMounted(() => {
  if (!el.value) return
  handle = toggleRow(el.value, (v) => { on.value = v })
})
watch(on, (v) => { if (handle && handle.on !== v) handle.set(v) })
onBeforeUnmount(() => handle?.dispose())
</script>

<template>
  <!-- The whole row is the switch: one 44 px target, label and why inside. -->
  <button
    ref="el"
    type="button"
    class="hb-togrow"
    :class="{ 'is-on': on }"
    role="switch"
    :aria-checked="on"
    :disabled="props.disabled"
  >
    <span class="hb-togrow-text">
      <span class="hb-togrow-label">{{ props.label }}</span>
      <span v-if="props.description" class="hb-togrow-why">{{ props.description }}</span>
    </span>
    <span class="hb-togrow-sw" aria-hidden="true" />
  </button>
</template>
