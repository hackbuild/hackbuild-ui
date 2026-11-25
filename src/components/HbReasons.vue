<script setup lang="ts">
import type { HbCapSpeed } from './HbCapabilities.vue'
import { noteOnce } from '../utils/note'

noteOnce('HbReasons', 'HbReasons is merged since 0.10.0 and goes in 0.11.0; use HbModelSheet row detail')

export interface HbReasonRow {
  /** Key emitted by edit; defaults to the label. */
  key?: string
  label: string
  /** The value picked: 'hermes 3 3b', 'webgpu', '4 threads'. */
  value: string
  /** Why it was picked, one lowercase line. Ignored when changed. */
  why?: string
  /** How fast it runs here. */
  speed?: HbCapSpeed
  /** The person picked it: the reason reads 'your choice'. */
  changed?: boolean
  /** Show an edit button. Default true. */
  edit?: boolean
}

interface Props {
  rows: HbReasonRow[]
  label?: string
  /** Words on each edit button. */
  editLabel?: string
}

const props = withDefaults(defineProps<Props>(), { label: 'defaults and why', editLabel: 'edit' })

const emit = defineEmits<{ edit: [key: string] }>()

const SPEED: Record<HbCapSpeed, string> = { fast: 'fast', ok: 'ok', slow: 'slow', none: 'n/a' }
const keyOf = (r: HbReasonRow) => r.key ?? r.label
</script>

<template>
  <dl class="hb-reasons" :aria-label="props.label">
    <div v-for="r in props.rows" :key="keyOf(r)" class="hb-reason" :class="{ 'is-changed': r.changed }">
      <dt class="hb-reason-label">{{ r.label }}</dt>
      <dd class="hb-reason-body">
        <span class="hb-reason-value">{{ r.value }}</span>
        <span v-if="r.speed" class="hb-cap-speed" :class="`is-${r.speed}`"><span class="hb-sr">speed here: </span>{{ SPEED[r.speed] }}</span>
        <span class="hb-reason-why">{{ r.changed ? 'your choice' : r.why }}</span>
      </dd>
      <dd v-if="r.edit !== false" class="hb-reason-edit">
        <slot name="edit" :row="r">
          <button type="button" class="hb-btn hb-btn-2 hb-btn-sm" @click="emit('edit', keyOf(r))">{{ props.editLabel }}<span class="hb-sr"> {{ r.label }}</span></button>
        </slot>
      </dd>
    </div>
  </dl>
</template>
