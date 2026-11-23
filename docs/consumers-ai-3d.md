# AI and 3D consumers

Four repositories put UI in front of models and scenes: the example pages
of hackbuild-motion, hackbuild-browser-ai and hackbuild-agents, the
`@hackbuild/ai-elements` web components in hackbuild-browser-ai, and the
dog-simulator view. This file maps every element they draw to a class or a
component here, and lists what was missing before 0.4.0. GUIDELINES.md
section 10 holds the rules for the pieces 0.4.0 added.

Status words: **had** means the class existed before 0.4.0; **added**
means 0.4.0 added it; **page** means it stays layout glue in the consumer.

## How each consumer loads the system

| Consumer | Stack | Load |
|---|---|---|
| example pages, all three repos | vanilla TS bundled by rolldown, one HTML shell per page written by `tools/build-examples.mjs`, shared `examples/shared/ui.css` and `ui.ts` (identical in the three repos) | copy `dist/styles` next to the site; link `fonts-inline.css` (or `fonts-local.css` when served) then `hackbuild.css`; `body class="hb hb-halftone"`; replace `ui.css` |
| ai-elements | custom elements with shadow DOM, styles in a `TOKENS` string | page classes do not reach into a shadow root. Either adopt `hackbuild.css` into each root (`adoptedStyleSheets` or a `<link>` inside the root) and render the class markup below, or render into light DOM |
| dog-simulator | one HTML file baked by `tools/build-app.mjs` with fonts inlined from `@fontsource` | inline `fonts-inline.css` and `hackbuild.css` in place of its own token block; its variables (`--paper`, `--ink`, `--pink` and the rest) map one to one onto `--hb-*` |

Every consumer vendors the tarball pinned by commit, the way hackbuild-fab
does: `tools/vendor/hackbuild-ui-<version>-<commit>.tgz` with a line in
`tools/vendor/SHA256SUMS`, and `"@virgilvox/hackbuild-ui":
"file:../../tools/vendor/<tgz>"` in the package that uses it.

## Example pages (hackbuild-motion, hackbuild-browser-ai, hackbuild-agents)

| Element | Seen on | Maps to | Status |
|---|---|---|---|
| page header: repo link, page name, one line of what it shows | every page | `.hb-header` with the page name as the title, the line as a tool tagline | had |
| index list of pages with a line each | index | `.hb-list` of `a.hb-row`, or `.hb-media-card` grid | had |
| footer line: licence, source, no weights hosted | every page | `.hb-footer-bottom` stamp line, or a Special Elite `p` | had |
| stage: 16 by 9, canvas fills it | most pages | `.hb-viewport` | added |
| three.js scene background | shared `scene.ts`, `three.ts` | stays the scene's job; keep it light (section 6). The dark branch keyed to `prefers-color-scheme` goes | page |
| controls row of labels, inputs and buttons | every page | `.hb-bar` with `.hb-ctl`; `.hb-ctl.is-wide` for URL fields that used `flex:1 1 100%` | added |
| range with its value span | gait, senses | `.hb-ctl` with `.hb-range` and `.hb-readout` | added |
| select, number, url, text, password, checkbox | every page | `.hb-select`, `.hb-input`, `.hb-check` | had |
| buttons; a disabled one with a title saying why | every page; transcribe microphone | `.hb-btn`, `.hb-btn-2`, `[disabled]` | had |
| status line with `data-kind` ok, bad, warn, info | `ui.ts status()` | `.hb-status.is-ok`, `.is-err`, `.is-warn`, `.is-info`, `.is-busy` while loading | added |
| readout grid of `label: value` | `ui.ts readout()` | `.hb-readouts` of `.hb-kv` | added |
| frame timer figures: fps p50, frame ms p95, work ms | `FrameTimer` | `.hb-readouts`, and `.hb-hudstat` on the viewport | added |
| drop zone with a file input, `.over` while hovering | avatar, retarget, motion-net, lipsync, transcribe, depth-mesh | `.hb-dropzone`, `.is-over` | added |
| weight loader: URL, drop, load button with size and licence, progress in the status line, SHA-256 check, licence notice | motion-net, imagegen, embed, vision, speak | `.hb-loader` with `.hb-progress`, `.hb-hash`, `.hb-licence` | added |
| SHA-256 mismatch error | `ui.ts loadWeight()` | `.hb-callout.is-err` in the loader, verdict `does not match` | added |
| webgpu probe and its reason | `ui.ts gpuInfo()`, chat, imagegen, devices | `.hb-perm` (missing with the reason), or the viewport cover | added |
| microphone on, refused, absent | lipsync | `.hb-perm` | added |
| chat output streaming into a `pre` | chat | `.hb-chat` | added |
| api key field and its masked echo | chat | `.hb-chat-key` | added |
| timed transcript lines `start to end text` | transcribe | `.hb-transcript` of `.hb-tseg` | added |
| why-log of choices, newest last | drives | `.hb-console` (newest first) | had |
| sense canvases in a grid with captions, pixelated | senses | `.hb-feeds` of `.hb-feed.is-pixel` | added |
| side canvas inset in the stage corner | vision | `.hb-inset` in `.hb-ov-br` | added |
| mouth and level canvas | lipsync | `.hb-wave` with the page drawing | added |
| browser check results (`window.__hb.checks`: pass, fail, not run with a reason) | every page under `?auto` | `.hb-checks` table with `.hb-verdict` | added |
| theme select: system, light, dark | ai-elements page | dropped; GUIDELINES defines no dark palette | page |
| page layout widths | `ui.css` | `.hb-shell` and the page's own grid | page |

## ai-elements (hackbuild-browser-ai)

| Element | Maps to | Status |
|---|---|---|
| model picker list, `use` and `in use` buttons, size with source word, devices, first rung, licence, disabled with the reason | `.hb-models` of `.hb-model`, HbModelList (takes `modelRows()` output as is) | added |
| download bar: words, cancel and resume, determinate and indeterminate track, failed state, stops under reduced motion | `.hb-progress`, HbProgress (same words as `progressText()`) | added |
| status pills: loading, ready, busy, failed, patch missed, idle | `.hb-pill`: busy and loading `.is-busy`, ready `.is-ok`, failed `.is-err`, patch missed `.is-warn`, idle plain | `.is-busy` added |
| chat panel: log, think block, stop, notes, key field, Enter sends | `.hb-chat`, HbChat (lines match `ChatLine`) | added |
| memory inspector table with the rows handed to the model marked | `.hb-table` with `tr.is-mark` | added |
| inline SVG icons: stop, send, dot | `HbIcon` `stop`, `paper-plane`; the pill dot is CSS | `paper-plane` added |
| theme tokens `--hb-bg`, `--hb-fg`, `--hb-accent`, `--hb-radius` and the rest | replaced by the `--hb-*` tokens here. The element tokens `--hb-ok`, `--hb-warn` share names with this system's tokens with other values; the element sets them on `:host`, so they shadow ours inside the element. Rename them or drop them when the elements adopt this sheet | page |

## dog-simulator view

| Element | Maps to | Status |
|---|---|---|
| header: marker name with a pink dot, Special Elite tagline | `.hb-header`, `.hb-tagline.is-tool` | had |
| header chips: gpu, physics, eye net, clock, fps | gpu as the one `.hb-pill`; clock and fps belong in `.hb-statusbar` (the header holds identity and state); lit tags for physics and net | had |
| 3D yard with the canvas filling it, light scene | `.hb-viewport.is-fill` | added |
| loading screen over the stage: title and note | `.hb-vp-cover` | added |
| eye card inset with a head, mode buttons and the canvas | `.hb-inset` with `.hb-cams` buttons in the head | added |
| hint box top right | `.hb-hudnote` | added |
| speech bubbles for the dog and the human, the human's pink bordered | `.hb-bubble`, `.hb-bubble.is-ink` for the second speaker; the pink border goes | added |
| toast inside the stage | `.hb-toast` | had |
| drop a photo on the stage | `.hb-dropzone.is-cover` | added |
| scene verbs along the stage foot, throw ball pink | `.hb-ov-b` with one ink `.hb-btn`, the rest `.hb-btn-2` | added |
| side tabs: brain, body, sense, train, human, tune, how | `.hb-tabs` | had |
| blocks with a VT323 ink head and a value at its right | `.hb-panel` with `.hb-panel-hd-inst` and `.hb-hd-aux` | `.hb-hd-aux` added |
| behaviour name in marker and its note | `h3` and a Special Elite `p` | had |
| bar rows: label, bar, value, current row pink | `.hb-gauges` of `.hb-gauge`, `.is-cur` | added |
| kv grids of VT323 values | `.hb-kv` or `.hb-readouts` | had, grid added |
| toggles with checkboxes | `.hb-check`, or `.hb-switch` | had |
| buttons, pink primary, ink on state | `.hb-btn`; the pink fill goes, the on state is `.hb-chip.is-toggle.is-on` | had |
| instrument canvases on paper: gait rings, footfalls, affect, hypnogram | `.hb-scope` inside a small `.hb-stage`, or the canvas on paper with a 2 px ink border; draw with the token colors | page |
| download bar for the cortex model | `.hb-progress` | added |
| heard line and the cortex reply | `.hb-heard` | added |
| percept and detection lists | `.hb-list` of `.hb-row` | had |
| association heat table | `.hb-heat` | added |
| webcam preview, mirrored | `.hb-feed.is-mirror` | added |
| microphone and camera permission | `.hb-perm` | added |
| tune pane of sliders per layer | `.hb-prow` (HbParamRow) in `.hb-fold` groups | had |
| how pane prose and licences | Special Elite `p`, `.hb-licence` for the weight terms | `.hb-licence` added |

## Missing before 0.4.0

The viewport and its hud, cover, inset, bubble and bottom band; the drop
zone; progress with an indeterminate state; the hash line, licence line
and verdict tags; the model loader and the model list; permission and
capability states; chat and composer; timed transcript and heard line;
the audio strip; check tables; readout grids; gauge rows; the inline
toolbar control; the status line; feeds; the heat table; a busy pill
that keeps the pink free; a value slot on the instrument head; table row
marks; microphone, camera, paper plane and shield icons; and self-hosted
fonts for pages that open from `file://`.

## Left to the consumers

- Pages that offered a dark theme lose it: GUIDELINES.md defines no dark
  palette. Three.js scenes keep their own lit backgrounds.
- The ai-elements shadow roots need the sheet adopted, and their
  `--hb-ok` and `--hb-warn` names need to stop shadowing ours.
- Header chips that carry rates (fps, clock) move to the status strip.
- One pink per view: the dog-simulator pink buttons, pink bar rows other
  than the current one, and the pink bubble border go to ink.
