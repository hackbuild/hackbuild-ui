# hack.build design system

Version 1.5. This document supersedes the hack.build sections of
`hackbuild-explainer`, `brand-forge`, and `board-forge`, and the styling of
every earlier project (`hack-build`, `hack-build-vue`, `hackbuild-stack`,
`hackbuild-resume`). Where any of those disagree with this file, this file
wins.

Version 1.2 adds the Vue 3 component library, the Tailwind v4 bridge,
motion, stacking and layout tokens, and a set of components the app
projects kept rebuilding: switch, dropdown menu, drawer, avatar, skeleton,
spinner, empty state, pagination, and the zine decor classes. It also bakes
in the shipped icon set (`HbIcon`, docs/icons.md), the page section
anatomy every marketing page kept rebuilding (nav, hero, section head,
media card, video frame, playlist, timeline, plaque, call to action band,
footer), and the identity pieces the app kept rebuilding: seeded critter
avatars, placeholder covers, verified badge, stats, level dots and the
countdown.

Version 1.3 adds the bench layer (section 9): the steps strip, the guide
strip, stage overlays, the materials panel, the param row and the welcome
card, as classes and as six Vue components, plus the tokens a design bench
needs (on-ink lines, a solid on-void label, the stage part palette, the
board render colors, rail and tray widths). It also makes the pink budget
countable, puts the bench verbs on the guide strip, sets ink text on every
pink fill, adds an ink on-state for toggle chips, and sets 44 px touch
targets for icon buttons and ranges.

Version 1.4 adds the ai and 3d layer (section 10): the viewport with its
hud, cover, inset and speech bubble; the drop zone, progress, hash,
licence line and model loader; the model list and the permission state;
chat, timed transcripts, the heard line and the audio strip; verdict tags,
check tables, readout grids, gauge rows, feeds and the heat table. They
ship as classes that stand alone for vanilla pages and as Vue components.
It also ships the five faces self-hosted, for pages that open from
`file://` or run offline, fixes the instrument head on an `h2` or `h3`,
and adds a busy pill that never spends the pink.

Version 1.5 adds the minds and capabilities layer (section 11): drive
sparkline rows, choice bars, the cause timeline and the capability panel,
as classes and as four Vue components, with a rate limited live region
for values that change many times a second. Hover styles now apply only
to a hovering fine pointer, so a tapped button does not stay pink. Tabs
take arrow keys, and a segmented control may be an ink view switch.

## What this is

The punk zine language: warm paper, black ink, one hot pink, typewriter type,
hard shadows that look slightly off-register like a bad photocopy. It is the
identity for hack.build itself and for every bench tool, board viewer, sim,
landing page, sticker and PCB built under it.

It is not LumenCanvas (paper and teal, Sora, registration marks) and not CLASP
(charcoal panels, JetBrains Mono, teal on dark). Those are separate systems and
they never mix inside one artifact.

## Files in this package

| Path | Purpose |
|---|---|
| `src/styles/tokens.css` | Design tokens. The single source of truth for every value. |
| `src/styles/hackbuild.css` | The production stylesheet. Every component as plain CSS over the tokens. |
| `src/styles/tailwind.css` | Tailwind v4 bridge. Maps tokens to theme variables for app code. |
| `src/styles/fonts.css` | Google Fonts convenience import for the five faces. |
| `src/styles/fonts/` | The five faces as woff2 (latin subset, Fontsource 5.3.0) with their Apache-2.0 and OFL-1.1 licence texts. |
| `src/styles/fonts-local.css` | `@font-face` over `./fonts/`. The build also writes `fonts-inline.css`, the same faces as data urls for `file://` and offline pages. |
| `src/components/` | Vue 3 components, Hb prefix. Behavior only; they bind to the classes here and carry no styles of their own. |
| `src/composables/` | useToast. |
| `assets/brand/hackbuild-mark.svg` | Canonical two-path mark, arc in ink. |
| `assets/brand/hackbuild-mark-reversed.svg` | Same mark, arc in paper, for ink backgrounds. |
| `assets/brand/hackbuild-lockup-horizontal.svg` | Mark plus wordmark. The default lockup. |
| `assets/brand/hackbuild-lockup-horizontal-dark.svg` | Same, on an ink plate. |
| `assets/brand/hackbuild-lockup-stacked.svg` | Mark over wordmark over tagline. |
| `assets/brand/hackbuild-lockup-stacked-dark.svg` | Same, on an ink plate. |
| `assets/brand/hackbuild-wordmark.svg` | Wordmark alone. |
| `assets/brand/hackbuild-wordmark-dark.svg` | Wordmark alone, reversed. |
| `assets/brand/hackbuild-favicon.svg` | 64 px square, mark on paper. |
| `hackbuild-design-system.html` | The living style guide, rendered in the system it documents. |
| `hackbuild-kerf-replica.html` | The KERF radio shell rebuilt from nothing but system classes. The acceptance test. |
| `docs/` | Getting started, tokens, components, Tailwind, brand. |
| `playground/` | Vite app exercising every Vue component. |
| `site/` | The design system website: storybook style component gallery, token and brand pages, and full page demos rendered in the system itself. |
| `GUIDELINES.md` | This file. |

Every SVG carrying type has that type converted to outlined paths, so no file
in this package depends on a font being installed anywhere.

---

## 1. The mark

Two paths taken verbatim from the site favicon: a broken arc and a wrench.

- Calibrated square viewBox: `117 103 800 800`
- Arc path transform: `translate(490,121)`, fill `#1a1a1a` (or `#f5f0e6` reversed)
- Wrench path transform: `translate(498,314)`, fill `#FE0386` always

Never approximate it, never redraw it, never trace it from a render, never
"clean up" the paths. Place it through the calibrated viewBox rather than a
guessed transform; a guessed transform produced a wrong-sized mark once and it
was rejected. To place it at size S inside another coordinate system, nest the
whole `<svg>` with its own viewBox rather than scaling the paths.

### Clear space and minimums

- Clear space on every side: 0.5 times the mark height. Nothing intrudes.
- Mark alone: 16 px floor on screen, 8 mm floor in print.
- Horizontal lockup: 120 px wide floor. Below that, drop the wordmark and use
  the mark alone.
- Stacked lockup with tagline: 2 inch floor. The tagline is unreadable below it.

### Misuse

Do not recolor the wrench. Do not add a stroke, glow, bevel or drop shadow. Do
not rotate, skew or stretch non-uniformly. Do not place it on a busy photo
without a solid paper or ink plate behind it. Do not rebuild the wordmark in
Permanent Marker.

### On a PCB

Pink soldermask, white silk, gold exposed copper. The wrench becomes a mask
opening so it comes out in bare metal and the arc stays silk. When pink mask is
unavailable, invert: cream or white mask, black silk, gold. On a bottom-side
render the mark must sit inside a counter-flipped wrapper or it prints mirrored.

---

## 2. Color

The favicon values are the record. Older files carrying `#ff3366`, `#ff2d7b` or
`#f5f2eb` are wrong and should be corrected wherever found.

```css
--hb-pink:        #FE0386   /* the one accent */
--hb-pink-deep:   #c70269   /* pressed and hover on pink fills */
--hb-pink-10:     rgba(254,3,134,.10)
--hb-pink-18:     rgba(254,3,134,.18)

--hb-paper:        #f5f0e6  /* page surface */
--hb-paper-raised: #fffdf7  /* panels and cards */
--hb-paper-sunk:   #efe9db  /* wells, table stripes */
--hb-paper-edge:   #e8e0d0  /* code blocks, disabled fills */

--hb-ink:    #1a1a1a        /* text, borders, dark panels, silk black */
--hb-ink-2:  #444444        /* secondary text */
--hb-ink-3:  #6b6459        /* labels and captions */
--hb-ink-4:  #9a9184        /* placeholders and disabled */
--hb-void:   #0a0a0a        /* stages: canvases, scopes, consoles */
```

Signal colors are for data only. Charts, log severity, pass and fail. Never
chrome, never brand. These are tuned for text on paper.

```css
--hb-ok:   #1f9d55   --hb-warn: #c77700
--hb-err:  #c3251f   --hb-info: #2b6cb0
```

### The lit set

The paper signal colors go muddy on the void. Anything drawn inside a stage, a
scope or a console uses the lit set instead. Every tool arrived at this split
independently before it was written down.

```css
--hb-slime:    #a6e22e              /* on-void ok, meter fill below threshold */
--hb-lit-warn: #ffb020
--hb-lit-err:  #ff5c4d
--hb-lit-info: #58a6ff
--hb-lit-dim:  rgba(245,240,230,.35)  /* ghost paths, graticules, axes */
--hb-lit-label: #9a9184             /* solid small labels on the void */
```

`--hb-lit-dim` reads 2.90:1 on the void (computed), which fails AA for a
small label that carries meaning. Labels on the void use `--hb-lit-label`
(6.37:1, computed); `--hb-lit-dim` stays for lines and ghosts.

### On-ink lines

The ink and void ladder has no step for a divider drawn on an ink bar.

```css
--hb-ink-line:   #33312c   /* hairline divider on ink */
--hb-ink-inset:  #2a2822   /* inset well on ink */
--hb-ink-border: #44413a   /* frame around a control on ink or the void */
```

### Stage parts and board render

Data on the void, never chrome. The part palette gives a mechanism or
assembly view one color per part role; the board set draws copper, mask and
silkscreen.

```css
--hb-part-a: var(--hb-pink)       /* row train, primary moving part */
--hb-part-b: var(--hb-slime)      /* column train, secondary */
--hb-part-c: var(--hb-lit-warn)   /* links, couplings */
--hb-part-d: #f5f0e6              /* rods, pivots, pins */
--hb-part-e: #6b6459              /* decks, plates */
--hb-part-f: #4a463c              /* frame, case */

--hb-gold: #d9b45a   /* copper and ENIG */
--hb-mask: #FE0386   /* solder mask */
--hb-silk: #ffffff   /* silkscreen */
```

### The plate palette

Identity colors for media plates, avatars and category coding, the way the
magazine and resume cards use them: a solid fill behind a paper icon or
marker initials.

```css
--hb-plate-teal:   #14b8a6   --hb-plate-purple: #8b5cf6
--hb-plate-blue:   #3b82f6   --hb-plate-amber:  #f59e0b
--hb-plate-green:  #22c55e
```

The pink and the ink complete the set. Amber and green take ink
foregrounds; paper on those fills was one of the readability problems in
the older pages. Plates never become chrome, text color, or a page
background; a seeded pick keeps a project or user on the same color
forever.

### The one-accent rule

The pink is punctuation, not paint. It marks the single most important thing in
a view: the active tab, the live value, the primary action, the trace on the
scope, the dot and build in the wordmark. If three things on screen are pink,
none of them are. It never goes on large fills, page backgrounds, body copy, or
purely decorative chrome.

Text on a pink fill is ink, never paper: ink reads 4.62:1 on the pink and
paper reads 3.32:1 (both computed, WCAG relative luminance), which fails AA
at the 11 px utility size every chip and button uses. This holds for
`.hb-seg > button.is-on`, `.hb-tile.is-on`, `.hb-row.is-on`, `.hb-btn-go`
and the pink hovers of `.hb-iconbtn` and `.hb-menu-item`. Since 0.10.0 a
chip that is on fills ink, and light buttons lift on hover instead of
turning pink.

The budget is countable. Every pink element in a view falls in one class:

| Class | Allowed pink | Counts against the one |
|---|---|---|
| structural | header bottom rule, current tab or step underline, wordmark dot and `build`, the stage or viewport pink shadow, range accent-color, focus ring, the drop zone dashes while a file hovers | no |
| focal | the primary action of the current pane, or the one live value the step is about, or the welcome primary start; in the ai and 3d layer the running download, the current gauge row, the transcript segment playing now, or a readout marked focal | yes, exactly one per view |
| data | the primary part color on the stage, the trace on a scope, the trace in an audio strip | no, it is data on the void |
| never pink | toggle chips (ink fill when on), secondary buttons, cam buttons (current cam outlined in paper), status tags (slime when good, lit warn when not), card borders, busy pills and verdict tags, hud stats, the chosen model row, the person's chat turns, the streaming caret | |

The hackbuild-fab bench smoke test (`tools/smoke/pink.ts` in that
repository) counts the elements in a view whose computed background or
border is `#FE0386`, removes the structural set, and fails above one.
This package has no test of its own for it.

---

## 3. Type

Four faces, four jobs. The split is what makes the system work; one face
everywhere collapses it into noise. Pick the face by the job the text is doing.

| Face | Job | Never |
|---|---|---|
| Permanent Marker | one name per screen (h1, `.hb-display`), brand lockup; h2 and h3 in the zine scope | body, buttons, numbers, block heads in a tool |
| Special Elite (`--hb-note`) | notes, hints, message prose, seal band text, hero subtitles | labels, readouts, the interface |
| IBM Plex Mono (`--hb-utility`) | the interface: body text, every label, button, chip, table header, form field, code, and the wordmark at 700 | headlines |
| VT323 | live numbers, coordinates, counters, timers, console lines, tabs, pills, block heads (h2, h3, panel heads) | prose |
| Libre Baskerville Italic | the tagline "make things. break things. repeat." and nothing else | anything else |

```html
<link href="https://fonts.googleapis.com/css2?family=Permanent+Marker&family=Special+Elite&family=VT323&family=IBM+Plex+Mono:wght@400;500;600;700&family=Libre+Baskerville:ital@1&display=swap" rel="stylesheet">
```

### Scale

| Role | Face | Size | Notes |
|---|---|---|---|
| h1 | Permanent Marker | 44 px, 32 mobile | line-height 1.05, one per screen |
| h2 | VT323 | 30 px, 26 mobile | block heads, sentence case; Permanent Marker 28 px in the zine scope |
| h3, panel heading | VT323 | 19 to 21 px | ink rule underneath |
| interface | IBM Plex Mono 400 | 14 px, 13 in `.hb-instrument` | line-height 1.45, sentence case |
| note | Special Elite | 13 to 16 px | line-height 1.5 to 1.6, max 68ch; the zine scope sets prose in it |
| label | IBM Plex Mono 600 | 12 px | sentence case |
| button, chip | IBM Plex Mono 500 | 13 px (12 small, 14 large) | sentence case, no tracking |
| tab, pill | VT323 | 15 px tab, 17 px pill | sentence case |
| small readout label | IBM Plex Mono 600 | 11 px | `.hb-readout-label`, uppercase, letter-spacing 0.09em; the only uppercase in a tool |
| table cell, code | IBM Plex Mono 400 | 12.5 px | tabular numerals on figures |
| readout | VT323 | 18 to 32 px | pink on paper, pink or green on ink |
| tagline | Libre Baskerville Italic | 15 to 20 px | one per artifact |

### Two panel heads

VT323 on a rule (`.hb-panel-hd`) is the plain head of a tool block. Permanent
Marker heads belong to pages, docs and marketing (the zine scope). VT323
sentence case on a full-bleed ink bar is the
instrument head: dense panels, anything sitting next to a scope. KERF and the
laser rigs use the instrument head throughout. Pick one per artifact and use it
for every panel in that artifact; mixing them inside one view is the fastest way
to make a tool look unfinished.

### Wordmark

IBM Plex Mono at weight 700, matching the live site. `hack` in ink, then the dot **and**
`build` both in pink. Setting only the dot in pink is the most common mistake.
On an ink header, `hack` flips to paper and `.build` stays pink.

---

## 4. Structure

### Shadows

Hard offset, no blur, no spread. They read as a print registration error, which
is the point.

Gradients for stage lighting only: the `.hb-stage-lit` glow is a smooth radial
gradient (`--hb-stage-glow`, FERRULE's 16 percent pink). Nowhere else: no
gradient fills, shadows, buttons or panels. Patterns drawn as 1 px rules (the
dot grid, the graph rule, hairlines) are rules, not gradients. Pressing a control collapses its shadow and moves it by the same
offset, so the thing physically goes down.

```css
2px 2px 0 var(--hb-ink)    /* chips, small buttons */
3px 3px 0 var(--hb-ink)    /* controls */
4px 4px 0 var(--hb-ink)    /* panels, cards, reply boxes (5 px in the zine scope) */
6px 6px 0 var(--hb-ink)    /* hover lift (7 px in the zine scope) */
5px 5px 0 var(--hb-pink)   /* the one stage per view */
```

### Borders and radius

1.5 px ink on panels, fields, chips, pills and quiet controls
(`--hb-border`); 2 px for emphasis: the primary button, the modal panel,
the stage and the viewport (`--hb-border-em`). Marketing blocks, docs
prose and `.hb-zine` keep 2 px everywhere (section 19). 3 px for the
header rule, the active tab underline, and focus rings.
Radius is zero everywhere; the only exceptions are the circular section number
badge and nav dots. A rounded button means the artifact has left the system.

### Texture

Covered in section 4b, because which texture you use follows from which surface
you are on.

---

## 4b. Surfaces and texture

There are six surfaces and they form a ladder. Going up the ladder means adding
a border and a shadow, not adding a color. The void is reserved: it is where the
machine draws, never where you put chrome.

| Surface | Token | Carries | Texture |
|---|---|---|---|
| page | `--hb-paper` #f5f0e6 | the body; only panels sit directly on it | one, fixed, page level |
| raised | `--hb-paper-raised` #fffdf7 | panels, cards, fields, chips, list rows | none, inherits the page |
| sunk | `--hb-paper-sunk` #efe9db | toolbars, table stripes, wells inside a panel | none |
| edge | `--hb-paper-edge` #e8e0d0 | inline code, disabled fills | none |
| ink | `--hb-ink` #1a1a1a | header, tabs, status strip, table head, dial plate | grain at 0.07 if the artifact uses grain |
| void | `--hb-void` #0a0a0a | canvases, scopes, waterfalls, consoles, 3D views | graph rule only |

### Which texture, and when

Pick exactly one per artifact. Apply it once, at the page level, as a fixed
overlay or a body background. Layering two turns the paper to mud, and applying
one per component makes the seams visible where elements overlap.

- **Halftone dots** for dense tool UIs and app chrome, where grain fights with
  small type and thin rules. 4 px radial grid at 4.5 percent. KERF, DETENT and
  the board viewers run this. Class `.hb-halftone`.
- **Grain** for pages, zines, stickers, decks, anything that should feel
  printed. Fractal noise, 0.05 on paper and 0.07 over ink, as one fixed
  full-viewport overlay above everything. Applied by `body.hb::before`.
- **Graph rule** only inside a stage, behind a plot. 32 px pink grid at 10
  percent on the void. It is a graticule, not a decoration, so it never appears
  on paper. Class `.hb-graph`.

```css
/* halftone, on the body */
background-image: radial-gradient(rgba(26,26,26,.045) 1px, transparent 1px);
background-size: 4px 4px;

/* grain, one fixed overlay, never per element */
body::before{
  content:""; position:fixed; inset:0; z-index:9999;
  pointer-events:none; opacity:.05;
  background-image:url("data:image/svg+xml,...feTurbulence fractalNoise 0.85...");
}

/* graph rule, inside a stage only */
background-image:
  linear-gradient(rgba(254,3,134,.10) 1px, transparent 1px),
  linear-gradient(90deg, rgba(254,3,134,.10) 1px, transparent 1px);
background-size: 32px 32px;
```

### Rules that get broken

Texture never goes on a stage, a canvas, a dial plate, or anything that will be
screenshotted for a datasheet. It is off in print. It is off inside a modal. And
it never scrolls: a grain layer that moves with the content reads as a rendering
bug rather than paper.

---

## 4c. Bars and top strips

Every tool stacks the same four horizontal strips in the same order, and each
one has a single job. Most of the mess in an unfinished tool comes from putting
a verb in the header or branding in the toolbar.

| Strip | Job | Surface | Height | Holds |
|---|---|---|---|---|
| header | identity and state | raised paper `#fffdf7`, 2 px ink bottom rule, one row | 52 px with the rule, plus the top safe area | mark, tool name (the switcher), one model chip, a menu, tagline from 901 px |
| tabs | destinations | raised paper, 1.5 px ink rule under it; VT323 15 px sentence case, the selected tab filled ink | 44 px | 3 to 5 tab buttons, nothing else |
| toolbar | verbs and global settings | sunk paper, 2 px ink bottom | 46 px, none when empty | connect, mode segments, chips, a readout pushed right |
| status strip | counts and rates | ink, 3 px pink top rule, pinned bottom | 28 px, 44 px as a button on a coarse pointer | VT323 figures; cells with `data-priority` 2 show from 481 px of strip width and 3 from 761 px, so a phone keeps two. At most one control: the whole strip as `.hb-statusbar-btn`, opening the log behind the figures |

### Header anatomy

Left to right, always in this order:

1. The mark at 28 px. It appears here and nowhere else in the app.
2. The tool name in Permanent Marker 22 px ink, trailing dot or suffix in
   pink. The title is the tool name, not hack.build; pressing it switches
   tool. It never breaks inside a word and ends in an ellipsis when the row
   is short; the bar never wraps.
3. One model chip. Rates and counts live in the rack or a detail fold, not
   in the bar.
4. The menu, pushed right with `margin-left:auto`.
5. The tagline in Special Elite 13 px ink 3, from 901 px only.

Since 0.10.0 the bar is light (hackle's header). `HbHeader ink` and
`.hb-header.is-ink` keep the ink bar with the 3 px pink rule for brand pages
and the docs site; ink only rules (pills, dots, seg, icon buttons on the bar)
are scoped to `.is-ink`. `.hb-tabs.is-ink` keeps the ink tab strip.

Header, tabs and status strip are pinned. Only the work area scrolls. Classes:
`.hb-header`, `.hb-tabs`, `.hb-bar`, `.hb-statusbar`, `.hb-seg`, `.hb-spacer`.

A design bench maps onto the same four: the steps strip is the tabs strip,
the guide strip is the toolbar, and the bench verbs (undo, redo, open,
save, guide) sit at the right end of the guide strip, never in the header.
The header keeps identity and state only. Section 9 has the parts.

### On a marketing page instead

A page header inverts: paper rather than ink, taller, the horizontal lockup
rather than the bare mark, no status, no tabs, one pink element which is usually
the call to action. If the page scrolls, the header shrinks into the ink
tool-style bar rather than staying tall.

### Mobile first

The class layer is written for a 360 px phone held upright, and every wider
layout is added with a `min-width` media query or a `min-width` container
query; no rule in `hackbuild.css` narrows a desktop layout with
`max-width`. The breakpoints are the ones the system already used: 641 px
for most of the layer, 761 px for the page nav, 801 px for the playlist,
821 px for range height and 901 px for the app shell and the header
tagline. Read every "under 640 px" in this file as the base state.

| Rule | Value |
|---|---|
| touch targets | buttons, chips, tabs, icon buttons, cam buttons, the param row reset, ranges, check rows and the drop zone pick button are 44 px tall, and `.hb-link` is at least 44 by 44 px on a coarse pointer (the check box 20 px); they compact only at 641 px and up with a fine pointer (ranges at 821 px) |
| fields | `.hb-input`, `.hb-select`, `.hb-textarea` and the composer are 16 px, so iOS does not zoom on focus, and inputs and selects are 44 px tall; 13 px (composer 14) and their natural height only at 641 px and up with a fine pointer |
| safe area | the header, nav, toolbar, status strip and shell pad by `env(safe-area-inset-*)` when the inset is larger than the gutter; the page sets `viewport-fit=cover` to use it |
| viewport | square and at most 62svh first, 16 by 9 at 641 px; the hud stacks and the scene verbs shrink until the viewport is 561 px wide |
| app shell | stacked and scrolling as one page first; pinned work column beside the rail at 901 px. The dock (composer or primary action) sticks above the status strip while the shell is stacked, so the input never scrolls away; the rack recipe moves its rail into a bottom sheet under 641 px and a right drawer to 900 px |
| hover | every `:hover` rule sits inside `@media (hover:hover) and (pointer:fine)`, so a tap on a touch screen leaves no pink behind; `:active` and `:focus-visible` stay for touch and keys |

### Do not

Put connect, save or export in the header. Put the mark in the toolbar or the
footer as well. Stack more than four strips before content starts. Give the
status strip more than one button. Let the tab row wrap to two lines; collapse it to a
select first.

---

## 5. Components

All of these ship in `hackbuild.css` with `hb-` prefixed classes.

| Class | What it is |
|---|---|
| `.hb-header` | Ink bar, 3 px pink bottom rule, mark at ~26 px, marker title with pink span, tagline pushed right at reduced opacity |
| `.hb-tabs` / `.hb-tab` | Transparent buttons on ink, pink underline on the active one |
| `.hb-panel` / `.hb-panel-hd` | Raised paper, 1.5 px ink border, hard shadow, VT323 heading over an ink rule |
| `.hb-card` | Same, but lifts 2 px on hover to a 7 px shadow |
| `.hb-stage` | The void with a pink offset shadow. Canvases, scopes, waterfalls, 3D views |
| `.hb-btn` and variants | Light by default: raised paper, ink text, 1.5 px ink line, 3 px hard shadow, Plex 13 px sentence case; lifts on hover, shadow collapses on press. `-go` is the one pink action per screen (pink fill, ink text, 2 px line; HbButton `variant="go"`). `-ink` is a pressed or on state. `-danger` is light with err text and line. `-2` is an alias of the default for one minor. HbButton `variant="primary"` renders light since 0.10.0 and logs a note. `-ghost` for inside stages; disabled ghost is a paper edge fill, ink 3 text (4.46:1, computed) and a dashed border, readable on paper and ink |
| `.hb-chip` | Filter and multi-select toggle, `.is-on` fills pink with ink text; `.is-toggle.is-on` fills ink for toggles inside a bench |
| `.hb-pill` | Status with a leading dot. `.is-live` pulses pink, `.is-ok`, `.is-err` |
| `.hb-input`, `.hb-select`, `.hb-textarea`, `.hb-range` | Paper field, ink border, pink focus ring and pink accent-color. Ranges are 44 px tall under 820 px and on touch screens, native thumb kept. `HbSelect label` wraps the select in an `.hb-ctl` label for a toolbar or controls row |
| `.hb-kv` | Label left, readout right, dashed divider. The workhorse row of every panel |
| `.hb-table` | Ink header row, dashed cell rules, sunk-paper stripes, pink wash on hover |
| `.hb-console` | Void background, VT323, newest line at the top, one color per severity |
| `.hb-meter` | Pink fill on an ink track, hard edges |
| `.hb-callout` | Pink left rule on a 10 percent pink wash. One or two per page |
| `.hb-num` | Circular section badge. One of only two places a radius is allowed |
| `.hb-seg` | Segmented control for mode switches. Two or three options, past that use a select. `.is-toggle` fills ink when on, for a view switch beside a focal value |
| `.hb-dial` | The one giant primary readout per tool. VT323 on an ink plate, pink tabular digits, digits individually clickable |
| `.hb-sticker` | Rotated hand-lettered tag. The one place Permanent Marker is allowed at small size. One per view |
| `.hb-tiles` / `.hb-tile` | Preset tap targets, 96 px minimum, marker name over a Plex sub, active tile fills pink |
| `.hb-segmeter` | Segmented signal meter. Slime below the threshold, the whole lit run flips pink above it |
| `.hb-slider` | Label, track, live value. The default control of every panel |
| `.hb-list` / `.hb-row` | Bookmarks, device lists, capture sessions. 44 px tall on a coarse pointer |
| `.hb-acts` | Button row: the verbs of one thing under a form, card or picked row. Wraps; `.is-end` pushes right, `.is-fill` shares the width; 44 px buttons on a coarse pointer. A toolbar holds global settings, this does not. `HbActions` |
| `.hb-toolpage` | Tool page: the parts of one tool (engine bar, chat, rack) stacked with one gap. `.is-grow` on the part that fills the rest. Use it instead of a local margin between parts. `.is-split` puts a side column (`.is-side`: rack, queue, list) beside the main part from 1024 px; `.is-full` spans both (engine bar). In `HbAppShell` with no rail the main column takes the full width from 901 px. Every part holds its height (a `.hb-bar` keeps its 46 px); only `.is-grow` shrinks and grows |
| `.hb-fold` | Disclosure. Fiddly controls fold away rather than being deleted; easy mode is a fold, not a different app. `.hb-fold-num` is the bracketed section number, `.hb-fold-done` the ok word |
| `.hb-tabs.is-num` / `.hb-tab.is-done` / `.hb-tabs-select` | Numbered tabs in the order of work, a done tab's number filled ok green; the select that replaces a strip that would clip |
| `.hb-empty-hint` | The line a tab or fold shows while it has nothing: what to do first |
| `.hb-hint` | One muted utility line under a control or a part: what a choice costs, where to drop a file. Paper ink 3; lit label on ink and on a stage. Inside `.hb-field` it stays the field hint |
| `.hb-modal` | Centered panel over a scrim. `[hidden]` must beat the display rule explicitly or the close button does nothing. `.hb-modal-hd` is the title row with the close button, `.hb-modal-ft` the right aligned actions. `.hb-panel.is-sm` and `.is-lg` set 520 and 880 px from the modal tokens; the default is 640 |
| `.hb-toast` | Bottom center, ink plate, pink rule, gone in about a second |
| `.hb-app` / `.hb-work` / `.hb-main` / `.hb-rail` | Full-height shell: pinned strips, one scrolling work column beside one scrolling rail |
| `.hb-app-foot` / `.hb-dock` | The shell foot: the dock with the composer or the one primary action, over the status strip, pinned at every width |
| `.hb-app.is-stage` / `.is-split` / `.is-chat` | View modes for a tool with a stage and a chat or rack: stage hides the rail, chat hides the work column and centres the rail at 760 px, split shows both |
| `.hb-app.is-rack` / `.is-bench` / `.is-transcript` | The three shell recipes. rack: stage beside a 360 to 408 px rack of tabs, a sheet under 901 px. bench: steps and guide in the strips, a 360 px parameter rail. transcript: the stage held to 38dvh over the transcript on a phone, beside it at 2 to 3 from 901 px |
| `.hb-scope` | Canvas inside a stage. Block and full width, or it leaves a baseline gap and the pink shadow sits wrong |
| `.hb-switch` | Rectangular toggle, knob slides, pink when on. Keyed off `aria-checked` |
| `.hb-check` | Checkbox and radio row, native control carrying the pink accent |
| `.hb-rcards` / `.hb-rcard` | Radio cards: name, meaning and trade per option (0.9.6) |
| `.hb-menu-wrap` / `.hb-menu` / `.hb-menu-item` | Dropdown action menu under a trigger |
| `.hb-drawer` | Full-height panel sliding from an edge. The mobile home of the rail. `.is-sheet` is the bottom sheet: 74 percent tall, safe area padded, one open at a time. `.hb-drawer-hd` is the title row with the close button. `.is-md` and `.is-lg` set the side drawer to 440 and 560 px from the drawer tokens (default 340); a sheet stays full width |
| `.hb-avatar` | A square with an ink border. This system does not crop people into circles |
| `.hb-skeleton` | Paper-edge block that breathes while the real thing loads |
| `.hb-spinner` | Three meter segments blinking in order. No circles |
| `.hb-empty` | Dashed well that says what is missing and what to do |
| `.hb-pages` / `.hb-page` | Pagination chips, current page pink |
| `.hb-panel-hd-inst` | The instrument panel head: VT323 sentence case on a full-bleed ink bar |
| `.hb-tilt-l` / `.hb-tilt-l2` / `.hb-tilt-r` / `.hb-tilt-r2` | Sparing rotation. One or two tilted things per view |
| `.hb-icon` / `.hb-iconbtn` | The shipped stroke icon set and the square icon-only action button, 34 px, 44 px under 640 px and on touch screens |
| `.hb-nav` / `.hb-nav-link` / `.hb-nav-cta` | Page navigation. Links collapse into a drawer below 760 px |
| `.hb-hero` / `.hb-kicker` / `.hb-ink-block` | The zine hero: VT323 kicker on an ink plate, marker headline, ink block behind one phrase |
| `.hb-sechead` / `.hb-sechead-link` | Section head: title left, one quiet link pushed right. Centered variant for standalone bands |
| `.hb-footer` and children | Ink footer: link columns, ghost social squares, dashed stamp line |
| `.hb-tag` | Static VT323 tag on a plate: category, badge, year. The interactive cousin is the chip. `.is-lit-ok`, `.is-lit-warn`, `.is-lit-err` are outlined status tags for ink and the void |
| `.hb-link` | Quiet utility-face link, pink, usually with a trailing arrow icon |
| `.hb-media-card` / `.hb-media` | Project card: media plate, overlay badges, tags, marker title, copy, quiet links, author footer |
| `.hb-cover` | Seeded placeholder cover: an icon ghosted on the ink plate for projects with no image |
| `.hb-verified` | Small pink check next to a display name |
| `.hb-stats` / `.hb-stat-block` | Inline meta counts, and the big VT323 figure with a label |
| `.hb-dots` | Square pips filled pink up to the level. Difficulty and skill |
| `.hb-countdown` | Ticking VT323 blocks on ink plates |
| `.hb-plaque` | Award plaque with a pink diamond pinned at a corner |
| `.hb-playlist` / `.hb-track` | Video player beside a numbered track list |
| `.hb-vframe` | Video frame: the one pink border in a video section, a 16 by 9 well on the void |
| `.hb-timeline` / `.hb-tl-item` | Left pink rule entries: jobs, releases, changelog |
| `.hb-cta` / `.hb-stripes` | Closing ink band with colorless caution stripes. The pink stays on the button |
| `.hb-steps` | Bench steps strip on the tabs markup: numbered, equal width, ok badge when done (section 9) |
| `.hb-guide` | Bench guide strip on the toolbar: step name, goal, verbs (section 9) |
| `.hb-cams` / `.hb-legend` / `.hb-hud` | Stage overlays: cams top left, legend top right, hud bottom left (section 9) |
| `.hb-stagebar` | Ink strip across the top of a paper stage |
| `.hb-mat` | Materials panel rows: swatch, extruder, material, parts, role |
| `.hb-prow` | Bench param row: label column, control, paired number, unit, reset mark, then `-tags` and the `-help` sentence. The label takes its own line under 400 px. `.hb-row` keeps its list meaning |
| `.hb-welcome` | First-run card over the stage centre. `.hb-card` keeps its hover-card meaning |
| `.hb-viewport` | The stage for a 3D scene, a camera or a canvas sim: canvas fills it, hud slots on top, square under 640 px (section 10) |
| `.hb-hudstat` / `.hb-hudnote` / `.hb-vp-cover` | Hud figures (fps, frame ms), a hud hint, and the cover that says why the scene cannot show (section 10) |
| `.hb-inset` / `.hb-bubble` | Picture in picture card on a viewport; speech bubble pinned to a point in the scene (section 10) |
| `.hb-dropzone` | Drop a file or pick one. `.is-cover` spreads over a viewport while a file hovers (section 10) |
| `.hb-progress` | Download or long task: words, figure, one action, the meter; indeterminate, paused, done, failed (section 10) |
| `.hb-verdict` / `.hb-hash` / `.hb-licence` | Result tags, the SHA-256 line, the weight licence line (section 10) |
| `.hb-loader` / `.hb-models` | The model loader panel and the model list with the reason a device cannot run one (section 10) |
| `.hb-perm` | Permission and capability state: microphone, camera, webgpu adapter, storage (section 10) |
| `.hb-chat` / `.hb-msg` / `.hb-composer` | Chat transcript and composer with streaming, think text and notes (section 10) |
| `.hb-transcript` / `.hb-tseg` / `.hb-heard` | Timed transcript segments and the last line a microphone caught (section 10) |
| `.hb-wave` | Audio strip on the void: waveform or level history, label, figure, playhead (section 10) |
| `.hb-checks` / `.hb-readouts` / `.hb-gauges` | Check result table, readout grid, gauge rows (section 10) |
| `.hb-status` / `.hb-ctl` / `.hb-feeds` / `.hb-heat` | Status line, inline toolbar control, small multiples, heat table (section 10) |
| `.hb-sparks` / `.hb-spark` | Drive rows: label, sparkline with threshold and switch ticks, value, state chip; opens a larger chart (section 11) |
| `.hb-choice` / `.hb-opt` | Choice bars: score, hatched commitment, struck penalty, chance, the chosen row outlined (section 11) |
| `.hb-causal` / `.hb-cev` | Cause timeline: events newest first with the chain that led to each, filter chips, pins (section 11) |
| `.hb-caps` / `.hb-cap` | Capability panel: one row per optional feature with state, needs, size, licence, reason and one button (section 11) |

Status pills must always declare their own color. A pill inheriting paper text
onto a light panel became unreadable once; `.hb-pill` sets `color` explicitly
for exactly that reason.

### The Vue layer

Every class above has a matching Vue 3 component with the `Hb` prefix:
`HbButton` renders `.hb-btn`, `HbPanel` renders `.hb-panel`, and so on. The
components carry behavior only: v-model wiring, focus traps, keyboard
handling, ARIA state. They have no style blocks, so restyling the system
means editing `hackbuild.css`, never a component. The full API is in
`docs/components.md`. If a component needs CSS the system does not have,
grow the stylesheet and this file first.

---

## 6. Patterns

### Tool chrome

The recipe every bench tool follows, proven across the laser rigs, the radios,
and the board viewers.

1. Paper body with the halftone dot field.
2. Ink header bar, 3 px pink bottom rule, mark at about 26 px, Permanent Marker
   title with a pink span, Special Elite tagline pushed right at low opacity.
3. Nav tabs directly under the header, pink underline on the active one.
4. Content as panels on raised paper, 2 px ink borders, 5 px block shadows.
5. Any canvas, scope, waterfall or 3D view is a stage: the void, a pink offset
   shadow, cream text inside.
6. A console pinned at the bottom of the working column, newest line first.
7. Every control is Plex Mono uppercase. Every number is VT323 pink.

Keep 3D and viewer scenes brightly lit. Dark scenes that hide silkscreen have
been rejected before.

### Page and zine

Sections alternate paper and ink so the ink bands act as gaps. The hero gets the
big Permanent Marker headline, often with a solid ink block sitting behind one
word. Registration marks in the corners, diagonal pink rules, scattered
background phrases at low opacity, a large faded numeral behind each section.
Body stays under 68 characters per line and never runs more than three
paragraphs before something interactive or visual.

### Sticker and seal

Band text curving the top edge in Special Elite caps, tagline along the bottom
in Libre Baskerville italic, pink bursts at 9 and 3 o'clock, mark centered,
wordmark beneath it. The cut line is the outermost disc and the only cut line.
Every design must be a contained single shape with nothing floating, so it weeds
clean. Set all type as outlined paths so the file has zero font dependency at
the printer. Verify containment by rendering the artwork in isolation and
measuring the furthest drawn pixel against the keyline radius.

---

## 7. Voice and icons

Write lowercase UI copy, terse, no ceremony. Plain statements of what a control
does and what it costs. Name the failure mode instead of hiding it. Second
person for instructions. Short paragraphs, then show the thing working.

Never: em dashes or en dashes anywhere including code and UI strings; emoji
anywhere including log output; marketing adjectives; exclamation marks; bold and
italic scattered through prose; filler openers.

App chrome and tool panels use the square cap stroke set: inline SVG on a 24
grid, `stroke: currentColor`, `stroke-linecap: square`, `stroke-linejoin:
miter`, no fills, and one stroke width, `--hb-border` in screen px (1.5 px, 2 px
in the zine scope). `HbIcon` draws it; vanilla pages call `strokeIcon(name)` or
`strokeIconEl(name)`. Sixteen drawings are FERRULE's and ARBOR's own; the rest
are drawn in the same idiom. Marketing and prose surfaces (section 19 lists
them) may keep Font Awesome 6 solid with `set="solid"`. Never emoji, and never
an icon where a two-word label is clearer. Every icon is on the docs page
`#/icons`.

| `HbIcon` `set` | Draws |
|---|---|
| `auto` (default) | the stroke drawing when the set has the name, else the solid glyph |
| `stroke` | the stroke drawing or nothing |
| `solid` | the Font Awesome solid glyph |

A Font Awesome class string (`name="fa-solid fa-gear"`) still renders: the
baked solid glyph when there is one, else an `<i>` with those classes for the
page's own Font Awesome.

The solid set: version 1.2 bakes the real Font Awesome Free glyphs into the library:
the solid icons covering everything the shipped pages actually used
(undo, redo, folder-open and floppy-disk joined in 1.3 for the bench verbs),
plus the brand set (github, youtube, mastodon and the rest) for footers
and contact rows. `HbIcon` renders them from path data, so the icons are
pixel-identical to every existing hack.build page with no CDN and no
runtime dependency. The registry is generated by `npm run gen:icons`;
grow it there, never by hand. Full list in `docs/icons.md`.

The usage patterns, proven across every shipped page:

- Icons lead labels in buttons, never trail them.
- Icon-only actions sit in the square `.hb-iconbtn` and always carry an
  `aria-label`. On ink and in footers it goes ghost automatically.
- Decorative icons stay out of the accessibility tree.
- No icons in running prose.

```html
<link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" rel="stylesheet">
```

---

## 7b. Acceptance test

`hackbuild-kerf-replica.html` rebuilds the KERF radio shell from nothing but the
classes in this system: header with a mode switch, tab strip, toolbar, giant
dial with clickable digits and a band sticker, segmented signal meter, twelve
preset tiles, a live spectrum and waterfall on a stage with the kerf colormap,
palette picker, bookmarks, folded advanced controls, console, and a status
strip. It carries thirteen lines of tool-specific layout glue and not one
redefined token.

That file is the bar. If a new tool needs something it does not have, the system
is missing a component and this document should grow, rather than the tool
inventing a one-off.

---

## 8. Checklist before shipping an artifact

- [ ] Zero em dashes, en dashes and emoji in the whole file, including comments
- [ ] Pink is `#FE0386`, paper `#f5f0e6`, ink `#1a1a1a`
- [ ] Exactly one pink element competing for attention per view, counted by the budget table in section 2
- [ ] Text on a pink fill is ink
- [ ] The mark is the verbatim two paths through viewBox `117 103 800 800`
- [ ] `hack` in ink, dot and `build` both pink
- [ ] Four faces doing four jobs, no face outside its role
- [ ] Zero border radius except `.hb-num` and nav dots
- [ ] All shadows hard offset, no blur; a gradient only in stage lighting
- [ ] One texture, applied once, and never on a stage or a dial plate
- [ ] One panel-head style throughout, editorial or instrument, not both
- [ ] On-void text uses the lit set, not the paper signal colors
- [ ] Header holds no verbs; toolbar holds no branding; status strip holds at most one button, the whole strip
- [ ] Mobile first: base styles for a 360 px phone, wider layouts only through `min-width` queries
- [ ] Touch targets 44 px on phones and touch screens, fields 16 px there
- [ ] No horizontal scroll at 390 px
- [ ] Chrome and tool panel icons from the stroke set; Font Awesome solid only on marketing and prose
- [ ] Rendered and looked at in a real browser, not counted headlessly
- [ ] A page that opens from `file://` or runs offline loads `fonts-inline.css`, never Google Fonts
- [ ] Every failure, missing device and refused permission names itself in words (section 10)

---

## 9. Bench layer

A bench is the layout a design tool renders into: pick a step, set its
parameters in the rail, watch the part on the stage, then export. COLLAR,
BLOCKS and PIP arrived at the same layout separately. The values below are
measured from those benches; spacing reads the 4 px scale.

### Strips and regions

| Region | Surface | Holds | Class, component |
|---|---|---|---|
| header | ink, 3 px pink bottom rule, 52 to 60 px | mark, `NAME.bench` in Permanent Marker with only the dot pink (`suffix` prop), status pill, Special Elite tagline pushed right at low opacity, dropped under 900 px | `.hb-header`, HbHeader |
| steps | ink, 36 px | equal-width numbered tiles, pink underline on the current one, ok badge on done ones, the last step always the export step | `.hb-tabs.hb-steps`, HbSteps |
| guide | sunk paper, 2 px ink bottom | `STEP N NAME` in VT323 17 px pink, the goal in Special Elite 13 px, verbs at the right end | `.hb-bar.hb-guide`, HbGuide |
| main | stage (void) beside the rail (raised, 3 px ink edge, one pane per step) | | `.hb-stage`, `.hb-rail` |
| status | ink, pinned | VT323 figures on the left (dims, triangles, build ms), lit tags on the right (fits bed, mesh current, warnings) | `.hb-statusbar`, `.hb-tag.is-lit-*` |
| welcome | over the stage centre, first run only | tool name, two-line note, the steps, three starts | `.hb-welcome`, HbWelcome |

### Stage overlays

Absolute inside a relative stage, each with its own z-index. HbStageOverlay
wraps HbStage and offers the four corners and the centre, nothing else.

| Overlay | Where | Content |
|---|---|---|
| cams and modes | top left, one wrapping strip | iso, top, front, side, under, explode, xray, section, plate; translucent void buttons at 10 px; the current cam outlined in paper, never pink |
| legend | top right, VT323 15 px | slot, material, role per extruder; mode notes in the lit set |
| hud and drive pad | bottom left | stage tags, explode and open sliders, the drive pad with `touch-action:none` |
| busy | bottom right | `building` |
| welcome | centre | the welcome card on a void scrim |

### Primitives

| Primitive | Values |
|---|---|
| step tile | transparent on ink, equal flex, 3 px bottom border that goes pink on the current step, Plex 12 px .14em, 18 px numbered badge, ok fill when done |
| guide | sunk, 2 px ink bottom, Special Elite 13 px, step name VT323 17 px pink |
| instrument head | `.hb-panel-hd-inst`: VT323 19 px sentence case on a full-bleed ink bar |
| param row | flex, 96 px label column at 10 px uppercase .12em in ink 3 with the reset mark at its end once the value leaves its default, control fills the rest, 64 px paired number, 22 px unit; wraps on narrow screens |
| chip | 2 px ink border, raised; toggles fill ink when on (`.is-toggle`); pink fill only for the one primary selection of a step |
| materials row | 18 px swatch with a 2 px ink border, extruder in VT323 15 px, material, parts, role |
| status | ink, VT323; a live value is pink only when it is the focal value; good tags slime |
| welcome card | paper, 3 px ink border, `--hb-shadow-pink` while open (the stage drops to `--hb-shadow-lg` through HbStageOverlay `quiet`), at most 640 px wide, Special Elite |

Measured values off the 4 px scale and the step each one takes:

| Where | Measured | Uses |
|---|---|---|
| step tile padding | 8 x 6 px | 8 x 4 px |
| guide padding | 5 x 14 px | the toolbar's 8 x 24 px, so the guide lines up with the header |
| cam button padding | 3 x 7 px | 4 x 8 px |
| param row margin | 5 px | 4 px |
| stage overlay inset | 10 px | 12 px, the stage padding |
| welcome card padding | 18 x 22 px | 16 x 24 px |

### Interaction

| Behavior | Value |
|---|---|
| touch and commit | HbParamRow emits `touch` on each range input (preview only) and `commit` on change, on the paired number, and on select, switch and seg |
| reset | the reset mark sets the default and emits `commit` then `reset` |
| steps | arrow keys, Home and End move between steps; the strip turns into a select before a tile would clip |
| welcome | Escape or the close square dismisses it; a start emits `start` and closes it |

### Mobile

| Rule | Value |
|---|---|
| no sideways scroll | at 390, 768 and 1280 px on every step |
| tagline | dropped under 900 px |
| rail | under 640 px the app stacks the stage over the rail, the rail at 46 percent with a 3 px top border (app layout, as PIP does it) |
| cams | one strip that wraps inside the stage |
| welcome | at most the stage width less 20 px, scrolls inside, step grid two columns under 640 px |
| rows | wrap; number inputs keep `min-width:0` |
| legend | under 640 px it collapses to slot chips in the status strip (HbMaterials `variant="chips"`); never hidden outright |
| guide verbs | icon squares with an `aria-label` under 640 px; the goal sentence drops |
| steps | 11 px, .04em, padding 8 x 2 px under 640 px; never two lines |
| touch targets | 44 px: icon buttons and guide verbs under 640 px and on touch screens, ranges under 820 px and on touch screens; preset tiles 96 px |
| status strip | wraps |

### Defaults the owner may change

These were written in as defaults and stand until the owner rules.

| Item | Default |
|---|---|
| header verbs | on the guide strip; the header holds identity and state |
| shell family | one system; paper shell for every bench except board views, which use instrument density (full-bleed void, floating ink panels, VT323 heads); never CONDUYT teal or JetBrains Mono |
| tagline face | Special Elite for tool taglines in headers (`.hb-tagline.is-tool`, HbHeader `taglineKind="tool"`); Libre Baskerville italic only for "make things. break things. repeat."; offline bakes carry all five faces |
| graph rule | 32 px at 10 percent pink for new work; benches shipped with 26 px keep it until rebaked |
| chip on-state | ink fill for toggles inside a bench, pink fill only for the primary selection of a step |
| text on pink | ink |

---

## 10. AI and 3D layer

A page that runs a model or a scene in the tab: a viewport with a hud, a
model that comes from a URL or a dropped file, a permission the browser
may refuse, a chat or a transcript, timings and check results. The
hackbuild-motion, hackbuild-browser-ai and hackbuild-agents example pages,
the ai-elements web components and the dog-simulator view all built these
separately. `docs/consumers-ai-3d.md` maps each of their elements to a
class here. Spacing reads the 4 px scale.

Every class stands alone: a vanilla page gets the whole look from
`hackbuild.css` and its own markup. The Vue components add behavior only
(drag and drop, Enter to send, follow the newest line, progress words).

### Regions

| Region | Surface | Holds | Class, component |
|---|---|---|---|
| controls | the toolbar, sunk paper | inline controls: a utility label, then the field, range with its VT323 figure, or select; URL fields take the whole row | `.hb-bar`, `.hb-ctl`, `.hb-ctl.is-wide` |
| viewport | the void, pink shadow, 16 by 9, square under 640 px | the canvas, video or image filling it; hud slots | `.hb-viewport`, HbViewport |
| status line | under the controls or the viewport | one sentence in Special Elite with a square marker: ok, warn, err, info, busy | `.hb-status`, HbStatusLine |
| readouts | under the status line | label and value pairs in a grid, values VT323 ink; the label carries the source word (measured, computed, vendor, inferred) | `.hb-readouts`, HbReadouts |
| rail | raised panels beside or under the viewport | loader, permissions, gauges, transcript, audio | `.hb-panel` with one head style |

### Viewport slots

The viewport reuses the stage overlay corners (section 9) and adds a bottom
band and a cover.

| Slot | Where | Content |
|---|---|---|
| top left | `.hb-ov-tl` | the inset: eye view, depth map, mask |
| top right | `.hb-ov-tr` | hud stats: fps, frame ms, inference ms; they stack under a 560 px wide viewport |
| bottom left, right | `.hb-ov-bl`, `.hb-ov-br` | hud notes, a busy readout |
| bottom band | `.hb-ov-b` | the scene verbs as a wrapping row of buttons; one ink primary, the rest secondary |
| centre | `.hb-ov-c` | a card that needs the scene behind it |
| cover | `.hb-vp-cover` | loading, waiting for a file, no adapter: a marker title, a Special Elite note in lit label or lit error, and a spinner or a progress |
| bubble | `.hb-bubble`, placed by the page in px | speech or a thought over a point in the scene; `.is-ink` for the second speaker |
| file cover | `.hb-dropzone.is-cover` | hidden until a file hovers the viewport |

The scene draws its own background and stays brightly lit (section 6). Hud
plates are void at 80 percent so they read on a light or a dark scene. No
texture inside the viewport.

### Primitives

| Primitive | Values |
|---|---|
| hud stat | VT323 16 px, key in lit label caps, figure paper, unit lit label 13 px; lit warn on a missed frame budget, lit error on a stall |
| inset | `--hb-inset-w` 320 px, at most 46 percent of the viewport (44 under 560 px); VT323 15 px head on ink with the quieter value at the right |
| drop zone | sunk paper, 2 px dashed ink 4, Special Elite 13 px; the pick button is a secondary small button; dashes go pink only while a file hovers |
| progress | words in Plex 11.5 px, the percent in VT323 18 px, one action; the meter is the ink track; indeterminate is a 30 percent block stepping across, still under reduced motion; paused ink 4, done slime, failed lit error |
| hash | Plex 12 px hex cut with an ellipsis, then a verdict: hashing, not hashed, no known hash (warn), matches (pass), does not match (fail) |
| licence line | 4 px ink rule on sunk paper, Plex 11.5 px: what it covers, the licence in bold, the commercial terms; the rule goes warn when commercial use is not allowed |
| verdict | Plex 10 px caps, 1 px outline in the signal color; dashed for not run, a blinking square for running; the lit set on ink and the void |
| model row | name in Plex 700, size with its source word and the devices, licence, then the reason in Special Elite warn when this device cannot run it; the chosen row takes a 4 px ink rule |
| permission | raised paper, 6 px left rule in the state color (ok, info for not asked, err for blocked, warn for missing), icon, name in Plex caps, a verdict, the reason in Special Elite, one action |
| chat | messages in Special Elite 14 px; the person's turns ink plates on the right, the model's paper on the left, notes dashed; role in Plex 10 px caps; think text folded; streaming ends in a blinking ink block; composer on sunk paper, Enter sends, Shift Enter adds a line |
| transcript | `start to end` in VT323 16 px, words in Special Elite; the segment playing now takes an ink rule and a pink time; a partial line stays ink 3 |
| heard | VT323 19 px on sunk paper, the empty text from `data-empty` |
| audio strip | `--hb-wave-h` 72 px of void, 2 px ink border, no pink shadow; the trace is data and may be pink; paper playhead; dimmed when the source is off |
| gauge row | 96 px label column, an ink bar on a sunk track, VT323 figure; the current row bold with the one pink bar |
| check table | `.hb-table` with a summary in VT323 above; failed rows take a 4 px error rule on the id cell; the reason in words; the figure carries its source word |
| heat table | each cell sets `--v` from 0 to 1, ink mixed into raised paper; `.is-hi` flips the figure to paper |

### Copy

Copy follows section 7 and names the failure. The consumer pages already
write it this way, and the components build their words the same way:

| State | Words |
|---|---|
| download, total known | `42 percent, 7.4 of 17.7 MB` |
| download, total unknown | `0.2 MB, total unknown` |
| download, failed | `download failed.` then the error |
| no adapter | `no webgpu adapter. this model needs it.` |
| no isolation | `the page is not cross origin isolated` |
| hash mismatch | `sha-256 3f9a0c21b7e4 does not match the known 9b1e77d0a2c4. the file was not used.` |
| licence | `weights CC-BY-NC-4.0, no commercial use.` |
| chat stopped | `stopped.`, `cut at the token limit.`, `no model loaded. pick one first.` |
| api key | `stays in this tab, never stored`, shown as its first and last 4 characters |

### Mobile

| Rule | Value |
|---|---|
| viewport | square under 640 px (`--hb-vp-ratio-sm`), at most 62vh; hud stats stack and the bottom band shrinks under 560 px of viewport width |
| hud notes | dropped under 640 px |
| controls | each inline control takes its own row under 640 px |
| readouts | one column under 640 px |
| permission | the action stays beside the name; the reason wraps under both |
| chat | messages take the full width under 640 px |
| tables | scroll inside their panel, never the page |

### Defaults the owner may change

| Item | Default |
|---|---|
| dark or low light | none. This file defines no dark palette, so the layer ships none; a consumer theme switch drops to the paper system |
| viewport aspect | 16 by 9, square under 640 px |
| focal pink in a model view | the running download |
| chat faces | Special Elite for both speakers; code in a reply stays a `pre` block |
| fonts for offline pages | `fonts-inline.css`, latin subset only |

---

## 11. Minds and capabilities

A page that shows an agent thinking: what it wants, what it weighed, why
it acted, and what the page can turn on. The dog-simulator minds tab and
its capability drawer set the shape (`web-ai-knowledge`
`research/dog-sim-ux.md` sections 3 and 5); any page that logs drives or
loads optional models uses the same four pieces. Every class stands alone
for vanilla pages (`playground/minds-static.html`); the Vue components add
the words, the trend, the keyboard and the live region.

| Piece | Class | Component |
|---|---|---|
| drive rows | `.hb-sparks` of `.hb-spark` | HbSparkRows |
| choice bars | `.hb-choice`, `.hb-choice-list` of `.hb-opt` | HbChoiceBars |
| cause timeline | `.hb-causal`, `.hb-causal-list` of `.hb-cev` | HbCausalLog |
| capability panel | `.hb-caps`, `.hb-caps-list` of `.hb-cap` | HbCapabilities |
| rate limited live region | `.hb-sr` with `aria-live="polite"` | useLiveAnnounce |

### Primitives

| Primitive | Values |
|---|---|
| spark row | label 72 px (96 from 641), inline SVG polyline in ink 1.5 px on sunk paper `--hb-spark-h` tall, a dashed ink 3 rule at the threshold, ink 3 ticks along the foot where the agent switched, VT323 17 px value, a 10 px caps chip: the trend word (`rising`, `falling`, `steady` dashed) or `over 0.70` filled ink. The chip sits under the label on a phone and in its own 84 px column from 641 px |
| larger chart | the same series `--hb-spark-big-h` tall, ticks full height, `2 minutes ago` and `now 0.42` in VT323 under it, the sentence in Special Elite |
| choice row | label column sized to the longest label up to 40 percent (one subgrid, so bars line up), bar 12 px on sunk paper: base score ink 2 (ink on the top scoring row), commitment hatched ink on paper, repeat penalty an outlined struck segment; score VT323 ink 3, chance VT323 ink |
| chosen row | 4 px ink left rule, sunk paper, `*` after the label, the base bar pink; `.hb-choice.is-quiet` draws it ink |
| zero row | ink 4 text |
| why and meta | the reason in Special Elite 13.5 px above the bars; the dials (temperature, commitment, next look) in Plex 11 px ink 3 below |
| timeline event | VT323 16 px stamp, agent in Plex 10 px caps ink, kind icon and word ink 3, the text in Special Elite 13.5 px; the chain indented on a 2 px dashed ink 4 rule, oldest first, Plex 11.5 px, at most three links |
| kind icons | sense `eye` (or `wind`, `ear-listen`), choice `code-branch`, act `paw`, model `brain`, reward `heart`, cue `comment` |
| filters | `.hb-chip.is-toggle`, flat, one group for agents and one for kinds, all on at first; on means shown |
| pin | a 44 px square, `thumbtack` in ink 4; pressed fills ink. Pinned events leave the flow and sit in a `pinned` group at the top with a 4 px ink rule and sunk paper |
| group heads | ink bar, Plex 10 px caps paper, sticky inside the scrolling list |
| capability row | raised paper, 2 px ink, 6 px left rule in the state color; name in Plex 11 px caps with an icon and a verdict; one `.hb-btn-2` small button; needs as flat sunk chips (`webgpu`, `microphone`, `camera`, a model, the size with its source word); a missing need struck through in warn with `missing:` for screen readers; the reason in Special Elite warn (err when failed); the dependency line in ink; the consent line in ink 2; the progress while loading; the licence line |
| summary | `2 of 9 on` in VT323 18 px over the rows |

### States of a capability

| State | Left rule | Verdict | Button |
|---|---|---|---|
| off | ink 4 | `off`, dashed | the action: `load and turn on`, `download and turn on`, `allow the microphone` |
| loading | ink | `loading 42 percent`, blinking | `cancel`; the progress under the needs |
| on | ok | `on` | `turn off`, or none when it cannot be turned off here |
| failed | err | `failed` | `try again`; the error named beside it |
| unavailable | warn | `cannot run here` | the action, disabled, `aria-describedby` the reason |

A row the device cannot run stays in the list, so people learn it exists.
A dependent row names its parent and says the button does both: `needs dog
cortex, small (about 320 MB). the button turns on both.` A permission row
says what is asked before the browser asks.

### Pink budget

| View | The one pink |
|---|---|
| minds | the chosen bar of the agent the view is about; the second agent's bars are `quiet`, every sparkline stays ink. Use `current` on a spark row only in a view with no choice bars |
| capability panel | the running download; a second download is paper (`is-quiet`); `quiet` on HbCapabilities when the panel shares a view with a chosen bar |
| timeline | none; rules, pins and filters are ink |
| a view switch | `.hb-seg.is-toggle`, ink when on, so the agent switch never competes |

### Accessibility

| Rule | Value |
|---|---|
| rows | spark rows, choice rows and events each carry one `.hb-sr` sentence and hide their visual parts: `hunger 0.42, falling over 30 s, under the 0.70 mark`, `fetch, score 0.86, chance 71 percent, commitment bonus 0.12, chosen`, `1:04.3, dog, choice: chase, after saw squirrel at 6.1 m` |
| trend word | from the change over the last 60 samples: past 4 percent of the range is rising or falling |
| live region | polite, rate limited by `useLiveAnnounce`: one message per 4 s at most for drive crossings and choices, 8 s for the timeline, 3 s for capability changes; the newest waiting message wins, a repeat is dropped. A vanilla page keeps the same gap |
| progress in a panel | HbProgress `live=false` inside the capability panel, so the percent is not read on every step; the row verdict and the meter's `aria-valuetext` carry it |
| keyboard | a spark row is a button with `aria-expanded` and `aria-controls`; filter chips and pins use `aria-pressed`; the timeline list is a focusable region that scrolls; tabs move with the arrow keys, Home and End |

### Mobile

| Rule | Value |
|---|---|
| spark rows | 44 px tall, the chip under the label; a tap opens the larger chart |
| choice labels | wrap to two lines on a phone, cut with an ellipsis from 641 px |
| timeline | scrolls inside its own frame up to `--hb-log-h`, never the page; the chain wraps under its stamp; the pin is a 44 px square, 32 px with a fine pointer from 641 px |
| capability row | the button drops under the name until the panel is 420 px wide (a container query), then sits beside it |
| two agents | a `.hb-seg.is-toggle` switch on a phone, two columns from 901 px (page layout) |

### Defaults the owner may change

| Item | Default |
|---|---|
| history window | 120 s at 2 Hz, 240 samples |
| threshold mark | 0.7, where the dog simulator writes a memory |
| commitment drawing | hatched, beside the base score |
| timeline depth | three cause links, 60 events after the pins |


## 12. Vanilla behaviour

`@virgilvox/hackbuild-ui/vanilla` is the kit behaviour as plain functions
over the classes, for pages with no framework. It imports nothing. Each
function takes markup that already carries the classes and returns a
handle whose `dispose()` removes every listener it added. The Vue
composables call the same functions, and so do `HbTabs`, `HbDrawer`,
`HbModal`, `HbDropdown` and `HbDropzone`.

| Function | Markup | Behaviour |
|---|---|---|
| `tabs(el)` | `.hb-tabs` of `role="tab"` buttons | one tab in the tab order; arrows select with wrap, Home and End; `aria-controls` panels shown and hidden |
| `modal(el)` | `.hb-modal > .hb-panel` | focus in, Tab trap, Escape, scrim click, `data-hb-close`, focus back to the opener, scroll lock |
| `drawer(el, {side, size})` | `.hb-drawer > .hb-drawer-panel` | the modal rules; `size: 'md'` or `'lg'` sets `.is-md` or `.is-lg`; `side: 'left'` sets `.is-left`, `side: 'bottom'` sets `.is-sheet`, and opening a sheet closes any other open sheet; `side: 'auto'` is the sheet under `breakpoint` (761 px) and the right drawer from it, live, so a consumer never reads matchMedia for it |
| `menu(wrap)` | `.hb-menu-wrap`, trigger, `.hb-menu` | arrows with wrap, Home, End, a letter jumps, Escape returns focus, a press outside closes; `onToggle` reports open and close |
| `dropRoutes(target, routes)` | optional `.hb-dropzone.is-cover` overlay | files routed by type, one call per route, the rest rejected; a dropped folder is walked; `paste: true` routes pasted files; `.is-over`, `.is-reject` and `data-route` while a file hovers |
| `hotkeys(table)` | none | scopes, ignores typing in fields, `ctrl` reads cmd on a Mac, `list()` feeds a key map |
| `persisted(key, initial)` | none | localStorage with a version key, migrate or drop old records, follows other tabs |
| `confirmInline(btn)` | a `.hb-btn` | first press arms `.hb-btn-danger` with keep beside it, second press runs |
| `confirmDialog({el})` | `.hb-modal` with `data-hb-confirm` parts | one promise dialog at a time, focus on cancel for danger |
| `undoStack(limit)` | none | snapshot undo and redo, 80 steps by default |
| `activity()` | none | tasks oldest first, a delay that hides fast work, failures kept with their message |
| `copier()` | none | copy with idle, copied and failed states |
| `activityLine(el, store)` | `.hb-activity` with `-label`, `-more`, `-line > -fill` | draws the oldest task, its percent and the count of the rest; hidden while idle |
| `searchList(input, list)` | a field over `role="option"` items, optional `role="group"` sections | the combobox pattern: typing hides what does not match, up and down move the active item with wrap, Enter picks, Escape clears a query first |
| `palette(el, {registry})` | `.hb-modal.hb-palette > .hb-panel` with an `input` and `.hb-palette-list` | `/` and ctrl+k open it, focus in the cleared field, `searchList` inside, Enter runs and closes, Escape clears then closes, focus returns |
| `keyMap(el, registry)` | none, it writes `.hb-keymap` | prints the registry's groups with each combo in `.hb-kbd` and follows changes |
| `chipGroup(el, {multi})` | chips with `data-value`, optional `data-key` | single: a radiogroup with arrows and one tab stop; multi: aria-pressed toggles; the empty value is the off chip; letters bound in a registry |
| `toolRail(el, {registry})` | `.hb-toolrail` of buttons with `data-tool`, `data-key`, `data-hint` | one tool pressed, arrows along the rail, letters bound from the same buttons, `.hb-toolrail-hint` shows the current gesture |
| `toggleRow(el)` | `.hb-togrow` button | the row is the switch: aria-checked and `.is-on` flip on a press |

Escape acts on the newest open overlay only. A widget that takes a key
with `preventDefault` wins over the overlay, and the overlay wins over a
hotkey, because hotkeys listen on the window. A modal that is not
closable, or has `closeOnEscape` off, still holds Escape while it is the
newest: the key closes nothing and never falls to the drawer beneath.

The window drop cover is `.hb-dropzone.is-cover.is-window`: fixed over the
viewport, pink dashes for a type a route takes, ink dashes with
`.is-reject` for one no route takes.

A `.hb-btn` with the `hidden` attribute is hidden; the class sets `display`,
which would otherwise outrank the attribute.

## 13. Suite shell

The parts of the suite header and its navigation. Section 2.1 of the
suite design sets the strips; these are the parts that fill them.

| Part | Classes | Behaviour |
|---|---|---|
| `HbSuiteNav` | `.hb-suitenav`, `-groups`, `-tools`, `-btn`, `-sheet`, `-opt` | groups as tabs on ink and the group's tools as chips in the toolbar row from 761 px of the nav's own width (a container query); below that one 44 px "group / tool" button opens the grouped list in a bottom sheet with a search field, and the toolbar row collapses unless the `toolbar` slot fills it. A group tab returns to the last tool used in it. `keys` binds alt+1 to alt+9 and `[` `]` |
| `HbWorkspaceMenu` | `.hb-wsmenu`, `-btn`, `-menu`, `-sheet` | the workspace name opens a menu of new, open, rename, duplicate, export, import, delete; the level is a segmented toggle from 641 px. Below 641 px one menu button opens a sheet with a level button that cycles. `busy` disables every action and shows why |
| `HbPills` | `.hb-pills`, `.hb-pills-dots`, `.hb-dot` | one pill per subsystem, off, load, ok, warn, err. A pill with `goto` is a button. Below 641 px one 44 px button of dots, with a ready count from 360 px, opens `HbStatusList` in a sheet |
| `HbStatusList` | `.hb-statuslist` | one 44 px line per subsystem: state in words and what it means now, the fallback named |
| `HbActivity` | `.hb-activity`, `.hb-activity-line` | the oldest task, its percent, `+n` for the rest; a 2 px line on the header's bottom edge fills for a known fraction and slides for an unknown one. A press lists the tasks with cancel. Below 641 px only the spinner and percent |

Pink stays with the group tab: the current tool chip is ink, the level
toggle is paper when on, and pills on ink take the lit colours. The
header is `position: relative` so the activity line sits on its edge.
Menu items are 44 px tall on a coarse pointer.

## 14. Keys and choices

| Part | Classes | Behaviour |
|---|---|---|
| `HbPalette` | `.hb-palette`, `-field`, `-list`, `-item`, `-foot` | tools, models, documents and commands in sections; opens on `/` and ctrl+k; the active item is pink; the foot teaches the keys and hides on a touch screen |
| `HbKeyMap` | `.hb-keymap` | the shared hotkey registry printed by group; ctrl reads cmd on a Mac; `scopes` narrows to one tool and the shell |
| `HbToolRail` | `.hb-toolrail`, `-btn`, `-key`, `-hint` | 44 px icon buttons from `{id, label, icon, key, hint}`; the letter is printed in the corner and bound from the same data; the tool that is on fills ink; letters hide on a coarse pointer |
| `HbChipGroup` | `.hb-chipgroup`, `.hb-chip-off`, `.hb-chip-key` | one on or several on; the off chip is dashed and turns warn when chosen |
| `HbToggleRow` | `.hb-togrow`, `-label`, `-why`, `-sw` | label, one line of why and the switch as one 44 px button with role switch |

Every printed key comes from a `hotkeys` registry, never typed by hand,
so the hint and the binding cannot drift apart.

## 15. Logs, code and export

| Part | Classes | Behaviour |
|---|---|---|
| `HbEventLog` | `.hb-evlog`, `-head`, `-filters`, `-rows`, `-row`, `-tag`, `-t`, `-text`, `-bar` | one timeline for speech, actions, failures, perception and loads. A 38 px tag column in the readout face, one tone per kind (`is-pink`, `is-info`, `is-ok`, `is-warn`, `is-err`, `is-dim`). A live row is replaced in place under its key, with a 90 px bar when the total is known. A chip per kind hides or shows it. Follow keeps the newest row in view; scrolling up turns it off and new rows wait behind a jump button. Capped at 160 rows |
| `HbCodeBlock` | `.hb-codeblock`, `-head`, `-lang`, `-btn`, `.is-wrap` | code as plain text on ink, no highlighter. Copy says copied or copy failed; wrap folds long lines. The `pre` takes focus so arrow keys scroll it. Buttons are 44 px on a coarse pointer |
| `HbHow` | `.hb-how`, `-pkgs`, `-install`, `-code`, `-links`, `-note` | the "how this works" fold at the foot of a tool: package names, the npm line, and while nothing is published a second line that says it works today, the minimal code, copy, the package page and source |
| `HbExportPanel` | `.hb-export`, `-formats`, `-name`, `-ext`, `-btns`, `-readout`, `-checks` | format chips with a note for the chosen one, the file name with its extension shown beside it, export and copy, a two column readout and checks tagged ok, warn, err. Local only files are named and left out unless the row is switched on. `busy` refuses with the reason |

Vanilla: `eventLog(el)` with `push(kind, text, t)`, `live(key, text, fraction)`,
`hide(kinds)` and `follow(on)`; `codeBlock(el)`; `exportName(parts)` for a
file name that carries the run (`tool_model_seed_20261124-010344`),
`withExt(name, ext)` and `saveFile(name, data, type)`.

The export button is ink; the chosen format chip is ink. Pink stays with
the live bar and the `me` tag.

## 16. Settings

| Part | Classes | Behaviour |
|---|---|---|
| `HbSettingsForm` | `.hb-setform`, `-sec`, `-head`, `-note`, `-foot`, `-more`, `-end` | sections from a schema `{key, type, label, why, tag, applies, default, level, section}`, one `HbParamRow` per key. Every control has its sentence under it; `tag` and `applies` print beside it. Reset per row (the mark), per section ("reset this section") and for all. Rows above the disclosure level are hidden and counted: "2 more from expert up" |
| `HbPresetChips` | `.hb-presets`, `-row`, `-hint` | one press sets every value a preset names; the chip whose values all hold is pressed and its hint shows, else the row reads custom |
| `HbParamRow` | `.hb-prow-tag`, `.hb-prow-tag.is-applies`, `.hb-prow-help` | `help`, `tag`, `applies`, and a `text` type. The range drag previews (`touch`), release, a key or a typed number commits (`commit`) |
| `HbSlider` | `.hb-slider` | v-model follows the drag; `commit` fires on release or a key |
| `HbSwitch` | `.hb-switch` | the button is the hit box and the track is drawn inside it: 42 by 22 with a fine pointer, 44 by 44 on a coarse one, same track |
| `HbField` | `.hb-field-head`, `.hb-field-foot`, `.hb-field-count` | `tag` beside the label; `count` and `max` print a counter that turns err past max |

On a coarse pointer every param row is 44 px tall and its reset mark,
number box, select and seg buttons are 44 px targets.

Vanilla: `rangeRow(el)` binds a range and its number box (preview on
input, commit on change, typed numbers clamped to the step);
`shownAt`, `defaultsOf`, `changedKeys`, `resetValues`, `sectionsOf` and
`matchPreset` work on the schema for pages with no framework.

## 17. Models

Since 0.10.0 the parts in this section are on their way out: HbModelSelect
and HbModelSheet (section 20) replace HbModelList, HbModelManager,
HbModelRack, HbModelSlot, HbEngineBar, HbTierCards, HbCapabilities,
HbCustomModelForm, HbMethodCard, HbLoader, HbHash and HbReasons. Each logs
a note naming its replacement and goes in 0.11.0.

The parts take plain records shaped like a model library record (label,
badge, group, note, `sizeMB` with `sizeSource`, params, quant, `vramMB`
with its source, censorship, tags, tier, licence, commercial, notes, ctx)
and a fit `{fit, ok, reason}` per id. The kit never imports the library.

| Part | Classes | Behaviour |
|---|---|---|
| `HbModelList` | `.hb-modellist`, `-tools`, `-search`, `.hb-model-gh`, `.hb-model-pick`, `-badge`, `-def`, `-note`, `-meta`, `-cens`, `-fit`, `-tag`, `-state`, `-acts`, `-why`, `-detail`, `-facts`, `-ctx`, `-legend`, `-echo` | search on every width, censorship chips with an any chip, an "only what fits here" toggle row; groups with sticky ink heads, rows by size; each row one radio: the label, the owner's badge, the note, size and vram each with a source word, censorship tag, fit chip, tags, the state word. The action names the size: `download 1.7 GB`, then cancel, load and remove (in place confirm), unload, try again. A row this machine cannot run stays listed, off, with the reason. The chosen row opens its fact line and context sizes; sizes over the build limit are disabled. `tiers` variant: an icon slot and an ink bar from the tier. The line under the list echoes the pick |
| `HbProgress` | `.hb-progress-files`, `-file`, `-fileamt` | `phase` (fetch, download, cache, compile, warm, ready, error) and `files`: one summed bar, `downloading 3 of 24 files, 412 of 2200 MB`; the percent shows only when every file states a total; compile and warm move the bar without a number; file rows fold under it |
| `HbCapabilities` | `.hb-caps-machine`, `.hb-cap-speed`, `.hb-cap-mark`, `.hb-cap-without`, `.hb-cap-act2` | the machine in one line; a speed chip (fast ok, ok ink, slow warn, n/a dashed); `current` and `stored` marks; "without it:" line; `unload` frees memory and keeps the weights |
| `HbReasons` | `.hb-reasons`, `.hb-reason`, `-label`, `-value`, `-why`, `-edit` | one row per default: value, why, edit; a changed row reads `your choice` |
| `HbLicence` | `.hb-licence-q` | optional: empty renders nothing. `quiet` is one line, `licence as recorded: ...`. Nothing is gated on a licence |
| `HbLoader` | | the button names the size (`load 100 MB`); the licence is the quiet line |

Pink stays with the running download bar. Fit chips, censorship tags and
the chosen row are ink, ok, warn or err. Every target is 44 px on a coarse
pointer, context chips included.

Vanilla: `modelList(el, {value, onChange, search, empty})` is the picker
keys: a radiogroup of `[data-model]` radios, one in the tab order with its
row's `[data-act]` buttons, arrows skip rows marked aria-disabled, a search
field filters by `data-search`. Words: `sizeText`, `vramText`,
`factLine`, `licenceText`, `loadText`, `sumFiles`, `ctxOptions`; data:
`groupRecords`, `filterRecords`, `CENSORSHIP`, `RESPONSIBILITY`.

### Rack, engine bar, manager

| Part | Classes | Behaviour |
|---|---|---|
| `HbModelSlot` | `.hb-slot`, `-in`, `-id`, `-name`, `-role`, `-mid`, `-row`, `-pick`, `-meta`, `-bar`, `-fault`, `-stat`, `-sq` | one organ: name and role, a select whose options carry their size (an option this machine cannot run is disabled with the reason), a load button that names the size, `required` or `optional` with the size and source word, its own bar, a status square: empty, loading with the percent, ready, fault with the message. The 6 px left rule carries the state. From 640 px of slot width the three mortise columns, stacked below |
| `HbModelRack` | `.hb-rack`, `-presets`, `-plabel`, `-pnote`, `-slots`, `-gate` | presets named by weight class, each button stating the summed download with the weakest source word (`laptop, 767 MB (inferred)`); a preset fills the slots it names and the rack loads the missing ones one after another; a fault marks one row and the queue moves on; a pick no catalogue record carries is never hidden: its slot names it (`slotMissing`) with remove, which clears the pick and emits `remove(slot)`; the gate line names the required slots not ready, and a `gate` slot gets `ready` for the wake button |
| `HbEngineBar` | `.hb-engine`, `-dot`, `-text`, `-model`, `-facts`, `-shared`, `-bar`, `-acts` | the picker after a pick: `no model. pick one.`, `<model> stored. press load.` with `load 1.7 GB`, downloading and loading with cancel, loaded with device, rate and `shared with:`, fault with the error; change always |
| `HbModelManager` | `.hb-mm`, `-sec`, `-hd`, `-n`, `-sub`, `-storage`, `-line`, `-policy`, `-list`, `-item`, `-acts` | the drawer contents in four numbered sections: this machine (reasons), by job (the rack slot), catalogue (HbModelList with actions and the custom slot), stored and loaded: the storage line with keep, in memory with unload, stored weights grouped by keeper (the weight store, webllm) with remove on a second press |

Vanilla: `rackQueue(load)` loads one slot at a time, `presetJobs`,
`presetText`, `rackGate(slots, states)` and `storageText(estimate)`:
`1.9 GB of 12 GB used here. the browser may clear it. press keep to ask it not to.`

### Wake gate, tiers, key, custom model

| Part | Classes | Behaviour |
|---|---|---|
| `HbWakeGate` | `.hb-wake`, `-scrim`, `-head`, `-body`, `-title`, `-lede`, `-rows`, `-row`, `-label`, `-bar`, `-note`, `-gnote`, `-acts`, `-err` | one press is the audio gesture and starts every load; one row per subsystem with label, 12 px bar and note: pink loading, slime ready, red failed, paper off; a required row carries a star. An optional row that fails marks its row and pill and the rest goes on; a required row that fails writes the failure line and both buttons come back. The note under the picker is built from size, origin and quota. `overlay` pins it over the page and focuses wake |
| `HbTierCards` | `.hb-tiers`, `-list`, `-foot`, `-echo`, `.hb-tier`, `-pick`, `-icon`, `-main`, `-head`, `-name`, `-size`, `-sub`, `-terms`, `-note`, `-bar`, `-why`, `-body` | a radiogroup of cards (arrows, Home, End): name, size badge, the engine, cost and privacy, one sentence, a capability bar; a tier this machine cannot run is dashed with the reason. The body slot opens under the picked card only, where the remote tier asks for its key. The footer echoes the pick; start waits on a pick and `canStart` |
| `HbApiKey` | `.hb-apikey`, `-row`, `-mask`, `-state`, `-note` | password field, checked by shape: `enter your key to continue.`, `waiting for a valid key.`, `key looks valid.`; the readout shows the first 4 and last 4; the note by the field says the key stays in this browser, is never saved and goes only to the endpoint picked. The part writes the key nowhere |
| `HbCustomModelForm` | `.hb-cmf`, `-runtime`, `-caveat`, `-fields`, `-check`, `-check-out`, `-check-lines`, `-acts`, `-saved`, `-chips`, `-chip`, `-chip-name`, `-chip-mode`, `-chip-x` | four ways in as chips: onnx repo, mlc weights plus .wasm (base model reuse or a url), gguf repo plus file, your endpoint. Every field names the way it fails; errors show after blur or a press. Check costs one request and reports files and the measured size; saved entries are chips, press to pick, x to remove. Sits in the `custom` slot of `HbModelManager` |
| `HbPermission` | `.hb-perm-acts`, `.hb-perm-still`, `-still-hd` | `alt` is the working alternative as a second button; `stillWorks` lists what runs without it |
| `HbToaster` | `.hb-toasts`, `.hb-toast.is-ok`, `.is-warn`, `.is-err`, `.is-held`, `.hb-toast-msg`, `.hb-toast-act` | one transient toast, the rule coloured by kind, one action; errors are held above it until ok is pressed, three at most; the store calls setTimeout unbound, so it runs in Chrome |
| `HbCallout` | `.hb-callout-title`, `.hb-callout-acts` | a short head and an actions slot for inline fixes; err is announced as an alert |

Vanilla: `gateNote`, `wakePills`, `wakeSummary`, `wakeBar`, `wakeError`;
`maskKey`, `keyCheck`, `KEY_NOTE`; `CUSTOM_MODES`, `customFields`,
`customErrors`, `customId`, `deriveId`, `checkText`; `toastStore`.

### Chat: message, think, tool call, context, chats

| Part | Classes | Behaviour |
|---|---|---|
| `HbChat` | `.hb-chat-hd`, `-title`, `-hd-acts`, `-empty`, `-empty-text`, `-examples`, `.hb-chat-key > .hb-apikey` | header with clear, export, import; messages through `HbMessage` or the `message` slot; example chips in the empty state; the `above` slot holds the context meter. One primary button reads send, then stop while a reply streams; Escape stops. Enter sends on a fine pointer; on a coarse pointer Enter adds a line and the button sends (ctrl or cmd Enter sends on both); IME composition is respected. Up in an empty composer edits the last turn. The composer grows from 44 to 200 px. The log follows new text only when pinned within 80 px of the bottom, and always after a send |
| `HbMessage` | `.hb-msg-name`, `-stats`, `-parts`, `-pending`, `-tools`, `-err`, `-seen`, `-used`, `-used-item`, `-used-score`, `-acts`, `-act`, `-edit` | the who line carries the stats strip with its source word; think fold; the pending line names what the turn waits on; tool cards; the reply, split on blank lines into at most 5 boxes when `split` (text past the cap joins the last box); the error card in the turn with its fix; `seen:`; `memory used (n)` with scores that emit `recall`. Actions: speak, redo, remember (opt in through `actions`; emits `remember`, reads `in memory` with `remembered`; `HbChat` forwards it with the line index), copy (reads copied for a second), delete (asks twice in place), edit on your own turns (ctrl Enter sends the edit, Escape backs out). The row hides while the turn streams |
| `HbThink` | `.hb-think.is-plan`, `.is-memory`, `.is-live` | open while `streaming`, summary `thinking...`; closed after, `reasoning (n chars)`. Plan and working memory tags use the same fold in amber and slime |
| `HbToolCall` | `.hb-tool`, `-row`, `-caret`, `-name`, `-args`, `-state`, `-body`, `-label`, `-pre`, `.is-chip` | one line when finished: name, arguments cut at 80, calling, ok or error with the time; open with its arguments while running; result cut at 1200; `restored` says the result was in the history |
| `HbContextMeter` | `.hb-ctxmeter`, `-hd`, `-label`, `-words`, `-bar`, `-legend`, `-banner`, `-pill`, `.hb-ctxmeter-p0` to `-p5` | stacked bar on the void by source with a counted legend, amber from 75 percent; at 95 percent the banner says the context is full with new chat and drop oldest turns. The pill reads `ctx 37%` for a header |
| `HbConversationList` | `.hb-convs`, `-hd`, `-new`, `-list`, `-item`, `-open`, `-title`, `-meta`, `-rename`, `-acts`, `-act`, `-foot`, `-note`, `-empty` | the chats rail, or any saved list with `noun` (document, sketch): every label reads from it. New at the head; rows newest first with kind, when and how many messages, each left out when absent; `creatable`, `duplicable`, `exportable`, `importable` hide their buttons; 44 px rows and buttons on a coarse pointer; rename in place, duplicate, delete on a second press; the row actions are always drawn, never behind a hover, and lift to ink while focus is in the row; Up and Down move between chats, F2 renames, Delete arms delete (`listRowKey`); export and import at the foot with where chats live |

Vanilla: `splitParts`, `statsText`, `clip`, `argsLine`, `argsBlock`,
`TOOL_WORDS`, `composerKey`, `coarsePointer`, `autosize`, `pinned`,
`contextUse`, `relTime`.

### Memory and voice: memory panel, memory item, recall trace, mic button

| Part | Classes | Behaviour |
|---|---|---|
| `HbMemoryPanel` | `.hb-mempanel`, `-sec`, `-hd`, `-counts`, `-line`, `-store`, `-row`, `-list`, `-empty`, `-foot`, `-wipe` | one surface: the count line by kind doubles as a legend; the storage line with keep (emits `persist`); a search box that emits `search` 250 ms after typing so the page runs the same ranker the chat uses, with the search mode under it; kind chips filter; last reply used; add a note (ctrl Enter adds); the typed list with edit and forget; export, import a json file, erase all on a second press. `readonly` drops add, edit, forget, import and erase. Each entry's `pinned` reaches its row, and the row's pin emits `pin(id, next)` |
| `HbMemoryItem` | `.hb-mem`, `-body`, `-pin`, `-kind`, `-score`, `-title`, `-text`, `-ent`, `-when`, `-edit`, `-acts`, `-act`, `.is-used`, `.is-pinned`, `.is-armed`, `.is-on` | `pinned` shows a pin word before the kind and an ink rule on the left; the pin action emits `pin` with the next state; the kind chip carries the recall score (`rule 1.03`); entity chips after the text; edit in place (ctrl Enter saves, Escape backs out, focus returns to edit); forget reads `forget?` for 3 s and acts on the second press |
| `HbRecallTrace` | `.hb-recall`, `-hd`, `-q`, `-line`, `-weights`, `-list`, `-hit`, `-top`, `-kind`, `-mark`, `-text`, `-bars`, `-k`, `-bar`, `-v`, `.is-used`, `.is-final` | on the void: the query, `n candidates scored, top k used.` and how they were scored; every candidate with a bar per part and the final bar; used hits lit with a slime rule, the rest dimmed. With `weights` the final is the weighted mean and `tunable` adds a slider per weight that redraws the order |
| `HbMicButton` | `.hb-mic`, `-btn`, `-level`, `-note`, `.is-off`, `.is-asking`, `.is-listening`, `.is-hearing`, `.is-blocked`, `.is-unsupported`, `.is-hold` | a 44 px square: pink while it takes input with the level along its foot, dashed while the browser asks, struck through when blocked or missing with a line that names the way around (`type instead`). `hold` is push to talk on the pointer, Space or Enter. `listen` runs the browser's recognition through `micInput`: interim and final words, a restart 150 ms after the browser ends a session, results dropped while `speaking` and for `tailMs` after |

Vanilla: `memoryCounts`, `kindWord`, `scoreText`, `memoryMatch` (keyword
stub for demos and stores with no ranker), `recallScore`, `recallRank`,
`recallLine`; `micInput`, `micLive`, `MIC_WORDS`.

### Transcription: level rail, queue strip, transcript

| Part | Classes | Behaviour |
|---|---|---|
| `HbLevelRail` | `.hb-lrail`, `-segs`, `-ticks`, `-legend`, `-segs > i.is-now` | the level rail of the earlier transcription tool on `HbWave`: bars slime where the gate kept speech and grey where silence was cut, the noise floor dashed amber and the gate dotted red in the bars' own scale (amplitude over the loudest frame), kept segments under it with the one playing lit, time labels (every other one under 560 px), a legend that reads floor and gate in dB. Takes the transcribe rail's `db` and `open`, or kept regions in seconds. Seek by click, drag or arrow keys, in seconds |
| `HbQueueStrip` | `.hb-qstrips`, `.hb-qstrip`, `-main`, `-n`, `-body`, `-hd`, `-name`, `-stat`, `-wave`, `-meta`, `-bar`, `-x`, `-empty`, `.is-sel`, `.is-done`, `.is-ok`, `.is-busy`, `.is-bad` | one strip per file: channel number, name cut with an ellipsis, a status word toned by state (a running job reads its phase: decoding, transcribing), a 44 px waveform, the measured line (snr red under 8 dB and green over 20 dB, vendor), the error line, a bar while it works. The selected strip takes an ink rule on the left; Up, Down, Home and End move the selection. Remove is a separate 44 px target, hidden while `locked` |
| `HbTranscript` | `.hb-tseg-body`, `-who`, `-why`, `-hit`, `-note`, `.is-dropped`, `.hb-transcript.is-edit` | rows are 44 px tall at least. `dropped` lines are counted in a note (`3 lines dropped: 2 phantom, 1 outro`); with `showDropped` they sit in time order, struck through in red with the reason in brackets. `query` keeps lines whose text or speaker holds it, the match inked. `editable` puts a speaker field and the text in place (Enter saves, Escape backs out, emits `edit`); the time becomes the seek button. `follow` keeps the marked row in view. `timeFormat` range, clock or seconds. Segment fields follow the transcribe package: `speaker`, `confidence`, `words`, `edited` |

Vanilla: `clockTime`, `segTime`, `transcriptRows`, `markParts`,
`droppedLine`, `nowIndex`, `railBars`, `railTicks`, `dbText`,
`stripStatus`, `stripMeta`, `STRIP_WORDS`.

### Small changes: inset, wave, welcome, tiles, console, bubble, stage, kv, hash, chip

| Part | Classes | Change |
|---|---|---|
| `HbInset` | `.hb-inset-title`, `-toggle`, `-caret`, `-modes`, `-mode`, `.is-closed` | the head stays one line and cuts title and aux with an ellipsis; `collapsible` with `v-model:open` hides the media from the head; `modes` with `v-model:mode` put a view bar under the head. Width is at least 168 px so the head and the bar hold their 44 px targets on a phone |
| `HbWave` | `.is-seek` | the level rail base: `kept` colours each bar slime or grey, `floor` a dashed amber line, `gate` a dotted red line, `ticks` along the foot; `seekable` turns it into a slider that takes a click, a drag, or arrow keys (shift for 10 percent, Home, End) and emits `seek` |
| `HbWelcome` | `.hb-welcome-n`, `-count`, `li.is-done` | steps tick from live state (`done`), show a live `count`, or carry an `action` that emits `step`; starts take a `thumb`; `persistKey` remembers a close |
| `HbTile`, `HbTiles` | `.hb-tile.is-small`, `.hb-tile-media`, `.hb-tiles.is-small` | `small` for a preset grid in a panel; a `media` slot above the name; `disabled` |
| `HbConsole` | `.hb-console-empty` | `max` keeps the newest lines; `empty` names what will land there; height through `--hb-console-h`, no inline style |
| `HbBubble` | `.hb-bubble-text`, `.is-clamped` | clamped at `lines` (3); `ttl` in ms or `auto` for reading time, 1.5 s plus 60 ms a character; `hold` keeps it up while the voice speaks; emits `update:show` and `expire`; position through `--hb-x` and `--hb-y` |
| `HbStage` | `.hb-stage-label` | the label colour is a class, no inline style |
| `HbKv`, `HbHash` | `.hb-copymark`, `.is-copied`, `.is-failed` | `copy` adds a quiet mark after the value that reads check once copied and x when the browser refused, 44 px on a coarse pointer |
| `HbChip` | `.hb-chip`, `.hb-chip-key` | `hotkey` shows the key on the chip and binds it in the shared registry with `hotkeyLabel` and `hotkeyGroup` for the key map; 44 px on a coarse pointer |

Vanilla: `bubbleTtl`, `bubbleTimer`.

The docs site keeps the 16 px shell gutter on every page and its grid
columns shrink below their code blocks: no sideways scroll at 320 px on
any component page (measured, 111 pages).

### Speech and image: spoken text, method card, image slot, camera tile, history strip, seed

| Part | Classes | Behaviour |
|---|---|---|
| `HbSpokenText` | `.hb-spoken`, `-who`, `-line`, `-w`, `.is-on`, `.is-done`, `.is-live` | the line as word spans: the spoken word pink, earlier words ink, later words dim. `time` against the word times, or `active` from a boundary event (`wordAtChar`), which wins. `spokenWords` estimates times at about 2.2 words a second at rate 1 (inferred from the original's pace) for a voice with no timing. Screen readers read the line once. `breaks` ends a line after a comma or a full stop. Void on a stage or on ink |
| `HbMethodCard` | `.hb-methods`, `.hb-method`, `-badge`, `-body`, `-label`, `-state`, `-trade`, `-notice`, `-meta`, `-q`, `.is-active`, `.is-<state>` | a radio card: letter badge, name over the trade, time and three quality squares on the right with the size (`0` reads no download, a download names its size), the state word toned, and the notice that names why another method answered. The chosen card lifts on a hard shadow with a pink badge; `unsupported` is disabled. Arrow keys move through a `.hb-methods` radiogroup. Under 380 px the size and time line moves under the label and wraps |
| `HbImageSlot` | `.hb-islot`, `-hd`, `-box`, `-img`, `-empty`, `-acts`, `-file`, `-info`, `.is-over`, `.is-live`, `.is-filled` | one image input: upload, camera that turns into capture and stop, paste (clipboard read, or ctrl v on the focused slot), sample, clear. Drop lands on the whole slot. The value is `{url, name, from, blob?}`; object urls are revoked when replaced. Camera failures read through `cameraFault` and name the way around (`camera blocked. allow it in the site settings, or upload a file.`); a denied camera keeps the box. `info` is the line for what the tool found. `ratio` shapes the box (`1/1` default, `4/3`, `16/9`, any `w/h`, or `auto` to follow the picture, 4/3 while empty); a wide box keeps the run button above the fold at 768 |
| `HbCameraTile` | `.hb-camtile`, `-video`, `-tag`, `-rec`, `-none`, `.is-tl`, `.is-tr`, `.is-bl`, `.is-br`, `.is-ok`, `.is-warn`, `.is-rec`, `.is-dim`, `.is-denied`, `.is-live`, `.is-mirror` | the feed on the void at 4 by 3 (`--hb-camtile-ar`), a utility tag per corner, a square record dot, mirrored by default. Denied and off keep the same box. The default slot lays a canvas over the video |
| `HbHistoryStrip` | `.hb-hist`, `-list`, `-item`, `-thumb`, `-tx`, `-cap`, `-label`, `-meta`, `-x`, `-drop`, `-empty`, `.is-grid`, `.is-current` | newest first, at most eight (`historyPush`); a press emits `restore` for the page to bring back the image and its settings; the title carries the run line (`runMeta`) and the prompt. Remove: the corner x on a fine pointer, one 44 px button for the run on screen on touch, Delete on a focused thumb; arrows move between thumbs. `grid` shows the label and run line with a 44 px remove. `thumb` is an image url, svg markup (a waveform for an audio run, drawn as an image so it runs no script) or a short label such as a length (`thumbKind`, `thumbSrc`); the `thumb` slot draws anything else |
| `HbSeed` | `.hb-seed`, `-input`, `-lock`, `-err` | a whole number in a readout face, the dice, and a lock: kept, the seed repeats; unlocked, `nextSeed` rolls one per run. A value that is not 0 to 4294967294 is refused in place |

Vanilla: `spokenWords`, `toSpoken`, `spokenIndex`, `wordAtChar`;
`METHOD_WORDS`, `methodMeta`, `qualitySquares`; `cameraFault`,
`openCamera`, `closeCamera`, `captureFrame`; `historyPush`, `runMeta`;
`SEED_MAX`, `rollSeed`, `parseSeed`, `nextSeed`.

### Masks and views: prompt canvas, instance list, dual range, monitor dock, split

| Part | Classes | Behaviour |
|---|---|---|
| `HbPromptCanvas` | `.hb-pc`, `-tools`, `-key`, `-well`, `-frame`, `-img`, `-mask`, `-box`, `-h`, `-dot`, `-cursor`, `-help`, `.is-preview`, `.is-band`, `.is-neg`, `.is-corner`, `.is-kb`, `.is-readonly` | prompts for a promptable mask model, every one in image pixels (`toImage` maps a pointer through object-fit contain; the letterbox places nothing). Tools keep, leave out and box, keys p n b; a right press or alt leaves out. Hover emits through `hoverThrottle` at 50 ms and always lands the last point; a press commits. Touch has no hover: a tap places. Handles drag, take arrows (1 percent of the long side, 10 with shift), Enter flips keep and leave out, Delete removes. The focused frame shows a cursor: arrows move it and emit hover, Enter places a point, or a box from two presses. Handles are 24 px on a fine pointer and 44 px on a coarse one; keep is a square, leave out a diamond. Masks are alpha urls tinted in their colour; the preview is dashed. A status line reads each prompt out |
| `HbInstanceList` | `.hb-inst`, `-list`, `-row`, `-pick`, `-sw`, `-name`, `-score`, `-act`, `-foot`, `-empty`, `.is-on`, `.is-hidden`, `.is-del` | one row per mask in its canvas colour (`instanceColour`, ten cycled), name, score clamped to 100 percent (`scorePct`), show or hide, delete; merge all and clear all under it. Actions appear on hover and focus with a mouse and stay at 44 px on touch. On a row h hides, Delete removes, arrows move |
| `HbRange2` | `.hb-r2`, `-track`, `-in`, `-names`, `-hint`, `.is-lo`, `.is-hi`, `.is-top`, `.is-disabled` | two native ranges stacked on one track for a window: keep near and keep far. The band between the thumbs is pink. `clampPair` stops the moved thumb at the other and holds `gap`; whichever thumb sits past the middle is on top, so two thumbs at one end still part. 44 px track, thumbs 44 px tall on a coarse pointer. `commit` on release |
| `HbMonitorDock` | `.hb-mdock`, `.is-overlay` | insets side by side: the raw feed and the model's view. v-model is the list of open tiles, each head folds its own; `modes` per view switch inside a tile. Inline tiles grow to share the row and stack on a phone; `overlay` gives fixed width tiles for `.hb-ov-bl`. Not `.hb-dock`, which is the composer bar |
| `HbSplit` | `.hb-split`, `-side`, `-tag`, `-bar`, `-grip`, `.is-left`, `.is-right`, `.is-drag` | a compare wipe: two views of one image in one frame, the right one cut at the divider. Press or drag anywhere; the bar is a slider (arrows 5 percent, shift 1, page keys 25, home and end). 44 px bar on a coarse pointer |

`HbSplit` is not `.hb-toolpage.is-split`. The tool page split lays the
controls column beside the stage, fixed at 260 to 340 px; it is page
layout and does not resize. `HbSplit` compares two pictures of the same
size inside one frame; it is content.

Vanilla: `PROMPT_KEYS`, `containRect`, `toImage`, `toView`, `normBox`,
`isBox`, `nudge`, `promptStep`, `promptWord`, `hoverThrottle`;
`INSTANCE_COLOURS`, `instanceColour`, `scorePct`; `clampPair`,
`rangePct`; `splitKey`, `splitAt`.

### Artboard

| Part | Classes | Behaviour |
|---|---|---|
| `HbArtboard` | `.hb-ab`, `-vp`, `-board`, `-img`, `-slot`, `-layer`, `-mask`, `-stroke`, `-sel`, `-h`, `-hsq`, `-hdot`, `-stem`, `-read`, `-guide`, `-ring`, `-ov`, `-cap`, `-zoom`, `-pct`, `-help`, `.is-fill`, `.is-paint`, `.is-pan`, `.is-live`, `.is-rot` | the relief bench face editor as a part. A board of `width` by `height` board pixels on the void, fitted with 16 px around it; the view is a zoom relative to fit plus a pan, so it stays fitted when the box resizes. Wheel zooms at the cursor (ctrl wheel, a trackpad pinch, faster); a drag on empty board, a middle or right drag, or space drag pans; two fingers pinch and pan; keys + - 0 1 and arrows; double click on empty board fits. Layers sit by centre, scale and rotation: drag moves (snaps to the board centre, alt off, shift locks an axis), corners scale, the dot rotates (square angles catch within 4 degrees, shift snaps 15). Arrows nudge 1 board pixel, 10 with shift; `[` `]` pick; Delete emits `remove`. Erase and restore paint red over the selected layer with a ring cursor; the stroke is emitted in the layer's own pixels and `applyStroke` writes it to a mask canvas, so the mask follows move, scale and rotate. Esc drops the brush. `caption` is the truth label, top left, with the zoom when it is not 1. The box takes the board's ratio up to 70vh; `fill` takes the parent's height, as inside `HbViewport`. Handles are 24 px, 44 px on a coarse pointer |

The board is sized by layout, not by a scale transform, so a part in the
default slot keeps its own handle sizes at any zoom. A primary press on
a focusable element in the slot belongs to that element: `HbPromptCanvas
bare` sits on the board, takes the press, and the board pans by middle
or right drag, space, two fingers or keys. When a second finger lands
the board cancels the first touch in the slot, so a pinch places
nothing. The brush ring is round because it is the brush.

Vanilla: `ART_KEYS`, `ART_FIT`, `fitScale`, `boardRect`, `toBoard`,
`zoomAt`, `wheelFactor`, `pinch`, `toLayer`, `fromLayer`,
`layerCorners`, `hitLayer`, `snapRot`, `snapTo`, `zoomWord`,
`addStrokePoint`, `applyStroke`, `artViewKey`.

### Stage, transport and pad

| Part | Classes | Behaviour |
|---|---|---|
| `HbViewport`, `HbStageOverlay` slots | `.hb-ov-foot`, `.hb-ov-hint`, `.hb-ov-cap`, `.hb-ov-pad`, `.hb-ov-tele` | `telemetry` stacks under the top left content (goal, turn, figures). The foot stacks `hint`, `caption`, `b` and `pad` from the top down and passes presses through to the scene except on its controls. The hint hides under 561 px of viewport, since it names keys and mouse moves. `HbStageOverlay` gains the `b` band too |
| `HbStageCaption` | `.hb-caption`, `-echo`, `-line`, `-who` | `echo` is what the user said, small in lit info; `line` is the reply on the void with `who` over it. A long line keeps its last `maxChars` (320), cut at a word, and the box is bottom aligned, so the newest words stay. Two lines under 561 px of viewport, four above. `aria-live` polite on the line |
| `HbNameHud` | `.hb-namehud`, `-name`, `-state`, `.is-idle`, `.is-thinking`, `.is-listening`, `.is-talking` | the name on paper and one state word from the signal that drives the mouth and the mic gate: idle quiet, thinking lit warn, listening lit info with a live square, talking pink. The default slot takes privacy chips (`camera on`, `mic live`), shown while a track is live |
| `HbTransport` | `.hb-transport`, `.hb-tp-row`, `-btn`, `-track`, `-chaps`, `-chap`, `-scrub`, `-time`, `.is-idle` | play, previous and next, a chapter strip over the scrub, time, speed and loop on one ink bar. Chapters share the strip by length; previous goes to the start of the current chapter after 2 s, else the one before. With no chapters previous and next emit `step`. `keys` binds Space (play, pause), Escape (stop) and the arrows (step) on the window, ignored while typing and where the focused control owns the key. `idle` fades the bar while the pointer rests and the clip plays; focus inside keeps it. The scrub takes its own row under 561 px; 44 px targets on a coarse pointer |
| `HbPad` | `.hb-pad`, `-base`, `-knob`, `-arrow`, `-n`, `-s`, `-w`, `-e`, `-act`, `.is-dpad`, `.is-always` | a stick or d-pad and one action button for moving a body on a phone. Shown on a coarse pointer only unless `always`. The base takes the pointer (`touch-action: none`) and holds it by pointer capture, so the drag survives leaving the base; release returns to rest. Dead zone 0.12 of the radius, rescaled past it; the d-pad snaps to eight directions. Focused, the base reads the arrow keys; `keys` reads arrows and WASD on the window and `actionKey` (e) acts. Screen axes: forward is y below zero. Square, like everything else: the circle is in the vector, not the drawing |

Vanilla: `captionText`, `hudWord`, `HUD_WORDS`; `pad`, `stickVector`,
`snap8`, `keyVector`, `dirWord`, `PAD_KEYS`; `RATES`, `nextRate`,
`rateText`, `chapterAt`, `chapterStep`, `chapterSpans`, `timeLine`,
`transportKeys`, `idleChrome`.

### Persona, trace and context menu

| Part | Classes | Behaviour |
|---|---|---|
| `HbPersonaEditor` | `.hb-persona`, `-row`, `-presets`, `-chips`, `-chip`, `-chip-n`, `-chip-x`, `-save`, `.is-on` | `v-model` is the character file `{v, name, prompt, first?, model?, params?, voice?, avatar?}`. The name labels every message. `insert template` adds `PERSONA_TEMPLATE` (Persona, Voice, Background, Behavior, Boundaries, Format, Example; the name filled in) after a blank line, so a written prompt is kept. The hint under the prompt is its cost: `cost` tokens, else an estimate at four characters a token. Presets are owned by the host: a chip loads the whole file, its mark emits `remove-preset`; the name to save under is an inline field, never a dialog. Import reads a json file and names the failure (`not json`, `no prompt`, a newer version) |
| `HbStepCard` | `.hb-step`, `-head`, `-n`, `-act`, `-ms`, `-body`, `-thumb`, `-text`, `-stream`, `-thought`, `-result`, `.is-thinking`, `.is-ok`, `.is-fail`, `.is-done` | one decision of an agent loop beside the exact frame the model saw: `step 01`, the action chip, the call time; streamed text, thought and result clipped at a word (`clip`, 240). The left edge says the state; thinking is pink and busy. The `thumb` slot takes an `HbInset` |
| `HbPromptInspector` | `.hb-pinsp`, `-card`, `-hd`, `-kv`, `-pre`, `-reply`, `-copy`, `-empty`, `-tools`, `-sig`, `-desc`, `-tool-none` | up to four cards: cost (last prompt and reply tokens, reply time, then the host's `counters` such as model calls, handled by reflex, plan cache hits), the last plan as one line of JSON, and the full context sent with the raw reply after `>>>`, with a copy button. Text wraps and scrolls inside its card (`--hb-pinsp-h`, 320 px). One tab from the chat |
| `HbContextMenu` | `.hb-ctx-area`, `.hb-ctx`, `-title`; rows are `.hb-menu-item` | wraps the stage. Opens by right click, a long press on touch or pen (500 ms, 10 px slop; the click after it and the phone's own contextmenu are eaten), or the menu key or Shift+F10 on the focused element. `request` fires first with `{at, via, target}` so the host fills `title` and `items` for the thing pressed; no items keeps it shut. Placed below right of the point and clamped inside the area. Rows are sentences in their own case and send `say` through the same path as typing (`pick(item, say)`). Arrows, Home, End and a first letter move; Escape and a pick hand focus back to the opener; 44 px rows on a coarse pointer |

Vanilla: `PERSONA_TEMPLATE`, `tokenEstimate`, `costLine`,
`insertTemplate`, `matchPersona`, `presetLabel`, `personaJson`,
`parsePersona`; `stepLabel`, `clipText`, `msText`, `promptText`,
`planText`, `costRows`; `contextTrigger`, `ctxPanel`, `clampMenu`,
`isMenuKey`, `stepIndex`, `LONG_PRESS_MS`, `LONG_PRESS_SLOP`.

## 18. Parts added in 0.6.0 to 0.8.0

Since 0.10.0 the docs site groups parts by the layout that uses them
(section 20), not by category. HbWakeGate, HbStatusBar, HbStageOverlay,
HbReadouts, HbSegMeter, HbPresetChips, HbActions, HbCard and HbNum are
deprecated; the catalogue lists them last with their replacement.

Where to find each part added since 0.6.0. The docs site groups the same
parts by category; the changelog has the detail.

| Version | Parts | Section |
|---|---|---|
| 0.6.0 | vanilla entry `@virgilvox/hackbuild-ui/vanilla` and its composables | 12 |
| 0.6.0 | HbSuiteNav, HbWorkspaceMenu, HbPills, HbStatusList, HbActivity | 13 |
| 0.6.0 | HbPalette, HbKeyMap, HbToolRail, HbChipGroup, HbToggleRow | 14 |
| 0.6.0 | HbEventLog, HbCodeBlock, HbHow, HbExportPanel | 15 |
| 0.6.0 | HbSettingsForm, HbPresetChips, param rows | 16 |
| 0.6.0 | HbModelList, HbProgress phases, HbCapabilities, HbReasons, HbLicence, HbModelManager, HbModelRack, HbModelSlot, HbEngineBar, HbWakeGate, HbTierCards, HbApiKey, HbCustomModelForm | 17 |
| 0.6.0 | HbMessage anatomy, HbThink, HbToolCall, HbContextMeter, HbConversationList; HbMemoryPanel, HbMemoryItem, HbRecallTrace, HbMicButton; HbInset, HbWave, HbBubble, HbWelcome, HbHash | 17 |
| 0.6.1 | HbLevelRail, HbQueueStrip, HbTranscript rows | 17, transcription |
| 0.6.2 to 0.6.4 | HbStatusBar cells and action, HbDrawer `side="auto"` and `size`, `.hb-acts`, list row keys, missing rack slots | 4c, 5, 12, 17 |
| 0.6.5, 0.6.6 | `.hb-toolpage`, `.is-split`, `.is-grow` | 5 |
| 0.6.7 | HbSpokenText, HbMethodCard, HbImageSlot, HbCameraTile, HbHistoryStrip, HbSeed; `.hb-hint` (5) | 17, speech and image |
| 0.6.8 | HbPromptCanvas, HbInstanceList, HbRange2, HbMonitorDock, HbSplit | 17, masks and views |
| 0.7.0 | HbArtboard, HbPromptCanvas `bare` | 17, artboard |
| 0.7.1 | HbStageCaption, HbNameHud, HbTransport, HbPad; HbViewport and HbStageOverlay `telemetry`, `hint`, `caption`, `pad` slots; HbMemoryPanel `pin`, HbHistoryStrip non image `thumb` | 17, stage, transport and pad |
| 0.8.0 | HbPersonaEditor, HbStepCard, HbPromptInspector, HbContextMenu; HbImageSlot `ratio` | 17, persona, trace and context menu |
| 0.8.1 | sizes in decimal lowercase units (`mbText`: 1 gb is 1000 mb); disabled ghost button | 5, 17 |
| 0.8.1 | HbAppShell `fit`, `.is-sheet-open`, `--hb-kb`, `--hb-foot-h`; HbChat `log`, `composer`; vanilla `keyboardInset`, `dockInsets` | 18, phone stage plus rack |
| 0.9.0 | refined look tokens, `.hb-zine`, `.hb-instrument`, `.hb-led`, stage looks, `.hb-dotgrid`, `.hb-fixture`, `.hb-viewport-host`, HbMessage `boxed`, HbStatusBar cell `state` | 19 |
| 0.9.1 | `.hb-toolpage.is-split.is-stage`, `--hb-stage-h-sm`, HbViewport `.hb-ov-top` with a pad, HbSendTo | 18, stage split and send to |
| 0.9.3 | HbHow `what`, `how`, `prose`; HbTierCards `error`; `.hb-tunables`; HbTree, vanilla `tree`; HbViewport `.hb-ov-frame`; void scene tokens | 18, parts added in 0.9.3 |

### Phone stage plus rack

The room on a phone (`#/demos/phone-rack`). No original has it; it is
built from P-SHELL-3, P-PHONE-1, P-PHONE-3 and P-PHONE-10.

| Part | Classes | Behaviour |
|---|---|---|
| `HbAppShell fit` | `.hb-app.is-fit` | the shell is `100dvh` less the keyboard inset at every width and the page never scrolls; an `HbViewport aspect="fill"` in the main column takes the height left over the foot, at least 120 px. Measured: 492 px of stage at 390 by 664, 354 at 320 by 568, 210 at 844 by 390 |
| keyboard and foot insets | `--hb-kb`, `--hb-foot-h` | written on the root by HbAppShell with a dock (vanilla `dockInsets`). `--hb-kb` is the layout viewport under the on-screen keyboard, from visualViewport, 0 when pinch zoomed. The sticky foot sits at `bottom: var(--hb-kb)` and a pinned shell shrinks by it |
| rack sheet over a dock | `.hb-app.is-sheet-open`, `.hb-rail.is-above-dock` | the rack is a bottom sheet under 641 px and a right drawer to 900 px. With a dock the sheet runs from 26 percent of the height to the foot's top edge, the foot stays above the scrim so the composer is always in reach, the scrim drops to 40 percent, and the stage shows only its caption, one line, at its top edge. Seven tabs become a select in the sheet |
| docked composer | `.hb-dock > .hb-chat` | `HbChat :log="false"` is the composer alone, one row at 320 px with a button in `composer-start`; `:composer="false"` is the transcript alone for a rack tab |

Stage ratio by measurement: `fill` gave 492 px of height for a 358 px
wide stage at 390 by 664 (measured). A fixed `--hb-vp-ratio-sm` of 1/1
would leave 134 px empty there and 3/4 hits the 62svh cap at 412 px,
leaving 80 (computed). `fill` in a fit shell leaves no gap at any size.

### Stage split and send to

A character or room tool with chat (`#/demos/stage-chat`), ported from
FERRULE's stage plus chat body.

| Part | Classes and props | Behaviour |
|---|---|---|
| stage split | `.hb-toolpage.is-split.is-stage`, side `.is-side` | from 1024 px the stage takes `minmax(0, 1fr)` on the left and the side column `minmax(340px, 520px)` on the right, held to the window height so the chat log scrolls inside it and the composer stays in view; an `.is-grow` child fills it. Under 1024 px the stage comes first and the side column follows. FERRULE switches at 860 px; the kit keeps its one split breakpoint |
| phone stage height | `--hb-stage-h-sm` | the height of an `HbViewport` child of `.hb-toolpage.is-stage` under 1024 px, at least 160 px. `38dvh` (the default, FERRULE) for a character: 252 px at 390 by 664 (computed), the log and composer stay in reach. Held sideways under 541 px tall the stage takes `85dvh` and chat scrolls under it. A room in `HbAppShell fit` uses `aspect="fill"` instead, which ignores the token: 492 px at 390 by 664 (measured in 0.8.1). Any length works |
| pad aware corners | `.hb-ov-top` | an HbViewport with the `pad` slot wraps `tl`, `tr` and `telemetry` in one grid. Telemetry sits under the name hud, and on a coarse pointer in landscape under 541 px tall it moves under the `tr` content, since the stick covers the left of a short stage |
| send to | `HbSendTo` `targets`, `label`, `align`, `@send`; `.hb-sendto`, `.hb-sendto-reason` | HbDropdown rows with an HbIcon for what the tool takes. A target with a `reason` is disabled and the reason shows beside its name. HbContextMenu is the menu for a pressed thing in the scene and sends sentences; it is not a send to list |

### Parts added in 0.9.3

| Part | Classes and props | Behaviour |
|---|---|---|
| how prose | HbHow `what`, `how`, slot `prose`; `.hb-how-prose`, `.hb-how-what`; type `HbHowDoc` | what the package is in ink, then how it works in ink 2, at the measure, over the packages and install. The props follow a library's `how.ts`, so `v-bind="doc"` binds it whole. Backtick spans render as `.hb-code` (vanilla `codeSpans`); the slot replaces both |
| failed tier | HbTierCards tier `error`; `.hb-tier.is-err`, `.hb-tier-err` | the tier tried and could not run: err border, the err light and `failed: <reason>`. It stays pickable so the user can try again or pick another; `disabled` with `reason` is for a tier this machine cannot run at all |
| tunables panel | `.hb-tunables` on the host of `@hackbuild/tunables` `bindPanel` | its `tn-` markup as folds, param rows and buttons: label on its own row and 44 px controls on a phone, a 160 px label column from 641 px. A Vue tool builds its drawer from HbPanel and HbParamRow instead |
| tree | HbTree `nodes`, `v-model`, `v-model:expanded`, `label`, `maxHeight`; vanilla `tree(el)`; `.hb-tree`, `.hb-tree-item`, `.hb-tree-row`, `.hb-tree-twist`, `.hb-tree-label`, `.hb-tree-sub`, `.hb-tree-group`; `--hb-tree-h` | a rig or scene tree. One row in the tab order; up and down walk the open rows, right opens or steps in, left closes or steps out, home and end jump, enter and space pick. The twist opens without picking. The picked row is reversed to ink. Past `--hb-tree-h` (320 px) the tree scrolls inside itself. Rows are 44 px on a coarse pointer, 26 px on a fine one |
| overlay frame | `.hb-ov-frame`, `.has-pad`, `.hb-ov-low` | HbViewport puts tl, tr, telemetry, hint, caption, band, bl, br and pad in one column: the top grid, then the foot at the bottom edge. The corners size to their content, so camera chips wrap before they reach telemetry, and on a short stage the caption shrinks first and keeps its newest line. Measured on `#/demos/stage-tool`: no slot overlaps at 320 by 568, 360 by 640 and 390 by 664; before, the chips covered the telemetry at 320. `bl` and `br` sit in the foot row `.hb-ov-low` |
| void scene tokens | `--hb-void-rule`, `--hb-void-rule-major`, `--hb-void-line`, `--hb-void-prop` | `.hb-stage-void` draws BAIL's 14 percent pink rule at 32 px (1.10:1 on void, computed) and a major rule every 128 px (1.63:1). The rules are decoration. A top down scene draws its floor grid in `--hb-void-line` (3.78:1) and unlit props in `--hb-void-prop` (6.37:1), read with `getComputedStyle` |

### Parts added in 0.9.5

Gaps the room tool found. Measured on `#/demos/stage-tool` at 390 by 844
on a coarse pointer: the toolbar is one row of 61 px, the telemetry one
row of 24 px, the eye inset 120 by 114 px on a 321 px stage. 0.9.4 put
the toolbar on three rows and the telemetry in a column (suite report).

| Part | Classes and props | Behaviour |
|---|---|---|
| live causal row | HbCausalLog event `live`, `fraction`; `.hb-cev.is-live`, `.hb-cev-bar`; vanilla `replaceRow` | a row replaced in place under its id while it runs (a download, a thinking line). Live rows sit above the rest, outside `limit`, with no pin, and are never announced; drop `live` when done. `fraction` from 0 to 1 draws the bar |
| line log tones | HbCausalLog `tones`; `.hb-cev.is-pink`, `is-info`, `is-ok`, `is-err`, `is-warn`, `is-dim`, `is-load` | ARBOR's seven kinds on the cause timeline: you info with a rule above, me pink, act ok text, fail err, eye and note dim, think and load warn. The same defaults as HbEventLog (`EVENT_KINDS`, which gains `eye`); `tones` overrides tag and tone per kind. The causal kinds keep their words |
| clamped bubble | HbBubble `clamp`, `pad`; vanilla `clampBubble`, `measureBubble`, `placeBubble`; `.hb-bubble.is-in-host`, `.is-below`, `--hb-tail` | the bubble stays inside its positioned parent, `pad` px in. It slides sideways first and the tail keeps pointing at the anchor, then hangs under the point when the top has no room. Never wider than the host less its pad. ARBOR's bubble can leave the stage; P-STAGE-15 asks for the clamp |
| organ row | HbModelRack slot `kind: 'organ'`, `source`, `size`, slot `organ { row }`; `.hb-slot.is-organ`, `.hb-slot-src` | a part that is not a model, such as the body: label, role, source and size, no pick, no load, no state square. Presets and the ready gate skip it. `options` is optional for an organ |
| one row toolbar | HbToolbar `overflow`, `moreLabel`, `v-model:open`, slots `more` and `end`; vanilla `barMore`, `barFit`; `.hb-bar.is-overflow`, `.is-folded`, `.hb-bar-lbl`, `.hb-bar-more`, `.hb-bar-more-btn`, `.hb-bar-more-panel` | CLEVIS (P-PHONE-5). Folded (from 0.9.8 by the bar's own width, see below) the row never wraps: `.hb-bar-lbl` labels drop so their buttons show the stroke icon alone, and the `more` slot folds behind a menu button and opens as a sheet under the bar. Wider, `more` lies in the row between the default and `end` slots. The panel holds real controls, so it is a disclosure: focus goes to its first control, Escape returns focus, a press outside closes |
| compact stage hud | `--hb-inset-w-sm`, `.hb-inset-cycle` | on a stage under 561 px of container width: the inset is ARBOR's 30 percent of the stage (at least 120 px), its mode bar folds into one head button that cycles the modes, its aux drops; hud figures run in one wrapping row across the top, one size down |

### Parts added in 0.9.6

Measured on `#/demos/stage-tool` every 8 px from 320 to 1440 wide at 700
and 900 tall: 0.9.5 cut the 16:9 eye inset at the stage bottom from 632
to 1336 px wide, by up to 95 px (193 of 282 sizes); 0.9.6 keeps it
inside at all 282.

| Part | Classes and props | Behaviour |
|---|---|---|
| radio card | HbRadio `title`, `desc`, `trade`; `.hb-rcards`, `.hb-rcard`, `-body`, `-title`, `-desc`, `-trade`, `.is-disabled`; vanilla `radioCards` | ARBOR's "who decides" (P-ROOM-7). Each option a card: the name, one line of what it means, an optional trade line. The native radio stays, so one `name` gives the radiogroup Tab into the checked card and the arrows between cards; the title names the radio and the two lines describe it. The whole card is the target, at least 44 px; the checked card lifts on a hard shadow; disabled is dashed. Wrap the cards in `.hb-rcards` with `role="radiogroup"` and a label |
| inset inside the stage | `--hb-inset-hmax`, `--hb-inset-k` | the viewport is a size container. From 561 px of stage width an inset is at most as wide as keeps it `--hb-inset-hmax` (36 percent of the stage height) tall at its ratio, never under 168 px; HbInset writes `--hb-inset-k` from `ratio`. When the hud, hint and verbs still leave less room, the low corners give way after the caption: the media well shrinks and crops, the head stays whole |

### Parts added in 0.9.7

| Part | Classes and props | Behaviour |
|---|---|---|
| tools the model sees | HbPromptInspector `tools` (`{ name, desc?, args? }` or a string); `.hb-pinsp-tools`, `.hb-pinsp-sig`, `.hb-pinsp-desc`, `.hb-pinsp-tool-none`; vanilla `toolSignature`, `toolList`, `NO_TOOLS`, type `ModelTool` | ARBOR's body API list (P-ROOM-8), in the inspector beside the prompt (P-TRACE-6). A card after cost, headed with the count: one row per tool as `name(args)` then its one line, the same list the prompt carries. Left out, the card is not drawn; an empty list reads "none in this call: it answers in free text". Scrolls inside the card at `--hb-pinsp-h` |
| header icon button | `.hb-header .hb-iconbtn` | a square icon-only action in a bare `.hb-header` goes ghost on the ink without `.hb-on-ink` on the header: paper stroke, a faint paper border, pink on hover, a pink focus ring. 44 px on a coarse pointer and under 641 px, 34 px with a mouse; never shrinks in a nowrap row; an svg with no width attribute is drawn at 16 px. Always an `aria-label` |

### Parts added in 0.9.8

| Part | Classes and props | Behaviour |
|---|---|---|
| late dock | HbAppShell `dock` slot | the dock may arrive after mount, as a tool that teleports its composer in does. The shell reads the slot on every render and starts `dockInsets` on the foot when it appears, so `--hb-foot-h` is current and a sheet over `.hb-rail.is-above-dock` stops at the dock's top edge. A ResizeObserver keeps it current as the composer grows |
| toolbar fitted to its column | HbToolbar `overflow`; vanilla `barFit` (`foldBelow`, `overflows`, `onChange`; handle `fit`, `update`, `restore`, `folded`, `spilled`), on by default in `barMore` (`fit`); `.is-folded`, `.is-probe`, `.hb-bar-more.is-none` | the fold follows the bar's width, not the window's: `.is-folded` when the bar is under 641 px or its row tried on one line (`.is-probe`) runs over. A stage tool's toolbar in its 583 px column at 1024 is one row (measured). If the folded row still runs over, items from the end of the default slot move into the start of the more panel, last first, where their labels show again; the end slot never moves, so tune stays in view. `.is-none` hides the button over an empty panel. HbToolbar puts spilled items back before it patches its slots |
| pad placement | `.hb-pad` in the HbViewport `pad` slot; `--hb-pad-act-w` (56 px), `--hb-pad-size` | the pad lies over the bottom corners of the frame, stick left and action right. While a pad shows (coarse pointer, or `always`) the foot keeps those corners clear and holds the pad's height, so caption, band and insets sit between; on a short stage insets and caption give way first, then the last telemetry row. Under 321 px of stage height (216 at 320 by 568) the base takes the 72 px step and the action 44 px. Inside the stage at 320 by 568 and 390 by 664 (measured) |

### Parts added in 0.9.9

| Part | Classes and props | Behaviour |
|---|---|---|
| `HbMaskEditor` | `.hb-mask`, `-bar`, `-hist`, `-key`, `-size`, `-tol`, `-val`, `-well`, `-frame`, `-canvas`, `-hint`, `-empty`, `.is-add`, `.is-erase`; `image`, `v-model:tool`, `v-model:mode`, `v-model:size`, `v-model:tolerance`, `contiguous`, `history`, `label`; emits `edit`, `ready`, `error`; exposes `toImageData`, `toBlob`, `mask`, `setMask`, `undo`, `redo`, `clear`, `invert` | masks by hand, no model (P-SEG-4, P-SEG-7, P-DEPTH-5). The wand floods the colour under a tap through 4 neighbours within `tolerance` percent of the rgb cube (6 by default, as the original), the brush paints a disc every half radius, the lasso fills the polygon it draws (pixel centres, even odd). x swaps add and erase; shift flips it for one gesture. The rail is `HbToolRail` from `MASK_TOOLS`, letters w b l printed and bound on the editor while focus is inside; `[` `]` step the brush 5 px in 1 to 200; ctrl z, ctrl shift z or ctrl y; Esc drops a stroke. The brush is in css px, 24 by default and 44 on a coarse pointer, with a ring: slime for add, lit error for erase, as the lasso path. The mask is one byte a pixel in image pixels, tinted pink at half; undo keeps 50 snapshots. Output: `alpha` (white, mask as alpha), `matte` (white keeps, black drops) or `cutout` (source with the mask as alpha), as ImageData or a png Blob. The canvas has `touch-action: none` |
| history strip, restore only | HbHistoryStrip `removable` (default true), `label` (default `run history`) | `removable` off drops the corner x, the 44 px remove and Delete, for presets the page owns. `label` names the list |
| chat note row | HbChat `note` slot; `.hb-chat-note` | one line between the log and the composer, padded to the log's edge, quiet utility type over a dashed rule: the dictation privacy line, a cost note. `above` stays for full width parts such as the context meter |
| composer above the status strip | `.hb-app > .hb-work .hb-chat > .hb-composer`; HbAppShell writes `--hb-kb` and `--hb-foot-h` with a status strip alone too | under 901 px the shell page scrolls as one and the foot sticks to the bottom. An HbChat in the work column now sticks its composer just above the foot and the keyboard, so mic and send are never under the strip. On the suite chat route at 0.9.8 the mic sat under the strip at 1 of 5 scroll steps where it was on screen at 320 and 1 of 6 at 390; the fixture `#/demos/suite-chat` hits the mic at every step, 20 and 14 (measured, 20 px steps) |

Vanilla: `MASK_TOOLS`, `maskHint`, `maskEditor` (handle: `state`,
`setImage`, `setTool`, `setMode`, `swap`, `setSize`, `stepSize`,
`setTolerance`, `setContiguous`, `wandAt`, `paint`, `lassoFill`,
`clear`, `invert`, `undo`, `redo`, `cancel`, `mask`, `setMask`,
`toImageData`, `toBlob`, `subscribe`, `dispose`); the pure parts
`colourDistance`, `wandSelect`, `pointInPolygon`, `polygonFill`,
`applySelection`, `stampDisc`, `strokeSegment`, `invertMask`,
`maskCoverage`, `nextBrushSize`, `maskRgba`, `tintRgba`, `parseRgb`.
Stroke icons `wand`, `brush`, `eraser`, `lasso`.

## 19. The refined look

Section 20 supersedes the shell recipes and the black bar described here:
the bar is light, tools use one of the six layouts, and the type defaults
of section 3 apply.

FERRULE, ARBOR and BAIL draw a finer line than the zine pages: 1.5 px
panels and controls, shadows tuned to it, VT323 on every tag and status
word, the work area as a lit stage inside a paper page, and one four
state vocabulary. From 0.9.0 it is the default for app chrome and tool
panels, set through the tokens, so a suite tool gets it with no class.
Marketing blocks (hero, cta, cover, footer, nav, media card, timeline,
plaque, playlist, section head, ink block), `.hb-prose` and any
`.hb-zine` container keep the 2 px zine values. The comparison is the
docs page `#/look`.

Why the default: the originals are the bar, and all three run the thin
line in their app chrome. Measured on `#/look` at 1440 by 900, the same
20 lines of state take 783 px in the default and 632 px in
`.hb-instrument` (measured), about 28 lines per 900 px screen in the
instrument (computed).

### Tokens

| Token | Value | Use |
|---|---|---|
| `--hb-border` | 1.5px | panels, fields, controls, chips, pills; 2px in the zine scope |
| `--hb-border-em` | 2px | primary button, modal panel, stage, viewport |
| `--hb-shadow-sm`, `--hb-shadow`, `--hb-shadow-lg`, `--hb-shadow-xl` | 2, 3, 4, 6 px | chips; controls; panels and reply boxes; hover lift |
| `--hb-readout-sm`, `-md`, `-lg` | 15, 17, 19 px | VT323: log tags and kind chips; pills, status cells, gauge values; stage tags and who lines |
| `--hb-state-off`, `-load`, `-ok`, `-err` | ink 4, warn, ok, err | the four states; the lit set (lit label, lit warn, slime, lit err) on ink, the header, the stage, the viewport and the status bar |
| `--hb-ok-ink`, `--hb-warn-ink` | #137540, #8f5600 | signal colours as small text on paper |
| `--hb-dot`, `--hb-dot-step` | 7 percent ink, 7 px | the dot grid |

VT323 is set only through `--hb-readout`; no rule names the face
directly. Pills, status list states, slot states, log tags and memory
kind chips use it.

### Readability

| Pair | Ratio (computed, WCAG) | Rule |
|---|---|---|
| ink 3 on paper, raised, sunk | 5.15, 5.75, 4.83 | muted text and labels; not on paper edge (4.46) |
| ink 4 on paper | 2.74 | placeholders and disabled only. Field hints, log times, empty lines, track numbers, queue numbers and unspoken words moved to ink 3 |
| ok on paper | 3.08 | fills and borders only; text takes `--hb-ok-ink` (5.07) |
| warn on paper | 3.05 | fills and borders only; text takes `--hb-warn-ink` (5.28) |
| err on paper | 5.13 | text and fills |
| lit label on ink | 5.60 | off state words on ink |

An off pill is dimmed by colour (ink 3 text, ink 4 border), not by
opacity, so its word keeps 4.5:1.

### Four states

| State | Light | On paper | On ink | Motion |
|---|---|---|---|---|
| off | ink 4 | ink 3 word | lit label word | none |
| load | warn | warn ink word | lit warn | two step blink, 1 s; reduced motion: a hollow square |
| ok | ok | ok ink word | slime | none |
| err | err | err word | lit err | none |

Applied to `HbPill` (`status` gains `off` and `load`), `HbPills`, the
status dot, `HbStatusList`, `.hb-status`, the verdict, `HbModelSlot`,
`HbEngineBar`, `HbToolCall`, `HbEventLog` (the `load` kind is amber) and
`HbStatusBar` cells (`state`). Bars keep the pink fill while they load,
slime when done and red on a fault, as FERRULE's gate bars. Warn stays a
fifth, static tone for a degraded but working part.

### Classes

| Class | Use |
|---|---|
| `.hb-zine` | the 2 px zine values on any container |
| `.hb-instrument` | rack density: 12.5 px base, tighter spacing, VT323 values, 26 px status rows on a fine pointer; buttons, selects and fields stay 44 px on a coarse pointer |
| `.hb-led`, `.is-off`, `.is-load`, `.is-ok`, `.is-err` | the 8 px state light |
| `.hb-stage-lit` | FERRULE stage: a smooth pink radial glow (`--hb-stage-glow`, the one allowed gradient) over 135 degree hairlines on sunk paper. `HbStage look="lit"`, `HbViewport look="lit"` |
| `.hb-stage-void` | BAIL stage: the void with the 32 px pink graph rule and a 128 px major rule. `HbViewport look="graph"`. Scene colours in section 18, parts added in 0.9.3 |
| `.hb-stage-tag` | the stage corner plate: `<b>` ink name, `<span>` pink mode |
| `.hb-viewport-host` | the element a 3D renderer appends its canvas to inside `HbViewport`: fills the frame, the canvas follows at 100 percent with no layout shift, touch goes to orbit. Size the renderer without touching the style (three.js `setSize(w, h, false)`) from a ResizeObserver on the host. Use it instead of `.hb-split-side` |
| `.hb-dotgrid` | dot grid paper on any surface; on `body.hb` it replaces the grain. `.hb-app` carries it and drops the grain by default |
| `.hb-fixture`, `.is-strip` | the fixture banner: a dashed sunk strip with an ink `fixture` plate. Every demo that shows sample state carries one at its top; a fake load never names a real model |
| `.hb-stroke` | hand drawn inline SVG as 2 px lines, square caps, mitre joins; for a drawing the stroke set does not carry |
| `.hb-icon.is-stroke` | the stroke set: width `--hb-border` in screen px |
| `HbMessage boxed` | FERRULE turn: VT323 who plate, each part a raised box with a 4 px shadow, your turns sunk |
| `.hb-toolpage.is-split` | under 1024 px the stage comes first and the `.is-side` column drops below it; `.is-source-order` keeps the markup order |

Icons: from 0.9.4 app chrome and tool panels draw the square cap stroke
set (section 7), FERRULE's and ARBOR's line icons. The marketing blocks
above keep Font Awesome solid (`set="solid"`).

---

## 20. Layouts and the model picker (0.10.0)

Every tool screen is one of six layouts, each taken from an original. The
shape: one light 52 px bar; one subject that fills (60 percent of the
viewport at 1440, the top of the screen on a phone); one 380 px rack of
three to five tabs, the first the live result; one pink action, the next
thing to do; the few repeated verbs as a row on the subject.

| Layout | Original | Vue | Vanilla | Subject | Rack |
|---|---|---|---|---|---|
| stage and rack | hackle, arbor, mortise | `HbStageRack` | `stageRack(root)` | the stage, insets and verbs on it | tabs of live state |
| canvas and rail | mask-studio-sam | `HbCanvasRail` | `canvasRail(root)` | the canvas; the icon tool rail at its left | found, mask, view |
| drop first | scribe | `HbDropFirst` | `dropFirst(root)` | a drop zone that becomes the result; then an add files verb | engine and export once a result exists |
| conversation | clevis | `HbConversationLayout` | `conversation(root)` | the thread at 760 px with its Permanent Marker empty state; the composer (`.hb-convbox`) centred under it; the chat list rail at the left, a drawer from the bar under 901 px | only when persona or memory exist |
| gate | ferrule, arbor | `HbGate` | `gate(root)` | the live subject behind one card; per part progress in `HbGateCheck` rows (`.hb-gatecheck`) | none |
| form and frame | grommet | `HbFormFrame` | `formFrame(root)` | the output frame | the form column, at the left |

Classes: `.hb-lay.is-<kind>`, `.hb-lay-bar`, `.hb-lay-body`,
`.hb-lay-stage`, `.hb-lay-subject`, `.hb-lay-verbs`, `.hb-lay-inset`,
`.hb-lay-tools`, `.hb-lay-list`, `.hb-lay-composer`, `.hb-lay-drop`,
`.hb-lay-empty`, `.hb-gate-wrap`, `.hb-gate-card`, `.hb-rack`,
`.hb-rack-pane`, `.hb-rack-detail`. Tokens: `--hb-rack` 380 px,
`--hb-tools` 56 px, `--hb-list` 268 px, `--hb-sheet` 520 px. Under
901 px the subject takes the top of the screen (62 percent, the frame 48)
and the rack follows it; the conversation keeps the composer on the
first screen. Vanilla `layout(root, options)` sets the markers, runs the
rack tabs, the drop zone, the composer, the gate button and the tool rail.

### Markers

Every layout writes `data-ux` on its parts and the screen gate reads them:
`bar`, `subject`, `rack`, `verbs`, `inset`, `detail`. A subject holds at
most three controls; verbs and insets sit beside it, over it. `detail` is
the rack's foot fold, a model row's chevron detail, or the gate's detail
slot, and is the only place internal words may appear.

### The model picker

Both views are pure: `rows: ModelRow[]` in; `choose`, `load`, `cancel`,
`remove`, `option` and `custom` out. A ModelRow is display ready: id,
name, group, size, memory, bytes, backend, speed word, verdict, the
uncensored and non commercial marks, `noDownload`, state, progress, the
unfit reason, a detail list and options. The no download filter reads
`noDownload` only. An unfit row is not a control: it leads with its
reason, which may wrap. The kit never formats a catalogue record; a
view layer builds the rows.

| Part | Behaviour |
|---|---|
| `HbModelSelect` | closed: one line with the name, size and state, and one pink "load, <size>" that goes once the model is ready. `variant="chip"` is the one model chip in the bar. `go` off on a gate, so the gate's button is the one pink. `jobs` draws one line per job, presets with totals and one pink "load all, <total>"; job lines never carry their own pink |
| `HbModelSheet` | open: a 520 px sheet, full height on a phone. A search field and three filters (fits this machine on, uncensored, no download); groups in order: on this machine, start here, small and fast, better, uncensored, reasoning, no download, your own; 44 px rows with a backend chip, speed, memory, verdict, marks and the state at the right edge; a row that does not fit is greyed with the reason; the chevron opens licence, source, context, quant and where the size came from, and remove for a stored model. Options show under the list only when the chosen row has them. "your own" has four forms: gguf repo and file, onnx hub repo, mlc weights by url, endpoint and key. One pink load at the foot |

Vanilla: `modelSelect(host, options)` and `modelSheet(host, options)` over
the same classes, and the helpers `filterModelRows`, `groupModelRows`,
`loadLabel`, `stateWord`, `loadAll`.

### Copy

Lowercase, terse, a word a stranger knows. No emoji, no dashes, no
exclamation marks. Internal terms (organ, tier, provider, rung, phase,
measured, computed, inferred, unverified) never appear in first view;
they live in a detail fold. Model facts show at the point of choice:
size and licence in the picker and on the load button, never as page
text. A control appears when it can act: no disabled export before there
is output, no undo before there is a change.

### The screen gate

`tools/ux-gate.mjs` in the suite opens each route at 1440 by 900 and 390
by 844 and fails a screen on any of: more than one bar or a bar over
52 px; more than 15 enabled controls in first view outside the rack; a
disabled control in first view; not exactly one pink action; a subject
under 60 percent of the viewport at 1440 or starting below the upper half
at 390; a rack not 380 px wide, not the same width on every tab, without
three to five tabs or over 20 controls; sideways scroll; header items that
cross; an internal word in first view text. The six demo routes
`#/layouts/<kind>` of the docs site pass it, except that the gate still
asks the conversation for a rack, which clevis does not have.

### Parts from hackle (0.10.1)

| Class | Use |
|---|---|
| `.hb-heat.is-pink` | the association table: each `td` sets `--v` from 0 to 1 and fills pink from 6 to 96 percent; `td.is-hi` past .55 takes paper text |
| `.hb-marker` | one behaviour or state name in a rack panel, Permanent Marker 28 px; one per screen with the bar's name |
| `.hb-note` | a note under a readout, Special Elite 13 px in `--hb-ink-3` |
| `.hb-rack-stack` | rack panels stacked 16 px apart, as hackle's blocks |
| `.hb-gauge.is-cur` | the current gauge row: pink bar and pink label |
| `.hb-inset-who` | buttons in an inset head that pick who it sees (`aria-pressed`); HbInset `who` and `v-model:sees` |

### Deprecated in 0.10.0, gone in 0.11.0

| Part | Use instead |
|---|---|
| HbActions | HbToolbar |
| HbCard | HbPanel `interactive` |
| HbReadouts | HbKv `focal` |
| HbSegMeter | HbMeter `segments` |
| HbPresetChips | HbChipGroup |
| HbStageOverlay | HbViewport overlay slots |
| HbWakeGate | HbGate |
| HbEngineBar, HbModelSlot, HbModelRack, HbTierCards | HbModelSelect |
| HbModelList, HbModelManager, HbCustomModelForm, HbMethodCard, HbLoader, HbHash, HbReasons, HbCapabilities | HbModelSheet |
| HbStatusBar | a bar chip or the rack's live tab |
| HbNum | the `.hb-num` class |
| HbAppShell recipes rack, bench, transcript | HbStageRack, HbFormFrame, HbDropFirst |
| HbButton `variant="primary"` | light now; `variant="go"` for the one pink action |

