/* Stopwatch with laps */
(function(){
let startAt = 0, acc = 0, running = false, laps = [];
const now = () => performance.now();
const elapsed = () => acc + (running ? now() - startAt : 0);
function show(ms){
  const cs = Math.floor(ms / 10) % 100, t = Math.floor(ms / 1000), h = Math.floor(t / 3600), m = Math.floor(t % 3600 / 60), s = t % 60;
  return (h ? `${h}:${String(m).padStart(2, '0')}` : `${m}`) + `:${String(s).padStart(2, '0')}<small>.${String(cs).padStart(2, '0')}</small>`;
}
function frame(){ $('swDigits').innerHTML = show(elapsed()); if(running) requestAnimationFrame(frame); }
function setBtns(){
  [$('swGo'), $('swGo2')].forEach(b => { b.textContent = running ? 'Stop' : elapsed() ? 'Carry on' : 'Start'; b.className = 'btn ' + (running ? 'pause' : 'go'); });
  [$('swLap'), $('swLap2')].forEach(b => { b.disabled = !running; });
}
function toggle(){
  if(running){ acc = elapsed(); running = false; CT.awake(false); }
  else { startAt = now(); running = true; CT.awake(true); requestAnimationFrame(frame); if(!acc) CT.track('start-stopwatch'); }
  setBtns(); frame();
}
function lap(){
  if(!running) return;
  const t = elapsed(), prev = laps.length ? laps[laps.length - 1] : 0;
  laps.push(t); renderLaps(t - prev);
}
function renderLaps(){
  const rows = laps.map((t, i) => [i + 1, t - (i ? laps[i - 1] : 0), t]).reverse();
  const splits = rows.map(r => r[1]), fastest = Math.min(...splits), slowest = Math.max(...splits);
  $('laps').innerHTML = rows.length ? `<table><thead><tr><th>Lap</th><th>Lap time</th><th>Total</th></tr></thead><tbody>${rows.map(([n, d, t]) =>
    `<tr class="${laps.length > 2 && d === fastest ? 'fast' : laps.length > 2 && d === slowest ? 'slow' : ''}"><td>${n}</td><td>${show(d)}</td><td>${show(t)}</td></tr>`).join('')}</tbody></table>` : '';
}
function reset(){ running = false; acc = 0; laps = []; CT.awake(false); renderLaps(); setBtns(); frame(); }
[$('swGo'), $('swGo2')].forEach(b => b.addEventListener('click', toggle));
[$('swLap'), $('swLap2')].forEach(b => b.addEventListener('click', lap));
[$('swReset'), $('swReset2')].forEach(b => b.addEventListener('click', reset));
CT.fullscreen($('fsBtn'), $('stage'));
CT.keys({ Space: toggle, l: lap, r: reset, f: () => $('fsBtn').click() });
setBtns(); frame();
})();
