const y = [
  "wave",
  "twinkle",
  "sparkle",
  "rainbow",
  "chase",
  "glitch",
  "cascade",
  "typewriter"
], p = {
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
class g extends HTMLElement {
  static get observedAttributes() {
    return [
      "rate",
      "behavior",
      "min-opacity",
      "count",
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
    return t === "pulse" || t === "flicker" ? t : "blink";
  }
  get minOpacity() {
    const t = this.getAttribute("min-opacity");
    return t == null || t === "" ? null : t;
  }
  get count() {
    return this.getAttribute("count") || "infinite";
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
    (t = this._intersectionObserver) == null || t.disconnect(), (e = this._content) == null || e.removeEventListener("animationiteration", this._onIteration), document.removeEventListener("visibilitychange", this._onVisibility), this._stopMorse();
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
    const s = this.unit === "word", r = this.mode === "twinkle" || this.mode === "sparkle", h = (i) => i.trim() === "";
    let o = 0;
    for (const i of e) {
      const a = document.createDocumentFragment(), u = s ? this._tokenizeWords(i.textContent) : [...i.textContent];
      for (const c of u) {
        if (c === "") continue;
        const l = h(c), n = document.createElement("span");
        n.className = "blink-char", n.style.setProperty("--i", o++), r && (n.style.setProperty("--rate", `${(0.4 + Math.random() * 1.6).toFixed(2)}s`), n.style.setProperty("--delay", `${Math.random().toFixed(2)}s`)), l ? (n.classList.add("blink-space"), n.textContent = " ") : n.textContent = c, a.appendChild(n);
      }
      i.replaceWith(a);
    }
    this._content.style.setProperty("--n", o);
  }
  // Split text into word and whitespace-run tokens (no regex escapes needed).
  _tokenizeWords(t) {
    const e = [];
    let s = "", r = null;
    for (const h of t) {
      const o = h.trim() === "";
      s !== "" && o !== r && (e.push(s), s = ""), s += h, r = o;
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
    var c;
    if (this._stopMorse(), this.mode !== "morse") {
      delete this.dataset.lit, delete this.dataset.morse;
      return;
    }
    const t = (((c = this._content) == null ? void 0 : c.textContent) || "").trim();
    if (this.dataset.morse = this._toMorse(t), this.getAttribute("reduced-motion") !== "ignore" && matchMedia("(prefers-reduced-motion: reduce)").matches) {
      this.dataset.lit = "true";
      return;
    }
    const s = this._morseSegments(t);
    if (s.length === 0) {
      this.dataset.lit = "true";
      return;
    }
    const r = parseFloat(getComputedStyle(this).getPropertyValue("--blink-dot")), h = Number.isFinite(r) && r > 0 ? r : 170, o = s.reduce((l, n) => l + n.dur, 0) + 7;
    let i = 0, a = null;
    const u = (l) => {
      this._morseRAF = requestAnimationFrame(u), a == null && (a = l);
      const n = l - a;
      if (a = l, this._isPaused()) return;
      i += n;
      const _ = i / h % o;
      let b = 0, m = !1;
      for (const d of s) {
        if (_ < b + d.dur) {
          m = d.lit;
          break;
        }
        b += d.dur;
      }
      const f = m ? "true" : "false";
      this.dataset.lit !== f && (this.dataset.lit = f);
    };
    this.dataset.lit = "false", this._morseRAF = requestAnimationFrame(u);
  }
  // Build an on/off timeline (durations in Morse "units") for a string.
  _morseSegments(t) {
    const e = [], s = t.toLowerCase().split(/\s+/).filter(Boolean);
    return s.forEach((r, h) => {
      const o = [...r].filter((i) => p[i]);
      o.forEach((i, a) => {
        const u = p[i];
        [...u].forEach((c, l) => {
          e.push({ lit: !0, dur: c === "-" ? 3 : 1 }), l < u.length - 1 && e.push({ lit: !1, dur: 1 });
        }), a < o.length - 1 && e.push({ lit: !1, dur: 3 });
      }), h < s.length - 1 && e.push({ lit: !1, dur: 7 });
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
    !this._built && !this._content || (this.dataset.behavior = this.behavior, this.dataset.state = this.playState, this.dataset.ready = "", this.style.setProperty("--blink-rate", this.rate), this.minOpacity != null ? this.style.setProperty("--blink-min-opacity", this.minOpacity) : this.style.removeProperty("--blink-min-opacity"), this.count !== "infinite" ? this.style.setProperty("--blink-count", this.count) : this.style.removeProperty("--blink-count"), this._syncMorse());
  }
  _dispatch(t) {
    this.dispatchEvent(new CustomEvent(t, { bubbles: !0 }));
  }
}
customElements.define("blink-wc", g);
export {
  g as BlinkWc
};
//# sourceMappingURL=blink-wc.js.map
