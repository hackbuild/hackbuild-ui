# Using Tailwind

Tailwind is optional. The components never depend on it: they bind to the
classes in `hackbuild.css`, which is plain CSS over the tokens. The bridge
exists so your own app markup can speak the system through utilities.

## Tailwind v4 setup

```css
/* app.css */
@import "tailwindcss";
@import "@virgilvox/hackbuild-ui/styles.css";
@import "@virgilvox/hackbuild-ui/theme.css";
```

`theme.css` is a v4 `@theme` block mapping the tokens to Tailwind theme
variables. After the import these utilities exist:

| Utility | Comes from |
|---|---|
| `bg-paper`, `bg-paper-raised`, `bg-paper-sunk`, `bg-paper-edge` | surface tokens |
| `bg-ink`, `bg-void`, `text-ink`, `text-ink-2` through `text-ink-4` | ink tokens |
| `bg-pink`, `text-pink`, `border-pink`, `bg-pink-deep` | the accent |
| `text-ok`, `text-warn`, `text-err`, `text-info` | paper signal set |
| `text-slime`, `text-lit-warn`, `text-lit-err`, `text-lit-info` | lit set, on the void |
| `font-display`, `font-body`, `font-utility`, `font-readout`, `font-tagline` | the four faces plus the tagline |
| `shadow-hard`, `shadow-hard-lg`, `shadow-hard-xl`, `shadow-hard-pink` | hard offset shadows |
| `tracking-label` | label letter spacing |

The radius scale is zeroed, so `rounded-lg` produces square corners. That
is intentional. Rounding a corner is how an artifact leaves the system.

A hero written with the bridge:

```html
<section class="bg-paper px-6 py-16">
  <p class="font-readout text-sm bg-ink text-paper inline-block px-3 py-1">
    hardware, tools, tutorials
  </p>
  <h1 class="font-display text-6xl mt-4">
    make things.
    <span class="bg-ink text-paper px-4 inline-block hb-tilt-r">break things.</span>
  </h1>
  <p class="font-body max-w-[68ch] mt-6 text-ink-2">
    open tools and hardware notes. if it does not exist, build it.
  </p>
  <a href="#work" class="hb-btn hb-btn-lg mt-8">see the work</a>
</section>
```

Mixing utilities with `hb-` classes is fine and expected: utilities for
layout and spacing, system classes for components.

## Rules that still apply

Utilities make it easy to break the system, so the guardrails matter more,
not less:

- One pink element competing for attention per view. `text-pink` on
  paragraphs is wrong.
- No gradients, no blur shadows, no rounded corners. The bridge removes
  the radius scale but `bg-gradient-*` and `shadow-xl` still exist; do not
  use them.
- Faces keep their jobs: `font-display` never sets body copy,
  `font-readout` never sets prose.
- Signal colors carry data, never chrome.

## Content scanning

Nothing in this package needs to be scanned by the consumer's Tailwind.
The shipped components use `hb-` classes, not utilities, so there is no
`@source` requirement and no risk of missing classes in production builds.
Your own source is scanned by your own Tailwind setup as usual.

## Tailwind v3

v3 configs are JavaScript. Mirror the tokens manually if you are stuck on
v3, or upgrade; the bridge file targets v4 and is not read by v3.
