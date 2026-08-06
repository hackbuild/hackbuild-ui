<script setup lang="ts">
interface Props {
  invalid?: boolean
  rows?: number
}

const props = withDefaults(defineProps<Props>(), {
  invalid: false,
  rows: 4,
})

const model = defineModel<string>({ default: '' })
</script>

<template>
  <textarea v-model="model" class="hb-textarea" :class="{ 'is-invalid': props.invalid }" :rows="props.rows" />
</template>
