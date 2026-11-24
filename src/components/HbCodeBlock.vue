<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { codeBlock, type CodeBlockHandle } from '../vanilla/code'

interface Props {
  code: string
  /** Printed in the head: ts, js, sh, json. No highlighter runs. */
  lang?: string
  /** Show the copy button. */
  copy?: boolean
  /** Show the wrap toggle. */
  wrapToggle?: boolean
  /** Accessible name of the block. */
  label?: string
}

const props = withDefaults(defineProps<Props>(), {
  lang: '',
  copy: true,
  wrapToggle: true,
  label: undefined,
})

/** Long lines wrap instead of scrolling sideways. */
const wrap = defineModel<boolean>('wrap', { default: false })

const el = ref<HTMLElement | null>(null)
let handle: CodeBlockHandle | null = null
onMounted(() => {
  if (!el.value) return
  handle = codeBlock(el.value, { wrap: wrap.value, onWrap: (v) => { wrap.value = v } })
})
watch(wrap, (v) => { if (handle && handle.wrapped !== v) handle.wrap(v) })
onBeforeUnmount(() => handle?.dispose())
</script>

<template>
  <!-- Code as plain text on ink, the language in the head, copy and wrap.
       The pre takes focus so arrow keys scroll a long line. -->
  <div ref="el" class="hb-codeblock">
    <div v-if="props.lang || props.copy || props.wrapToggle" class="hb-codeblock-head">
      <span class="hb-codeblock-lang">{{ props.lang }}</span>
      <button v-if="props.wrapToggle" type="button" class="hb-codeblock-btn" data-wrap aria-pressed="false">wrap</button>
      <button v-if="props.copy" type="button" class="hb-codeblock-btn" data-copy><span data-label aria-live="polite">copy</span></button>
    </div>
    <pre :aria-label="props.label ?? (props.lang ? `${props.lang} code` : 'code')"><code>{{ props.code }}</code></pre>
  </div>
</template>
