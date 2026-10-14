(() => {
  if (document.body.dataset.siteTarget !== 'beget') return;
  const forms = [...document.querySelectorAll('[data-booking-form]')];
  let status;
  const loadStatus = () => fetch('/api/form-status', { credentials: 'same-origin', cache: 'no-store' })
    .then(r => { if (!r.ok) throw new Error('status'); return r.json(); });
  if (forms.length) loadStatus().then(s => {
    status = s;
    forms.forEach(form => {
      if (!s.ready) return;
      form.querySelector('fieldset').disabled = false;
      form.querySelector('[data-booking-note]').textContent = 'Администратор свяжется с вами после отправки заявки.';
      form.querySelectorAll('[data-legal-link]').forEach(a => { a.href = '/' + a.dataset.legalLink + '/'; });
      form.querySelector('[data-marketing-option]').hidden = !s.marketingReady;
    });
  }).catch(() => {});
  forms.forEach(form => {
    let sending = false;
    let requestKey = crypto.randomUUID();
    form.addEventListener('submit', async event => {
      event.preventDefault();
      if (sending || !status?.ready || !form.reportValidity()) return;
      sending = true;
      const data = new FormData(form), fieldset = form.querySelector('fieldset');
      const result = form.querySelector('[data-booking-result]');
      fieldset.disabled = true; result.textContent = 'Отправляем заявку…';
      try {
        const payload = { name: String(data.get('name') || '').trim(), phone: String(data.get('phone') || '').trim(),
          email: String(data.get('email') || '').trim(), message: String(data.get('message') || '').trim(),
          specialist: form.dataset.specialist, consent: data.get('consent') === 'on',
          marketingConsent: status.marketingReady && data.get('marketingConsent') === 'on',
          website: String(data.get('website') || ''), csrf: status.csrf, requestKey };
        const response = await fetch('/api/leads', { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        const json = await response.json();
        if (!response.ok) throw new Error(json.error || 'Не удалось отправить заявку. Позвоните в центр.');
        result.textContent = json.message || 'Заявка сохранена. Администратор свяжется с вами.';
        form.reset(); requestKey = crypto.randomUUID();
      } catch (e) { result.textContent = e.message; }
      finally { sending = false; fieldset.disabled = false; }
    });
  });
  try {
    if (!localStorage.getItem('ps-cookie-notice')) {
      const notice = document.createElement('aside'); notice.className = 'cookie-notice';
      notice.setAttribute('aria-label', 'Технические cookies');
      const text = document.createElement('p'); text.textContent = 'Для безопасной работы формы и админ-панели используются технические cookies. Аналитические и рекламные счётчики не подключены.';
      const link = document.createElement('a'); link.href = '/dokumenty/'; link.textContent = 'Документы';
      const button = document.createElement('button'); button.type = 'button'; button.textContent = 'Понятно';
      button.addEventListener('click', () => { localStorage.setItem('ps-cookie-notice', '1'); notice.remove(); });
      notice.append(text, link, button); document.body.append(notice);
    }
  } catch (_) { /* Storage may be disabled by the visitor; never block the page. */ }
})();
