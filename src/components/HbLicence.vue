<script setup lang="ts">
import { computed } from 'vue'
import { licenceText } from '../vanilla/models'

interface Props {
  /** SPDX id or name as recorded: 'CC-BY-NC-4.0', 'Apache-2.0'. Empty renders nothing. */
  licence?: string
  /** true allowed, false not allowed, null or 'unknown' unknown. */
  commercial?: boolean | 'unknown' | null
  /** What the licence covers. */
  what?: string
  /** Link to the licence text. */
  href?: string
  /** One quiet line, 'licence as recorded: ...', no rule: for a model row or a load panel. */
  quiet?: boolean
}

const props = withDefaults(defineProps<Props>(), { licence: '', commercial: null, what: 'weights', href: '', quiet: false })

const terms = computed(() =>
  props.commercial === true ? 'commercial use allowed' : props.commercial === false ? 'no commercial use' : 'commercial use unknown',
)
const line = computed(() => licenceText(props.licence, props.commercial))
</script>

<template>
  <p v-if="props.licence && props.quiet" class="hb-licence-q">{{ line }}<slot /></p>
  <div v-else-if="props.licence" class="hb-licence" :class="{ 'is-nc': props.commercial === false }">
    {{ props.what }} <b><a v-if="props.href" :href="props.href" target="_blank" rel="noopener">{{ props.licence }}</a><template v-else>{{ props.licence }}</template></b>, {{ terms }}.
    <slot />
  </div>
</template>
