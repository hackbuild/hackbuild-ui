<script setup lang="ts">
export interface Props {
  /** The marker face name. */
  name: string
  /** The Plex sub line. */
  sub?: string
  active?: boolean
  /** 64 px minimum, for a preset grid in a panel. */
  small?: boolean
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  sub: '',
  active: false,
  small: false,
  disabled: false,
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()
</script>

<template>
  <!-- Big tap targets for the easy path. 96 px minimum so a finger hits.
       The media slot is a thumb drawn from state, above the name. -->
  <button
    type="button"
    class="hb-tile"
    :class="{ 'is-on': props.active, 'is-small': props.small, 'has-media': !!$slots.media }"
    :disabled="props.disabled"
    @click="emit('click', $event)"
  >
    <span v-if="$slots.media" class="hb-tile-media" aria-hidden="true"><slot name="media" /></span>
    <span class="n">{{ props.name }}</span>
    <span v-if="props.sub" class="s">{{ props.sub }}</span>
  </button>
</template>
