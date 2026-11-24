<script setup lang="ts">
import {
  HbEventLog, HbGauges, HbKv, HbMemoryItem, HbMessage, HbPanel, HbPill, HbProgress, HbShell,
  HbStage, HbStatusBar, HbStatusList, HbViewport, type HbEventRow, type HbStatusItem,
} from '@hackbuild/ui'

// The refined look next to the zine scope, and instrument mode next to
// the default. Every value on this page is a fixture.
const states: HbStatusItem[] = [
  { key: 'brain', label: 'brain', state: 'ok', title: 'sample model ready' },
  { key: 'voice', label: 'voice', state: 'load', title: 'sample voice loading' },
  { key: 'ears', label: 'ears', state: 'off', title: 'not loaded' },
  { key: 'gpu', label: 'gpu', state: 'err', title: 'adapter lost' },
]
const rows: HbEventRow[] = [
  { id: 1, kind: 'you', text: 'go and sit by the gate' },
  { id: 2, kind: 'me', text: 'on my way.' },
  { id: 3, kind: 'act', text: 'walk to gate, 4.2 m' },
  { id: 4, kind: 'sense', text: 'new things in view: a ball, a bench' },
  { id: 5, kind: 'fail', text: 'grab: nothing in reach' },
  { id: 6, kind: 'load', text: 'sample model 120 of 400 mb', live: true, fraction: 0.3 },
]
const gauges = [
  { label: 'hunger', value: 0.62 },
  { label: 'play', value: 0.81, current: true },
  { label: 'rest', value: 0.24 },
  { label: 'fear', value: 0.08 },
]
const kv: [string, string][] = [
  ['fps', '60'], ['frame', '4.1 ms'], ['tokens', '212'], ['first word', '0.84 s'], ['memory', '38 items'], ['device', 'webgpu'],
]
const cells = [
  { key: 'job', label: 'job', value: 'sample 30%', state: 'load' as const },
  { key: 'brain', label: 'brain', value: 'ready', state: 'ok' as const },
  { key: 'gpu', label: 'gpu', value: 'lost', state: 'err' as const },
]
const reply = 'found it under the bench.\n\nit is wet, and it smells like the pond.\n\nwant me to bring it back to you?'

const tokens: [string, string, string][] = [
  ['--hb-border', '1.5px', 'panels, fields, controls, chips, pills; 2px inside the zine scope'],
  ['--hb-border-em', '2px', 'primary button, modal panel, stage, viewport'],
  ['--hb-shadow-sm / -lg / -xl', '2, 4, 6 px', 'chips; panels and reply boxes; hover lift (5 and 7 px in the zine scope)'],
  ['--hb-readout-sm / -md / -lg', '15, 17, 19 px', 'VT323 for log tags, pills and status cells, stage tags and who lines'],
  ['--hb-state-off / -load / -ok / -err', 'ink 4, warn, ok, err', 'the lit set on ink, the stage and the status bar'],
  ['--hb-ok-ink, --hb-warn-ink', '#137540, #8f5600', 'signal colours as small text on paper, 5.07:1 and 5.28:1 (computed)'],
  ['--hb-dot, --hb-dot-step', '7 percent ink, 7 px', 'the dot grid paper'],
]
const classes: [string, string][] = [
  ['.hb-zine', 'the 2 px zine values for any container; marketing blocks and .hb-prose carry them already'],
  ['.hb-instrument', 'opt in rack density: 12.5 px base, tighter spacing, VT323 values; 44 px targets on touch'],
  ['.hb-led.is-off / is-load / is-ok / is-err', 'the 8 px state light for any row or cell'],
  ['.hb-stage-lit', 'pink glow over diagonal hairlines on sunk paper; HbStage and HbViewport look="lit"'],
  ['.hb-stage-void', 'the void with the pink graph rule; HbViewport look="graph"'],
  ['.hb-stage-tag', 'ink name plate then pink mode plate, for a stage corner'],
  ['.hb-dotgrid', 'dot grid paper on any surface; on body.hb it drops the grain; the app shell has it'],
  ['.hb-fixture, .is-strip', 'the fixture banner at the top of a demo'],
  ['.hb-stroke', 'inline SVG drawn as 2 px lines with square caps'],
  ['HbMessage boxed', 'FERRULE reply boxes with a hard shadow'],
]
</script>

<template>
  <HbShell class="site-main look-page">
    <h1>look</h1>
    <p class="hb-prose" style="margin-top: 8px">
      The refined look from FERRULE, ARBOR and BAIL is the default for app chrome and tool panels from 0.9.0.
      Marketing blocks, docs prose and any <code>.hb-zine</code> container keep the 2 px zine line.
      <code>.hb-instrument</code> is the opt in rack density.
    </p>
    <p class="hb-fixture"><b>fixture</b> every state, name and number on this page is sample data. no model loads here.</p>

    <h2 class="look-h">zine scope and the default</h2>
    <div class="look-pair">
      <div v-for="side in ['zine', 'default']" :key="side" :class="side === 'zine' ? 'hb-zine' : ''">
        <div class="hb-label look-cap">{{ side === 'zine' ? 'before: .hb-zine, 2 px line, 5 px shadow' : 'after: the default, 1.5 px line, 4 px shadow' }}</div>
        <HbPanel heading="rack" head="instrument">
          <div class="look-pills">
            <HbPill status="off">ears</HbPill>
            <HbPill status="load">voice</HbPill>
            <HbPill status="ok">brain</HbPill>
            <HbPill status="err">gpu</HbPill>
          </div>
          <HbKv v-for="[k, v] in kv.slice(0, 3)" :key="k" :label="k"><span class="hb-readout">{{ v }}</span></HbKv>
          <HbProgress :loaded="120" :total="400" state="running" text="sample model, 120 of 400 mb" />
          <div class="look-row">
            <button type="button" class="hb-btn">load</button>
            <button type="button" class="hb-btn hb-btn-2">forget</button>
            <button type="button" class="hb-chip">filter</button>
          </div>
        </HbPanel>
      </div>
    </div>

    <h2 class="look-h">default and instrument mode</h2>
    <div class="look-pair">
      <div v-for="side in ['default', 'instrument']" :key="side" :class="side === 'instrument' ? 'hb-instrument' : ''" :data-look="side">
        <div class="hb-label look-cap">{{ side === 'instrument' ? '.hb-instrument' : 'default' }}</div>
        <HbPanel heading="state" head="instrument">
          <HbKv v-for="[k, v] in kv" :key="k" :label="k"><span class="hb-readout">{{ v }}</span></HbKv>
          <HbGauges :rows="gauges" label="drives" />
          <HbStatusList :items="states" />
          <HbEventLog :rows="rows" label="talk" :filters="false" />
        </HbPanel>
      </div>
    </div>

    <h2 class="look-h">four states</h2>
    <p class="hb-prose">off dimmed, load amber blinking in two steps (a hollow square under reduced motion), ok green, err red. The same four on pills, lights, bars, log tags and status cells, and the lit set on ink.</p>
    <div class="look-states">
      <span v-for="s in ['off', 'load', 'ok', 'err']" :key="s" class="look-state"><i class="hb-led" :class="`is-${s}`" aria-hidden="true" />{{ s }}</span>
    </div>
    <HbStatusBar :cells="cells" />

    <h2 class="look-h">stages</h2>
    <div class="look-pair">
      <div>
        <div class="hb-label look-cap">HbStage look="lit"</div>
        <HbStage look="lit">
          <div class="look-stage"><span class="hb-stage-tag"><b>stage</b><span>talk</span></span></div>
        </HbStage>
      </div>
      <div>
        <div class="hb-label look-cap">HbViewport look="graph"</div>
        <HbViewport look="graph" label="sample stage" quiet>
          <div class="hb-viewport-host"><canvas aria-hidden="true" /></div>
          <template #tl><span class="hb-stage-tag"><b>stage</b><span>3d</span></span></template>
        </HbViewport>
      </div>
    </div>

    <h2 class="look-h">paper</h2>
    <div class="look-papers">
      <div class="look-paper hb-dotgrid"><span class="hb-label">.hb-dotgrid, 7 px</span></div>
      <div class="look-paper hb-halftone"><span class="hb-label">.hb-halftone, 4 px</span></div>
    </div>

    <h2 class="look-h">reply boxes and memory</h2>
    <div class="look-pair">
      <div class="look-chat">
        <HbMessage who="user" text="did you find the ball?" boxed />
        <HbMessage name="dog" :text="reply" split boxed :stats="{ tokPerSec: 31, firstMs: 840 }" />
      </div>
      <div class="look-chat">
        <HbMemoryItem kind="rule" text="the ball lives under the bench after rain." entity="ball" :score="1.03" />
        <HbMemoryItem kind="episode" text="walked to the gate with you at dusk." when="today" />
      </div>
    </div>

    <h2 class="look-h">tokens</h2>
    <div class="look-table">
      <table class="hb-table">
        <thead><tr><th>token</th><th>value</th><th>use</th></tr></thead>
        <tbody><tr v-for="[t, v, u] in tokens" :key="t"><td><code>{{ t }}</code></td><td>{{ v }}</td><td>{{ u }}</td></tr></tbody>
      </table>
    </div>
    <h2 class="look-h">classes</h2>
    <div class="look-table">
      <table class="hb-table">
        <thead><tr><th>class</th><th>use</th></tr></thead>
        <tbody><tr v-for="[c, u] in classes" :key="c"><td><code>{{ c }}</code></td><td>{{ u }}</td></tr></tbody>
      </table>
    </div>
  </HbShell>
</template>
