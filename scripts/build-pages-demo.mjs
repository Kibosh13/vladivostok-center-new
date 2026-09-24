import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outArg = process.argv.indexOf("--out");
const output = resolve(root, outArg >= 0 ? process.argv[outArg + 1] : ".pages-demo");
const base = (process.env.GITHUB_PAGES_BASE || "/vladivostok-center-new/").replace(/\/?$/, "/");

const nav = [
  ["osnovatel", "О центре"], ["specialisty", "Специалисты"], ["uslugi", "Программы"],
  ["meropriyatiya", "Мероприятия"], ["otzyvy", "Отзывы"], ["contacts", "Контакты"],
];

const specialists = [
  ["Елизавета Хоментовская", "Предприниматель, бизнес-психолог", "Оборот 5 млн+ в месяц. Работает с состоянием собственников и переходом на новый уровень.", "og-source.jpg"],
  ["Марк", "Психолог", "Помогает предпринимателям работать с выгоранием, стрессом, решениями и потолком дохода.", "event-1.jpg"],
  ["Алёна Савинова", "Основатель, бизнес-психолог, предприниматель", "20+ лет работы с предпринимателями, 8000+ клиентов по всему миру.", "founder-speaking.jpeg"],
];

const programs = [
  ["Стратегическая сессия", "Онлайн или офлайн · 1,5 часа · 50 000 ₽", "Для собственников и руководителей, которым нужен ясный план перехода из точки А в точку Б.", "event-2.jpg"],
  ["Разбор бизнеса", "Совместный поиск точки роста", "Помогает увидеть, где теряются деньги, что тормозит масштаб и какие ходы действительно сработают.", "team-1.jpeg"],
  ["Бизнес-расстановки", "Участие · 3 500 ₽", "Системная работа с бизнесом и ресурсами для предпринимателей, которые ищут новую модель дохода.", "team-2.jpg"],
];

const events = [
  ["Бизнес-разбор", "8 сентября, 18:00 · 2 500 ₽", "Разбор реальных ситуаций собственников и руководителей, которым важно увидеть точку роста.", "alena-portrait-1.jpg"],
  ["Новая модель бизнеса", "9 сентября, 18:00 · 3 500 ₽", "Бизнес-расстановка для предпринимателей в стагнации.", "founder-speaking.jpeg"],
  ["Деньги. Смыслы. Отношения", "15 сентября, 10:00–17:00 · 25 000 ₽", "Камерный тренинг на яхте до 10 человек.", "event-2.jpg"],
];

const reviews = [
  ["Анна", "Клиент центра", "Здесь создаётся атмосфера доверия и поддержки. Специалисты помогают найти реальные пути решения сложностей."],
  ["Маргарита", "Участница расстановки", "После работы по-другому смотришь на свои решения и на себя. Появилось ощущение ясности внутри."],
  ["Участник курса", "Курс «Путь к себе»", "Сейчас я в наполненном состоянии и стремлюсь к большему не из недостатка, а из внутренней опоры."],
];

const link = (slug = "") => `${base}${slug ? `${slug}/` : ""}`;
const esc = (value) => String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");

function header() {
  return `<header class="site-header">
    <a class="brand" href="${base}" aria-label="Путь к себе — главная"><img class="brand-logo" src="${base}images/brand/logo-put-k-sebe.png" alt="Международный тренинговый центр «Путь к себе»" width="1280" height="688"></a>
    <nav class="main-nav" aria-label="Основная навигация">${nav.slice(0, 5).map(([slug, title]) => `<a href="${link(slug)}">${title}</a>`).join("")}</nav>
    <a class="button button-small" href="${link("contacts")}">Бесплатный подбор психолога →</a>
    <button class="demo-menu" type="button" aria-label="Открыть меню" aria-expanded="false">☰</button>
  </header>`;
}

function footer() {
  return `<footer class="site-footer"><div class="footer-main">
    <a class="brand" href="${base}"><img class="brand-logo brand-logo-footer" src="${base}images/brand/logo-put-k-sebe.png" alt="Международный тренинговый центр «Путь к себе»" width="1280" height="688"></a>
    <nav class="footer-nav">${nav.map(([slug, title]) => `<a href="${link(slug)}">${title}</a>`).join("")}</nav>
    <div class="footer-contact"><a href="tel:+79964249049">+7 996 424-90-49</a><a href="https://wa.me/79964249049">Написать в WhatsApp →</a></div>
  </div><div class="footer-bottom"><span>© 2026 Путь к себе. Все права защищены.</span><a href="${link("privacy")}">Политика конфиденциальности</a><a href="${link("offer")}">Договор оферты</a></div></footer>`;
}

function layout(title, body, description = "Психологический центр для предпринимателей и их семей во Владивостоке.") {
  return `<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="robots" content="noindex,nofollow,noarchive,nosnippet,noimageindex"><meta name="googlebot" content="noindex,nofollow,noarchive,nosnippet,noimageindex">
  <meta name="description" content="${esc(description)}"><title>${esc(title)} — Путь к себе</title>
  <link rel="icon" href="${base}favicon.svg"><link rel="stylesheet" href="${base}site.css"><script defer src="${base}demo.js"></script></head><body>${body}</body></html>`;
}

const icon = (name, className = "") => `<span class="generated-icon ${className}" aria-hidden="true"><img src="${base}images/icons/generated/${name}.png" alt="" width="512" height="512"></span>`;
const playIcon = `<svg class="premium-play" viewBox="0 0 24 24" aria-hidden="true"><path d="m9 7 8 5-8 5V7Z"/></svg>`;

function home() {
  const resultCards = [
    ["01", "Внутренняя опора", "Больше уверенности и спокойствия"],
    ["02", "Денежные решения", "Чёткость и новые возможности"],
    ["03", "Близость в семье", "Глубокие и тёплые отношения"],
    ["04", "Сильная команда", "Поддержка и понимание"],
    ["05", "Рост дохода", "Больше ресурсов для жизни"],
  ];
  const body = `<main class="home-reference">${header()}
    <section class="hero"><div class="hero-copy"><p class="eyebrow">Центр для предпринимателей<br>и их семей</p><h1>Найди <em>баланс</em><br>между бизнесом<br>и семьёй</h1><p class="hero-lead">Укрепи себя, сохрани семью<br>и расти в доходе.</p><div class="hero-actions"><a class="button" href="${link("contacts")}">Бесплатный подбор психолога →</a><a class="button button-light" href="${link("specialisty")}">Бесплатный подбор психолога</a></div><div class="hero-stats"><div><strong>20+</strong><span>лет практики</span></div><div><strong>8000+</strong><span>клиентов по всему миру</span></div><div><strong>Владивосток</strong><span>очно и онлайн</span></div></div></div>
    <div class="hero-photo"><img src="${base}images/hero-team-reference.png" alt="Команда психологического центра"><div class="hero-quote">Помогаем<br>идти по-настоящему —<br>с опорой для бизнеса и семьи</div><a class="hero-play" href="${link("osnovatel")}"><span>${playIcon}</span><b>Посмотрите<br>о нашем подходе</b></a></div></section>
    <section class="path-strip"><div class="section-label">Наш путь</div><div class="path-content"><h2>Самый короткий путь к результату</h2><p>Научный подход. Личный маршрут. Гарантия результата.</p><div class="path-grid"><div class="path-item">${icon("path-science")}<span>Научный подход</span></div><div class="path-item">${icon("path-specialist")}<span>Специалист под запрос</span></div><div class="path-item">${icon("path-method")}<span>Собственная методика</span></div><div class="path-item">${icon("path-support")}<span>Поддержка при сложных случаях</span></div></div></div></section>
    <section class="pain-section section-shell"><h2>Всё хорошо снаружи. Но сил уже нет.</h2><div class="pain-grid"><div>${icon("pain-tension")}<span>Тревога и напряжение</span></div><div>${icon("pain-clock")}<span>Бизнес не отпускает</span></div><div>${icon("pain-family")}<span>Отдаление в семье</span></div><div>${icon("pain-energy")}<span>Нет сил на близких</span></div><p class="hand-note">Ты можешь<br>по-другому ↙</p></div></section>
    <section class="results-section section-shell"><div class="section-label">Ваши возможные<br>результаты</div><div class="section-content"><h2>Что меняется</h2><div class="results-grid">${resultCards.map(([n,t,p]) => `<article class="result-card"><span>${n}</span><h3>${t}</h3><p>${p}</p></article>`).join("")}</div></div></section>
    <section class="programs-section section-shell"><div class="section-label">Выберите свой<br>запрос</div><div class="section-content"><div class="section-heading-row"><h2>Популярные направления работы</h2><a href="${link("uslugi")}">Все программы →</a></div><div class="program-grid">${programs.map(([t,,p,img]) => `<article class="program-card"><div class="program-image"><img src="${base}images/${img}" alt=""></div><div class="program-card-copy"><h3>${t}</h3><p>${p}</p><a href="${link("uslugi")}">Узнать больше →</a></div></article>`).join("")}</div></div></section>
    <section class="income-section section-shell-wide"><h2>Доход растёт из устойчивого состояния</h2><div class="income-flow"><div>${icon("income-support")}<span>Опора</span></div><b>→</b><div>${icon("income-decisions")}<span>Решения</span></div><b>→</b><div>${icon("income-team")}<span>Команда</span></div><b>→</b><div>${icon("income-growth")}<span>Доход</span></div><blockquote>«Устойчивость — не роскошь, а основа больших результатов»</blockquote></div></section>
    <section class="specialists-section section-shell"><div class="section-label">Наша команда</div><div class="section-content"><h2>Специалисты центра</h2><div class="specialist-grid">${specialists.map(([t,s,,img]) => `<article class="specialist-card"><div class="specialist-photo"><img src="${base}images/${img}" alt="${t}"></div><div><h3>${t}</h3><p>${s}</p><a href="${link("specialisty")}">Подробнее →</a></div></article>`).join("")}</div></div></section>
    <section class="reviews-section section-shell"><div class="section-label">Истории<br>клиентов</div><div class="reviews-layout"><div class="reviews-photo"><img src="${base}images/founder-speaking.jpeg" alt="Алёна Савинова"></div><blockquote class="featured-review">«Понимаю, что настоящая эффективность начинается с устойчивого состояния»<footer>Алёна Савинова<br><span>Основатель центра «Путь к себе»</span></footer></blockquote><div class="review-stack">${reviews.slice(0,2).map(([t,s,p]) => `<blockquote>“ ${p}<footer>${t}, ${s}</footer></blockquote>`).join("")}</div></div></section>
    <section class="consultation-section"><div><h2>Перестань выбирать между бизнесом и семьёй</h2><p>Укрепи себя, сохрани близость и создай условия для роста дохода.</p></div><a class="button button-light" href="${link("contacts")}">Бесплатный подбор психолога →</a></section>${footer()}</main>`;
  return layout("Психологический центр во Владивостоке", body);
}

function cards(items, kind) {
  return `<section class="interior-grid ${kind === "review" ? "review-cards" : ""}">${items.map(([title, subtitle, text, image]) => `<article class="interior-card">${image ? `<div class="interior-card-image"><img src="${base}images/${image}" alt="${esc(title)}"></div>` : ""}<div class="interior-card-copy">${kind === "review" ? `<span class="quote-mark">“</span>` : ""}<h2>${title}</h2><p class="card-subtitle">${subtitle}</p><p>${text}</p>${kind === "review" ? "" : `<a href="${link("contacts")}">Бесплатный подбор психолога →</a>`}</div></article>`).join("")}</section>`;
}

function interior({ slug, eyebrow, title, lead, image, content }) {
  const body = `<main>${header()}<section class="interior-hero"><div><span class="eyebrow">${eyebrow}</span><h1>${title}</h1><p>${lead}</p><a class="button" href="${link("contacts")}">Бесплатный подбор психолога →</a></div><div class="interior-hero-image"><img src="${base}images/${image}" alt=""></div></section><div class="interior-body">${content}<section class="interior-consultation"><div><span class="section-label">Статическая демоверсия</span><h2>Подберём формат под вашу задачу</h2><p>Отправка формы отключена на GitHub Pages. Для связи используйте телефон или WhatsApp.</p></div><a class="button" href="https://wa.me/79964249049">Бесплатный подбор психолога →</a></section></div>${footer()}</main>`;
  return [slug, layout(title, body, lead)];
}

const pages = [
  ["index", home()],
  interior({slug:"specialisty", eyebrow:"Владивосток · онлайн", title:"Специалисты центра", lead:"Команда, которая работает с предпринимателями, руководителями и семьями — внимательно, системно и по существу.", image:"alena-portrait-2.jpg", content:cards(specialists,"specialist")}),
  interior({slug:"uslugi", eyebrow:"Форматы работы", title:"Программы и услуги", lead:"Стратегические сессии, разбор бизнеса и системная работа — под задачу собственника и его текущую точку.", image:"event-2.jpg", content:cards(programs,"program")}),
  interior({slug:"meropriyatiya", eyebrow:"Афиша", title:"Ближайшие мероприятия", lead:"Камерные форматы во Владивостоке, где можно разобрать конкретную ситуацию и увидеть следующий шаг.", image:"team-1.jpeg", content:cards(events,"event")}),
  interior({slug:"otzyvy", eyebrow:"Истории клиентов", title:"Что меняется после работы", lead:"Ясность, спокойствие и решения, которые остаются с человеком после встречи, курса или расстановки.", image:"team-2.jpg", content:cards(reviews,"review")}),
  interior({slug:"osnovatel", eyebrow:"Основатель центра", title:"Алёна Савинова", lead:"Бизнес-психолог, предприниматель, системный расстановщик, автор научного метода и книги «Жить ресурсно».", image:"founder-speaking.jpeg", content:`<section class="editorial-split"><div><span class="section-label">О подходе</span><h2>Бизнес не существует отдельно от состояния владельца</h2></div><div class="rich-copy"><p>Алёна Савинова более 20 лет работает с предпринимателями. Она помогает находить скрытые причины стагнации, возвращать ясность и собирать устойчивую систему решений.</p><ul><li>8000+ клиентов по всему миру</li><li>Сертифицированный системный расстановщик</li><li>Автор книги «Жить ресурсно»</li></ul></div></section>`}),
  interior({slug:"contacts", eyebrow:"Владивосток", title:"Контакты", lead:"Свяжитесь с нами — поможем сформулировать запрос и подобрать специалиста или формат работы.", image:"event-2.jpg", content:`<section class="contact-page-grid"><div class="contact-details"><span class="section-label">Мы рядом</span><h2>Центр «Путь к себе»</h2><p>${icon("utility-phone")}<a href="tel:+79964249049">+7 996 424-90-49</a></p><p>${icon("utility-location")}<span>Владивосток, ул. Бестужева, 21Б, этаж 2</span></p><p>${icon("utility-send")}<a href="https://wa.me/79964249049">WhatsApp</a></p><p class="contact-muted">Работаем очно во Владивостоке и онлайн с клиентами по всему миру.</p></div><div class="demo-disabled"><h2>Бесплатный подбор психолога</h2><p>В статической демоверсии отправка форм отключена. Используйте телефон или WhatsApp.</p></div></section>`}),
  interior({slug:"privacy", eyebrow:"Документы", title:"Политика конфиденциальности", lead:"Как центр обрабатывает контактные данные.", image:"event-2.jpg", content:`<section class="legal-copy"><h2>Обработка персональных данных</h2><p>Данные из формы используются только для связи по вопросу консультации, мероприятия или программы.</p><p>Статическая демоверсия GitHub Pages не собирает и не отправляет данные через формы.</p></section>`}),
  interior({slug:"offer", eyebrow:"Документы", title:"Договор оферты", lead:"Общие условия записи, оплаты и участия в программах центра.", image:"event-2.jpg", content:`<section class="legal-copy"><h2>Общие условия</h2><p>Запись подтверждается после согласования формата, времени и стоимости с представителем центра.</p></section>`}),
];

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
await cp(join(root, "public", "images"), join(output, "images"), { recursive: true });
await cp(join(root, "public", "favicon.svg"), join(output, "favicon.svg"));

let css = await readFile(join(root, "app", "globals.css"), "utf8");
css = css.replace(/^@import[^;]+;\s*$/gm, "").replaceAll("url('/images/", `url('${base}images/`);
css += `\n.hero-photo>img,.program-image>img,.specialist-photo>img,.reviews-photo>img,.interior-hero-image>img,.interior-card-image>img{position:absolute;inset:0;width:100%;height:100%}.income-flow>b{font-weight:400;color:#9b7d84}.demo-menu{display:none;background:none;border:0;color:#7d0b24;font-size:25px}.demo-disabled{padding:35px;border:1px solid #ded5cf;border-radius:12px;background:#fffdfb}@media(max-width:980px){.demo-menu{display:block}.site-header>.button{display:none}.main-nav.open{display:flex;position:absolute;left:20px;right:20px;top:72px;padding:20px;flex-direction:column;background:#fff;box-shadow:0 15px 40px rgba(0,0,0,.12)}}`;
await writeFile(join(output, "site.css"), css);
await writeFile(join(output, "demo.js"), `const b=document.querySelector('.demo-menu');const n=document.querySelector('.main-nav');if(b&&n)b.addEventListener('click',()=>{const o=n.classList.toggle('open');b.setAttribute('aria-expanded',String(o));});const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;const reveal='.path-strip,.pain-section,.results-section,.programs-section,.income-section,.specialists-section,.reviews-section,.consultation-section,.interior-hero,.interior-grid,.editorial-split,.contact-page-grid,.legal-copy,.interior-consultation';const sequence='.path-grid,.pain-grid,.results-grid,.program-grid,.income-flow,.specialist-grid,.reviews-layout,.interior-grid,.contact-details';const rs=[...document.querySelectorAll(reveal)];const ss=[...document.querySelectorAll(sequence)];rs.forEach(e=>e.classList.add('motion-reveal'));ss.forEach(e=>e.classList.add('motion-sequence'));document.documentElement.classList.add('motion-ready');const show=e=>e.classList.add('is-visible');if(reduce||!('IntersectionObserver'in window)){rs.forEach(show);ss.forEach(show)}else{const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){show(e.target);io.unobserve(e.target)}}),{rootMargin:'0px 0px -9% 0px',threshold:.08});[...rs,...ss].forEach(e=>io.observe(e))}`);
await writeFile(join(output, "robots.txt"), "User-agent: *\nDisallow: /\n");
await writeFile(join(output, ".nojekyll"), "");

for (const [slug, html] of pages) {
  const dir = slug === "index" ? output : join(output, slug);
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, "index.html"), html);
}

await cp(join(output, "contacts"), join(output, "kontakty"), { recursive: true });
await cp(join(output, "osnovatel"), join(output, "o-centre"), { recursive: true });
await writeFile(join(output, "404.html"), layout("Страница не найдена", `<main>${header()}<section class="legal-copy"><h2>Страница не найдена</h2><p><a class="button" href="${base}">Вернуться на главную</a></p></section>${footer()}</main>`));

console.log(output);
