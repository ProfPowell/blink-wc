const M = [
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
], w = ["extrude", "collapse", "outline", "morph", "depth", "revolve"], C = { morph: 4, revolve: 4 }, E = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*+=?<>/~^|", S = {
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
}, F = matchMedia("(prefers-reduced-motion: reduce)"), v = /* @__PURE__ */ new Set();
let y = null;
const T = () => F.matches || document.documentElement.hasAttribute("data-motion-reduced"), k = () => v.forEach((g) => g._update());
function x(g) {
  v.add(g), !y && (F.addEventListener("change", k), y = new MutationObserver(k), y.observe(document.documentElement, {
    attributes: !0,
    attributeFilter: ["data-motion-reduced"]
  }));
}
function L(g) {
  v.delete(g), !(v.size || !y) && (F.removeEventListener("change", k), y.disconnect(), y = null);
}
class R extends HTMLElement {
  static get observedAttributes() {
    return [
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
    ];
  }
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
    return Number.isFinite(t) && t >= 2 ? t : C[this.mode] || 2;
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
    if (x(this), this._built) {
      this._observe(), this._update();
      return;
    }
    this._build(), this._observe(), this._update(), this._built = !0, this._dispatch("blink-start");
  }
  disconnectedCallback() {
    var t, e;
    L(this), (t = this._intersectionObserver) == null || t.disconnect(), (e = this._content) == null || e.removeEventListener("animationiteration", this._onIteration), document.removeEventListener("visibilitychange", this._onVisibility), this._stopMorse(), this._stopSteps(), this._stopDecode();
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
    e.className = "blink-content", t.forEach((s) => e.appendChild(s)), this.appendChild(e), this._content = e, this._sourceHTML = e.innerHTML, this._renderContent();
  }
  // Restore authored markup, then split into units if the mode needs it. Per-unit
  // motion modes split by `unit`; per-unit step sequences split by `step-by`.
  _renderContent() {
    if (this._sourceHTML == null) return;
    this._content.innerHTML = this._sourceHTML;
    const t = this._usesSteps() && this.stepBy !== "element";
    if (M.includes(this.mode) || t) {
      const e = t ? this.stepBy === "word" : this.unit === "word";
      this._splitLetters(e), this.dataset.split = "";
    } else
      delete this.dataset.split;
  }
  // Wrap each unit in a <span class="blink-char"> with a stagger index, so CSS
  // can animate units individually (wave, twinkle, …) and the step engine can
  // advance each unit's data-step on its own staggered clock.
  _splitLetters(t = this.unit === "word") {
    const e = document.createTreeWalker(this._content, NodeFilter.SHOW_TEXT), s = [];
    for (; e.nextNode(); ) s.push(e.currentNode);
    const r = this.mode === "twinkle" || this.mode === "sparkle", u = this.mode === "decode", d = (o) => o.trim() === "";
    let p = 0;
    for (const o of s) {
      const _ = document.createDocumentFragment(), h = t ? this._tokenizeWords(o.textContent) : [...o.textContent];
      for (const a of h) {
        if (a === "") continue;
        const m = d(a), c = document.createElement("span");
        c.className = "blink-char", c.style.setProperty("--i", p++), r && (c.style.setProperty("--rate", `${(0.4 + Math.random() * 1.6).toFixed(2)}s`), c.style.setProperty("--delay", `${Math.random().toFixed(2)}s`)), m ? (c.classList.add("blink-space"), c.textContent = " ") : (c.textContent = a, u && (c.dataset.ch = a)), _.appendChild(c);
      }
      o.replaceWith(_);
    }
    this._content.style.setProperty("--n", p);
  }
  // Split text into word and whitespace-run tokens (no regex escapes needed).
  _tokenizeWords(t) {
    const e = [];
    let s = "", r = null;
    for (const u of t) {
      const d = u.trim() === "";
      s !== "" && d !== r && (e.push(s), s = ""), s += u, r = d;
    }
    return s !== "" && e.push(s), e;
  }
  // Whether motion should be suppressed: OS preference or VB's data-motion-reduced,
  // unless this instance opts out with reduced-motion="ignore".
  _reduceMotion() {
    return this.getAttribute("reduced-motion") !== "ignore" && T();
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
    var h;
    if (this._stopMorse(), this.mode !== "morse") {
      delete this.dataset.lit, delete this.dataset.morse;
      return;
    }
    const t = (((h = this._content) == null ? void 0 : h.textContent) || "").trim();
    if (this.dataset.morse = this._toMorse(t), this._reduceMotion()) {
      this.dataset.lit = "true";
      return;
    }
    const s = this._morseSegments(t);
    if (s.length === 0) {
      this.dataset.lit = "true";
      return;
    }
    const r = parseFloat(getComputedStyle(this).getPropertyValue("--blink-dot")), u = Number.isFinite(r) && r > 0 ? r : 170, d = s.reduce((a, m) => a + m.dur, 0) + 7;
    let p = 0, o = null;
    const _ = (a) => {
      this._morseRAF = requestAnimationFrame(_), o == null && (o = a);
      const m = a - o;
      if (o = a, this._isPaused()) return;
      p += m;
      const c = p / u % d;
      let n = 0, f = !1;
      for (const l of s) {
        if (c < n + l.dur) {
          f = l.lit;
          break;
        }
        n += l.dur;
      }
      const i = f ? "true" : "false";
      this.dataset.lit !== i && (this.dataset.lit = i);
    };
    this.dataset.lit = "false", this._morseRAF = requestAnimationFrame(_);
  }
  // Build an on/off timeline (durations in Morse "units") for a string.
  _morseSegments(t) {
    const e = [], s = t.toLowerCase().split(/\s+/).filter(Boolean);
    return s.forEach((r, u) => {
      const d = [...r].filter((p) => S[p]);
      d.forEach((p, o) => {
        const _ = S[p];
        [..._].forEach((h, a) => {
          e.push({ lit: !0, dur: h === "-" ? 3 : 1 }), a < _.length - 1 && e.push({ lit: !1, dur: 1 });
        }), o < d.length - 1 && e.push({ lit: !1, dur: 3 });
      }), u < s.length - 1 && e.push({ lit: !1, dur: 7 });
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
      (n) => !n.classList.contains("blink-space") && n.dataset.ch != null
    );
    if (t.length === 0) return;
    if (this._reduceMotion()) {
      for (const n of t) n.textContent = n.dataset.ch;
      return;
    }
    const s = () => E[Math.random() * E.length | 0], r = 650, u = 45, d = 1800, p = 55;
    let o = 0;
    const _ = t.map((n) => {
      const f = Number(n.style.getPropertyValue("--i")) || 0, i = r + f * u;
      return i > o && (o = i), { s: n, settleAt: i, target: n.dataset.ch };
    });
    let h = 0, a = null, m = 0;
    const c = (n) => {
      this._decodeRAF = requestAnimationFrame(c), a == null && (a = n);
      const f = n - a;
      if (a = n, this._isPaused()) return;
      h += f;
      const i = h - m >= p;
      i && (m = h);
      for (const l of _)
        h >= l.settleAt ? l.s.textContent !== l.target && (l.s.textContent = l.target) : i && (l.s.textContent = s());
      h > o + d && (h = 0, m = 0);
    };
    this._decodeRAF = requestAnimationFrame(c);
  }
  // Whether the multi-step engine should drive this element.
  _usesSteps() {
    return this.behavior === "steps" || w.includes(this.mode);
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
    const s = e.split(/[\s,]+/).map(Number).filter((r) => Number.isFinite(r) && r > 0);
    return s.length === 0 ? Array(t).fill(1) : Array.from({ length: t }, (r, u) => s[u % s.length]);
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
      for (const i of e) i.dataset.step = "0";
      return;
    }
    const r = this._stepWeights(t), u = r.reduce((i, l) => i + l, 0), d = this._parseTime(this.rate), p = [];
    let o = 0;
    for (const i of r)
      o += i, p.push(o / u * d);
    const h = e.length > 1 ? (parseFloat(getComputedStyle(this).getPropertyValue("--blink-stagger")) || 0.08) * 1e3 : 0, a = (i) => {
      let l = 0;
      for (; l < t - 1 && i >= p[l]; ) l++;
      return l;
    }, m = new Array(e.length).fill(0);
    e.forEach((i) => i.dataset.step = "0");
    let c = 0, n = null;
    const f = (i) => {
      this._stepRAF = requestAnimationFrame(f), n == null && (n = i);
      const l = i - n;
      if (n = i, !this._isPaused()) {
        c += l;
        for (let b = 0; b < e.length; b++) {
          const A = a((c + b * h) % d);
          A !== m[b] && (e[b].dataset.step = String(A), b === 0 && A < m[b] && this._dispatch("blink-cycle"), m[b] = A);
        }
      }
    };
    this._stepRAF = requestAnimationFrame(f);
  }
  _dispatch(t) {
    this.dispatchEvent(new CustomEvent(t, { bubbles: !0 }));
  }
}
customElements.define("blink-wc", R);
export {
  R as BlinkWc
};
//# sourceMappingURL=blink-wc.js.map
