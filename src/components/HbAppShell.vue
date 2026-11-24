<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, useSlots } from 'vue'
import { cx } from '../utils/cx'
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
}

const props = withDefaults(defineProps<Props>(), {
  recipe: undefined,
  railLabel: 'rack',
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
const phone = ref(false)
let queries: MediaQueryList[] = []
function read() {
  wide.value = queries[0]?.matches ?? true
  phone.value = !(queries[1]?.matches ?? true)
  if (wide.value) railOpen.value = false
}
onMounted(() => {
  if (typeof matchMedia !== 'function') return
  queries = [matchMedia('(min-width: 901px)'), matchMedia('(min-width: 641px)')]
  for (const q of queries) q.addEventListener('change', read)
  read()
})
onBeforeUnmount(() => {
  for (const q of queries) q.removeEventListener('change', read)
})

const sheet = computed(() => props.recipe === 'rack' && !wide.value && !!slots.rail)
const classes = computed(() =>
  cx('hb-app hb', props.recipe && `is-${props.recipe}`, mode.value && `is-${mode.value}`, {
    'has-dock': !!slots.dock,
    'has-rail': !!slots.rail && !sheet.value,
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
    <div v-if="slots.dock || slots.statusbar" class="hb-app-foot">
      <div v-if="slots.dock" class="hb-dock">
        <slot name="dock" :sheet="sheet" :open-rail="openRail" />
      </div>
      <slot name="statusbar" />
    </div>
    <HbDrawer v-if="sheet" v-model="railOpen" :side="phone ? 'bottom' : 'right'" :title="props.railLabel">
      <div class="hb-rail">
        <slot name="rail" />
      </div>
    </HbDrawer>
  </div>
</template>
