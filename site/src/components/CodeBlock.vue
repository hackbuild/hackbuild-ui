<script setup lang="ts">
import { HbButton, useToast } from '@hackbuild/ui'

interface Props {
  code: string
}

const props = defineProps<Props>()
const { toast } = useToast()

async function copy() {
  await navigator.clipboard.writeText(props.code)
  toast('copied')
}
</script>

<template>
  <div class="site-code">
    <pre><code>{{ props.code }}</code></pre>
    <HbButton class="copy" size="sm" variant="secondary" @click="copy">copy</HbButton>
  </div>
</template>
