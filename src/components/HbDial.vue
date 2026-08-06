<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  /** Integer places shown. */
  digits?: number
  /** Decimal places shown. */
  decimals?: number
  /** Unit shown after the figure, for example MHz. */
  unit?: string
  min?: number
  max?: number
  /** Read only display, digits stop responding. */
  readonly?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  digits: 3,
  decimals: 3,
  unit: '',
  min: 0,
  max: Number.MAX_SAFE_INTEGER,
  readonly: false,
})

const model = defineModel<number>({ default: 0 })

interface DialChar {
  char: string
  /** Place value for a digit, undefined for the separator. */
  place?: number
}

const chars = computed<DialChar[]>(() => {
  const fixed = Math.abs(model.value).toFixed(props.decimals)
  const [rawInt, rawFrac = ''] = fixed.split('.')
  const int = rawInt.padStart(props.digits, '0').slice(-props.digits)
  const out: DialChar[] = []
  for (let i = 0; i < int.length; i++) {
    out.push({ char: int[i], place: 10 ** (int.length - 1 - i) })
  }
  if (props.decimals > 0) {
    out.push({ char: '.' })
    for (let i = 0; i < rawFrac.length; i++) {
      out.push({ char: rawFrac[i], place: 10 ** -(i + 1) })
    }
  }
  return out
})

function nudge(place: number | undefined, direction: 1 | -1) {
  if (props.readonly || place === undefined) return
  const next = model.value + place * direction
  // Snap away float drift from fractional place values.
  const snapped = Number(next.toFixed(Math.max(props.decimals, 0)))
  model.value = Math.min(props.max, Math.max(props.min, snapped))
}

function onDigitClick(event: MouseEvent, place: number | undefined) {
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
  const up = event.clientY < rect.top + rect.height / 2
  nudge(place, up ? 1 : -1)
}

function onDigitWheel(event: WheelEvent, place: number | undefined) {
  if (props.readonly || place === undefined) return
  event.preventDefault()
  nudge(place, event.deltaY < 0 ? 1 : -1)
}
</script>

<template>
  <!-- One giant primary readout per tool, and only one. Click the top half
       of a digit to raise it, the bottom half to lower it. -->
  <div class="hb-dial">
    <template v-for="(item, index) in chars" :key="index">
      <span v-if="item.place === undefined" class="sep">{{ item.char }}</span>
      <span
        v-else
        class="d"
        @click="onDigitClick($event, item.place)"
        @wheel="onDigitWheel($event, item.place)"
      >{{ item.char }}</span>
    </template>
    <span v-if="props.unit" class="u">{{ props.unit }}</span>
  </div>
</template>
