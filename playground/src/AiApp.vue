<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import {
  HbBubble, HbCapabilities, HbCausalLog, HbChat, HbChecks, HbChoiceBars, HbDrawer,
  HbDropzone, HbGauges, HbHeader, HbHudStat, HbInset,
  HbLoader, HbModelList, HbPanel, HbPermission, HbPill, HbProgress, HbReadouts,
  HbSeg, HbSparkRows, HbStatusBar, HbStatusLine, HbTabs, HbTranscript, HbViewport, HbWave,
  type HbCap, type HbCapVerb, type HbChatLine, type HbCheckRow, type HbModelRow, type HbProgressState,
  type HbTranscriptSegment,
} from '@hackbuild/ui'
import { createMinds, rng } from './minds-sim'

// Sample strings are taken from the consumer pages: the hackbuild-motion
// motion-net and lipsync examples, the hackbuild-browser-ai chat,
// transcribe, imagegen and devices examples, the ai-elements view models,
// and the dog-simulator brain and cortex panels.
const q = new URLSearchParams(location.search)
const tab = ref<string | number>(q.get('tab') ?? 'scene')

/* ---- scene ------------------------------------------------------------ */
const canvas = ref<HTMLCanvasElement | null>(null)
const eye = ref<HTMLCanvasElement | null>(null)
const vp = ref<InstanceType<typeof HbViewport> | null>(null)
const fps = ref(0)
const frameMs = ref(0)
const workMs = ref(0)
const covered = ref(q.has('cover'))
const coverError = ref(q.get('cover') === 'err')
const dog = { x: 0.5, y: 0.62 }
const bubble = ref({ x: 0, y: 0 })
let raf = 0
let last = 0
const intervals: number[] = []

function drawScene(t: number) {
  const c = canvas.value
  if (!c) return
  const dpr = window.devicePixelRatio || 1
  const w = (c.width = Math.round(c.clientWidth * dpr))
  const h = (c.height = Math.round(c.clientHeight * dpr))
  const g = c.getContext('2d')!
  // a brightly lit yard: the scene draws its own light background
  g.fillStyle = '#eef2ef'
  g.fillRect(0, 0, w, h)
  g.fillStyle = '#dfe6df'
  g.fillRect(0, h * 0.55, w, h * 0.45)
  g.strokeStyle = 'rgba(26,26,26,.12)'
  g.lineWidth = dpr
  for (let i = 0; i <= 12; i++) {
    const x = (i / 12) * w
    g.beginPath(); g.moveTo(w / 2 + (x - w / 2) * 0.3, h * 0.55); g.lineTo(x, h); g.stroke()
  }
  dog.x = 0.5 + Math.sin(t / 1400) * 0.28
  const px = dog.x * w
  const py = dog.y * h
  g.fillStyle = '#1a1a1a'
  g.fillRect(px - 34 * dpr, py - 18 * dpr, 68 * dpr, 26 * dpr)
  g.fillRect(px + 26 * dpr, py - 34 * dpr, 20 * dpr, 20 * dpr)
  g.fillStyle = '#FE0386'
  g.fillRect(px - 30 * dpr, py + 8 * dpr, 8 * dpr, 18 * dpr)
  g.fillRect(px + 18 * dpr, py + 8 * dpr, 8 * dpr, 18 * dpr)
  bubble.value = { x: px / dpr + 30, y: py / dpr - 40 }
  const e = eye.value
  if (e) {
    const ew = (e.width = Math.round(e.clientWidth * dpr))
    const eh = (e.height = Math.round(e.clientHeight * dpr))
    const eg = e.getContext('2d')!
    eg.fillStyle = '#c9d2c9'
    eg.fillRect(0, 0, ew, eh)
    eg.fillStyle = '#a7b3a7'
    eg.fillRect(0, eh * 0.5, ew, eh * 0.5)
    eg.strokeStyle = '#a6e22e'
    eg.lineWidth = 2 * dpr
    eg.strokeRect(ew * (0.3 + Math.sin(t / 900) * 0.1), eh * 0.35, ew * 0.22, eh * 0.3)
  }
}
function loop(now: number) {
  if (last) intervals.push(now - last)
  if (intervals.length > 120) intervals.shift()
  last = now
  const t0 = performance.now()
  drawScene(now)
  workMs.value = performance.now() - t0
  const s = [...intervals].sort((a, b) => a - b)
  frameMs.value = s[Math.floor(s.length * 0.95)] ?? 0
  fps.value = s.length ? 1000 / (s[Math.floor(s.length / 2)] ?? 16) : 0
  raf = requestAnimationFrame(loop)
}

const drives = computed(() => [
  { label: 'hunger', value: 0.42 },
  { label: 'thirst', value: 0.18 },
  { label: 'play', value: 0.71, current: true },
  { label: 'rest', value: 0.33 },
  { label: 'prey', value: 0.56 },
  { label: 'bond', value: 0.5 },
])
const readouts = computed(() => [
  { label: 'fps p50 (measured)', value: fps.value },
  { label: 'frame ms p95 (measured)', value: frameMs.value },
  { label: 'work ms p50 (measured)', value: workMs.value },
  { label: 'webgpu', value: 'yes, apple metal-3' },
  { label: 'shader-f16', value: 'yes' },
  { label: 'wasm threads (computed)', value: 8 },
])
const dropped = ref('')


/* ---- minds: seeded fake agents at 2 Hz ------------------------------- */
const seed = Number(q.get('seed') ?? 7)
const minds = createMinds(seed)
const mtick = ref(0)
const who = ref<string | number>('dog')
const pinned = ref<Array<string | number>>([])
const byAgent = ref(q.has('group'))
const frozen = q.has('freeze')
const sparkOf = (list: typeof minds.state.drives) => list.map((s) => ({ label: s.label, values: [...s.values], threshold: s.threshold, ticks: [...s.ticks] }))
const dogDrives = computed(() => (mtick.value, sparkOf(minds.state.drives)))
const humNeeds = computed(() => (mtick.value, sparkOf(minds.state.needs)))
const dogOpts = computed(() => (mtick.value, minds.state.dog.options.map((o) => ({ ...o }))))
const humOpts = computed(() => (mtick.value, minds.state.hum.options.map((o) => ({ ...o }))))
const events = computed(() => (mtick.value, minds.state.events.slice(0, 120).map((e) => ({ ...e }))))
const clock = computed(() => (mtick.value, minds.state.t))
const dogNow = computed(() => (mtick.value, { ...minds.state.dog, inFor: minds.state.t - minds.state.dog.since }))
const humNow = computed(() => (mtick.value, { ...minds.state.hum, inFor: minds.state.t - minds.state.hum.since }))
let mtimer = 0
if (q.get('pin')) pinned.value = [Number(q.get('pin'))]

/* ---- capabilities: the dog simulator rows, loading faked ------------- */
const gpu = ref(q.get('gpu') !== '0')
const capR = rng(seed + 1)
const MB = 1024 * 1024
const caps = ref<HbCap[]>([])
function buildCaps() {
  const g = gpu.value
  caps.value = [
    { id: 'eye', name: 'eye renderer', icon: 'eye', state: 'on', needs: [{ kind: 'webgpu', label: g ? 'webgpu' : 'webgl2, no webgpu' }], licence: 'three.js MIT', licenceWhat: 'renderer', commercial: true, offAction: '' },
    { id: 'gait', name: 'neural gait', icon: 'paw', state: 'off', needs: [{ kind: 'other', label: g ? 'webgpu worker' : 'cpu, slower' }], size: '17.7 MB', sizeSource: 'vendor', licence: 'CC-BY-NC-4.0', commercial: false, licenceWhat: 'model and mocap', action: 'load and turn on' },
    { id: 'yolo', name: 'object detector on the eye', icon: 'eye', state: 'off', needs: [{ kind: 'webgpu', label: g ? 'webgpu' : 'wasm, no webgpu' }], size: '12.8 MB', sizeSource: 'vendor', licence: 'AGPL-3.0', commercial: false, action: 'load and turn on' },
    { id: 'cortex-s', name: 'dog cortex, small', icon: 'brain', state: g ? 'off' : 'unavailable', needs: [{ kind: 'webgpu', missing: !g }], size: 'about 320 MB', sizeSource: 'vendor', licence: 'LFM Open License 1.0', commercial: null, action: 'download and turn on', reason: g ? '' : 'no webgpu adapter. the cortex needs it.' },
    { id: 'cortex-l', name: 'dog cortex, large', icon: 'brain', state: g ? 'off' : 'unavailable', needs: [{ kind: 'webgpu', missing: !g }], size: 'about 3.3 GB', sizeSource: 'vendor', licence: 'Apache-2.0', commercial: true, action: 'download and turn on', reason: g ? '' : 'no webgpu adapter. the cortex needs it.' },
    { id: 'human', name: 'human mind', icon: 'user', state: g ? 'off' : 'unavailable', needs: [{ kind: 'model', label: 'a cortex model', missing: !g }], dependsOn: 'cortex-s', action: 'turn on', reason: g ? '' : 'no webgpu adapter, so no cortex model to drive him.' },
    { id: 'voice', name: 'his voice', icon: 'comment', state: 'off', size: 'size unknown until the first fetch', licence: 'CC-BY-NC-4.0', commercial: false, licenceWhat: 'engine Apache-2.0, models', action: 'load' },
    { id: 'talk', name: 'talk to the dog', icon: 'microphone', state: 'off', needs: ['microphone'], action: 'allow the microphone', ask: 'in chrome, audio goes to the browser speech service. nothing is stored.' },
    { id: 'cam', name: 'webcam gestures and smiles', icon: 'camera', state: q.get('cam') === 'blocked' ? 'failed' : 'off', needs: ['camera'], size: 'two files, size unknown', licence: 'Apache-2.0', commercial: true, action: 'allow the camera', ask: 'the camera turns on, and two gesture models download from google. the microphone is not used.', reason: 'the camera was blocked. allow it in the address bar, then try again.' },
    { id: 'clap', name: 'clap detection', icon: 'ear-listen', state: 'off', needs: ['microphone'], action: 'allow the microphone' },
    { id: 'sound', name: 'sound', icon: 'wave', state: 'on' },
  ]
}
buildCaps()
const capsOpen = ref(q.has('drawer'))
const capsOn = computed(() => caps.value.filter((c) => c.state === 'on').length)
const loads = new Map<string, number>()
const SIZES: Record<string, number | null> = { gait: 17.7 * MB, yolo: 12.8 * MB, 'cortex-s': 320 * MB, 'cortex-l': 3300 * MB, voice: null }
function setCap(id: string, patch: Partial<HbCap>) {
  caps.value = caps.value.map((c) => (c.id === id ? { ...c, ...patch } : c))
}
function load(id: string) {
  const total = SIZES[id] ?? null
  setCap(id, { state: 'loading', loaded: 0, total })
  const failAt = q.get('fail') === id ? 0.6 : 2
  const t = window.setInterval(() => {
    const c = caps.value.find((x) => x.id === id)!
    const add = (total ?? 40 * MB) / (18 + capR() * 10)
    const loaded = (c.loaded ?? 0) + add
    if (total && loaded / total >= failAt) { clearInterval(t); setCap(id, { state: 'failed', reason: 'download failed. the server closed the connection at ' + Math.round(loaded / MB) + ' MB.' }); return }
    if (loaded >= (total ?? 40 * MB)) { clearInterval(t); loads.delete(id); setCap(id, { state: 'on', loaded, reason: '' }); return }
    setCap(id, { loaded })
  }, 300)
  loads.set(id, t)
}
function onCap(id: string, verb: HbCapVerb) {
  const c = caps.value.find((x) => x.id === id)!
  if (verb === 'cancel') { clearInterval(loads.get(id)); setCap(id, { state: 'off', loaded: 0 }); return }
  if (verb === 'disable') { setCap(id, { state: 'off' }); return }
  if (id === 'cam' || id === 'talk' || id === 'clap') { setCap(id, { state: 'on' }); return }
  if (c.dependsOn) {
    const p = caps.value.find((x) => x.id === c.dependsOn)!
    if (p.state !== 'on') { load(p.id); const w = window.setInterval(() => { const pp = caps.value.find((x) => x.id === p.id)!; if (pp.state === 'on') { clearInterval(w); setCap(id, { state: 'on' }) } else if (pp.state !== 'loading') clearInterval(w) }, 300); return }
    setCap(id, { state: 'on' }); return
  }
  if (id in SIZES) load(id)
  else setCap(id, { state: 'on' })
}
if (q.get('loading')) load(q.get('loading')!)

/* ---- model ------------------------------------------------------------ */
const url = ref('https://huggingface.co/sweriko/quadruped/resolve/main/quadruped.bin')
const total = 17.7 * 1024 * 1024
const loaded = ref(q.get('state') === 'done' ? total : 0)
const state = ref<HbProgressState>((q.get('state') as HbProgressState) ?? 'idle')
const error = ref(q.get('state') === 'failed' ? 'quadruped.bin: sha-256 3f9a0c21b7e4 does not match the known 9b1e77d0a2c4. the file was not used.' : '')
const sha = ref(q.get('state') === 'failed' ? '3f9a0c21b7e4d0a51e6f0c9d2b8a7e3f5c1d9e0b4a6f8c2d7e1b3a5c9f0d2e4b' : q.get('state') === 'done' ? '9b1e77d0a2c4f6e8b0d2c4a6e8f0b2d4c6a8e0f2b4d6c8a0e2f4b6d8c0a2e4f6' : '')
const hashing = ref(false)
let dl = 0
function startLoad() {
  state.value = 'running'
  error.value = ''
  sha.value = ''
  clearInterval(dl)
  dl = window.setInterval(() => {
    loaded.value = Math.min(total, loaded.value + total / 40)
    if (loaded.value >= total) {
      clearInterval(dl)
      state.value = 'done'
      hashing.value = true
      setTimeout(() => {
        hashing.value = false
        sha.value = '9b1e77d0a2c4f6e8b0d2c4a6e8f0b2d4c6a8e0f2b4d6c8a0e2f4b6d8c0a2e4f6'
      }, 900)
    }
  }, 250)
}
function cancelLoad() { clearInterval(dl); state.value = 'paused' }
if (state.value === 'running') { loaded.value = total * 0.42; startLoad() }

const models: HbModelRow[] = [
  { id: 'qwen2.5-0.5b', label: 'qwen2.5 0.5b instruct', size: '945 MB, vendor', devices: 'webgpu or wasm', licence: 'weights Apache-2.0, commercial use allowed', disabled: null, first: 'webgpu q4f16' },
  { id: 'smolvlm-256m', label: 'smolvlm 256m instruct', size: '260 MB, inferred', devices: 'webgpu or wasm', licence: 'weights Apache-2.0, commercial use allowed', disabled: null, first: 'wasm q8' },
  { id: 'lfm2-vl-450m', label: 'lfm2-vl 450m', size: '320 MB, inferred', devices: 'webgpu', licence: 'weights LFM Open License v1.0, commercial use unknown', disabled: 'the gpu has no shader-f16. this model needs it.', first: null },
  { id: 'sd-turbo', label: 'sd-turbo', size: '2.6 GB, vendor', devices: 'webgpu', licence: 'weights Stability AI Community License, no commercial use', disabled: null, first: 'webgpu fp16' },
]
const picked = ref<string | null>('qwen2.5-0.5b')
const dlB = ref(6.2 * 1024 * 1024)

/* ---- talk ------------------------------------------------------------- */
const lines = ref<HbChatLine[]>([
  { role: 'system', text: 'qwen2.5 0.5b on webgpu q4f16. weights Apache-2.0.' },
  { role: 'user', text: 'Name three things to pack for a rainy hike, one line each.' },
  { role: 'assistant', text: 'a hooded rain shell.\na dry bag for your phone and keys.\nwool socks, and a spare pair.', think: 'short list, one line each, practical.', done: true },
])
const streaming = ref(false)
const draft = ref('')
const key = ref('')
let tok = 0
function send(text: string) {
  lines.value.push({ role: 'user', text })
  lines.value.push({ role: 'assistant', text: '', done: false })
  streaming.value = true
  const words = 'the bowl is half full. i would drink first, then go back to the ball by the porch.'.split(' ')
  let i = 0
  clearInterval(tok)
  tok = window.setInterval(() => {
    const l = lines.value[lines.value.length - 1]!
    l.text += (i ? ' ' : '') + words[i++]
    if (i >= words.length) { clearInterval(tok); l.done = true; streaming.value = false }
  }, 120)
}
function stop() {
  clearInterval(tok)
  const l = lines.value[lines.value.length - 1]
  if (l && l.done === false) { l.done = true; l.note = 'stopped.' }
  streaming.value = false
}
const segments: HbTranscriptSegment[] = [
  { start: 0, end: 1.84, text: 'The kettle is on.' },
  { start: 1.84, end: 4.12, text: 'Pour the water when it clicks,' },
  { start: 4.12, end: 6.3, text: 'then wait three minutes.' },
  { start: 6.3, end: 7.1, text: 'and then', partial: true },
]
const now = ref(2.6)
const samples = computed(() => Array.from({ length: 160 }, (_, i) => Math.sin(i / 3) * Math.exp(-((i - 70) ** 2) / 1800) * (0.5 + 0.5 * Math.sin(i / 11))))
const levels = computed(() => Array.from({ length: 80 }, (_, i) => Math.abs(Math.sin(i / 5) * 0.6 + Math.sin(i / 2.3) * 0.25)))

/* ---- checks ----------------------------------------------------------- */
const checks: HbCheckRow[] = [
  { id: 'probe webgpu', status: 'pass', reason: 'adapter apple metal-3', value: 'yes' },
  { id: 'runtimes import', status: 'pass', reason: '', value: '412 ms (measured)' },
  { id: 'resume a download', status: 'fail', reason: 'the server ignored the range header and sent the whole file again.', value: '23 MB (inferred)' },
  { id: 'sha-256 throughput', status: 'pass', reason: '', value: '611 MB/s (measured)' },
  { id: 'prompt api', status: 'not run', reason: 'no built in prompt api in this browser.' },
  { id: 'opfs write', status: 'running', reason: '' },
]
const heat = [
  ['sit', [0.82, 0.05, 0.1, 0.0]],
  ['spin', [0.1, 0.64, 0.0, 0.2]],
  ['down', [0.3, 0.0, 0.47, 0.05]],
  ['fetch', [0.0, 0.12, 0.08, 0.91]],
] as const
const actions = ['sit', 'spin', 'lie', 'fetch']

// scent and hearing feeds: seeded noise in ink tones
function fillFeeds() {
  let seed = 7
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647)
  document.querySelectorAll<HTMLCanvasElement>('.hb-feed canvas').forEach((c) => {
    const g = c.getContext('2d')!
    for (let y = 0; y < c.height; y++) for (let x = 0; x < c.width; x++) {
      const v = Math.max(0, Math.sin(x / 5 + y / 7) * 0.5 + rnd() * 0.5)
      g.fillStyle = `rgba(166,226,46,${v.toFixed(2)})`
      g.fillRect(x, y, 1, 1)
    }
  })
}
onMounted(() => {
  raf = requestAnimationFrame(loop); fillFeeds()
  if (!frozen) mtimer = window.setInterval(() => { minds.step(); mtick.value++ }, 500)
})
onBeforeUnmount(() => { cancelAnimationFrame(raf); clearInterval(dl); clearInterval(tok); clearInterval(mtimer); loads.forEach((t) => clearInterval(t)) })
const fmt = (s: number) => s.toFixed(1)
</script>

<template>
  <div class="pg-ai">
    <HbHeader title="hackle" accent="." tagline="a dog with a brain, a body and eyes, running in your browser" tagline-kind="tool">
      <HbPill :status="gpu ? 'ok' : 'warn'">{{ gpu ? 'webgpu' : 'webgl2, no webgpu' }}</HbPill>
    </HbHeader>
    <HbTabs v-model="tab" :tabs="['scene', 'minds', { label: 'turn on', value: 'caps' }, 'model', 'talk', 'checks']" label="views" id-prefix="pg" />

    <!-- scene: the viewport, its hud and the rail. focal pink: the current drive. -->
    <div v-if="tab === 'scene'" class="hb-bar">
          <label class="hb-ctl">speed m/s <input class="hb-range" type="range" min="0" max="3" step="0.05" value="0.8"><span class="hb-readout">0.80</span></label>
          <label class="hb-ctl">tail <select class="hb-select"><option>wag</option><option>low</option></select></label>
          <label class="hb-check"><input type="checkbox" checked> foot lock</label>
          <button class="hb-btn hb-btn-2" type="button" @click="covered = !covered; coverError = false">toggle cover</button>
          <button class="hb-btn hb-btn-2" type="button" @click="covered = true; coverError = true">no adapter</button>
    </div>
    <div v-if="tab === 'scene'" class="pg-work">
      <div class="pg-col">
        <HbViewport
          ref="vp"
          label="3d yard"
          :cover-title="covered ? (coverError ? 'no webgpu adapter' : 'waking the dog') : ''"
          :cover-note="covered ? (coverError ? 'sd-turbo needs it; this page has no wasm path. open it in a browser with webgpu.' : 'loading the gait wasm.') : ''"
          :cover-error="coverError"
        >
          <canvas ref="canvas" />
          <template #tl>
            <HbInset title="dog eye" aux="dichromat, 20/75">
              <canvas ref="eye" />
            </HbInset>
          </template>
          <template #tr>
            <div class="hb-hudstats">
              <HbHudStat label="fps" :value="fps" :state="fps && fps < 50 ? 'warn' : 'none'" />
              <HbHudStat label="frame" :value="frameMs" unit="ms" />
              <HbHudStat label="infer" value="38" unit="ms" />
            </div>
          </template>
          <template #b>
            <button class="hb-btn" type="button">throw ball</button>
            <button class="hb-btn hb-btn-2" type="button">treat</button>
            <button class="hb-btn hb-btn-2" type="button">good dog</button>
            <button class="hb-btn hb-btn-2" type="button">fill bowl</button>
            <button class="hb-btn hb-btn-2" type="button">follow</button>
          </template>
          <template v-if="covered && !coverError" #cover>
            <span class="hb-spinner"><i /><i /><i /></span>
          </template>
          <HbBubble :x="bubble.x" :y="bubble.y" text="ball? ball." />
          <HbDropzone cover hint="show the dog this photo" @files="dropped = $event[0]?.name ?? ''" />
        </HbViewport>
        <HbStatusLine :text="dropped ? `picked ${dropped}. this page does not load it.` : 'the dog walks on the procedural gait. drag to orbit.'" kind="ok" />
        <HbReadouts :rows="readouts" />
        <div class="hb-feeds">
          <figure class="hb-feed is-pixel"><canvas width="32" height="16" /><figcaption>scent left</figcaption></figure>
          <figure class="hb-feed is-pixel"><canvas width="32" height="16" /><figcaption>scent right</figcaption></figure>
          <figure class="hb-feed is-pixel"><canvas width="32" height="16" /><figcaption>hearing</figcaption></figure>
        </div>
      </div>
      <div class="pg-col">
        <HbPanel>
          <h3 class="hb-panel-hd-inst">drives <span class="hb-hd-aux">need 0..1</span></h3>
          <HbGauges :rows="drives" label="drives" />
        </HbPanel>
        <HbPanel>
          <h3 class="hb-panel-hd-inst">behavior <span class="hb-hd-aux">4.2s</span></h3>
          <h3>play</h3>
          <p style="margin: 0">the ball is close and play is the highest drive.</p>
        </HbPanel>
        <HbPanel>
          <h3 class="hb-panel-hd-inst">heard</h3>
          <div class="hb-heard" data-empty='say "sit", "spin", or any new word' />
        </HbPanel>
      </div>
    </div>

    <!-- minds: two agents and one timeline. focal pink: the dog's chosen bar. -->
    <template v-if="tab === 'minds'">
      <div id="pg-panel-minds" role="tabpanel" aria-labelledby="pg-tab-minds">
        <div class="hb-bar">
          <HbSeg v-model="who" toggle class="pg-who" :options="[{ label: 'dog', value: 'dog' }, { label: 'moheeb', value: 'moheeb' }]" aria-label="whose mind" />
          <button class="hb-btn hb-btn-2" type="button" @click="capsOpen = true">turn things on, {{ capsOn }} of {{ caps.length }} on</button>
        </div>
        <div class="pg-work pg-minds" :data-show="who">
          <div class="pg-col" data-agent="dog">
            <HbPanel>
              <h3 class="hb-panel-hd-inst">dog, now <span class="hb-hd-aux">{{ fmt(dogNow.inFor) }} s</span></h3>
              <h3>{{ dogNow.cur }}</h3>
              <p class="pg-why">{{ dogNow.why }}</p>
              <p class="pg-next">next look in {{ fmt(Math.max(0, dogNow.nextLook)) }} s</p>
            </HbPanel>
            <HbPanel>
              <h3 class="hb-panel-hd-inst">drives <span class="hb-hd-aux">computed, 120 s</span></h3>
              <HbSparkRows :rows="dogDrives" label="dog drives" :window="120" />
            </HbPanel>
            <HbPanel>
              <h3 class="hb-panel-hd-inst">choice <span class="hb-hd-aux">top 3 of {{ dogOpts.length }}</span></h3>
              <HbChoiceBars
                :options="dogOpts"
                :limit="3"
                :why="dogNow.why"
                :meta="`temperature 0.06, commitment 0.12 x 1.11 (independence), next look in ${fmt(Math.max(0, dogNow.nextLook))} s`"
                label="dog options"
              />
              <details class="hb-fold">
                <summary>all {{ dogOpts.length }}</summary>
                <div class="hb-fold-body"><HbChoiceBars :options="dogOpts" quiet :legend="false" :announce="false" label="all dog options" /></div>
              </details>
            </HbPanel>
          </div>
          <div class="pg-col" data-agent="moheeb">
            <HbPanel>
              <h3 class="hb-panel-hd-inst">moheeb, now <span class="hb-hd-aux">{{ humNow.src }}</span></h3>
              <h3>{{ humNow.cur }}</h3>
              <p class="pg-why">{{ humNow.why }}</p>
            </HbPanel>
            <HbPanel>
              <h3 class="hb-panel-hd-inst">needs <span class="hb-hd-aux">computed, 120 s</span></h3>
              <HbSparkRows :rows="humNeeds" label="moheeb needs" :window="120" />
            </HbPanel>
            <HbPanel>
              <h3 class="hb-panel-hd-inst">plan <span class="hb-hd-aux">routine draw from the top 3</span></h3>
              <HbChoiceBars :options="humOpts" quiet :why="humNow.why" meta="repeat penalty 0.55 per repeat in the last three tasks" label="moheeb plan" />
            </HbPanel>
          </div>
          <div class="pg-col pg-span">
            <HbPanel>
              <h3 class="hb-panel-hd-inst">timeline <span class="hb-hd-aux">{{ fmt(clock) }} s</span></h3>
              <label class="hb-check pg-group"><input v-model="byAgent" type="checkbox"> group by agent</label>
              <HbCausalLog v-model:pinned="pinned" :events="events" :agents="['dog', 'moheeb']" :group="byAgent" label="cause timeline, newest first" />
            </HbPanel>
          </div>
        </div>
      </div>
    </template>

    <!-- turn on: the capability panel. focal pink: the running download. -->
    <div v-else-if="tab === 'caps'" id="pg-panel-caps" class="pg-work" role="tabpanel" aria-labelledby="pg-tab-caps">
      <div class="pg-col">
        <HbPanel>
          <h3 class="hb-panel-hd-inst">turn things on <span class="hb-hd-aux">{{ gpu ? 'webgpu' : 'webgl2, no webgpu' }}</span></h3>
          <HbCapabilities :caps="caps" @act="onCap" />
        </HbPanel>
      </div>
      <div class="pg-col">
        <HbPanel>
          <h3 class="hb-panel-hd-inst">this device</h3>
          <label class="hb-check"><input v-model="gpu" type="checkbox" @change="buildCaps"> pretend there is a webgpu adapter</label>
          <p class="pg-why">every row stays when the device cannot run it, so you learn it exists. the reason sits beside the disabled button.</p>
        </HbPanel>
      </div>
    </div>

    <!-- model: loader, model list, permissions. focal pink: the running download. -->
    <div v-if="tab === 'model'" class="pg-work">
      <div class="pg-col">
        <HbLoader
          v-model:url="url"
          instrument
          title="quadruped codebook network"
          url-label="weights"
          drop-hint="or drop quadruped.json, quadruped.bin and bind.json here"
          multiple
          :size-m-b="17.7"
          size-source="vendor"
          licence="CC-BY-NC-4.0"
          :commercial="false"
          :sha256="sha"
          expected-sha256="9b1e77d0a2c4f6e8b0d2c4a6e8f0b2d4c6a8e0f2b4d6c8a0e2f4b6d8c0a2e4f6"
          :hashing="hashing"
          :loaded="loaded"
          :total="total"
          :state="state"
          :error="error"
          @load="startLoad"
          @cancel="cancelLoad"
          @resume="startLoad"
        >
          <template #licence>model and mocap from ai4animationpy; read it before you download.</template>
        </HbLoader>
        <HbPanel>
          <h3 class="hb-panel-hd-inst">models</h3>
          <HbModelList v-model="picked" :models="models" />
        </HbPanel>
      </div>
      <div class="pg-col">
        <HbPanel>
          <h3 class="hb-panel-hd-inst">this browser</h3>
          <div style="display: flex; flex-direction: column; gap: var(--hb-s2)">
            <HbPermission name="webgpu adapter" icon="microchip" state="ok" state-text="present" reason="apple metal-3, shader-f16." />
            <HbPermission name="microphone" icon="microphone" state="ask" reason="the mouth follows your level. the page asks when you press talk." action="allow" />
            <HbPermission name="camera" icon="camera" state="denied" reason="no camera: permission denied. allow it in the site settings, then try again." action="try again" />
            <HbPermission name="cross origin isolation" icon="shield-halved" state="missing" reason="the page is not cross origin isolated. wasm runs on one thread." />
            <HbPermission name="storage" icon="sd-card" state="checking" reason="probing opfs and cache storage." />
          </div>
        </HbPanel>
        <HbPanel>
          <h3 class="hb-panel-hd-inst">second download</h3>
          <HbProgress :loaded="dlB" :total="null" state="running" quiet />
          <div style="height: var(--hb-s3)" />
          <HbProgress :loaded="dlB" :total="23 * 1024 * 1024" state="paused" />
        </HbPanel>
      </div>
    </div>

    <!-- talk: chat, transcript and audio. focal pink: the segment playing now. -->
    <div v-else-if="tab === 'talk'" class="pg-work">
      <div class="pg-col">
        <HbChat v-model:draft="draft" v-model:api-key="key" :lines="lines" :streaming="streaming" key-field assistant-name="qwen2.5" @send="send" @stop="stop" />
      </div>
      <div class="pg-col">
        <HbPanel>
          <h3 class="hb-panel-hd-inst">transcript <span class="hb-hd-aux">whisper tiny.en</span></h3>
          <HbTranscript :segments="segments" :now="now" seekable @seek="now = $event + 0.01" />
        </HbPanel>
        <HbPanel>
          <h3 class="hb-panel-hd-inst">audio</h3>
          <div style="display: flex; flex-direction: column; gap: var(--hb-s2)">
            <HbWave label="speech" value="7.1 s" :samples="samples" :at="now / 7.1" />
            <HbWave label="mic level" value="-18 dB" :samples="levels" bars />
            <HbWave label="mic level" value="off" :samples="levels" bars off />
          </div>
        </HbPanel>
      </div>
    </div>

    <!-- checks: no focal pink in this view. -->
    <div v-else-if="tab === 'checks'" class="pg-work">
      <div class="pg-col">
        <HbPanel>
          <h3 class="hb-panel-hd-inst">devices <span class="hb-hd-aux">?auto</span></h3>
          <HbChecks :rows="checks" caption="browser checks for the devices page" />
        </HbPanel>
      </div>
      <div class="pg-col">
        <HbPanel>
          <h3 class="hb-panel-hd-inst">associations <span class="hb-hd-aux">rw + pkh</span></h3>
          <div class="hb-scroll-x">
            <table class="hb-heat">
              <thead><tr><th /><th v-for="a in actions" :key="a" scope="col">{{ a }}</th></tr></thead>
              <tbody>
                <tr v-for="[cue, vals] in heat" :key="cue">
                  <th scope="row">{{ cue }}</th>
                  <td v-for="(v, i) in vals" :key="i" :class="{ 'is-hi': v > 0.5 }" :style="{ '--v': v }">{{ v.toFixed(2) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </HbPanel>
      </div>
    </div>

    <HbDrawer v-model="capsOpen">
      <h3 class="hb-panel-hd-inst">turn things on</h3>
      <HbCapabilities :caps="caps" @act="onCap" />
    </HbDrawer>

    <HbStatusBar>
      <span>fps {{ fps.toFixed(0) }}</span>
      <span>frame {{ frameMs.toFixed(1) }} ms</span>
      <span class="hb-tag is-lit-ok">gpu webgpu</span>
    </HbStatusBar>
  </div>
</template>
