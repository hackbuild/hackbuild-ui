<script setup lang="ts">
import HbMark from './HbMark.vue'
import HbShell from './HbShell.vue'
import HbWordmark from './HbWordmark.vue'

interface Props {
  /** The dashed bottom line, usually the stamp. */
  stamp?: string
  tagline?: string
}

const props = defineProps<Props>()
</script>

<template>
  <!-- Ink footer: brand and blurb left, link columns right, social icon
       squares, stamp line along the bottom. -->
  <footer class="hb-footer hb-on-ink">
    <HbShell>
      <div class="hb-footer-grid">
        <div class="hb-footer-col">
          <slot name="brand">
            <span style="display: inline-flex; align-items: center; gap: 10px">
              <HbMark reversed :size="26" />
              <HbWordmark :size="16" />
            </span>
          </slot>
          <span v-if="props.tagline" class="hb-tagline" style="color: var(--hb-paper); opacity: 0.55">
            {{ props.tagline }}
          </span>
          <div v-if="$slots.social" class="hb-footer-social">
            <slot name="social" />
          </div>
        </div>
        <slot />
      </div>
      <div v-if="props.stamp || $slots.bottom" class="hb-footer-bottom">
        <span v-if="props.stamp">{{ props.stamp }}</span>
        <slot name="bottom" />
      </div>
    </HbShell>
  </footer>
</template>
