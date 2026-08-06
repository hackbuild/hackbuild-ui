<script setup lang="ts">
import { ref } from 'vue'
import HbDrawer from './HbDrawer.vue'
import HbIcon from './HbIcon.vue'
import HbMark from './HbMark.vue'
import HbWordmark from './HbWordmark.vue'

export interface HbNavLink {
  label: string
  href: string
  active?: boolean
  /** Renders as the one pink call to action. */
  cta?: boolean
}

interface Props {
  links?: HbNavLink[]
  /** Brand link target. */
  homeHref?: string
}

const props = withDefaults(defineProps<Props>(), {
  links: () => [],
  homeHref: '/',
})

const open = ref(false)
</script>

<template>
  <!-- Page navigation. Tool shells use HbHeader instead. One pink call to
       action at most. Below 760 px the links move into a drawer. -->
  <nav class="hb-nav">
    <a class="hb-nav-brand" :href="props.homeHref">
      <slot name="brand">
        <HbMark reversed :size="26" />
        <span class="hb-on-ink" style="background: none"><HbWordmark :size="16" /></span>
      </slot>
    </a>
    <div class="hb-nav-links">
      <slot>
        <a
          v-for="link in props.links"
          :key="link.href"
          class="hb-nav-link"
          :class="{ 'is-active': link.active, 'hb-nav-cta': link.cta }"
          :href="link.href"
          :aria-current="link.active ? 'page' : undefined"
        >
          {{ link.label }}
        </a>
      </slot>
    </div>
    <button class="hb-iconbtn hb-nav-toggle" type="button" aria-label="open navigation" @click="open = true">
      <HbIcon name="menu" :size="18" />
    </button>
  </nav>
  <HbDrawer v-model="open">
    <div style="display: flex; flex-direction: column; gap: 4px">
      <slot name="drawer">
        <a
          v-for="link in props.links"
          :key="link.href"
          class="hb-row"
          :class="{ 'is-on': link.active }"
          :href="link.href"
          @click="open = false"
        >
          {{ link.label }}
        </a>
      </slot>
    </div>
  </HbDrawer>
</template>
