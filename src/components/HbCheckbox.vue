<script setup lang="ts">
interface Props {
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
})

const model = defineModel<boolean>({ default: false })
</script>

<template>
  <label class="hb-check" :class="{ 'is-disabled': props.disabled }">
    <input v-model="model" type="checkbox" :disabled="props.disabled" />
    <slot />
  </label>
</template>
