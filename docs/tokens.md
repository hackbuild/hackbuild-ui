# Tokens

Everything in `src/styles/tokens.css`, exported as `@virgilvox/hackbuild-ui/tokens.css`.
The class layer and the Tailwind bridge both read from these. If a value
anywhere else disagrees, the token file wins.

## Surfaces

| Token | Value | Carries |
|---|---|---|
| `--hb-paper` | `#f5f0e6` | the page. Only panels sit directly on it |
| `--hb-paper-raised` | `#fffdf7` | panels, cards, fields, chips, list rows |
| `--hb-paper-sunk` | `#efe9db` | toolbars, table stripes, wells |
| `--hb-paper-edge` | `#e8e0d0` | inline code, disabled fills |
| `--hb-ink` | `#1a1a1a` | text, borders, dark panels, silk black |
| `--hb-void` | `#0a0a0a` | stages: canvases, scopes, consoles |

Going up the surface ladder means adding a border and a shadow, not adding
a color. The void is reserved: it is where the machine draws, never chrome.

## Ink steps

| Token | Value | Job |
|---|---|---|
| `--hb-ink` | `#1a1a1a` | primary text and borders |
| `--hb-ink-2` | `#444444` | secondary text |
| `--hb-ink-3` | `#6b6459` | labels and captions |
| `--hb-ink-4` | `#9a9184` | placeholders and disabled |

## The one accent

| Token | Value |
|---|---|
| `--hb-pink` | `#FE0386` |
| `--hb-pink-deep` | `#c70269` |
| `--hb-pink-10` | `rgba(254,3,134,.10)` |
| `--hb-pink-18` | `rgba(254,3,134,.18)` |

The pink is punctuation, not paint. One competing pink element per view.
`#FE0386` is the favicon value and the only correct pink. Older files
carrying `#ff3366`, `#ff2d7b` or `#E91E8C` are wrong.

## Signal colors

Data only. Charts, log severity, pass and fail. Never chrome, never brand.

| Paper set | Value | Lit set (on the void) | Value |
|---|---|---|---|
| `--hb-ok` | `#1f9d55` | `--hb-slime` | `#a6e22e` |
| `--hb-warn` | `#c77700` | `--hb-lit-warn` | `#ffb020` |
| `--hb-err` | `#c3251f` | `--hb-lit-err` | `#ff5c4d` |
| `--hb-info` | `#2b6cb0` | `--hb-lit-info` | `#58a6ff` |
| | | `--hb-lit-dim` | `rgba(245,240,230,.35)` |
| | | `--hb-lit-label` | `#9a9184` |

The paper set goes muddy on the void, so anything drawn inside a stage or
console uses the lit set. The stylesheet swaps them automatically for
`.hb-ok` and the other status classes inside `.hb-stage` and `.hb-console`.

`--hb-lit-dim` reads 2.90:1 on the void (computed) and fails AA for small
labels; text labels on the void use the solid `--hb-lit-label` (6.37:1,
computed). Text on a pink fill is `--hb-ink` (4.62:1, computed), never
paper (3.32:1, computed).

## On-ink lines

| Token | Value | Job |
|---|---|---|
| `--hb-ink-line` | `#33312c` | hairline divider on ink |
| `--hb-ink-inset` | `#2a2822` | inset well on ink |
| `--hb-ink-border` | `#44413a` | frame around a control on ink or the void |

## Stage parts and board render

Data on the void, never chrome.

| Token | Value | Job |
|---|---|---|
| `--hb-part-a` | `var(--hb-pink)` | row train, primary moving part |
| `--hb-part-b` | `var(--hb-slime)` | column train, secondary |
| `--hb-part-c` | `var(--hb-lit-warn)` | links, couplings |
| `--hb-part-d` | `#f5f0e6` | rods, pivots, pins |
| `--hb-part-e` | `#6b6459` | decks, plates |
| `--hb-part-f` | `#4a463c` | frame, case |
| `--hb-gold` | `#d9b45a` | copper and ENIG |
| `--hb-mask` | `#FE0386` | solder mask |
| `--hb-silk` | `#ffffff` | silkscreen |

## The plate palette

Identity colors for media plates, avatars and category coding, the way the
magazine and resume cards use them. Solid fills behind a paper icon or
marker initials. Never chrome, never text, never a page background.

| Token | Value | Foreground |
|---|---|---|
| `--hb-plate-teal` | `#14b8a6` | paper |
| `--hb-plate-purple` | `#8b5cf6` | paper |
| `--hb-plate-blue` | `#3b82f6` | paper |
| `--hb-plate-amber` | `#f59e0b` | ink |
| `--hb-plate-green` | `#22c55e` | ink |

The pink and the ink complete the set of plates. Amber and green carry ink
foregrounds; paper on those fills was one of the readability problems in
the originals. Seeded picks come from `plateFromSeed` and rotate through
teal, purple, blue, amber, green and pink.

## Type

| Token | Face | Job |
|---|---|---|
| `--hb-display` | Permanent Marker | h1, h2, h3, panel headings, stickers |
| `--hb-body` | Special Elite | prose, notes, hero subtitles |
| `--hb-utility` | IBM Plex Mono | labels, buttons, tabs, tables, code, wordmark |
| `--hb-readout` | VT323 | live numbers, counters, console lines |
| `--hb-tagline` | Libre Baskerville italic | the tagline and nothing else |

## Structure

| Token | Value |
|---|---|
| `--hb-border` | `2px` |
| `--hb-border-hd` | `3px` |
| `--hb-shadow` | `3px 3px 0 var(--hb-ink)` |
| `--hb-shadow-lg` | `5px 5px 0 var(--hb-ink)` |
| `--hb-shadow-xl` | `7px 7px 0 var(--hb-ink)` |
| `--hb-shadow-pink` | `5px 5px 0 var(--hb-pink)` |

Shadows are hard offset, no blur, no spread. Pressing a control collapses
its shadow and moves it by the same offset. Radius is zero everywhere
except `.hb-num`, nav dots, and the pill status dot.

## Spacing

`--hb-s1` through `--hb-s8`: 4, 8, 12, 16, 24, 32, 48, 64 px.

## Motion

| Token | Value | Job |
|---|---|---|
| `--hb-t-fast` | `.06s` | press and release |
| `--hb-t` | `.12s` | hover fills, chips |
| `--hb-t-slow` | `.25s` | drawers, modals, toasts |

Short and mechanical. Nothing eases for long. Reduced motion turns it all
off.

## Stacking

`--hb-z-dropdown` 100, `--hb-z-sticky` 200, `--hb-z-drawer` 700,
`--hb-z-modal` 900, `--hb-z-toast` 1000, `--hb-z-grain` 9999. The grain
overlay always sits on top; it is texture, not chrome.

## Layout

| Token | Value | Job |
|---|---|---|
| `--hb-measure` | `68ch` | prose line length ceiling |
| `--hb-narrow` | `860px` | docs and article shells |
| `--hb-wide` | `1180px` | app and page shells |
| `--hb-rail` | `336px` | bench rail beside the stage |
| `--hb-tray` | `210px` | bench tray under the stage |
