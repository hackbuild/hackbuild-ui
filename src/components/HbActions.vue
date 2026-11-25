<script setup lang="ts">
import { noteOnce } from '../utils/note'

noteOnce('HbActions', 'HbActions is merged since 0.10.0 and goes in 0.11.0; use HbToolbar')
interface Props {
  /** Push the row to the right edge. */
  end?: boolean
  /** Buttons share the width. */
  fill?: boolean
  /** Names the group for screen readers. */
  label?: string
}

const props = withDefaults(defineProps<Props>(), {
  end: false,
  fill: false,
  label: undefined,
})
</script>

<template>
  <!-- A row of verbs that wraps on a phone. Not a toolbar: no sunk paper,
       no rule, no fixed height. -->
  <div class="hb-acts" :class="{ 'is-end': props.end, 'is-fill': props.fill }" role="group" :aria-label="props.label">
    <slot />
  </div>
</template>
