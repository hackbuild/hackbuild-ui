<script setup lang="ts">
import { ref, watch } from 'vue'
import HbIcon from './HbIcon.vue'
import { parseSeed, rollSeed } from '../vanilla/media'

interface Props {
  label?: string
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  label: 'seed',
  disabled: false,
})

const seed = defineModel<number>({ default: 12345 })
/** Locked keeps the seed for the next run; unlocked rolls one per run. */
const locked = defineModel<boolean>('locked', { default: true })
const emit = defineEmits<{ reroll: [seed: number] }>()

const draft = ref(String(seed.value))
const bad = ref(false)
watch(seed, (v) => { draft.value = String(v); bad.value = false })

function commit() {
  const n = parseSeed(draft.value)
  bad.value = n === null
  if (n !== null && n !== seed.value) seed.value = n
}
function reroll() {
  seed.value = rollSeed()
  emit('reroll', seed.value)
}
</script>

<template>
  <!-- A whole number field, the dice and the lock, one row. -->
  <div class="hb-seed" :class="{ 'is-locked': locked }">
    <label class="hb-ctl">{{ props.label }}
      <input
        v-model="draft"
        class="hb-input hb-seed-input"
        :class="{ 'is-invalid': bad }"
        inputmode="numeric"
        :disabled="props.disabled"
        :aria-invalid="bad"
        @change="commit"
        @keydown.enter="commit"
      >
    </label>
    <button type="button" class="hb-iconbtn" aria-label="random seed" title="random seed" :disabled="props.disabled" @click="reroll">
      <HbIcon name="dice" :size="14" />
    </button>
    <button
      type="button"
      class="hb-iconbtn hb-seed-lock"
      :aria-pressed="locked"
      :aria-label="locked ? 'seed kept for every run' : 'new seed every run'"
      :title="locked ? 'kept: press to roll every run' : 'rolls every run: press to keep'"
      :disabled="props.disabled"
      @click="locked = !locked"
    >
      <HbIcon :name="locked ? 'lock' : 'shuffle'" :size="14" />
    </button>
    <span v-if="bad" class="hb-hint hb-seed-err" role="alert">a whole number, 0 to 4294967294.</span>
  </div>
</template>
