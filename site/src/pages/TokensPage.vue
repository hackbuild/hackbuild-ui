<script setup lang="ts">
import { HbCallout, HbPanel, HbShell, HbStage } from '@hackbuild/ui'
import CodeBlock from '../components/CodeBlock.vue'

const surfaces = [
  { name: '--hb-pink', hex: '#FE0386', note: 'the one accent' },
  { name: '--hb-pink-deep', hex: '#c70269', note: 'pressed pink' },
  { name: '--hb-paper', hex: '#f5f0e6', note: 'page surface' },
  { name: '--hb-paper-raised', hex: '#fffdf7', note: 'panels and cards' },
  { name: '--hb-paper-sunk', hex: '#efe9db', note: 'wells and stripes' },
  { name: '--hb-paper-edge', hex: '#e8e0d0', note: 'code, disabled' },
  { name: '--hb-ink', hex: '#1a1a1a', note: 'text and borders' },
  { name: '--hb-ink-2', hex: '#444444', note: 'secondary text' },
  { name: '--hb-ink-3', hex: '#6b6459', note: 'labels, captions' },
  { name: '--hb-ink-4', hex: '#9a9184', note: 'placeholders' },
  { name: '--hb-void', hex: '#0a0a0a', note: 'stages, consoles' },
]

const signals = [
  { name: '--hb-ok', hex: '#1f9d55', note: 'pass, connected' },
  { name: '--hb-warn', hex: '#c77700', note: 'caution, clipping' },
  { name: '--hb-err', hex: '#c3251f', note: 'fault, dropped' },
  { name: '--hb-info', hex: '#2b6cb0', note: 'neutral series' },
]

const platesList = [
  { name: '--hb-plate-teal', hex: '#14b8a6', note: 'paper foreground' },
  { name: '--hb-plate-purple', hex: '#8b5cf6', note: 'paper foreground' },
  { name: '--hb-plate-blue', hex: '#3b82f6', note: 'paper foreground' },
  { name: '--hb-plate-amber', hex: '#f59e0b', note: 'ink foreground' },
  { name: '--hb-plate-green', hex: '#22c55e', note: 'ink foreground' },
]

const lits = [
  { name: '--hb-slime', hex: '#a6e22e', note: 'on-void ok' },
  { name: '--hb-lit-warn', hex: '#ffb020', note: 'on-void caution' },
  { name: '--hb-lit-err', hex: '#ff5c4d', note: 'on-void fault' },
  { name: '--hb-lit-info', hex: '#58a6ff', note: 'on-void neutral' },
]

const faces = [
  { face: 'Permanent Marker', token: '--hb-display', job: 'h1, h2, h3, panel headings, stickers', sample: 'make things. break things.', style: 'font-family:var(--hb-display);font-size:26px' },
  { face: 'Special Elite', token: '--hb-body', job: 'prose, advisory notes, hero subtitles', sample: 'The quick brown fox jumps over the lazy dog.', style: 'font-family:var(--hb-body);font-size:15px' },
  { face: 'IBM Plex Mono', token: '--hb-utility', job: 'labels, buttons, tabs, tables, code, wordmark', sample: 'CENTER FREQUENCY 433.920', style: "font-family:var(--hb-utility);font-size:13px;font-weight:600;letter-spacing:.09em" },
  { face: 'VT323', token: '--hb-readout', job: 'live numbers, counters, console lines', sample: '2402.500 MHz  -55 dBm', style: 'font-family:var(--hb-readout);font-size:26px;color:var(--hb-pink)' },
  { face: 'Libre Baskerville italic', token: '--hb-tagline', job: 'the tagline and nothing else', sample: 'make things. break things. repeat.', style: 'font-family:var(--hb-tagline);font-style:italic;font-size:16px;color:var(--hb-ink-3)' },
]

const shadows = [
  { token: '--hb-shadow', value: '3px 3px 0 ink', use: 'controls' },
  { token: '--hb-shadow-lg', value: '5px 5px 0 ink', use: 'panels and cards' },
  { token: '--hb-shadow-xl', value: '7px 7px 0 ink', use: 'hover and hero' },
  { token: '--hb-shadow-pink', value: '5px 5px 0 pink', use: 'the one stage per view' },
]

const spaces = [4, 8, 12, 16, 24, 32, 48, 64]

const tailwind = `/* app.css */
@import "tailwindcss";
@import "@hackbuild/ui/styles.css";
@import "@hackbuild/ui/theme.css";

/* then: bg-paper text-ink font-display shadow-hard tracking-label */`
</script>

<template>
  <HbShell class="site-main">
    <h1>tokens</h1>
    <p class="hb-prose" style="margin-top: 8px">
      Everything below ships in tokens.css and is the single source of truth.
      The class layer and the Tailwind bridge both read from it. Click nothing;
      copy freely.
    </p>

    <h2 style="margin-top: 32px">color</h2>
    <p class="hb-prose" style="margin-top: 6px">
      The pink is punctuation, not paint. One competing pink element per view.
    </p>
    <div class="tok-grid" style="margin-top: 12px">
      <div v-for="token in surfaces" :key="token.name" class="tok-swatch">
        <div class="chip" :style="{ background: token.hex }" />
        <div class="meta">
          <b>{{ token.hex }}</b>
          <span>{{ token.note }}<br />{{ token.name }}</span>
        </div>
      </div>
    </div>

    <h3 style="margin-top: 28px">signal, paper set</h3>
    <div class="tok-grid" style="margin-top: 10px">
      <div v-for="token in signals" :key="token.name" class="tok-swatch">
        <div class="chip" :style="{ background: token.hex }" />
        <div class="meta"><b>{{ token.hex }}</b><span>{{ token.note }}<br />{{ token.name }}</span></div>
      </div>
    </div>

    <h3 style="margin-top: 28px">the plate palette</h3>
    <p class="hb-prose" style="margin-top: 6px">
      Identity colors for media plates, avatars and category coding. Solid
      fills behind a paper icon or marker initials, never chrome, never
      text. The pink and the ink complete the set.
    </p>
    <div class="tok-grid" style="margin-top: 10px">
      <div v-for="token in platesList" :key="token.name" class="tok-swatch">
        <div class="chip" :style="{ background: token.hex }" />
        <div class="meta"><b>{{ token.hex }}</b><span>{{ token.note }}<br />{{ token.name }}</span></div>
      </div>
    </div>

    <h3 style="margin-top: 28px">signal, lit set</h3>
    <p class="hb-prose" style="margin-top: 6px">
      The paper set goes muddy on the void, so marks drawn inside a stage or
      console use these instead. The stylesheet swaps them automatically.
    </p>
    <div class="tok-grid" style="margin-top: 10px">
      <div v-for="token in lits" :key="token.name" class="tok-swatch">
        <div class="chip" :style="{ background: token.hex }" />
        <div class="meta"><b>{{ token.hex }}</b><span>{{ token.note }}<br />{{ token.name }}</span></div>
      </div>
    </div>
    <HbStage label="the lit set on the void" style="margin-top: 16px">
      <div style="font-family: var(--hb-readout); font-size: 22px; line-height: 1.5; margin-top: 6px">
        <span style="color: var(--hb-slime)">locked</span>
        <span style="color: var(--hb-lit-warn); margin-left: 16px">clipping</span>
        <span style="color: var(--hb-lit-err); margin-left: 16px">dropped 41</span>
        <span style="color: var(--hb-pink); margin-left: 16px">2402.500 MHz</span>
        <span style="color: var(--hb-lit-dim); margin-left: 16px">ghost path</span>
      </div>
    </HbStage>

    <h2 style="margin-top: 40px">type</h2>
    <p class="hb-prose" style="margin-top: 6px">
      Four faces, four jobs, plus the tagline face. The split is what makes the
      system work; one face everywhere collapses it into noise.
    </p>
    <HbPanel v-for="face in faces" :key="face.token" style="margin-top: 12px">
      <div class="hb-label">{{ face.face }} · {{ face.token }} · {{ face.job }}</div>
      <div :style="face.style + ';margin-top:8px'">{{ face.sample }}</div>
    </HbPanel>

    <h2 style="margin-top: 40px">shadow</h2>
    <p class="hb-prose" style="margin-top: 6px">
      Hard offset, no blur, no spread. They read as a print registration error,
      which is the point. Pressing a control collapses its shadow.
    </p>
    <div class="demo-row" style="margin-top: 16px; gap: 28px">
      <div
        v-for="shadow in shadows"
        :key="shadow.token"
        style="background: var(--hb-paper-raised); border: 2px solid var(--hb-ink); padding: 18px 16px; width: 200px"
        :style="{ boxShadow: shadow.value.replace('ink', 'var(--hb-ink)').replace('pink', 'var(--hb-pink)') }"
      >
        <b style="font-family: var(--hb-utility); font-size: 11px">{{ shadow.token }}</b>
        <div class="hb-label" style="margin-top: 4px">{{ shadow.use }}</div>
      </div>
    </div>

    <h2 style="margin-top: 40px">spacing</h2>
    <p class="hb-prose" style="margin-top: 6px">Eight steps on a 4 px base.</p>
    <div style="margin-top: 12px; display: flex; flex-direction: column; gap: 6px">
      <div v-for="(space, index) in spaces" :key="space" style="display: flex; align-items: center; gap: 12px">
        <span class="hb-label" style="width: 64px">--hb-s{{ index + 1 }}</span>
        <i :style="{ width: space + 'px', height: '14px', background: 'var(--hb-pink)', display: 'block' }" />
        <span style="font-family: var(--hb-utility); font-size: 11px; color: var(--hb-ink-3)">{{ space }} px</span>
      </div>
    </div>

    <h2 style="margin-top: 40px">tailwind bridge</h2>
    <p class="hb-prose" style="margin-top: 6px">
      For Tailwind v4 apps, theme.css maps every token into theme variables.
      The radius scale is zeroed on purpose.
    </p>
    <CodeBlock :code="tailwind" />

    <HbCallout variant="warn" style="margin-top: 24px">
      The favicon values are the record. Older files carrying #ff3366, #ff2d7b
      or #E91E8C are wrong and should be corrected wherever found.
    </HbCallout>
  </HbShell>
</template>
