# Changelog

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
