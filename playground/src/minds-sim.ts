// Fake minds for the playground: two agents, a dog and a person, driven by
// a seeded generator at 2 Hz so a page with the same ?seed= shows the same
// run. Nothing here is a model; it only feeds the minds components.

export function rng(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export interface Series { label: string; values: number[]; threshold?: number; ticks: number[] }
export interface Opt { id: string; score: number; bonus?: number; penalty?: number; prob?: number; chosen?: boolean }
export interface Ev { id: number; t: number; agent: string; kind: string; text: string; cause?: number; icon?: 'wind' | 'ear-listen' }

const HIST = 240
const TEMP = 0.06
const COMMIT = 0.12

const DOG_ACTS: Record<string, { drive: string; act: string; sense: string; icon?: 'wind' | 'ear-listen' }> = {
  fetch: { drive: 'play', act: 'picked up the ball', sense: 'saw the ball moving at 3.2 m' },
  chase: { drive: 'prey', act: 'barked twice', sense: 'saw squirrel at 6.1 m' },
  eat: { drive: 'hunger', act: 'ate from the bowl', sense: 'smelled food, left nostril 0.6', icon: 'wind' },
  sleep: { drive: 'fatigue', act: 'lay down on the porch', sense: 'the light went low' },
  sniff: { drive: 'curiosity', act: 'sniffed the fence line', sense: 'smelled a new scent by the fence', icon: 'wind' },
  greet: { drive: 'social', act: 'ran to moheeb, tail up', sense: 'heard the door at 40 degrees left', icon: 'ear-listen' },
}
const HUM_TASKS: Record<string, { need: string; text: string }> = {
  'throw the ball': { need: 'dog', text: 'threw the ball 8 m' },
  'check his phone': { need: 'screen', text: 'looked at his phone' },
  'sit on the porch': { need: 'rest', text: 'sat down on the porch' },
  'fill the bowl': { need: 'chores', text: 'filled the bowl' },
  'train a word': { need: 'fun', text: 'said "sit" and held a treat' },
}

export function createMinds(seed: number) {
  const r = rng(seed)
  const mk = (label: string, start: number, threshold?: number): Series => ({ label, values: Array.from({ length: 40 }, () => start), threshold, ticks: [] })
  const drives = [
    mk('hunger', 0.35, 0.7), mk('fatigue', 0.2, 0.7), mk('play', 0.55, 0.7),
    mk('social', 0.4, 0.7), mk('curiosity', 0.5, 0.7), mk('prey', 0.3, 0.7),
    mk('bond', 0.62),
  ]
  const needs = [mk('dog', 0.5, 0.7), mk('fun', 0.4, 0.7), mk('rest', 0.3, 0.7), mk('screen', 0.45, 0.7), mk('chores', 0.25, 0.7)]
  const drift: Record<string, number> = {}
  for (const s of [...drives, ...needs]) drift[s.label] = (r() - 0.5) * 0.01

  const state = {
    t: 62.4,
    dog: { cur: 'sniff', since: 62.4, why: 'curiosity 0.50, a new scent by the fence', options: [] as Opt[], nextLook: 3.4 },
    hum: { cur: 'sit on the porch', since: 62.4, why: 'routine for the hour, rest 0.30', src: 'routine', options: [] as Opt[], recent: [] as string[] },
    drives, needs,
    events: [] as Ev[],
  }
  let n = 0
  const emit = (e: Omit<Ev, 'id' | 't'>) => {
    const ev = { ...e, id: ++n, t: +state.t.toFixed(1) }
    state.events.unshift(ev)
    if (state.events.length > 300) state.events.pop()
    return ev.id
  }

  const val = (list: Series[], label: string) => list.find((s) => s.label === label)!.values.at(-1)!
  const push = (s: Series, v: number) => {
    s.values.push(Math.min(1, Math.max(0, v)))
    if (s.values.length > HIST) {
      s.values.shift()
      s.ticks = s.ticks.map((i) => i - 1).filter((i) => i >= 0)
    }
  }
  const mark = (list: Series[]) => { for (const s of list) s.ticks.push(s.values.length - 1) }

  function softmax(us: Record<string, number>) {
    const m = Math.max(...Object.values(us))
    const ex = Object.fromEntries(Object.entries(us).map(([k, u]) => [k, Math.exp((u - m) / TEMP)]))
    const z = Object.values(ex).reduce((a, b) => a + b, 0)
    return Object.fromEntries(Object.entries(ex).map(([k, v]) => [k, v / z]))
  }

  function dogThink() {
    const U: Record<string, number> = {}
    for (const [b, d] of Object.entries(DOG_ACTS)) U[b] = Math.max(0, val(drives, d.drive) * 0.9 + (r() - 0.5) * 0.08)
    const withBonus = { ...U, [state.dog.cur]: (U[state.dog.cur] ?? 0) + COMMIT }
    const P = softmax(withBonus)
    state.dog.options = Object.keys(U).map((id) => ({ id, score: +U[id]!.toFixed(3), bonus: id === state.dog.cur ? COMMIT : 0, prob: P[id], chosen: id === state.dog.cur }))
    state.dog.nextLook -= 0.5
    if (state.dog.nextLook > 0) return
    state.dog.nextLook = 2 + r() * 3
    // sample from the probabilities
    let x = r(); let pick = state.dog.cur
    for (const [k, p] of Object.entries(P)) { x -= p; if (x <= 0) { pick = k; break } }
    if (pick === state.dog.cur) return
    const a = DOG_ACTS[pick]!
    const top = Object.entries(withBonus).sort((p, q) => q[1] - p[1])[0]![0]
    const sense = emit({ agent: 'dog', kind: 'sense', text: a.sense, icon: a.icon })
    const ms = Math.round(150 + r() * 250)
    state.dog.why = pick === top
      ? `${a.drive} drive ${val(drives, a.drive).toFixed(2)}, ${a.sense.replace(/ at .*$/, '')}`
      : `took the second best option this time. ${a.drive} ${val(drives, a.drive).toFixed(2)}`
    const choice = emit({ agent: 'dog', kind: 'choice', text: `${pick}, ${a.drive} drive ${val(drives, a.drive).toFixed(2)}, react in ${ms} ms`, cause: sense })
    emit({ agent: 'dog', kind: 'act', text: a.act, cause: choice })
    state.dog.cur = pick
    state.dog.since = state.t
    mark(drives)
    // the person sometimes answers what the dog did
    if (pick === 'fetch' || pick === 'greet') {
      const saw = emit({ agent: 'moheeb', kind: 'sense', text: `saw the dog ${pick === 'fetch' ? 'bring the ball' : 'run over'}`, cause: choice })
      humSet('throw the ball', 'rule', 'the dog dropped the ball at his feet', saw)
    }
  }

  function humSet(task: string, src: string, why: string, cause?: number) {
    if (task === state.hum.cur) return
    const c = emit({ agent: 'moheeb', kind: 'choice', text: `${task}, ${src}: ${why}`, cause })
    emit({ agent: 'moheeb', kind: 'act', text: HUM_TASKS[task]!.text, cause: c })
    if (task === 'train a word') {
      const cue = emit({ agent: 'dog', kind: 'cue', text: 'heard "sit"', cause: c })
      emit({ agent: 'dog', kind: 'reward', text: `"sit": did sit, praised 0.6 s later, +${(0.04 + r() * 0.06).toFixed(2)}`, cause: cue })
    }
    state.hum.recent = [task, ...state.hum.recent].slice(0, 3)
    state.hum.cur = task
    state.hum.since = state.t
    state.hum.src = src
    state.hum.why = why
    mark(needs)
  }

  function humThink() {
    const U: Record<string, number> = {}
    const pen: Record<string, number> = {}
    for (const [k, d] of Object.entries(HUM_TASKS)) {
      const reps = state.hum.recent.filter((x) => x === k).length
      const base = val(needs, d.need) * 0.8 + 0.1 + (r() - 0.5) * 0.05
      pen[k] = base * (1 - Math.pow(0.55, reps))
      U[k] = Math.max(0, base - pen[k]!)
    }
    const top3 = Object.entries(U).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([k]) => k)
    state.hum.options = Object.keys(U).map((id) => ({ id, score: +U[id]!.toFixed(3), penalty: pen[id] ? +pen[id]!.toFixed(3) : 0, chosen: id === state.hum.cur }))
    if (r() < 0.06) {
      const pick = top3[Math.floor(r() * 3)]!
      humSet(pick, 'routine', `${HUM_TASKS[pick]!.need} ${val(needs, HUM_TASKS[pick]!.need).toFixed(2)}, one of the top three for the hour`)
    }
  }

  function step() {
    state.t += 0.5
    for (const s of [...drives, ...needs]) {
      const last = s.values.at(-1)!
      if (r() < 0.02) drift[s.label] = (r() - 0.5) * 0.02
      // the active behaviour drains its drive
      const drain = DOG_ACTS[state.dog.cur]?.drive === s.label || HUM_TASKS[state.hum.cur]?.need === s.label ? -0.012 : 0
      push(s, last + (0.45 - last) * 0.012 + drift[s.label]! + drain + (r() - 0.5) * 0.015)
    }
    dogThink()
    humThink()
  }

  for (let i = 0; i < 80; i++) step()
  return { state, step }
}

export type Minds = ReturnType<typeof createMinds>
