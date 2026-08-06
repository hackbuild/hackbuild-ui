<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  /** Total page count. */
  pages: number
  /** Pages shown around the current one. */
  window?: number
}

const props = withDefaults(defineProps<Props>(), {
  window: 1,
})

const page = defineModel<number>({ default: 1 })

const items = computed<Array<number | 'gap'>>(() => {
  const out: Array<number | 'gap'> = []
  const current = page.value
  let last = 0
  for (let n = 1; n <= props.pages; n++) {
    const keep =
      n === 1 ||
      n === props.pages ||
      Math.abs(n - current) <= props.window
    if (!keep) continue
    if (last && n - last > 1) out.push('gap')
    out.push(n)
    last = n
  }
  return out
})

function go(n: number) {
  page.value = Math.min(props.pages, Math.max(1, n))
}
</script>

<template>
  <nav class="hb-pages" aria-label="pagination">
    <button type="button" class="hb-page" :disabled="page <= 1" aria-label="previous page" @click="go(page - 1)">&lt;</button>
    <template v-for="(item, index) in items" :key="index">
      <span v-if="item === 'gap'" class="hb-page-gap">..</span>
      <button
        v-else
        type="button"
        class="hb-page"
        :class="{ 'is-on': item === page }"
        :aria-current="item === page ? 'page' : undefined"
        @click="go(item)"
      >
        {{ item }}
      </button>
    </template>
    <button type="button" class="hb-page" :disabled="page >= props.pages" aria-label="next page" @click="go(page + 1)">&gt;</button>
  </nav>
</template>
