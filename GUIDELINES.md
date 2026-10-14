# hack.build design system

Version 1.3. This document supersedes the hack.build sections of
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
`.hb-chip.is-on`, `.hb-seg > button.is-on`, `.hb-tile.is-on`,
`.hb-row.is-on`, `.hb-btn-danger` and the pink hovers of `.hb-btn`,
`.hb-iconbtn` and `.hb-menu-item`.

The budget is countable. Every pink element in a view falls in one class:

| Class | Allowed pink | Counts against the one |
|---|---|---|
| structural | header bottom rule, current tab or step underline, wordmark dot and `build`, the stage pink shadow, range accent-color, focus ring | no |
| focal | the primary action of the current pane, or the one live value the step is about, or the welcome primary start | yes, exactly one per view |
| data | the primary part color on the stage, the trace on a scope | no, it is data on the void |
| never pink | toggle chips (ink fill when on), secondary buttons, cam buttons (current cam outlined in paper), status tags (slime when good, lit warn when not), card borders | |

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
| Permanent Marker | h1, h2, h3, panel headings, brand lockup | body, buttons, numbers |
| Special Elite | prose, advisory notes, seal band text, hero subtitles | labels, readouts |
| IBM Plex Mono | every label, button, tab, chip, table header, form field, code, and the wordmark at 700 | headlines |
| VT323 | live numbers, coordinates, counters, timers, console lines | prose |
| Libre Baskerville Italic | the tagline "make things. break things. repeat." and nothing else | anything else |

```html
<link href="https://fonts.googleapis.com/css2?family=Permanent+Marker&family=Special+Elite&family=VT323&family=IBM+Plex+Mono:wght@400;500;600;700&family=Libre+Baskerville:ital@1&display=swap" rel="stylesheet">
```

### Scale

| Role | Face | Size | Notes |
|---|---|---|---|
| h1 | Permanent Marker | 44 px, 32 mobile | line-height 1.05 |
| h2 | Permanent Marker | 28 px | section headings |
| h3, panel heading | Permanent Marker | 18 to 20 px | ink rule underneath |
| body | Special Elite | 14 to 16 px | line-height 1.6 to 1.8, max 68ch |
| label, button, tab | IBM Plex Mono 600 | 11 px | uppercase, letter-spacing 0.09em |
| table cell, code | IBM Plex Mono 400 | 12.5 px | tabular numerals on figures |
| readout | VT323 | 18 to 32 px | pink on paper, pink or green on ink |
| tagline | Libre Baskerville Italic | 15 to 20 px | one per artifact |

### Two panel heads

Permanent Marker on a rule is the editorial head: pages, docs, marketing, and
the calmer half of a tool. VT323 uppercase on a full-bleed ink bar is the
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
is the point. Pressing a control collapses its shadow and moves it by the same
offset, so the thing physically goes down.

```css
3px 3px 0 var(--hb-ink)    /* controls */
5px 5px 0 var(--hb-ink)    /* panels and cards */
7px 7px 0 var(--hb-ink)    /* hover and hero */
5px 5px 0 var(--hb-pink)   /* the one stage per view */
```

### Borders and radius

2 px ink on panels, cards, fields and buttons. 3 px for the header rule, the
active tab underline, and focus rings. Dashed 2 px for internal dividers.
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
| header | identity and state | ink, 3 px pink bottom rule | 52 to 60 px | mark, title, status pill, mode switch, tagline |
| tabs | destinations | ink, pink underline on active | 36 px | 3 to 8 tab buttons, nothing else |
| toolbar | verbs and global settings | sunk paper, 2 px ink bottom | 46 px | connect, mode segments, chips, a readout pushed right |
| status strip | counts and rates | ink, 3 px pink top rule, pinned bottom | 28 px | VT323 figures only, never a control |

### Header anatomy

Left to right, always in this order:

1. The mark at 26 to 28 px. It appears here and nowhere else in the app.
2. The tool name in Permanent Marker, trailing dot or suffix in pink. The title
   is the tool name, not hack.build; the mark is what carries the brand.
3. The connection status pill. One pill, showing the connection, not the task.
4. Everything else pushed right with `margin-left:auto`, usually the mode
   switch.
5. The tagline last, at reduced opacity, dropped entirely below about 900 px.

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

### Do not

Put connect, save or export in the header. Put the mark in the toolbar or the
footer as well. Stack more than four strips before content starts. Give the
status strip a button. Let the tab row wrap to two lines; collapse it to a
select first.

---

## 5. Components

All of these ship in `hackbuild.css` with `hb-` prefixed classes.

| Class | What it is |
|---|---|
| `.hb-header` | Ink bar, 3 px pink bottom rule, mark at ~26 px, marker title with pink span, tagline pushed right at reduced opacity |
| `.hb-tabs` / `.hb-tab` | Transparent buttons on ink, pink underline on the active one |
| `.hb-panel` / `.hb-panel-hd` | Raised paper, 2 px ink border, 5 px shadow, marker heading over an ink rule |
| `.hb-card` | Same, but lifts 2 px on hover to a 7 px shadow |
| `.hb-stage` | The void with a pink offset shadow. Canvases, scopes, waterfalls, 3D views |
| `.hb-btn` and variants | Ink fill, pink on hover, shadow collapses on press. `-2` secondary, `-danger` pink fill, `-ghost` for inside stages |
| `.hb-chip` | Filter and multi-select toggle, `.is-on` fills pink with ink text; `.is-toggle.is-on` fills ink for toggles inside a bench |
| `.hb-pill` | Status with a leading dot. `.is-live` pulses pink, `.is-ok`, `.is-err` |
| `.hb-input`, `.hb-select`, `.hb-textarea`, `.hb-range` | Paper field, ink border, pink focus ring and pink accent-color. Ranges are 44 px tall under 820 px and on touch screens, native thumb kept |
| `.hb-kv` | Label left, readout right, dashed divider. The workhorse row of every panel |
| `.hb-table` | Ink header row, dashed cell rules, sunk-paper stripes, pink wash on hover |
| `.hb-console` | Void background, VT323, newest line at the top, one color per severity |
| `.hb-meter` | Pink fill on an ink track, hard edges |
| `.hb-callout` | Pink left rule on a 10 percent pink wash. One or two per page |
| `.hb-num` | Circular section badge. One of only two places a radius is allowed |
| `.hb-seg` | Segmented control for mode switches. Two or three options, past that use a select |
| `.hb-dial` | The one giant primary readout per tool. VT323 on an ink plate, pink tabular digits, digits individually clickable |
| `.hb-sticker` | Rotated hand-lettered tag. The one place Permanent Marker is allowed at small size. One per view |
| `.hb-tiles` / `.hb-tile` | Preset tap targets, 96 px minimum, marker name over a Plex sub, active tile fills pink |
| `.hb-segmeter` | Segmented signal meter. Slime below the threshold, the whole lit run flips pink above it |
| `.hb-slider` | Label, track, live value. The default control of every panel |
| `.hb-list` / `.hb-row` | Bookmarks, device lists, capture sessions |
| `.hb-fold` | Disclosure. Fiddly controls fold away rather than being deleted; easy mode is a fold, not a different app |
| `.hb-modal` | Centered panel over a scrim. `[hidden]` must beat the display rule explicitly or the close button does nothing |
| `.hb-toast` | Bottom center, ink plate, pink rule, gone in about a second |
| `.hb-app` / `.hb-work` / `.hb-main` / `.hb-rail` | Full-height shell: pinned strips, one scrolling work column beside one scrolling rail |
| `.hb-scope` | Canvas inside a stage. Block and full width, or it leaves a baseline gap and the pink shadow sits wrong |
| `.hb-switch` | Rectangular toggle, knob slides, pink when on. Keyed off `aria-checked` |
| `.hb-check` | Checkbox and radio row, native control carrying the pink accent |
| `.hb-menu-wrap` / `.hb-menu` / `.hb-menu-item` | Dropdown action menu under a trigger |
| `.hb-drawer` | Full-height panel sliding from an edge. The mobile home of the rail |
| `.hb-avatar` | A square with an ink border. This system does not crop people into circles |
| `.hb-skeleton` | Paper-edge block that breathes while the real thing loads |
| `.hb-spinner` | Three meter segments blinking in order. No circles |
| `.hb-empty` | Dashed well that says what is missing and what to do |
| `.hb-pages` / `.hb-page` | Pagination chips, current page pink |
| `.hb-panel-hd-inst` | The instrument panel head: VT323 caps on a full-bleed ink bar |
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
| `.hb-prow` | Bench param row: label column, control, paired number, unit, reset mark. `.hb-row` keeps its list meaning |
| `.hb-welcome` | First-run card over the stage centre. `.hb-card` keeps its hover-card meaning |

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

Icons are Font Awesome 6 solid or hand-written inline SVG at 1.5 to 2.4 stroke
width, `currentColor`, no fills. Never emoji, and never an icon where a two-word
label is clearer.

Version 1.2 bakes the real Font Awesome Free glyphs into the library:
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
- [ ] All shadows hard offset, no blur
- [ ] One texture, applied once, and never on a stage or a dial plate
- [ ] One panel-head style throughout, editorial or instrument, not both
- [ ] On-void text uses the lit set, not the paper signal colors
- [ ] Header holds no verbs; toolbar holds no branding; status strip holds no buttons
- [ ] Touch targets 44 px under 640 px and on touch screens
- [ ] No horizontal scroll at 390 px
- [ ] Icons are Font Awesome or inline SVG
- [ ] Rendered and looked at in a real browser, not counted headlessly

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
| instrument head | `.hb-panel-hd-inst`: VT323 17 px uppercase on a full-bleed ink bar |
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
