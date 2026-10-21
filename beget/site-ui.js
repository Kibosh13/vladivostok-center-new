(() => {
  if (document.body.dataset.siteTarget !== 'beget') return;
  // Never expose form contents to counters, including account-side automatic form analytics.
  document.querySelectorAll('form').forEach(form => {
    form.classList.add('ym-disable-submit', 'ym-hide-content');
    form.querySelectorAll('input, textarea').forEach(field => field.classList.add('ym-disable-keys'));
  });
  const forms = [...document.querySelectorAll('[data-booking-form]')];
  let status;
  const loadStatus = () => fetch('/api/form-status', { credentials: 'same-origin', cache: 'no-store' })
    .then(r => { if (!r.ok) throw new Error('status'); return r.json(); })
    .catch(() => { throw new Error('Не удалось подготовить отправку. Обновите страницу или позвоните в центр.'); });
  const applyStatus = s => {
    status = s;
    forms.forEach(form => {
      form.querySelector('fieldset').disabled = false;
      form.querySelector('[data-marketing-option]').hidden = !s.marketingReady;
    });
  };
  if (forms.length) loadStatus().then(applyStatus).catch(() => {});
  forms.forEach(form => {
    let sending = false;
    let requestKey = crypto.randomUUID();
    form.addEventListener('submit', async event => {
      event.preventDefault();
      if (sending || !form.reportValidity()) return;
      sending = true;
      const data = new FormData(form), fieldset = form.querySelector('fieldset');
      const result = form.querySelector('[data-booking-result]');
      fieldset.disabled = true; result.textContent = 'Отправляем заявку…';
      try {
        if (!status) applyStatus(await loadStatus());
        fieldset.disabled = true;
        const payload = { name: String(data.get('name') || '').trim(), phone: String(data.get('phone') || '').trim(),
          email: String(data.get('email') || '').trim(), message: String(data.get('message') || '').trim(),
          specialist: form.dataset.specialist, consent: data.get('consent') === 'on',
          marketingConsent: !!status.marketingReady && data.get('marketingConsent') === 'on',
          website: String(data.get('website') || ''), csrf: status.csrf, requestKey };
        const response = await fetch('/api/leads', { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        const json = await response.json();
        if (!response.ok) throw new Error(json.error || 'Не удалось отправить заявку. Позвоните в центр.');
        result.textContent = json.message || 'Заявка сохранена. Администратор свяжется с вами.';
        form.reset(); requestKey = crypto.randomUUID();
      } catch (e) { result.textContent = e instanceof TypeError ? 'Не удалось отправить заявку. Проверьте соединение или позвоните в центр.' : e.message; }
      finally { sending = false; fieldset.disabled = false; }
    });
  });
  const cookieChoiceKey = 'ps-cookie-choice-v2', cookieVersion = '2026-10-21.1';
  const counterId = 109918800;
  let analyticsStarted = false;
  const enableAnalytics = () => {
    if (analyticsStarted || location.hostname !== 'putksebevladivostok.ru') return;
    analyticsStarted = true;
    window.ym = window.ym || function () { (window.ym.a = window.ym.a || []).push(arguments); };
    window.ym.l = Date.now();
    const tag = document.createElement('script'); tag.async = true;
    tag.src = 'https://mc.yandex.ru/metrika/tag.js?id=' + counterId;
    document.head.append(tag);
    let referrer = ''; try { referrer = document.referrer ? new URL(document.referrer).origin : ''; } catch (_) { /* Ignore an invalid referrer. */ }
    window.ym(counterId, 'init', {ssr:true, webvisor:false, clickmap:true, ecommerce:false,
      url:location.origin + location.pathname, referrer, accurateTrackBounce:true, trackLinks:true});
  };
  const disableAnalytics = () => {
    if (!analyticsStarted) return;
    window.ym?.(counterId, 'destruct'); analyticsStarted = false;
    document.querySelectorAll('script[src^="https://mc.yandex.ru/metrika/"]').forEach(tag => tag.remove());
    for (const item of document.cookie.split(';')) {
      const name = item.split('=')[0].trim(); if (!name.startsWith('_ym_')) continue;
      for (const domain of ['', '; domain=putksebevladivostok.ru', '; domain=.putksebevladivostok.ru']) {
        document.cookie = name + '=; Max-Age=0; path=/; SameSite=Lax; Secure' + domain;
      }
    }
  };
  const openCookieChoice = () => {
    if (document.querySelector('.cookie-notice')) return;
      const notice = document.createElement('aside'); notice.className = 'cookie-notice';
      notice.setAttribute('aria-label', 'Использование cookies');
      const text = document.createElement('p'); text.append('Сайт собирает и обрабатывает cookies для своей работы и анализа посещаемости с помощью Яндекс Метрики. Просим согласие на их использование. Подробнее — в ');
      const link = document.createElement('a'); link.href = '/cookies/'; link.textContent = 'условиях использования cookies';
      const privacy = document.createElement('a'); privacy.href = '/privacy/'; privacy.textContent = 'политике обработки данных';
      text.append(link, ' и ', privacy, '.');
      const actions = document.createElement('div'); actions.className = 'cookie-notice-actions';
      for (const [choice, label] of [['accepted', 'Согласен'], ['necessary', 'Только необходимые']]) {
        const button = document.createElement('button'); button.type = 'button'; button.textContent = label;
        button.addEventListener('click', () => {
          try { localStorage.setItem(cookieChoiceKey, JSON.stringify({ choice, version: cookieVersion, at: Date.now() })); } catch (_) { /* Choice still applies to the current page. */ }
          if (choice === 'accepted') enableAnalytics(); else disableAnalytics();
          // Analytics consent never grants consent for a form or advertising.
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
  } else if (cookieChoice.choice === 'accepted') enableAnalytics();
})();
