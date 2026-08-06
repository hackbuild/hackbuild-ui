<script setup lang="ts">
interface Props {
  summary: string
}

const props = defineProps<Props>()

/** Open state. Optional two way binding. */
const open = defineModel<boolean>({ default: false })

function onToggle(event: Event) {
  open.value = (event.target as HTMLDetailsElement).open
}
</script>

<template>
  <!-- Fiddly controls fold away rather than being deleted. Easy mode is a
       fold, not a different app. -->
  <details class="hb-fold" :open="open" @toggle="onToggle">
    <summary>{{ props.summary }}</summary>
    <div><slot /></div>
  </details>
</template>
