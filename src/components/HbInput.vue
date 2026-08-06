<script setup lang="ts">
interface Props {
  invalid?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  invalid: false,
})

const model = defineModel<string | number>({ default: '' })
</script>

<template>
  <input v-model="model" class="hb-input" :class="{ 'is-invalid': props.invalid }" />
</template>
