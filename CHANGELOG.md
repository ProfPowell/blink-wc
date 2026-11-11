# Changelog

All notable changes to this project are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.5.1] — 2026-11-11

### Fixed

- **Screen readers spelled split text out letter by letter.** All per-letter
  and per-word modes (and `step-by="letter"`/`"word"`) now hide the animated
  spans with `aria-hidden` and expose one visually hidden copy of the text, so
  `wave` reads "catch the wave", not "c a t c h…", and `decode` never exposes
  its scrambled glyphs. Content containing links or other interactive elements
  is left as authored.
- **Decorative glyphs were announced.** The terminal cursor, typewriter caret
  and morse dot/dash caption now use CSS empty alt text (`content: '▋' / ''`).
- **Emoji and accented characters were split apart.** Letter mode now splits by
  grapheme cluster with `Intl.Segmenter`, so 👩‍💻, flags and combining accents
  stay whole. Word mode uses the locale's word boundaries (from the nearest
  `lang`), which also handles languages written without spaces.

### Changed

- `connectedMoveCallback` is defined, so moving an element with
  `Node.moveBefore()` keeps its animation running without a rebuild.
- `observedAttributes` is now a static class field.
- Locally installed agent skills (`.agents/`, `.claude/skills/`) are git-ignored.

## [1.5.0] — 2026-11-03

Brings `<blink-wc>` in line with current Vanilla Breeze (0.5.x) theming.

### Added

- **Honors VB's Motion Effects toggle.** `:root[data-motion-reduced]` (set by
  `<theme-picker>`) now stops every animation and JS driver exactly like
  `prefers-reduced-motion`. Both are watched live: flipping either re-syncs
  morse, step and decode modes without a reload.
- **Cascade layers.** Styles now live in `@layer web-components`, declared with
  VB's canonical layer order, so VB themes/packs and unlayered author CSS can
  restyle the component without specificity fights.

### Fixed

- **Unreadable text on themed panels.** `warning` used a fixed dark text colour,
  which disappeared on dark warning colours (e.g. `a11y-high-contrast`); `alert`
  used fixed white. Both now derive black-or-white from the actual panel colour,
  including a custom `--blink-bg`.
- **`vegas` was invisible in light mode** (pale gold on white). It now uses the
  theme's `--color-warning-text` in light mode and bright gold in dark.
- **`crt` lost its look in light mode** (green on white). It is now always a
  dark phosphor screen tinted with the theme's `--color-success` hue.
- **`morse` / `decode` low contrast** — they now use `--color-success-text`
  (light/dark aware) instead of the fill colour `--color-success`.
- **Terminal cursor and typewriter caret kept blinking under reduced motion**
  (they are `::after` pseudo-elements the rule did not cover).
- **Moving an element in the DOM stopped it.** Re-connecting now re-attaches the
  visibility observers and restarts the morse/step/decode drivers.
- Flaky `morph` step test (poll interval could skip the 100 ms step).

## [1.4.1] — 2026-05-27

### Fixed

- **Traffic-light / custom step demos and docs were broken after 1.4.0.** When
  `data-step` moved from the host onto the stepped element, the example CSS still
  targeted the old `blink-wc[data-step='K'] .blink-content` selector, so custom
  per-step styling never applied (the traffic light never changed colour). The
  demo and README/`docs` examples now target
  `blink-wc :is(.blink-content, .blink-char)[data-step='K']`. (Component code was
  already correct; this is a docs/demo fix.)

## [1.4.0] — 2026-05-27

### Added

- **Per-letter (and per-word) step sequences** — the new `step-by` attribute
  (`element` | `letter` | `word`, default `element`) makes the multi-step engine
  advance each unit's `data-step` on its own staggered clock (offset by
  `--blink-stagger`), so the step states ripple across the text instead of
  changing in lockstep. Works with the built-in step modes (`extrude`, `depth`,
  `morph`, …) and with custom `behavior="steps"` CSS. Added a `stepBy` getter.
- **Interactive playground** (`docs/playground.html`) — live controls for every
  attribute, a themed preview, and copy-ready generated markup.

### Changed

- The step engine now sets `data-step` on the **stepped element** (the
  `.blink-content`, or each `.blink-char` when stepping per unit) rather than on
  the host; the host carries a `data-stepping` marker. Author selectors should
  target `blink-wc :is(.blink-content, .blink-char)[data-step='K']`.

## [1.3.0] — 2026-05-27

### Added

- **Per-step hold durations** — the new `step-durations` attribute takes a space-
  or comma-separated list of weights (e.g. `step-durations="3 1 1"`) so each step
  of the multi-step engine can hold for a different slice of the cycle instead of
  an equal one. The list is cycled/truncated to fit the step count. Added a
  `stepDurations` getter.
- **Per-step easing** — the between-step transition now uses `--blink-step-timing`
  (default `ease`) alongside `--blink-step-ease` (duration). Both are read from
  the _incoming_ step's computed style, so a step can carry its own transition
  duration **and** timing-function via `blink-wc[data-step='K'] .blink-content`.

## [1.2.0] — 2026-05-27

### Added

- **Five more per-unit motion modes:**
  - `zoom` — each letter swells toward you and fades, in a staggered ripple.
  - `flip3d` — a split-flap board: each letter tumbles a full turn on the X axis.
  - `swing` — letters dangle and swing like pendulums from their top edge.
  - `shake` — a nervous jitter with a blink, each letter slightly out of phase.
  - `heartbeat` — a double-thump scale pulse rippling across the letters.
- **Two true-3D step modes:**
  - `depth` — a perspective + `translateZ` punch toward the viewer.
  - `revolve` — a 4-step turn on the Y axis that flips to the back and around.
- **`decode` mode** — units flicker through random glyphs (Matrix-style) and then
  lock onto their real character, staggered left-to-right, then re-scramble on a
  loop. Driven by a `requestAnimationFrame` loop that freezes when paused/
  off-screen/tab-hidden and shows the plain text under `prefers-reduced-motion`.
  Works per letter or per word (`unit="word"`).
- New modes added to the `BlinkMode` TypeScript union.

## [1.1.0] — 2026-05-27

### Added

- **Multi-step engine** (`behavior="steps"`) — instead of a single on/off
  toggle, the blink advances through `N` discrete steps across one cycle, and
  each step is its own CSS state (colour, transform, outline, glow — anything).
  A plain blink is simply the 2-step case. The `steps` attribute sets the count
  (min 2). Driven by a `requestAnimationFrame` loop that freezes when paused/
  off-screen/tab-hidden and rests at step 0 under `prefers-reduced-motion`.
  Authors style their own steps with `blink-wc[data-step='K'] .blink-content`.
- **`--blink-step-ease`** — controls the transition _between_ steps: `0s`
  (default) is a hard cut (true blink); a non-zero value morphs smoothly.
- **Four step-based preset modes:**
  - `extrude` — an isometric 3D block that punches toward you on-beat (a growing
    stack of offset text-shadows plus a scale).
  - `collapse` — the text squashes flat, then pops back up.
  - `outline` — alternates between a solid fill and a hollow `-webkit-text-stroke`.
  - `morph` — a 4-step showcase, each step its own colour and transform.
- `steps` getter and `'steps'` added to the `BlinkBehavior` type; the new modes
  added to `BlinkMode`.

## [1.0.0] — 2026-05-27

### Added

- Initial release of `<blink-wc>` (class `BlinkWc`) — the deprecated `<blink>`
  element reborn for 2026: light DOM, CSS-driven, themeable, and accessible.
- **Three core behaviors:** `blink` (classic hard on/off), `pulse` (a soft
  breathing fade), and `flicker` (irregular, mostly-on flutter).
- **Configuration attributes:** `rate` (CSS time per cycle), `min-opacity` (the
  "off" opacity), `count` (finite blinks then stop), `pause-on-hover`,
  `play-state`, and `reduced-motion`.
- **Surface themes** (`mode`): `neon`, `crt`, `terminal` (blinking block
  cursor), `warning`, `alert`, `police` (alternating red/blue), and `vegas`.
- **Per-unit motion modes:** `wave`, `twinkle`, `sparkle`, `rainbow`, `chase`,
  `glitch`, `cascade`, and `typewriter` — they split the text into per-character
  spans (or whole words with `unit="word"`) and animate each with a staggered
  delay.
- **`morse` mode** — blinks the text out as International Morse code, driven by a
  small `requestAnimationFrame` loop that freezes when paused/off-screen/
  tab-hidden, and shows the dot/dash transcription as a caption.
- **Accessibility-first defaults.** Blinking content is a genuine hazard, so all
  animation stops under `prefers-reduced-motion: reduce` (text shown fully)
  unless you set `reduced-motion="ignore"`; everything is pausable; and blinks
  pause when the element is off-screen (IntersectionObserver) or the tab is
  hidden (Page Visibility).
- **Legacy-compatible API:** `start()`, `stop()`, `toggle()`, plus `refresh()`.
- **Custom events:** `blink-start`, `blink-pause`, and `blink-cycle`.
- **Vanilla Breeze theme awareness.** Themed variants read VB design tokens
  (`--color-accent`, `--color-error`, `--color-warning`, `--color-success`,
  `--font-mono`, `--font-sans`, `--radius-m`, …) through layered `var()`
  fallbacks. A `--blink-*` override always wins; pages without VB render
  identically via built-in defaults.
- **Project tooling** matching the sibling vanilla web components: Vite build
  (ES module output), ESLint, Prettier, Playwright tests, and a Custom Elements
  Manifest.
- **TypeScript declarations** (`blink-wc.d.ts`) for attributes, getters,
  methods, and the custom event map.
- **GitHub Pages documentation site** under `docs/` (home, demos, API). It loads
  Vanilla Breeze and its `<theme-picker>` from a CDN so visitors can switch
  themes and watch every themed blink re-skin live.

### Notes

- Component renders in the light DOM; its stylesheet (`dist/blink-wc.css`) must
  be present on the page.
