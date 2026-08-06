<script setup lang="ts">
interface Props {
  /** The value this radio selects. */
  value: string | number
  name?: string
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
})

const model = defineModel<string | number>()
</script>

<template>
  <label class="hb-check" :class="{ 'is-disabled': props.disabled }">
    <input v-model="model" type="radio" :value="props.value" :name="props.name" :disabled="props.disabled" />
    <slot />
  </label>
</template>
