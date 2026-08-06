<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { cx } from '../utils/cx'

interface Props {
  src?: string
  alt?: string
  /** Fallback when there is no image. Two characters at most. */
  initials?: string
  size?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
})

const failed = ref(false)
watch(() => props.src, () => {
  failed.value = false
})

const showImage = computed(() => Boolean(props.src) && !failed.value)

const classes = computed(() =>
  cx('hb-avatar', {
    'hb-avatar-sm': props.size === 'sm',
    'hb-avatar-lg': props.size === 'lg',
  }),
)
</script>

<template>
  <!-- A square. This system does not crop people into circles. -->
  <span :class="classes">
    <img v-if="showImage" :src="props.src" :alt="props.alt ?? ''" @error="failed = true" />
    <template v-else>{{ (props.initials ?? '').slice(0, 2) }}</template>
  </span>
</template>
