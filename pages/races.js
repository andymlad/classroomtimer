/* Random-winner races: emoji race on a track, or rubber ducks down a river */
(function(){
// each icon has a name; with "icon names" on, the racers are called after their icons
const SETS = {
  animals: [['🐢', 'Tortoise'], ['🐇', 'Rabbit'], ['🐌', 'Snail'], ['🦆', 'Duck'], ['🐎', 'Horse'], ['🐕', 'Dog'], ['🐈', 'Cat'], ['🐖', 'Pig'], ['🦄', 'Unicorn'], ['🐘', 'Elephant'], ['🦒', 'Giraffe'], ['🐓', 'Chicken'],
    ['🦀', 'Crab'], ['🐳', 'Whale'], ['🐸', 'Frog'], ['🐥', 'Chick'], ['🦊', 'Fox'], ['🐻', 'Bear'], ['🐑', 'Sheep']],
  vehicles: [['🚒', 'Fire engine'], ['🚜', 'Tractor'], ['🚕', 'Taxi'], ['🚌', 'Bus'], ['🏎️', 'Racing car'], ['🚓', 'Police car'], ['🚑', 'Ambulance'], ['🚙', 'Blue car'], ['🚚', 'Lorry'], ['🛵', 'Scooter'], ['🚲', 'Bike'], ['🚗', 'Red car']],
  fruit: [['🍎', 'Apple'], ['🫐', 'Blueberries'], ['🍌', 'Banana'], ['🍇', 'Grapes'], ['🍓', 'Strawberry'], ['🍊', 'Orange'], ['🍉', 'Watermelon'], ['🍍', 'Pineapple'], ['🥝', 'Kiwi'], ['🍒', 'Cherries'], ['🍑', 'Peach'], ['🍋', 'Lemon'], ['🍏', 'Green apple'], ['🥥', 'Coconut']],
  monsters: [['👹', 'Red monster'], ['👽', 'Green alien'], ['👾', 'Purple monster'], ['👻', 'Ghost'], ['🤖', 'Robot'], ['🐲', 'Dragon'], ['🦖', 'T-rex'], ['🐙', 'Octopus'], ['🧟', 'Zombie'], ['🎃', 'Pumpkin'], ['🦕', 'Dinosaur'], ['🦄', 'Unicorn']]
};
const DUCKS = ['#FFD43B', '#FF6FA8', '#36A9F5', '#2BB673', '#FF9C33', '#8E7CF0', '#FF5A4E', '#16C2C2', '#B8E04A', '#F2F2F2', '#C58B4E', '#3D3D52'];
const DUCK_NAMES = ['Yellow', 'Pink', 'Blue', 'Green', 'Orange', 'Purple', 'Red', 'Teal', 'Lime', 'White', 'Brown', 'Black'].map(c => c + ' duck');
const S = CT.load('races', { mode: 'emoji', set: 'animals', names: '', auto: true, len: 15, remove: false });
if(S.auto === undefined) S.auto = !S.names || S.names === 'Red team\nBlue team\nGreen team\nYellow team\nPurple team';
// icon names: fill the box with the names of the icons (or duck colours), keeping the same number of racers
function iconNames(){
  const n = Math.max(2, Math.min(12, $('rNames').value.split('\n').filter(x => x.trim()).length || 5));
  const list = S.mode === 'duck' ? DUCK_NAMES : (SETS[S.set] || SETS.animals).map(x => x[1]);
  $('rNames').value = list.slice(0, n).join('\n');
}
let racers = [], running = false, raf = 0;
const rnd = () => { const a = new Uint32Array(1); crypto.getRandomValues(a); return a[0] / 4294967296; };
function shuffle(a){ for(let i = a.length - 1; i > 0; i--){ const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
const names = () => $('rNames').value.split('\n').map(s => s.trim()).filter(Boolean).slice(0, 12);
function save(){ S.names = $('rNames').value; S.len = +$('rLen').value; S.remove = $('rRemove').checked; S.set = $('rSet').value; CT.save('races', S); }
const esc = t => t.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
// ---------- drawing ----------
const W = 1000, X1 = 900;
let X0 = 90;
// a colour word in a racer's name ("Red team") picks a matching duck, emoji and badge
const COLOURS = { red: '#FF5A4E', blue: '#36A9F5', green: '#2BB673', yellow: '#FFD43B', purple: '#8E7CF0', orange: '#FF9C33', pink: '#FF6FA8',
  white: '#F2F2F2', black: '#3D3D52', brown: '#C58B4E', teal: '#16C2C2', turquoise: '#16C2C2', lime: '#B8E04A', grey: '#A9B4B8', gray: '#A9B4B8', gold: '#E8B923', silver: '#CFD6DA' };
const MATCH = {
  animals: { red: '🦀', orange: '🦊', yellow: '🐥', green: '🐸', blue: '🐳', purple: '🦄', pink: '🐖', brown: '🐻', white: '🐑', grey: '🐘', gray: '🐘', black: '🐈‍⬛' },
  vehicles: { red: '🚒', blue: '🚙', yellow: '🚕', white: '🚑', black: '🚓', orange: '🚚', green: '🚜' },
  fruit: { red: '🍎', blue: '🫐', yellow: '🍌', green: '🍏', purple: '🍇', orange: '🍊', pink: '🍑', brown: '🥥', lime: '🥝' },
  monsters: { green: '👽', purple: '👾', orange: '🎃', white: '👻', red: '👹', blue: '🤖', brown: '🦖', teal: '🐲' }
};
const colourOf = nm => { const m = nm.toLowerCase().match(/\b(red|blue|green|yellow|purple|orange|pink|white|black|brown|teal|turquoise|lime|grey|gray|gold|silver)\b/); return m ? m[1] : null; };
function assign(list, pool, pick){   // matched items first, then the rest of the pool in order without repeats (while it lasts)
  const used = new Set(), out = list.map(nm => { const c = colourOf(nm), v = c && pick(c); if(v) used.add(v); return v || null; });
  const rest = pool.filter(v => !used.has(v)); let k = 0;
  return out.map(v => v || rest[k++ % Math.max(1, rest.length)] || pool[0]);
}
function duckSVG(col, num){
  return `<g class="duck"><ellipse cx="0" cy="22" rx="30" ry="6" fill="rgba(0,40,80,.18)"/>
    <path d="M-30 4 Q-34 -14 -18 -10 Q-4 -24 14 -14 Q28 -6 26 8 Q22 22 -2 22 Q-26 22 -30 4z" fill="${col}" stroke="rgba(0,0,0,.15)" stroke-width="1.5"/>
    <path d="M-12 2 Q2 -6 12 4 Q2 12 -12 2z" fill="rgba(0,0,0,.12)"/>
    <circle cx="16" cy="-22" r="13" fill="${col}" stroke="rgba(0,0,0,.15)" stroke-width="1.5"/>
    <path d="M27 -22 l13 3 -13 5z" fill="#FF8A1F"/><circle cx="20" cy="-26" r="2.6" fill="#14323a"/>
    <text x="-6" y="12" text-anchor="middle" font-size="13" font-weight="800" fill="#14323a">${num}</text></g>`;
}
function scene(){
  const list = names(), n = Math.max(1, list.length), mode = S.mode;
  if(mode === 'emoji'){
    X0 = 262;
    const lane = Math.max(44, Math.min(70, 520 / n)), H = lane * n + 30, fs = Math.max(13, Math.min(20, lane * .3));
    let g = `<rect width="${W}" height="${H}" fill="#7cc35a"/>`;
    list.forEach((nm, i) => { const c = colourOf(nm), y = 15 + i * lane;
      g += `<rect x="0" y="${y}" width="${W}" height="${lane}" fill="${i % 2 ? '#d9b48a' : '#e3c39b'}"/>
      <circle cx="26" cy="${y + lane / 2}" r="${Math.min(14, lane * .3)}" fill="${c ? COLOURS[c] : '#7a5a3a'}" stroke="rgba(0,0,0,.2)"/>
      <text x="26" y="${y + lane / 2 + 1}" text-anchor="middle" dominant-baseline="central" font-size="${Math.min(15, lane * .3)}" font-weight="800" fill="${c && ['white', 'yellow', 'lime', 'silver', 'gold'].includes(c) ? '#14323a' : '#fff'}">${i + 1}</text>
      <text x="48" y="${y + lane / 2 + 1}" dominant-baseline="central" font-size="${fs}" font-weight="700" fill="#14323a" class="nm">${esc(nm.length > 16 ? nm.slice(0, 15) + '…' : nm)}</text>`; });
    g += `<rect x="${X0 - 34}" y="15" width="6" height="${lane * n}" fill="#fff"/><rect x="${X1 + 30}" y="15" width="16" height="${lane * n}" fill="url(#chk)"/>`;
    const set = SETS[S.set] || SETS.animals, map = MATCH[S.set] || {};
    const ems = list.map(nm => { const l = nm.toLowerCase(), hit = set.find(x => x[1].toLowerCase() === l) || set.find(x => l.includes(x[1].toLowerCase()));
      return hit ? hit[0] : null; });
    const fill = assign(list, set.map(x => x[0]).filter(e => !ems.includes(e)), c => !ems.includes(map[c]) && map[c]);
    ems.forEach((e, i) => { if(!e) ems[i] = fill[i]; });
    racers = list.map((nm, i) => ({ nm, i, y: 15 + i * lane + lane / 2, size: Math.min(46, lane * .72), em: ems[i], col: COLOURS[colourOf(nm)] }));
    g += racers.map(r => `<g id="rc${r.i}" transform="translate(${X0} ${r.y})">${r.col ? `<ellipse cx="0" cy="${r.size * .42}" rx="${r.size * .55}" ry="${r.size * .14}" fill="${r.col}" opacity=".9"/>` : ''}<g class="bob"><text class="em" x="0" y="0" font-size="${r.size}" text-anchor="middle" dominant-baseline="central" transform="scale(-1 1)">${r.em}</text></g></g>`).join('');
    return `<svg class="race-svg" viewBox="0 0 ${W} ${H}"><defs><pattern id="chk" width="16" height="16" patternUnits="userSpaceOnUse"><rect width="16" height="16" fill="#fff"/><rect width="8" height="8" fill="#14323a"/><rect x="8" y="8" width="8" height="8" fill="#14323a"/></pattern></defs>${g}</svg>`;
  }
  // duck race on a river
  X0 = 90;
  const gap = Math.max(46, Math.min(72, 540 / n)), H = gap * n + 70;
  let g = `<defs><linearGradient id="riv" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5ec4f0"/><stop offset="1" stop-color="#2d8fd0"/></linearGradient>
    <pattern id="chk2" width="16" height="16" patternUnits="userSpaceOnUse"><rect width="16" height="16" fill="#fff"/><rect width="8" height="8" fill="#e33"/><rect x="8" y="8" width="8" height="8" fill="#e33"/></pattern></defs>
    <rect width="${W}" height="${H}" fill="url(#riv)"/><rect width="${W}" height="18" fill="#7cc35a"/><rect y="${H - 18}" width="${W}" height="18" fill="#7cc35a"/>`;
  for(let k = 0; k < n + 1; k++) g += `<path class="wave w${k % 3}" d="M-200 ${36 + k * gap} q25 -8 50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0" stroke="rgba(255,255,255,.45)" stroke-width="3" fill="none"/>`;
  g += `<rect x="${X1 + 34}" y="18" width="10" height="${H - 36}" fill="url(#chk2)"/><rect x="${X1 + 30}" y="10" width="4" height="${H - 20}" fill="#8a5a35"/><rect x="${X1 + 44}" y="10" width="4" height="${H - 20}" fill="#8a5a35"/>`;
  const cols = assign(list, DUCKS, c => COLOURS[c]);
  racers = list.map((nm, i) => ({ nm, i, y: 44 + i * gap, col: cols[i] }));
  g += racers.map(r => `<g id="rc${r.i}" transform="translate(${X0} ${r.y})"><g class="bob" style="animation-delay:${-(r.i * .37) % 1.4}s">${duckSVG(r.col, r.i + 1)}</g>
    <text x="0" y="${gap * .5}" font-size="${Math.max(11, gap * .24)}" font-weight="700" fill="#fff" text-anchor="middle" class="nm" paint-order="stroke" stroke="rgba(0,40,80,.55)" stroke-width="3">${esc(r.nm)}</text></g>`).join('');
  return `<svg class="race-svg" viewBox="0 0 ${W} ${H}">${g}</svg>`;
}
function draw(){ $('rScene').innerHTML = scene(); $('rResults').innerHTML = ''; }
// ---------- the race ----------
function go(){
  if(running) return;
  save();
  if(names().length < 2){ $('rMsg').textContent = 'Add at least two racers – one name per line.'; return; }
  $('rMsg').textContent = ''; draw(); CT.unlock(); running = true; setBtns();
  // the finishing order is decided fairly at the start; the race just shows it
  const T = S.len, order = shuffle(racers.map(r => r.i));
  order.forEach((idx, place) => {
    const r = racers[idx];
    r.T = T * (1 + place * (0.025 + rnd() * 0.05));
    r.amp = .05 + rnd() * .08; r.w = 1.2 + rnd() * 2.2; r.ph = rnd() * 6.3;
  });
  let count = 3;
  $('rCount').hidden = false; $('rCount').textContent = count; CT.play('pip');
  const ci = setInterval(() => {
    count--;
    if(count > 0){ $('rCount').textContent = count; CT.play('pip'); return; }
    clearInterval(ci); $('rCount').textContent = 'Go!'; CT.play('go');
    setTimeout(() => { $('rCount').hidden = true; }, 700);
    const t0 = performance.now(); document.querySelectorAll('.race-svg .bob').forEach(b => b.classList.add('run'));
    CT.awake(true);
    const step = () => {
      const t = (performance.now() - t0) / 1000;
      const won = t >= racers[order[0]].T;   // the race stops the moment the winner crosses the line
      racers.forEach(r => {
        const u = Math.min(1, t / r.T);
        let p = Math.min(1, Math.max(0, u + r.amp * Math.sin(r.w * t + r.ph) * 4 * u * (1 - u)));
        if(r.i === order[0]) p = won ? 1 : Math.min(p, .995); else p = Math.min(p, .985);
        r.p = p;
        $('rc' + r.i).setAttribute('transform', `translate(${X0 + (X1 - X0) * p} ${r.y})`);
      });
      if(!won) raf = requestAnimationFrame(step);
      else finish([order[0]].concat(racers.filter(r => r.i !== order[0]).sort((a, b) => b.p - a.p).map(r => r.i)));
    };
    raf = requestAnimationFrame(step);
  }, 800);
}
function finish(order){
  running = false; CT.awake(false); setBtns();
  document.querySelectorAll('.race-svg .bob').forEach(b => b.classList.remove('run'));
  const medals = ['🥇', '🥈', '🥉'], win = racers[order[0]];
  $('rResults').innerHTML = `<div class="winner">🏆 ${esc(win.nm)} wins!</div><ol>${order.map((idx, k) => `<li>${medals[k] || (k + 1) + '.'} ${S.mode === 'emoji' ? racers[idx].em + ' ' : ''}${esc(racers[idx].nm)}</li>`).join('')}</ol>`;
  $('rc' + win.i).classList.add('won');
  // everyone stays where they were when the winner crossed the line; medals on the first three
  order.forEach((idx, k) => {
    const g = $('rc' + idx), r = racers[idx];
    if(k < 3) g.insertAdjacentHTML('beforeend', `<text class="medal" x="${S.mode === 'duck' ? -48 : -(r.size || 40) * .9}" y="${S.mode === 'duck' ? -4 : 8}" text-anchor="middle" dominant-baseline="central">${medals[k]}</text>`);
  });
  CT.play('tada'); CT.track('race-' + S.mode);
  if(S.remove){
    const left = names().filter((n, k) => k !== win.i);
    $('rNames').value = left.join('\n'); S.auto = false; save();
  }
}
function setBtns(){ [$('rGo'), $('rGo2')].forEach(b => { b.disabled = running; b.textContent = running ? 'Racing…' : 'Start the race'; }); }
// ---------- set-up ----------
$('rNames').value = S.names || ''; $('rLen').value = String(S.len); $('rRemove').checked = S.remove; $('rSet').value = S.set;
document.querySelectorAll('#rModes button').forEach(b => {
  b.classList.toggle('on', b.dataset.m === S.mode);
  b.addEventListener('click', () => { if(running) return; S.mode = b.dataset.m; CT.save('races', S); document.querySelectorAll('#rModes button').forEach(x => x.classList.toggle('on', x === b)); $('rSetWrap').hidden = S.mode !== 'emoji'; if(S.auto) iconNames(); save(); draw(); });
});
$('rSetWrap').hidden = S.mode !== 'emoji';
$('rNames').addEventListener('input', () => { if(running) return; S.auto = false; save(); draw(); });
$('rSet').addEventListener('input', () => { if(running) return; S.set = $('rSet').value; if(S.auto) iconNames(); save(); draw(); });
$('rIcons').addEventListener('click', () => { if(running) return; S.auto = true; if(!$('rNames').value.trim()) $('rNames').value = '\n\n\n\n'; iconNames(); save(); draw(); });
['rLen', 'rRemove'].forEach(id => $(id).addEventListener('change', save));
$('rNums').addEventListener('click', () => { if(running) return; const n = Math.max(2, Math.min(12, parseInt($('rHow').value, 10) || 6)); $('rNames').value = Array.from({ length: n }, (_, i) => `Racer ${i + 1}`).join('\n'); S.auto = false; save(); draw(); });
[$('rGo'), $('rGo2')].forEach(b => b.addEventListener('click', go));
CT.fullscreen($('fsBtn'), $('stage'));
CT.keys({ Space: go, f: () => $('fsBtn').click() });
const h = location.hash.slice(1); if(h === 'duck' || h === 'emoji'){ S.mode = h; document.querySelectorAll('#rModes button').forEach(x => x.classList.toggle('on', x.dataset.m === h)); $('rSetWrap').hidden = h !== 'emoji'; }
if(S.auto){ if(!$('rNames').value.trim()) $('rNames').value = '\n\n\n\n'; iconNames(); save(); }
draw(); setBtns();
})();
