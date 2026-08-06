<script setup lang="ts">
import { onUnmounted, watch } from 'vue'

interface Props {
  side?: 'left' | 'right'
  closeOnBackdrop?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  side: 'right',
  closeOnBackdrop: true,
})

const open = defineModel<boolean>({ default: false })

const emit = defineEmits<{
  close: []
}>()

function close() {
  open.value = false
  emit('close')
}

function onBackdrop(event: MouseEvent) {
  if (props.closeOnBackdrop && event.target === event.currentTarget) close()
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') close()
}

watch(open, (isOpen) => {
  if (typeof document === 'undefined') return
  document.body.style.overflow = isOpen ? 'hidden' : ''
  if (isOpen) document.addEventListener('keydown', onKeydown)
  else document.removeEventListener('keydown', onKeydown)
})

onUnmounted(() => {
  if (typeof document === 'undefined') return
  document.body.style.overflow = ''
  document.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="hb-drawer hb" :class="{ 'is-left': props.side === 'left' }" @click="onBackdrop">
      <div class="hb-drawer-panel" role="dialog" aria-modal="true">
        <slot />
      </div>
    </div>
  </Teleport>
</template>
