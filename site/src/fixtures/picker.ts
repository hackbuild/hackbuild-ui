// Display ready rows for the model picker demos. Fixture: the names, sizes
// and verdicts are made up and name no real model; nothing loads.
import type { ModelRow } from '@hackbuild/ui'

const detail = (licence: string, source: string, size: string) => [
  { label: 'licence', value: licence },
  { label: 'source', value: source },
  { label: 'size', value: size },
]

export const chatRows: ModelRow[] = [
  { id: 'tiny', name: 'fixture tiny', group: 'here', size: '320 mb', bytes: 320e6, memory: 'needs 0.6 gb', backend: 'gpu', speed: 'fast', verdict: 'fast, dim', state: 'stored', detail: detail('fixture licence a', 'fixture/tiny', '320 mb, measured by a head request') },
  { id: 'steady', name: 'fixture steady 3b', group: 'start', size: '1.7 gb', bytes: 1.7e9, memory: 'needs 2.3 gb', backend: 'gpu', speed: 'medium', verdict: 'best all round', detail: detail('fixture licence b', 'fixture/steady', '1.7 gb, measured by a head request'),
    options: [
      { key: 'backend', label: 'backend', value: 'auto', choices: [{ value: 'auto', label: 'auto' }, { value: 'webgpu', label: 'webgpu' }, { value: 'wasm', label: 'wasm' }] },
      { key: 'ctx', label: 'context', value: '4096', choices: [{ value: '2048', label: '2048' }, { value: '4096', label: '4096' }, { value: '8192', label: '8192' }] },
    ] },
  { id: 'neat', name: 'fixture neat 1.5b', group: 'small', size: '830 mb', bytes: 830e6, memory: 'needs 1.6 gb', backend: 'gpu', speed: 'fast', verdict: 'likes json' },
  { id: 'cpu', name: 'fixture cpu 0.5b', group: 'small', size: '400 mb', bytes: 400e6, backend: 'cpu', speed: 'slow', verdict: 'runs anywhere' },
  { id: 'sharp', name: 'fixture sharp 8b', group: 'better', size: '4.3 gb', bytes: 4.3e9, memory: 'needs 6 gb', backend: 'gpu', speed: 'slow', verdict: 'sharp, heavy', unfit: 'needs 6 gb of gpu memory, this machine has about 2' },
  { id: 'loose', name: 'fixture loose 3b', group: 'uncensored', size: '1.9 gb', bytes: 1.9e9, memory: 'needs 2.4 gb', backend: 'gpu', speed: 'medium', verdict: 'few refusals', uncensored: true, noncommercial: true },
  { id: 'think', name: 'fixture think 1.5b', group: 'reasoning', size: '1.1 gb', bytes: 1.1e9, backend: 'gpu', speed: 'medium', verdict: 'thinks first' },
  { id: 'script', name: 'scripted replies', group: 'none', backend: 'browser', speed: 'fast', verdict: 'no model, canned' },
]

export const speechRows: ModelRow[] = [
  { id: 'ears-s', name: 'fixture ears small', group: 'start', size: '150 mb', bytes: 150e6, backend: 'gpu', speed: 'fast', verdict: 'good for notes',
    options: [{ key: 'lang', label: 'language', value: 'auto', choices: [{ value: 'auto', label: 'detect' }, { value: 'en', label: 'english' }, { value: 'de', label: 'german' }] }] },
  { id: 'ears-m', name: 'fixture ears medium', group: 'better', size: '480 mb', bytes: 480e6, backend: 'gpu', speed: 'medium', verdict: 'fewer misses' },
  { id: 'ears-b', name: 'browser speech', group: 'none', backend: 'browser', speed: 'fast', verdict: 'live, rough' },
]

export const imageRows: ModelRow[] = [
  { id: 'paint-t', name: 'fixture paint turbo', group: 'start', size: '1.2 gb', bytes: 1.2e9, memory: 'needs 2 gb', backend: 'gpu', speed: 'fast', verdict: 'one step sketches' },
  { id: 'paint-x', name: 'fixture paint large', group: 'better', size: '3.5 gb', bytes: 3.5e9, memory: 'needs 5 gb', backend: 'gpu', speed: 'slow', verdict: 'finer, slower', unfit: 'needs 5 gb of gpu memory, this machine has about 2' },
]

export const maskRows: ModelRow[] = [
  { id: 'cut-s', name: 'fixture cutter slim', group: 'start', size: '50 mb', bytes: 50e6, backend: 'gpu', speed: 'fast', verdict: 'click to cut' },
  { id: 'cut-a', name: 'fixture cutter all', group: 'small', size: '90 mb', bytes: 90e6, backend: 'cpu', speed: 'medium', verdict: 'cuts everything' },
]
