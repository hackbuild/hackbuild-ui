<script setup lang="ts">
import { computed } from 'vue'

export interface HbConsoleLine {
  text: string
  /** Timestamp or prefix, dimmed. */
  t?: string
  level?: 'ok' | 'warn' | 'err' | 'info' | 'hit'
}

interface Props {
  lines: HbConsoleLine[]
  /** Newest line at the top. Pass lines oldest first and leave this on. */
  newestFirst?: boolean
  /** CSS height. */
  height?: string
}

const props = withDefaults(defineProps<Props>(), {
  newestFirst: true,
  height: '180px',
})

const ordered = computed(() =>
  props.newestFirst ? [...props.lines].reverse() : props.lines,
)
</script>

<template>
  <div class="hb-console" :style="{ height: props.height }" role="log">
    <div v-for="(line, index) in ordered" :key="index">
      <span v-if="line.t" class="t">{{ line.t }}</span>
      <span :class="line.level">{{ line.text }}</span>
    </div>
  </div>
</template>
