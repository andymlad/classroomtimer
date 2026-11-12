/* Contact form – sent with Netlify Forms */
(function(){
const form = $('contactForm'), btn = $('cfBtn'), err = $('cfError');
form.addEventListener('submit', e => {
  e.preventDefault(); err.textContent = ''; btn.disabled = true; btn.textContent = 'Sending…';
  fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams(new FormData(form)).toString() })
    .then(r => { if(!r.ok) throw new Error(r.status); form.hidden = true; $('cfDone').hidden = false; CT.track('contact-form-sent'); })
    .catch(() => { err.textContent = 'Sorry, your message couldn’t be sent. Please check your connection and try again.'; })
    .finally(() => { btn.disabled = false; btn.textContent = 'Send message'; });
});
$('cfAgain').addEventListener('click', () => { form.reset(); form.hidden = false; $('cfDone').hidden = true; $('cfName').focus(); });
})();
