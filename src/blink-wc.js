/**
 * @class BlinkWc
 * @extends HTMLElement
 * @description Vanilla Breeze blink component. The deprecated <blink> element,
 *   reborn for 2026 — light DOM, CSS-driven, themeable, accessible, and it
 *   pauses when offscreen or tab-hidden. Blinking content is a real
 *   accessibility hazard, so it stops entirely under prefers-reduced-motion
 *   (unless you explicitly opt out) and is always pausable.
 *
 * @attr rate - CSS time for one blink cycle  (default: 1s)
 * @attr behavior - blink | pulse | flicker  (default: blink)
 * @attr min-opacity - opacity of the "off" phase, 0–1  (default per behavior)
 * @attr count - number of blinks, then stop, or `infinite`  (default: infinite)
 * @attr pause-on-hover - boolean; also pauses on focus-within
 * @attr play-state - running | paused
 * @attr reduced-motion - respect | ignore  (default: respect)
 * @attr mode - visual/motion preset. Surface themes: neon | crt | terminal |
 *   warning | alert | police | vegas. Per-unit motion: wave | twinkle |
 *   sparkle | rainbow | chase | glitch | cascade | typewriter. Special: morse.
 * @attr unit - letter | word  (default: letter) — granularity for the motion modes
 *
 * @fires blink-start
 * @fires blink-pause
 * @fires blink-cycle - fires on each blink iteration
 */

// Modes that split text into per-unit spans for letter/word-level effects.
const LETTER_MODES = [
  'wave',
  'twinkle',
  'sparkle',
  'rainbow',
  'chase',
  'glitch',
  'cascade',
  'typewriter',
  'zoom',
  'flip3d',
  'swing',
  'shake',
  'heartbeat',
  'decode',
];

// Modes driven by the multi-step engine: JS advances data-step="0..N-1" across
// the cycle and CSS styles each step. A plain blink is just the 2-step case.
const STEP_MODES = ['extrude', 'collapse', 'outline', 'morph', 'depth', 'revolve'];

// Default step count per step-mode (overridable with the `steps` attribute).
const STEP_COUNTS = { morph: 4, revolve: 4 };

// Glyphs the `decode` scramble cycles through before locking onto the text.
const DECODE_GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*+=?<>/~^|';

// International Morse code, plus digits and a little punctuation.
const MORSE = {
  a: '.-',
  b: '-...',
  c: '-.-.',
  d: '-..',
  e: '.',
  f: '..-.',
  g: '--.',
  h: '....',
  i: '..',
  j: '.---',
  k: '-.-',
  l: '.-..',
  m: '--',
  n: '-.',
  o: '---',
  p: '.--.',
  q: '--.-',
  r: '.-.',
  s: '...',
  t: '-',
  u: '..-',
  v: '...-',
  w: '.--',
  x: '-..-',
  y: '-.--',
  z: '--..',
  0: '-----',
  1: '.----',
  2: '..---',
  3: '...--',
  4: '....-',
  5: '.....',
  6: '-....',
  7: '--...',
  8: '---..',
  9: '----.',
  '.': '.-.-.-',
  ',': '--..--',
  '?': '..--..',
  "'": '.----.',
  '!': '-.-.--',
  '/': '-..-.',
  '(': '-.--.',
  ')': '-.--.-',
  '&': '.-...',
  ':': '---...',
  '=': '-...-',
  '+': '.-.-.',
  '-': '-....-',
  '@': '.--.-.',
};

class BlinkWc extends HTMLElement {
  static get observedAttributes() {
    return [
      'rate',
      'behavior',
      'min-opacity',
      'count',
      'steps',
      'step-durations',
      'step-by',
      'play-state',
      'pause-on-hover',
      'reduced-motion',
      'mode',
      'unit',
    ];
  }

  // ── Functional core: pure getters ──────────────────────────────────────
  get rate() {
    return this.getAttribute('rate') || '1s';
  }
  get behavior() {
    const b = this.getAttribute('behavior');
    return ['pulse', 'flicker', 'steps'].includes(b) ? b : 'blink';
  }
  get minOpacity() {
    const v = this.getAttribute('min-opacity');
    return v == null || v === '' ? null : v;
  }
  get count() {
    return this.getAttribute('count') || 'infinite';
  }
  get steps() {
    const v = parseInt(this.getAttribute('steps'), 10);
    if (Number.isFinite(v) && v >= 2) return v;
    return STEP_COUNTS[this.mode] || 2;
  }
  get stepDurations() {
    return this.getAttribute('step-durations') || null;
  }
  get stepBy() {
    const v = this.getAttribute('step-by');
    return v === 'letter' || v === 'word' ? v : 'element';
  }
  get playState() {
    return this.getAttribute('play-state') || 'running';
  }
  get mode() {
    return this.getAttribute('mode') || '';
  }
  get unit() {
    return this.getAttribute('unit') === 'word' ? 'word' : 'letter';
  }

  // ── Imperative shell ───────────────────────────────────────────────────
  connectedCallback() {
    if (this._built) return;
    this._build();
    this._observe();
    this._update();
    this._built = true;
    this._dispatch('blink-start');
  }

  disconnectedCallback() {
    this._intersectionObserver?.disconnect();
    this._content?.removeEventListener('animationiteration', this._onIteration);
    document.removeEventListener('visibilitychange', this._onVisibility);
    this._stopMorse();
    this._stopSteps();
    this._stopDecode();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue || !this._built) return;
    if (name === 'mode' || name === 'unit' || name === 'step-by' || name === 'behavior') {
      this._renderContent();
    }
    this._update();
    if (name === 'play-state') {
      this._dispatch(newValue === 'paused' ? 'blink-pause' : 'blink-start');
    }
  }

  // ── Public API (legacy <blink> compat) ──────────────────────────────────
  start() {
    this.setAttribute('play-state', 'running');
  }
  stop() {
    this.setAttribute('play-state', 'paused');
  }
  toggle() {
    this.playState === 'paused' ? this.start() : this.stop();
  }
  refresh() {
    this._renderContent();
    this._update();
  }

  // ── Private ────────────────────────────────────────────────────────────
  _build() {
    const items = [...this.childNodes];
    this.textContent = '';

    const content = document.createElement('span');
    content.className = 'blink-content';
    items.forEach((n) => content.appendChild(n));
    this.appendChild(content);

    this._content = content;
    // Snapshot the authored markup so we can re-render when `mode` changes.
    this._sourceHTML = content.innerHTML;
    this._renderContent();
  }

  // Restore authored markup, then split into units if the mode needs it. Per-unit
  // motion modes split by `unit`; per-unit step sequences split by `step-by`.
  _renderContent() {
    if (this._sourceHTML == null) return;
    this._content.innerHTML = this._sourceHTML;
    const perUnitSteps = this._usesSteps() && this.stepBy !== 'element';
    if (LETTER_MODES.includes(this.mode) || perUnitSteps) {
      const byWord = perUnitSteps ? this.stepBy === 'word' : this.unit === 'word';
      this._splitLetters(byWord);
      this.dataset.split = '';
    } else {
      delete this.dataset.split;
    }
  }

  // Wrap each unit in a <span class="blink-char"> with a stagger index, so CSS
  // can animate units individually (wave, twinkle, …) and the step engine can
  // advance each unit's data-step on its own staggered clock.
  _splitLetters(byWord = this.unit === 'word') {
    const walker = document.createTreeWalker(this._content, NodeFilter.SHOW_TEXT);
    const textNodes = [];
    while (walker.nextNode()) textNodes.push(walker.currentNode);

    // Per-unit randomized clocks: each unit blinks on its own timer.
    const twinkle = this.mode === 'twinkle' || this.mode === 'sparkle';
    const decode = this.mode === 'decode';
    const isWs = (c) => c.trim() === '';
    let i = 0;
    for (const node of textNodes) {
      const frag = document.createDocumentFragment();
      const tokens = byWord ? this._tokenizeWords(node.textContent) : [...node.textContent];
      for (const ch of tokens) {
        if (ch === '') continue;
        const space = isWs(ch);
        const span = document.createElement('span');
        span.className = 'blink-char';
        span.style.setProperty('--i', i++);
        if (twinkle) {
          span.style.setProperty('--rate', `${(0.4 + Math.random() * 1.6).toFixed(2)}s`);
          span.style.setProperty('--delay', `${Math.random().toFixed(2)}s`);
        }
        if (space) {
          span.classList.add('blink-space');
          span.textContent = ' ';
        } else {
          span.textContent = ch;
          // decode: remember the real glyph so the scramble loop can settle on it
          if (decode) span.dataset.ch = ch;
        }
        frag.appendChild(span);
      }
      node.replaceWith(frag);
    }
    this._content.style.setProperty('--n', i);
  }

  // Split text into word and whitespace-run tokens (no regex escapes needed).
  _tokenizeWords(text) {
    const tokens = [];
    let buf = '';
    let bufWs = null;
    for (const c of text) {
      const ws = c.trim() === '';
      if (buf !== '' && ws !== bufWs) {
        tokens.push(buf);
        buf = '';
      }
      buf += c;
      bufWs = ws;
    }
    if (buf !== '') tokens.push(buf);
    return tokens;
  }

  // Whether playback is currently paused (state, off-screen, tab-hidden, or hover).
  _isPaused() {
    if (this.hasAttribute('pause-on-hover') && this.matches(':hover, :focus-within')) return true;
    return (
      this.playState === 'paused' ||
      this.dataset.visible === 'false' ||
      this.dataset.tabVisible === 'false'
    );
  }

  _stopMorse() {
    if (this._morseRAF) cancelAnimationFrame(this._morseRAF);
    this._morseRAF = null;
  }

  // morse mode: blink the text out as Morse code. CSS keys off data-lit to light
  // the text; we also expose the dot/dash string via data-morse for a caption.
  _syncMorse() {
    this._stopMorse();
    if (this.mode !== 'morse') {
      delete this.dataset.lit;
      delete this.dataset.morse;
      return;
    }

    const text = (this._content?.textContent || '').trim();
    this.dataset.morse = this._toMorse(text);

    // Respect reduced motion: leave the text fully lit, no blinking.
    const reduce =
      this.getAttribute('reduced-motion') !== 'ignore' &&
      matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      this.dataset.lit = 'true';
      return;
    }

    const segments = this._morseSegments(text);
    if (segments.length === 0) {
      this.dataset.lit = 'true';
      return;
    }

    // Read the dot unit (ms) from a CSS var so it can be themed; default 170ms.
    const dotRaw = parseFloat(getComputedStyle(this).getPropertyValue('--blink-dot'));
    const DOT = Number.isFinite(dotRaw) && dotRaw > 0 ? dotRaw : 170;
    const totalUnits = segments.reduce((a, s) => a + s.dur, 0) + 7; // trailing word gap

    let elapsed = 0;
    let lastT = null;
    const tick = (t) => {
      this._morseRAF = requestAnimationFrame(tick);
      if (lastT == null) lastT = t;
      const dt = t - lastT;
      lastT = t;
      if (this._isPaused()) return; // freeze the timeline while paused
      elapsed += dt;
      const cycle = (elapsed / DOT) % totalUnits;
      let acc = 0;
      let lit = false;
      for (const s of segments) {
        if (cycle < acc + s.dur) {
          lit = s.lit;
          break;
        }
        acc += s.dur;
      }
      const next = lit ? 'true' : 'false';
      if (this.dataset.lit !== next) this.dataset.lit = next;
    };
    this.dataset.lit = 'false';
    this._morseRAF = requestAnimationFrame(tick);
  }

  // Build an on/off timeline (durations in Morse "units") for a string.
  _morseSegments(text) {
    const segments = [];
    const words = text.toLowerCase().split(/\s+/).filter(Boolean);
    words.forEach((word, wi) => {
      const chars = [...word].filter((c) => MORSE[c]);
      chars.forEach((c, ci) => {
        const symbols = MORSE[c];
        [...symbols].forEach((sym, si) => {
          segments.push({ lit: true, dur: sym === '-' ? 3 : 1 });
          if (si < symbols.length - 1) segments.push({ lit: false, dur: 1 });
        });
        if (ci < chars.length - 1) segments.push({ lit: false, dur: 3 }); // inter-char gap
      });
      if (wi < words.length - 1) segments.push({ lit: false, dur: 7 }); // inter-word gap
    });
    return segments;
  }

  // Human-readable dot/dash string, words separated by " / ".
  _toMorse(text) {
    return text
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean)
      .map((word) =>
        [...word]
          .map((c) => MORSE[c] || '')
          .filter(Boolean)
          .join(' ')
      )
      .filter(Boolean)
      .join(' / ');
  }

  _observe() {
    this._intersectionObserver = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          this.dataset.visible = String(e.isIntersecting);
        }),
      { rootMargin: '100px' }
    );
    this._intersectionObserver.observe(this);

    this._onVisibility = () => {
      this.dataset.tabVisible = String(!document.hidden);
    };
    document.addEventListener('visibilitychange', this._onVisibility);
    this.dataset.tabVisible = String(!document.hidden);

    this._onIteration = () => this._dispatch('blink-cycle');
    this._content.addEventListener('animationiteration', this._onIteration);
  }

  _update() {
    if (!this._built && !this._content) return;

    // Reflect state to data-* hooks the CSS keys off.
    this.dataset.behavior = this.behavior;
    this.dataset.state = this.playState;
    this.dataset.ready = '';

    this.style.setProperty('--blink-rate', this.rate);
    if (this.minOpacity != null) {
      this.style.setProperty('--blink-min-opacity', this.minOpacity);
    } else {
      this.style.removeProperty('--blink-min-opacity');
    }
    if (this.count !== 'infinite') {
      this.style.setProperty('--blink-count', this.count);
    } else {
      this.style.removeProperty('--blink-count');
    }

    this._syncMorse();
    this._syncSteps();
    this._syncDecode();
  }

  _stopDecode() {
    if (this._decodeRAF) cancelAnimationFrame(this._decodeRAF);
    this._decodeRAF = null;
  }

  // decode mode: each unit flickers through random glyphs, then locks onto its
  // real character (stored in data-ch), staggered left-to-right, then
  // re-scrambles on a loop. Monospace keeps the width stable as glyphs change.
  // Freezes when paused; shows the plain text under reduced motion.
  _syncDecode() {
    this._stopDecode();
    if (this.mode !== 'decode') return;

    const units = [...this.querySelectorAll('.blink-char')].filter(
      (s) => !s.classList.contains('blink-space') && s.dataset.ch != null
    );
    if (units.length === 0) return;

    const reduce =
      this.getAttribute('reduced-motion') !== 'ignore' &&
      matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      for (const s of units) s.textContent = s.dataset.ch;
      return;
    }

    const randGlyph = () => DECODE_GLYPHS[(Math.random() * DECODE_GLYPHS.length) | 0];

    const SCRAMBLE_MS = 650;
    const STAGGER_MS = 45;
    const HOLD_MS = 1800;
    const FLIP_MS = 55;
    let maxSettle = 0;
    const items = units.map((s) => {
      const i = Number(s.style.getPropertyValue('--i')) || 0;
      const settleAt = SCRAMBLE_MS + i * STAGGER_MS;
      if (settleAt > maxSettle) maxSettle = settleAt;
      return { s, settleAt, target: s.dataset.ch };
    });

    let elapsed = 0;
    let lastT = null;
    let lastFlip = 0;
    const tick = (t) => {
      this._decodeRAF = requestAnimationFrame(tick);
      if (lastT == null) lastT = t;
      const dt = t - lastT;
      lastT = t;
      if (this._isPaused()) return; // freeze the timeline while paused
      elapsed += dt;
      const flip = elapsed - lastFlip >= FLIP_MS;
      if (flip) lastFlip = elapsed;
      for (const it of items) {
        if (elapsed >= it.settleAt) {
          if (it.s.textContent !== it.target) it.s.textContent = it.target;
        } else if (flip) {
          it.s.textContent = randGlyph();
        }
      }
      if (elapsed > maxSettle + HOLD_MS) {
        elapsed = 0;
        lastFlip = 0;
      }
    };
    this._decodeRAF = requestAnimationFrame(tick);
  }

  // Whether the multi-step engine should drive this element.
  _usesSteps() {
    return this.behavior === 'steps' || STEP_MODES.includes(this.mode);
  }

  // Parse a CSS time (e.g. "1s", "800ms", or a bare number of seconds) to ms.
  _parseTime(value) {
    const t = String(value).trim();
    let ms;
    if (t.endsWith('ms')) ms = parseFloat(t);
    else if (t.endsWith('s')) ms = parseFloat(t) * 1000;
    else ms = parseFloat(t) * 1000;
    return Number.isFinite(ms) && ms > 0 ? ms : 1000;
  }

  _stopSteps() {
    if (this._stepRAF) cancelAnimationFrame(this._stepRAF);
    this._stepRAF = null;
  }

  // Parse `step-durations` into per-step weights, one per step. Accepts a
  // space- or comma-separated list (e.g. "3 1 1" or "2,1"); the list is cycled
  // or truncated to fit the step count. Absent/invalid → equal weights.
  _stepWeights(n) {
    const raw = this.stepDurations;
    if (!raw) return Array(n).fill(1);
    const parts = raw
      .split(/[\s,]+/)
      .map(Number)
      .filter((v) => Number.isFinite(v) && v > 0);
    if (parts.length === 0) return Array(n).fill(1);
    return Array.from({ length: n }, (_, i) => parts[i % parts.length]);
  }

  // The element(s) that carry data-step: the whole content for step-by="element",
  // or each unit span for step-by="letter"/"word".
  _stepTargets() {
    if (this.stepBy !== 'element' && this.dataset.split != null) {
      return [...this.querySelectorAll('.blink-char')];
    }
    return this._content ? [this._content] : [];
  }

  // Clear any data-step left on the content or unit spans (when stepping stops).
  _clearStepTargets() {
    delete this._content?.dataset.step;
    this.querySelectorAll('.blink-char[data-step]').forEach((el) => delete el.dataset.step);
  }

  // Multi-step engine: advance data-step="0..N-1" across one cycle (`rate`). Each
  // step holds for a slice of the cycle — equal by default, or weighted by
  // `step-durations`. CSS styles each step (colour, transform, outline, …) and
  // can give each step its own transition timing (--blink-step-ease /
  // --blink-step-timing); a plain blink is the 2-step case. With step-by="letter"
  // (or "word") every unit runs the sequence offset by its index, so the states
  // ripple across the text. Freezes when paused/off-screen/tab-hidden; rests at
  // step 0 under reduced motion.
  _syncSteps() {
    this._stopSteps();
    if (!this._usesSteps()) {
      delete this.dataset.stepping;
      this._clearStepTargets();
      return;
    }
    this.dataset.stepping = '';

    const n = this.steps;
    const targets = this._stepTargets();
    if (targets.length === 0) return;

    const reduce =
      this.getAttribute('reduced-motion') !== 'ignore' &&
      matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      for (const el of targets) el.dataset.step = '0';
      return;
    }

    // Build cumulative time boundaries (ms) for each step from its weight.
    const weights = this._stepWeights(n);
    const total = weights.reduce((a, b) => a + b, 0);
    const cycleMs = this._parseTime(this.rate);
    const bounds = [];
    let acc = 0;
    for (const w of weights) {
      acc += w;
      bounds.push((acc / total) * cycleMs);
    }

    // Per-unit stepping offsets each unit's phase by a stagger so the states
    // travel across the text. Read --blink-stagger (seconds) for the step.
    const perUnit = targets.length > 1;
    const staggerMs = perUnit
      ? (parseFloat(getComputedStyle(this).getPropertyValue('--blink-stagger')) || 0.08) * 1000
      : 0;

    const stepAt = (pos) => {
      let idx = 0;
      while (idx < n - 1 && pos >= bounds[idx]) idx++;
      return idx;
    };

    const prev = new Array(targets.length).fill(0);
    targets.forEach((el) => (el.dataset.step = '0'));
    let elapsed = 0;
    let lastT = null;
    const tick = (t) => {
      this._stepRAF = requestAnimationFrame(tick);
      if (lastT == null) lastT = t;
      const dt = t - lastT;
      lastT = t;
      if (this._isPaused()) return; // freeze the timeline while paused
      elapsed += dt;
      for (let k = 0; k < targets.length; k++) {
        const idx = stepAt((elapsed + k * staggerMs) % cycleMs);
        if (idx !== prev[k]) {
          targets[k].dataset.step = String(idx);
          if (k === 0 && idx < prev[k]) this._dispatch('blink-cycle'); // wrapped to start
          prev[k] = idx;
        }
      }
    };
    this._stepRAF = requestAnimationFrame(tick);
  }

  _dispatch(name) {
    this.dispatchEvent(new CustomEvent(name, { bubbles: true }));
  }
}

customElements.define('blink-wc', BlinkWc);

export { BlinkWc };
