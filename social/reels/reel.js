// A tiny, deterministic animation engine for the 1080×1920 reels in this folder.
// Everything on screen is a pure function of the time t (seconds): seek(t) draws that moment, so
// scripts/reel.mjs can step through it frame by frame and make an MP4. Opened normally, it plays in real time.
//
//   <div class="sc" data-a="4" data-b="9">             a scene, on screen from 4 s to 9 s (fades in and out)
//     <div data-t="0.4" data-fx="up">…</div>           enters 0.4 s after the scene starts: up | pop | left | right | fade | draw
//   CAPS = [[start, end, "words *gold* words"]]        captions: words appear one by one, *x* is boxed in gold
//   HOOKS.push(t => …)                                  anything else drawn by time (canvas, counters, bars)
(function () {
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  const p = (t, a, d) => clamp((t - a) / d, 0, 1);
  const ease = x => 1 - Math.pow(1 - x, 3);
  const back = x => { const c = 1.7; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
  window.R = { clamp, p, ease, back };
  window.HOOKS = window.HOOKS || [];
  const fa = s => String(s).replace(/\d/g, d => "۰۱۲۳۴۵۶۷۸۹"[d]);
  window.fa = fa;

  function scenes(t) {
    for (const sc of document.querySelectorAll(".sc")) {
      const a = +sc.dataset.a, b = +sc.dataset.b, o = ease(p(t, a, 0.35)) * (1 - ease(p(t, b - 0.3, 0.3)));
      sc.style.opacity = o; sc.style.visibility = o > 0.001 ? "visible" : "hidden";
      for (const el of sc.querySelectorAll("[data-t]")) {
        const s = a + +el.dataset.t, fx = el.dataset.fx || "up", d = +(el.dataset.d || 0.5), k = p(t, s, d), e = ease(k);
        if (fx === "draw") { el.style.strokeDashoffset = (1 - e) * (+el.dataset.len || 2000); continue; }
        el.style.opacity = fx === "pop" ? clamp(k * 3, 0, 1) : e;
        el.style.transform =
          fx === "up" ? `translateY(${(1 - e) * 60}px)` :
          fx === "pop" ? `scale(${0.6 + 0.4 * back(k)}) rotate(${el.dataset.r || 0}deg)` :
          fx === "left" ? `translateX(${(1 - e) * -120}px) rotate(${el.dataset.r || 0}deg)` :
          fx === "right" ? `translateX(${(1 - e) * 120}px) rotate(${el.dataset.r || 0}deg)` : "";
      }
    }
  }
  let capEl = null;
  function caps(t) {
    capEl = capEl || document.getElementById("cap");
    if (!capEl || !window.CAPS) return;
    const c = CAPS.find(c => t >= c[0] && t < c[1]);
    if (!c) { capEl.innerHTML = ""; capEl.dataset.k = ""; return; }
    const words = c[2].split(" "), span = Math.min(c[1] - c[0], 0.42 * words.length + 0.2);
    const n = Math.min(words.length, Math.floor((t - c[0]) / (span / words.length)) + 1);
    const key = c[0] + ":" + n;
    if (capEl.dataset.k === key) return;
    capEl.dataset.k = key;
    capEl.innerHTML = words.map((w, i) => {
      const hl = /^\*.*\*[.،؟!]?$/.test(w), txt = fa(w.replace(/\*/g, ""));
      return `<span class="w${hl ? " hl" : ""}${i < n ? " on" : ""}${i === n - 1 ? " now" : ""}">${txt}</span>`;
    }).join(" ");
  }
  window.seek = function (t) { scenes(t); caps(t); for (const h of HOOKS) h(t); };
  // every face loaded before the first frame (a font is only fetched when first used, which would be mid-render)
  window.ready = document.fonts ? Promise.all(["400 40px Vazirmatn", "800 40px Vazirmatn", "900 40px Vazirmatn", "700 40px \"LG Naskh\"", "700 40px Cinzel"]
    .map(f => document.fonts.load(f, "سلام abc ۱۲۳"))).then(() => document.fonts.ready) : Promise.resolve();
  // played in a browser (not rendered): real time, looping
  addEventListener("load", () => {
    if (/render/.test(location.search)) { seek(0); return; }
    ready.then(() => { const t0 = performance.now(); const loop = () => { seek(((performance.now() - t0) / 1000) % LEN); requestAnimationFrame(loop); }; loop(); });
  });
})();
