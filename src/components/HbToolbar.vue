<script setup lang="ts">
import { onBeforeUnmount, onBeforeUpdate, onMounted, onUpdated, ref, watch } from 'vue'
import HbIcon from './HbIcon.vue'
import { barMore, type BarMoreHandle } from '../vanilla/bar'

interface Props {
  /** Ink toolbar for instrument shells. */
  ink?: boolean
  /** One row (CLEVIS), by the bar's own width: when the bar is under
      641 px or its row would wrap, `.hb-bar-lbl` labels drop so their
      buttons show the icon alone, and the `more` slot folds behind a menu
      button and drops under the bar when opened. If the folded row still
      runs over, items from the end of the default slot move into the
      more panel; the `end` slot stays in the row. Otherwise the `more`
      slot sits in the row between the default and `end` slots. */
  overflow?: boolean
  /** Name of the overflow button. */
  moreLabel?: string
}

const props = withDefaults(defineProps<Props>(), {
  ink: false,
  overflow: false,
  moreLabel: 'more tools',
})

/** The overflow panel is open (folded bar only). */
const open = defineModel<boolean>('open', { default: false })

const wrap = ref<HTMLElement | null>(null)
const id = `hb-bar-more-${Math.random().toString(36).slice(2, 8)}`
let handle: BarMoreHandle | null = null
function bind() {
  handle?.dispose()
  handle = wrap.value ? barMore(wrap.value, { onToggle: (on) => { open.value = on } }) : null
}
onMounted(bind)
watch(wrap, bind)
// Spilled items go back to their places before the slots are patched, and
// the bar is measured again after.
onBeforeUpdate(() => { if (handle?.fit?.spilled) handle.fit.restore() })
onUpdated(() => handle?.fit?.update())
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
    <div v-if="props.overflow" ref="wrap" class="hb-bar-more">
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
