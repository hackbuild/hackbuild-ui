# Rules for working in this repository

These rules are absolute. They apply to every file, every commit, and every
generated string, including code comments, log output, and test fixtures.

## Attribution

- Never add Claude, any AI assistant, or any AI tool as an author,
  co-author, contributor, or credit of any kind. Not in commit messages,
  not in Co-Authored-By trailers, not in package.json, not in comments,
  not in documentation, not in changelogs.
- Commit messages carry no trailers, no badges, no generated-with lines.
  Subject in the imperative, lowercase, under 60 characters. Body only when
  the change needs explaining, wrapped at 72.

## Language

- Never use emojis. Anywhere. Including commits, comments, and log output.
- Never use em dashes or en dashes. Use commas, periods, or the word "to"
  for ranges. This includes code, UI strings, and documentation.
- No exclamation marks in prose or UI copy.
- No marketing adjectives: seamless, powerful, robust, comprehensive,
  beautiful, blazing, delightful, and their kin. Say what the thing does.
- No filler openers: "Let's", "Simply", "Just", "Note that", "In this
  section we will". Start with the fact.
- No summary paragraphs that restate what was just said. No "In conclusion".
- UI copy is lowercase, terse, second person for instructions. Name the
  failure mode instead of hiding it.
- Write documentation the way GUIDELINES.md is written: plain statements,
  short paragraphs, tables for reference material.

## Design law

- GUIDELINES.md is the design law. Where any other file disagrees with it,
  GUIDELINES.md wins. Read it before touching styles or components.
- Pink is #FE0386, paper is #f5f0e6, ink is #1a1a1a. The one-accent rule
  holds: one pink element competing for attention per view.
- Zero border radius except .hb-num, nav dots, and the pill status dot.
- Hard offset shadows only. No blur, no spread, no gradients.
- Four faces, four jobs. Never set a face outside its role.
- The mark is the verbatim two-path favicon artwork placed through viewBox
  117 103 800 800. Never redraw, trace, or approximate it.
- Icons are Font Awesome 6 solid or inline SVG. Never emoji.
- No horizontal scroll at 390 px. Mobile first: every new component must be
  checked at 390 px before it ships.

## Code conventions

- Components are Vue 3 SFCs, script setup, TypeScript, PascalCase with the
  Hb prefix, one component per file in src/components.
- Components carry no style blocks. All styling lives in
  src/styles/hackbuild.css keyed off tokens in src/styles/tokens.css.
  If a component needs new CSS, grow the stylesheet and document it in
  GUIDELINES.md rather than inlining a one-off.
- Tokens are the only source of design values. No raw hex, no raw px
  spacing in components. New values go into tokens.css first.
- Props are typed interfaces with withDefaults. Emits are typed. Two way
  state uses defineModel.
- Every interactive component handles keyboard use and carries the right
  ARIA role and state.
- Public API is exported from src/index.ts only.

## Verification

- npm run typecheck and npm run build must pass before a commit.
- Render the playground (npm run dev) and look at the result in a real
  browser at desktop width and at 390 px. Counting classes headlessly is
  not looking.
- The two HTML pages at the repo root are the living style guide and the
  acceptance test. Do not break them.
