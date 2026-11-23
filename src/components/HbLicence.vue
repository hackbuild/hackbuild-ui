<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  /** SPDX id or name: 'CC-BY-NC-4.0', 'Apache-2.0'. */
  licence: string
  /** true allowed, false not allowed, null unknown. */
  commercial?: boolean | null
  /** What the licence covers. */
  what?: string
  /** Link to the licence text. */
  href?: string
}

const props = withDefaults(defineProps<Props>(), { commercial: null, what: 'weights', href: '' })

const terms = computed(() =>
  props.commercial === true ? 'commercial use allowed' : props.commercial === false ? 'no commercial use' : 'commercial use unknown',
)
</script>

<template>
  <div class="hb-licence" :class="{ 'is-nc': props.commercial === false }">
    {{ props.what }} <b><a v-if="props.href" :href="props.href" target="_blank" rel="noopener">{{ props.licence }}</a><template v-else>{{ props.licence }}</template></b>, {{ terms }}.
    <slot />
  </div>
</template>
