<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import HbMark from './HbMark.vue'
import { toolSwitch, type SwitchTool, type ToolSwitchHandle } from '../vanilla/switcher'

export type HbSwitchTool = SwitchTool

interface Props {
  /** The tool name, not hack.build. The mark carries the brand. */
  title?: string
  /** Trailing part of the title rendered pink, usually a dot or a suffix. */
  accent?: string
  /** Rendered after the accent in paper, so only the accent is pink:
      title PIP, accent '.', suffix 'bench'. */
  suffix?: string
  /** The tagline, shown at reduced opacity, dropped below 900 px. */
  tagline?: string
  /** brand: the brand line in Libre Baskerville italic. tool: a tool
      tagline in Special Elite. */
  taglineKind?: 'brand' | 'tool'
  /** Hide the built in mark when slotting a custom logo. */
  mark?: boolean
  /** The ink bar with the pink rule, for brand pages and docs. Tools take
      the light 52 px bar (the default since 0.10.0). */
  ink?: boolean
  /** The tools the name switches to. With them the name is the switcher
      button: Permanent Marker, a small chevron, a menu of tools. */
  tools?: SwitchTool[]
  /** The tool on screen, marked in the menu. */
  current?: string
}

const props = withDefaults(defineProps<Props>(), {
  accent: '',
  suffix: '',
  tagline: '',
  taglineKind: 'brand',
  mark: true,
  ink: false,
  tools: () => [],
  current: '',
})

const emit = defineEmits<{
  /** A tool was picked in the switcher. A link item also navigates. */
  switch: [id: string]
}>()

const sw = ref<HTMLElement | null>(null)
let handle: ToolSwitchHandle | null = null
function bind() {
  handle?.dispose()
  handle = null
  if (!sw.value) return
  handle = toolSwitch(sw.value, { current: props.current, onPick: (id) => emit('switch', id) })
}
onMounted(bind)
watch(() => props.tools.map((t) => t.id).join(' '), () => nextTick(bind))
watch(() => props.current, (v) => handle?.setCurrent(v))
onBeforeUnmount(() => handle?.dispose())
</script>

<template>
  <!-- Identity and state. No verbs in here: those live in the toolbar. -->
  <header class="hb-header" :class="{ 'is-ink': props.ink, 'hb-on-ink': props.ink }" data-ux="bar">
    <slot name="logo">
      <HbMark v-if="props.mark" class="hb-logo" :reversed="props.ink" :size="28" />
    </slot>
    <slot name="tool">
    <div v-if="props.title && props.tools.length" ref="sw" class="hb-toolswitch hb-menu-wrap">
      <h1><button type="button" class="hb-toolswitch-btn" :aria-label="`${props.title}, switch tool`"><span class="hb-toolswitch-name">{{ props.title }}</span><span v-if="props.accent">{{ props.accent }}</span><span v-if="props.suffix" class="hb-suffix">{{ props.suffix }}</span></button></h1>
      <div class="hb-menu hb-toolswitch-menu" role="menu" hidden>
        <component
          :is="t.href ? 'a' : 'button'"
          v-for="t in props.tools"
          :key="t.id"
          :type="t.href ? undefined : 'button'"
          :href="t.href"
          class="hb-menu-item hb-toolswitch-item"
          :data-value="t.id"
        ><span class="hb-toolswitch-item-name">{{ t.label }}</span><span v-if="t.note" class="hb-toolswitch-item-note">{{ t.note }}</span></component>
      </div>
    </div>
    <h1 v-else-if="props.title">{{ props.title }}<span v-if="props.accent">{{ props.accent }}</span><span v-if="props.suffix" class="hb-suffix">{{ props.suffix }}</span></h1>
    </slot>
    <slot />
    <span v-if="props.tagline" class="hb-tagline" :class="{ 'is-tool': props.taglineKind === 'tool' }">{{ props.tagline }}</span>
  </header>
</template>
