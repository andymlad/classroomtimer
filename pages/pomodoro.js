/* Pomodoro: focus sessions with short breaks and a longer break every few sessions */
(function(){
const S = CT.load('pomodoro', { focus: 25, short: 5, long: 15, every: 4, auto: true, sound: 'soft' });
let mode = 'focus', done = 0;
const NAMES = { focus: 'Focus time', short: 'Short break', long: 'Long break' };
const cd = new CT.Countdown({ onTick: () => render(), onState: () => setBtns(), onEnd: () => end() });
function read(){
  [['pFocus', 'focus', 1, 180], ['pShort', 'short', 1, 60], ['pLong', 'long', 1, 90], ['pEvery', 'every', 2, 12]].forEach(([id, k, lo, hi]) => { S[k] = Math.max(lo, Math.min(hi, parseInt($(id).value, 10) || lo)); });
  S.auto = $('pAuto').checked; S.sound = $('pSound').value; CT.save('pomodoro', S);
}
function setMode(m, autostart){ mode = m; $('stage').dataset.phase = m; cd.set(S[m] * 60); if(autostart) cd.start(); render(); }
function end(){
  if(S.sound !== 'none') CT.play(S.sound);
  if(mode === 'focus'){ done++; const longNext = done % S.every === 0; setMode(longNext ? 'long' : 'short', S.auto); CT.speak(longNext ? 'Great work. Time for a long break.' : 'Time for a short break.'); }
  else { setMode('focus', S.auto); CT.speak('Break over. Time to focus.'); }
}
function render(){
  const f = cd.fraction;
  $('pDigits').textContent = CT.fmt(cd.left);
  $('pPhase').textContent = NAMES[mode];
  $('pProg').style.strokeDashoffset = 540.35 * (1 - f);
  $('pProg').style.stroke = mode === 'focus' ? 'var(--coral)' : mode === 'short' ? 'var(--t-ok)' : 'var(--brand2)';
  const inSet = done % S.every;
  $('pDots').innerHTML = Array.from({ length: S.every }, (_, i) => `<i class="${i < inSet || (inSet === 0 && done > 0 && mode === 'long') ? 'on' : ''}"></i>`).join('') + `<span>${done} done</span>`;
  document.querySelectorAll('#pModes button').forEach(b => b.classList.toggle('on', b.dataset.m === mode));
}
function setBtns(){
  [$('pGo'), $('pGo2')].forEach(b => { b.textContent = cd.running ? 'Pause' : cd.left < cd.total ? 'Resume' : 'Start'; b.className = 'btn ' + (cd.running ? 'pause' : 'go'); });
}
function toggle(){ if(cd.running) cd.pause(); else { cd.start(); CT.track('start-pomodoro'); } setBtns(); }
function skip(){ cd.stop(); end(); setBtns(); }
function reset(){ cd.stop(); done = 0; setMode('focus'); setBtns(); }
// set-up
$('pFocus').value = S.focus; $('pShort').value = S.short; $('pLong').value = S.long; $('pEvery').value = S.every; $('pAuto').checked = S.auto;
CT.soundSelect($('pSound'), S.sound);
document.querySelectorAll('#pFields input, #pFields select').forEach(i => i.addEventListener('change', () => { read(); if(!cd.running && cd.left === cd.total) setMode(mode); }));
document.querySelectorAll('#pModes button').forEach(b => b.addEventListener('click', () => { cd.stop(); setMode(b.dataset.m); setBtns(); }));
[$('pGo'), $('pGo2')].forEach(b => b.addEventListener('click', toggle));
[$('pSkip'), $('pSkip2')].forEach(b => b.addEventListener('click', skip));
$('pReset').addEventListener('click', reset);
CT.fullscreen($('fsBtn'), $('stage'));
CT.keys({ Space: toggle, s: skip, r: reset, f: () => $('fsBtn').click() });
setMode('focus'); setBtns();
})();
