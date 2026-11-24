<script setup lang="ts">
import { computed } from 'vue'
import { hudWord, type HudState } from '../vanilla/stage'

interface Props {
  /** The character's name. */
  name: string
  /** One signal drives the word, the mouth and the mic gate. */
  state?: HudState
  /** Replaces the state word, such as 'no voice'. */
  stateText?: string
}

const props = withDefaults(defineProps<Props>(), { state: 'idle', stateText: '' })

defineSlots<{
  /** Privacy chips: 'camera on', 'mic live'. Shown while a track is live. */
  default?: () => unknown
}>()

const word = computed(() => props.stateText || hudWord(props.state))
</script>

<template>
  <div class="hb-namehud" :class="`is-${props.state}`">
    <b class="hb-namehud-name">{{ props.name }}</b>
    <span class="hb-namehud-state" role="status">{{ word }}</span>
    <slot />
  </div>
</template>
