<script setup lang="ts">
import { noteOnce } from '../utils/note'

noteOnce('HbStatusBar', 'HbStatusBar is deprecated since 0.10.0 and goes in 0.11.0; use bar chips or the rack live tab')
export interface HbStatusCell {
  key: string
  /** The label before the value, in paper. */
  label: string
  /** The value, in pink. */
  value: string | number
  /** 1 always shows, 2 from 481 px of bar width, 3 from 761 px. A phone
      keeps the priority 1 cells. Default 1. */
  priority?: 1 | 2 | 3
  /** A state light before the label: off, load, ok, err. */
  state?: 'off' | 'load' | 'ok' | 'err'
}

interface Props {
  /** The cells. The default slot takes over when given; there a cell
      takes `data-priority="2"` or `"3"` for the same rule. */
  cells?: HbStatusCell[]
  /** Makes the whole strip one button with this accessible name, as in
      "open the event log". It emits press. */
  action?: string
}

const props = withDefaults(defineProps<Props>(), {
  cells: () => [],
  action: undefined,
})

const emit = defineEmits<{ press: [] }>()
</script>

<template>
  <!-- Counts and rates only, VT323. Wrap key figures in <b> for the pink.
       At most one control: the whole strip as a button that opens the
       log behind the counts. -->
  <footer class="hb-statusbar" :class="{ 'is-button': !!props.action }">
    <button v-if="props.action" type="button" class="hb-statusbar-btn" @click="emit('press')">
      <slot>
        <span v-for="c in props.cells" :key="c.key" :data-priority="c.priority && c.priority > 1 ? c.priority : undefined"><i v-if="c.state" class="hb-led" :class="`is-${c.state}`" aria-hidden="true" />{{ c.label }} <b>{{ c.value }}</b><span v-if="c.state" class="hb-sr"> ({{ c.state }})</span></span>
      </slot>
      <span class="hb-sr">, {{ props.action }}</span>
    </button>
    <slot v-else>
      <span v-for="c in props.cells" :key="c.key" :data-priority="c.priority && c.priority > 1 ? c.priority : undefined"><i v-if="c.state" class="hb-led" :class="`is-${c.state}`" aria-hidden="true" />{{ c.label }} <b>{{ c.value }}</b><span v-if="c.state" class="hb-sr"> ({{ c.state }})</span></span>
    </slot>
  </footer>
</template>
