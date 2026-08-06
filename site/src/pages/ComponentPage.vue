<script setup lang="ts">
import { computed, defineAsyncComponent, ref } from 'vue'
import { useRoute } from 'vue-router'
import { HbButton, HbDrawer, HbShell } from '@hackbuild/ui'
import { allEntries, demoLoader } from '../registry'
import SideNav from '../components/SideNav.vue'

const route = useRoute()
const navOpen = ref(false)

const name = computed(() => String(route.params.name))
const entry = computed(() => allEntries.find((item) => item.name === name.value))

const demo = computed(() => {
  const loader = demoLoader(name.value)
  return loader ? defineAsyncComponent(loader as never) : null
})
</script>

<template>
  <HbShell class="site-main">
    <div class="site-cols">
      <aside class="site-side">
        <SideNav />
      </aside>
      <main style="min-width: 0">
        <HbButton class="site-navbtn" size="sm" variant="secondary" @click="navOpen = true">
          all components
        </HbButton>
        <template v-if="entry && demo">
          <h1 style="font-size: 34px; margin-top: 8px">{{ entry.name }}</h1>
          <p style="margin-top: 6px; color: var(--hb-ink-2)">{{ entry.blurb }}</p>
          <div class="demo-col" style="margin-top: 20px">
            <component :is="demo" :key="name" />
          </div>
        </template>
        <template v-else>
          <h1>not found</h1>
          <p>No component by that name. Pick one from the list.</p>
        </template>
      </main>
    </div>
  </HbShell>
  <HbDrawer v-model="navOpen" side="left">
    <SideNav @navigate="navOpen = false" />
  </HbDrawer>
</template>
