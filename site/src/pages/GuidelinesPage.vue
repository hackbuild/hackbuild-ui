<script setup lang="ts">
import { HbShell } from '@hackbuild/ui'
import source from '../../../GUIDELINES.md?raw'
import { markdown } from '../md'

const html = markdown(source)
</script>

<template>
  <HbShell class="site-main">
    <!-- GUIDELINES.md, the design law, rendered from the file in this repository -->
    <article class="hb-prose" style="min-width: 0; max-width: 860px" v-html="html" />
  </HbShell>
</template>
