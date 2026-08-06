<script setup lang="ts">
import { HbFooter, HbIcon } from '@hackbuild/ui'
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'

const code = `<HbFooter tagline="make things. break things. repeat."
  stamp="built with the hack.build design system">
  <div class="hb-footer-col">
    <span class="hb-label">tools</span>
    <a href="/kerf">kerf</a>
    <a href="/detent">detent</a>
  </div>
  <div class="hb-footer-col">
    <span class="hb-label">zine</span>
    <a href="/latest">latest</a>
    <a href="/rss">rss</a>
  </div>
  <template #social>
    <a class="hb-iconbtn" href="/rss" aria-label="rss"><HbIcon name="rss" /></a>
    <!-- brand glyphs via Font Awesome: -->
    <!-- <a class="hb-iconbtn" aria-label="github"><i class="fa-brands fa-github"></i></a> -->
  </template>
</HbFooter>`
</script>

<template>
  <DemoSection
    title="Footer"
    note="Ink with the pink top rule: brand and tagline left, link columns, social icon squares, and the stamp along the dashed bottom line. Social brand glyphs come from Font Awesome brands; the shipped set stays UI-only."
    :code="code"
  >
    <div style="margin: -16px">
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
          <a class="hb-iconbtn" href="#" aria-label="rss feed"><HbIcon name="rss" :size="16" /></a>
          <a class="hb-iconbtn" href="#" aria-label="video channel"><HbIcon name="video" :size="16" /></a>
          <a class="hb-iconbtn" href="#" aria-label="source code"><HbIcon name="code" :size="16" /></a>
        </template>
        <template #bottom>
          <span style="margin-left: auto">no list, no tracking</span>
        </template>
      </HbFooter>
    </div>
  </DemoSection>

  <PropsTable
    :rows="[
      { prop: 'tagline', type: 'string' },
      { prop: 'stamp', type: 'string', notes: 'the dashed bottom line' },
      { prop: '#default', type: 'slot', notes: 'hb-footer-col link columns' },
      { prop: '#brand / #social / #bottom', type: 'slots' },
    ]"
  />
</template>
