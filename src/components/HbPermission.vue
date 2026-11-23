<script setup lang="ts">
import { computed } from 'vue'
import { cx } from '../utils/cx'
import HbIcon from './HbIcon.vue'
import HbVerdict, { type HbVerdictStatus } from './HbVerdict.vue'
import type { IconName } from '../icons'

export type HbPermissionState = 'checking' | 'ask' | 'ok' | 'denied' | 'missing'

interface Props {
  /** microphone, camera, webgpu adapter, storage. */
  name: string
  icon?: IconName
  state: HbPermissionState
  /** The reason in words: 'no webgpu adapter. sd-turbo needs it; this page has no wasm path.' */
  reason?: string
  /** Words on the tag; defaults by state. */
  stateText?: string
  /** The one action that can change the state: 'allow', 'try again'. Empty hides it. */
  action?: string
}

const props = withDefaults(defineProps<Props>(), { icon: 'shield-halved', reason: '', stateText: '', action: '' })

const emit = defineEmits<{ act: [] }>()

const VERDICT: Record<HbPermissionState, [HbVerdictStatus, string]> = {
  checking: ['running', 'checking'],
  ask: ['not run', 'not asked'],
  ok: ['pass', 'granted'],
  denied: ['fail', 'blocked'],
  missing: ['warn', 'missing'],
}
const verdict = computed(() => VERDICT[props.state])
const classes = computed(() =>
  cx('hb-perm', {
    'is-ok': props.state === 'ok',
    'is-ask': props.state === 'ask',
    'is-denied': props.state === 'denied',
    'is-missing': props.state === 'missing',
  }),
)
</script>

<template>
  <div :class="classes" role="group" :aria-label="props.name">
    <span class="hb-perm-ic"><HbIcon :name="props.icon" :size="20" /></span>
    <div class="hb-perm-hd">
      <span class="hb-perm-name">{{ props.name }}</span>
      <HbVerdict :status="verdict[0]" :text="props.stateText || verdict[1]" />
    </div>
    <div v-if="props.reason || $slots.default" class="hb-perm-why" :role="props.state === 'denied' || props.state === 'missing' ? 'alert' : undefined"><slot>{{ props.reason }}</slot></div>
    <button v-if="props.action" type="button" class="hb-btn hb-btn-2 hb-btn-sm hb-perm-act" @click="emit('act')">{{ props.action }}</button>
  </div>
</template>
