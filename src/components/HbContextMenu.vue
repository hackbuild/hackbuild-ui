<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { contextTrigger, ctxPanel, type CtxAt, type CtxPanelHandle, type CtxVia } from '../vanilla/ctxmenu'

export interface HbContextItem {
  label: string
  /** The sentence this item sends, through the same path as typing. */
  say?: string
  disabled?: boolean
}

export interface HbContextRequest {
  at: CtxAt
  via: CtxVia
  target: Element
}

interface Props {
  /** The menu head: the thing that was pressed. */
  title?: string
  items?: HbContextItem[]
  /** Accessible name of the area: how to ask for the menu. */
  label?: string
  /** Long press on touch, in ms. */
  longPress?: number
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  items: () => [],
  label: 'right click, long press or shift+f10 for actions',
  longPress: 500,
})

/** Open state. The host may open it at `at` by setting both. */
const open = defineModel<boolean>('open', { default: false })
/** Where the menu was asked for, relative to the area. */
const at = defineModel<CtxAt>('at', { default: () => ({ x: 0, y: 0 }) })

const emit = defineEmits<{
  /** Asked for, before it opens: set `title` and `items` for `target` here.
      With no items it stays shut. */
  request: [req: HbContextRequest]
  /** An item was chosen: its sentence, or its label when it has none. */
  pick: [item: HbContextItem, say: string]
}>()

defineSlots<{
  /** The stage: whatever is right clicked. */
  default?: () => unknown
}>()

const area = ref<HTMLElement | null>(null)
const panel = ref<HTMLElement | null>(null)
let opener: HTMLElement | null = null
let trig: { dispose(): void } | null = null
let handle: CtxPanelHandle | null = null

async function show() {
  await nextTick()
  const a = area.value
  if (!a || !handle || !props.items.length) { open.value = false; return }
  handle.show(at.value, { w: a.clientWidth, h: a.clientHeight }, opener ?? a)
}

onMounted(() => {
  const a = area.value
  const p = panel.value
  if (!a || !p) return
  handle = ctxPanel(p, {
    onPick(el) {
      const item = props.items[Number(el.dataset.index)]
      if (item && !item.disabled) emit('pick', item, item.say ?? item.label)
    },
    onClose() { open.value = false },
  })
  trig = contextTrigger(a, {
    longPress: props.longPress,
    onOpen(where, via, target) {
      const active = a.ownerDocument.activeElement as HTMLElement | null
      opener = active && a.contains(active) && active !== p && !p.contains(active) ? active : a
      at.value = where
      emit('request', { at: where, via, target })
      open.value = true
      void show()
    },
  })
  if (open.value) void show()
})

watch(open, (o) => {
  if (o && handle && !handle.isOpen) void show()
  else if (!o) handle?.close(false)
})

onBeforeUnmount(() => {
  trig?.dispose()
  handle?.dispose()
})
</script>

<template>
  <div ref="area" class="hb-ctx-area" tabindex="0" aria-haspopup="menu" :aria-label="props.label">
    <slot />
    <div ref="panel" class="hb-ctx" :aria-label="props.title || 'actions'" hidden>
      <div v-if="props.title" class="hb-ctx-title" aria-hidden="true">{{ props.title }}</div>
      <button
        v-for="(item, index) in props.items"
        :key="`${index}-${item.label}`"
        type="button"
        class="hb-menu-item"
        role="menuitem"
        tabindex="-1"
        :data-index="index"
        :disabled="item.disabled"
        :title="item.say"
      >{{ item.label }}</button>
    </div>
  </div>
</template>
