<script setup lang="ts">
import { computed } from 'vue'
import { inspectLine, type InspectRecall } from '../vanilla/meminspect'

export type { InspectRecall as HbInspectRecall, InspectRow as HbInspectRow } from '../vanilla/meminspect'

interface Props {
  /** The last recall as display rows, or null before any. */
  recall: InspectRecall | null
  /** Shown before any recall. */
  empty?: string
}

const props = withDefaults(defineProps<Props>(), { empty: 'no recall yet. ask something to see what memory finds.' })
const line = computed(() => (props.recall ? inspectLine(props.recall) : ''))
</script>

<template>
  <!-- What a recall found, best first, sized for a 380 px rack: one two
       line row per candidate; the scorer parts wait in a fold. -->
  <section class="hb-meminspect" aria-label="memory recall">
    <p v-if="!props.recall" class="hb-meminspect-empty">{{ props.empty }}</p>
    <template v-else>
      <p class="hb-meminspect-line" role="status">{{ line }}</p>
      <ol class="hb-meminspect-list">
        <li v-for="r in props.recall.rows" :key="r.rank" class="hb-meminspect-row" :class="{ 'is-used': r.used }" :data-used="r.used">
          <div class="hb-meminspect-top">
            <span class="hb-meminspect-rank">{{ r.rank }}</span>
            <span class="hb-meminspect-kind">{{ r.kind }}</span>
            <span class="hb-meminspect-score">{{ r.score }}</span>
            <span class="hb-meminspect-used">{{ r.used ? 'used' : 'left out' }}</span>
          </div>
          <p class="hb-meminspect-text">{{ r.text }}</p>
          <details v-if="r.parts && Object.keys(r.parts).length" class="hb-meminspect-parts" data-ux="detail">
            <summary>why</summary>
            <dl><template v-for="(v, k) in r.parts" :key="k"><dt>{{ k }}</dt><dd>{{ v }}</dd></template></dl>
          </details>
        </li>
      </ol>
    </template>
  </section>
</template>
