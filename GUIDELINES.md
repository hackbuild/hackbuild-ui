# hack.build design system

Version 1.2. This document supersedes the hack.build sections of
`hackbuild-explainer`, `brand-forge`, and `board-forge`, and the styling of
every earlier project (`hack-build`, `hack-build-vue`, `hackbuild-stack`,
`hackbuild-resume`). Where any of those disagree with this file, this file
wins.

Version 1.2 adds the Vue 3 component library, the Tailwind v4 bridge,
motion, stacking and layout tokens, and a set of components the app
projects kept rebuilding: switch, dropdown menu, drawer, avatar, skeleton,
spinner, empty state, pagination, and the zine decor classes. It also bakes
in the shipped icon set (`HbIcon`, docs/icons.md) and the page section
anatomy every marketing page kept rebuilding: nav, hero, section head,
media card, video frame, timeline, call to action band and footer.

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
```

### The one-accent rule

The pink is punctuation, not paint. It marks the single most important thing in
a view: the active tab, the live value, the primary action, the trace on the
scope, the dot and build in the wordmark. If three things on screen are pink,
none of them are. It never goes on large fills, page backgrounds, body copy, or
purely decorative chrome.

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
| `.hb-chip` | Filter and multi-select toggle, `.is-on` fills pink |
| `.hb-pill` | Status with a leading dot. `.is-live` pulses pink, `.is-ok`, `.is-err` |
| `.hb-input`, `.hb-select`, `.hb-textarea`, `.hb-range` | Paper field, ink border, pink focus ring and pink accent-color |
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
| `.hb-tape` | Translucent paper strip decor. Zine pages only, never tool chrome |
| `.hb-tilt-l` / `.hb-tilt-l2` / `.hb-tilt-r` / `.hb-tilt-r2` | Sparing rotation. One or two tilted things per view |
| `.hb-icon` / `.hb-iconbtn` | The shipped stroke icon set and the square icon-only action button |
| `.hb-nav` / `.hb-nav-link` / `.hb-nav-cta` | Page navigation. Links collapse into a drawer below 760 px |
| `.hb-hero` / `.hb-kicker` / `.hb-ink-block` | The zine hero: VT323 kicker on an ink plate, marker headline, ink block behind one phrase |
| `.hb-sechead` / `.hb-sechead-link` | Section head: title left, one quiet link pushed right. Centered variant for standalone bands |
| `.hb-footer` and children | Ink footer: link columns, ghost social squares, dashed stamp line |
| `.hb-tag` | Static VT323 tag on a plate: category, badge, year. The interactive cousin is the chip |
| `.hb-link` | Quiet utility-face link, pink, usually with a trailing arrow icon |
| `.hb-media-card` / `.hb-media` | Project card: media plate, tags, marker title, copy, quiet links |
| `.hb-vframe` | Video frame: the one pink border in a video section, a 16 by 9 well on the void |
| `.hb-timeline` / `.hb-tl-item` | Left pink rule entries: jobs, releases, changelog |
| `.hb-cta` / `.hb-stripes` | Closing ink band with colorless caution stripes. The pink stays on the button |

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

Version 1.2 ships its own hand-drawn stroke set, rendered by `HbIcon` and
listed in `docs/icons.md`. It covers the verbs and nouns the shipped pages
actually used (the most-used FA icons across the resume, the mockups and the
app were plus, eye, heart, check, bolt, xmark, arrow-right, clock, star,
user, trophy and rocket, and all of them are in the set). Prefer it for UI:
zero dependencies, square caps, works offline. Font Awesome remains the
source for brand and social glyphs, which the set leaves out on purpose.

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
- [ ] Exactly one pink element competing for attention per view
- [ ] The mark is the verbatim two paths through viewBox `117 103 800 800`
- [ ] `hack` in ink, dot and `build` both pink
- [ ] Four faces doing four jobs, no face outside its role
- [ ] Zero border radius except `.hb-num` and nav dots
- [ ] All shadows hard offset, no blur
- [ ] One texture, applied once, and never on a stage or a dial plate
- [ ] One panel-head style throughout, editorial or instrument, not both
- [ ] On-void text uses the lit set, not the paper signal colors
- [ ] Header holds no verbs; toolbar holds no branding; status strip holds no buttons
- [ ] No horizontal scroll at 390 px
- [ ] Icons are Font Awesome or inline SVG
- [ ] Rendered and looked at in a real browser, not just counted headlessly
