<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { menu, type MenuHandle } from '../vanilla/menu'
import HbDrawer from './HbDrawer.vue'
import HbIcon from './HbIcon.vue'
import HbSeg from './HbSeg.vue'

export interface HbWorkspaceProject {
  id: string
  name: string
  /** When it last changed, as words: "2 min ago". */
  updated?: string
}

interface Props {
  /** The open workspace. */
  name: string
  /** Workspaces to switch to. The open one may be in the list. */
  projects?: HbWorkspaceProject[]
  /** Id of the open workspace in `projects`. */
  current?: string
  /** A save, import or export runs: every action waits, and the reason
      slot says why. */
  busy?: boolean
  /** Disclosure levels, cycled by one button under 641 px. */
  levels?: string[]
}

const props = withDefaults(defineProps<Props>(), {
  projects: () => [],
  current: undefined,
  busy: false,
  levels: () => ['guided', 'standard', 'expert'],
})

/** The disclosure level. Leave unbound to show no level control. */
const level = defineModel<string>('level')

const emit = defineEmits<{
  new: []
  open: [id: string]
  rename: []
  duplicate: []
  export: []
  import: []
  delete: []
}>()

defineSlots<{
  /** Why the actions wait, shown while busy. */
  reason?(): unknown
}>()

const ACTIONS = ['new', 'rename', 'duplicate', 'export', 'import', 'delete'] as const
const others = computed(() => props.projects.filter((p) => p.id !== props.current))

function run(value: string) {
  if (props.busy) return
  if (value.startsWith('open:')) emit('open', value.slice(5))
  else if (value === 'new') emit('new')
  else if (value === 'rename') emit('rename')
  else if (value === 'duplicate') emit('duplicate')
  else if (value === 'export') emit('export')
  else if (value === 'import') emit('import')
  else if (value === 'delete') emit('delete')
}

function act(value: string) {
  sheet.value = false
  run(value)
}

function cycle() {
  const at = props.levels.indexOf(level.value ?? '')
  level.value = props.levels[(at + 1) % props.levels.length]
}

const wrap = ref<HTMLElement | null>(null)
const panel = ref<HTMLElement | null>(null)
const sheet = ref(false)
let handle: MenuHandle | null = null
onMounted(() => {
  if (!wrap.value || !panel.value) return
  handle = menu(wrap.value, { menu: panel.value, onSelect: run })
})
onBeforeUnmount(() => handle?.dispose())
</script>

<template>
  <div class="hb-wsmenu">
    <div ref="wrap" class="hb-menu-wrap hb-wsmenu-wide">
      <button type="button" class="hb-wsmenu-btn" :aria-label="`workspace ${props.name}`">
        <span class="hb-wsmenu-name">{{ props.name }}</span>
        <HbIcon name="arrow-down" :size="11" />
      </button>
      <div ref="panel" class="hb-menu hb-wsmenu-menu" hidden>
        <p v-if="props.busy" class="hb-wsmenu-busy"><slot name="reason">saving, the actions wait</slot></p>
        <button type="button" class="hb-menu-item" data-value="new" :disabled="props.busy">new workspace</button>
        <template v-if="others.length">
          <hr class="hb-menu-rule" />
          <button
            v-for="p in others"
            :key="p.id"
            type="button"
            class="hb-menu-item"
            :data-value="`open:${p.id}`"
            :disabled="props.busy"
          >
            <span class="hb-wsmenu-proj">{{ p.name }}</span><small v-if="p.updated">{{ p.updated }}</small>
          </button>
        </template>
        <hr class="hb-menu-rule" />
        <button v-for="a in ACTIONS.slice(1, 5)" :key="a" type="button" class="hb-menu-item" :data-value="a" :disabled="props.busy">{{ a }}</button>
        <hr class="hb-menu-rule" />
        <button type="button" class="hb-menu-item hb-wsmenu-del" data-value="delete" :disabled="props.busy">delete workspace</button>
      </div>
    </div>
    <HbSeg v-if="level !== undefined" v-model="level" class="hb-wsmenu-level" toggle :options="props.levels" />
    <button
      type="button"
      class="hb-iconbtn hb-wsmenu-phone"
      aria-label="workspace menu"
      aria-haspopup="dialog"
      :aria-expanded="sheet"
      @click="sheet = true"
    >
      <HbIcon name="menu" :size="16" />
    </button>
    <HbDrawer v-model="sheet" side="bottom" :title="props.name">
      <div class="hb-wsmenu-sheet">
        <p v-if="props.busy" class="hb-wsmenu-busy"><slot name="reason">saving, the actions wait</slot></p>
        <button v-if="level !== undefined" type="button" class="hb-btn hb-btn-2 hb-btn-block hb-wsmenu-cycle" @click="cycle">
          level: {{ level }}
        </button>
        <div class="hb-wsmenu-acts">
          <button v-for="a in ACTIONS.slice(0, 5)" :key="a" type="button" class="hb-btn hb-btn-2" :disabled="props.busy" @click="act(a)">{{ a }}</button>
        </div>
        <template v-if="others.length">
          <span class="hb-wsmenu-head">open</span>
          <button
            v-for="p in others"
            :key="p.id"
            type="button"
            class="hb-row hb-wsmenu-row"
            :disabled="props.busy"
            @click="act(`open:${p.id}`)"
          >
            <span class="hb-wsmenu-proj">{{ p.name }}</span><small v-if="p.updated">{{ p.updated }}</small>
          </button>
        </template>
        <button type="button" class="hb-btn hb-btn-danger hb-wsmenu-del" :disabled="props.busy" @click="act('delete')">delete workspace</button>
      </div>
    </HbDrawer>
  </div>
</template>
