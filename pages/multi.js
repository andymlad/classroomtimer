/* Several timers at once – one per group, station or activity */
(function(){
const COLS = ['#17a589', '#FF6B5B', '#7F77DD', '#F5A623', '#36a9f5', '#e05297', '#2BB673', '#8a5a35'];
let list = CT.load('multi', [{ n: 'Group 1', s: 300 }, { n: 'Group 2', s: 300 }, { n: 'Group 3', s: 300 }]);
if(!Array.isArray(list) || !list.length) list = [{ n: 'Group 1', s: 300 }];
let timers = [];
const save = () => CT.save('multi', timers.map(t => ({ n: t.name, s: t.cd.total })));
function make(def, i){
  const t = { name: def.n, done: false };
  t.cd = new CT.Countdown({
    onTick: () => paint(t),
    onState: () => paint(t),
    onEnd: () => { t.done = true; paint(t); t.el.classList.remove('done'); void t.el.offsetWidth; t.el.classList.add('done'); CT.play($('mSound').value); }
  });
  t.cd.set(def.s); t.colour = COLS[i % COLS.length];
  return t;
}
function build(){
  $('mGrid').innerHTML = '';
  timers.forEach((t, i) => {
    const el = document.createElement('div'); el.className = 'mt'; el.style.setProperty('--c', t.colour); t.el = el;
    el.innerHTML = `<input class="mt-name" value="${t.name.replace(/"/g, '&quot;')}" maxlength="24" aria-label="Timer name">
      <button class="mt-time digits" type="button" title="Tap to change the time"></button>
      <div class="mt-edit"><input type="number" min="0" max="360" aria-label="Minutes"><span>:</span><input type="number" min="0" max="59" aria-label="Seconds"><button type="button">Set</button></div>
      <div class="mt-bar"><i></i></div>
      <div class="mt-btns"><button type="button" class="btn go mt-go">Start</button><button type="button" class="small-btn mt-reset">Reset</button><button type="button" class="small-btn mt-x" title="Remove this timer" aria-label="Remove this timer">✕</button></div>`;
    $('mGrid').appendChild(el);
    el.querySelector('.mt-name').addEventListener('input', e => { t.name = e.target.value; save(); });
    el.querySelector('.mt-go').addEventListener('click', () => { t.cd.running ? t.cd.pause() : (t.done && t.cd.reset(), t.done = false, t.el.classList.remove('done'), t.cd.start()); paint(t); });
    el.querySelector('.mt-reset').addEventListener('click', () => { t.done = false; el.classList.remove('done'); t.cd.reset(); });
    el.querySelector('.mt-x').addEventListener('click', () => { t.cd.stop(); timers = timers.filter(x => x !== t); save(); build(); });
    const ed = el.querySelector('.mt-edit'), [im, is] = ed.querySelectorAll('input');
    el.querySelector('.mt-time').addEventListener('click', () => { if(t.cd.running) return; const l = Math.round(t.cd.left); im.value = Math.floor(l / 60); is.value = l % 60; el.classList.add('editing'); im.focus(); im.select(); });
    const setIt = () => { const s = (parseInt(im.value, 10) || 0) * 60 + Math.min(59, parseInt(is.value, 10) || 0); el.classList.remove('editing'); t.done = false; el.classList.remove('done'); t.cd.set(s || 60); save(); };
    ed.querySelector('button').addEventListener('click', setIt);
    [im, is].forEach(x => x.addEventListener('keydown', e => { if(e.key === 'Enter') setIt(); }));
    paint(t);
  });
  $('mCount').textContent = `${timers.length} timer${timers.length === 1 ? '' : 's'}`;
}
function paint(t){
  if(!t.el) return;
  t.el.querySelector('.mt-time').textContent = t.done ? "Time's up!" : CT.fmt(t.cd.left);
  t.el.querySelector('.mt-bar i').style.transform = `scaleX(${t.cd.fraction})`;
  const g = t.el.querySelector('.mt-go'); g.textContent = t.cd.running ? 'Pause' : t.done ? 'Again' : t.cd.left < t.cd.total ? 'Resume' : 'Start'; g.className = 'btn mt-go ' + (t.cd.running ? 'pause' : 'go');
  t.el.classList.toggle('running', t.cd.running);
}
$('mAdd').addEventListener('click', () => {
  if(timers.length >= 12) return;
  const m = Math.max(0, parseFloat($('mMins').value) || 5);
  timers.push(make({ n: $('mName').value.trim() || `Timer ${timers.length + 1}`, s: Math.round(m * 60) || 60 }, timers.length));
  $('mName').value = ''; save(); build();
});
$('mStartAll').addEventListener('click', () => { CT.unlock(); timers.forEach(t => { if(t.done){ t.done = false; t.el.classList.remove('done'); t.cd.reset(); } t.cd.start(); }); CT.track('start-multi'); });
$('mPauseAll').addEventListener('click', () => timers.forEach(t => t.cd.pause()));
$('mResetAll').addEventListener('click', () => timers.forEach(t => { t.done = false; t.el.classList.remove('done'); t.cd.reset(); }));
CT.soundSelect($('mSound'), CT.load('multiSound', { s: 'chime' }).s);
$('mSound').addEventListener('change', () => CT.save('multiSound', { s: $('mSound').value }));
CT.fullscreen($('fsBtn'), $('stage'));
CT.keys({ f: () => $('fsBtn').click() });
timers = list.slice(0, 12).map(make); build();
})();
