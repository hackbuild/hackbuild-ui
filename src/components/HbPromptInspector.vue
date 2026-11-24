<script setup lang="ts">
import { computed } from 'vue'
import { useCopy } from '../composables/useCopy'
import { costRows, planText, promptText, type PromptCost, type PromptMessage } from '../vanilla/trace'

interface Props {
  /** The full context sent: one text, or the messages. */
  prompt?: string | PromptMessage[]
  /** The raw reply, before any parsing. */
  reply?: string
  /** The last plan the reply was read as, such as {say, do}. */
  plan?: unknown
  /** The last call's tokens in and out and reply time. */
  cost?: PromptCost
  /** Session counters after the cost: ['model calls', 4]. */
  counters?: Array<[string, number | string]>
}

const props = withDefaults(defineProps<Props>(), {
  prompt: '',
  reply: '',
  plan: undefined,
  cost: () => ({}),
  counters: () => [],
})

const sent = computed(() => promptText(props.prompt))
const planLine = computed(() => planText(props.plan))
const rows = computed(() => costRows(props.cost, props.counters))
const raw = computed(() => (sent.value ? `${sent.value}\n\n>>> ${props.reply || 'no reply yet'}` : ''))
const { state, copy } = useCopy()
const copyWord = computed(() => (state.value === 'copied' ? 'copied' : state.value === 'failed' ? 'copy failed' : 'copy'))
</script>

<template>
  <!-- What the model saw and answered, with the cost beside it. -->
  <div class="hb-pinsp">
    <section class="hb-pinsp-card">
      <h3 class="hb-pinsp-hd">cost <small>this session</small></h3>
      <dl v-if="rows.length" class="hb-pinsp-kv">
        <template v-for="[k, v] in rows" :key="k"><dt>{{ k }}</dt><dd>{{ v }}</dd></template>
      </dl>
      <p v-else class="hb-pinsp-empty">no calls yet</p>
    </section>
    <section class="hb-pinsp-card">
      <h3 class="hb-pinsp-hd">last plan</h3>
      <pre class="hb-pinsp-pre" :class="{ 'is-empty': !planLine }">{{ planLine || 'none yet' }}</pre>
    </section>
    <section class="hb-pinsp-card">
      <h3 class="hb-pinsp-hd">
        last prompt and reply
        <button v-if="raw" type="button" class="hb-pinsp-copy" :class="`is-${state}`" @click="copy(raw)">{{ copyWord }}</button>
      </h3>
      <pre v-if="raw" class="hb-pinsp-pre is-raw" tabindex="0" aria-label="last prompt and reply">{{ sent }}<span class="hb-pinsp-reply">&gt;&gt;&gt; {{ props.reply || 'no reply yet' }}</span></pre>
      <pre v-else class="hb-pinsp-pre is-empty">no language model has been asked yet</pre>
    </section>
  </div>
</template>
