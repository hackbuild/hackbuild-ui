<script setup lang="ts">
import { computed, ref } from 'vue'
import type { HbStatusItem } from './HbStatusList.vue'
import HbStatusList from './HbStatusList.vue'
import HbDrawer from './HbDrawer.vue'

interface Props {
  /** One per subsystem: brain, voice, ears, eyes, memory, gpu. */
  items: HbStatusItem[]
  /** Under 641 px the pills become one button of dots and a ready count
      that opens the status list in a sheet. Off: pills at every width. */
  compact?: boolean
  /** Accessible name of the group. */
  label?: string
}

const props = withDefaults(defineProps<Props>(), {
  compact: true,
  label: 'status',
})

const emit = defineEmits<{
  goto: [target: string, key: string]
}>()

const PILL: Record<HbStatusItem['state'], string> = { off: 'is-off', load: 'is-busy', ok: 'is-ok', warn: 'is-warn', err: 'is-err' }

const open = ref(false)
const ready = computed(() => props.items.filter((i) => i.state === 'ok').length)
const summary = computed(() => `${ready.value} of ${props.items.length} ready`)
const failed = computed(() => props.items.some((i) => i.state === 'err'))

function go(target: string, key: string) {
  open.value = false
  emit('goto', target, key)
}
</script>

<template>
  <div class="hb-pills" :class="{ 'is-compact': props.compact }" role="group" :aria-label="props.label">
    <template v-for="it in props.items" :key="it.key">
      <button
        v-if="it.goto"
        type="button"
        class="hb-pill"
        :class="PILL[it.state]"
        :title="it.title"
        @click="emit('goto', it.goto, it.key)"
      >{{ it.label }}</button>
      <span v-else class="hb-pill" :class="PILL[it.state]" :title="it.title">{{ it.label }}</span>
    </template>
    <button
      v-if="props.compact"
      type="button"
      class="hb-pills-dots"
      :class="{ 'is-err': failed }"
      :aria-label="`${props.label}: ${summary}`"
      aria-haspopup="dialog"
      :aria-expanded="open"
      @click="open = true"
    >
      <i v-for="it in props.items" :key="it.key" class="hb-dot" :class="`is-${it.state}`" aria-hidden="true" />
      <span class="hb-pills-count" aria-hidden="true">{{ ready }}/{{ props.items.length }}</span>
    </button>
    <HbDrawer v-if="props.compact" v-model="open" side="bottom" :title="props.label">
      <HbStatusList :items="props.items" @goto="go" />
    </HbDrawer>
  </div>
</template>
