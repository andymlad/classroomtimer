/* Countdowns to holidays and special dates (moving dates such as Easter are worked out each year) */
(function(){
function easter(y){
  const a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3),
    h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451),
    mo = Math.floor((h + l - 7 * m + 114) / 31), da = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(y, mo - 1, da);
}
const shift = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
// nth weekday of a month (wd: 0 = Sunday … 6 = Saturday); n = -1 means the last one
function nth(y, m, wd, n){
  if(n > 0){ const d = new Date(y, m, 1); return new Date(y, m, 1 + (wd - d.getDay() + 7) % 7 + 7 * (n - 1)); }
  const d = new Date(y, m + 1, 0); return new Date(y, m, d.getDate() - (d.getDay() - wd + 7) % 7);
}
const fixed = (m, d) => y => new Date(y, m, d);
const E = (k, n, e, c, bg, d) => ({ k, n, e, c, bg, d });
// shared holidays
const H = {
  newyear: E('newyear', 'New Year', '🎆', '#4b3fb5', '#ecebff', fixed(0, 1)),
  valentine: E('valentine', 'Valentine’s Day', '💘', '#d23f74', '#fdeaf2', fixed(1, 14)),
  stpatrick: E('stpatrick', 'St Patrick’s Day', '☘️', '#1f8a43', '#e6f6ea', fixed(2, 17)),
  goodfriday: E('goodfriday', 'Good Friday', '✝️', '#7a5a3a', '#f6efe6', y => shift(easter(y), -2)),
  easter: E('easter', 'Easter Sunday', '🐣', '#c7a100', '#fffad9', y => easter(y)),
  eastermon: E('eastermon', 'Easter Monday', '🐰', '#c7a100', '#fffad9', y => shift(easter(y), 1)),
  halloween: E('halloween', 'Halloween', '🎃', '#d96a0b', '#fff0e0', fixed(9, 31)),
  xmaseve: E('xmaseve', 'Christmas Eve', '🎅', '#b3261e', '#fdeaea', fixed(11, 24)),
  christmas: E('christmas', 'Christmas Day', '🎄', '#C8102E', '#fdeaea', fixed(11, 25)),
  boxing: E('boxing', 'Boxing Day', '🎁', '#b3261e', '#fdeaea', fixed(11, 26)),
  pancake: E('pancake', 'Pancake Day', '🥞', '#b97a12', '#fff4db', y => shift(easter(y), -47)),
  mothersUK: E('mother', 'Mother’s Day', '💐', '#c2437d', '#fdeaf2', y => shift(easter(y), -21)),
  mothersMay2: E('mother', 'Mother’s Day', '💐', '#c2437d', '#fdeaf2', y => nth(y, 4, 0, 2)),
  fathersJun3: E('father', 'Father’s Day', '👔', '#2f6fd6', '#e6efff', y => nth(y, 5, 0, 3)),
  fathersSep1: E('father', 'Father’s Day', '👔', '#2f6fd6', '#e6efff', y => nth(y, 8, 0, 1)),
  labour1: E('labour', 'Labour Day', '🛠️', '#c2412f', '#fdecea', fixed(4, 1)),
  anzac: E('anzac', 'ANZAC Day', '🌺', '#a3262e', '#fbe9ea', fixed(3, 25)),
  epiphany: E('epiphany', 'Three Kings’ Day', '👑', '#b48a0a', '#fff6d6', fixed(0, 6))
};
const C = {
  gb: { n: 'United Kingdom', f: '🇬🇧', ev: [H.christmas, H.xmaseve, H.boxing, H.newyear, H.valentine, H.pancake, H.mothersUK, H.goodfriday, H.easter,
    E('mayday', 'Early May bank holiday', '🌼', '#1f8a43', '#e6f6ea', y => nth(y, 4, 1, 1)), E('springbh', 'Spring bank holiday', '🌷', '#c2437d', '#fdeaf2', y => nth(y, 4, 1, -1)),
    H.fathersJun3, E('summerbh', 'Summer bank holiday', '☀️', '#d98a00', '#fff4db', y => nth(y, 7, 1, -1)), H.halloween,
    E('bonfire', 'Bonfire Night', '🎇', '#7a3fc2', '#f1e9ff', fixed(10, 5)), E('remembrance', 'Remembrance Sunday', '🌹', '#a3262e', '#fbe9ea', y => nth(y, 10, 0, 2))] },
  ie: { n: 'Ireland', f: '🇮🇪', ev: [H.christmas, H.xmaseve, E('ststephen', 'St Stephen’s Day', '🎁', '#1f8a43', '#e6f6ea', fixed(11, 26)), H.newyear, H.valentine, H.pancake, H.stpatrick, H.mothersUK, H.easter, H.eastermon,
    E('maybh', 'May bank holiday', '🌼', '#1f8a43', '#e6f6ea', y => nth(y, 4, 1, 1)), H.fathersJun3, E('junebh', 'June bank holiday', '☀️', '#d98a00', '#fff4db', y => nth(y, 5, 1, 1)),
    E('augbh', 'August bank holiday', '🌻', '#d98a00', '#fff4db', y => nth(y, 7, 1, 1)), E('octbh', 'October bank holiday', '🍂', '#c2412f', '#fdecea', y => nth(y, 9, 1, -1)), H.halloween] },
  us: { n: 'United States', f: '🇺🇸', ev: [H.christmas, H.xmaseve, H.newyear, E('mlk', 'Martin Luther King Jr. Day', '✊', '#4b3fb5', '#ecebff', y => nth(y, 0, 1, 3)), H.valentine,
    E('presidents', 'Presidents’ Day', '🏛️', '#2f4fa6', '#e8edff', y => nth(y, 1, 1, 3)), H.stpatrick, H.easter, H.mothersMay2, E('memorial', 'Memorial Day', '🎖️', '#a3262e', '#fbe9ea', y => nth(y, 4, 1, -1)),
    H.fathersJun3, E('july4', 'Independence Day', '🎆', '#b3261e', '#e8edff', fixed(6, 4)), E('laborus', 'Labor Day', '🛠️', '#2f4fa6', '#e8edff', y => nth(y, 8, 1, 1)), H.halloween,
    E('thanksgiving', 'Thanksgiving', '🦃', '#b0631a', '#fff0e0', y => nth(y, 10, 4, 4))] },
  ca: { n: 'Canada', f: '🇨🇦', ev: [H.christmas, H.xmaseve, H.boxing, H.newyear, H.valentine, E('family', 'Family Day', '👨‍👩‍👧', '#c2412f', '#fdecea', y => nth(y, 1, 1, 3)), H.easter, H.mothersMay2,
    E('victoria', 'Victoria Day', '👑', '#7a3fc2', '#f1e9ff', y => { const d = new Date(y, 4, 24); return shift(d, -((d.getDay() + 6) % 7)); }), H.fathersJun3,
    E('canada', 'Canada Day', '🍁', '#d0202e', '#fdeaea', fixed(6, 1)), E('laborca', 'Labour Day', '🛠️', '#c2412f', '#fdecea', y => nth(y, 8, 1, 1)),
    E('thanksca', 'Thanksgiving', '🦃', '#b0631a', '#fff0e0', y => nth(y, 9, 1, 2)), H.halloween, E('rememberca', 'Remembrance Day', '🌺', '#a3262e', '#fbe9ea', fixed(10, 11))] },
  au: { n: 'Australia', f: '🇦🇺', ev: [H.christmas, H.xmaseve, H.boxing, H.newyear, E('ausday', 'Australia Day', '🦘', '#1f6fb5', '#e6f0ff', fixed(0, 26)), H.valentine, H.goodfriday, H.easter, H.anzac,
    H.mothersMay2, H.fathersSep1, H.halloween] },
  nz: { n: 'New Zealand', f: '🇳🇿', ev: [H.christmas, H.xmaseve, H.boxing, H.newyear, E('waitangi', 'Waitangi Day', '🌿', '#1f6fb5', '#e6f0ff', fixed(1, 6)), H.valentine, H.goodfriday, H.easter, H.anzac,
    H.mothersMay2, H.fathersSep1, E('labournz', 'Labour Day', '🛠️', '#c2412f', '#fdecea', y => nth(y, 9, 1, 4)), H.halloween, E('guyfawkes', 'Guy Fawkes Night', '🎇', '#7a3fc2', '#f1e9ff', fixed(10, 5))] },
  in: { n: 'India', f: '🇮🇳', ev: [E('republic', 'Republic Day', '🇮🇳', '#e0701f', '#fff1e3', fixed(0, 26)), E('indep', 'Independence Day', '🪁', '#138808', '#e9f6e6', fixed(7, 15)),
    E('gandhi', 'Gandhi Jayanti', '🕊️', '#2f4fa6', '#e8edff', fixed(9, 2)), E('childrens', 'Children’s Day', '🧒', '#d23f74', '#fdeaf2', fixed(10, 14)), H.christmas, H.newyear] },
  fr: { n: 'France', f: '🇫🇷', ev: [H.christmas, H.xmaseve, H.newyear, H.epiphany, H.valentine, H.easter, H.eastermon, H.labour1, E('ve', 'Victory in Europe Day', '🕊️', '#2f4fa6', '#e8edff', fixed(4, 8)),
    E('ascension', 'Ascension Day', '☁️', '#5b7fd6', '#eaf0ff', y => shift(easter(y), 39)),
    E('mothersfr', 'Mother’s Day', '💐', '#c2437d', '#fdeaf2', y => { const last = nth(y, 4, 0, -1); return +last === +shift(easter(y), 49) ? shift(last, 7) : last; }),
    E('bastille', 'Bastille Day', '🎆', '#2f4fa6', '#e8edff', fixed(6, 14)), E('toussaint', 'All Saints’ Day', '🕯️', '#7a5a3a', '#f6efe6', fixed(10, 1)), E('armistice', 'Armistice Day', '🌺', '#a3262e', '#fbe9ea', fixed(10, 11))] },
  de: { n: 'Germany', f: '🇩🇪', ev: [H.christmas, H.xmaseve, H.newyear, H.valentine, H.goodfriday, H.easter, H.eastermon, H.labour1, H.mothersMay2, E('ascde', 'Ascension Day', '☁️', '#5b7fd6', '#eaf0ff', y => shift(easter(y), 39)),
    E('unity', 'German Unity Day', '🤝', '#c79a00', '#fff6d6', fixed(9, 3)), H.halloween, E('martin', 'St Martin’s Day', '🏮', '#d96a0b', '#fff0e0', fixed(10, 11)), E('nikolaus', 'St Nicholas’ Day', '👢', '#b3261e', '#fdeaea', fixed(11, 6))] },
  es: { n: 'Spain', f: '🇪🇸', ev: [H.christmas, H.xmaseve, H.newyear, H.epiphany, H.valentine, H.goodfriday, H.easter, H.labour1, E('mothersES', 'Mother’s Day', '💐', '#c2437d', '#fdeaf2', y => nth(y, 4, 0, 1)),
    E('fathersES', 'Father’s Day', '👔', '#2f6fd6', '#e6efff', fixed(2, 19)), E('hispan', 'National Day', '🎉', '#c8102e', '#fdeaea', fixed(9, 12)), H.halloween] },
  it: { n: 'Italy', f: '🇮🇹', ev: [H.christmas, H.xmaseve, H.newyear, H.epiphany, H.valentine, E('fathersIT', 'Father’s Day', '👔', '#2f6fd6', '#e6efff', fixed(2, 19)), H.easter, H.eastermon,
    E('liberation', 'Liberation Day', '🕊️', '#1f8a43', '#e6f6ea', fixed(3, 25)), H.labour1, H.mothersMay2, E('republicit', 'Republic Day', '🇮🇹', '#1f8a43', '#e6f6ea', fixed(5, 2)),
    E('ferragosto', 'Ferragosto', '🏖️', '#d98a00', '#fff4db', fixed(7, 15)), H.halloween] }
};
const S = CT.load('countdown', { pick: 'christmas', custom: [], country: 'gb' });
if(!C[S.country]) S.country = 'gb';
const EVENTS_FOR = () => C[S.country].ev;
let editing = false;
// the next time this date comes round (today counts until midnight)
function nextDate(ev){
  if(ev.custom) return new Date(ev.when);
  const now = new Date(), y = now.getFullYear();
  let d = ev.d(y);
  if(shift(d, 1) <= now) d = ev.d(y + 1);
  return d;
}
const all = () => EVENTS_FOR().concat(S.custom.map((c, i) => ({ k: 'c' + i, n: c.n, e: c.e || '⭐', c: '#0F5257', bg: '#e6f2f1', custom: true, when: c.when, idx: i })));
function chips(){
  $('cdChips').innerHTML = all().map(ev => `<button type="button" data-k="${ev.k}"${ev.k === S.pick ? ' class="on"' : ''}>${ev.e} ${ev.n.replace(/</g, '&lt;')}</button>`).join('') +
    `<button type="button" data-k="add" class="add">＋ Your own date</button>`;
  document.querySelectorAll('#cdChips button').forEach(b => b.addEventListener('click', () => {
    if(b.dataset.k === 'add'){ $('cdForm').hidden = !$('cdForm').hidden; if(!$('cdForm').hidden) $('cdName').focus(); return; }
    S.pick = b.dataset.k; CT.save('countdown', S); chips(); tick(true);
  }));
}
let last = {};
function setBox(id, v){
  const el = $(id), s = String(v);
  if(last[id] !== s){ last[id] = s; el.textContent = s; el.classList.remove('flipin'); void el.offsetWidth; el.classList.add('flipin'); }
}
function tick(force){
  const ev = all().find(e => e.k === S.pick) || EVENTS_FOR()[0];
  if(force) last = {};
  const target = nextDate(ev), now = new Date();
  const st = $('stage'); st.style.setProperty('--ev', ev.c); st.style.background = ev.bg;
  $('cdEmoji').textContent = ev.e; $('cdTitle').textContent = ev.n;
  $('cdDate').textContent = target.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) + (ev.custom && (target.getHours() || target.getMinutes()) ? ' at ' + target.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : '');
  let ms = target - now;
  const isDay = !ev.custom && ms <= 0;
  $('cdBoxes').hidden = isDay; $('cdToday').hidden = !isDay;
  if(isDay){ $('cdToday').textContent = `It’s ${ev.n}! ${ev.e}`; $('cdSleeps').textContent = ''; }
  else {
    ms = Math.max(0, ms);
    const s = Math.floor(ms / 1000);
    setBox('cdD', Math.floor(s / 86400)); setBox('cdH', String(Math.floor(s % 86400 / 3600)).padStart(2, '0'));
    setBox('cdM', String(Math.floor(s % 3600 / 60)).padStart(2, '0')); setBox('cdS', String(s % 60).padStart(2, '0'));
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()), tday = new Date(target.getFullYear(), target.getMonth(), target.getDate());
    const sleeps = Math.round((tday - today) / 86400000);
    $('cdSleeps').textContent = ms === 0 ? 'Here at last! 🎉' : sleeps === 0 ? 'It’s today!' : sleeps === 1 ? 'Just 1 more sleep! 😴' : `${sleeps} sleeps to go 😴`;
  }
  $('cdDel').hidden = !ev.custom;
}
$('cdSave').addEventListener('click', () => {
  const n = $('cdName').value.trim(), d = $('cdDay').value, t = $('cdTime').value || '00:00';
  if(!n || !d) { $('cdErr').textContent = 'Please give it a name and a date.'; return; }
  const when = new Date(d + 'T' + t);
  if(isNaN(when)) { $('cdErr').textContent = 'That date doesn’t look right.'; return; }
  S.custom.push({ n: n.slice(0, 40), when: when.getTime(), e: $('cdIcon').value });
  if(S.custom.length > 8) S.custom.shift();
  S.pick = 'c' + (S.custom.length - 1); CT.save('countdown', S);
  $('cdForm').hidden = true; $('cdName').value = ''; $('cdErr').textContent = ''; chips(); tick(true); CT.track('countdown-custom');
});
$('cdDel').addEventListener('click', () => {
  const ev = all().find(e => e.k === S.pick); if(!ev || !ev.custom) return;
  S.custom.splice(ev.idx, 1); S.pick = EVENTS_FOR()[0].k; CT.save('countdown', S); chips(); tick(true);
});
$('cdDay').min = new Date().toISOString().slice(0, 10);
CT.fullscreen($('fsBtn'), $('stage'));
CT.keys({ f: () => $('fsBtn').click() });
function flags(){
  $('cdFlags').innerHTML = Object.entries(C).map(([k, c]) => `<button type="button" data-c="${k}"${k === S.country ? ' class="on"' : ''} title="${c.n}"><span class="flag">${c.f}</span> ${c.n}</button>`).join('');
  document.querySelectorAll('#cdFlags button').forEach(b => b.addEventListener('click', () => {
    S.country = b.dataset.c; if(!all().some(e => e.k === S.pick)) S.pick = EVENTS_FOR()[0].k;
    CT.save('countdown', S); flags(); chips(); tick(true); CT.track('countdown-' + S.country);
  }));
}
const h = location.hash.slice(1); if(C[h]) S.country = h; else if(EVENTS_FOR().some(e => e.k === h)) S.pick = h;
if(!all().some(e => e.k === S.pick)) S.pick = EVENTS_FOR()[0].k;
flags();
chips(); tick(true); setInterval(tick, 250);
})();
