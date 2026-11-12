/* Fundraising thermometer + cash counter */
(function(){
const CUR = {
  gbp: { s: '£', notes: [[50, '£50'], [20, '£20'], [10, '£10'], [5, '£5'], [2, '£2'], [1, '£1'], [.5, '50p'], [.2, '20p'], [.1, '10p'], [.05, '5p'], [.02, '2p'], [.01, '1p']] },
  usd: { s: '$', notes: [[100, '$100'], [50, '$50'], [20, '$20'], [10, '$10'], [5, '$5'], [1, '$1'], [.25, '25¢'], [.1, '10¢'], [.05, '5¢'], [.01, '1¢']] },
  eur: { s: '€', notes: [[200, '€200'], [100, '€100'], [50, '€50'], [20, '€20'], [10, '€10'], [5, '€5'], [2, '€2'], [1, '€1'], [.5, '50c'], [.2, '20c'], [.1, '10c'], [.05, '5c'], [.02, '2c'], [.01, '1c']] },
  none: { s: '', notes: [] }
};
const S = CT.load('fund', { title: 'School fundraiser', cur: 'gbp', target: 1000, raised: 0, hist: [], unit: 'points' });
let celebrated = S.raised >= S.target && S.target > 0;
const fmt = v => {
  const c = CUR[S.cur], whole = Math.abs(v - Math.round(v)) < 1e-9;
  const n = v.toLocaleString('en-GB', { minimumFractionDigits: whole ? 0 : 2, maximumFractionDigits: 2 });
  return c.s ? c.s + n : n + ' ' + (S.unit || '');
};
function render(){
  const f = S.target > 0 ? Math.min(1, S.raised / S.target) : 0;
  $('fTitle').textContent = S.title || 'Fundraiser';
  $('fRaised').textContent = fmt(S.raised);
  $('fTarget').textContent = 'raised of ' + fmt(S.target);
  $('fPct').textContent = Math.floor(f * 100) + '%';
  $('fToGo').textContent = S.raised >= S.target ? 'Target reached! 🎉' : fmt(Math.max(0, S.target - S.raised)) + ' to go';
  // thermometer: tube from y=30 to y=330
  const top = 30, bot = 330, h = (bot - top) * f;
  $('fMerc').setAttribute('y', bot - h); $('fMerc').setAttribute('height', h + 20);
  [.25, .5, .75, 1].forEach((q, i) => { $('fl' + i).textContent = fmt(S.target * q); $('fm' + i).classList.toggle('hit', f >= q); });
  $('fUndo').disabled = !S.hist.length;
  if(S.raised >= S.target && S.target > 0 && !celebrated){ celebrated = true; confetti(); CT.play('tada'); }
  if(S.raised < S.target) celebrated = false;
  CT.save('fund', S);
}
function confetti(){
  const st = $('stage'), cols = ['#ff4d42', '#ffc845', '#27d17f', '#7f77dd', '#36a9f5', '#ff6fa8'];
  for(let i = 0; i < 80; i++){
    const c = document.createElement('i'); c.className = 'confetti';
    c.style.left = Math.random() * 100 + '%'; c.style.background = cols[i % cols.length];
    c.style.animationDelay = Math.random() * .8 + 's'; c.style.animationDuration = 2 + Math.random() * 1.6 + 's';
    st.appendChild(c); setTimeout(() => c.remove(), 4500);
  }
}
function add(v){
  v = Math.round(v * 100) / 100; if(!v) return;
  S.hist.push(S.raised); if(S.hist.length > 50) S.hist.shift();
  S.raised = Math.max(0, Math.round((S.raised + v) * 100) / 100);
  CT.unlock(); if(v > 0) CT.play('pip'); render();
}
function quick(){
  const c = CUR[S.cur], steps = c.s ? [1, 5, 10, 20, 50, 100] : [1, 5, 10, 25, 50, 100];
  $('fQuick').innerHTML = steps.map(v => `<button type="button" class="small-btn" data-v="${v}">+ ${fmt(v)}</button>`).join('');
  document.querySelectorAll('#fQuick button').forEach(b => b.addEventListener('click', () => add(+b.dataset.v)));
  $('fCash').hidden = !c.notes.length;
  $('fCashRows').innerHTML = c.notes.map(([v, l], i) => `<label class="cash-row"><span>${l}</span><input type="number" min="0" step="1" inputmode="numeric" data-v="${v}" id="fc${i}" placeholder="0"><b id="fct${i}"></b></label>`).join('');
  document.querySelectorAll('#fCashRows input').forEach(i => i.addEventListener('input', cashTotal));
  cashTotal();
}
function cashTotal(){
  let t = 0;
  document.querySelectorAll('#fCashRows input').forEach((i, k) => {
    const n = Math.max(0, parseInt(i.value, 10) || 0), sub = Math.round(n * +i.dataset.v * 100) / 100; t += sub;
    $('fct' + k).textContent = n ? fmt(sub) : '';
  });
  t = Math.round(t * 100) / 100;
  $('fCashTotal').textContent = fmt(t); $('fCashAdd').disabled = !t;
  return t;
}
// ---------- set-up ----------
$('fName').value = S.title; $('fCur').value = S.cur; $('fGoal').value = S.target; $('fUnit').value = S.unit; $('fUnitWrap').hidden = S.cur !== 'none';
$('fName').addEventListener('input', () => { S.title = $('fName').value.slice(0, 60); render(); });
$('fGoal').addEventListener('input', () => { S.target = Math.max(0, parseFloat($('fGoal').value) || 0); render(); });
$('fCur').addEventListener('change', () => { S.cur = $('fCur').value; $('fUnitWrap').hidden = S.cur !== 'none'; quick(); render(); });
$('fUnit').addEventListener('input', () => { S.unit = $('fUnit').value.slice(0, 20); quick(); render(); });
$('fAddBtn').addEventListener('click', () => { const v = parseFloat($('fAddAmt').value); if(v){ add(v); $('fAddAmt').value = ''; } });
$('fAddAmt').addEventListener('keydown', e => { if(e.key === 'Enter') $('fAddBtn').click(); });
$('fSetBtn').addEventListener('click', () => { const v = parseFloat($('fSetAmt').value); if(!isNaN(v)){ S.hist.push(S.raised); S.raised = Math.max(0, v); $('fSetAmt').value = ''; render(); } });
$('fUndo').addEventListener('click', () => { if(S.hist.length){ S.raised = S.hist.pop(); render(); } });
let resetArmed = 0;
$('fReset').addEventListener('click', () => { const n = Date.now(); if(n - resetArmed > 3000){ resetArmed = n; $('fReset').textContent = 'Tap again to reset'; setTimeout(() => { $('fReset').textContent = 'Reset to 0'; }, 3000); return; } S.hist.push(S.raised); S.raised = 0; $('fReset').textContent = 'Reset to 0'; render(); });
$('fCashAdd').addEventListener('click', () => { const t = cashTotal(); if(t){ add(t); document.querySelectorAll('#fCashRows input').forEach(i => { i.value = ''; }); cashTotal(); CT.track('fund-cash'); } });
$('fCashClear').addEventListener('click', () => { document.querySelectorAll('#fCashRows input').forEach(i => { i.value = ''; }); cashTotal(); });
CT.fullscreen($('fsBtn'), $('stage'));
CT.keys({ f: () => $('fsBtn').click() });
quick(); render();
})();
