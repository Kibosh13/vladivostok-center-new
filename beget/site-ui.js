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
  const cookieChoiceKey = 'ps-cookie-choice-v2', cookieVersion = '2026-10-14.1';
  const openCookieChoice = () => {
    if (document.querySelector('.cookie-notice')) return;
      const notice = document.createElement('aside'); notice.className = 'cookie-notice';
      notice.setAttribute('aria-label', 'Использование cookies');
      const text = document.createElement('p'); text.append('Сайт собирает и обрабатывает cookies для корректной работы. Просим ваше согласие на их использование. Подробнее — в ');
      const link = document.createElement('a'); link.href = '/cookies/'; link.textContent = 'условиях использования cookies';
      const privacy = document.createElement('a'); privacy.href = '/privacy/'; privacy.textContent = 'политике обработки данных';
      text.append(link, ' и ', privacy, '.');
      const actions = document.createElement('div'); actions.className = 'cookie-notice-actions';
      for (const [choice, label] of [['accepted', 'Согласен'], ['necessary', 'Только необходимые']]) {
        const button = document.createElement('button'); button.type = 'button'; button.textContent = label;
        button.addEventListener('click', () => {
          try { localStorage.setItem(cookieChoiceKey, JSON.stringify({ choice, version: cookieVersion, at: Date.now() })); } catch (_) { /* Choice still applies to the current page. */ }
          // This version has no optional trackers. A choice never grants consent for a form or advertising.
          notice.remove();
        });
        actions.append(button);
      }
      notice.append(text, actions); document.body.append(notice);
  };
  const settings = document.createElement('button'); settings.className = 'cookie-settings'; settings.type = 'button'; settings.textContent = 'Настройки cookies';
  settings.addEventListener('click', openCookieChoice); document.querySelector('.footer-bottom')?.append(settings);
  let cookieChoice;
  try { cookieChoice = JSON.parse(localStorage.getItem(cookieChoiceKey) || 'null'); } catch (_) { /* Disabled or invalid storage requires a fresh choice. */ }
  if (!cookieChoice || cookieChoice.version !== cookieVersion || !['accepted', 'necessary'].includes(cookieChoice.choice)
    || !Number.isFinite(cookieChoice.at) || Date.now() - cookieChoice.at > 183 * 86400000 || cookieChoice.at > Date.now()) {
    openCookieChoice();
  }
})();
