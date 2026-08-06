<script setup lang="ts">
import { useToast } from '../composables/useToast'

const { state } = useToast()
</script>

<template>
  <Teleport to="body">
    <div class="hb-toast" :class="{ 'is-on': state.visible }" role="status" aria-live="polite">
      {{ state.message }}
    </div>
  </Teleport>
</template>
