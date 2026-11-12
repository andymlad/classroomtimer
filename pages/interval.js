/* Interval / HIIT timer: warm-up, work and rest rounds, cool-down */
(function(){
const PRESETS = { tabata: ['Tabata', 10, 20, 10, 8, 0], hiit: ['HIIT 30/30', 30, 30, 30, 10, 60], fortyTwenty: ['40/20', 30, 40, 20, 8, 60], circuit: ['PE circuit', 60, 45, 15, 10, 120], stations: ['Class stations', 0, 300, 30, 6, 0] };
const S = CT.load('interval', { warm: 10, work: 20, rest: 10, rounds: 8, cool: 0, voice: true, beeps: true });
const F = { warm: 'iWarm', work: 'iWork', rest: 'iRest', rounds: 'iRounds', cool: 'iCool' };
let phases = [], idx = -1, finished = false;
const NAMES = { warm: 'Warm up', work: 'Work', rest: 'Rest', cool: 'Cool down' };
const cd = new CT.Countdown({
  onTick: () => render(),
  onSecond: w => { if(cd.running && $('iBeeps').checked && w <= 3 && w > 0) CT.play('pip'); },
  onState: () => setBtns(),
  onEnd: () => next()
});
function readFields(){
  Object.entries(F).forEach(([k, id]) => { S[k] = Math.max(k === 'rounds' ? 1 : 0, Math.min(k === 'rounds' ? 99 : 3600, parseInt($(id).value, 10) || 0)); });
  S.voice = $('iVoice').checked; S.beeps = $('iBeeps').checked; CT.save('interval', S);
}
function build(){
  readFields(); phases = [];
  if(S.warm) phases.push({ k: 'warm', s: S.warm });
  for(let r = 1; r <= S.rounds; r++){
    if(S.work) phases.push({ k: 'work', s: S.work, r });
    if(S.rest && r < S.rounds) phases.push({ k: 'rest', s: S.rest, r });
  }
  if(S.cool) phases.push({ k: 'cool', s: S.cool });
}
const totalLeft = () => phases.slice(idx + 1).reduce((a, p) => a + p.s, 0) + (idx >= 0 ? cd.left : 0);
function go(i){
  idx = i; const p = phases[i];
  $('stage').dataset.phase = p.k; cd.set(p.s); cd.start();
  if(S.beeps) CT.play(p.k === 'work' ? 'go' : 'rest');
  if(S.voice) CT.speak(p.k === 'work' ? (S.rounds > 1 ? `Round ${p.r}. Go!` : 'Go!') : NAMES[p.k]);
  render();
}
function next(){
  if(idx + 1 < phases.length) go(idx + 1);
  else { finished = true; $('stage').dataset.phase = 'done'; CT.play('tada'); if(S.voice) CT.speak('Finished. Well done!'); render(); setBtns(); }
}
function render(){
  const p = phases[idx];
  if(finished){ $('iPhase').textContent = 'Finished! 🎉'; $('iDigits').textContent = '0:00'; $('iRound').textContent = `${S.rounds} of ${S.rounds} rounds`; $('iNext').textContent = 'Well done!'; $('iBar').style.transform = 'scaleX(0)'; $('iTotal').textContent = ''; return; }
  if(!p){
    build(); $('iPhase').textContent = 'Ready'; $('iDigits').textContent = CT.fmt(phases[0] ? phases[0].s : 0);
    $('iRound').textContent = `${S.rounds} rounds`; $('iNext').textContent = phases[0] ? `First: ${NAMES[phases[0].k]}` : 'Set some times below';
    $('iBar').style.transform = 'scaleX(1)'; $('iTotal').textContent = 'Total ' + CT.fmt(phases.reduce((a, q) => a + q.s, 0)); return;
  }
  $('iPhase').textContent = NAMES[p.k];
  $('iDigits').textContent = CT.fmt(cd.left);
  $('iRound').textContent = p.r ? `Round ${p.r} of ${S.rounds}` : '';
  const n = phases[idx + 1]; $('iNext').textContent = n ? `Next: ${NAMES[n.k]} ${CT.fmt(n.s)}` : 'Last one!';
  $('iBar').style.transform = `scaleX(${cd.fraction})`;
  $('iTotal').textContent = 'Total left ' + CT.fmt(totalLeft());
}
function setBtns(){
  const r = cd.running, started = idx >= 0 && !finished;
  [$('iGo'), $('iGo2')].forEach(b => { b.textContent = r ? 'Pause' : started ? 'Resume' : 'Start'; b.className = 'btn ' + (r ? 'pause' : 'go'); });
  [$('iSkip'), $('iSkip2')].forEach(b => { b.disabled = !started; });
  document.querySelectorAll('#iFields input').forEach(i => { i.disabled = started; });
}
function toggle(){
  CT.unlock();
  if(cd.running) cd.pause();
  else if(idx >= 0 && !finished) cd.start();
  else { finished = false; build(); if(!phases.length) return; CT.track('start-interval'); go(0); }
  setBtns();
}
function skip(){ if(idx >= 0 && !finished){ cd.stop(); next(); setBtns(); } }
function reset(){ cd.stop(); idx = -1; finished = false; delete $('stage').dataset.phase; render(); setBtns(); }
// set-up
Object.entries(F).forEach(([k, id]) => { $(id).value = S[k]; $(id).addEventListener('input', () => { if(idx < 0) render(); }); });
$('iVoice').checked = S.voice; $('iBeeps').checked = S.beeps;
['iVoice', 'iBeeps'].forEach(id => $(id).addEventListener('change', readFields));
$('iPresets').innerHTML = Object.entries(PRESETS).map(([k, p]) => `<button type="button" data-p="${k}"><b>${p[0]}</b><small>${p[2]}s work · ${p[3]}s rest · ×${p[4]}</small></button>`).join('');
document.querySelectorAll('#iPresets button').forEach(b => b.addEventListener('click', () => {
  if(idx >= 0 && !finished) return;
  const [, w, wk, rs, rd, cl] = PRESETS[b.dataset.p];
  [[F.warm, w], [F.work, wk], [F.rest, rs], [F.rounds, rd], [F.cool, cl]].forEach(([id, v]) => { $(id).value = v; });
  reset();
}));
[$('iGo'), $('iGo2')].forEach(b => b.addEventListener('click', toggle));
[$('iSkip'), $('iSkip2')].forEach(b => b.addEventListener('click', skip));
[$('iReset'), $('iReset2')].forEach(b => b.addEventListener('click', reset));
CT.fullscreen($('fsBtn'), $('stage'));
CT.keys({ Space: toggle, s: skip, r: reset, f: () => $('fsBtn').click() });
render(); setBtns();
})();
