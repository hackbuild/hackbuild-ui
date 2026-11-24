<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { menu, type MenuHandle } from '../vanilla/menu'

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
const menuRef = ref<HTMLElement | null>(null)
let handle: MenuHandle | null = null

// Keys, focus and outside press are the vanilla menu's: the trigger opens
// it on click, ArrowDown or ArrowUp; arrows, Home, End and a first letter
// move; Escape closes and returns focus to the trigger; Tab closes.
onMounted(() => {
  const wrap = wrapRef.value
  const panel = menuRef.value
  if (!wrap || !panel) return
  // The trigger slot renders one button; a slot with no button wires its
  // first element.
  const trigger =
    [...wrap.querySelectorAll<HTMLElement>('button')].find((b) => !panel.contains(b)) ??
    (wrap.firstElementChild !== panel ? (wrap.firstElementChild as HTMLElement | null) : null)
  if (!trigger) return
  handle = menu(wrap, {
    trigger,
    menu: panel,
    onToggle: (open) => { isOpen.value = open },
    onSelect(_value, item) {
      const index = item.dataset.index
      if (index === undefined) return
      const picked = props.items[Number(index)]
      if (picked && !picked.disabled) emit('select', picked.value)
    },
  })
})

onBeforeUnmount(() => handle?.dispose())

/** Kept for slots written before the kit wired the trigger: the kit
    already toggles on the trigger's click, so this does nothing. */
function toggle() {}
function close() {
  handle?.close()
}
</script>

<template>
  <div ref="wrapRef" class="hb-menu-wrap">
    <slot name="trigger" :toggle="toggle" :open="isOpen">
      <button type="button" class="hb-btn hb-btn-2">
        {{ props.label }}
      </button>
    </slot>
    <div ref="menuRef" class="hb-menu" :class="{ 'is-right': props.align === 'right' }" role="menu" hidden>
      <slot :close="close">
        <button
          v-for="(item, index) in props.items"
          :key="item.value"
          type="button"
          class="hb-menu-item"
          role="menuitem"
          tabindex="-1"
          :data-index="index"
          :disabled="item.disabled"
        >
          {{ item.label }}
        </button>
      </slot>
    </div>
  </div>
</template>
