<script setup lang="ts">
import {
  HbButton, HbCallout, HbCta, HbFooter, HbHero, HbIcon, HbMediaCard, HbNav,
  HbNum, HbSectionHead, HbShell, HbTag, HbTimeline, HbTimelineItem,
  HbVideoFrame,
} from '@hackbuild/ui'

const links = [
  { label: 'projects', href: '#', active: true },
  { label: 'zine', href: '#' },
  { label: 'videos', href: '#' },
  { label: 'contact', href: '#', cta: true },
]

const projects = [
  { name: 'kerf', sub: 'web sdr in the browser', text: 'A software radio that runs on webusb. Plug a dongle in, tap a preset, listen.', icon: 'wave' as const },
  { name: 'detent', sub: 'laser rotary tool', text: 'Rotary attachment calculator and job runner for the shop laser. Angles land on the mark.', icon: 'bolt' as const },
  { name: 'burr', sub: 'board viewer', text: 'Drop a kicad board in, spin it around, check the silk before you order.', icon: 'microchip' as const },
]

const principles = [
  { n: '01', title: 'ship the bench', text: 'Tools first. A page exists to get the tool into your hands.' },
  { n: '02', title: 'name the failure mode', text: 'Say what breaks and when. Hidden errors are the only ugly thing here.' },
  { n: '03', title: 'easy mode is a fold', text: 'The fiddly controls fold away. They never get deleted.' },
]
</script>

<template>
  <div>
    <HbNav :links="links" />

    <HbHero kicker="hardware · tools · tutorials">
      <template #title>
        if it doesn't exist,<br />
        <span class="hb-ink-block hb-tilt-r">build it.</span>
      </template>
      Open tools, hardware notes, and the occasional radio that should not
      exist. Everything documented, everything repeatable, everything a
      little bit pink.
      <template #actions>
        <HbButton size="lg" variant="danger">
          <template #icon><HbIcon name="rocket" /></template>
          see the projects
        </HbButton>
        <HbButton size="lg" variant="secondary">
          <template #icon><HbIcon name="book" /></template>
          read the zine
        </HbButton>
      </template>
    </HbHero>

    <section class="hb-on-ink" style="padding: 48px 0">
      <HbShell>
        <div class="hb-sechead">
          <h2 style="color: var(--hb-paper)">the bench<span class="hb-accent">.</span></h2>
          <a class="hb-sechead-link" href="#">all projects</a>
        </div>
        <div class="home-grid">
          <HbMediaCard v-for="project in projects" :key="project.name" :title="project.name" interactive>
            <template #media><HbIcon :name="project.icon" :size="52" /></template>
            <template #tags>
              <HbTag>{{ project.sub }}</HbTag>
            </template>
            {{ project.text }}
            <template #links>
              <a class="hb-link" href="#">open the tool <HbIcon name="arrow-right" :size="12" /></a>
            </template>
          </HbMediaCard>
        </div>
      </HbShell>
    </section>

    <section style="padding: 48px 0 8px">
      <HbShell>
        <HbSectionHead kicker="watch and learn" title="the talk" align="center" underline />
        <div style="max-width: 720px; margin: 0 auto">
          <HbVideoFrame title="hacking your hackerspace">
            <div style="position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; color: var(--hb-paper)">
              <HbIcon name="play" :size="42" />
              <span style="font-family: var(--hb-readout); font-size: 17px">hacking your hackerspace, 28 min</span>
            </div>
          </HbVideoFrame>
        </div>
      </HbShell>
    </section>

    <section style="padding: 40px 0 8px">
      <HbShell>
        <HbSectionHead kicker="the changelog" title="recent drops" />
        <HbTimeline style="max-width: 640px">
          <HbTimelineItem title="kerf 1.4" sub="release" period="jul 2026">
            Waterfall palettes, band stickers, and the ghost tab.
            <template #tags>
              <HbTag variant="outline">sdr</HbTag>
              <HbTag variant="outline">webusb</HbTag>
            </template>
          </HbTimelineItem>
          <HbTimelineItem title="detent 0.9" sub="beta" period="mar 2026">
            Rotary calculator lands. Angles finally land on the mark.
          </HbTimelineItem>
        </HbTimeline>
      </HbShell>
    </section>

    <section style="padding: 48px 0">
      <HbShell>
        <HbSectionHead kicker="how it runs" title="three rules" />
        <div style="display: flex; flex-direction: column; gap: 18px; max-width: 640px">
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

    <HbCta title="let's build something">
      Got a weird hardware project? Want to collaborate on tools? Hit me up.
      <template #actions>
        <HbButton size="lg" variant="danger">
          <template #icon><HbIcon name="envelope" /></template>
          get in touch
        </HbButton>
        <HbButton size="lg" variant="ghost">see the source</HbButton>
      </template>
    </HbCta>

    <HbFooter tagline="make things. break things. repeat." stamp="built with the hack.build design system">
      <div class="hb-footer-col">
        <span class="hb-label">tools</span>
        <a href="#">kerf</a>
        <a href="#">detent</a>
        <a href="#">burr</a>
      </div>
      <div class="hb-footer-col">
        <span class="hb-label">zine</span>
        <a href="#">latest</a>
        <a href="#">archive</a>
        <a href="#">rss</a>
      </div>
      <template #social>
        <a class="hb-iconbtn" href="#" aria-label="github"><HbIcon name="github" :size="16" /></a>
        <a class="hb-iconbtn" href="#" aria-label="youtube"><HbIcon name="youtube" :size="16" /></a>
        <a class="hb-iconbtn" href="#" aria-label="mastodon"><HbIcon name="mastodon" :size="16" /></a>
        <a class="hb-iconbtn" href="#" aria-label="rss feed"><HbIcon name="rss" :size="16" /></a>
      </template>
      <template #bottom>
        <span style="margin-left: auto">no list, no tracking</span>
      </template>
    </HbFooter>

    <HbButton class="demo-back" size="sm" variant="danger" as="a" href="#/demos">exit demo</HbButton>
  </div>
</template>
