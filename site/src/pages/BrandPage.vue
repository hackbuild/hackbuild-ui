<script setup lang="ts">
import { HbCallout, HbShell } from '@hackbuild/ui'
import markUrl from '@brand/hackbuild-mark.svg'
import markReversedUrl from '@brand/hackbuild-mark-reversed.svg'
import faviconUrl from '@brand/hackbuild-favicon.svg'
import lockupHUrl from '@brand/hackbuild-lockup-horizontal.svg'
import lockupHDarkUrl from '@brand/hackbuild-lockup-horizontal-dark.svg'
import lockupSUrl from '@brand/hackbuild-lockup-stacked.svg'
import lockupSDarkUrl from '@brand/hackbuild-lockup-stacked-dark.svg'
import wordmarkUrl from '@brand/hackbuild-wordmark.svg'
import wordmarkDarkUrl from '@brand/hackbuild-wordmark-dark.svg'

const cells = [
  { url: markUrl, name: 'hackbuild-mark.svg', note: 'arc in ink, wrench pink', dark: false },
  { url: markReversedUrl, name: 'hackbuild-mark-reversed.svg', note: 'arc in paper, for ink and void', dark: true },
  { url: faviconUrl, name: 'hackbuild-favicon.svg', note: '64 px, mark on paper', dark: false },
  { url: lockupHUrl, name: 'hackbuild-lockup-horizontal.svg', note: 'the default lockup', dark: false },
  { url: lockupHDarkUrl, name: 'hackbuild-lockup-horizontal-dark.svg', note: 'on an ink plate', dark: false },
  { url: lockupSUrl, name: 'hackbuild-lockup-stacked.svg', note: 'stickers and covers', dark: false },
  { url: lockupSDarkUrl, name: 'hackbuild-lockup-stacked-dark.svg', note: 'on an ink plate', dark: false },
  { url: wordmarkUrl, name: 'hackbuild-wordmark.svg', note: 'wordmark alone', dark: false },
  { url: wordmarkDarkUrl, name: 'hackbuild-wordmark-dark.svg', note: 'wordmark reversed', dark: false },
]
</script>

<template>
  <HbShell class="site-main">
    <h1>brand</h1>
    <p class="hb-prose" style="margin-top: 8px">
      The mark is two paths taken verbatim from the site favicon: a broken arc
      and a wrench. Calibrated viewBox 117 103 800 800. Every file carrying
      type has it converted to outlined paths, so nothing depends on a font.
      All files ship in the package under <code>@virgilvox/hackbuild-ui/brand/*</code>.
    </p>

    <div class="brand-grid" style="margin-top: 24px">
      <div v-for="cell in cells" :key="cell.name">
        <div class="brand-cell" :class="{ dark: cell.dark }">
          <img :src="cell.url" :alt="cell.name" />
        </div>
        <div class="hb-label" style="margin-top: 6px">{{ cell.name }}</div>
        <div style="font-family: var(--hb-utility); font-size: 11px; color: var(--hb-ink-3)">{{ cell.note }}</div>
      </div>
    </div>

    <h2 style="margin-top: 40px">rules</h2>
    <div class="demo-grid" style="margin-top: 12px">
      <div>
        <h3>sizing</h3>
        <ul style="margin: 8px 0 0; padding-left: 20px">
          <li>mark alone: 16 px floor on screen, 8 mm in print</li>
          <li>horizontal lockup: 120 px wide floor, then drop to the mark</li>
          <li>stacked lockup with tagline: 2 inch floor</li>
          <li>clear space all round: half the mark height</li>
        </ul>
      </div>
      <div>
        <h3>misuse</h3>
        <ul style="margin: 8px 0 0; padding-left: 20px">
          <li>do not recolor the wrench</li>
          <li>no stroke, glow, bevel or drop shadow</li>
          <li>no rotation, skew, or non-uniform stretch</li>
          <li>never rebuild the wordmark in Permanent Marker</li>
        </ul>
      </div>
    </div>

    <HbCallout style="margin-top: 24px">
      Never approximate the mark, never redraw it, never trace it from a
      render. Place it through the calibrated viewBox; a guessed transform
      produced a wrong-sized mark once and it was rejected.
    </HbCallout>
  </HbShell>
</template>
