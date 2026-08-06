<script setup lang="ts">
interface Props {
  /** Ink toolbar for instrument shells. */
  ink?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  ink: false,
})
</script>

<template>
  <!-- Verbs and global settings. Branding stays in the header. Push things
       right with a spacer: <span class="hb-spacer" />. -->
  <div class="hb-bar" :class="{ 'hb-bar-ink': props.ink }">
    <slot />
  </div>
</template>
