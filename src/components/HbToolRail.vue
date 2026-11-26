<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { toolRail, type ToolRailHandle } from '../vanilla/choice'
import { sharedHotkeys } from '../composables/useHotkeys'
import type { HbIconName as IconName } from '../icons/stroke'
import HbIcon from './HbIcon.vue'

export interface HbRailTool {
  id: string
  label: string
  icon: IconName
  /** One letter. Printed on the button and bound as a hotkey. */
  key?: string
  /** The gesture for this tool: "click to add points, enter to close". */
  hint?: string
  /** Tools with the same group share one place in the rail; the others open from it. */
  group?: string
}

interface Props {
  tools: HbRailTool[]
  /** vertical beside a stage, horizontal over it on a phone. */
  orientation?: 'vertical' | 'horizontal'
  /** Bind the letters in the shared hotkey registry. */
  keys?: boolean
  /** Show the current tool's hint in a pill under the rail. */
  showHint?: boolean
  label?: string
}

const props = withDefaults(defineProps<Props>(), {
  orientation: 'vertical',
  keys: true,
  showHint: true,
  label: 'tools',
})

const model = defineModel<string>({ default: '' })
const current = computed(() => props.tools.find((t) => t.id === model.value) ?? props.tools[0])
/** The rail in order: a lone tool, or a group at the place of its first tool. */
const segments = computed(() => {
  const out: Array<{ key: string; tool?: HbRailTool; group?: string; tools?: HbRailTool[] }> = []
  const seen = new Map<string, HbRailTool[]>()
  for (const t of props.tools) {
    if (!t.group) { out.push({ key: t.id, tool: t }); continue }
    const list = seen.get(t.group)
    if (list) { list.push(t); continue }
    const fresh = [t]
    seen.set(t.group, fresh)
    out.push({ key: `group-${t.group}`, group: t.group, tools: fresh })
  }
  return out
})
const title = (t: HbRailTool) => (t.key ? `${t.label} (${t.key.toUpperCase()})` : t.label)

const el = ref<HTMLElement | null>(null)
let handle: ToolRailHandle | null = null
function bind() {
  handle?.dispose()
  if (!el.value) return
  handle = toolRail(el.value, {
    value: current.value?.id,
    registry: props.keys ? sharedHotkeys() : undefined,
    group: props.label,
    onChange(id) { model.value = id },
  })
}
onMounted(bind)
watch(() => props.tools, () => nextTick(bind), { deep: true })
watch(model, (v) => { if (handle && v && handle.value !== v) handle.set(v) })
onBeforeUnmount(() => handle?.dispose())
</script>

<template>
  <div class="hb-toolrail-wrap" :class="`is-${props.orientation}`">
    <div ref="el" class="hb-toolrail" role="toolbar" :aria-orientation="props.orientation" :aria-label="props.label">
      <template v-for="seg in segments" :key="seg.key">
        <div v-if="seg.group" class="hb-railgroup" :data-group="seg.group" role="group" :aria-label="seg.group">
          <button
            v-for="t in seg.tools"
            :key="t.id"
            type="button"
            class="hb-toolrail-btn"
            :data-tool="t.id"
            :data-key="t.key"
            :data-hint="t.hint"
            :aria-label="t.label"
            :aria-keyshortcuts="t.key?.toUpperCase()"
            :title="title(t)"
          >
            <HbIcon :name="t.icon" :size="18" />
            <span v-if="t.key" class="hb-toolrail-key" aria-hidden="true">{{ t.key.toUpperCase() }}</span>
          </button>
          <div class="hb-railgroup-menu" role="menu" :aria-label="seg.group" hidden>
            <button v-for="t in seg.tools" :key="t.id" type="button" class="hb-railgroup-item" :data-pick="t.id">
              <HbIcon :name="t.icon" :size="16" /><span>{{ t.label }}</span><kbd v-if="t.key" aria-hidden="true">{{ t.key.toUpperCase() }}</kbd>
            </button>
          </div>
        </div>
        <button
          v-else-if="seg.tool"
          type="button"
          class="hb-toolrail-btn"
          :data-tool="seg.tool.id"
          :data-key="seg.tool.key"
          :data-hint="seg.tool.hint"
          :aria-label="seg.tool.label"
          :aria-keyshortcuts="seg.tool.key?.toUpperCase()"
          :title="title(seg.tool)"
        >
          <HbIcon :name="seg.tool.icon" :size="18" />
          <span v-if="seg.tool.key" class="hb-toolrail-key" aria-hidden="true">{{ seg.tool.key.toUpperCase() }}</span>
        </button>
      </template>
    </div>
    <p v-if="props.showHint && current?.hint" class="hb-toolrail-hint" aria-live="polite">{{ current.hint }}</p>
  </div>
</template>
