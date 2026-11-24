# Changelog

## 0.9.1

- `.hb-toolpage.is-split.is-stage`: stage wide on the left, a side column
  of 340 to 520 px on the right holding chat, from 1024 px (FERRULE).
  Under 1024 px the stage comes first and the side column follows.
- `--hb-stage-h-sm` (default `38dvh`): the stage height of an
  `.is-stage` tool page under 1024 px. A viewport with `aspect="fill"`
  ignores it.
- HbViewport with a `pad` slot puts its top corners in one grid,
  `.hb-ov-top`; on a touch phone held sideways the telemetry group moves
  under the top right content, clear of the stick.
- HbSendTo: a dropdown of target tools with icons and disabled reasons.
- Demo `#/demos/stage-chat`.

## 0.9.0

- The refined look is the default for app chrome and tool panels:
  `--hb-border` is 1.5px, `--hb-border-em` 2px for the primary button,
  modal, stage and viewport, shadows 2, 3, 4 and 6 px. Marketing blocks,
  `.hb-prose` and `.hb-zine` keep the 2 px zine values.
- VT323 readout sizes `--hb-readout-sm`, `-md`, `-lg`; pills, slot
  states, log tags and memory kind chips set in VT323.
- One four state vocabulary, `--hb-state-off`, `-load`, `-ok`, `-err`,
  lit on ink: every load indicator blinks amber in two steps, a hollow
  square under reduced motion. `.hb-led`. HbPill `off` and `load`,
  HbStatusBar cell `state`, event log `load` kind amber.
- Readability: `--hb-ok-ink` and `--hb-warn-ink` for signal text on paper
  (5.07:1 and 5.28:1, computed); muted lines that used ink 4 use ink 3;
  an off pill dims by colour, not opacity.
- Stages: `.hb-stage-lit` (HbStage and HbViewport `look="lit"`),
  `.hb-stage-void` (HbViewport `look="graph"`), `.hb-stage-tag`,
  `.hb-viewport-host` for a 3D canvas.
- `.hb-dotgrid` paper; the app shell carries it and drops the grain.
- `.hb-instrument`: opt in rack density with 44 px touch targets kept.
- HbMessage `boxed`: reply boxes with a hard shadow.
- `.hb-toolpage.is-split` puts the stage first under 1024 px;
  `.is-source-order` keeps the markup order.
- `.hb-fixture` banner on every demo and component page; demos no longer
  show a real model name in a fake loading state.
- `.hb-stroke` for inline stroke icons. Docs page `#/look`.

## 0.8.1

- Phone layout for stage plus rack, a fixture demo at `#/demos/phone-rack`.
- HbAppShell `fit`: the shell is the dynamic viewport at every width and
  a viewport with aspect `fill` takes the height left over the foot.
- HbAppShell writes `--hb-kb` (on-screen keyboard inset from
  visualViewport) and `--hb-foot-h` on the root: the foot lifts over the
  keyboard, a pinned shell shrinks by it. Vanilla `keyboardInset`,
  `dockInsets`.
- HbAppShell rack sheet: HbDrawer side auto at 641 px; with a dock the
  sheet stops at the foot, the foot stays above the scrim, and the stage
  keeps one caption line at its top edge while the sheet is open.
- HbChat `log` and `composer` props, so the composer docks alone while
  the lines show in a rack tab.
- The work area pads past the side safe area insets in landscape.
- Sizes use decimal lowercase units everywhere, as `sizeWord`: `mbText`,
  HbMethodCard, HbProgress, HbModelManager, load and storage lines divide
  by 1000 and 1e6, not 1024 (a 2.6 gb download no longer reads 2.5 GB).
- Disabled ghost buttons: paper edge fill, ink 3 text, dashed border.

## 0.8.0

- HbPersonaEditor, HbStepCard, HbPromptInspector, HbContextMenu.
  Vanilla `persona` (`PERSONA_TEMPLATE`, `parsePersona`, `personaJson`,
  `tokenEstimate`), `trace` (`stepLabel`, `clipText`, `costRows`),
  `ctxmenu` (`contextTrigger`, `ctxPanel`, `clampMenu`, `isMenuKey`).
- HbContextMenu opens by right click, long press on touch, the menu key
  or Shift+F10; 44 px rows on a coarse pointer.
- HbImageSlot `ratio` (`1/1`, `4/3`, `16/9`, `w/h`, `auto`).
- HbArtboard and HbPromptCanvas ship type declarations.
- HbAppShell with no rail: the main column fills the width from 901 px.

## 0.7.1

- HbStageCaption, HbNameHud, HbTransport, HbPad. Vanilla `stage`, `pad`,
  `transport` (`transportKeys`, `idleChrome`).
- HbViewport and HbStageOverlay: `telemetry`, `hint`, `caption` and
  `pad` slots; HbStageOverlay gains the `b` band.
- HbMemoryPanel passes `pinned` to each row and emits `pin(id, next)`.
- HbHistoryStrip: `thumb` takes svg markup or a short label, `thumb`
  slot; vanilla `thumbKind`, `thumbSrc`.
- HbMethodCard: the size and time line wraps under 380 px.

## 0.7.0

- HbArtboard: a board that pans and zooms by mouse, wheel, pinch and
  keys, fits to view, shows an image or slot content, places layers by
  centre, scale and rotation, and paints an erase and restore mask in
  layer pixels; overlay slot and truth label. Vanilla `artboard`.
- HbPromptCanvas `bare`: no tool row, well or help, for use on a board.
- GUIDELINES section 18 lists every part added from 0.6.0 to 0.7.0.

The 0.6 line in short: the vanilla entry and composables; the suite
shell, keys and choices, logs and export, settings; models, chat, memory
and voice; transcription; speech and image; masks and views.

## 0.6.8

- HbPromptCanvas, HbInstanceList, HbRange2, HbMonitorDock, HbSplit;
  vanilla `vision`: image space prompt mapping, hover throttle, instance
  colours, dual range clamp, split keys.

## 0.6.7

- HbSpokenText, HbMethodCard, HbImageSlot, HbCameraTile, HbHistoryStrip,
  HbSeed; vanilla `media`: spoken word timing, method figures, camera
  faults, run history, seeds.
- HbMemoryItem: `pinned` and a pin action (`pin`). HbMessage: `remember`
  action and `remembered`, forwarded by HbChat. HbSelect: `label`.
- `.hb-hint`: a muted line anywhere. `.hb-toolpage` parts hold their
  height, so a `.hb-bar` no longer shrinks into the next part.

## 0.6.6

- `.hb-toolpage.is-split`: side column beside the main part from 1024 px;
  `.is-side`, `.is-full`.
- `sizeWord()`: kb under 1 MB; the queue strip no longer reads "0 mb".

## 0.6.5

- `.hb-toolpage`: stacks the parts of one tool with one gap; `.is-grow`
  fills the rest.

## 0.6.4

- HbDrawer: `size` sm, md, lg sets the side drawer to 340, 440 or 560 px
  from `--hb-drawer-*` tokens; `drawer(el, {size})` in vanilla.
- HbConversationList: row actions lift on focus within the row; F2
  renames, Delete arms delete. `listRowKey()` in the vanilla entry.
- HbModelRack: a pick with no catalogue record shows as a row that names
  it, with remove; emits `remove(slot)`. HbModelSlot takes `missing`.
  `slotMissing()` in the vanilla entry.

## 0.6.3

- toastStore: calls setTimeout and clearTimeout unbound; Chrome threw
  illegal invocation on the first toast.
- HbConversationList: `noun` and `nouns` set every label, items take
  `kind` and an optional `count`, and `creatable`, `duplicable`,
  `importable` hide their buttons. `listMeta()` in the vanilla entry.
- `.hb-row` is 44 px tall on a coarse pointer.
- `.hb-acts` and HbActions: a button row that wraps, `is-end`, `is-fill`.

## 0.6.2

- HbHeader: the title keeps its words whole and ends in an ellipsis past
  the row.
- An empty toolbar takes no room; HbSuiteNav's toolbar row collapses on a
  phone unless its `toolbar` slot fills it.
- HbStatusBar: `cells` with `priority` (2 from 481 px, 3 from 761 px of
  strip width, or `data-priority` on slotted cells), and `action` with
  `@press`, the strip as one button, 44 px on a coarse pointer.
- HbDrawer and `drawer()`: `side="auto"` with `breakpoint` (761), the sheet
  below and the right drawer above, live.

## 0.6.1

- Transcription: HbLevelRail (speech kept and cut, floor and gate in dB,
  segments, seek in seconds), HbQueueStrip (one strip per file with
  status, wave, measured line, remove).
- HbTranscript: dropped lines with their reason, speaker, edit in place,
  search, follow, time format, 44 px rows. Segment fields match the
  transcribe package.
- Vanilla: `railBars`, `transcriptRows`, `stripStatus`, `stripMeta` and
  their helpers.

## 0.6.0

- The vanilla entry (`@virgilvox/hackbuild-ui/vanilla`) with tests, seven
  composables over it, and six parts moved onto it, plus the sheet.
- Suite shell: shell modes, the dock and three shell recipes; HbSuiteNav,
  HbWorkspaceMenu, HbPills, HbActivity, HbPalette, HbKeyMap, HbToolRail,
  HbChipGroup, HbToggleRow.
- Data and settings: HbEventLog, HbCodeBlock, HbHow, HbExportPanel,
  HbSettingsForm, HbPresetChips, 44 px param rows.
- Models: HbModelList, load phases and reasons, HbModelManager,
  HbModelRack, HbModelSlot, HbEngineBar, HbWakeGate, HbTierCards,
  HbApiKey, HbCustomModelForm.
- Chat: message anatomy, HbThink, HbToolCall, HbContextMeter,
  HbConversationList.
- Memory and voice: HbMemoryPanel, HbMemoryItem, HbRecallTrace,
  HbMicButton.
- Collapse, rail base, ttl and copy marks; HbInset, HbWave, HbBubble,
  HbWelcome, HbHash.
- HbModal `size` (sm, md, lg) as classes over tokens `--hb-modal-sm`,
  `--hb-modal-md`, `--hb-modal-lg`; `width` maps to the nearest size.
- HbChip rebinds its hotkey when `hotkey` changes.
- `.hb-mat-name` wraps instead of pushing the row sideways at 320 px.
- Every component has a docs site demo. `tools/pin-ui` pins consumers.

## 0.5.0

- The minds and capabilities layer, GUIDELINES.md 1.5 section 11, with
  its classes in section 20 of `hackbuild.css`: drive sparkline rows with
  a threshold rule, switch ticks, a state chip and a larger chart; choice
  bars with hatched commitment, a struck repeat penalty, chance and the
  chosen row; the cause timeline with chains, agent and kind filters,
  pins and agent groups; the capability panel with off, loading, on,
  failed and unavailable rows, needs, size, licence, reason and one
  button.
- Vue components over those classes: HbSparkRows, HbChoiceBars,
  HbCausalLog and HbCapabilities, and `useLiveAnnounce`, a polite live
  region that speaks at most once per gap.
- Hover styles apply only with `(hover:hover) and (pointer:fine)`: a
  tapped button no longer stays pink on a touch screen. `:active` and
  `:focus-visible` are unchanged.
- HbTabs takes arrow keys, Home and End with one tab in the tab order,
  and `label` and `idPrefix` for `aria-controls`.
- `.hb-seg.is-toggle` and HbSeg `toggle`: ink when on. Segment buttons
  and fold summaries are 44 px on phones and touch screens.
- HbProgress `live` turns its words out of the live region.
- Tokens `--hb-spark-h`, `--hb-spark-big-h`, `--hb-log-h`. Icons `paw`,
  `brain`, `code-branch`, `thumbtack`, `wind`.
- `playground/ai.html` gains minds and turn on tabs driven by a seeded
  generator (`?seed=`); `playground/minds-static.html` is the layer as
  plain classes.

## 0.4.4

- `.hb-check` rows are 44 px tall with a 20 px box on phones and touch
  screens, and the `.hb-dropzone` file picker button is 44 px tall; both
  compact at 641 px and up with a fine pointer.

## 0.4.3

- `.hb-ctl` shrinks to its row: a select with a long option no longer
  pushes a phone page sideways.
- The `.hb-header` title is 20 px on phones and wraps beside the mark;
  24 px from 641 px as before.

## 0.4.2

- `.hb-input` and `.hb-select` are 44 px tall on phones and touch
  screens; 0.4.1 left them at 41 and 43 px. They compact at 641 px and up
  with a fine pointer, like the buttons.

## 0.4.1

- Mobile first. Every `max-width` media and container query in
  `hackbuild.css` is now a base state for a 360 px phone with the wider
  layout added at `min-width` (641, 761, 801, 821 and 901 px, and 561 px
  for viewport container queries). Layouts at each width are unchanged.
- Touch: `.hb-btn`, `.hb-chip`, `.hb-tab` and `.hb-cams` buttons are
  44 px tall on phones and touch screens and compact only at 641 px and
  up with a fine pointer. Icon buttons, the param row reset and ranges
  follow the same rule.
- Fields are 16 px on phones and touch screens, so iOS does not zoom the
  page on focus.
- Header, nav, toolbar, status strip and `.hb-shell` respect the safe
  area insets.
- GUIDELINES.md 4c gains a mobile first table and section 8 a checklist
  line.

## 0.4.0

- The ai and 3d layer, GUIDELINES.md 1.4 section 10, with its classes in
  section 19 of `hackbuild.css`: viewport with hud slots, bottom band,
  cover, inset and speech bubble; hud stats and notes; drop zone;
  progress with indeterminate, paused, done and failed states; verdict
  tags, hash line and licence line; model loader and model list;
  permission and capability states; chat and composer; timed transcript
  and heard line; audio strip; check table; readout grid; gauge rows;
  status line; inline toolbar control; feeds; heat table; table row marks.
- Vue components over those classes: HbViewport, HbHudStat, HbInset,
  HbBubble, HbDropzone, HbProgress, HbHash, HbLicence, HbVerdict,
  HbLoader, HbModelList, HbPermission, HbChat, HbTranscript, HbWave,
  HbChecks, HbStatusLine, HbReadouts and HbGauges. HbPill `busy`.
- Self-hosted fonts: the five faces as woff2 (latin subset, Fontsource
  5.3.0) with their licence texts, `fonts-local.css`, and
  `fonts-inline.css` for pages opened from `file://`. Exports
  `./fonts-local.css`, `./fonts-inline.css` and `./fonts/*`.
- Tokens `--hb-inset-w`, `--hb-wave-h`, `--hb-chat-h`.
- Icons `microphone`, `microphone-slash`, `camera`, `video-slash`,
  `file-arrow-up`, `paper-plane`, `shield-halved`, `fingerprint`.
- An instrument head on an `h2` or `h3` keeps VT323 and its full-bleed
  margins; `.hb-hd-aux` puts a quieter value at its right end.
- `docs/consumers-ai-3d.md`, the element map for the ai and 3d consumers.
- `playground/ai.html` drives the layer; `playground/ai-static.html` is
  the same layer as plain classes, opened from disk after a build.

## 0.3.0

- The bench layer, GUIDELINES.md 1.3 section 9: HbSteps, HbGuide,
  HbStageOverlay, HbMaterials, HbParamRow and HbWelcome, with their
  classes in section 14 of `hackbuild.css`.
- Tokens: on-ink lines (`--hb-ink-line`, `--hb-ink-inset`,
  `--hb-ink-border`), `--hb-lit-label`, the stage part palette
  (`--hb-part-a` to `--hb-part-f`), board render colours (`--hb-gold`,
  `--hb-mask`, `--hb-silk`), and the rail and tray widths.
- Ink text on every pink fill. Toggle chips fill with ink when on
  (`HbChip` `toggle`, `.hb-chip.is-toggle.is-on`). Lit status tags
  (`HbTag` `lit-ok`, `lit-warn`, `lit-err`). `HbHeader` `suffix` and
  `taglineKind`. `HbSlider` `disabled`.
- 44 px touch targets: icon buttons under 640 px and on touch screens,
  guide verbs under 640 px, ranges under 820 px and on touch screens.
- Icons `undo`, `redo` and `folder-open` for the bench verbs.
- `playground/bench.html`, the bench layer driven end to end.
- LICENSE file and the package.json author.
- `.githooks/commit-msg` and `npm test` for the house rules on commit
  messages and package metadata.

## 0.2.0

- 44 solid and 4 brand icons for hardware, radio and bench instruments,
  among them `wifi`, `satellite-dish`, `sd-card`, `floppy-disk`,
  `bluetooth`, `usb` and `raspberry-pi`. 124 solid and 14 brand in all
  (counted from the published tarball).

## 0.1.0

- First publish as `@virgilvox/hackbuild-ui`: tokens, the class layer,
  Vue 3 components, the Tailwind v4 bridge, brand assets, and 80 solid
  and 10 brand icons (counted from the published tarball).
