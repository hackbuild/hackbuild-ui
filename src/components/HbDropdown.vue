<script setup lang="ts">
import { onUnmounted, ref, watch } from 'vue'

export interface HbDropdownItem {
  label: string
  value: string | number
  disabled?: boolean
}

interface Props {
  /** Trigger text. Or slot a custom trigger. */
  label?: string
  items?: HbDropdownItem[]
  /** Menu edge to align with the trigger. */
  align?: 'left' | 'right'
}

const props = withDefaults(defineProps<Props>(), {
  label: '',
  items: () => [],
  align: 'left',
})

const emit = defineEmits<{
  select: [value: string | number]
}>()

const isOpen = ref(false)
const wrapRef = ref<HTMLElement | null>(null)

function onDocumentClick(event: MouseEvent) {
  if (wrapRef.value && !wrapRef.value.contains(event.target as Node)) isOpen.value = false
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') isOpen.value = false
}

watch(isOpen, (value) => {
  if (typeof document === 'undefined') return
  if (value) {
    document.addEventListener('click', onDocumentClick)
    document.addEventListener('keydown', onKeydown)
  } else {
    document.removeEventListener('click', onDocumentClick)
    document.removeEventListener('keydown', onKeydown)
  }
})

onUnmounted(() => {
  if (typeof document === 'undefined') return
  document.removeEventListener('click', onDocumentClick)
  document.removeEventListener('keydown', onKeydown)
})

function pick(item: HbDropdownItem) {
  if (item.disabled) return
  emit('select', item.value)
  isOpen.value = false
}
</script>

<template>
  <div ref="wrapRef" class="hb-menu-wrap">
    <slot name="trigger" :toggle="() => (isOpen = !isOpen)" :open="isOpen">
      <button type="button" class="hb-btn hb-btn-2" :aria-expanded="isOpen" aria-haspopup="menu" @click="isOpen = !isOpen">
        {{ props.label }}
      </button>
    </slot>
    <div v-if="isOpen" class="hb-menu" :class="{ 'is-right': props.align === 'right' }" role="menu">
      <slot :close="() => (isOpen = false)">
        <button
          v-for="item in props.items"
          :key="item.value"
          type="button"
          class="hb-menu-item"
          role="menuitem"
          :disabled="item.disabled"
          @click="pick(item)"
        >
          {{ item.label }}
        </button>
      </slot>
    </div>
  </div>
</template>
