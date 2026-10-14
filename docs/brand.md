# Brand assets

Everything lives in `assets/brand/` and ships with the package under
`@virgilvox/hackbuild-ui/brand/*`. Every file carrying type has that type as
outlined paths, so nothing depends on a font being installed.

| File | What it is |
|---|---|
| `hackbuild-mark.svg` | the two-path mark, arc in ink, wrench pink |
| `hackbuild-mark-reversed.svg` | arc in paper, for ink and void backgrounds |
| `hackbuild-lockup-horizontal.svg` | mark plus wordmark. The default lockup |
| `hackbuild-lockup-horizontal-dark.svg` | same, on an ink plate |
| `hackbuild-lockup-stacked.svg` | mark over wordmark over tagline |
| `hackbuild-lockup-stacked-dark.svg` | same, on an ink plate |
| `hackbuild-wordmark.svg` | wordmark alone |
| `hackbuild-wordmark-dark.svg` | wordmark alone, on an ink plate |
| `hackbuild-favicon.svg` | 64 px square, mark on paper |

In markup, prefer the `HbMark` and `HbWordmark` components; they render the
same artwork inline and take the surface into account.

## The mark

Two paths taken verbatim from the site favicon: a broken arc and a wrench.
Calibrated square viewBox `117 103 800 800`, arc at `translate(490,121)`,
wrench at `translate(498,314)` filled `#FE0386` always.

Never approximate it, never redraw it, never trace it from a render, never
clean up the paths. To place it at size S inside another coordinate system,
nest the whole `<svg>` with its own viewBox rather than scaling the paths.
A guessed transform produced a wrong-sized mark once and it was rejected.

## Clear space and minimums

- Clear space on every side: 0.5 times the mark height. Nothing intrudes.
- Mark alone: 16 px floor on screen, 8 mm floor in print.
- Horizontal lockup: 120 px wide floor. Below that, drop the wordmark and
  use the mark alone.
- Stacked lockup with tagline: 2 inch floor. The tagline is unreadable
  below it.

## The wordmark

IBM Plex Mono at weight 700. `hack` in ink, then the dot and `build` both
in pink. Setting only the dot in pink is the most common mistake. On an
ink header, `hack` flips to paper and `.build` stays pink.

## Misuse

Do not recolor the wrench. Do not add a stroke, glow, bevel or drop
shadow. Do not rotate, skew or stretch non-uniformly. Do not place it on a
busy photo without a solid paper or ink plate behind it. Do not rebuild
the wordmark in Permanent Marker.

## On a PCB

Pink soldermask, white silk, gold exposed copper. The wrench becomes a
mask opening so it comes out in bare metal and the arc stays silk. When
pink mask is unavailable, invert: cream or white mask, black silk, gold.
On a bottom-side render the mark must sit inside a counter-flipped wrapper
or it prints mirrored.
