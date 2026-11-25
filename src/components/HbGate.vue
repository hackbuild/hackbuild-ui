<script setup lang="ts">
import { nextTick, ref, useSlots, watch } from 'vue'

interface Props {
  /** The card is up. Off, the subject is the whole page. */
  open?: boolean
  /** The ink head line, left. */
  head?: string
  /** The head's right end: a version or a state. */
  headEnd?: string
  /** The one name on the screen, in Permanent Marker. */
  name?: string
  /** One or two sentences: what waking does. */
  note?: string
  /** The one pink button. */
  goLabel?: string
  /** Waking: the button shows the label and takes no press. */
  busy?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  open: true,
  head: '',
  headEnd: '',
  name: '',
  note: '',
  goLabel: 'wake',
  busy: false,
})

const emit = defineEmits<{ go: [] }>()
const slots = useSlots()
const goBtn = ref<HTMLButtonElement | null>(null)
watch(() => props.open, async (o) => { if (o) { await nextTick(); goBtn.value?.focus({ preventScroll: true }) } })
function go() {
  if (!props.busy) emit('go')
}
</script>

<template>
  <!-- Gate (ferrule, arbor): a centred card over the live subject, one
       select and one pink button. Not a modal: the subject shows around
       it and nothing is trapped. The card's slot takes HbModelSelect with
       go off, so the button here stays the one pink action. -->
  <div class="hb-lay hb is-gate" data-layout="gate">
    <div v-if="slots.bar" class="hb-lay-bar" data-ux="bar"><slot name="bar" /></div>
    <div class="hb-lay-body">
      <section class="hb-lay-stage">
        <div class="hb-lay-subject" data-ux="subject"><slot /></div>
        <div v-if="props.open" class="hb-gate-wrap">
          <section class="hb-gate-card" :aria-label="props.name || props.head || 'start'">
            <div v-if="props.head" class="hb-gate-head"><span>{{ props.head }}</span><span v-if="props.headEnd">{{ props.headEnd }}</span></div>
            <div class="hb-gate-body">
              <h2 v-if="props.name" class="hb-gate-name">{{ props.name }}</h2>
              <p v-if="props.note" class="hb-gate-note">{{ props.note }}</p>
              <slot name="card" />
              <div class="hb-gate-acts">
                <button ref="goBtn" type="button" class="hb-btn hb-btn-go hb-btn-lg hb-gate-go" :aria-busy="props.busy || undefined" @click="go">{{ props.goLabel }}</button>
                <slot name="acts" />
              </div>
              <div v-if="slots.detail" data-ux="detail"><slot name="detail" /></div>
            </div>
          </section>
        </div>
        <div v-if="slots.verbs && !props.open" class="hb-lay-verbs" data-ux="verbs" role="toolbar" aria-label="actions"><slot name="verbs" /></div>
      </section>
    </div>
  </div>
</template>
