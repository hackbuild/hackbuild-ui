<script setup lang="ts">
interface Props {
  /** The marker face name. */
  name: string
  /** The Plex sub line. */
  sub?: string
  active?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  active: false,
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()
</script>

<template>
  <!-- Big tap targets for the easy path. 96 px minimum so a finger hits. -->
  <button type="button" class="hb-tile" :class="{ 'is-on': props.active }" @click="emit('click', $event)">
    <span class="n">{{ props.name }}</span>
    <span v-if="props.sub" class="s">{{ props.sub }}</span>
  </button>
</template>
