// The vanilla demo page: plain markup, one call per block, no Vue.
import '@hackbuild/ui/styles.css'
import './vanilla.css'
import {
  activity,
  confirmDialog,
  confirmInline,
  copier,
  drawer,
  dropRoutes,
  hotkeys,
  menu,
  modal,
  persisted,
  tabs,
  undoStack,
  type ActivityTask,
} from '@hackbuild/ui/vanilla'

const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T
const say = (id: string, text: string) => { $(id).textContent = text }
const el = (tag: string, cls: string, text = '') => {
  const n = document.createElement(tag)
  if (cls) n.className = cls
  n.textContent = text
  return n
}

// tabs, with the chosen tab kept in localStorage
const tabStore = persisted('hb:vanilla:tab', 'chat')
const tabStrip = tabs($('demo-tabs'), {
  value: tabStore.get(),
  onChange: (v) => {
    tabStore.set(v)
    say('tabs-out', `tab: ${v}, kept across reloads`)
  },
})
say('tabs-out', `tab: ${tabStrip.value}, kept across reloads`)

// drawer and modal
let side: 'left' | 'right' = 'right'
let settings = drawer($('demo-drawer'), {
  trigger: $('open-drawer'),
  label: 'settings',
  onClose: (why) => say('over-out', `drawer closed by ${why}`),
})
$('drawer-side').addEventListener('click', () => {
  side = side === 'right' ? 'left' : 'right'
  settings.dispose()
  settings = drawer($('demo-drawer'), { trigger: $('open-drawer'), label: 'settings', side, open: true })
  $('drawer-side').textContent = side === 'right' ? 'move to the left' : 'move to the right'
})
const about = modal($('demo-modal'), {
  trigger: $('open-modal'),
  label: 'about this page',
  onClose: (why) => say('over-out', `modal closed by ${why}`),
})

// menu
const workspace = menu($('demo-menu'), { onSelect: (v) => say('menu-out', `picked: ${v}`) })

// drop routes on the window
const dropOut = $('drop-out')
const noteDrop = (route: string, files: File[]) => {
  const li = el('li', 'hb-status is-ok', `${route}: ${files.map((f) => f.name).join(', ')}`)
  dropOut.prepend(li)
  while (dropOut.children.length > 4) dropOut.lastElementChild!.remove()
}
const cover = $('drop-cover')
dropRoutes(
  window,
  [
    { name: 'image', accept: 'image/*', on: (f) => noteDrop('image', f) },
    { name: 'audio', accept: 'audio/*', on: (f) => noteDrop('audio', f) },
    { name: 'model', accept: '.glb,.vrm', on: (f) => noteDrop('model', f) },
    { name: 'document', accept: '.json,application/json', on: (f) => noteDrop('document', f) },
  ],
  {
    overlay: cover,
    onState: (s) => {
      say(
        'drop-label',
        s.rejected ? 'no tool opens this type' : s.route ? `drop to open as ${s.route}` : 'drop to route by type',
      )
    },
    onReject: (files) => {
      const li = el('li', 'hb-status is-err', `refused: ${files.map((f) => f.name).join(', ')}. no route takes this type.`)
      dropOut.prepend(li)
    },
  },
)

// undo stack over a short note list
const undo = undoStack<string[]>(80)
let notes = ['the mug goes on the shelf']
let count = 1
function drawNotes() {
  const list = $('undo-list')
  list.replaceChildren(...notes.map((n) => el('li', '', n)))
  const undoBtn = $<HTMLButtonElement>('undo-undo')
  const redoBtn = $<HTMLButtonElement>('undo-redo')
  undoBtn.disabled = !undo.canUndo
  redoBtn.disabled = !undo.canRedo
  undoBtn.textContent = `undo (${undo.sizes.undo})`
  redoBtn.textContent = `redo (${undo.sizes.redo})`
}
function addNote() {
  undo.push(notes)
  notes = [...notes, `note ${++count}`]
  drawNotes()
}
function stepBack() {
  const prev = undo.undo(notes)
  if (prev) { notes = prev; drawNotes() }
}
function stepAhead() {
  const next = undo.redo(notes)
  if (next) { notes = next; drawNotes() }
}
$('undo-add').addEventListener('click', addNote)
$('undo-undo').addEventListener('click', stepBack)
$('undo-redo').addEventListener('click', stepAhead)
drawNotes()

// hotkeys and the key map built from them
const keys = hotkeys([
  { keys: ['1', '2', '3', '4'], label: 'tab by number', group: 'view', run: (e) => tabStrip.select(Number(e.key) - 1) },
  { keys: ',', label: 'settings drawer', group: 'view', run: () => settings.open() },
  { keys: 'shift+?', label: 'about', group: 'view', run: () => about.open() },
  { keys: 'm', label: 'workspace menu', group: 'view', run: () => workspace.open() },
  { keys: 'n', label: 'add a note', group: 'edit', run: addNote },
  { keys: 'ctrl+z', label: 'undo', group: 'edit', run: stepBack },
  { keys: 'ctrl+shift+z', label: 'redo', group: 'edit', run: stepAhead },
])
keys.subscribe(() => drawKeys())
window.addEventListener('keydown', (e) => {
  if (e.defaultPrevented) say('keys-out', `took ${e.key}`)
})
function drawKeys() {
  const dl = el('dl', 'vd-keys')
  for (const g of keys.list()) {
    dl.append(el('dt', 'vd-keyhead', g.group))
    for (const item of g.items) {
      const dt = el('dt', '')
      item.keys.forEach((combo, i) => {
        if (i) dt.append(' ')
        combo.forEach((k) => dt.append(el('kbd', 'hb-kbd', k)))
      })
      dl.append(dt, el('dd', '', item.label))
    }
  }
  $('keymap').replaceChildren(dl)
}
drawKeys()

// persisted field with a version key and a migration from version 1
const name = persisted<string>('hb:vanilla:name', 'scratch', {
  version: 2,
  migrate: (old, from) => (from === 1 && typeof old === 'string' ? old.trim() : undefined),
})
const nameInput = $<HTMLInputElement>('pers-name')
nameInput.value = name.get()
nameInput.addEventListener('input', () => name.set(nameInput.value))
name.subscribe((v) => {
  if (nameInput.value !== v) nameInput.value = v
  say('pers-hint', name.error ?? 'stored as hb:vanilla:name, version 2. reload to check.')
})
$('pers-reset').addEventListener('click', () => name.reset())

// confirms
let messages = 12
let documents = 14
const status = () => say('conf-out', `${messages} messages, ${documents} documents`)
confirmInline($('clear-chat'), {
  label: 'clear 12 messages',
  onConfirm: () => {
    messages = 0
    status()
  },
})
const asker = confirmDialog({ el: $('confirm-modal') })
$('wipe').addEventListener('click', async () => {
  const ok = await asker.ask({
    title: 'wipe this project',
    message: `${documents} documents and their history go. weights stay cached.`,
    confirmLabel: 'wipe',
    cancelLabel: 'keep',
    danger: true,
  })
  if (ok) documents = 0
  status()
})

// activity
const work = activity()
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms))
function drawTasks(list: ActivityTask[]) {
  const ul = $('act-list')
  ul.replaceChildren(
    ...list.map((t) => {
      const li = el('li', 'vd-task')
      const hd = el('div', 'hb-progress-hd')
      hd.append(el('span', 'hb-progress-text', t.error ? `${t.label}: ${t.error}` : t.label))
      if (t.fraction !== null) hd.append(el('span', 'hb-progress-pct', `${Math.round(t.fraction * 100)} percent`))
      li.append(hd)
      if (!t.error) {
        const meter = el('div', 'hb-meter')
        const bar = el('i', '')
        bar.style.width = `${Math.round((t.fraction ?? 0.3) * 100)}%`
        meter.append(bar)
        li.append(meter)
      }
      const act = el('button', 'hb-btn hb-btn-2 hb-btn-sm', t.error ? 'dismiss' : 'cancel') as HTMLButtonElement
      act.type = 'button'
      act.addEventListener('click', () => (t.error ? work.end(t.key) : work.cancel(t.key)))
      li.append(act)
      li.className = 'vd-task hb-progress is-quiet'
      return li
    }),
  )
}
work.subscribe(drawTasks)
$('act-slow').addEventListener('click', () => {
  let stop = false
  let f = 0
  const tick = () => {
    if (stop) return
    f = Math.min(1, f + 0.05)
    if (f >= 1) { work.end('model'); return }
    work.set('model', 'loading the brain', f, () => { stop = true })
    setTimeout(tick, 300)
  }
  tick()
})
$('act-fast').addEventListener('click', () => {
  void work.track('cache', 'reading the cache', () => wait(80), 300)
})
$('act-fail').addEventListener('click', () => {
  void work.track('file', 'reading scene.glb', async () => {
    await wait(600)
    throw new Error('not a glb, the header says zip')
  }).catch(() => {})
})

// copy
const clip = copier()
clip.subscribe((s) => {
  $('copy-btn').textContent = s === 'copied' ? 'copied' : s === 'failed' ? 'copy failed, select it' : 'copy'
})
$('copy-btn').addEventListener('click', () => void clip.copy($('copy-src').textContent ?? ''))
