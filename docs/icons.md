# Icons

Two sanctioned sources, one rule above all: never emoji, and never an icon
where a two-word label is clearer.

1. The shipped set: hand-drawn stroke icons rendered by `HbIcon`. Zero
   dependencies, works offline, matches the hard-edge system (square caps,
   currentColor, no fills, 1.5 to 2.4 stroke).
2. Font Awesome 6: what every earlier hack.build page used, and still the
   source for brand and social glyphs (github, youtube, mastodon) which the
   shipped set leaves out on purpose.

## The shipped set

```vue
<HbIcon name="wrench" />
<HbIcon name="bolt" :size="24" />
<HbIcon name="record" label="recording" />
```

| Prop | Type | Default | Notes |
|---|---|---|---|
| `name` | `IconName` | | required |
| `size` | `number \| string` | `16` | |
| `strokeWidth` | `number` | `2` | 1.5 to 2.4 per the system |
| `label` | `string` | | accessible name. Without it the icon is `aria-hidden` |

Names, by group:

| Group | Names |
|---|---|
| arrows | arrow-right, arrow-left, arrow-up, arrow-down, external, link |
| actions | plus, minus, x, check, search, copy, trash, pen, download, upload, filter, refresh, power, grip |
| state | eye, heart, star, bookmark, lock, warning, info, question |
| people | user, users, comment |
| things | wrench, gear, bolt, cube, microchip, plug, folder, book, image, video, printer, lightbulb, flame, rocket, trophy |
| instruments | code, terminal, wave, signal, globe, play, pause, record, rss |
| time and place | clock, calendar, pin, menu, sun |

The raw path data is exported as `icons` and the list as `iconNames`, so a
gallery or a picker can be built without touching the component.

This inventory follows what the shipped pages actually used. The most-used
Font Awesome icons across the resume, the mockups and the app were plus,
eye, heart, check, bolt, xmark, arrow-right, clock, star, user, trophy and
rocket; all of them are here.

## Usage patterns

The patterns every earlier page converged on:

- Icons lead labels in buttons: `<HbButton><template #icon><HbIcon name="plug" /></template>connect</HbButton>`.
- Icon-only actions use the square icon button, `.hb-iconbtn`, and always
  carry an `aria-label`. On ink surfaces and in footers it goes ghost
  automatically.
- Nav links and section links stay text. Icons in running prose are noise.
- Decorative icons pass no `label` so they stay out of the accessibility
  tree.
- On the void, icons inherit the lit text color like everything else.

## Font Awesome

For brand glyphs, or when a page needs the wider catalog:

```html
<link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" rel="stylesheet">

<a class="hb-iconbtn" href="https://github.com/hackbuild" aria-label="github">
  <i class="fa-brands fa-github"></i>
</a>
```

Use the solid style for UI, brands for logos. The regular style is allowed
where solid reads too heavy at small sizes. Keep FA icons inside
`.hb-iconbtn` or in front of labels the same way the shipped set is used.

## Adding to the set

Draw on the 24 px grid, stroke only, geometry simple enough to survive
14 px. Add the path list to `src/icons/index.ts`, and it appears in the
site gallery automatically. If a tool needs an icon this set does not have,
grow the set rather than inlining a one-off.
