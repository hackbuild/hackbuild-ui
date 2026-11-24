<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue'
import { summarize, percentText, type Activity, type ActivityTask } from '../vanilla/activity'
import { menu, type MenuHandle } from '../vanilla/menu'
import HbSpinner from './HbSpinner.vue'

interface Props {
  /** Oldest first. Or pass `source` and leave this out. */
  tasks?: ActivityTask[]
  /** An activity() store; the line follows it. */
  source?: Pick<Activity, 'list' | 'subscribe' | 'cancel'>
}

const props = withDefaults(defineProps<Props>(), {
  tasks: undefined,
  source: undefined,
})

const emit = defineEmits<{
  /** A task's cancel was chosen. With a source the store runs it too. */
  cancel: [key: string]
}>()

defineSlots<{
  /** The task list under the line. Default: one row per task with cancel. */
  default?(props: { tasks: ActivityTask[] }): unknown
}>()

const fromSource = shallowRef<ActivityTask[]>([])
let off: (() => void) | null = null
watch(() => props.source, (src) => {
  off?.()
  off = null
  if (!src) { fromSource.value = []; return }
  fromSource.value = src.list()
  off = src.subscribe((t) => { fromSource.value = t })
}, { immediate: true })

const list = computed(() => props.tasks ?? fromSource.value)
const s = computed(() => summarize(list.value))
const fill = computed(() => {
  const f = s.value.first?.fraction
  return f === null || f === undefined ? undefined : { width: `${Math.round(f * 100)}%` }
})

const wrap = ref<HTMLElement | null>(null)
const panel = ref<HTMLElement | null>(null)
let handle: MenuHandle | null = null
onMounted(() => {
  if (!wrap.value || !panel.value) return
  const trigger = wrap.value.querySelector<HTMLElement>('.hb-activity-btn')
  if (!trigger) return
  handle = menu(wrap.value, {
    trigger,
    menu: panel.value,
    onSelect(value) {
      if (!value) return
      props.source?.cancel(value)
      emit('cancel', value)
    },
  })
})
onBeforeUnmount(() => {
  off?.()
  handle?.dispose()
})
</script>

<template>
  <!-- The 2 px line is a sibling, so it sits on the bottom edge of the
       nearest positioned ancestor: the header carries position relative. -->
  <div ref="wrap" class="hb-menu-wrap hb-activity" :class="{ 'is-known': fill, 'is-err': s.first?.error }" :hidden="!s.first">
    <button type="button" class="hb-activity-btn" :title="s.detail">
      <HbSpinner v-if="!s.first?.error" />
      <span class="hb-activity-label">{{ s.first?.label }}</span><span class="hb-activity-pct">{{ s.first?.error ? ' failed' : s.percent }}</span>
      <span v-if="s.more" class="hb-activity-more">+{{ s.more }}</span>
    </button>
    <span class="hb-sr" role="status">{{ s.first ? `${s.first.label}${s.first.error ? ' failed' : s.percent}` : '' }}</span>
    <div ref="panel" class="hb-menu is-right hb-activity-list" hidden>
      <slot :tasks="list">
        <template v-for="t in list" :key="t.key">
          <button
            type="button"
            class="hb-menu-item"
            :data-value="t.cancel ? t.key : ''"
            :disabled="!t.cancel"
          >
            <span class="hb-activity-row">{{ t.label }}{{ t.error ? `: ${t.error}` : percentText(t.fraction) }}</span>
            <span v-if="t.cancel">cancel</span>
          </button>
        </template>
      </slot>
    </div>
  </div>
  <span v-if="s.first" class="hb-activity-line" :class="{ 'is-known': fill, 'is-err': s.first.error }" aria-hidden="true"><span class="hb-activity-fill" :style="fill" /></span>
</template>
