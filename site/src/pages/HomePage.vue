<script setup lang="ts">
import { HbButton, HbCard, HbCallout, HbShell, HbSticker, HbWordmark } from '@hackbuild/ui'
import CodeBlock from '../components/CodeBlock.vue'

const install = `npm install @hackbuild/ui`

const usage = `import { createApp } from 'vue'
import '@hackbuild/ui/fonts.css'
import '@hackbuild/ui/styles.css'
import App from './App.vue'

createApp(App).mount('#app')`

const layers = [
  {
    title: 'tokens',
    sub: 'tokens.css',
    text: 'Every color, face, shadow and spacing step as CSS custom properties. The single source of truth.',
    to: '/tokens',
  },
  {
    title: 'the class layer',
    sub: 'hackbuild.css',
    text: 'Every component as plain CSS over the tokens. Framework free; the style guide pages run on it alone.',
    to: '/components',
  },
  {
    title: 'vue components',
    sub: '@hackbuild/ui',
    text: 'Behavior bound to the classes: v-model wiring, focus traps, keyboard handling, ARIA state. No styles of their own.',
    to: '/components',
  },
  {
    title: 'tailwind bridge',
    sub: 'theme.css',
    text: 'The tokens mapped into Tailwind v4 theme variables for app code. Optional, never required.',
    to: '/tokens',
  },
]
</script>

<template>
  <HbShell class="site-main">
    <div class="home-hero">
      <HbSticker class="hb-tilt-r">v1.2</HbSticker>
      <h1 style="margin-top: 12px">
        paper. ink.<br />
        <span class="ink-block hb-tilt-l">one pink.</span>
      </h1>
      <p class="hb-prose" style="margin-top: 20px; font-size: 16px">
        The design language of <HbWordmark :size="16" />. Typewriter type, hard
        shadows that look slightly off register like a bad photocopy, zero
        border radius, and a single accent doing all the pointing. Built for
        bench tools, board viewers, zines, stickers and PCBs.
      </p>
      <div class="demo-row" style="margin-top: 24px">
        <HbButton as="a" href="#/components" size="lg">browse components</HbButton>
        <HbButton as="a" href="#/demos" variant="secondary" size="lg">see the demos</HbButton>
      </div>
    </div>

    <div class="home-grid">
      <HbCard v-for="layer in layers" :key="layer.title" interactive as="a" :href="'#' + layer.to">
        <div class="hb-label">{{ layer.sub }}</div>
        <h3 style="margin: 6px 0 8px">{{ layer.title }}</h3>
        <p style="margin: 0; color: var(--hb-ink-2)">{{ layer.text }}</p>
      </HbCard>
    </div>

    <hr class="hb-rule" />

    <div class="site-cols" style="grid-template-columns: 1fr 1fr; gap: 24px">
      <div>
        <h2>install</h2>
        <p style="margin-top: 8px">Vue 3.4 or newer. Tailwind optional.</p>
        <CodeBlock :code="install" />
      </div>
      <div>
        <h2>wire it up</h2>
        <p style="margin-top: 8px">
          Put <code>class="hb"</code> on the body and import the stylesheet.
        </p>
        <CodeBlock :code="usage" />
      </div>
    </div>

    <HbCallout style="margin-top: 32px">
      The rules live in GUIDELINES.md. One pink element competing for attention
      per view, four faces with four jobs, no blur, no radius. The components
      enforce most of it for you.
    </HbCallout>
  </HbShell>
</template>

<style scoped>
@media (max-width: 720px) {
  .site-cols {
    grid-template-columns: 1fr !important;
  }
}
</style>
