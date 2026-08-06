<script setup lang="ts">
import { HbButton, HbCallout, HbCard, HbMark, HbNum, HbShell, HbSticker, HbWordmark } from '@hackbuild/ui'

const projects = [
  { name: 'kerf', sub: 'web sdr in the browser', text: 'A software radio that runs on webusb. Plug a dongle in, tap a preset, listen.' },
  { name: 'detent', sub: 'laser rotary tool', text: 'Rotary attachment calculator and job runner for the shop laser. Angles land on the mark.' },
  { name: 'burr', sub: 'board viewer', text: 'Drop a kicad board in, spin it around, check the silk before you order.' },
]

const principles = [
  { n: '01', title: 'ship the bench', text: 'Tools first. A page exists to get the tool into your hands.' },
  { n: '02', title: 'name the failure mode', text: 'Say what breaks and when. Hidden errors are the only ugly thing here.' },
  { n: '03', title: 'easy mode is a fold', text: 'The fiddly controls fold away. They never get deleted.' },
]
</script>

<template>
  <div>
    <header class="hb-header">
      <HbMark reversed :size="28" class="hb-logo" />
      <span class="hb-on-ink"><HbWordmark :size="20" /></span>
      <span class="hb-tagline" style="margin-left: auto; color: var(--hb-paper); opacity: 0.55">
        make things. break things. repeat.
      </span>
    </header>

    <section style="position: relative; padding: 72px 0 56px; overflow: hidden">
      <span class="hb-tape" style="top: 28px; left: 8%" aria-hidden="true" />
      <span class="hb-tape is-r" style="bottom: 40px; right: 6%" aria-hidden="true" />
      <HbShell>
        <div style="font-family: var(--hb-readout); font-size: 15px; background: var(--hb-ink); color: var(--hb-paper); display: inline-block; padding: 3px 10px" class="hb-tilt-l">
          hardware · tools · tutorials
        </div>
        <h1 style="font-size: clamp(44px, 9vw, 96px); line-height: 1.05; margin-top: 16px">
          if it doesn't exist,<br />
          <span style="background: var(--hb-ink); color: var(--hb-paper); display: inline-block; padding: 0 18px" class="hb-tilt-r">build it.</span>
        </h1>
        <p class="hb-prose" style="font-size: 17px; margin-top: 22px">
          Open tools, hardware notes, and the occasional radio that should not
          exist. Everything documented, everything repeatable, everything a
          little bit pink.
        </p>
        <div style="display: flex; gap: 14px; flex-wrap: wrap; margin-top: 28px">
          <HbButton size="lg" variant="danger">see the projects</HbButton>
          <HbButton size="lg" variant="secondary">read the zine</HbButton>
        </div>
      </HbShell>
    </section>

    <section class="hb-on-ink" style="padding: 48px 0">
      <HbShell>
        <h2 style="color: var(--hb-paper)">the bench<span class="hb-accent">.</span></h2>
        <div class="home-grid" style="margin-top: 20px">
          <HbCard v-for="project in projects" :key="project.name" interactive>
            <HbSticker variant="secondary" style="transform: rotate(-2deg)">{{ project.name }}</HbSticker>
            <div class="hb-label" style="margin-top: 10px">{{ project.sub }}</div>
            <p style="margin: 8px 0 0; color: var(--hb-ink-2)">{{ project.text }}</p>
          </HbCard>
        </div>
      </HbShell>
    </section>

    <section style="padding: 48px 0">
      <HbShell>
        <h2>how it runs</h2>
        <div style="display: flex; flex-direction: column; gap: 18px; margin-top: 20px; max-width: 640px">
          <div v-for="principle in principles" :key="principle.n" style="display: flex; gap: 14px; align-items: flex-start">
            <HbNum>{{ principle.n }}</HbNum>
            <div>
              <h3>{{ principle.title }}</h3>
              <p style="margin: 4px 0 0; color: var(--hb-ink-2)">{{ principle.text }}</p>
            </div>
          </div>
        </div>
        <HbCallout style="margin-top: 32px; max-width: 640px">
          New tool drops land in the zine first. No list, no tracking, just an
          rss feed and a pile of schematics.
        </HbCallout>
      </HbShell>
    </section>

    <footer class="hb-on-ink" style="padding: 24px 0; border-top: 3px solid var(--hb-pink)">
      <HbShell style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap">
        <HbMark reversed :size="22" />
        <span class="hb-on-ink"><HbWordmark :size="14" /></span>
        <span style="margin-left: auto; font-family: var(--hb-utility); font-size: 11px; opacity: 0.6">
          built with the hack.build design system
        </span>
      </HbShell>
    </footer>

    <HbButton class="demo-back" size="sm" variant="danger" as="a" href="#/demos">exit demo</HbButton>
  </div>
</template>
