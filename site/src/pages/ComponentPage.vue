<script setup lang="ts">
import { computed, defineAsyncComponent, ref } from 'vue'
import { useRoute } from 'vue-router'
import { HbButton, HbDrawer, HbShell } from '@hackbuild/ui'
import { allEntries, demoLoader, registry } from '../registry'
import SideNav from '../components/SideNav.vue'
import PartApi from '../components/PartApi.vue'

const route = useRoute()
const navOpen = ref(false)

const name = computed(() => String(route.params.name))
const entry = computed(() => allEntries.find((item) => item.name === name.value))
const group = computed(() => registry.find((g) => g.entries.some((e) => e.name === name.value))?.category)

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
          <h1 style="font-size: 34px; margin-top: 8px; overflow-wrap: anywhere">{{ entry.name }}</h1>
          <p style="margin-top: 6px; color: var(--hb-ink-2)">{{ entry.blurb }}</p>
          <p class="hb-fixture" style="margin-top: 16px"><b>fixture</b> every state, name and number in these demos is sample data. no model loads here.</p>
          <div class="demo-col" style="margin-top: 20px">
            <component :is="demo" :key="name" />
          </div>
          <PartApi :name="entry.name" :blurb="entry.blurb" :group="group" style="margin-top: 28px" />
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
