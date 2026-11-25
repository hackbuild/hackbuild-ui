<script lang="ts">
let seq = 0
</script>

<script setup lang="ts">
export interface Props {
  /** The value this radio selects. */
  value: string | number
  /** Shared by every radio of one group. The card form needs it: the
      browser moves through radios of one name with the arrow keys. */
  name?: string
  disabled?: boolean
  /** Card form: the option's name, bold at the top of the card. */
  title?: string
  /** Card form: one line of what the option means. */
  desc?: string
  /** Card form: what it costs, on a quieter line under the meaning. */
  trade?: string
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  title: '',
  desc: '',
  trade: '',
})

const model = defineModel<string | number>()

seq += 1
const id = `hb-rcard-${seq}`
/** The title names the radio; the meaning and the trade describe it. */
const described = () => [props.desc && `${id}-d`, props.trade && `${id}-t`].filter(Boolean).join(' ') || undefined
</script>

<template>
  <label v-if="props.title" class="hb-rcard" :class="{ 'is-disabled': props.disabled }">
    <input
      v-model="model"
      type="radio"
      :value="props.value"
      :name="props.name"
      :disabled="props.disabled"
      :aria-labelledby="`${id}-n`"
      :aria-describedby="described()"
    />
    <span class="hb-rcard-body">
      <span :id="`${id}-n`" class="hb-rcard-title">{{ props.title }}</span>
      <span v-if="props.desc" :id="`${id}-d`" class="hb-rcard-desc">{{ props.desc }}</span>
      <span v-if="props.trade" :id="`${id}-t`" class="hb-rcard-trade">{{ props.trade }}</span>
      <slot />
    </span>
  </label>
  <label v-else class="hb-check" :class="{ 'is-disabled': props.disabled }">
    <input v-model="model" type="radio" :value="props.value" :name="props.name" :disabled="props.disabled" />
    <slot />
  </label>
</template>
