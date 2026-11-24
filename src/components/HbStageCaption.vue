<script setup lang="ts">
import { computed } from 'vue'
import { captionText } from '../vanilla/stage'

interface Props {
  /** What the user said, shown small above the line: 'you: wave at me'. */
  echo?: string
  /** The reply as it streams. */
  line?: string
  /** The speaker, in the lit label over the line. */
  who?: string
  /** Keep only the last this many characters; 0 keeps it whole. */
  maxChars?: number
}

const props = withDefaults(defineProps<Props>(), { echo: '', line: '', who: '', maxChars: 320 })
const text = computed(() => captionText(props.line, props.maxChars))
</script>

<template>
  <!-- Both sides of the exchange on the stage, for a hands free view. -->
  <div v-if="props.echo || text" class="hb-caption">
    <div v-if="props.echo" class="hb-caption-echo">{{ props.echo }}</div>
    <div v-if="text" class="hb-caption-line" aria-live="polite">
      <span><b v-if="props.who" class="hb-caption-who">{{ props.who }}</b>{{ text }}</span>
    </div>
  </div>
</template>
