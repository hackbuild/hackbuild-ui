<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import {
  HbAppShell, HbButton, HbChip, HbConsole, HbDial, HbHeader, HbKv, HbList,
  HbPanel, HbPill, HbRow, HbSeg, HbSegMeter, HbSlider, HbStage, HbStatusBar,
  HbSticker, HbTabs, HbTile, HbTiles, HbToolbar,
  type HbConsoleLine,
} from '@hackbuild/ui'

const tab = ref<string | number>('radio')
const mode = ref<string | number>('easy')
const band = ref<string | number>('wfm')
const squelch = ref(true)
const freq = ref(101.1)
const volume = ref(72)
const signal = ref(0.55)
const streaming = ref(true)
const activeTile = ref(0)
const activeRow = ref(0)

const tiles = [
  { name: 'fm radio', sub: '101.1 wfm' },
  { name: 'weather', sub: '162.55 nfm' },
  { name: 'airplanes', sub: '124.4 am' },
  { name: 'walkies', sub: '462.5 nfm' },
  { name: 'ham 2m', sub: '146.52 nfm' },
  { name: 'doorbells', sub: '433.92 spec' },
]

const bookmarks = [
  { name: 'NOAA 1', freq: '162.550' },
  { name: 'ATC tower', freq: '124.400' },
  { name: '2m calling', freq: '146.520' },
  { name: 'time beeps', freq: '10.000' },
]

const lines = ref<HbConsoleLine[]>([
  { t: '14:02:11', text: 'dongle connected, rtl2832u', level: 'ok' },
  { t: '14:02:12', text: 'sample rate 2.048 msps' },
  { t: '14:02:19', text: 'tuned 101.100 mhz', level: 'hit' },
])

// live spectrum on the stage
const scope = ref<HTMLCanvasElement | null>(null)
let raf = 0
let t = 0

function draw() {
  const canvas = scope.value
  const context = canvas?.getContext('2d')
  if (!canvas || !context) return
  const w = (canvas.width = canvas.clientWidth)
  const h = (canvas.height = 240)
  t += 0.02
  context.clearRect(0, 0, w, h)
  // graticule
  context.strokeStyle = 'rgba(254,3,134,.10)'
  context.lineWidth = 1
  for (let x = 0; x < w; x += 32) {
    context.beginPath(); context.moveTo(x, 0); context.lineTo(x, h); context.stroke()
  }
  for (let y = 0; y < h; y += 32) {
    context.beginPath(); context.moveTo(0, y); context.lineTo(w, y); context.stroke()
  }
  // trace
  context.strokeStyle = '#FE0386'
  context.lineWidth = 2
  context.beginPath()
  for (let x = 0; x <= w; x += 2) {
    const u = x / w
    const noise = Math.sin(x * 0.35 + t * 7) * 3 + Math.sin(x * 0.11 - t * 3) * 4
    const peak1 = 90 * Math.exp(-(((u - 0.5) * 18) ** 2))
    const peak2 = 46 * Math.exp(-(((u - 0.22) * 22) ** 2))
    const peak3 = 30 * Math.exp(-(((u - 0.78) * 26) ** 2))
    const wobble = 6 * Math.sin(t * 2.1)
    const y = h - 26 - peak1 - peak2 - peak3 - noise - wobble * Math.exp(-(((u - 0.5) * 10) ** 2))
    if (x === 0) context.moveTo(x, y)
    else context.lineTo(x, y)
  }
  context.stroke()
  signal.value = 0.45 + 0.18 * Math.sin(t * 1.7) + 0.05 * Math.sin(t * 9)
  raf = requestAnimationFrame(draw)
}

onMounted(() => {
  raf = requestAnimationFrame(draw)
})

onUnmounted(() => cancelAnimationFrame(raf))
</script>

<template>
  <HbAppShell>
    <template #header>
      <HbHeader title="kerf" accent="." tagline="make things. break things. repeat.">
        <HbPill :status="streaming ? 'live' : 'err'">{{ streaming ? 'streaming' : 'no device' }}</HbPill>
        <span style="margin-left: auto" />
        <HbSeg v-model="mode" :options="['easy', 'advanced']" />
      </HbHeader>
    </template>
    <template #tabs>
      <HbTabs v-model="tab" :tabs="['radio', 'sky', 'ghost', 'scanner', 'bench']" />
    </template>
    <template #toolbar>
      <HbToolbar>
        <HbButton size="sm" @click="streaming = !streaming">{{ streaming ? 'disconnect' : 'connect dongle' }}</HbButton>
        <HbSeg v-model="band" :options="['wfm', 'nfm', 'am', 'usb']" />
        <HbChip v-model="squelch">squelch</HbChip>
        <span class="hb-spacer" />
        <span class="hb-readout">2.048 msps</span>
      </HbToolbar>
    </template>

    <HbPanel head="instrument" heading="tuning">
      <div style="position: relative">
        <HbDial v-model="freq" :digits="3" :decimals="3" unit="MHz" :max="1766" />
        <HbSticker style="position: absolute; left: 24px; bottom: -10px">fm broadcast</HbSticker>
      </div>
      <div style="margin-top: 20px">
        <div class="hb-label" style="margin-bottom: 4px">signal</div>
        <HbSegMeter :value="signal" :segments="28" />
      </div>
      <div style="max-width: 460px; margin-top: 14px">
        <HbSlider v-model="volume" label="volume" />
      </div>
    </HbPanel>

    <HbStage label="spectrum" style="padding-bottom: 6px">
      <canvas ref="scope" class="hb-scope" style="height: 240px" />
    </HbStage>

    <HbPanel heading="tap and listen">
      <HbTiles>
        <HbTile
          v-for="(tile, index) in tiles"
          :key="tile.name"
          :name="tile.name"
          :sub="tile.sub"
          :active="index === activeTile"
          @click="activeTile = index"
        />
      </HbTiles>
    </HbPanel>

    <HbConsole :lines="lines" height="140px" />

    <template #rail>
      <HbPanel heading="instrument">
        <HbKv label="center" :value="freq.toFixed(3)" />
        <HbKv label="peak" value="-55 dBm" />
        <HbKv label="floor" value="-97 dBm" />
        <HbKv label="samples lost" value="0" />
      </HbPanel>
      <HbPanel heading="bookmarks">
        <HbList style="margin: 0 -8px">
          <HbRow
            v-for="(bookmark, index) in bookmarks"
            :key="bookmark.name"
            :active="index === activeRow"
            @click="activeRow = index"
          >
            {{ bookmark.name }}
            <span class="hb-spacer" />
            <span class="hb-readout" style="font-size: 15px">{{ bookmark.freq }}</span>
          </HbRow>
        </HbList>
      </HbPanel>
    </template>

    <template #statusbar>
      <HbStatusBar>
        <span>fps <b>60</b></span>
        <span>fft <b>4096</b></span>
        <span>audio <b>48k</b></span>
        <span>dropped <b>0</b></span>
        <span class="hb-spacer" style="margin-left: auto">kerf 1.4 <b>webusb</b></span>
      </HbStatusBar>
    </template>
  </HbAppShell>
  <HbButton class="demo-back" size="sm" variant="danger" as="a" href="#/demos">exit demo</HbButton>
</template>
