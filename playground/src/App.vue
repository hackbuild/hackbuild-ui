<script setup lang="ts">
import { ref } from 'vue'
import {
  HbAppShell, HbAvatar, HbButton, HbCallout, HbCard, HbCheckbox, HbChip,
  HbConsole, HbDial, HbDrawer, HbDropdown, HbEmptyState, HbField, HbFold,
  HbHeader, HbInput, HbKbd, HbKv, HbList, HbMeter, HbModal, HbNum,
  HbPagination, HbPanel, HbPill, HbRadio, HbRow, HbSeg, HbSegMeter,
  HbSelect, HbSkeleton, HbSlider, HbSpinner, HbStage, HbStatusBar,
  HbSticker, HbSwitch, HbTable, HbTabs, HbTextarea, HbTile, HbTiles,
  HbToaster, HbToolbar, HbWordmark, useToast,
  type HbConsoleLine, type HbTableColumn,
} from '@hackbuild/ui'

const tab = ref<string | number>('controls')
const mode = ref<string | number>('easy')
const band = ref<string | number>('wfm')
const squelch = ref(true)
const peakHold = ref(false)
const freq = ref(101.1)
const volume = ref(72)
const gain = ref(42)
const name = ref('')
const notes = ref('')
const modulation = ref<string | number>('nfm')
const agree = ref(false)
const polarity = ref<string | number>('pos')
const streaming = ref(true)
const page = ref(3)
const modalOpen = ref(false)
const drawerOpen = ref(false)
const activeRow = ref(0)
const activeTile = ref(0)
const signal = ref(0.55)

const { toast } = useToast()

const consoleLines: HbConsoleLine[] = [
  { t: '14:02:11', text: 'dongle connected, rtl2832u', level: 'ok' },
  { t: '14:02:12', text: 'sample rate 2.048 msps' },
  { t: '14:02:19', text: 'tuned 101.100 mhz', level: 'hit' },
  { t: '14:03:41', text: 'buffer underrun, 12 samples', level: 'warn' },
  { t: '14:04:02', text: 'usb stall, resetting endpoint', level: 'err' },
]

const columns: HbTableColumn[] = [
  { key: 'addr', label: 'address' },
  { key: 'type', label: 'type' },
  { key: 'rssi', label: 'rssi', numeric: true },
  { key: 'seen', label: 'seen', numeric: true },
]

const rows = [
  { addr: 'a4:c1:38:0b:11:02', type: 'ble beacon', rssi: -61, seen: 214 },
  { addr: '5c:02:14:9f:33:d8', type: 'thermometer', rssi: -74, seen: 96 },
  { addr: 'ec:81:0a:44:7c:1f', type: 'tire sensor', rssi: -88, seen: 12 },
]

const bookmarks = [
  { name: 'NOAA 1', freq: '162.550' },
  { name: 'ATC tower', freq: '124.400' },
  { name: '2m calling', freq: '146.520' },
]

const tiles = [
  { name: 'fm radio', sub: '101.1 wfm' },
  { name: 'weather', sub: '162.55 nfm' },
  { name: 'airplanes', sub: '124.4 am' },
  { name: 'doorbells', sub: '433.92 spec' },
]
</script>

<template>
  <HbAppShell>
    <template #header>
      <HbHeader title="playground" accent="." tagline="make things. break things. repeat.">
        <HbPill :status="streaming ? 'live' : 'err'">{{ streaming ? 'streaming' : 'no device' }}</HbPill>
        <span class="hb-spacer" style="margin-left: auto" />
        <HbSeg v-model="mode" :options="['easy', 'advanced']" />
      </HbHeader>
    </template>

    <template #tabs>
      <HbTabs
        v-model="tab"
        :tabs="[
          { label: 'controls', value: 'controls' },
          { label: 'data', value: 'data' },
          { label: 'instrument', value: 'instrument' },
          { label: 'overlays', value: 'overlays' },
        ]"
      />
    </template>

    <template #toolbar>
      <HbToolbar>
        <HbButton size="sm" @click="streaming = !streaming">{{ streaming ? 'disconnect' : 'connect' }}</HbButton>
        <HbSeg v-model="band" :options="['wfm', 'nfm', 'am']" />
        <HbChip v-model="squelch">squelch</HbChip>
        <HbChip v-model="peakHold">peak hold</HbChip>
        <span class="hb-spacer" />
        <span class="hb-readout">2.048 msps</span>
      </HbToolbar>
    </template>

    <HbPanel v-show="tab === 'controls'" heading="Buttons and chips">
      <div style="display: flex; gap: 12px; flex-wrap: wrap; align-items: center">
        <HbButton>primary</HbButton>
        <HbButton variant="secondary">secondary</HbButton>
        <HbButton variant="danger">arm laser</HbButton>
        <HbButton disabled>disabled</HbButton>
        <HbButton loading>saving</HbButton>
        <HbButton size="sm" variant="secondary">small</HbButton>
        <HbButton size="lg">large</HbButton>
        <HbSpinner />
        <HbKbd>ctrl</HbKbd>
        <HbKbd>k</HbKbd>
      </div>
      <div style="display: flex; gap: 12px; flex-wrap: wrap; align-items: center; margin-top: 16px">
        <HbPill status="live">streaming</HbPill>
        <HbPill status="ok">adopted</HbPill>
        <HbPill status="warn">clipping</HbPill>
        <HbPill status="err">no device</HbPill>
        <HbPill>idle</HbPill>
        <HbSticker>fm broadcast</HbSticker>
        <HbSticker variant="secondary">rev b</HbSticker>
        <HbNum>04</HbNum>
        <HbAvatar initials="mz" />
        <HbAvatar size="lg" initials="hb" />
      </div>
    </HbPanel>

    <HbPanel v-show="tab === 'controls'" heading="Fields">
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 0 24px">
        <HbField label="center frequency" for="pg-freq" hint="mhz, 24 to 1766">
          <HbInput id="pg-freq" v-model="name" placeholder="433.920" inputmode="decimal" />
        </HbField>
        <HbField label="modulation" for="pg-mod">
          <HbSelect id="pg-mod" v-model="modulation" :options="[
            { label: 'NFM', value: 'nfm' },
            { label: 'WFM', value: 'wfm' },
            { label: 'AM', value: 'am' },
            { label: 'USB', value: 'usb' },
          ]" />
        </HbField>
        <HbField label="session notes" for="pg-notes" error="write something before saving">
          <HbTextarea id="pg-notes" v-model="notes" :rows="3" placeholder="what did you hear" />
        </HbField>
      </div>
      <div style="display: flex; gap: 20px; flex-wrap: wrap; align-items: center; margin-top: 8px">
        <HbCheckbox v-model="agree">log to disk</HbCheckbox>
        <HbRadio v-model="polarity" value="pos" name="pol">positive</HbRadio>
        <HbRadio v-model="polarity" value="neg" name="pol">negative</HbRadio>
        <label class="hb-check">
          <HbSwitch v-model="peakHold" label="peak hold" />
          peak hold
        </label>
      </div>
      <div style="max-width: 420px; margin-top: 16px">
        <HbSlider v-model="volume" label="volume" />
        <HbSlider v-model="gain" label="hush the static" :min="-20" :max="60" unit="dB" />
      </div>
    </HbPanel>

    <HbPanel v-show="tab === 'data'" heading="Table">
      <HbTable :columns="columns" :rows="rows" />
    </HbPanel>

    <HbPanel v-show="tab === 'data'" heading="Rows and folds">
      <HbList>
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
      <div style="margin-top: 16px">
        <HbFold summary="advanced">
          <HbKv label="ppm correction" value="-1.2" />
          <HbKv label="bias tee" value="off" />
        </HbFold>
      </div>
      <HbCallout>Direct sampling below 24 MHz needs the bias tee off.</HbCallout>
      <HbCallout variant="err">The dongle dropped 41 samples in the last second.</HbCallout>
      <HbEmptyState title="no captures yet">
        Connect a dongle and hit record. Sessions land here.
        <template #action>
          <HbButton size="sm">record</HbButton>
        </template>
      </HbEmptyState>
      <div style="display: flex; gap: 16px; align-items: center; margin-top: 16px; flex-wrap: wrap">
        <HbPagination v-model="page" :pages="12" />
        <HbSkeleton width="120px" height="14px" />
      </div>
    </HbPanel>

    <HbPanel v-show="tab === 'instrument'" heading="Dial and meters">
      <HbDial v-model="freq" :digits="3" :decimals="3" unit="MHz" :min="0" :max="1766" />
      <div style="margin-top: 16px; display: flex; flex-direction: column; gap: 10px">
        <HbSegMeter :value="signal" label="signal" />
        <HbSegMeter :value="0.93" label="signal over threshold" />
        <HbMeter :value="volume" label="volume" />
      </div>
      <div style="max-width: 420px; margin-top: 12px">
        <HbSlider v-model="signal" label="drive the meter" :min="0" :max="1" :step="0.01" />
      </div>
    </HbPanel>

    <HbPanel v-show="tab === 'instrument'" heading="Tiles">
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

    <HbStage v-show="tab === 'instrument'" label="stage, the dark instrument surface" graph>
      <div style="height: 120px; display: flex; align-items: flex-end; gap: 4px" aria-hidden="true">
        <i
          v-for="n in 48"
          :key="n"
          :style="{
            flex: 1,
            display: 'block',
            height: 8 + Math.abs(Math.sin(n / 4)) * 100 + '%',
            background: n === 24 ? 'var(--hb-pink)' : 'var(--hb-lit-dim)',
          }"
        />
      </div>
    </HbStage>

    <HbConsole v-show="tab === 'instrument'" :lines="consoleLines" />

    <HbPanel v-show="tab === 'overlays'" heading="Overlays">
      <div style="display: flex; gap: 12px; flex-wrap: wrap">
        <HbButton @click="modalOpen = true">open modal</HbButton>
        <HbButton variant="secondary" @click="drawerOpen = true">open drawer</HbButton>
        <HbButton variant="secondary" @click="toast('bookmark saved')">toast</HbButton>
        <HbDropdown
          label="export"
          :items="[
            { label: 'wav capture', value: 'wav' },
            { label: 'iq samples', value: 'iq' },
            { label: 'csv log', value: 'csv', disabled: true },
          ]"
          @select="toast('export ' + $event)"
        />
      </div>
      <p style="margin-top: 16px">
        The wordmark component: <HbWordmark :size="22" />
      </p>
    </HbPanel>

    <template #rail>
      <HbPanel heading="Instrument">
        <HbKv label="center" value="101.100" />
        <HbKv label="peak" value="-55 dBm" />
        <HbKv label="floor" value="-97 dBm" />
        <HbKv label="samples lost" value="0" />
      </HbPanel>
      <HbCard interactive>
        <div class="hb-label">interactive card</div>
        <p style="margin: 6px 0 0">Lifts on hover, presses on click.</p>
      </HbCard>
    </template>

    <template #statusbar>
      <HbStatusBar>
        <span>fps <b>60</b></span>
        <span>fft <b>4096</b></span>
        <span>audio <b>48k</b></span>
        <span>dropped <b>0</b></span>
      </HbStatusBar>
    </template>
  </HbAppShell>

  <HbModal v-model="modalOpen" title="Save session">
    <HbField label="session name" for="pg-session">
      <HbInput id="pg-session" placeholder="tuesday night scan" />
    </HbField>
    <template #footer>
      <HbButton variant="secondary" @click="modalOpen = false">cancel</HbButton>
      <HbButton @click="modalOpen = false; toast('session saved')">save</HbButton>
    </template>
  </HbModal>

  <HbDrawer v-model="drawerOpen">
    <HbPanel heading="Drawer" sunk>
      <p>The mobile home of the rail, and of any nav that will not fit a bar.</p>
      <HbButton size="sm" @click="drawerOpen = false">close</HbButton>
    </HbPanel>
  </HbDrawer>

  <HbToaster />
</template>
