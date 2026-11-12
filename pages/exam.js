/* Exam timer: optional reading time, writing time, extra time (access arrangements) and warnings */
(function(){
const S = CT.load('exam', { name: '', h: 1, m: 30, read: 0, extra: 0, warn: true, sound: 'chime' });
let phase = 'setup', readEnd = 0, stdEnd = 0, extraEnd = 0, pausedAt = 0, warned = {}, stdDone = false;
const clock = d => d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
const at = ms => new Date(Date.now() + (ms - performance.now()));
function read(){
  S.name = $('eName').value.trim(); S.h = Math.max(0, Math.min(6, parseInt($('eH').value, 10) || 0)); S.m = Math.max(0, Math.min(59, parseInt($('eM').value, 10) || 0));
  S.read = Math.max(0, Math.min(60, parseInt($('eRead').value, 10) || 0)); S.extra = +$('eExtra').value; S.warn = $('eWarn').checked; S.sound = $('eSound').value;
  CT.save('exam', S);
}
const dur = () => (S.h * 60 + S.m) * 60;
function start(){
  CT.unlock(); read();
  if(!dur()) return;
  const t = performance.now();
  readEnd = t + S.read * 60000; stdEnd = readEnd + dur() * 1000; extraEnd = stdEnd + dur() * 1000 * S.extra / 100;
  warned = {}; stdDone = false; phase = S.read ? 'reading' : 'writing';
  if(S.read) CT.speak('Reading time has started.');
  CT.awake(true); CT.track('start-exam'); setBtns(); tick();
}
function pause(){
  if(phase === 'paused'){ const gap = performance.now() - pausedAt; readEnd += gap; stdEnd += gap; extraEnd += gap; phase = performance.now() < readEnd ? 'reading' : 'writing'; CT.awake(true); }
  else if(phase === 'reading' || phase === 'writing' || phase === 'extra'){ pausedAt = performance.now(); phase = 'paused'; CT.awake(false); }
  setBtns(); tick();
}
function stopExam(){ phase = 'setup'; CT.awake(false); $('stage').dataset.phase = ''; $('eBanner').textContent = ''; setBtns(); tick(); }
function banner(text, sound){ $('eBanner').textContent = text; if(sound && S.sound !== 'none') CT.play(sound); }
function tick(){
  const t = phase === 'paused' ? pausedAt : performance.now();
  $('eNow').textContent = clock(new Date());
  $('eTitle').textContent = S.name || 'Exam';
  if(phase === 'setup'){
    $('eStatus').textContent = 'Ready to start'; $('eDigits').textContent = CT.fmt(dur(), { hours: dur() >= 3600 });
    const end = new Date(Date.now() + (S.read * 60 + dur()) * 1000);
    $('eTimes').textContent = `If you start now: finishes at ${clock(end)}`;
    $('eExtraLine').textContent = S.extra ? `With ${S.extra}% extra time: finishes at ${clock(new Date(end.getTime() + dur() * 10 * S.extra))}` : '';
    return;
  }
  if(phase !== 'paused'){
    if(phase === 'reading' && t >= readEnd){ phase = 'writing'; banner('Writing time has started – you may now begin.', 'go'); CT.speak('You may now start writing.'); }
    if(!stdDone && t >= stdEnd){
      stdDone = true;
      if(S.extra){ phase = 'extra'; banner('Standard time has finished. Extra time is continuing.', S.sound); }
      else { finishAll(); return; }
    }
    if(S.extra && t >= extraEnd){ finishAll(); return; }
    if(S.warn && phase === 'writing') [30, 15, 5].forEach(m => {
      const l = (stdEnd - t) / 60000;
      if(!warned[m] && dur() > m * 60 + 60 && l <= m && l > m - 1){ warned[m] = 1; banner(`${m} minutes remaining`, 'warn'); }
    });
  }
  const shown = phase === 'reading' ? (readEnd - t) / 1000 : phase === 'extra' || (phase === 'paused' && stdDone) ? (extraEnd - t) / 1000 : (stdEnd - t) / 1000;
  $('eDigits').textContent = CT.fmt(shown, { hours: shown >= 3600 });
  $('stage').dataset.phase = phase === 'paused' ? 'paused' : phase;
  $('eStatus').textContent = { reading: 'Reading time – do not write yet', writing: 'Time remaining', extra: 'Extra time remaining', paused: 'Paused' }[phase];
  $('eTimes').textContent = `Started ${clock(at(readEnd - S.read * 60000))} · Finishes ${clock(at(stdEnd))}`;
  $('eExtraLine').textContent = S.extra ? `Extra time (${S.extra}%) finishes ${clock(at(extraEnd))}` + (phase !== 'reading' && !stdDone ? ` · ${CT.fmt((extraEnd - t) / 1000, { hours: true })} left` : '') : '';
  $('stage').classList.toggle('warn', (phase === 'writing' && !S.extra || phase === 'extra') && shown <= 300 && shown > 0);
}
function finishAll(){
  phase = 'finished'; CT.awake(false);
  $('stage').dataset.phase = 'finished'; $('stage').classList.remove('warn');
  $('eDigits').textContent = '0:00'; $('eStatus').textContent = 'Time is up – please put your pens down';
  if(S.sound !== 'none') CT.play(S.sound); CT.speak('The exam has finished. Please put your pens down.');
  $('eBanner').textContent = ''; setBtns();
}
function setBtns(){
  const live = ['reading', 'writing', 'extra', 'paused'].includes(phase);
  [$('eGo'), $('eGo2')].forEach(b => { b.textContent = live ? (phase === 'paused' ? 'Resume' : 'Pause') : 'Start exam'; b.className = 'btn ' + (live && phase !== 'paused' ? 'pause' : 'go'); });
  [$('eStop'), $('eStop2')].forEach(b => { b.textContent = live ? 'End exam' : 'Reset'; });
  document.querySelectorAll('#eFields input, #eFields select').forEach(i => { i.disabled = live; });
}
// set-up
$('eName').value = S.name; $('eH').value = S.h; $('eM').value = S.m; $('eRead').value = S.read; $('eExtra').value = String(S.extra); $('eWarn').checked = S.warn;
CT.soundSelect($('eSound'), S.sound);
document.querySelectorAll('#eFields input, #eFields select').forEach(i => i.addEventListener('input', () => { read(); tick(); }));
document.querySelectorAll('#ePresets button').forEach(b => b.addEventListener('click', () => { if(phase !== 'setup' && phase !== 'finished') return; const m = +b.dataset.m; $('eH').value = Math.floor(m / 60); $('eM').value = m % 60; phase = 'setup'; read(); tick(); }));
[$('eGo'), $('eGo2')].forEach(b => b.addEventListener('click', () => (phase === 'setup' || phase === 'finished') ? start() : pause()));
[$('eStop'), $('eStop2')].forEach(b => b.addEventListener('click', () => { if(phase === 'setup' || phase === 'finished' || confirmEnd()) stopExam(); }));
let endArmed = 0;
function confirmEnd(){ const n = Date.now(); if(n - endArmed < 3000) return true; endArmed = n; $('eBanner').textContent = 'Press "End exam" again to stop the timer.'; return false; }
CT.fullscreen($('fsBtn'), $('stage'));
CT.keys({ f: () => $('fsBtn').click() });
setInterval(tick, 250); setBtns(); tick();
})();
