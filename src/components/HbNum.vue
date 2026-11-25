<script setup lang="ts">
import { noteOnce } from '../utils/note'

noteOnce('HbNum', 'HbNum is deprecated since 0.10.0 and goes in 0.11.0; use the .hb-num class')
</script>

<template>
  <span class="hb-num"><slot /></span>
</template>
