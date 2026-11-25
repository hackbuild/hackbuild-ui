<script setup lang="ts">
import { computed, onBeforeUnmount, onBeforeUpdate, onMounted, ref, useSlots, watch } from 'vue'
import { cx } from '../utils/cx'
import { dockInsets, type DockInsetsHandle } from '../vanilla/insets'
import HbDrawer from './HbDrawer.vue'

export type HbAppMode = 'stage' | 'split' | 'chat'
export type HbAppRecipe = 'rack' | 'bench' | 'transcript'

interface Props {
  /** The shell recipe. rack: stage beside a 360 to 408 px rack of tabs,
      the rack a sheet under 901 px. bench: numbered steps over the work
      and a parameter rail. transcript: a short stage over the transcript,
      the composer in the dock. */
  recipe?: HbAppRecipe
  /** Heading of the rack sheet, also its accessible name. */
  railLabel?: string
  /** Pin the shell to the dynamic viewport at every width: the page never
      scrolls and a viewport with aspect 'fill' in the main column takes
      the height left over the foot. The phone layout for stage plus rack. */
  fit?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  recipe: undefined,
  railLabel: 'rack',
  fit: false,
})

/** View mode where a tool has both a stage and a chat or rack: stage
    hides the rail, chat hides the work column, split shows both. */
const mode = defineModel<HbAppMode>('mode')
/** The rack sheet's open state, for the rack recipe under 901 px. */
const railOpen = defineModel<boolean>('railOpen', { default: false })

const slots = useSlots()

// Under 901 px the shell unpins; the rack recipe moves its rail into a
// drawer there: a bottom sheet under 641 px, a right drawer above.
const wide = ref(true)
let query: MediaQueryList | null = null
function read() {
  wide.value = query?.matches ?? true
  if (wide.value) railOpen.value = false
}
// With a dock, the keyboard inset and the foot height go on the root as
// --hb-kb and --hb-foot-h: the foot lifts over the on-screen keyboard and
// the rack sheet stops at the dock's top edge. A dock can arrive after mount (a tool that teleports its composer in
// later), so whether there is one is read on every render and the insets
// follow the foot element; dockInsets observes its size from then on.
const foot = ref<HTMLElement | null>(null)
const hasDock = ref(!!slots.dock)
onBeforeUpdate(() => { hasDock.value = !!slots.dock })
let insets: DockInsetsHandle | null = null
let footEl: HTMLElement | null = null
function bindInsets() {
  const el = hasDock.value ? foot.value : null
  if (el === footEl) return
  insets?.dispose()
  insets = el ? dockInsets(el) : null
  footEl = el
}
watch([foot, hasDock], bindInsets, { flush: 'post' })
onMounted(() => {
  bindInsets()
  if (typeof matchMedia !== 'function') return
  query = matchMedia('(min-width: 901px)')
  query.addEventListener('change', read)
  read()
})
onBeforeUnmount(() => {
  query?.removeEventListener('change', read)
  insets?.dispose()
  insets = null
})

const sheet = computed(() => props.recipe === 'rack' && !wide.value && !!slots.rail)
const classes = computed(() =>
  cx('hb-app hb', props.recipe && `is-${props.recipe}`, mode.value && `is-${mode.value}`, {
    'has-dock': hasDock.value,
    'has-rail': !!slots.rail && !sheet.value,
    'is-fit': props.fit,
    'is-sheet-open': sheet.value && railOpen.value,
  }),
)
function openRail() {
  railOpen.value = true
}
</script>

<template>
  <!-- Full height tool layout. Header, tabs and status strip pinned, one
       scrolling work column beside one scrolling rail. Below 900 px the
       shell unpins and the rail stacks under the work column, or becomes
       the rack sheet. The dock holds the composer or the primary action
       and stays pinned above the status strip at every width. -->
  <div :class="classes">
    <slot name="header" />
    <slot name="tabs" />
    <slot name="toolbar" />
    <div class="hb-work">
      <div class="hb-main">
        <slot />
      </div>
      <aside v-if="slots.rail && !sheet" class="hb-rail" :aria-label="props.recipe === 'rack' ? props.railLabel : undefined">
        <slot name="rail" />
      </aside>
    </div>
    <div v-if="hasDock || slots.statusbar" ref="foot" class="hb-app-foot">
      <div v-if="hasDock" class="hb-dock">
        <slot name="dock" :sheet="sheet" :open-rail="openRail" />
      </div>
      <slot name="statusbar" />
    </div>
    <HbDrawer v-if="sheet" v-model="railOpen" side="auto" :breakpoint="641" :title="props.railLabel">
      <div class="hb-rail" :class="{ 'is-above-dock': hasDock }">
        <slot name="rail" />
      </div>
    </HbDrawer>
  </div>
</template>
