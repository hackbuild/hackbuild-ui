<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, useSlots } from 'vue'
import HbRack from './HbRack.vue'
import HbDrawer from './HbDrawer.vue'
import type { RackTab } from '../vanilla/layout'

interface Props {
  /** Rack tabs (persona, memory) only when the tool has them; none, no rack. */
  tabs?: RackTab[]
  rackLabel?: string
  /** Heading of the chat list rail and its drawer. */
  listLabel?: string
  /** No messages yet: the subject shows the empty state. */
  empty?: boolean
  /** The empty state's one name, in Permanent Marker. */
  emptyName?: string
  /** One or two sentences under it. */
  emptyNote?: string
  verbsLabel?: string
}

const props = withDefaults(defineProps<Props>(), {
  tabs: () => [],
  rackLabel: 'rack',
  listLabel: 'chats',
  empty: false,
  emptyName: 'what are we working on?',
  emptyNote: '',
  verbsLabel: 'actions',
})

const tab = defineModel<string>('tab', { default: '' })
/** The chat list drawer under 901 px; a button in the bar opens it. */
const listOpen = defineModel<boolean>('listOpen', { default: false })
const slots = useSlots()

// From 901 px the chat list is a rail at the left; under it the rail
// becomes a drawer opened from the bar, never hidden away.
const wide = ref(true)
let query: MediaQueryList | null = null
function read() {
  wide.value = query?.matches ?? true
  if (wide.value) listOpen.value = false
}
onMounted(() => {
  if (typeof matchMedia !== 'function') return
  query = matchMedia('(min-width: 901px)')
  query.addEventListener('change', read)
  read()
})
onBeforeUnmount(() => query?.removeEventListener('change', read))

const hasList = computed(() => !!slots.list)
const hasRack = computed(() => props.tabs.length > 0)
</script>

<template>
  <!-- Conversation (clevis): the chat list rail at the left, the
       conversation fills with its empty state in Permanent Marker, the
       composer centred under the messages at their width. Persona and
       memory sit in a right rack only when the tool has them. Under 901 px
       the chat list opens as a drawer from the bar. -->
  <div class="hb-lay hb is-conversation" :class="{ 'has-list': hasList && wide, 'has-rack': hasRack }" data-layout="conversation">
    <div v-if="slots.bar" class="hb-lay-bar" data-ux="bar"><slot name="bar" :open-list="() => (listOpen = true)" :narrow="!wide" /></div>
    <div class="hb-lay-body">
      <nav v-if="hasList && wide" class="hb-lay-list" :aria-label="props.listLabel">
        <div class="hb-lay-listhd">{{ props.listLabel }}<slot name="list-head" /></div>
        <slot name="list" />
      </nav>
      <section class="hb-lay-stage">
        <div class="hb-lay-subject" data-ux="subject" role="log" aria-live="polite">
          <div class="hb-lay-thread">
            <div v-if="props.empty" class="hb-lay-convempty">
              <h2 class="hb-lay-convempty-name">{{ props.emptyName }}</h2>
              <p v-if="props.emptyNote" class="hb-lay-convempty-note">{{ props.emptyNote }}</p>
              <slot name="empty" />
            </div>
            <slot v-else />
          </div>
        </div>
        <div v-if="slots.verbs" class="hb-lay-verbs" data-ux="verbs" role="toolbar" :aria-label="props.verbsLabel"><slot name="verbs" /></div>
        <div v-if="slots.composer" class="hb-lay-composer"><div class="hb-lay-thread"><slot name="composer" /></div></div>
      </section>
      <HbRack v-if="hasRack" v-model:tab="tab" :tabs="props.tabs" :label="props.rackLabel">
        <template v-for="t in props.tabs" :key="t.id" #[t.id]><slot :name="`tab-${t.id}`" /></template>
        <template v-if="slots.detail" #detail><slot name="detail" /></template>
      </HbRack>
    </div>
    <HbDrawer v-if="hasList && !wide" v-model="listOpen" side="left" :title="props.listLabel">
      <div class="hb-lay-list is-drawer"><slot name="list" /></div>
    </HbDrawer>
  </div>
</template>
