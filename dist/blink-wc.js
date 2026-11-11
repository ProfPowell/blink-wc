var L = Object.defineProperty;
var R = (r, t, e) => t in r ? L(r, t, { enumerable: !0, configurable: !0, writable: !0, value: e }) : r[t] = e;
var C = (r, t, e) => R(r, typeof t != "symbol" ? t + "" : t, e);
const P = [
  "wave",
  "twinkle",
  "sparkle",
  "rainbow",
  "chase",
  "glitch",
  "cascade",
  "typewriter",
  "zoom",
  "flip3d",
  "swing",
  "shake",
  "heartbeat",
  "decode"
], N = ["extrude", "collapse", "outline", "morph", "depth", "revolve"], O = { morph: 4, revolve: 4 }, w = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*+=?<>/~^|", S = {
  a: ".-",
  b: "-...",
  c: "-.-.",
  d: "-..",
  e: ".",
  f: "..-.",
  g: "--.",
  h: "....",
  i: "..",
  j: ".---",
  k: "-.-",
  l: ".-..",
  m: "--",
  n: "-.",
  o: "---",
  p: ".--.",
  q: "--.-",
  r: ".-.",
  s: "...",
  t: "-",
  u: "..-",
  v: "...-",
  w: ".--",
  x: "-..-",
  y: "-.--",
  z: "--..",
  0: "-----",
  1: ".----",
  2: "..---",
  3: "...--",
  4: "....-",
  5: ".....",
  6: "-....",
  7: "--...",
  8: "---..",
  9: "----.",
  ".": ".-.-.-",
  ",": "--..--",
  "?": "..--..",
  "'": ".----.",
  "!": "-.-.--",
  "/": "-..-.",
  "(": "-.--.",
  ")": "-.--.-",
  "&": ".-...",
  ":": "---...",
  "=": "-...-",
  "+": ".-.-.",
  "-": "-....-",
  "@": ".--.-."
}, M = matchMedia("(prefers-reduced-motion: reduce)"), v = /* @__PURE__ */ new Set();
let y = null;
const D = () => M.matches || document.documentElement.hasAttribute("data-motion-reduced"), E = () => v.forEach((r) => r._update());
function W(r) {
  v.add(r), !y && (M.addEventListener("change", E), y = new MutationObserver(E), y.observe(document.documentElement, {
    attributes: !0,
    attributeFilter: ["data-motion-reduced"]
  }));
}
function I(r) {
  v.delete(r), !(v.size || !y) && (M.removeEventListener("change", E), y.disconnect(), y = null);
}
const k = /* @__PURE__ */ new Map();
function T(r, t) {
  const e = `${r || ""}|${t}`;
  return k.has(e) || k.set(e, new Intl.Segmenter(r, { granularity: t })), k.get(e);
}
const F = (r) => r.trim() === "";
function q(r, t) {
  return [...T(t, "grapheme").segment(r)].map((e) => e.segment);
}
function B(r, t) {
  const e = [];
  for (const { segment: s, isWordLike: a } of T(t, "word").segment(r)) {
    const m = F(s), l = e.length ? e[e.length - 1] : null, c = l != null && F(l);
    l != null && (m && c || !m && !a && !c) ? e[e.length - 1] += s : e.push(s);
  }
  return e;
}
const H = "a[href], button, input, select, textarea, summary, [tabindex], [contenteditable]";
class x extends HTMLElement {
  // ── Functional core: pure getters ──────────────────────────────────────
  get rate() {
    return this.getAttribute("rate") || "1s";
  }
  get behavior() {
    const t = this.getAttribute("behavior");
    return ["pulse", "flicker", "steps"].includes(t) ? t : "blink";
  }
  get minOpacity() {
    const t = this.getAttribute("min-opacity");
    return t == null || t === "" ? null : t;
  }
  get count() {
    return this.getAttribute("count") || "infinite";
  }
  get steps() {
    const t = parseInt(this.getAttribute("steps"), 10);
    return Number.isFinite(t) && t >= 2 ? t : O[this.mode] || 2;
  }
  get stepDurations() {
    return this.getAttribute("step-durations") || null;
  }
  get stepBy() {
    const t = this.getAttribute("step-by");
    return t === "letter" || t === "word" ? t : "element";
  }
  get playState() {
    return this.getAttribute("play-state") || "running";
  }
  get mode() {
    return this.getAttribute("mode") || "";
  }
  get unit() {
    return this.getAttribute("unit") === "word" ? "word" : "letter";
  }
  // ── Imperative shell ───────────────────────────────────────────────────
  connectedCallback() {
    if (W(this), this._built) {
      this._observe(), this._update();
      return;
    }
    this._build(), this._observe(), this._update(), this._built = !0, this._dispatch("blink-start");
  }
  // Moved with Node.moveBefore(): the browser skips disconnected/connected and
  // keeps animation state, so there is nothing to tear down or rebuild. (Where
  // moveBefore() is unsupported, a move falls back to the reconnect path above.)
  connectedMoveCallback() {
  }
  disconnectedCallback() {
    var t, e;
    I(this), (t = this._intersectionObserver) == null || t.disconnect(), (e = this._content) == null || e.removeEventListener("animationiteration", this._onIteration), document.removeEventListener("visibilitychange", this._onVisibility), this._stopMorse(), this._stopSteps(), this._stopDecode();
  }
  attributeChangedCallback(t, e, s) {
    e === s || !this._built || ((t === "mode" || t === "unit" || t === "step-by" || t === "behavior") && this._renderContent(), this._update(), t === "play-state" && this._dispatch(s === "paused" ? "blink-pause" : "blink-start"));
  }
  // ── Public API (legacy <blink> compat) ──────────────────────────────────
  start() {
    this.setAttribute("play-state", "running");
  }
  stop() {
    this.setAttribute("play-state", "paused");
  }
  toggle() {
    this.playState === "paused" ? this.start() : this.stop();
  }
  refresh() {
    this._renderContent(), this._update();
  }
  // ── Private ────────────────────────────────────────────────────────────
  _build() {
    const t = [...this.childNodes];
    this.textContent = "";
    const e = document.createElement("span");
    e.className = "blink-content", t.forEach((s) => e.appendChild(s)), this.appendChild(e), this._content = e, this._sourceHTML = e.innerHTML, this._sourceText = e.textContent.replace(/\s+/g, " ").trim(), this._renderContent();
  }
  // Restore authored markup, then split into units if the mode needs it. Per-unit
  // motion modes split by `unit`; per-unit step sequences split by `step-by`.
  _renderContent() {
    if (this._sourceHTML == null) return;
    this._content.innerHTML = this._sourceHTML;
    const t = this._usesSteps() && this.stepBy !== "element";
    if (P.includes(this.mode) || t) {
      const e = t ? this.stepBy === "word" : this.unit === "word";
      this._splitLetters(e), this.dataset.split = "";
    } else
      delete this.dataset.split;
    this._syncSpeech();
  }
  // Per-unit spans make screen readers spell the text out letter by letter (and
  // decode would expose its scrambled glyphs). When split, hide the animated
  // spans and expose one visually-hidden copy of the original text instead.
  _syncSpeech() {
    var s;
    const t = this.hasAttribute("data-split"), e = t && this._content.querySelector(H);
    t && !e ? (this._speech || (this._speech = document.createElement("span"), this._speech.className = "blink-sr"), this._speech.textContent = this._sourceText, this._content.setAttribute("aria-hidden", "true"), this._speech.isConnected || this._content.after(this._speech)) : (this._content.removeAttribute("aria-hidden"), (s = this._speech) == null || s.remove());
  }
  // Wrap each unit in a <span class="blink-char"> with a stagger index, so CSS
  // can animate units individually (wave, twinkle, …) and the step engine can
  // advance each unit's data-step on its own staggered clock.
  _splitLetters(t = this.unit === "word") {
    var h;
    const e = document.createTreeWalker(this._content, NodeFilter.SHOW_TEXT), s = [];
    for (; e.nextNode(); ) s.push(e.currentNode);
    const a = this.mode === "twinkle" || this.mode === "sparkle", m = this.mode === "decode", l = ((h = this.closest("[lang]")) == null ? void 0 : h.lang) || void 0;
    let c = 0;
    for (const _ of s) {
      const u = document.createDocumentFragment(), d = t ? B(_.textContent, l) : q(_.textContent, l);
      for (const p of d) {
        if (p === "") continue;
        const f = F(p), i = document.createElement("span");
        i.className = "blink-char", i.style.setProperty("--i", c++), a && (i.style.setProperty("--rate", `${(0.4 + Math.random() * 1.6).toFixed(2)}s`), i.style.setProperty("--delay", `${Math.random().toFixed(2)}s`)), f ? (i.classList.add("blink-space"), i.textContent = " ") : (i.textContent = p, m && (i.dataset.ch = p)), u.appendChild(i);
      }
      _.replaceWith(u);
    }
    this._content.style.setProperty("--n", c);
  }
  // Whether motion should be suppressed: OS preference or VB's data-motion-reduced,
  // unless this instance opts out with reduced-motion="ignore".
  _reduceMotion() {
    return this.getAttribute("reduced-motion") !== "ignore" && D();
  }
  // Whether playback is currently paused (state, off-screen, tab-hidden, or hover).
  _isPaused() {
    return this.hasAttribute("pause-on-hover") && this.matches(":hover, :focus-within") ? !0 : this.playState === "paused" || this.dataset.visible === "false" || this.dataset.tabVisible === "false";
  }
  _stopMorse() {
    this._morseRAF && cancelAnimationFrame(this._morseRAF), this._morseRAF = null;
  }
  // morse mode: blink the text out as Morse code. CSS keys off data-lit to light
  // the text; we also expose the dot/dash string via data-morse for a caption.
  _syncMorse() {
    var u;
    if (this._stopMorse(), this.mode !== "morse") {
      delete this.dataset.lit, delete this.dataset.morse;
      return;
    }
    const t = (((u = this._content) == null ? void 0 : u.textContent) || "").trim();
    if (this.dataset.morse = this._toMorse(t), this._reduceMotion()) {
      this.dataset.lit = "true";
      return;
    }
    const s = this._morseSegments(t);
    if (s.length === 0) {
      this.dataset.lit = "true";
      return;
    }
    const a = parseFloat(getComputedStyle(this).getPropertyValue("--blink-dot")), m = Number.isFinite(a) && a > 0 ? a : 170, l = s.reduce((d, p) => d + p.dur, 0) + 7;
    let c = 0, h = null;
    const _ = (d) => {
      this._morseRAF = requestAnimationFrame(_), h == null && (h = d);
      const p = d - h;
      if (h = d, this._isPaused()) return;
      c += p;
      const f = c / m % l;
      let i = 0, b = !1;
      for (const o of s) {
        if (f < i + o.dur) {
          b = o.lit;
          break;
        }
        i += o.dur;
      }
      const n = b ? "true" : "false";
      this.dataset.lit !== n && (this.dataset.lit = n);
    };
    this.dataset.lit = "false", this._morseRAF = requestAnimationFrame(_);
  }
  // Build an on/off timeline (durations in Morse "units") for a string.
  _morseSegments(t) {
    const e = [], s = t.toLowerCase().split(/\s+/).filter(Boolean);
    return s.forEach((a, m) => {
      const l = [...a].filter((c) => S[c]);
      l.forEach((c, h) => {
        const _ = S[c];
        [..._].forEach((u, d) => {
          e.push({ lit: !0, dur: u === "-" ? 3 : 1 }), d < _.length - 1 && e.push({ lit: !1, dur: 1 });
        }), h < l.length - 1 && e.push({ lit: !1, dur: 3 });
      }), m < s.length - 1 && e.push({ lit: !1, dur: 7 });
    }), e;
  }
  // Human-readable dot/dash string, words separated by " / ".
  _toMorse(t) {
    return t.toLowerCase().split(/\s+/).filter(Boolean).map(
      (e) => [...e].map((s) => S[s] || "").filter(Boolean).join(" ")
    ).filter(Boolean).join(" / ");
  }
  _observe() {
    this._intersectionObserver = new IntersectionObserver(
      (t) => t.forEach((e) => {
        this.dataset.visible = String(e.isIntersecting);
      }),
      { rootMargin: "100px" }
    ), this._intersectionObserver.observe(this), this._onVisibility = () => {
      this.dataset.tabVisible = String(!document.hidden);
    }, document.addEventListener("visibilitychange", this._onVisibility), this.dataset.tabVisible = String(!document.hidden), this._onIteration = () => this._dispatch("blink-cycle"), this._content.addEventListener("animationiteration", this._onIteration);
  }
  _update() {
    !this._built && !this._content || (this.dataset.behavior = this.behavior, this.dataset.state = this.playState, this.dataset.ready = "", this.style.setProperty("--blink-rate", this.rate), this.minOpacity != null ? this.style.setProperty("--blink-min-opacity", this.minOpacity) : this.style.removeProperty("--blink-min-opacity"), this.count !== "infinite" ? this.style.setProperty("--blink-count", this.count) : this.style.removeProperty("--blink-count"), this._syncMorse(), this._syncSteps(), this._syncDecode());
  }
  _stopDecode() {
    this._decodeRAF && cancelAnimationFrame(this._decodeRAF), this._decodeRAF = null;
  }
  // decode mode: each unit flickers through random glyphs, then locks onto its
  // real character (stored in data-ch), staggered left-to-right, then
  // re-scrambles on a loop. Monospace keeps the width stable as glyphs change.
  // Freezes when paused; shows the plain text under reduced motion.
  _syncDecode() {
    if (this._stopDecode(), this.mode !== "decode") return;
    const t = [...this.querySelectorAll(".blink-char")].filter(
      (i) => !i.classList.contains("blink-space") && i.dataset.ch != null
    );
    if (t.length === 0) return;
    if (this._reduceMotion()) {
      for (const i of t) i.textContent = i.dataset.ch;
      return;
    }
    const s = () => w[Math.random() * w.length | 0], a = 650, m = 45, l = 1800, c = 55;
    let h = 0;
    const _ = t.map((i) => {
      const b = Number(i.style.getPropertyValue("--i")) || 0, n = a + b * m;
      return n > h && (h = n), { s: i, settleAt: n, target: i.dataset.ch };
    });
    let u = 0, d = null, p = 0;
    const f = (i) => {
      this._decodeRAF = requestAnimationFrame(f), d == null && (d = i);
      const b = i - d;
      if (d = i, this._isPaused()) return;
      u += b;
      const n = u - p >= c;
      n && (p = u);
      for (const o of _)
        u >= o.settleAt ? o.s.textContent !== o.target && (o.s.textContent = o.target) : n && (o.s.textContent = s());
      u > h + l && (u = 0, p = 0);
    };
    this._decodeRAF = requestAnimationFrame(f);
  }
  // Whether the multi-step engine should drive this element.
  _usesSteps() {
    return this.behavior === "steps" || N.includes(this.mode);
  }
  // Parse a CSS time (e.g. "1s", "800ms", or a bare number of seconds) to ms.
  _parseTime(t) {
    const e = String(t).trim();
    let s;
    return e.endsWith("ms") ? s = parseFloat(e) : (e.endsWith("s"), s = parseFloat(e) * 1e3), Number.isFinite(s) && s > 0 ? s : 1e3;
  }
  _stopSteps() {
    this._stepRAF && cancelAnimationFrame(this._stepRAF), this._stepRAF = null;
  }
  // Parse `step-durations` into per-step weights, one per step. Accepts a
  // space- or comma-separated list (e.g. "3 1 1" or "2,1"); the list is cycled
  // or truncated to fit the step count. Absent/invalid → equal weights.
  _stepWeights(t) {
    const e = this.stepDurations;
    if (!e) return Array(t).fill(1);
    const s = e.split(/[\s,]+/).map(Number).filter((a) => Number.isFinite(a) && a > 0);
    return s.length === 0 ? Array(t).fill(1) : Array.from({ length: t }, (a, m) => s[m % s.length]);
  }
  // The element(s) that carry data-step: the whole content for step-by="element",
  // or each unit span for step-by="letter"/"word".
  _stepTargets() {
    return this.stepBy !== "element" && this.dataset.split != null ? [...this.querySelectorAll(".blink-char")] : this._content ? [this._content] : [];
  }
  // Clear any data-step left on the content or unit spans (when stepping stops).
  _clearStepTargets() {
    var t;
    (t = this._content) == null || delete t.dataset.step, this.querySelectorAll(".blink-char[data-step]").forEach((e) => delete e.dataset.step);
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
    if (this._stopSteps(), !this._usesSteps()) {
      delete this.dataset.stepping, this._clearStepTargets();
      return;
    }
    this.dataset.stepping = "";
    const t = this.steps, e = this._stepTargets();
    if (e.length === 0) return;
    if (this._reduceMotion()) {
      for (const n of e) n.dataset.step = "0";
      return;
    }
    const a = this._stepWeights(t), m = a.reduce((n, o) => n + o, 0), l = this._parseTime(this.rate), c = [];
    let h = 0;
    for (const n of a)
      h += n, c.push(h / m * l);
    const u = e.length > 1 ? (parseFloat(getComputedStyle(this).getPropertyValue("--blink-stagger")) || 0.08) * 1e3 : 0, d = (n) => {
      let o = 0;
      for (; o < t - 1 && n >= c[o]; ) o++;
      return o;
    }, p = new Array(e.length).fill(0);
    e.forEach((n) => n.dataset.step = "0");
    let f = 0, i = null;
    const b = (n) => {
      this._stepRAF = requestAnimationFrame(b), i == null && (i = n);
      const o = n - i;
      if (i = n, !this._isPaused()) {
        f += o;
        for (let g = 0; g < e.length; g++) {
          const A = d((f + g * u) % l);
          A !== p[g] && (e[g].dataset.step = String(A), g === 0 && A < p[g] && this._dispatch("blink-cycle"), p[g] = A);
        }
      }
    };
    this._stepRAF = requestAnimationFrame(b);
  }
  _dispatch(t) {
    this.dispatchEvent(new CustomEvent(t, { bubbles: !0 }));
  }
}
C(x, "observedAttributes", [
  "rate",
  "behavior",
  "min-opacity",
  "count",
  "steps",
  "step-durations",
  "step-by",
  "play-state",
  "pause-on-hover",
  "reduced-motion",
  "mode",
  "unit"
]);
customElements.define("blink-wc", x);
export {
  x as BlinkWc
};
//# sourceMappingURL=blink-wc.js.map
