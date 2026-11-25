<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, useSlots, watch } from 'vue'
import HbIcon from './HbIcon.vue'
import { barMore, type BarMoreHandle } from '../vanilla/bar'

interface Props {
  /** Ink toolbar for instrument shells. */
  ink?: boolean
  /** One row on a phone (CLEVIS): under 641 px `.hb-bar-lbl` labels drop
      so their buttons show the icon alone, and the `more` slot folds
      behind a menu button and drops under the bar when opened. Wider, the
      `more` slot sits in the row between the default and `end` slots. */
  overflow?: boolean
  /** Name of the overflow button. */
  moreLabel?: string
}

const props = withDefaults(defineProps<Props>(), {
  ink: false,
  overflow: false,
  moreLabel: 'more tools',
})

/** The overflow panel is open (phone only). */
const open = defineModel<boolean>('open', { default: false })

const slots = useSlots()
const wrap = ref<HTMLElement | null>(null)
const id = `hb-bar-more-${Math.random().toString(36).slice(2, 8)}`
let handle: BarMoreHandle | null = null
function bind() {
  handle?.dispose()
  handle = wrap.value ? barMore(wrap.value, { onToggle: (on) => { open.value = on } }) : null
}
onMounted(bind)
watch(wrap, bind)
watch(open, (on) => {
  if (!handle || handle.isOpen === on) return
  if (on) handle.open()
  else handle.close()
})
onBeforeUnmount(() => handle?.dispose())
</script>

<template>
  <!-- Verbs and global settings. Branding stays in the header. Push things
       right with a spacer: <span class="hb-spacer" />. -->
  <div class="hb-bar" :class="{ 'hb-bar-ink': props.ink, 'is-overflow': props.overflow }">
    <slot />
    <div v-if="props.overflow && slots.more" ref="wrap" class="hb-bar-more">
      <button type="button" class="hb-iconbtn hb-bar-more-btn" :aria-label="props.moreLabel" :title="props.moreLabel">
        <HbIcon name="menu" :size="16" />
      </button>
      <div :id="id" class="hb-bar-more-panel" role="group" :aria-label="props.moreLabel">
        <slot name="more" />
      </div>
    </div>
    <slot v-else name="more" />
    <slot name="end" />
  </div>
</template>
