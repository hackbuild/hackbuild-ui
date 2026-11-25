<script setup lang="ts">
import { defineComponent, h, onBeforeUnmount, onMounted, onUpdated, ref, watch, type PropType, type VNode } from 'vue'
import { tree, type TreeHandle } from '../vanilla/tree'

export interface HbTreeNode {
  id: string
  /** The row name: 'mixamorig:Hips'. */
  label: string
  /** Quiet words after the name: 'bone', '3 children'. */
  sub?: string
  children?: HbTreeNode[]
}

interface Props {
  nodes: HbTreeNode[]
  /** Accessible name of the tree: 'rig'. */
  label?: string
  /** Height cap; the tree scrolls inside it. Any CSS length. */
  maxHeight?: string
}

const props = withDefaults(defineProps<Props>(), {
  label: 'tree',
  maxHeight: undefined,
})

/** The picked row id. */
const model = defineModel<string>({ default: '' })
/** Ids of the open branches. */
const expanded = defineModel<string[]>('expanded', { default: () => [] })

// The rows are drawn by a local render function so the nesting can be any
// depth; the vanilla tree() owns focus, keys and clicks.
const Rows = defineComponent({
  name: 'HbTreeRows',
  props: {
    nodes: { type: Array as PropType<HbTreeNode[]>, required: true },
    level: { type: Number, required: true },
    open: { type: Array as PropType<string[]>, required: true },
    picked: { type: String, required: true },
  },
  setup(p) {
    const row = (n: HbTreeNode, i: number, all: HbTreeNode[]): VNode => {
      const branch = !!n.children?.length
      return h('li', {
        role: 'treeitem',
        class: 'hb-tree-item',
        'data-id': n.id,
        'aria-level': p.level,
        'aria-setsize': all.length,
        'aria-posinset': i + 1,
        'aria-expanded': branch ? String(p.open.includes(n.id)) : undefined,
        'aria-selected': n.id === p.picked ? 'true' : undefined,
      }, [
        h('span', { class: 'hb-tree-row' }, [
          h('span', { class: 'hb-tree-twist', 'aria-hidden': 'true' }),
          h('span', { class: 'hb-tree-label' }, n.label),
          n.sub ? h('span', { class: 'hb-tree-sub' }, n.sub) : null,
        ]),
        branch ? h('ul', { role: 'group', class: 'hb-tree-group' }, n.children!.map(row)) : null,
      ])
    }
    return () => p.nodes.map(row)
  },
})

const el = ref<HTMLElement | null>(null)
let handle: TreeHandle | null = null
onMounted(() => {
  if (!el.value) return
  handle = tree(el.value, {
    onSelect(id) { model.value = id },
    onToggle(id, open) {
      const set = new Set(expanded.value)
      if (open) set.add(id)
      else set.delete(id)
      expanded.value = [...set]
    },
  })
})
onUpdated(() => handle?.refresh())
watch(model, (v) => { if (handle && v && handle.value !== v) handle.select(v) })
onBeforeUnmount(() => handle?.dispose())
</script>

<template>
  <ul
    ref="el"
    class="hb-tree"
    role="tree"
    :aria-label="props.label"
    :style="props.maxHeight ? { '--hb-tree-h': props.maxHeight } : undefined"
  >
    <Rows :nodes="props.nodes" :level="1" :open="expanded" :picked="model" />
  </ul>
</template>
