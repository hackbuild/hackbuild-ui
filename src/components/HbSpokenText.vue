<script setup lang="ts">
import { computed } from 'vue'
import { spokenIndex, toSpoken, type SpokenWord } from '../vanilla/media'

interface Props {
  /** Words, as strings or with times in seconds: `spokenWords` estimates them. */
  words: Array<string | SpokenWord>
  /** Seconds into the line; drives the lit word from the times. */
  time?: number | null
  /** The lit word, from boundary events (`wordAtChar`). Wins over time. */
  active?: number | null
  /** Who speaks, above the words. */
  who?: string
  /** Lines break after a word ending in a comma or a full stop. */
  breaks?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  time: null,
  active: null,
  who: '',
  breaks: false,
})

const list = computed(() => toSpoken(props.words))
const at = computed(() => (props.active !== null ? props.active : spokenIndex(list.value, props.time)))
const plain = computed(() => list.value.map((w) => w.text).join(' '))
</script>

<template>
  <!-- The line as word spans: the spoken word lit, earlier words kept,
       later words dim. Screen readers get the line once, not per word. -->
  <figure class="hb-spoken" :class="{ 'is-live': at >= 0 && at < list.length }">
    <figcaption v-if="props.who" class="hb-spoken-who">{{ props.who }}</figcaption>
    <p class="hb-spoken-line" :aria-label="plain">
      <template v-for="(w, i) in list" :key="i">
        <span
          class="hb-spoken-w"
          :class="{ 'is-on': i === at, 'is-done': i < at }"
          aria-hidden="true"
        >{{ w.text }}</span>{{ ' ' }}<br v-if="props.breaks && /[,.]$/.test(w.text) && i < list.length - 1">
      </template>
    </p>
  </figure>
</template>
