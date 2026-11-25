<script lang="ts">
let seq = 0
</script>

<script setup lang="ts">
export interface Props {
  /** VT323 head: 'dog eye', 'depth'. */
  title: string
  /** Quieter value at the right end of the head. */
  aux?: string
  /** CSS aspect ratio of the media well. */
  ratio?: string
  /** The head hides and shows the media. */
  collapsible?: boolean
  /** Views of the same data, picked in the head: ['depth', 'mask', 'cutout']. */
  modes?: string[]
  /** Who the inset sees, switched in the head: ['dog', 'you']. */
  who?: string[]
}

const props = withDefaults(defineProps<Props>(), { aux: '', ratio: '4/3', collapsible: false, modes: () => [], who: () => [] })

/** Media shown. Only read with `collapsible`. */
const open = defineModel<boolean>('open', { default: true })
/** The view picked from `modes`. */
const mode = defineModel<string>('mode', { default: '' })
/** The one picked from `who`. */
const whoPicked = defineModel<string>('sees', { default: '' })

seq += 1
/** Width over height from `ratio` ('16 / 9', '4/3', '1.5'), so the stage
    can hold the inset to a share of its height at this ratio. */
const k = (() => {
  const [a, b] = props.ratio.split('/').map((x) => parseFloat(x))
  const v = b ? a! / b : a!
  return Number.isFinite(v) && v > 0 ? +v.toFixed(4) : 4 / 3
})()
const mediaId = `hb-inset-${seq}`

/** On a stage under 561 px the mode bar folds into one head button that
    cycles the modes (CLEVIS), so the inset keeps its height down. */
const current = () => mode.value || props.modes[0] || ''
function cycle() {
  const i = props.modes.indexOf(current())
  mode.value = props.modes[(i + 1) % props.modes.length] ?? ''
}
const nextOf = () => props.modes[(props.modes.indexOf(current()) + 1) % props.modes.length] ?? ''
</script>

<template>
  <!-- One line head: title and aux, cut with an ellipsis, never wrapped.
       View modes sit on a bar under it. -->
  <figure class="hb-inset" :class="{ 'is-closed': props.collapsible && !open }" :style="{ '--hb-inset-k': k }">
    <div class="hb-inset-hd">
      <button
        v-if="props.collapsible"
        type="button"
        class="hb-inset-toggle"
        :aria-expanded="open"
        :aria-controls="mediaId"
        @click="open = !open"
      ><span class="hb-inset-caret" aria-hidden="true">{{ open ? '-' : '+' }}</span><span class="hb-inset-title">{{ props.title }}</span></button>
      <span v-else class="hb-inset-title">{{ props.title }}</span>
      <span v-if="props.who.length > 1" class="hb-inset-who" role="group" :aria-label="`${props.title} sees`">
        <button v-for="w in props.who" :key="w" type="button" :aria-pressed="(whoPicked || props.who[0]) === w" @click="whoPicked = w">{{ w }}</button>
      </span>
      <span v-if="props.aux || $slots.head" class="hb-hd-aux"><slot name="head">{{ props.aux }}</slot></span>
      <button
        v-if="props.modes.length > 1 && (!props.collapsible || open)"
        type="button"
        class="hb-inset-cycle"
        :aria-label="`${props.title} view ${current()}, press for ${nextOf()}`"
        @click="cycle"
      >{{ current() }}</button>
    </div>
    <div v-if="props.modes.length && (!props.collapsible || open)" class="hb-inset-modes" role="group" :aria-label="`${props.title} view`">
      <button
        v-for="m in props.modes"
        :key="m"
        type="button"
        class="hb-inset-mode"
        :aria-pressed="(mode || props.modes[0]) === m"
        @click="mode = m"
      >{{ m }}</button>
    </div>
    <div v-show="!props.collapsible || open" :id="mediaId" class="hb-inset-media" :style="{ '--hb-inset-ratio': props.ratio }"><slot /></div>
  </figure>
</template>
