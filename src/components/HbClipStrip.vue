<script setup lang="ts">
// Clips in a row: name and length; the one playing is marked, the picked
// one pressed. Arrows move along the strip.
export interface HbClip {
  id: string
  name: string
  /** "2.4 s". */
  length?: string
}

interface Props {
  clips: HbClip[]
  /** The clip playing now. */
  playing?: string
  label?: string
}

const props = withDefaults(defineProps<Props>(), { playing: '', label: 'clips' })
const picked = defineModel<string>({ default: '' })

function move(i: number, e: KeyboardEvent) {
  const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0
  const next = props.clips[i + d]
  if (!d || !next) return
  e.preventDefault()
  picked.value = next.id
  ;((e.currentTarget as HTMLElement).parentElement?.children[i + d]?.firstElementChild as HTMLElement | null)?.focus()
}
</script>

<template>
  <ul class="hb-clipstrip" :aria-label="props.label">
    <li v-for="(c, i) in props.clips" :key="c.id" class="hb-clipstrip-item" :class="{ 'is-playing': props.playing === c.id, 'is-on': picked === c.id }">
      <button type="button" :aria-pressed="picked === c.id" :aria-current="props.playing === c.id ? 'true' : undefined" @click="picked = c.id" @keydown="move(i, $event)">
        <span class="hb-clipstrip-name">{{ c.name }}</span>
        <span v-if="c.length" class="hb-clipstrip-len">{{ c.length }}</span>
      </button>
    </li>
  </ul>
</template>
