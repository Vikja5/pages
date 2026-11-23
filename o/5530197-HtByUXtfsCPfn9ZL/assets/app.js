(() => {
  'use strict';
  const VIDEO_URL = 'assets/hero.mp4';
  const VIDEO_BYTES = 5686469; // fallback, if Content-Length is missing
  const POSTER = 'assets/poster.jpg';

  const hero = document.querySelector('.hero');
  const stage = document.querySelector('.stage');
  const video = document.getElementById('hero');
  const posterLayer = document.querySelector('.poster');
  const ring = document.querySelector('.ring');
  const bar = document.querySelector('.progress');
  const header = document.querySelector('.top');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');

  // ---------- split text (seeded, identical on every load) ----------
  function rng(seed) { let s = seed >>> 0; return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296; }
  document.querySelectorAll('.band').forEach((band, bi) => {
    const el = band.querySelector('.split');
    const text = el.textContent.replace(/ /g, ' ').trim();
    const fx = band.dataset.fx;
    const r = rng(17 + bi * 101);
    const words = text.split(/\s+/);
    const total = text.replace(/\s/g, '').length;
    let ci = 0;
    el.textContent = '';
    const sr = document.createElement('span'); sr.className = 'sr'; sr.textContent = text; el.appendChild(sr);
    const vis = document.createElement('span'); vis.setAttribute('aria-hidden', 'true');
    const half = Math.ceil(words.length / 2);
    words.forEach((w, wi) => {
      const ws = document.createElement('span'); ws.className = 'w';
      for (const ch of w) {
        const c = document.createElement('span'); c.className = 'c'; c.textContent = ch;
        let th;
        if (fx === 'scatter') { th = r() * 0.5; c.style.setProperty('--jx', ((r() - .5) * 260).toFixed(1) + 'px'); c.style.setProperty('--jy', ((r() - .5) * 180).toFixed(1) + 'px'); c.style.setProperty('--jr', ((r() - .5) * 70).toFixed(1) + 'deg'); }
        else if (fx === 'part') { th = r() * 0.25; c.style.setProperty('--jx', (wi < half ? 1 : -1) * (60 + r() * 120) + 'px'); }
        else if (fx === 'rise') { th = wi / words.length * 0.45; }
        else { th = ci / total * 0.55 + r() * 0.06; }
        c.style.setProperty('--th', th.toFixed(3));
        ws.appendChild(c); ci++;
      }
      vis.appendChild(ws);
      if (wi < words.length - 1) vis.appendChild(document.createTextNode(' '));
    });
    el.appendChild(vis);
  });

  const bands = [...document.querySelectorAll('.band')].map(el => ({ el, a: +el.dataset.a, b: +el.dataset.b, op: -1, k: -1, ks: -1, kb: -1, live: null }));
  const smooth = (p, e0, e1) => { const t = Math.min(1, Math.max(0, (p - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

  // ---------- caption bands ----------
  let loadK = 0;
  function updateCaptions(p) {
    bands.forEach((B, i) => {
      const f = Math.min(0.03, (B.b - B.a) / 3);
      const inE = i === 0 ? 1 : smooth(p, B.a, B.a + f);
      const outE = i === bands.length - 1 ? 0 : smooth(p, B.b - f, B.b);
      const op = +(inE * (1 - outE)).toFixed(3);
      let k = clamp((p - B.a) / Math.min(0.07, (B.b - B.a) * 0.4), 0, 1);
      if (i === 0) k = Math.max(k, loadK);
      k = +k.toFixed(3);
      if (op !== B.op) { B.el.style.opacity = op; B.op = op; }
      if (Math.abs(k - B.k) > 0.008 || (k === 1 && B.k !== 1) || (k === 0 && B.k !== 0)) { B.el.style.setProperty('--k', k); B.k = k; }
      if (i === bands.length - 1) {
        const ks = +clamp((k - 0.6) * 4, 0, 1).toFixed(3), kb = +clamp((k - 0.75) * 4, 0, 1).toFixed(3);
        if (ks !== B.ks) { B.el.style.setProperty('--ks', ks); B.ks = ks; }
        if (kb !== B.kb) { B.el.style.setProperty('--kb', kb); B.kb = kb; }
      }
      const live = op > 0.5;
      if (live !== B.live) { B.el.classList.toggle('live', live); B.live = live; }
    });
  }
  let lastP = -1;
  function updateBar(p) { const v = +p.toFixed(3); if (v !== lastP) { bar.style.setProperty('--p', v); lastP = v; } }

  function heroProgress() {
    const r = hero.getBoundingClientRect();
    const range = hero.offsetHeight - innerHeight;
    return range > 0 ? clamp(-r.top / range, 0, 1) : 0;
  }

  // ---------- gated seeks ----------
  let seekBusy = false, pendingTime = null;
  function requestSeek(t) {
    if (!video.duration || !isFinite(video.duration)) return;
    t = clamp(t, 0, video.duration - 0.04);
    if (seekBusy) { pendingTime = t; return; }
    if (Math.abs(video.currentTime - t) < 0.01) return;
    seekBusy = true; video.currentTime = t;
  }
  video.addEventListener('seeked', () => { seekBusy = false; if (pendingTime !== null) { const t = pendingTime; pendingTime = null; requestSeek(t); } });
  video.addEventListener('error', () => { seekBusy = false; pendingTime = null; failVideo(); });

  // ---------- lerp loop that rests ----------
  let target = 0, shown = 0, rafId = null, lastTick = 0, heroOnScreen = true;
  function tick(now) {
    const dt = Math.min(100, now - (lastTick || now)); lastTick = now;
    shown += (target - shown) * (1 - Math.pow(1 - 0.14, dt / 16.667));
    if (Math.abs(target - shown) < 0.0005) { shown = target; rafId = null; lastTick = 0; }
    else rafId = requestAnimationFrame(tick);
    requestSeek(shown * (video.duration || 0));
    updateCaptions(shown); updateBar(shown);
  }
  function onScroll() {
    target = heroProgress();
    if (rafId === null && heroOnScreen) rafId = requestAnimationFrame(tick);
  }
  new IntersectionObserver(es => { heroOnScreen = es[0].isIntersecting; if (heroOnScreen) onScroll(); }).observe(hero);

  // ---------- blob loader (only in scrub mode) ----------
  let inited = false;
  function initHeroOnce() {
    if (inited) return; inited = true;
    posterLayer.style.backgroundImage = "url('" + POSTER + "')";
    let started = false;
    const start = () => { if (started) return; started = true; loadHeroBlob().catch(failVideo); };
    const im = new Image(); im.onload = start; im.onerror = start; im.src = POSTER;
    setTimeout(start, 4000);
  }
  async function loadHeroBlob() {
    if (location.protocol === 'file:') throw new Error('file://');
    const ctrl = new AbortController();
    let wd = setTimeout(() => ctrl.abort(), 20000);
    const res = await fetch(VIDEO_URL, { priority: 'low', signal: ctrl.signal });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const total = Number(res.headers.get('Content-Length')) || VIDEO_BYTES;
    const reader = res.body.getReader();
    const chunks = []; let got = 0, lastRing = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      clearTimeout(wd); wd = setTimeout(() => ctrl.abort(), 20000);
      chunks.push(value); got += value.length;
      const frac = Math.min(1, got / total), now = performance.now();
      if (now - lastRing > 100 || frac === 1) { lastRing = now; ring.style.setProperty('--ld', Math.round(126 * (1 - frac))); }
    }
    clearTimeout(wd);
    ring.style.setProperty('--ld', 0);
    video.src = URL.createObjectURL(new Blob(chunks, { type: 'video/mp4' }));
    video.load();
    video.addEventListener('loadeddata', () => {
      seekBusy = false;
      requestSeek(heroProgress() * video.duration);
      stage.classList.add('video-ready');
    }, { once: true });
  }
  function failVideo() { stage.classList.add('video-failed'); }

  // ---------- live static-hero gate (identical to style.css) ----------
  const GATES = [
    '(max-width: 720px)',
    '(orientation: portrait) and (max-width: 1024px)',
    '(orientation: portrait) and (pointer: coarse)',
    '(orientation: landscape) and (pointer: coarse) and (max-height: 560px)',
    '(prefers-reduced-motion: reduce)'
  ];
  let scrubOn = false;
  function clearBandStyles() { bands.forEach(B => { B.el.style.removeProperty('opacity'); ['--k', '--ks', '--kb'].forEach(v => B.el.style.removeProperty(v)); B.op = B.k = B.ks = B.kb = -1; B.live = null; }); }
  function enableScrub() {
    if (scrubOn) return; scrubOn = true;
    initHeroOnce();
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', onScroll, { passive: true });
    clearBandStyles();
    shown = target = heroProgress();
    updateCaptions(shown); updateBar(shown); onScroll();
    // band 1 load ramp
    const t0 = performance.now();
    (function ramp(now) { loadK = Math.min(1, (now - t0) / 1400); loadK = 1 - Math.pow(1 - loadK, 3); if (scrubOn) updateCaptions(shown); if (loadK < 1 && scrubOn) requestAnimationFrame(ramp); })(t0);
  }
  function disableScrub() {
    if (!scrubOn) return; scrubOn = false;
    removeEventListener('scroll', onScroll); removeEventListener('resize', onScroll);
    if (rafId !== null) { cancelAnimationFrame(rafId); rafId = null; }
    clearBandStyles();
  }
  function applyHeroMode() { if (GATES.some(q => matchMedia(q).matches)) disableScrub(); else enableScrub(); }
  const MQLS = GATES.map(q => matchMedia(q));
  MQLS.forEach(m => m.addEventListener('change', applyHeroMode));
  applyHeroMode();

  // ---------- header, reveals, parallax ----------
  let solid = null;
  function onPageScroll() {
    const s = scrollY > innerHeight * 0.5;
    if (s !== solid) { header.classList.toggle('solid', s); solid = s; }
    if (!reduce.matches) parallax();
  }
  addEventListener('scroll', onPageScroll, { passive: true }); onPageScroll();

  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); setTimeout(() => e.target.classList.add('done'), 1400); io.unobserve(e.target); }
  }), { threshold: 0.15 });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  const pars = [...document.querySelectorAll('.par')];
  const parLast = new Map();
  function parallax() {
    pars.forEach(p => {
      const r = p.parentElement.getBoundingClientRect();
      if (r.bottom < 0 || r.top > innerHeight) return;
      const c = (r.top + r.height / 2 - innerHeight / 2) / innerHeight;
      const y = Math.round(c * (+p.dataset.speed || .15) * -r.height * 10) / 10;
      if (parLast.get(p) !== y) { p.style.transform = 'translate3d(0,' + y + 'px,0)'; parLast.set(p, y); }
    });
  }

  document.addEventListener('visibilitychange', () => document.body.classList.toggle('paused', document.hidden));

  // ---------- cursor + magnetic buttons (fine pointer only) ----------
  if (matchMedia('(pointer: fine)').matches && !reduce.matches) {
    const cur = document.querySelector('.cursor');
    let mx = -100, my = -100, cx = -100, cy = -100, crid = null;
    const step = () => {
      cx += (mx - cx) * 0.22; cy += (my - cy) * 0.22;
      cur.style.transform = 'translate3d(' + cx.toFixed(1) + 'px,' + cy.toFixed(1) + 'px,0)';
      crid = (Math.abs(mx - cx) + Math.abs(my - cy) > 0.3) ? requestAnimationFrame(step) : null;
    };
    addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; cur.classList.add('on'); if (!crid) crid = requestAnimationFrame(step); }, { passive: true });
    document.addEventListener('mouseleave', () => cur.classList.remove('on'));
    document.querySelectorAll('a, button, .card').forEach(el => {
      el.addEventListener('mouseenter', () => cur.classList.add('big'));
      el.addEventListener('mouseleave', () => cur.classList.remove('big'));
    });
    document.querySelectorAll('.magnetic').forEach(btn => {
      btn.addEventListener('mousemove', e => {
        const r = btn.getBoundingClientRect();
        btn.style.setProperty('--mx', ((e.clientX - r.left - r.width / 2) * 0.3).toFixed(1) + 'px');
        btn.style.setProperty('--my', ((e.clientY - r.top - r.height / 2) * 0.4).toFixed(1) + 'px');
      });
      btn.addEventListener('mouseleave', () => { btn.style.setProperty('--mx', '0px'); btn.style.setProperty('--my', '0px'); });
    });
  }

  // ---------- demo form ----------
  const form = document.getElementById('fitForm');
  form.addEventListener('submit', e => {
    e.preventDefault();
    const name = form.elements.namedItem('name').value.trim();
    form.querySelector('.form-msg').textContent = (name ? name + ', ' : '') + 'это демо: заявка не отправлена. На рабочем сайте она придёт вам в почту или мессенджер.';
  });
})();
