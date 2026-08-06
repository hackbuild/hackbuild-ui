<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'

interface Props {
  /** Target time: Date, timestamp, or parseable string. */
  until: Date | number | string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  done: []
}>()

const now = ref(Date.now())
let timer: ReturnType<typeof setInterval> | undefined
let fired = false

const target = computed(() => new Date(props.until).getTime())
const remaining = computed(() => Math.max(0, target.value - now.value))

const parts = computed(() => {
  const total = Math.floor(remaining.value / 1000)
  return [
    { n: Math.floor(total / 86400), label: 'days' },
    { n: Math.floor((total % 86400) / 3600), label: 'hrs' },
    { n: Math.floor((total % 3600) / 60), label: 'min' },
    { n: total % 60, label: 'sec' },
  ]
})

function pad(value: number): string {
  return String(value).padStart(2, '0')
}

onMounted(() => {
  timer = setInterval(() => {
    now.value = Date.now()
    if (!fired && remaining.value === 0) {
      fired = true
      emit('done')
    }
  }, 1000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<template>
  <!-- Contest deadlines, drop timers. VT323 blocks on ink plates. -->
  <div class="hb-countdown" :class="{ 'is-done': remaining === 0 }" role="timer">
    <div v-for="part in parts" :key="part.label" class="hb-countdown-cell">
      <span class="n">{{ pad(part.n) }}</span>
      <span class="hb-label">{{ part.label }}</span>
    </div>
  </div>
</template>
