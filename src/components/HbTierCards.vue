<script setup lang="ts">
import { Comment, computed, onBeforeUnmount, onMounted, ref, useSlots, watch, type VNode } from 'vue'
import { chipGroup, type ChipGroupHandle } from '../vanilla/choice'
import { uid } from '../utils/uid'

export interface HbTier {
  key: string
  /** The tier name: 'no model', 'in this tab', or a persona tier such as 'haunted'. */
  label: string
  /** The model or engine behind it: 'hermes 3 llama 3.1 8b'. */
  sub?: string
  /** Size badge: '4.7 gb (vendor)', 'api', 'none'. */
  size?: string
  /** Who pays: 'free, runs on your gpu'. */
  cost?: string
  /** Where the words go: 'nothing leaves this machine'. */
  privacy?: string
  /** One sentence on what this tier does well and badly. */
  note?: string
  /** Capability bar, 0 to 1. */
  bar?: number
  disabled?: boolean
  /** Why it is off: 'no webgpu adapter'. */
  reason?: string
  /** The tier tried and failed; the reason line: 'load failed: out of gpu memory'.
      The card stays pickable so the user can try again or pick another. */
  error?: string
}

interface Props {
  tiers: HbTier[]
  label?: string
  /** Show the start button. Off: the cards are only a choice. */
  start?: boolean
  startLabel?: string
  /** Start also waits on this: a valid key for the remote tier. */
  canStart?: boolean
  /** Footer words; default echoes the pick. */
  foot?: string
}

const props = withDefaults(defineProps<Props>(), {
  label: 'engine',
  start: false,
  startLabel: 'start',
  canStart: true,
  foot: '',
})

const model = defineModel<string>({ default: '' })
const emit = defineEmits<{ start: [key: string] }>()

const picked = computed(() => props.tiers.find((t) => t.key === model.value))
const footText = computed(() => {
  if (props.foot) return props.foot
  const t = picked.value
  if (!t) return 'pick a tier to start.'
  return `picked: ${t.label}${[t.sub, t.size].filter(Boolean).length ? ` (${[t.sub, t.size].filter(Boolean).join(', ')})` : ''}`
})

const id = uid('hb-tier')
const slots = useSlots()
// The body opens only when the slot draws something for this tier.
function drawn(nodes: VNode[] | undefined): boolean {
  return !!nodes?.some((n) => n.type !== Comment && (!Array.isArray(n.children) || drawn(n.children as VNode[])))
}
function hasBody(t: HbTier): boolean {
  return !!slots.body && drawn(slots.body({ tier: t }))
}
const el = ref<HTMLElement | null>(null)
let handle: ChipGroupHandle | null = null
onMounted(() => {
  if (!el.value) return
  handle = chipGroup(el.value, { value: model.value ? [model.value] : [], onChange(v) { model.value = v[0] ?? '' } })
})
watch(model, (v) => { if (handle && handle.value[0] !== v) handle.set(v ? [v] : []) })
watch(() => props.tiers.map((t) => t.key + t.disabled).join(), () => handle?.set(model.value ? [model.value] : []))
onBeforeUnmount(() => handle?.dispose())
</script>

<template>
  <div class="hb-tiers">
    <div ref="el" class="hb-tiers-list" :aria-label="props.label">
      <div
        v-for="t in props.tiers"
        :key="t.key"
        class="hb-tier"
        :class="{ 'is-on': t.key === model, 'is-off': t.disabled, 'is-err': !!t.error && !t.disabled }"
      >
        <button
          type="button"
          class="hb-tier-pick"
          :data-value="t.key"
          :disabled="t.disabled"
          :aria-describedby="(t.disabled && t.reason) || t.error ? `${id}-${t.key}` : undefined"
        >
          <span v-if="$slots.icon" class="hb-tier-icon" aria-hidden="true"><slot name="icon" :tier="t" /></span>
          <span class="hb-tier-main">
            <span class="hb-tier-head">
              <span class="hb-tier-name">{{ t.label }}</span>
              <span v-if="t.size" class="hb-tier-size">{{ t.size }}</span>
            </span>
            <span v-if="t.sub" class="hb-tier-sub">{{ t.sub }}</span>
            <span v-if="t.cost || t.privacy" class="hb-tier-terms">
              <span v-if="t.cost">{{ t.cost }}</span>
              <span v-if="t.privacy">{{ t.privacy }}</span>
            </span>
            <span v-if="t.note" class="hb-tier-note">{{ t.note }}</span>
            <span v-if="t.bar !== undefined" class="hb-tier-bar" aria-hidden="true"><i :style="{ width: Math.round(t.bar * 100) + '%' }" /></span>
            <span v-if="t.disabled && t.reason" :id="`${id}-${t.key}`" class="hb-tier-why">{{ t.reason }}</span>
            <span v-else-if="t.error" :id="`${id}-${t.key}`" class="hb-tier-err"><span class="hb-led is-err" aria-hidden="true" />failed: {{ t.error }}</span>
          </span>
        </button>
        <div v-if="t.key === model && hasBody(t)" class="hb-tier-body"><slot name="body" :tier="t" /></div>
      </div>
    </div>
    <div v-if="props.start || props.foot || $slots.foot" class="hb-tiers-foot">
      <span class="hb-tiers-echo" aria-live="polite"><slot name="foot" :tier="picked">{{ footText }}</slot></span>
      <button
        v-if="props.start"
        type="button"
        class="hb-btn"
        :disabled="!picked || !props.canStart"
        @click="picked && emit('start', picked.key)"
      >{{ props.startLabel }}</button>
    </div>
  </div>
</template>
