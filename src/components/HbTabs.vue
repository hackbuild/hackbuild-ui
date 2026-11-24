<script lang="ts">
let seq = 0
</script>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, useSlots, watch } from 'vue'
import { tabs as tabsBehaviour, type TabsHandle } from '../vanilla/tabs'
import { usePersisted } from '../composables/usePersisted'
import { useCollapse } from '../composables/useCollapse'
import HbSelect from './HbSelect.vue'

export interface HbTabOption {
  label: string
  value: string | number
  /** Finished: a numbered tab fills its number green. */
  done?: boolean
  /** Shown in the panel instead of the slot while set. Set it while the
      tab has nothing to show, naming the first thing to do there. */
  emptyHint?: string
}

export interface Props {
  /** Three to eight destinations, nothing else in the strip. */
  tabs: Array<HbTabOption | string>
  /** Accessible name of the strip. */
  label?: string
  /** Ties each tab to its panel: tab `${idPrefix}-tab-${value}` controls
      `${idPrefix}-panel-${value}`. Give the panel that id, role="tabpanel"
      and aria-labelledby the tab id. With a default slot the component
      renders that panel itself. */
  idPrefix?: string
  /** Number the tabs: the numbers are the order of work. */
  num?: boolean
  /** Remember the chosen tab in localStorage under `hb.tabs.<key>`. */
  persistKey?: string
  /** 'collapse' swaps the strip for a select before a tab would clip, with
      the HbSteps measure; 'scroll' scrolls the strip sideways. */
  overflow?: 'collapse' | 'scroll'
}

const props = withDefaults(defineProps<Props>(), {
  label: undefined,
  idPrefix: '',
  num: false,
  persistKey: undefined,
  overflow: 'collapse',
})

const model = defineModel<string | number>()
const slots = useSlots()

const normalized = computed<HbTabOption[]>(() =>
  props.tabs.map((tab) => (typeof tab === 'object' ? tab : { label: tab, value: tab })),
)
const current = computed(() => {
  const i = normalized.value.findIndex((t) => t.value === model.value)
  return i < 0 ? 0 : i
})
const currentTab = computed(() => normalized.value[current.value])

const saved = props.persistKey ? usePersisted<string | number | null>(`hb.tabs.${props.persistKey}`, null) : null
if (saved && saved.value !== null && normalized.value.some((t) => t.value === saved.value)) model.value = saved.value
watch(model, (v) => { if (saved) saved.value = v ?? null })

defineOptions({ inheritAttrs: false })
const ownPrefix = `hb-tabs-${++seq}`
const prefix = computed(() => props.idPrefix || (slots.default ? ownPrefix : ''))
const tabId = (t: HbTabOption) => (prefix.value ? `${prefix.value}-tab-${t.value}` : undefined)
const panelId = (t: HbTabOption) => (prefix.value ? `${prefix.value}-panel-${t.value}` : undefined)

const host = ref<HTMLElement | null>(null)
const strip = ref<HTMLElement | null>(null)
const buttons = ref<HTMLButtonElement[]>([])
const { collapsed, measure } = useCollapse(host, strip, buttons, () => props.overflow === 'collapse')
watch(() => [props.tabs, props.num], () => nextTick(measure), { deep: true })

const options = computed(() =>
  normalized.value.map((t, i) => ({
    label: `${props.num ? `${i + 1} ` : ''}${t.label}${t.done ? ', done' : ''}`,
    value: t.value,
  })),
)

// Keys, roving focus and panel hiding are the vanilla tabs'. The handle
// lives while the strip is in the page; the select replaces it when the
// strip collapses.
let handle: TabsHandle | null = null
watch(strip, (el) => {
  handle?.dispose()
  handle = null
  if (!el) return
  handle = tabsBehaviour(el, {
    value: String(current.value),
    onChange: (_value, index) => {
      const t = normalized.value[index]
      if (t) model.value = t.value
    },
  })
}, { flush: 'post' })
watch(current, (i) => {
  if (handle && handle.index !== i) handle.select(i)
}, { flush: 'post' })
onBeforeUnmount(() => handle?.dispose())
</script>

<template>
  <div ref="host" class="hb-tabs-host" v-bind="$attrs">
    <HbSelect
      v-if="collapsed"
      class="hb-tabs-select"
      :model-value="model ?? normalized[0]?.value"
      :options="options"
      :aria-label="props.label"
      @update:model-value="model = $event"
    />
    <nav v-else ref="strip" class="hb-tabs" :class="{ 'is-num': props.num }" role="tablist" :aria-label="props.label">
      <button
        v-for="(tab, index) in normalized"
        :id="tabId(tab)"
        :key="tab.value"
        ref="buttons"
        type="button"
        role="tab"
        class="hb-tab"
        :class="{ 'is-done': tab.done }"
        :data-value="index"
        :aria-selected="index === current"
        :aria-controls="panelId(tab)"
        :tabindex="index === current ? 0 : -1"
      >
        <span v-if="props.num" class="n" aria-hidden="true">{{ index + 1 }}</span>{{ tab.label }}<span v-if="tab.done" class="hb-sr">, done</span>
      </button>
    </nav>
  </div>
  <div
    v-if="$slots.default && currentTab"
    :id="panelId(currentTab)"
    :key="currentTab.value"
    role="tabpanel"
    class="hb-tabpanel"
    :aria-labelledby="collapsed ? undefined : tabId(currentTab)"
    :aria-label="collapsed ? currentTab.label : undefined"
  >
    <p v-if="currentTab.emptyHint" class="hb-empty-hint">{{ currentTab.emptyHint }}</p>
    <slot v-else :tab="currentTab" :value="currentTab.value" />
  </div>
</template>
