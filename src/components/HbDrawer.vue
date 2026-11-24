<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { drawer, type CloseReason, type OverlayHandle } from '../vanilla/overlay'
import HbIcon from './HbIcon.vue'

interface Props {
  /** 'bottom' is the phone sheet: 74 percent tall, safe area padded, one
      sheet open at a time. */
  side?: 'left' | 'right' | 'bottom'
  closeOnBackdrop?: boolean
  closeOnEscape?: boolean
  /** Heading in the drawer head, with the close button beside it. Also
      the dialog's accessible name. */
  title?: string
  /** Accessible name when there is no title. */
  label?: string
}

const props = withDefaults(defineProps<Props>(), {
  side: 'right',
  closeOnBackdrop: true,
  closeOnEscape: true,
  title: undefined,
  label: undefined,
})

const open = defineModel<boolean>({ default: false })

const emit = defineEmits<{
  close: [reason: CloseReason]
}>()

const root = ref<HTMLElement | null>(null)
let handle: OverlayHandle | null = null

// Focus, the Tab trap, Escape, the scrim, scroll lock and focus return are
// the vanilla drawer's. It lives while the drawer is in the page.
function release() {
  const h = handle
  handle = null
  h?.dispose()
}

watch(open, async (isOpen) => {
  if (!isOpen) { release(); return }
  await nextTick()
  if (!root.value || handle) return
  handle = drawer(root.value, {
    open: true,
    side: props.side,
    label: props.title ?? props.label,
    closeOnScrim: props.closeOnBackdrop,
    closeOnEscape: props.closeOnEscape,
    onClose(reason) {
      if (!handle) return
      handle = null
      open.value = false
      emit('close', reason)
    },
  })
}, { immediate: true })

onBeforeUnmount(release)
</script>

<template>
  <Teleport to="body">
    <div v-if="open" ref="root" class="hb-drawer hb" :class="{ 'is-left': props.side === 'left', 'is-sheet': props.side === 'bottom' }">
      <div class="hb-drawer-panel" role="dialog" aria-modal="true">
        <div v-if="props.title" class="hb-drawer-hd">
          <span>{{ props.title }}</span>
          <button type="button" class="hb-iconbtn" aria-label="close" data-hb-close>
            <HbIcon name="x" :size="16" />
          </button>
        </div>
        <slot />
      </div>
    </div>
  </Teleport>
</template>
