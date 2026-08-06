# Components

Every component binds behavior to classes in `hackbuild.css` and ships no
styles of its own. Anything a component renders you can also build with the
raw classes; the class name is listed with each component.

All two way state uses `v-model`. All props are optional unless marked
required. Sizes and variants are unions, not free strings.

Import everything from the package root:

```ts
import { HbButton, HbPanel, useToast } from '@hackbuild/ui'
```

## Brand

### HbMark

The canonical two-path mark. `class: none, inline svg`

| Prop | Type | Default | Notes |
|---|---|---|---|
| `size` | `number \| string` | `28` | 16 px floor on screen |
| `reversed` | `boolean` | `false` | arc in paper, for ink backgrounds |
| `label` | `string` | `hack.build mark` | accessible name |

The paths are exported from the package as `ARC_D`, `WRENCH_D`,
`MARK_VIEWBOX` and friends if you need to place them in your own SVG.
Never redraw or trace the mark.

### HbWordmark

`hack` in ink, dot and `build` both pink. `class: hb-wordmark`

| Prop | Type | Default |
|---|---|---|
| `size` | `number \| string` | `18` |

## Chrome

### HbHeader

Ink bar with the pink bottom rule. Identity and state only, no verbs.
`class: hb-header`

| Prop | Type | Default | Notes |
|---|---|---|---|
| `title` | `string` | | the tool name, not hack.build |
| `accent` | `string` | `''` | trailing part rendered pink |
| `tagline` | `string` | `''` | dropped below 900 px |
| `mark` | `boolean` | `true` | hide when slotting a custom logo |

Slots: `logo`, default (status pill, mode switch), and the tagline renders
last. Push content right with `<span class="hb-spacer" style="margin-left:auto" />`.

### HbTabs

Destinations under the header. `class: hb-tabs, hb-tab`

| Prop | Type | Notes |
|---|---|---|
| `tabs` (required) | `Array<{label, value} \| string>` | three to eight |
| `v-model` | `string \| number` | active tab value |

The strip scrolls sideways on narrow screens rather than wrapping.

### HbToolbar

Verbs and global settings. `class: hb-bar`

| Prop | Type | Default |
|---|---|---|
| `ink` | `boolean` | `false` |

### HbStatusBar

Pinned figures strip. VT323 only, never a control. Wrap key numbers in
`<b>` for pink. `class: hb-statusbar`

### HbAppShell

The full-height tool layout. Slots: `header`, `tabs`, `toolbar`, default
(work column), `rail`, `statusbar`. Pinned chrome, scrolling work and rail;
unpins and stacks below 900 px. `class: hb-app, hb-work, hb-main, hb-rail`

### HbShell

Centered content column. `class: hb-shell`

| Prop | Type | Default |
|---|---|---|
| `width` | `'wide' \| 'narrow'` | `'wide'` |

## Surfaces

### HbPanel

Raised paper with the 5 px block shadow. `class: hb-panel, hb-panel-hd`

| Prop | Type | Default | Notes |
|---|---|---|---|
| `heading` | `string` | | or use the `head` slot |
| `head` | `'editorial' \| 'instrument'` | `'editorial'` | marker on a rule, or VT323 on an ink bar. One style per artifact |
| `sunk` | `boolean` | `false` | flush well, no shadow |

### HbCard

Same surface, lifts on hover when interactive. `class: hb-card`

| Prop | Type | Default |
|---|---|---|
| `interactive` | `boolean` | `false` |
| `as` | `string` | `'div'` |

### HbStage

The void with the pink offset shadow. Canvases, scopes, waterfalls, 3D
views. Give a canvas inside it `class="hb-scope"`. `class: hb-stage`

| Prop | Type | Default | Notes |
|---|---|---|---|
| `graph` | `boolean` | `false` | the 32 px pink graticule |
| `label` | `string` | | dimmed label at the top |

### HbCallout

Pink left rule on a pink wash. One or two per page. `class: hb-callout`

| Prop | Type | Default |
|---|---|---|
| `variant` | `'pink' \| 'ok' \| 'warn' \| 'err' \| 'info'` | `'pink'` |

### HbFold

Disclosure. Fiddly controls fold away rather than being deleted.
`class: hb-fold`

| Prop | Type | Notes |
|---|---|---|
| `summary` (required) | `string` | |
| `v-model` | `boolean` | open state, optional |

### HbSticker

Rotated hand-lettered tag. One per view. `class: hb-sticker`

| Prop | Type | Default |
|---|---|---|
| `variant` | `'primary' \| 'secondary'` | `'primary'` |

### HbNum

Circular section badge, one of the two allowed radii. `class: hb-num`

## Controls

### HbButton

`class: hb-btn` and variants

| Prop | Type | Default | Notes |
|---|---|---|---|
| `variant` | `'primary' \| 'secondary' \| 'danger' \| 'ghost'` | `'primary'` | danger is the pink fill, one per view. ghost is for inside stages |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | |
| `block` | `boolean` | `false` | full width |
| `disabled` | `boolean` | `false` | |
| `loading` | `boolean` | `false` | spinner replaces the icon slot |
| `type` | `'button' \| 'submit' \| 'reset'` | `'button'` | |
| `as` | `string` | `'button'` | `'a'` with `href` for links |

Slots: default, `icon`. Emits `click`.

### HbChip

Filter and multi-select toggle. `class: hb-chip`

| Prop | Type | Notes |
|---|---|---|
| `v-model` | `boolean` | on state, optional |
| `disabled` | `boolean` | |

### HbSeg

Segmented mode switch. Two or three options only; past that use a select.
`class: hb-seg`

| Prop | Type |
|---|---|
| `options` (required) | `Array<{label, value} \| string>` |
| `v-model` | `string \| number` |

### HbInput, HbTextarea

`class: hb-input, hb-textarea`

| Prop | Type | Notes |
|---|---|---|
| `v-model` | `string \| number` | |
| `invalid` | `boolean` | red border |
| `rows` | `number` | textarea only, default 4 |

Native attributes (placeholder, type, inputmode, disabled) fall through.

### HbSelect

`class: hb-select`

| Prop | Type | Notes |
|---|---|---|
| `options` | `Array<{label, value, disabled?} \| string \| number>` | or slot `<option>` elements |
| `v-model` | `string \| number` | |
| `invalid` | `boolean` | |

### HbCheckbox, HbRadio

Native controls carrying the pink accent, label as slot.
`class: hb-check`

| Prop | Type | Notes |
|---|---|---|
| `v-model` | checkbox `boolean`, radio `string \| number` | |
| `value` (required) | radio only | the value this radio selects |
| `name` | radio only | |
| `disabled` | `boolean` | |

### HbSwitch

Rectangular toggle, knob slides, pink when on. `class: hb-switch`

| Prop | Type | Notes |
|---|---|---|
| `v-model` | `boolean` | |
| `label` | `string` | accessible name |
| `disabled` | `boolean` | |

### HbField

Label, control, hint or error. `class: hb-field`

| Prop | Type | Notes |
|---|---|---|
| `label` | `string` | |
| `for` | `string` | id of the control in the slot |
| `hint` | `string` | |
| `error` | `string` | replaces the hint when present |

### HbSlider

Label, track, live value. The default control of every panel.
`class: hb-slider`

| Prop | Type | Default |
|---|---|---|
| `label` (required) | `string` | |
| `v-model` | `number` | |
| `min`, `max`, `step` | `number` | `0`, `100`, `1` |
| `unit` | `string` | appended to the readout |
| `format` | `(value: number) => string` | custom readout |

### HbDropdown

Action menu under a trigger. Closes on outside click and escape.
`class: hb-menu-wrap, hb-menu, hb-menu-item`

| Prop | Type | Default |
|---|---|---|
| `label` | `string` | trigger button text |
| `items` | `Array<{label, value, disabled?}>` | |
| `align` | `'left' \| 'right'` | `'left'` |

Emits `select` with the item value. Slots: `trigger` (receives `toggle`
and `open`), default (custom menu content, receives `close`).

## Data

### HbKv

Label left, readout right, dashed divider. The workhorse row of every
panel. `class: hb-kv`

| Prop | Type | Notes |
|---|---|---|
| `label` (required) | `string` | |
| `value` | `string \| number` | or use the slot |

### HbTable

Ink header, dashed rules, sunk stripes, pink wash on hover. Scrolls inside
its own wrapper. `class: hb-table, hb-scroll-x`

| Prop | Type | Notes |
|---|---|---|
| `columns` | `Array<{key, label, numeric?}>` | numeric right-aligns with tabular figures |
| `rows` | `Array<Record<string, unknown>>` | |

Scoped slot `cell-<key>` overrides a cell: receives `row` and `value`. Or
skip the props and slot your own `<thead>` and `<tbody>`.

### HbList, HbRow

Bookmarks, device lists, capture sessions. `class: hb-list, hb-row`

| Prop (HbRow) | Type | Default |
|---|---|---|
| `active` | `boolean` | `false` |
| `as` | `string` | `'button'` |

### HbPill

Status with a leading dot. Shows the connection, not the task.
`class: hb-pill`

| Prop | Type | Default |
|---|---|---|
| `status` | `'none' \| 'live' \| 'ok' \| 'warn' \| 'err'` | `'none'` |

### HbMeter

Pink fill on an ink track. `class: hb-meter`

| Prop | Type | Default |
|---|---|---|
| `value` (required) | `number` | |
| `max` | `number` | `100` |
| `label` | `string` | accessible name |

### HbSegMeter

Segmented signal meter. Slime below the threshold, the whole lit run flips
pink above it. `class: hb-segmeter`

| Prop | Type | Default |
|---|---|---|
| `value` (required) | `number` | zero to one |
| `segments` | `number` | `24` |
| `threshold` | `number` | `0.8` |
| `label` | `string` | |

### HbConsole

Void background, VT323, newest line at the top, one color per severity.
`class: hb-console`

| Prop | Type | Default |
|---|---|---|
| `lines` (required) | `Array<{text, t?, level?}>` | level: ok, warn, err, info, hit |
| `newestFirst` | `boolean` | `true` |
| `height` | `string` | `'180px'` |

### HbDial

The one giant primary readout per tool, and only one. Click the top half
of a digit to raise it, the bottom half to lower it; the wheel works too.
`class: hb-dial`

| Prop | Type | Default |
|---|---|---|
| `v-model` | `number` | |
| `digits` | `number` | `3` integer places |
| `decimals` | `number` | `3` |
| `unit` | `string` | |
| `min`, `max` | `number` | `0`, unbounded |
| `readonly` | `boolean` | `false` |

### HbTiles, HbTile

Preset tap targets, 96 px minimum. `class: hb-tiles, hb-tile`

| Prop (HbTile) | Type | Notes |
|---|---|---|
| `name` (required) | `string` | marker face |
| `sub` | `string` | Plex sub line |
| `active` | `boolean` | fills pink |

### HbAvatar

A square. This system does not crop people into circles.
`class: hb-avatar`

| Prop | Type | Default |
|---|---|---|
| `src` | `string` | |
| `alt` | `string` | |
| `initials` | `string` | fallback, two characters |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` |

### HbKbd

Keyboard hint. `class: hb-kbd`

## Feedback

### HbModal

Centered panel over a scrim. Focus trapped, escape closes, body scroll
locked. `class: hb-modal`

| Prop | Type | Default |
|---|---|---|
| `v-model` | `boolean` | |
| `title` | `string` | |
| `width` | `number` | `640` |
| `closable` | `boolean` | `true` |
| `closeOnBackdrop` | `boolean` | `true` |
| `closeOnEscape` | `boolean` | `true` |

Slots: default, `footer`. Emits `close`.

### HbDrawer

Full-height panel sliding from an edge. The mobile home of the rail.
`class: hb-drawer`

| Prop | Type | Default |
|---|---|---|
| `v-model` | `boolean` | |
| `side` | `'left' \| 'right'` | `'right'` |
| `closeOnBackdrop` | `boolean` | `true` |

### HbToaster and useToast

One toast at a time, bottom center, ink plate, pink rule, gone in about a
second. Render `<HbToaster />` once near the app root. `class: hb-toast`

```ts
const { toast } = useToast()
toast('bookmark saved')          // default 1400 ms
toast('capture armed', 3000)
```

### HbSpinner

Three meter segments blinking in order. `class: hb-spinner`

### HbSkeleton

Breathing paper-edge block. `class: hb-skeleton`

| Prop | Type | Default |
|---|---|---|
| `width` | `string` | `100%` |
| `height` | `string` | `1em` |

### HbEmptyState

Dashed well that says what is missing and what to do. `class: hb-empty`

| Prop | Type |
|---|---|
| `title` (required) | `string` |

Slots: default (body text), `action`.

### HbPagination

Chips in a row, current page pink. `class: hb-pages, hb-page`

| Prop | Type | Default |
|---|---|---|
| `v-model` | `number` | current page, from 1 |
| `pages` (required) | `number` | total |
| `window` | `number` | `1` pages shown around the current |

## Class-only pieces

Some things are positioning-specific decor or one-liners and ship as CSS
classes without a component:

| Class | What it is |
|---|---|
| `hb-tape` | translucent paper strip over a corner. Zine pages only |
| `hb-tilt-l`, `hb-tilt-l2`, `hb-tilt-r`, `hb-tilt-r2` | sparing rotation. One or two tilted things per view |
| `hb-spacer` | `margin-left:auto` inside bars and rows |
| `hb-label`, `hb-readout`, `hb-tagline` | the type roles |
| `hb-rule`, `hb-rule-hd` | dashed and heavy horizontal rules |
| `hb-scope` | canvas inside a stage, block and full width |
| `hb-halftone`, `hb-graph` | textures. One per artifact, graph only on the void |
| `hb-scroll-x` | horizontal scroll wrapper for wide content |

## Growing the system

If a new tool needs something this set does not have, the system is
missing a component. Grow `hackbuild.css` and this document rather than
letting the tool invent a one-off. That rule is what has kept the language
coherent across the bench tools so far.
