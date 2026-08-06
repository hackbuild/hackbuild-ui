<script setup lang="ts">
import { ref } from 'vue'
import {
  HbAppShell, HbButton, HbCallout, HbCheckbox, HbField, HbFold, HbHeader,
  HbInput, HbKv, HbPanel, HbPill, HbSeg, HbSelect, HbSlider, HbStatusBar,
  HbSwitch, HbTabs, HbTextarea, HbToaster, HbToolbar, useToast,
} from '@hackbuild/ui'

const tab = ref<string | number>('capture')
const callsign = ref('')
const grid = ref('DM43')
const rate = ref<string | number>('2.048')
const gain = ref(28)
const agc = ref(true)
const biasTee = ref(false)
const logToDisk = ref(true)
const notes = ref('')
const theme = ref<string | number>('paper')
const ppm = ref(-1)

const { toast } = useToast()

function save() {
  toast('settings saved')
}
</script>

<template>
  <HbAppShell>
    <template #header>
      <HbHeader title="kerf" accent="." tagline="make things. break things. repeat.">
        <HbPill status="ok">adopted</HbPill>
      </HbHeader>
    </template>
    <template #tabs>
      <HbTabs v-model="tab" :tabs="['capture', 'audio', 'display', 'about']" />
    </template>
    <template #toolbar>
      <HbToolbar>
        <span class="hb-label">settings</span>
        <span class="hb-spacer" />
        <HbButton size="sm" variant="secondary" @click="toast('defaults restored')">restore defaults</HbButton>
        <HbButton size="sm" @click="save">save</HbButton>
      </HbToolbar>
    </template>

    <HbPanel heading="station">
      <div class="demo-grid">
        <HbField label="callsign" for="st-call" hint="optional, stamped into captures">
          <HbInput id="st-call" v-model="callsign" placeholder="N0CALL" />
        </HbField>
        <HbField label="grid square" for="st-grid">
          <HbInput id="st-grid" v-model="grid" />
        </HbField>
        <HbField label="sample rate" for="st-rate">
          <HbSelect id="st-rate" v-model="rate" :options="['0.960', '1.024', '2.048', '2.400']" />
        </HbField>
      </div>
      <HbField label="session notes" for="st-notes">
        <HbTextarea id="st-notes" v-model="notes" :rows="3" placeholder="antenna, weather, anything odd" />
      </HbField>
    </HbPanel>

    <HbPanel heading="front end">
      <div style="max-width: 460px">
        <HbSlider v-model="gain" label="rf gain" :min="0" :max="49" unit="dB" />
      </div>
      <div class="demo-row" style="margin-top: 8px; gap: 24px">
        <label class="hb-check"><HbSwitch v-model="agc" label="agc" /> agc</label>
        <label class="hb-check"><HbSwitch v-model="biasTee" label="bias tee" /> bias tee</label>
        <HbCheckbox v-model="logToDisk">log to disk</HbCheckbox>
      </div>
      <HbCallout v-if="biasTee" variant="warn" style="margin-top: 16px; margin-bottom: 0">
        Bias tee feeds 4.5 V up the coax. Anything that is not an lna will not
        enjoy it.
      </HbCallout>
    </HbPanel>

    <HbPanel heading="display">
      <div class="demo-row" style="gap: 24px">
        <div>
          <div class="hb-label" style="margin-bottom: 4px">texture</div>
          <HbSeg v-model="theme" :options="['paper', 'halftone']" />
        </div>
      </div>
    </HbPanel>

    <HbFold summary="advanced">
      <div style="max-width: 460px">
        <HbSlider v-model="ppm" label="ppm correction" :min="-20" :max="20" />
      </div>
      <HbKv label="firmware" value="1.4.2" />
      <HbKv label="serial" value="00000102" />
    </HbFold>

    <template #statusbar>
      <HbStatusBar>
        <span>profile <b>default</b></span>
        <span>unsaved <b>0</b></span>
      </HbStatusBar>
    </template>
  </HbAppShell>
  <HbToaster />
  <HbButton class="demo-back" size="sm" variant="danger" as="a" href="#/demos">exit demo</HbButton>
</template>
