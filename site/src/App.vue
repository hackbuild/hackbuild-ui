<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { HbHeader, HbPill, HbToaster } from '@hackbuild/ui'

const route = useRoute()
const bare = computed(() => Boolean(route.meta.bare))

const nav = [
  { label: 'home', to: '/' },
  { label: 'components', to: '/components' },
  { label: 'tokens', to: '/tokens' },
  { label: 'brand', to: '/brand' },
  { label: 'demos', to: '/demos' },
]

function isHere(to: string) {
  if (to === '/') return route.path === '/'
  return route.path.startsWith(to)
}
</script>

<template>
  <template v-if="bare">
    <router-view />
  </template>
  <template v-else>
    <HbHeader title="hack" accent=".build" tagline="make things. break things. repeat.">
      <HbPill status="live">v1.2</HbPill>
    </HbHeader>
    <nav class="hb-tabs">
      <router-link
        v-for="item in nav"
        :key="item.to"
        :to="item.to"
        class="hb-tab"
        :class="{ 'is-active': isHere(item.to) }"
      >
        {{ item.label }}
      </router-link>
    </nav>
    <router-view />
    <HbToaster />
  </template>
</template>
