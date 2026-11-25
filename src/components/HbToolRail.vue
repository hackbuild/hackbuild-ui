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
      <button
        v-for="t in props.tools"
        :key="t.id"
        type="button"
        class="hb-toolrail-btn"
        :data-tool="t.id"
        :data-key="t.key"
        :data-hint="t.hint"
        :aria-label="t.label"
        :aria-keyshortcuts="t.key?.toUpperCase()"
        :title="t.key ? `${t.label} (${t.key.toUpperCase()})` : t.label"
      >
        <HbIcon :name="t.icon" :size="18" />
        <span v-if="t.key" class="hb-toolrail-key" aria-hidden="true">{{ t.key.toUpperCase() }}</span>
      </button>
    </div>
    <p v-if="props.showHint && current?.hint" class="hb-toolrail-hint" aria-live="polite">{{ current.hint }}</p>
  </div>
</template>
