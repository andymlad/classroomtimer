/* Big classroom clock: digital, analogue or both */
(function(){
const S = CT.load('clock', { mode: 'both', h24: false, secs: true, date: true, nums: true, face: 'classroom' });
const face = $('cFace');
// analogue faces – each one draws its own dial and hands (hands are groups #hH #hM #hS rotated around 100,100)
const P = (r, deg) => { const a = deg * Math.PI / 180; return [100 + r * Math.sin(a), 100 - r * Math.cos(a)]; };
function ticks(r1big, r1, r2, big, small, wb, ws, cap = 'round'){
  let o = '';
  for(let i = 0; i < 60; i++){ const k = i % 5 === 0, [x1, y1] = P(k ? r1big : r1, i * 6), [x2, y2] = P(r2, i * 6);
    o += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${k ? big : small}" stroke-width="${k ? wb : ws}" stroke-linecap="${cap}"/>`; }
  return o;
}
function numbers(r, labels, attrs = ''){ return labels.map((t, i) => { const [x, y] = P(r, (i + 1) * 30); return `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="central"${attrs}>${t}</text>`; }).join(''); }
const ARABIC = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], ROMAN = ['I', 'II', 'III', 'IIII', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
// tapered hand pointing up: length, tail, width
const taper = (len, tail, w, fill) => `<polygon points="${100 - w / 2},${100 + tail} ${100 - w * .32},${100 - len * .8} 100,${100 - len} ${100 + w * .32},${100 - len * .8} ${100 + w / 2},${100 + tail}" fill="${fill}"/>`;
const bar = (len, tail, w, fill) => `<rect x="${100 - w / 2}" y="${100 - len}" width="${w}" height="${len + tail}" fill="${fill}"/>`;
const FACES = {
  classroom: { n: 'Classroom', draw: () => `<circle cx="100" cy="100" r="97" fill="#fff" stroke="#0F5257" stroke-width="5"/>${ticks(82, 87, 92, '#14323a', '#9db1b3', 3, 1.2)}
    <g id="cNums" class="cnums">${numbers(68, ARABIC)}</g>
    <g id="hH"><line x1="100" y1="100" x2="100" y2="54" stroke="#0F5257" stroke-width="7" stroke-linecap="round"/></g>
    <g id="hM"><line x1="100" y1="100" x2="100" y2="30" stroke="#137a80" stroke-width="4.5" stroke-linecap="round"/></g>
    <g id="hS"><line x1="100" y1="112" x2="100" y2="24" stroke="#FF6B5B" stroke-width="2" stroke-linecap="round"/></g>
    <circle cx="100" cy="100" r="6" fill="#FF6B5B"/><circle cx="100" cy="100" r="2.5" fill="#fff"/>` },
  traditional: { n: 'Traditional', draw: () => `<defs><radialGradient id="tg" cx=".5" cy=".42" r=".6"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#eceeee"/></radialGradient></defs>
    <circle cx="100" cy="100" r="98" fill="#1a1a1a"/><circle cx="100" cy="100" r="91" fill="url(#tg)"/><circle cx="100" cy="100" r="91" fill="none" stroke="#000" stroke-opacity=".25" stroke-width="1.5"/>
    ${ticks(78, 84, 88, '#111', '#111', 3.4, 1.1, 'butt')}
    <g id="cNums" class="cnums trad">${numbers(65, ARABIC)}</g>
    <g id="hH">${taper(48, 14, 9, '#111')}</g><g id="hM">${taper(74, 16, 6.5, '#111')}</g>
    <g id="hS"><line x1="100" y1="122" x2="100" y2="18" stroke="#d0201b" stroke-width="1.6"/><circle cx="100" cy="116" r="4" fill="#d0201b"/></g>
    <circle cx="100" cy="100" r="5.5" fill="#111"/><circle cx="100" cy="100" r="2.4" fill="#d0201b"/>` },
  roman: { n: 'Roman numerals', draw: () => `<defs><linearGradient id="rg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e9cf7a"/><stop offset=".5" stop-color="#a97f22"/><stop offset="1" stop-color="#e2c36a"/></linearGradient></defs>
    <circle cx="100" cy="100" r="98" fill="url(#rg)"/><circle cx="100" cy="100" r="91" fill="#fbf6e9"/>
    <circle cx="100" cy="100" r="86" fill="none" stroke="#2b2418" stroke-width=".8"/><circle cx="100" cy="100" r="80" fill="none" stroke="#2b2418" stroke-width=".8"/>
    ${ticks(80, 80, 86, '#2b2418', '#2b2418', 2.2, .9, 'butt')}
    <g id="cNums" class="cnums roman">${ROMAN.map((t, i) => { const [x, y] = P(66, (i + 1) * 30); return `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="central" transform="rotate(${(i + 1) * 30 > 90 && (i + 1) * 30 < 270 ? (i + 1) * 30 + 180 : (i + 1) * 30} ${x} ${y})">${t}</text>`; }).join('')}</g>
    <g id="hH">${taper(46, 12, 7, '#2b2418')}<circle cx="100" cy="66" r="4.5" fill="none" stroke="#2b2418" stroke-width="2"/></g>
    <g id="hM">${taper(72, 14, 5, '#2b2418')}</g>
    <g id="hS"><line x1="100" y1="118" x2="100" y2="20" stroke="#8a1c14" stroke-width="1.2"/></g>
    <circle cx="100" cy="100" r="4.5" fill="url(#rg)" stroke="#2b2418" stroke-width="1"/>` },
  station: { n: 'Station', draw: () => `<circle cx="100" cy="100" r="98" fill="#d9dcdc"/><circle cx="100" cy="100" r="93" fill="#fff"/>
    ${ticks(66, 84, 90, '#111', '#111', 6.5, 2.2, 'butt')}
    <g id="cNums" class="cnums station"></g>
    <g id="hH">${bar(52, 18, 9, '#111')}</g><g id="hM">${bar(82, 20, 7, '#111')}</g>
    <g id="hS"><rect x="99" y="38" width="2" height="94" fill="#d0201b"/><circle cx="100" cy="36" r="8" fill="#d0201b"/></g>
    <circle cx="100" cy="100" r="3" fill="#d0201b"/>` },
  colourful: { n: 'Colourful', draw: () => { const cols = ['#e63946', '#f4a261', '#e9c46a', '#8ac926', '#2a9d8f', '#1982c4', '#4361ee', '#6a4c93', '#c2185b', '#ff595e', '#ff924c', '#52b788'];
    let rim = ''; for(let i = 0; i < 12; i++){ const [x1, y1] = P(97, i * 30 - 15), [x2, y2] = P(97, i * 30 + 15); rim += `<path d="M100 100 L${x1} ${y1} A97 97 0 0 1 ${x2} ${y2} Z" fill="${cols[(i + 11) % 12]}"/>`; }
    let mins = ''; for(let i = 0; i < 12; i++){ const [x, y] = P(88, i * 30); mins += `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="central">${String(i * 5).padStart(2, '0')}</text>`; }
    let dots = ''; for(let i = 1; i <= 12; i++){ const [x, y] = P(64, i * 30); dots += `<circle cx="${x}" cy="${y}" r="12" fill="${cols[i - 1]}"/><text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="central">${i}</text>`; }
    return `${rim}<circle cx="100" cy="100" r="81" fill="#fff"/>${ticks(76, 78, 81, '#14323a', '#b7c4c6', 2, 1)}
    <g id="cNums" class="cnums colour"><g class="mins">${mins}</g>${dots}</g>
    <g id="hH"><line x1="100" y1="100" x2="100" y2="58" stroke="#e63946" stroke-width="9" stroke-linecap="round"/></g>
    <g id="hM"><line x1="100" y1="100" x2="100" y2="30" stroke="#1982c4" stroke-width="6" stroke-linecap="round"/></g>
    <g id="hS"><line x1="100" y1="110" x2="100" y2="26" stroke="#8ac926" stroke-width="2.2" stroke-linecap="round"/></g>
    <circle cx="100" cy="100" r="7" fill="#ffc845" stroke="#14323a" stroke-width="1.5"/>`; } },
  dark: { n: 'Dark', draw: () => `<circle cx="100" cy="100" r="98" fill="#3a4246"/><circle cx="100" cy="100" r="94" fill="#121619"/>
    ${ticks(80, 86, 90, '#f2f2f2', '#69757a', 3, 1.1)}
    <g id="cNums" class="cnums dark">${numbers(67, ARABIC)}</g>
    <g id="hH"><line x1="100" y1="108" x2="100" y2="54" stroke="#f2f2f2" stroke-width="7" stroke-linecap="round"/></g>
    <g id="hM"><line x1="100" y1="110" x2="100" y2="28" stroke="#f2f2f2" stroke-width="4.5" stroke-linecap="round"/></g>
    <g id="hS"><line x1="100" y1="118" x2="100" y2="22" stroke="#ffc845" stroke-width="1.8" stroke-linecap="round"/></g>
    <circle cx="100" cy="100" r="5" fill="#ffc845"/>` }
};
function drawFace(){ if(!FACES[S.face]) S.face = 'classroom'; face.innerHTML = FACES[S.face].draw(); }
$('cFaces').innerHTML = Object.entries(FACES).map(([k, f]) => `<button type="button" data-f="${k}">${f.n}</button>`).join('');
document.querySelectorAll('#cFaces button').forEach(b => b.addEventListener('click', () => { S.face = b.dataset.f; drawFace(); apply(); CT.track('clock-face-' + S.face); }));
drawFace();

// flip clock: split-flap cards – the top half of the old number folds down to show the new one
let flipLast = '';
const HALVES = '<span class="h up"><b></b></span><span class="h dn"><b></b></span><span class="h fu"><b></b></span><span class="h fb"><b></b></span>';
function flipCard(d, ch, animate){
  const [up, dn, fu, fb] = d.querySelectorAll('b'), old = d.dataset.v || ch;
  up.textContent = ch; fu.textContent = old; fb.textContent = ch; dn.textContent = animate ? old : ch;
  d.dataset.v = ch; d.classList.remove('flip'); void d.offsetWidth; if(animate) d.classList.add('flip');
}
function flipPaint(str, ampm){
  const box = $('cFlip');
  if(box.dataset.len !== String(str.length)){
    box.dataset.len = str.length; flipLast = '';
    box.innerHTML = str.split('').map((ch, i) => (i && i % 2 === 0 ? '<i class="sep">:</i>' : '') + `<span class="fd" id="fd${i}">${HALVES}</span>`).join('') + '<em id="fAmPm"></em>';
    box.querySelectorAll('.fd').forEach(d => d.querySelector('.fb').addEventListener('animationend', () => {
      d.querySelector('.dn b').textContent = d.dataset.v; d.classList.remove('flip');
    }));
  }
  str.split('').forEach((ch, i) => { if(flipLast[i] !== ch) flipCard($('fd' + i), ch, !!flipLast && !document.hidden); });
  flipLast = str; $('fAmPm').textContent = ampm;
}
function tick(){
  const d = new Date(), h = d.getHours(), m = d.getMinutes(), s = d.getSeconds(), ms = d.getMilliseconds();
  $('hH').setAttribute('transform', `rotate(${(h % 12) * 30 + m * .5} 100 100)`);
  $('hM').setAttribute('transform', `rotate(${m * 6 + s * .1} 100 100)`);
  $('hS').setAttribute('transform', `rotate(${(s + ms / 1000) * 6} 100 100)`);
  $('hS').style.display = S.secs ? '' : 'none';
  let hh = S.h24 ? String(h).padStart(2, '0') : String(h % 12 || 12);
  $('cDigital').innerHTML = `${hh}:${String(m).padStart(2, '0')}${S.secs ? `<small>:${String(s).padStart(2, '0')}</small>` : ''}${S.h24 ? '' : `<em>${h < 12 ? 'am' : 'pm'}</em>`}`;
  if(S.mode === 'flip') flipPaint(hh.padStart(2, '0') + String(m).padStart(2, '0') + (S.secs ? String(s).padStart(2, '0') : ''), S.h24 ? '' : (h < 12 ? 'AM' : 'PM'));
  $('cDate').textContent = S.date ? d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : '';
  requestAnimationFrame(tick);
}
function apply(){
  $('stage').dataset.mode = S.mode;
  $('cNums').style.display = S.nums ? '' : 'none';
  document.querySelectorAll('#cModes button').forEach(b => b.classList.toggle('on', b.dataset.m === S.mode));
  document.querySelectorAll('#cFaces button').forEach(b => b.classList.toggle('on', b.dataset.f === S.face));
  $('cFaceRow').hidden = S.mode === 'digital' || S.mode === 'flip';
  $('cH24').checked = S.h24; $('cSecs').checked = S.secs; $('cDateOn').checked = S.date; $('cNumsOn').checked = S.nums;
  CT.save('clock', S);
}
document.querySelectorAll('#cModes button').forEach(b => b.addEventListener('click', () => { S.mode = b.dataset.m; apply(); }));
[['cH24', 'h24'], ['cSecs', 'secs'], ['cDateOn', 'date'], ['cNumsOn', 'nums']].forEach(([id, k]) => $(id).addEventListener('change', () => { S[k] = $(id).checked; apply(); }));
CT.fullscreen($('fsBtn'), $('stage'));
CT.keys({ f: () => $('fsBtn').click() });
apply(); tick();
})();
