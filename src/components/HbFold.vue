<script setup lang="ts">
import { watch } from 'vue'
import { usePersisted } from '../composables/usePersisted'

interface Props {
  summary: string
  /** Section number, shown bracketed and zero padded: [03]. */
  num?: number
  /** Finished: the summary carries the ok mark. */
  done?: boolean
  /** Shown instead of the slot while set: what to do first. */
  emptyHint?: string
  /** Remember open or closed in localStorage under `hb.fold.<key>`. */
  persistKey?: string
}

const props = withDefaults(defineProps<Props>(), {
  num: undefined,
  done: false,
  emptyHint: undefined,
  persistKey: undefined,
})

/** Open state. Optional two way binding. */
const open = defineModel<boolean>({ default: false })

const saved = props.persistKey ? usePersisted<boolean | null>(`hb.fold.${props.persistKey}`, null) : null
if (saved && saved.value !== null) open.value = saved.value
watch(open, (v) => { if (saved) saved.value = v })

function onToggle(event: Event) {
  open.value = (event.target as HTMLDetailsElement).open
}
</script>

<template>
  <!-- Fiddly controls fold away rather than being deleted. Easy mode is a
       fold, not a different app. -->
  <details class="hb-fold" :class="{ 'is-done': props.done }" :open="open" @toggle="onToggle">
    <summary>
      <span v-if="props.num !== undefined" class="hb-fold-num">[{{ String(props.num).padStart(2, '0') }}]</span>
      <span class="hb-fold-sum">{{ props.summary }}</span>
      <span v-if="props.done" class="hb-fold-done">done</span>
    </summary>
    <div>
      <p v-if="props.emptyHint" class="hb-empty-hint">{{ props.emptyHint }}</p>
      <slot v-else />
    </div>
  </details>
</template>
