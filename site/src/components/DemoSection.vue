<script setup lang="ts">
import { HbFold, HbPanel } from '@hackbuild/ui'
import CodeBlock from './CodeBlock.vue'

interface Props {
  title: string
  note?: string
  /** Usage source shown in a fold under the demo. */
  code?: string
}

const props = defineProps<Props>()
</script>

<template>
  <HbPanel :heading="props.title">
    <p v-if="props.note" style="color: var(--hb-ink-2)">{{ props.note }}</p>
    <div class="demo-area">
      <slot />
    </div>
    <div v-if="props.code" style="margin-top: 12px">
      <HbFold summary="code">
        <CodeBlock :code="props.code" />
      </HbFold>
    </div>
  </HbPanel>
</template>
