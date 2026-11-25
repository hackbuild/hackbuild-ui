<script setup lang="ts">
// An avatar as a card: the thumbnail, the name, the licence and size line,
// and the rig check line (ok or the bones it misses). Pressing it picks it.
export interface HbAvatarRig {
  ok: boolean
  /** "vrm 1.0, 54 bones" or "no left hand". */
  text: string
}

interface Props {
  name: string
  /** Image url of the thumbnail; none shows the name's first letter. */
  thumb?: string
  /** "cc0, 4.2 mb". */
  meta?: string
  rig?: HbAvatarRig
  selected?: boolean
}

const props = withDefaults(defineProps<Props>(), { thumb: '', meta: '', selected: false })
const emit = defineEmits<{ pick: [] }>()
</script>

<template>
  <button type="button" class="hb-avcard" :class="{ 'is-on': props.selected }" :aria-pressed="props.selected" @click="emit('pick')">
    <span class="hb-avcard-thumb">
      <img v-if="props.thumb" :src="props.thumb" alt="" loading="lazy">
      <span v-else aria-hidden="true">{{ props.name.slice(0, 1) }}</span>
    </span>
    <span class="hb-avcard-body">
      <span class="hb-avcard-name">{{ props.name }}</span>
      <span v-if="props.meta" class="hb-avcard-meta">{{ props.meta }}</span>
      <span v-if="props.rig" class="hb-avcard-rig" :class="props.rig.ok ? 'is-ok' : 'is-bad'">{{ props.rig.text }}</span>
    </span>
  </button>
</template>
