<script setup lang="ts">
import { brandIconNames, HbIcon, iconNames, strokeIconNames, strokePortedNames } from '@hackbuild/ui'

// Every icon the library draws. The stroke set is for app chrome and tool
// panels; the solid set stays for marketing and prose; brands for footers.
const ported = new Set<string>(strokePortedNames)
const solidOnly = iconNames.filter((n) => !(strokeIconNames as string[]).includes(n))
</script>

<template>
  <div class="site-main icons-page">
    <h1>icons</h1>
    <p class="hb-prose icons-lede">
      App chrome and tool panels draw the stroke set: lines on a 24 grid, square caps, mitre joins,
      <code>currentColor</code>, one width from <code>--hb-border</code>. Marketing and prose surfaces keep
      Font Awesome solid with <code>set="solid"</code>. A name the stroke set lacks falls back to the solid glyph,
      and a Font Awesome class string still renders.
    </p>
    <p class="hb-fixture"><b>fixture</b> every icon the library ships, drawn at 20 px and 14 px. the pink corner marks a FERRULE or ARBOR drawing.</p>

    <h2 class="icons-h">stroke set, {{ strokeIconNames.length }} names</h2>
    <div class="icons-grid">
      <div v-for="name in strokeIconNames" :key="name" class="icons-cell" :class="{ 'is-ported': ported.has(name) }">
        <span class="icons-pair"><HbIcon :name="name" :size="20" /><HbIcon :name="name" :size="14" /></span>
        <span class="icons-name">{{ name }}</span>
      </div>
    </div>

    <h2 class="icons-h">in chrome</h2>
    <div class="icons-row">
      <button type="button" class="hb-iconbtn" aria-label="settings"><HbIcon name="gear" /></button>
      <button type="button" class="hb-iconbtn" aria-label="speak"><HbIcon name="volume" /></button>
      <button type="button" class="hb-iconbtn" aria-label="flip camera"><HbIcon name="flip" /></button>
      <button type="button" class="hb-iconbtn" aria-label="delete"><HbIcon name="trash" /></button>
      <button type="button" class="hb-btn"><HbIcon name="send" />send</button>
      <button type="button" class="hb-btn hb-btn-2"><HbIcon name="upload" />upload</button>
      <span class="hb-zine icons-zine"><button type="button" class="hb-iconbtn" aria-label="close"><HbIcon name="x" /></button> zine scope, 2 px</span>
    </div>

    <h2 class="icons-h">solid only, {{ solidOnly.length }} names</h2>
    <p class="hb-prose">Font Awesome Free solid, baked in. Use with <code>set="solid"</code> on marketing blocks, or as the fallback for a name the stroke set lacks.</p>
    <div class="icons-grid">
      <div v-for="name in solidOnly" :key="name" class="icons-cell">
        <span class="icons-pair"><HbIcon :name="name" set="solid" :size="20" /></span>
        <span class="icons-name">{{ name }}</span>
      </div>
    </div>

    <h2 class="icons-h">brands, {{ brandIconNames.length }} names</h2>
    <div class="icons-grid">
      <div v-for="name in brandIconNames" :key="name" class="icons-cell">
        <span class="icons-pair"><HbIcon :name="name" :size="20" /></span>
        <span class="icons-name">{{ name }}</span>
      </div>
    </div>
  </div>
</template>
