<script setup lang="ts">
// No props: the bar and the layout come in as slots.
</script>

<template>
  <!-- An app bar over a layout: the HbHeader in the bar slot, any of the
       six layouts in the default slot. The layout fills the rest of the
       viewport and keeps its data-ux markers; the header is the one bar. -->
  <div class="hb-barpage">
    <slot name="bar" />
    <slot />
  </div>
</template>
