<script setup lang="ts">
import { nextTick, onUnmounted, ref, watch } from 'vue'

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
  close: []
}>()

const panelRef = ref<HTMLElement | null>(null)
const previousActive = ref<HTMLElement | null>(null)

function close() {
  if (!props.closable) return
  open.value = false
  emit('close')
}

function onBackdrop(event: MouseEvent) {
  if (props.closeOnBackdrop && event.target === event.currentTarget) close()
}

function focusables(): HTMLElement[] {
  if (!panelRef.value) return []
  return Array.from(
    panelRef.value.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    ),
  )
}

function onKeydown(event: KeyboardEvent) {
  if (props.closeOnEscape && event.key === 'Escape') {
    close()
    return
  }
  if (event.key === 'Tab') {
    const items = focusables()
    if (items.length === 0) return
    const first = items[0]
    const last = items[items.length - 1]
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }
}

watch(open, async (isOpen) => {
  if (typeof document === 'undefined') return
  if (isOpen) {
    previousActive.value = document.activeElement as HTMLElement
    document.body.style.overflow = 'hidden'
    await nextTick()
    const items = focusables()
    ;(items[0] ?? panelRef.value)?.focus()
  } else {
    document.body.style.overflow = ''
    previousActive.value?.focus()
  }
})

onUnmounted(() => {
  if (typeof document !== 'undefined') document.body.style.overflow = ''
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="hb-modal hb"
      role="dialog"
      aria-modal="true"
      :aria-label="props.title"
      @click="onBackdrop"
      @keydown="onKeydown"
    >
      <div ref="panelRef" class="hb-panel" :style="{ maxWidth: props.width + 'px' }" tabindex="-1">
        <div v-if="props.title || props.closable" class="hb-panel-hd" style="display: flex; align-items: center; gap: 8px">
          <span style="flex: 1">{{ props.title }}</span>
          <button
            v-if="props.closable"
            type="button"
            class="hb-btn hb-btn-2 hb-btn-sm"
            aria-label="close"
            @click="close"
          >
            x
          </button>
        </div>
        <slot />
        <div v-if="$slots.footer" style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 16px">
          <slot name="footer" />
        </div>
      </div>
    </div>
  </Teleport>
</template>
