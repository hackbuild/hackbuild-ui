<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { modal, type CloseReason, type OverlayHandle } from '../vanilla/overlay'
import HbIcon from './HbIcon.vue'

interface Props {
  title?: string
  /** Panel max width in px. */
  width?: number
  closable?: boolean
  closeOnBackdrop?: boolean
  closeOnEscape?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  width: 640,
  closable: true,
  closeOnBackdrop: true,
  closeOnEscape: true,
})

const open = defineModel<boolean>({ default: false })

const emit = defineEmits<{
  close: [reason: CloseReason]
}>()

const root = ref<HTMLElement | null>(null)
let handle: OverlayHandle | null = null

// Behaviour is the vanilla modal's, on the shared overlay stack. Escape
// acts on the newest open overlay only: a modal over a drawer closes
// first, and a modal that is not closable, or has closeOnEscape off,
// holds the key while it is on top, so Escape never closes the drawer
// beneath it. A menu inside that takes Escape first keeps the modal open.
function release() {
  const h = handle
  handle = null
  h?.dispose()
}

watch(open, async (isOpen) => {
  if (!isOpen) { release(); return }
  await nextTick()
  if (!root.value || handle) return
  handle = modal(root.value, {
    open: true,
    label: props.title,
    closeOnScrim: props.closable && props.closeOnBackdrop,
    closeOnEscape: props.closable && props.closeOnEscape,
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
    <div v-if="open" ref="root" class="hb-modal hb" role="dialog" aria-modal="true" :aria-label="props.title">
      <div class="hb-panel" :style="props.width !== 640 ? { maxWidth: props.width + 'px' } : undefined" tabindex="-1">
        <div v-if="props.title || props.closable" class="hb-panel-hd hb-modal-hd">
          <span>{{ props.title }}</span>
          <button
            v-if="props.closable"
            type="button"
            class="hb-iconbtn"
            aria-label="close"
            data-hb-close
          >
            <HbIcon name="x" :size="16" />
          </button>
        </div>
        <slot />
        <div v-if="$slots.footer" class="hb-modal-ft">
          <slot name="footer" />
        </div>
      </div>
    </div>
  </Teleport>
</template>
