/* classroomtimer.co.uk – the big visual countdown (Classroom timer + Fun timers pages)
   Page sets window.VT = { styles: [...], def: 'ring', key: 'home' } before this file loads. */
(function(){
const OPT = window.VT || { styles: ['ring', 'bar', 'digits'], def: 'ring', key: 'home' };
const STYLE_NAMES = { arrow: '➜ Arrow clock', ring: '⭕ Ring', bar: '▬ Bar', digits: '🔢 Numbers only', sand: '⏳ Sand timer', traffic: '🚦 Traffic light', candle: '🕯️ Candle', race: '🐢 Animal race' };
const PRESETS = [[60, 'Quick task'], [120, 'Pair talk'], [180, 'Think time'], [300, 'Tidy up'], [600, 'Group work'], [900, 'Reading'], [1200, 'Test'], [1800, 'Lesson task'], [2700, 'Practice paper'], [3600, 'Exam']];
const S = CT.load('vt-' + OPT.key, { style: OPT.def, sound: OPT.key === 'fun' ? 'tada' : 'chime', tick: false, secs: 300, label: 'Tidy up', animal: 'tortoise' });
if(!OPT.styles.includes(S.style)) S.style = OPT.def;
let style = S.style, label = S.label, animal = S.animal, running = false, finished = false;
// the card's controls
$('vt').innerHTML = `
  <div class="chips" id="vtStyles">${OPT.styles.map(s => `<button type="button" data-s="${s}">${STYLE_NAMES[s]}</button>`).join('')}</div>
  <div class="animals" id="animals" hidden></div>
  <div class="stage" id="stage">
    <button class="fs-btn" id="fsBtn" type="button"></button>
    <div class="vis" id="vis"></div>
    <button class="digits" id="digits" type="button" title="Tap to change the time">5:00</button>
    <div class="edit" id="edit">
      <input id="editM" type="number" min="0" max="360" inputmode="numeric" aria-label="Minutes"><span>:</span>
      <input id="editS" type="number" min="0" max="59" inputmode="numeric" aria-label="Seconds">
      <button id="editOk" type="button">Set</button>
    </div>
    <div class="lbl" id="lbl"></div>
    <div class="fsctrl"><button class="btn go" id="fsGo" type="button">Start</button><button class="btn ghost" id="fsReset" type="button">Reset</button></div>
  </div>
  <div class="presets" id="presets">${PRESETS.map(([t, l]) => `<button type="button" data-t="${t}" data-l="${l}"><b>${t >= 3600 ? t / 3600 + ' hr' : t / 60 + ' min'}</b><small>${l}</small></button>`).join('')}</div>
  <div class="ctrl" style="margin-top:8px">
    <button type="button" class="small-btn" data-a="-60">− 1 min</button><button type="button" class="small-btn" data-a="-10">− 10 s</button>
    <button type="button" class="small-btn" data-a="10">+ 10 s</button><button type="button" class="small-btn" data-a="60">+ 1 min</button>
  </div>
  <div class="ctrl"><button class="btn go" id="go" type="button">Start</button><button class="btn ghost" id="reset" type="button">Reset</button></div>
  <div class="opts">
    <label>Sound at the end <select id="sound"></select></label>
    <button type="button" class="small-btn" id="test">▶ Test sound</button>
    <label><input type="checkbox" id="tick"> Tick in the last 10 seconds</label>
  </div>
  <p class="hint">Tap the numbers to type any time. Keyboard: Space start/pause · R reset · F full screen.</p>`;

const ANIMALS = {
  tortoise: ['Tortoise', `<g><rect x="18" y="58" width="12" height="16" rx="5" fill="#5a9e3f"/><rect x="58" y="58" width="12" height="16" rx="5" fill="#5a9e3f"/>
    <circle cx="84" cy="50" r="13" fill="#7cc35a"/><circle cx="89" cy="46" r="3" fill="#14323a"/><path d="M84 56 q5 3 9 0" stroke="#14323a" stroke-width="2" fill="none"/>
    <path d="M6 62 Q8 18 46 16 Q84 18 86 62 Z" fill="#3f8f4f"/><path d="M6 62 h80" stroke="#2c6b38" stroke-width="5" stroke-linecap="round"/>
    <circle cx="30" cy="42" r="9" fill="#58a85f"/><circle cx="54" cy="36" r="9" fill="#58a85f"/><circle cx="46" cy="54" r="6" fill="#58a85f"/><circle cx="68" cy="50" r="6" fill="#58a85f"/>
    <path d="M6 58 l-8 4 8 2z" fill="#7cc35a"/></g>`],
  rabbit: ['Rabbit', `<g><ellipse cx="40" cy="54" rx="30" ry="20" fill="#f1ece6"/><circle cx="12" cy="50" r="8" fill="#fff"/>
    <rect x="24" y="66" width="12" height="10" rx="5" fill="#e4ddd4"/><rect x="50" y="66" width="12" height="10" rx="5" fill="#e4ddd4"/>
    <ellipse cx="62" cy="6" rx="6" ry="20" fill="#f1ece6" transform="rotate(-12 62 26)"/><ellipse cx="62" cy="6" rx="3" ry="14" fill="#f6b8c4" transform="rotate(-12 62 26)"/>
    <ellipse cx="74" cy="6" rx="6" ry="20" fill="#f1ece6" transform="rotate(12 74 26)"/><ellipse cx="74" cy="6" rx="3" ry="14" fill="#f6b8c4" transform="rotate(12 74 26)"/>
    <circle cx="70" cy="36" r="16" fill="#f1ece6"/><circle cx="76" cy="32" r="3" fill="#14323a"/><circle cx="85" cy="38" r="3" fill="#f08aa0"/>
    <circle cx="74" cy="42" r="4" fill="#f6c6d0" opacity=".7"/></g>`],
  snail: ['Snail', `<g><path d="M2 70 Q4 58 20 58 L74 58 Q92 58 92 44 L96 44 Q98 72 70 72 Z" fill="#c9e36b"/>
    <path d="M84 46 L80 24" stroke="#a8c94f" stroke-width="4" stroke-linecap="round"/><path d="M90 46 L92 26" stroke="#a8c94f" stroke-width="4" stroke-linecap="round"/>
    <circle cx="80" cy="22" r="4.5" fill="#14323a"/><circle cx="92" cy="24" r="4.5" fill="#14323a"/><path d="M88 52 q4 3 7 0" stroke="#14323a" stroke-width="2" fill="none"/>
    <circle cx="40" cy="38" r="24" fill="#F29E4C"/><circle cx="42" cy="38" r="16" fill="#f6b56c"/><circle cx="44" cy="38" r="9" fill="#F29E4C"/><circle cx="45" cy="38" r="3.5" fill="#f6b56c"/></g>`],
  duck: ['Duck', `<g><rect x="34" y="62" width="5" height="12" fill="#ff9c33"/><rect x="48" y="62" width="5" height="12" fill="#ff9c33"/>
    <path d="M30 74 h12 M44 74 h12" stroke="#ff9c33" stroke-width="5" stroke-linecap="round"/>
    <ellipse cx="42" cy="50" rx="32" ry="18" fill="#FFD43B"/><path d="M10 44 l-8 -8 12 4z" fill="#FFD43B"/>
    <path d="M30 46 q14 14 28 0" fill="#f4c21f"/><circle cx="70" cy="28" r="15" fill="#FFD43B"/>
    <path d="M82 28 l14 4 -14 5z" fill="#ff8a1f"/><circle cx="74" cy="24" r="3" fill="#14323a"/></g>`],
  dino: ['Dinosaur', `<g><path d="M4 50 Q20 44 34 48 L30 56 Q14 58 4 50z" fill="#4fbf8f"/>
    <ellipse cx="46" cy="52" rx="24" ry="16" fill="#4fbf8f"/><rect x="34" y="60" width="10" height="14" rx="4" fill="#3da57a"/><rect x="54" y="60" width="10" height="14" rx="4" fill="#3da57a"/>
    <path d="M62 44 Q72 26 76 14" stroke="#4fbf8f" stroke-width="14" stroke-linecap="round" fill="none"/>
    <ellipse cx="82" cy="12" rx="13" ry="9" fill="#4fbf8f"/><circle cx="86" cy="9" r="2.8" fill="#14323a"/><path d="M88 16 q4 1 6 -2" stroke="#14323a" stroke-width="2" fill="none"/>
    <path d="M30 38 l5 -8 5 8 M42 36 l5 -9 5 9 M54 38 l5 -8 4 8" fill="#ffc845"/>
    <circle cx="44" cy="54" r="4" fill="#3da57a"/><circle cx="56" cy="48" r="3" fill="#3da57a"/></g>`],
  ladybird: ['Ladybird', `<g><path d="M22 70 l-6 6 M36 72 l0 6 M52 72 l0 6 M66 70 l6 6" stroke="#14323a" stroke-width="3" stroke-linecap="round"/>
    <circle cx="80" cy="50" r="13" fill="#2b2f36"/><circle cx="85" cy="46" r="3" fill="#fff"/><circle cx="86" cy="46" r="1.5" fill="#14323a"/>
    <path d="M84 38 q4 -12 12 -12 M78 38 q-2 -12 4 -16" stroke="#2b2f36" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    <path d="M8 64 Q8 26 44 26 Q78 26 78 64 Z" fill="#ff4d42"/><path d="M44 26 V64" stroke="#2b2f36" stroke-width="3"/>
    <circle cx="28" cy="46" r="6" fill="#2b2f36"/><circle cx="58" cy="44" r="6" fill="#2b2f36"/><circle cx="34" cy="58" r="4" fill="#2b2f36"/><circle cx="62" cy="57" r="4" fill="#2b2f36"/></g>`]
};
const FINISH_X = 728, RACE_X0 = 64, RACE_X1 = FINISH_X - 82;   // the animal's nose just crosses the finish line at zero
function raceScene(){
  const flowers = [0.25, 0.5, 0.75].map((q, i) => {
    const x = RACE_X0 + 45 + (RACE_X1 - RACE_X0) * q, col = ['#ff6fa8','#7f77dd','#ff9c33'][i];
    return `<g class="bloom bud" id="fl${i}" transform="translate(${x} 182)"><path d="M0 0 V40" stroke="#3a9a4a" stroke-width="4"/><ellipse cx="9" cy="24" rx="9" ry="4" fill="#4fb65a"/>
      <g class="petals">${[0,72,144,216,288].map(a => `<ellipse cx="0" cy="-11" rx="7" ry="11" fill="${col}" transform="rotate(${a})"/>`).join('')}<circle r="7" fill="#ffd43b"/></g></g>`;
  }).join('');
  return `<svg class="race" viewBox="0 0 800 300" role="img" aria-label="Animal race to the finish line">
    <defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8fd3ff"/><stop offset="1" stop-color="#dff3ff"/></linearGradient>
      <pattern id="chk" width="16" height="16" patternUnits="userSpaceOnUse"><rect width="16" height="16" fill="#fff"/><rect width="8" height="8" fill="#14323a"/><rect x="8" y="8" width="8" height="8" fill="#14323a"/></pattern></defs>
    <rect width="800" height="300" fill="url(#sky)"/>
    <circle cx="700" cy="56" r="34" fill="#ffd43b"/><circle cx="700" cy="56" r="46" fill="#ffd43b" opacity=".25"/>
    <g class="cloud"><ellipse cx="120" cy="60" rx="46" ry="18" fill="#fff"/><ellipse cx="150" cy="48" rx="30" ry="18" fill="#fff"/></g>
    <g class="cloud c2" style="animation-delay:-20s"><ellipse cx="380" cy="86" rx="40" ry="15" fill="#fff"/><ellipse cx="404" cy="76" rx="24" ry="14" fill="#fff"/></g>
    <path d="M0 190 Q140 130 300 176 T600 160 T800 170 V300 H0Z" fill="#9ed36a"/>
    <path d="M0 210 Q200 180 420 205 T800 196 V300 H0Z" fill="#7cc35a"/>
    <rect x="0" y="222" width="800" height="54" fill="#d9b48a"/><path d="M0 249 H800" stroke="#c99f71" stroke-width="3" stroke-dasharray="18 14"/>
    <rect x="${RACE_X0 + 40}" y="222" width="6" height="54" fill="#fff"/>
    <rect x="${FINISH_X}" y="222" width="16" height="54" fill="url(#chk)"/>
    <rect x="${FINISH_X + 12}" y="120" width="5" height="104" fill="#6b4a2d"/>
    <path d="M${FINISH_X + 17} 122 h48 l-10 15 10 15 h-48z" fill="url(#chk)" stroke="#14323a" stroke-width="1.5"/>
    ${flowers}
    <g id="racer" transform="translate(${RACE_X0} 172)"><g class="body" style="transform-box:fill-box;transform-origin:50% 100%">${ANIMALS[animal][1]}</g></g>
  </svg>`;
}
function confetti(){
  const st = $('stage'), cols = ['#ff4d42','#ffc845','#27d17f','#7f77dd','#36a9f5','#ff6fa8'];
  for(let i = 0; i < 70; i++){
    const c = document.createElement('i'); c.className = 'confetti';
    c.style.left = Math.random() * 100 + '%'; c.style.background = cols[i % cols.length];
    c.style.animationDelay = Math.random() * .8 + 's'; c.style.animationDuration = 2 + Math.random() * 1.6 + 's';
    st.appendChild(c); setTimeout(() => c.remove(), 4500);
  }
}

const sandGrains = [];
function drawSand(f){
  const c = $('sand'); if(!c) return;
  const g = c.getContext('2d'), W = 400, H = 560, cx = W / 2, top = 40, mid = H / 2, bot = H - 40, half = 150, neck = 9;
  g.clearRect(0, 0, W, H);
  // wooden frame
  g.fillStyle = '#8a5a35'; g.beginPath(); g.roundRect(30, 8, W - 60, 30, 12); g.fill(); g.beginPath(); g.roundRect(30, H - 38, W - 60, 30, 12); g.fill();
  g.fillStyle = '#6e4527'; g.fillRect(52, 38, 12, H - 76); g.fillRect(W - 64, 38, 12, H - 76);
  // glass outline as a path
  const glass = new Path2D();
  glass.moveTo(cx - half, top); glass.lineTo(cx + half, top);
  glass.bezierCurveTo(cx + half, top + 150, cx + neck, mid - 40, cx + neck, mid);
  glass.bezierCurveTo(cx + neck, mid + 40, cx + half, bot - 150, cx + half, bot);
  glass.lineTo(cx - half, bot);
  glass.bezierCurveTo(cx - half, bot - 150, cx - neck, mid + 40, cx - neck, mid);
  glass.bezierCurveTo(cx - neck, mid - 40, cx - half, top + 150, cx - half, top);
  g.fillStyle = 'rgba(210,235,240,.45)'; g.fill(glass);
  g.save(); g.clip(glass);
  const sand = '#F2B84B', sandDark = '#D99A2B';
  // top bulb: sand surface drops as time runs out (the top part is wider, so use a square-root curve to look even)
  const topH = (mid - top - 18) * Math.sqrt(Math.max(0, f));
  if(f > 0){ g.fillStyle = sand; g.fillRect(0, mid - 8 - topH, W, topH + 8); g.fillStyle = sandDark; g.fillRect(0, mid - 8 - topH, W, 3); }
  // bottom heap grows
  const used = 1 - f, heapH = (bot - mid - 30) * Math.sqrt(used);
  if(used > 0){
    g.fillStyle = sand; g.beginPath(); g.moveTo(0, bot); g.lineTo(0, bot - heapH * .55);
    g.quadraticCurveTo(cx, bot - heapH * 1.35, W, bot - heapH * .55); g.lineTo(W, bot); g.closePath(); g.fill();
  }
  // falling stream while running
  if(running && f > 0){
    g.fillStyle = sand; g.fillRect(cx - 2.5, mid - 6, 5, bot - mid - heapH * .9);
    for(const p of sandGrains){ g.beginPath(); g.arc(cx + p.x, p.y, 2, 0, Math.PI * 2); g.fill(); }
  }
  g.restore();
  g.lineWidth = 4; g.strokeStyle = 'rgba(120,160,170,.8)'; g.stroke(glass);
  g.lineWidth = 6; g.strokeStyle = 'rgba(255,255,255,.7)'; g.beginPath(); g.moveTo(cx - half + 22, top + 14); g.bezierCurveTo(cx - half + 22, top + 90, cx - 60, mid - 90, cx - 30, mid - 50); g.stroke();
}

// ---------- visual styles ----------
const cd = new CT.Countdown({
  onTick: () => render(),
  onSecond: w => { if($('tick').checked && w <= 10 && w > 0 && running) CT.play('tick'); },
  onState: c => { running = c.running; setBtns(); render(); },
  onEnd: () => finish()
});
function buildVis(){
  const v = $('vis');
  $('digits').classList.toggle('big', style === 'digits');
  v.style.display = style === 'digits' ? 'none' : '';
  v.style.width = style === 'bar' ? 'min(760px,100%)' : style === 'race' ? 'min(900px,100%)' : '';
  v.style.aspectRatio = style === 'bar' || style === 'race' ? 'auto' : '';
  $('animals').hidden = style !== 'race';
  $('stage').classList.toggle('race-on', style === 'race');
  document.querySelectorAll('#vtStyles button').forEach(b => b.classList.toggle('on', b.dataset.s === style));
  if(style === 'arrow'){
    let t = '';
    for(let i = 0; i < 60; i++){ const a = i * 6 * Math.PI / 180, big = i % 5 === 0, r1 = big ? 80 : 86; t += `<line x1="${100 + r1 * Math.sin(a)}" y1="${100 - r1 * Math.cos(a)}" x2="${100 + 92 * Math.sin(a)}" y2="${100 - 92 * Math.cos(a)}" stroke="${big ? '#14323a' : '#b5c6c4'}" stroke-width="${big ? 3 : 1.2}" stroke-linecap="round"/>`; }
    v.innerHTML = `<svg class="arrowc" viewBox="0 0 200 200"><circle cx="100" cy="100" r="97" fill="#fff" stroke="#0F5257" stroke-width="5"/>
      <path id="slice" d="" opacity=".9"/>${t}
      <g id="hand"><line x1="100" y1="112" x2="100" y2="26" stroke="#14323a" stroke-width="5" stroke-linecap="round"/><path d="M100 12 L109 30 L91 30 Z" fill="#14323a"/></g>
      <circle cx="100" cy="100" r="8" fill="#14323a"/><circle cx="100" cy="100" r="3" fill="#fff"/></svg>`;
  }
  else if(style === 'ring') v.innerHTML = `<svg class="ring" viewBox="0 0 200 200"><circle class="track" cx="100" cy="100" r="86" fill="none" stroke-width="22"/>
      <circle id="prog" class="prog" cx="100" cy="100" r="86" fill="none" stroke-width="22" stroke-linecap="round" transform="rotate(-90 100 100)" stroke-dasharray="540.35" stroke-dashoffset="0"/></svg>`;
  else if(style === 'bar') v.innerHTML = '<div class="bar"><i id="barFill"></i></div>';
  else if(style === 'sand') v.innerHTML = '<canvas id="sand" width="400" height="560" style="height:100%;width:71.4%"></canvas>';
  else if(style === 'race') v.innerHTML = raceScene();
  else if(style === 'traffic') v.innerHTML = '<div class="tl"><b class="r"></b><b class="a"></b><b class="g"></b></div>';
  else if(style === 'candle') v.innerHTML = `<svg id="candle" viewBox="0 -34 200 294" style="height:100%;width:68%">
      <defs>
        <linearGradient id="cWax" x1="0" x2="1"><stop offset="0" stop-color="#d9473a"/><stop offset=".35" stop-color="#ff7a6b"/><stop offset=".55" stop-color="#ff9f93"/><stop offset="1" stop-color="#d44a3e"/></linearGradient>
        <radialGradient id="cGlow"><stop offset="0" stop-color="#ffd76a" stop-opacity=".55"/><stop offset=".5" stop-color="#ffb84a" stop-opacity=".18"/><stop offset="1" stop-color="#ffb84a" stop-opacity="0"/></radialGradient>
        <linearGradient id="cOuter" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#ff6a1f"/><stop offset=".35" stop-color="#ffa62b"/><stop offset=".8" stop-color="#ffd257"/><stop offset="1" stop-color="#fff0a8" stop-opacity=".9"/></linearGradient>
        <linearGradient id="cInner" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#fff3c4"/><stop offset="1" stop-color="#fffdf2"/></linearGradient>
      </defs>
      <ellipse cx="100" cy="246" rx="70" ry="10" fill="#d9e4e2"/><rect x="40" y="228" width="120" height="16" rx="8" fill="#b9c9c6"/>
      <g id="wax"><rect id="body" x="70" y="60" width="60" height="170" rx="6" fill="url(#cWax)"/>
        <ellipse id="pool" cx="100" cy="60" rx="30" ry="6" fill="#ffb3a8"/><ellipse id="pool2" cx="100" cy="61" rx="23" ry="3.6" fill="#ff8f81"/>
        <path id="drip" d="M72 60 q-2 18 3 26 q5 3 6 -6 q1 -12 -1 -20z M118 60 q2 10 5 14 q4 2 4 -5 q0 -6 -1 -9z" fill="#ff8a7c"/></g>
      <g id="flameG">
        <circle class="glow" cx="100" cy="24" r="52" fill="url(#cGlow)"/>
        <g class="flame">
          <path d="M100 -8 C112 10 120 26 114 38 C110 46 105 49 100 49 C95 49 90 46 86 38 C80 26 88 10 100 -8z" fill="url(#cOuter)"/>
          <path d="M100 14 C106 24 109 32 106 39 C104 43 102 45 100 45 C98 45 96 43 94 39 C91 32 94 24 100 14z" fill="url(#cInner)"/>
          <ellipse cx="100" cy="46" rx="6" ry="3.5" fill="#5b9dff" opacity=".75"/>
        </g>
        <path d="M100 62 L100 48 q0 -3 2 -4" stroke="#2c2c2c" stroke-width="2.6" fill="none" stroke-linecap="round"/>
        <circle cx="102" cy="41" r="1.8" fill="#ff5a1f"/>
      </g>
      <g id="wickOut"><path d="M100 62 L100 50 q0 -3 2 -5" stroke="#2c2c2c" stroke-width="3" fill="none" stroke-linecap="round"/></g>
      <g class="smoke" id="smoke"><circle cx="100" cy="0" r="5" fill="#aab6b4" opacity=".6"/><circle cx="106" cy="-12" r="7" fill="#aab6b4" opacity=".4"/><circle cx="98" cy="-26" r="9" fill="#aab6b4" opacity=".25"/></g></svg>`;
  render();
}
function render(){
  const left = cd.left, f = cd.fraction;
  $('digits').textContent = CT.fmt(left);
  if(style === 'arrow' && $('hand')){
    // the arrow sweeps clockwise from 12 o'clock; the coloured slice is the time still to go
    const a = (1 - f) * 360, r = 78, rad = a * Math.PI / 180, x = 100 + r * Math.sin(rad), y = 100 - r * Math.cos(rad);
    $('hand').setAttribute('transform', `rotate(${a} 100 100)`);
    const sl = $('slice');
    if(f >= .999) sl.setAttribute('d', `M100 100 m0 -${r} a${r} ${r} 0 1 1 -0.01 0 Z`);
    else if(f <= 0) sl.setAttribute('d', '');
    else sl.setAttribute('d', `M100 100 L${x} ${y} A${r} ${r} 0 ${f > .5 ? 1 : 0} 1 100 ${100 - r} Z`);
    sl.style.fill = CT.colourFor(f);
  }
  if(style === 'ring' && $('prog')){ const p = $('prog'); p.style.strokeDashoffset = 540.35 * (1 - f); p.style.stroke = CT.colourFor(f); }
  if(style === 'bar' && $('barFill')){ const b = $('barFill'); b.style.transform = `scaleX(${f})`; b.style.background = CT.colourFor(f); }
  if(style === 'sand'){
    if(running){ for(const p of sandGrains){ p.y += p.v; if(p.y > 520) p.y = 290; } if(sandGrains.length < 14) sandGrains.push({ x: (Math.random() - .5) * 6, y: 290 + Math.random() * 200, v: 3 + Math.random() * 3 }); }
    drawSand(f);
  }
  if(style === 'traffic'){ const k = finished || f <= .2 ? 0 : f <= .5 ? 1 : 2; document.querySelectorAll('.tl b').forEach((b, i) => b.classList.toggle('on', i === k)); }
  if(style === 'candle' && $('body')){
    const h = 20 + 150 * f, y = 230 - h;
    $('body').setAttribute('y', y); $('body').setAttribute('height', h);
    $('pool').setAttribute('cy', y); $('pool2').setAttribute('cy', y + 1);
    $('drip').setAttribute('transform', `translate(0 ${y - 60})`); $('drip').style.display = h < 50 ? 'none' : '';
    $('flameG').setAttribute('transform', `translate(0 ${y - 60})`); $('wickOut').setAttribute('transform', `translate(0 ${y - 60})`);
    $('smoke').setAttribute('transform', `translate(0 ${y - 24})`);
    $('candle').classList.toggle('out', finished);
  }
  if(style === 'race' && $('racer')){
    $('racer').setAttribute('transform', `translate(${RACE_X0 + (RACE_X1 - RACE_X0) * (1 - f)} 172)`);
    $('racer').classList.toggle('walk', running); $('racer').classList.toggle('win', finished);
    [0.25, 0.5, 0.75].forEach((q, i) => { const fl = $('fl' + i); if(fl) fl.classList.toggle('bud', (1 - f) < q); });
  }
  $('stage').classList.toggle('warn', running && left <= 10 && left > 0 && style !== 'race');
}
function setBtns(){
  const left = cd.left;
  [$('go'), $('fsGo')].forEach(b => { b.textContent = running ? 'Pause' : left < cd.total && left > 0 ? 'Resume' : 'Start'; b.className = 'btn ' + (running ? 'pause' : 'go'); });
}
function start(){ finished = false; $('stage').classList.remove('done'); if(cd.left <= 0) cd.reset(); $('lbl').textContent = label; cd.start(); CT.track('start-' + OPT.key + '-' + style); }
function pause(){ cd.pause(); }
function reset(){ finished = false; $('stage').classList.remove('done', 'warn'); $('lbl').textContent = label; cd.reset(); setBtns(); }
function finish(){
  finished = true; running = false; render(); setBtns();
  $('stage').classList.remove('warn'); void $('stage').offsetWidth; $('stage').classList.add('done');
  $('lbl').textContent = style === 'race' ? `Hooray! ${ANIMALS[animal][0]} wins! 🎉` : "Time's up!";
  if(style === 'race') confetti();
  CT.play($('sound').value);
  setTimeout(() => { if(finished && style !== 'race') $('lbl').textContent = label; }, 6000);
}
function setTime(sec, lbl){
  sec = Math.max(1, Math.min(Math.round(sec), 6 * 3600));
  label = lbl || ''; finished = false; $('lbl').textContent = label; $('stage').classList.remove('done', 'warn');
  cd.set(sec);
  document.querySelectorAll('#presets button').forEach(b => b.classList.toggle('on', +b.dataset.t === sec));
  S.secs = sec; S.label = label; CT.save('vt-' + OPT.key, S); setBtns();
}
// ---------- set-up ----------
CT.soundSelect($('sound'), S.sound); $('tick').checked = !!S.tick;
$('sound').addEventListener('change', () => { S.sound = $('sound').value; CT.save('vt-' + OPT.key, S); });
$('tick').addEventListener('change', () => { S.tick = $('tick').checked; CT.save('vt-' + OPT.key, S); });
$('test').addEventListener('click', () => CT.play($('sound').value));
document.querySelectorAll('#presets button').forEach(b => b.addEventListener('click', () => setTime(+b.dataset.t, b.dataset.l)));
document.querySelectorAll('.ctrl [data-a]').forEach(b => b.addEventListener('click', () => {
  const d = +b.dataset.a;
  if(running || (cd.left > 0 && cd.left < cd.total)) cd.add(d); else setTime(Math.max(10, cd.left + d), label);
  setBtns();
}));
document.querySelectorAll('#vtStyles button').forEach(b => b.addEventListener('click', () => {
  style = b.dataset.s; S.style = style; CT.save('vt-' + OPT.key, S); buildVis();
  try { history.replaceState(null, '', '#' + style); } catch(e) {}
}));
[$('go'), $('fsGo')].forEach(b => b.addEventListener('click', () => running ? pause() : start()));
[$('reset'), $('fsReset')].forEach(b => b.addEventListener('click', reset));
// tap the numbers to type a time
$('digits').addEventListener('click', () => {
  if(running) return;
  const l = Math.round(cd.left);
  $('editM').value = Math.floor(l / 60); $('editS').value = l % 60;
  $('digits').style.display = 'none'; $('edit').classList.add('on'); $('editM').focus(); $('editM').select();
});
function closeEdit(){
  const m = Math.max(0, parseInt($('editM').value, 10) || 0), s = Math.max(0, Math.min(59, parseInt($('editS').value, 10) || 0));
  $('edit').classList.remove('on'); $('digits').style.display = '';
  setTime(m * 60 + s || 60, '');
}
$('editOk').addEventListener('click', closeEdit);
['editM', 'editS'].forEach(id => $(id).addEventListener('keydown', e => { if(e.key === 'Enter') closeEdit(); if(e.key === 'Escape'){ $('edit').classList.remove('on'); $('digits').style.display = ''; } }));
CT.fullscreen($('fsBtn'), $('stage'), () => render());
CT.keys({ Space: () => running ? pause() : start(), r: reset, f: () => $('fsBtn').click() });
if($('animals')){
  $('animals').innerHTML = Object.entries(ANIMALS).map(([k, [nm, art]]) => `<button type="button" data-a="${k}"${k === animal ? ' class="on"' : ''}><svg viewBox="-4 -16 104 96">${art}</svg>${nm}</button>`).join('');
  document.querySelectorAll('#animals button').forEach(b => b.addEventListener('click', () => {
    animal = b.dataset.a; S.animal = animal; CT.save('vt-' + OPT.key, S);
    document.querySelectorAll('#animals button').forEach(x => x.classList.toggle('on', x === b)); buildVis();
  }));
}
// a link like /fun-timers/#race opens that style
const h = location.hash.slice(1); if(OPT.styles.includes(h)) style = h;
buildVis(); setTime(S.secs, S.label);
})();
