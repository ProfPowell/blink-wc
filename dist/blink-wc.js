const y = [
  "wave",
  "twinkle",
  "sparkle",
  "rainbow",
  "chase",
  "glitch",
  "cascade",
  "typewriter"
], g = ["extrude", "collapse", "outline", "morph"], k = { morph: 4 }, p = {
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
};
class v extends HTMLElement {
  static get observedAttributes() {
    return [
      "rate",
      "behavior",
      "min-opacity",
      "count",
      "steps",
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
    return Number.isFinite(t) && t >= 2 ? t : k[this.mode] || 2;
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
    this._built || (this._build(), this._observe(), this._update(), this._built = !0, this._dispatch("blink-start"));
  }
  disconnectedCallback() {
    var t, e;
    (t = this._intersectionObserver) == null || t.disconnect(), (e = this._content) == null || e.removeEventListener("animationiteration", this._onIteration), document.removeEventListener("visibilitychange", this._onVisibility), this._stopMorse(), this._stopSteps();
  }
  attributeChangedCallback(t, e, s) {
    e === s || !this._built || ((t === "mode" || t === "unit") && this._renderContent(), this._update(), t === "play-state" && this._dispatch(s === "paused" ? "blink-pause" : "blink-start"));
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
  // Restore authored markup, then split into letters if the mode needs it.
  _renderContent() {
    this._sourceHTML != null && (this._content.innerHTML = this._sourceHTML, y.includes(this.mode) ? (this._splitLetters(), this.dataset.split = "") : delete this.dataset.split);
  }
  // Wrap each character in a <span class="blink-char"> with a stagger index, so
  // CSS can animate units individually (wave, twinkle, sparkle, chase, …).
  _splitLetters() {
    const t = document.createTreeWalker(this._content, NodeFilter.SHOW_TEXT), e = [];
    for (; t.nextNode(); ) e.push(t.currentNode);
    const s = this.unit === "word", r = this.mode === "twinkle" || this.mode === "sparkle", o = (i) => i.trim() === "";
    let n = 0;
    for (const i of e) {
      const a = document.createDocumentFragment(), c = s ? this._tokenizeWords(i.textContent) : [...i.textContent];
      for (const l of c) {
        if (l === "") continue;
        const u = o(l), h = document.createElement("span");
        h.className = "blink-char", h.style.setProperty("--i", n++), r && (h.style.setProperty("--rate", `${(0.4 + Math.random() * 1.6).toFixed(2)}s`), h.style.setProperty("--delay", `${Math.random().toFixed(2)}s`)), u ? (h.classList.add("blink-space"), h.textContent = " ") : h.textContent = l, a.appendChild(h);
      }
      i.replaceWith(a);
    }
    this._content.style.setProperty("--n", n);
  }
  // Split text into word and whitespace-run tokens (no regex escapes needed).
  _tokenizeWords(t) {
    const e = [];
    let s = "", r = null;
    for (const o of t) {
      const n = o.trim() === "";
      s !== "" && n !== r && (e.push(s), s = ""), s += o, r = n;
    }
    return s !== "" && e.push(s), e;
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
    var l;
    if (this._stopMorse(), this.mode !== "morse") {
      delete this.dataset.lit, delete this.dataset.morse;
      return;
    }
    const t = (((l = this._content) == null ? void 0 : l.textContent) || "").trim();
    if (this.dataset.morse = this._toMorse(t), this.getAttribute("reduced-motion") !== "ignore" && matchMedia("(prefers-reduced-motion: reduce)").matches) {
      this.dataset.lit = "true";
      return;
    }
    const s = this._morseSegments(t);
    if (s.length === 0) {
      this.dataset.lit = "true";
      return;
    }
    const r = parseFloat(getComputedStyle(this).getPropertyValue("--blink-dot")), o = Number.isFinite(r) && r > 0 ? r : 170, n = s.reduce((u, h) => u + h.dur, 0) + 7;
    let i = 0, a = null;
    const c = (u) => {
      this._morseRAF = requestAnimationFrame(c), a == null && (a = u);
      const h = u - a;
      if (a = u, this._isPaused()) return;
      i += h;
      const f = i / o % n;
      let m = 0, b = !1;
      for (const d of s) {
        if (f < m + d.dur) {
          b = d.lit;
          break;
        }
        m += d.dur;
      }
      const _ = b ? "true" : "false";
      this.dataset.lit !== _ && (this.dataset.lit = _);
    };
    this.dataset.lit = "false", this._morseRAF = requestAnimationFrame(c);
  }
  // Build an on/off timeline (durations in Morse "units") for a string.
  _morseSegments(t) {
    const e = [], s = t.toLowerCase().split(/\s+/).filter(Boolean);
    return s.forEach((r, o) => {
      const n = [...r].filter((i) => p[i]);
      n.forEach((i, a) => {
        const c = p[i];
        [...c].forEach((l, u) => {
          e.push({ lit: !0, dur: l === "-" ? 3 : 1 }), u < c.length - 1 && e.push({ lit: !1, dur: 1 });
        }), a < n.length - 1 && e.push({ lit: !1, dur: 3 });
      }), o < s.length - 1 && e.push({ lit: !1, dur: 7 });
    }), e;
  }
  // Human-readable dot/dash string, words separated by " / ".
  _toMorse(t) {
    return t.toLowerCase().split(/\s+/).filter(Boolean).map(
      (e) => [...e].map((s) => p[s] || "").filter(Boolean).join(" ")
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
    !this._built && !this._content || (this.dataset.behavior = this.behavior, this.dataset.state = this.playState, this.dataset.ready = "", this.style.setProperty("--blink-rate", this.rate), this.minOpacity != null ? this.style.setProperty("--blink-min-opacity", this.minOpacity) : this.style.removeProperty("--blink-min-opacity"), this.count !== "infinite" ? this.style.setProperty("--blink-count", this.count) : this.style.removeProperty("--blink-count"), this._syncMorse(), this._syncSteps());
  }
  // Whether the multi-step engine should drive this element.
  _usesSteps() {
    return this.behavior === "steps" || g.includes(this.mode);
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
  // Multi-step engine: advance data-step="0..N-1" across one cycle (`rate`),
  // holding each step for an equal slice. CSS styles each step, so a step can
  // change colour, transform, outline, etc. — a plain blink is the 2-step case.
  // Freezes when paused/off-screen/tab-hidden; rests at step 0 under reduced motion.
  _syncSteps() {
    if (this._stopSteps(), !this._usesSteps()) {
      delete this.dataset.step;
      return;
    }
    const t = this.steps;
    if (this.getAttribute("reduced-motion") !== "ignore" && matchMedia("(prefers-reduced-motion: reduce)").matches) {
      this.dataset.step = "0";
      return;
    }
    const s = this._parseTime(this.rate) / t;
    let r = 0, o = null, n = 0;
    this.dataset.step = "0";
    const i = (a) => {
      this._stepRAF = requestAnimationFrame(i), o == null && (o = a);
      const c = a - o;
      if (o = a, this._isPaused()) return;
      r += c;
      const l = Math.floor(r / s) % t;
      l !== n && (this.dataset.step = String(l), l < n && this._dispatch("blink-cycle"), n = l);
    };
    this._stepRAF = requestAnimationFrame(i);
  }
  _dispatch(t) {
    this.dispatchEvent(new CustomEvent(t, { bubbles: !0 }));
  }
}
customElements.define("blink-wc", v);
export {
  v as BlinkWc
};
//# sourceMappingURL=blink-wc.js.map
