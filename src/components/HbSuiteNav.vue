<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { tabs as tabsBehaviour, type TabsHandle } from '../vanilla/tabs'
import { searchList, type SearchListHandle } from '../vanilla/search'
import { useHotkeys } from '../composables/useHotkeys'
import HbDrawer from './HbDrawer.vue'
import HbIcon from './HbIcon.vue'

export interface HbSuiteTool {
  key: string
  label: string
  /** What the tool needs from the machine: webgpu, camera. Shown in the
      sheet and matched by its search. */
  needs?: string[]
}

export interface HbSuiteGroup {
  key: string
  label: string
  tools: HbSuiteTool[]
}

interface Props {
  groups: HbSuiteGroup[]
  /** auto: tabs and tool chips from 761 px of container width, the
      "group / tool" button and its sheet below. sheet and strip force one. */
  layout?: 'auto' | 'sheet' | 'strip'
  /** Bind alt+1 to alt+9 to the groups and [ and ] to the previous and
      next tool, in the shared hotkey registry. */
  keys?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  layout: 'auto',
  keys: false,
})

/** The current tool's key. */
const route = defineModel<string>('route', { default: '' })

defineSlots<{
  /** One tool, in the chips and in the sheet. */
  item?(props: { tool: HbSuiteTool; group: HbSuiteGroup; on: boolean }): unknown
  /** The tool's verbs, after the chips in the toolbar row. */
  toolbar?(): unknown
}>()

const groupOf = (key: string) => props.groups.find((g) => g.tools.some((t) => t.key === key))
const group = computed(() => groupOf(route.value) ?? props.groups[0])
const tool = computed(() => group.value?.tools.find((t) => t.key === route.value) ?? group.value?.tools[0])
// The last tool used in each group, so a group tab returns to it.
const last = new Map<string, string>()
watch(route, (k) => { const g = groupOf(k); if (g) last.set(g.key, k) }, { immediate: true })

function go(key: string) {
  route.value = key
}
function goGroup(gkey: string) {
  const g = props.groups.find((x) => x.key === gkey)
  if (!g || g.key === group.value?.key) return
  const to = last.get(g.key) ?? g.tools[0]?.key
  if (to) go(to)
}
function step(d: number) {
  const list = group.value?.tools ?? []
  const at = list.findIndex((t) => t.key === tool.value?.key)
  const next = list[(at + d + list.length) % list.length]
  if (next) go(next.key)
}

const strip = ref<HTMLElement | null>(null)
let tabsHandle: TabsHandle | null = null
onMounted(() => {
  if (!strip.value) return
  tabsHandle = tabsBehaviour(strip.value, { value: group.value?.key, onChange: (v) => goGroup(v) })
})
watch(() => group.value?.key, (k) => { if (k && tabsHandle && tabsHandle.value !== k) tabsHandle.select(k) })
watch(() => props.groups, () => nextTick(() => { if (group.value) tabsHandle?.select(group.value.key) }), { deep: true })

// The sheet: grouped list with a search field, the search the vanilla
// searchList's (combobox, arrows, Enter, Escape clears).
const sheet = ref(false)
const search = ref<HTMLInputElement | null>(null)
const list = ref<HTMLElement | null>(null)
const empty = ref<HTMLElement | null>(null)
let searchHandle: SearchListHandle | null = null
watch(sheet, async (open) => {
  searchHandle?.dispose()
  searchHandle = null
  if (!open) return
  await nextTick()
  await nextTick()
  if (!search.value || !list.value) return
  searchHandle = searchList(search.value, list.value, {
    empty: empty.value,
    onPick(item) {
      const k = item.dataset.key
      if (k) go(k)
      sheet.value = false
    },
  })
  const cur = list.value.querySelector<HTMLElement>('[aria-current="page"]')
  if (cur) searchHandle.setActive(cur)
})

if (props.keys) {
  useHotkeys([
    ...props.groups.slice(0, 9).map((g, i) => ({
      keys: `alt+${i + 1}`, label: g.label, group: 'groups', run: () => goGroup(g.key),
    })),
    { keys: '[', label: 'previous tool', group: 'groups', run: () => step(-1) },
    { keys: ']', label: 'next tool', group: 'groups', run: () => step(1) },
  ])
}

onBeforeUnmount(() => {
  tabsHandle?.dispose()
  searchHandle?.dispose()
})

const searchText = (g: HbSuiteGroup, t: HbSuiteTool) => [g.label, t.label, ...(t.needs ?? [])].join(' ')
</script>

<template>
  <nav class="hb-suitenav" :class="{ 'is-sheet': props.layout === 'sheet', 'is-strip': props.layout === 'strip' }" aria-label="tools">
    <div class="hb-suitenav-wide">
      <div ref="strip" class="hb-tabs hb-suitenav-groups" role="tablist" aria-label="groups">
        <button
          v-for="g in props.groups"
          :key="g.key"
          type="button"
          class="hb-tab"
          role="tab"
          :data-value="g.key"
          :aria-selected="g.key === group?.key"
        >{{ g.label }}</button>
      </div>
    </div>
    <div class="hb-suitenav-phone">
      <button type="button" class="hb-suitenav-btn" aria-haspopup="dialog" :aria-expanded="sheet" @click="sheet = true">
        <span class="hb-suitenav-path">{{ group?.label }}<b>/</b>{{ tool?.label }}</span>
        <HbIcon name="arrow-down" :size="12" />
      </button>
    </div>
    <div class="hb-bar hb-suitenav-bar">
      <div v-if="group && group.tools.length > 1" class="hb-suitenav-tools" role="group" :aria-label="`${group.label} tools`">
        <button
          v-for="t in group.tools"
          :key="t.key"
          type="button"
          class="hb-chip"
          :class="{ 'is-on': t.key === tool?.key }"
          :aria-current="t.key === tool?.key ? 'page' : undefined"
          @click="go(t.key)"
        >
          <slot name="item" :tool="t" :group="group" :on="t.key === tool?.key">{{ t.label }}</slot>
        </button>
      </div>
      <slot name="toolbar" />
    </div>
    <HbDrawer v-model="sheet" side="bottom" title="tools">
      <div class="hb-suitenav-sheet">
        <input ref="search" class="hb-input" type="search" placeholder="search tools" aria-label="search tools" />
        <div ref="list" class="hb-suitenav-list" role="listbox" aria-label="tools">
          <div v-for="g in props.groups" :key="g.key" role="group" :aria-label="g.label">
            <span class="hb-suitenav-head" aria-hidden="true">{{ g.label }}</span>
            <button
              v-for="t in g.tools"
              :key="t.key"
              type="button"
              class="hb-suitenav-opt"
              role="option"
              tabindex="-1"
              :data-key="t.key"
              :data-search="searchText(g, t)"
              :aria-current="t.key === tool?.key ? 'page' : undefined"
            >
              <slot name="item" :tool="t" :group="g" :on="t.key === tool?.key">
                <span>{{ t.label }}</span>
                <small v-if="t.needs?.length">{{ t.needs.join(', ') }}</small>
              </slot>
            </button>
          </div>
        </div>
        <p ref="empty" class="hb-suitenav-empty" hidden>nothing matches that.</p>
      </div>
    </HbDrawer>
  </nav>
</template>
