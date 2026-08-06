<script setup lang="ts">
interface Props {
  active?: boolean
  /** Render as another tag, usually 'a' with an href attribute. */
  as?: string
}

const props = withDefaults(defineProps<Props>(), {
  active: false,
  as: 'button',
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()
</script>

<template>
  <component
    :is="props.as"
    :type="props.as === 'button' ? 'button' : undefined"
    class="hb-row"
    :class="{ 'is-on': props.active }"
    @click="emit('click', $event)"
  >
    <slot />
  </component>
</template>
