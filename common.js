/* classroomtimer.co.uk – shared code: timing engine, sounds, wake lock, full screen, saved settings */
const $ = id => document.getElementById(id);
const CT = {};

// ---------- time formatting ----------
CT.fmt = function(s, opts){
  opts = opts || {};
  s = Math.max(0, opts.floor ? Math.floor(s) : Math.ceil(s));
  const h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), sec = s % 60;
  if(h || opts.hours) return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  return `${m}:${String(sec).padStart(2, '0')}`;
};
CT.colourFor = f => f > .5 ? 'var(--t-ok)' : f > .2 ? 'var(--t-warn)' : 'var(--t-end)';

// ---------- settings remembered on this device ----------
CT.load = (key, def) => { try { const v = JSON.parse(localStorage.getItem('ct-' + key)); return v == null ? def : Object.assign(Array.isArray(def) ? [] : {}, def, v); } catch(e) { return def; } };
CT.save = (key, val) => { try { localStorage.setItem('ct-' + key, JSON.stringify(val)); } catch(e) {} };

// ---------- visit counting (GoatCounter, no cookies) ----------
CT.track = name => { try { if(window.goatcounter && window.goatcounter.count) window.goatcounter.count({ path: 'use-' + name, title: 'Used: ' + name, event: true, no_session: true }); } catch(e) {} };

// ---------- sound, made in the browser (no files) ----------
let actx = null;
CT.unlock = () => { try { actx = actx || new (window.AudioContext || window.webkitAudioContext)(); if(actx.state === 'suspended') actx.resume(); } catch(e) {} };
CT.beep = (freq, dur, vol, when, type) => {
  if(!actx) return;
  const t = actx.currentTime + (when || 0), o = actx.createOscillator(), g = actx.createGain();
  o.type = type || 'sine'; o.frequency.value = freq; o.connect(g); g.connect(actx.destination);
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + .01); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
  o.start(t); o.stop(t + dur + .05);
};
CT.SOUNDS = [['chime', 'Chime'], ['bell', 'School bell'], ['soft', 'Gentle'], ['tada', 'Ta-da!'], ['none', 'No sound']];
CT.play = kind => {
  CT.unlock();
  const b = CT.beep;
  if(kind === 'chime') [[784, 0], [988, .22], [1175, .44], [1568, .7]].forEach(([f, w]) => { b(f, 1.4, .25, w); b(f * 2, .8, .06, w); });
  else if(kind === 'bell') for(let i = 0; i < 24; i++){ b(1400, .09, .22, i * .085, 'square'); b(1890, .09, .08, i * .085, 'square'); }
  else if(kind === 'soft') [[523, 0], [659, .5], [784, 1]].forEach(([f, w]) => b(f, 2, .18, w));
  else if(kind === 'tada'){ [[523, 0], [659, .12], [784, .24], [1047, .4]].forEach(([f, w]) => b(f, .5, .22, w, 'triangle')); [[1047, .62], [1319, .62], [1568, .62]].forEach(([f, w]) => b(f, 1.2, .14, w, 'triangle')); }
  else if(kind === 'tick') b(1200, .05, .08);
  else if(kind === 'pip') b(880, .12, .22);
  else if(kind === 'go') { b(1320, .5, .3); b(1980, .3, .08); }
  else if(kind === 'rest') { b(660, .6, .28); b(495, .6, .12, .15); }
  else if(kind === 'warn') [[880, 0], [880, .25]].forEach(([f, w]) => b(f, .35, .22, w));
};
CT.speak = text => {
  if(!('speechSynthesis' in window)) return;
  try { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(text); u.lang = 'en-GB'; u.rate = .95; speechSynthesis.speak(u); } catch(e) {}
};
// fill a <select> with the sound choices
CT.soundSelect = (sel, value) => { sel.innerHTML = CT.SOUNDS.map(([v, t]) => `<option value="${v}">${t}</option>`).join(''); sel.value = value; };

// ---------- keep the screen awake while a timer runs ----------
let wake = null, wakeWanted = 0;
CT.awake = async on => {
  wakeWanted = Math.max(0, wakeWanted + (on ? 1 : -1));
  try {
    if(wakeWanted && 'wakeLock' in navigator && !wake){ wake = await navigator.wakeLock.request('screen'); wake.addEventListener('release', () => { wake = null; }); }
    if(!wakeWanted && wake){ await wake.release(); wake = null; }
  } catch(e) {}
};
document.addEventListener('visibilitychange', () => { if(!document.hidden && wakeWanted && !wake){ wakeWanted--; CT.awake(true); } });

// ---------- full screen (with a fallback for iPhones, which don't allow it) ----------
const FS_OPEN = '<svg viewBox="0 0 24 24"><path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5"/></svg>';
const FS_CLOSE = '<svg viewBox="0 0 24 24"><path d="M9 4v5H4M20 9h-5V4M15 20v-5h5M4 15h5v5"/></svg>';
CT.fullscreen = (btn, el, onChange) => {
  const isOn = () => document.fullscreenElement === el || el.classList.contains('fake-fs');
  const sync = () => { const on = isOn(); btn.innerHTML = on ? FS_CLOSE : FS_OPEN; btn.title = on ? 'Exit full screen (F)' : 'Full screen (F)'; btn.setAttribute('aria-label', btn.title); onChange && onChange(on); };
  btn.addEventListener('click', () => {
    if(isOn()){
      if(document.fullscreenElement) document.exitFullscreen().catch(() => {}); else { el.classList.remove('fake-fs'); document.body.style.overflow = ''; sync(); }
      return;
    }
    if(el.requestFullscreen) el.requestFullscreen().catch(() => { el.classList.add('fake-fs'); document.body.style.overflow = 'hidden'; sync(); });
    else { el.classList.add('fake-fs'); document.body.style.overflow = 'hidden'; sync(); }
    CT.track('fullscreen-' + (document.body.dataset.page || 'page'));
  });
  document.addEventListener('fullscreenchange', sync);
  document.addEventListener('keydown', e => { if(e.key === 'Escape' && el.classList.contains('fake-fs')){ el.classList.remove('fake-fs'); document.body.style.overflow = ''; sync(); } });
  sync();
};

// ---------- keyboard shortcuts (ignored while typing) ----------
CT.keys = map => document.addEventListener('keydown', e => {
  const t = e.target.tagName;
  if(t === 'INPUT' || t === 'SELECT' || t === 'TEXTAREA' || e.ctrlKey || e.metaKey || e.altKey) return;
  const k = e.code === 'Space' ? 'Space' : e.key.toLowerCase();
  if(map[k]){ e.preventDefault(); map[k](); }
});

// ---------- the countdown engine ----------
// Worked out from the clock rather than counting ticks, so it stays right even if the tab is in the background.
const ACTIVE = new Set();
function frame(){ ACTIVE.forEach(c => c._step()); if(ACTIVE.size) requestAnimationFrame(frame); }
setInterval(() => { if(document.hidden) ACTIVE.forEach(c => c._step()); }, 250);
class Countdown {
  constructor(opts){ this.opts = opts || {}; this.total = 0; this._left = 0; this.endAt = 0; this.running = false; this.lastWhole = null; }
  set(sec){ this.stop(); this.total = this._left = Math.max(0, sec); this.lastWhole = null; this._emit(); }
  get left(){ return this.running ? Math.max(0, (this.endAt - performance.now()) / 1000) : this._left; }
  get fraction(){ return this.total ? Math.max(0, Math.min(1, this.left / this.total)) : 0; }
  start(){
    if(this.running) return;
    if(this._left <= 0) this._left = this.total;
    if(this._left <= 0) return;
    this.endAt = performance.now() + this._left * 1000; this.running = true; this.lastWhole = null;
    CT.unlock(); CT.awake(true);
    const first = !ACTIVE.size; ACTIVE.add(this); if(first) requestAnimationFrame(frame);
    this.opts.onState && this.opts.onState(this);
  }
  pause(){ if(!this.running) return; this._left = this.left; this.stop(); this._emit(); }
  stop(){ if(this.running){ this.running = false; ACTIVE.delete(this); CT.awake(false); this.opts.onState && this.opts.onState(this); } }
  reset(){ this.stop(); this._left = this.total; this.lastWhole = null; this._emit(); }
  add(sec){
    if(this.running){ this.endAt += sec * 1000; this.total = Math.max(1, this.total + sec); }
    else { this._left = Math.max(0, this._left + sec); this.total = Math.max(this._left, this.total + sec, 1); }
    this._emit();
  }
  _emit(){ this.opts.onTick && this.opts.onTick(this); }
  _step(){
    const left = this.left, whole = Math.ceil(left);
    if(whole !== this.lastWhole){ this.lastWhole = whole; this.opts.onSecond && this.opts.onSecond(whole, this); }
    this._emit();
    if(left <= 0){ this._left = 0; this.stop(); this.opts.onEnd && this.opts.onEnd(this); }
  }
}
CT.Countdown = Countdown;

// ---------- mobile menu ----------
document.addEventListener('DOMContentLoaded', () => {
  const m = document.querySelector('.menu-btn'), n = document.querySelector('.nav');
  if(m && n) m.addEventListener('click', () => { n.classList.toggle('open'); m.setAttribute('aria-expanded', n.classList.contains('open')); });
});
