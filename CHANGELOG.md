# Changelog

## 0.3.0 (unreleased)

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
