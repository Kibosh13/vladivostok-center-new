import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import ts from "typescript";
import { editorialHtml } from "./editorial-html.mjs";
import { bookingHtml } from "./booking-html.mjs";
import { albumHtml } from './event-media-html.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outArg = process.argv.indexOf("--out");
const output = resolve(root, outArg >= 0 ? process.argv[outArg + 1] : ".pages-demo");
if (![join(root,".pages-demo"),join(root,".beget-build")].includes(output)) throw new Error("Build output must be an isolated .pages-demo or .beget-build directory.");
const serverForms = process.env.SITE_TARGET === "beget";
const base = (serverForms ? "/" : process.env.GITHUB_PAGES_BASE || "/vladivostok-center-new/").replace(/\/?$/, "/");
const origin = "https://putksebevladivostok.ru";
const assetVersion = createHash("sha256")
  .update(await readFile(join(root, "app/globals.css")))
  .update(await readFile(join(root, "scripts/editorial-html.mjs")))
  .update(await readFile(join(root, "lib/founder.ts")))
  .update(await readFile(join(root, "lib/site-copy.ts")))
  .update(await readFile(join(root, "beget/site-ui.js")))
  .update(await readFile(join(root, "scripts/booking-html.mjs")))
  .update(await readFile(fileURLToPath(import.meta.url)))
  .digest("hex").slice(0, 12);

const nav = [
  ["osnovatel", "О центре"], ["specialisty", "Специалисты"], ["uslugi", "Программы"],
  ["meropriyatiya", "Мероприятия"], ["otzyvy", "Отзывы"], ["contacts", "Контакты и соцсети"],
];

const featuredProgramTitles = ["Состояние собственника", "Отношения и деньги", "Семья команда бизнес"];

// Use the same content and specialist profiles as the server app.
async function loadProjectData(path) {
  const source = await readFile(join(root, path), "utf8");
  const compiled = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 } });
  return import(`data:text/javascript;base64,${Buffer.from(compiled.outputText).toString("base64")}`);
}
const { defaultContent, legalDocumentDefinitions, seoDefinitions } = await loadProjectData("lib/content.ts");
const legalTemplates = JSON.parse(await readFile(join(root, "beget/legal-templates.json"), "utf8"));
const { specialistProfiles } = await loadProjectData("lib/specialists.ts");
const founderData = await loadProjectData("lib/founder.ts");
const siteCopy = await loadProjectData("lib/site-copy.ts");
const {eventAlbums} = await loadProjectData('lib/event-media.ts');
const contentTuples = (type, filter = () => true) => defaultContent
  .filter((item) => item.type === type && item.published && filter(item))
  .sort((a, b) => a.sortOrder - b.sortOrder)
  .map((item) => [item.title, item.subtitle, item.body, item.image.replace(/^\/images\//, ""), item.slug]);
const specialists = contentTuples("specialist");
const programs = contentTuples("program");
const events = contentTuples("event", (item) => JSON.parse(item.meta).archived !== "true");
const archivedEvents = contentTuples("event", (item) => JSON.parse(item.meta).archived === "true");

const reviews = [
  ["Анна", "Клиент центра", "Здесь создаётся атмосфера доверия и поддержки. Специалисты помогают найти реальные пути решения сложностей."],
  ["Маргарита", "Участница расстановки", "После работы по-другому смотришь на свои решения и на себя. Появилось ощущение ясности внутри."],
  ["Участник курса", "Курс «Путь к себе»", "Сейчас я в наполненном состоянии и стремлюсь к большему не из недостатка, а из внутренней опоры."],
];

const link = (slug = "") => `${base}${slug ? `${slug}/` : ""}`;
const esc = (value) => String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
const editorial = editorialHtml({ base, link, esc, founder: founderData, copy: siteCopy });
const training = defaultContent.find(i=>i.id==='event-unfinished-relationships');
const trainingContent = `<section class="training-formats" id="participation"><article><span class="section-label">Участник тренинга</span><h2>Весь день · с 11:00</h2><strong>50 000 ₽</strong><p>Тренинговая и расстановочная части уже включены.</p></article><article><span class="section-label">Заместитель</span><h2>Присоединиться с 16:00</h2><strong>5 000 ₽</strong><p>Открытый формат участия в расстановочной части.</p></article></section><section class="training-details"><h2>О тренинге</h2>${training.body.split('\n\n').map(p=>`<p>${esc(p)}</p>`).join('')}<a class="button" href="tel:+79146658653">Обсудить участие · +7 914 665-86-53</a></section>`;

function header() {
  return `<header class="site-header">
    <div class="header-brand-group"><a class="brand" href="${base}" aria-label="Путь к себе — главная"><img class="brand-logo" src="${base}images/brand/logo-put-k-sebe.png" alt="Международный тренинговый центр «Путь к себе»" width="1280" height="688"></a><span class="header-city">Владивосток</span></div>
    <nav class="main-nav" aria-label="Основная навигация">${nav.map(([slug, title]) => `<a href="${link(slug)}">${title}</a>`).join("")}</nav>
    <a class="button button-small" href="${link("specialisty")}">Индивидуальный подбор специалиста →</a>
    <button class="demo-menu" type="button" aria-label="Открыть меню" aria-expanded="false">☰</button>
  </header>`;
}

function footer() {
  return `<footer class="site-footer"><div class="footer-main">
    <a class="brand" href="${base}"><img class="brand-logo brand-logo-footer" src="${base}images/brand/logo-put-k-sebe.png" alt="Международный тренинговый центр «Путь к себе»" width="1280" height="688"></a>
    <nav class="footer-nav">${nav.map(([slug, title]) => `<a href="${link(slug)}">${title}</a>`).join("")}</nav>
    <div class="footer-contact"><a href="tel:+79146658653">+7 914 665-86-53</a><a href="${siteCopy.whatsappUrl}" target="_blank" rel="noreferrer">Написать в WhatsApp →</a><a href="tg://resolve?phone=79146658653">Написать в Telegram →</a><a href="https://max.ru/">MAX · +7 914 665-86-53</a><a href="https://vk.ru/putkseberu">ВКонтакте</a></div>
  </div><div class="footer-bottom"><span>© 2026 Путь к себе. Все права защищены.</span><a href="${link("privacy")}">Политика конфиденциальности</a><a href="${link("offer")}">Договор оферты</a></div></footer><nav class="floating-messengers" aria-label="Связаться в мессенджере"><a class="messenger-whatsapp" href="${siteCopy.whatsappUrl}" target="_blank" rel="noreferrer" aria-label="Написать в WhatsApp"><img src="${base}images/social/whatsapp.svg" alt=""></a><a class="messenger-telegram" href="tg://resolve?phone=79146658653" aria-label="Написать в Telegram"><img src="${base}images/social/telegram.svg" alt=""></a><a class="messenger-max" href="https://max.ru/" aria-label="Открыть MAX"><img src="${base}images/social/max.png" alt=""></a></nav>`;
}

const pageMetadata = {};
const organization = {"@context":"https://schema.org","@type":["Organization","LocalBusiness"],"@id":`${origin}/#organization`,name:"Путь к себе · Владивосток",url:`${origin}/`,telephone:"+79146658653",address:{"@type":"PostalAddress",streetAddress:"ул. Бестужева, 21Б, этаж 2",addressLocality:"Владивосток",addressCountry:"RU"},sameAs:["https://t.me/centre_pathtoyourself","https://vk.ru/putkseberu"]};
function layout(title, body, description = "Психологический центр для предпринимателей и их семей во Владивостоке.", slug = "", schema = null, indexable = true) {
  body = body.replace(/<a([^>]*)href="[^"]*"([^>]*)>Индивидуальный подбор специалиста →<\/a>/g, `<a$1href="${link("specialisty")}"$2>Индивидуальный подбор специалиста →</a>`)
    .replace(/<a\b[^>]*href="https:\/\/max\.ru\/"[^>]*>[\s\S]*?<\/a>/g, "")
    .replaceAll('images/centre-team-real.jpg', 'images/centre-team-20261013.webp')
    .replaceAll('alt="Команда психологического центра"', 'alt="Участники встречи центра «Путь к себе» во Владивостоке"')
    .replace(/<a class="button button-light" href="[^"]*">Тест на ресурсность →<\/a>/g, `<a class="button button-light" data-resource-test-link href="${esc(siteCopy.resourceTestUrl)}" target="_blank" rel="noreferrer">Тест на ресурсность →</a>`);
  const seo = seoDefinitions.find((item) => item.slug === slug);
  title = seo?.title || `${title} — Путь к себе`;
  description = seo?.description || description;
  pageMetadata[slug] = {title, description, indexable};
  return `<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
  ${!serverForms || !indexable ? '<meta name="robots" content="noindex,nofollow,noarchive"><meta name="googlebot" content="noindex,nofollow,noarchive">' : '<meta name="robots" content="index,follow">'}
  <meta name="description" content="${esc(description)}"><title>${esc(title)}</title><link rel="canonical" href="${origin}/${slug ? `${slug}/` : ""}">
  ${schema ? `<script type="application/ld+json">${JSON.stringify(schema).replaceAll("<", "\\u003c")}</script>` : ""}
  <link rel="icon" href="${base}favicon.svg"><link rel="stylesheet" href="${base}site.css?v=${assetVersion}"><script defer src="${base}demo.js?v=${assetVersion}"></script>${serverForms ? `<script defer src="${base}site-ui.js?v=${assetVersion}"></script>` : ""}</head><body data-site-target="${serverForms ? "beget" : "demo"}">${body}</body></html>`;
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
    <section class="hero"><div class="hero-copy"><p class="eyebrow">Центр психологической поддержки<br>для предпринимателей</p><h1>Найди <em>баланс</em><br>между бизнесом<br>и семьёй</h1><p class="hero-lead">Укрепи себя, сохрани семью<br>и расти в доходе.</p><div class="hero-actions"><a class="button" href="${link("contacts")}">Индивидуальный подбор специалиста →</a><a class="button button-light" href="${link("test-na-resursnost")}">Тест на ресурсность →</a></div><div class="hero-stats"><div><strong>20+</strong><span>лет практики</span></div><div><strong>8000+</strong><span>клиентов по всему миру</span></div><div><strong>Владивосток</strong><span>очно и онлайн</span></div></div></div>
    <div class="hero-photo"><img src="${base}images/centre-team-real.jpg" alt="Команда психологического центра"><div class="hero-quote">Помогаем<br>идти по-настоящему —<br>с опорой для бизнеса и семьи</div><a class="hero-play" href="${link("osnovatel")}"><span>${playIcon}</span><b>Посмотрите<br>о нашем подходе</b></a></div></section>
    <section class="path-strip"><div class="section-label">Наш путь</div><div class="path-content"><h2>Персональный путь к устойчивым изменениям</h2><p>Индивидуальная стратегия. Фокус на результате.</p><div class="path-grid"><div class="path-item">${icon("path-science")}<span>Научный подход</span></div><div class="path-item">${icon("path-specialist")}<span>Специалист под запрос</span></div><div class="path-item">${icon("path-method")}<span>Собственная методика</span></div><div class="path-item">${icon("path-support")}<span>Лицензия для клинических случаев</span></div></div><p class="path-insight">Состояние собственника влияет на семью, команду и деньги.</p></div></section>
    <section class="pain-section section-shell"><h2>Всё хорошо снаружи. Но сил уже нет.</h2><div class="pain-grid"><div>${icon("pain-tension")}<span>Тревога и напряжение</span></div><div>${icon("pain-clock")}<span>Бизнес не отпускает</span></div><div>${icon("pain-family")}<span>Отдаление в семье</span></div><div>${icon("pain-energy")}<span>Нет сил на близких</span></div><p class="hand-note">Ты можешь<br>по-другому ↙</p></div></section>
    <section class="results-section section-shell"><div class="section-label">Ваши возможные<br>результаты</div><div class="section-content"><h2>Что меняется</h2><div class="results-grid">${resultCards.map(([n,t,p]) => `<article class="result-card"><span>${n}</span><h3>${t}</h3><p>${p}</p></article>`).join("")}</div></div></section>
    <section class="programs-section section-shell"><div class="section-label">Выберите свой<br>запрос</div><div class="section-content"><div class="section-heading-row"><h2>Популярные направления работы</h2><a href="${link("uslugi")}">Все программы →</a></div><div class="program-grid">${programs.slice(0, 3).map(([t,,p,img,slug], index) => `<article class="program-card"><a class="program-image" href="${link("uslugi")}#${slug}" aria-label="Подробнее: ${esc(featuredProgramTitles[index] ?? t)}"><img src="${base}images/${img}" alt=""></a><div class="program-card-copy"><h3>${featuredProgramTitles[index] ?? t}</h3><p>${p}</p><a href="${link("uslugi")}#${slug}">Узнать больше →</a></div></article>`).join("")}</div></div></section>
    ${editorial.teaser}
    <section class="income-section section-shell-wide"><h2>Доход растёт из устойчивого состояния</h2><div class="income-flow"><div>${icon("income-support")}<span>Опора</span></div><b>→</b><div>${icon("income-decisions")}<span>Решения</span></div><b>→</b><div>${icon("income-team")}<span>Команда</span></div><b>→</b><div>${icon("income-growth")}<span>Доход</span></div><blockquote>«Устойчивость — не роскошь, а основа больших результатов»</blockquote></div></section>
    <section class="specialists-section section-shell"><div class="section-label">Наша команда</div><div class="section-content"><h2>Специалисты центра</h2><div class="specialist-grid">${specialists.map(([t,s,,img,slug]) => `<a class="specialist-card specialist-card-link" href="${link(`specialisty/${slug}`)}"><div class="specialist-photo"><img src="${base}images/${img}" alt="${t}"></div><div><h3>${t}</h3><p>${s}</p><p class="specialist-price">${siteCopy.consultationPrice}</p><span class="specialist-card-more">Подробнее →</span></div></a>`).join("")}</div></div></section>
    <section class="founder-spotlight section-shell"><div class="founder-spotlight-card"><div class="founder-spotlight-photo"><img src="${base}images/founder-speaking.jpeg" alt="Алёна Савинова"></div><div class="founder-spotlight-copy"><span class="eyebrow">Основатель центра · автор научного метода</span><h2>Алёна Савинова</h2><p>Бизнес-наставник с опытом 25 лет, системный семейный психолог и автор метода формирования ресурсных систем личности.</p><div class="founder-spotlight-facts"><a href="${link("osnovatel")}#education">Образование</a><a href="${link("osnovatel")}#science">Научный подход</a><a href="${link("osnovatel")}#reviews">Рецензии</a><a href="${link("osnovatel")}#book">Книга «Жить ресурсно»</a></div><a class="button" href="${link("osnovatel")}">Познакомиться подробнее →</a></div></div></section>
    <section class="reviews-section section-shell"><div class="section-label">Истории<br>клиентов</div><div class="reviews-layout"><div class="reviews-photo"><img src="${base}images/founder-speaking.jpeg" alt="Алёна Савинова"></div><blockquote class="featured-review">«Понимаю, что настоящая эффективность начинается с устойчивого состояния»<footer>Алёна Савинова<br><span>Основатель центра «Путь к себе»</span></footer></blockquote><div class="review-stack">${reviews.slice(0,2).map(([t,s,p]) => `<blockquote>“ ${p}<footer>${t}, ${s}</footer></blockquote>`).join("")}</div></div></section>
    <section class="consultation-section"><div><h2>Перестань выбирать между бизнесом и семьёй</h2><p>Укрепи себя, сохрани близость и создай условия для роста дохода.</p></div><a class="button button-light" href="${link("contacts")}">Индивидуальный подбор специалиста →</a></section>${footer()}</main>`;
  return layout("Психологический центр во Владивостоке", body, undefined, "", organization);
}

function cards(items, kind) {
  return `<section class="interior-grid ${kind === 'review' ? 'review-cards' : kind === 'event' ? 'event-cards' : kind === 'program' ? 'program-cards' : ''}">${items.map(([title,subtitle,text,image,slug])=>{
    const training=slug==='nezavershennye-otnosheniya';
    const card=`<article class="interior-card" id="${esc(slug)}">${image?`<div class="interior-card-image"><img src="${base}images/${image}" alt="${esc(title)}"></div>`:''}<div class="interior-card-copy">${kind==='review'?'<span class="quote-mark">“</span>':''}<h2>${esc(title)}</h2><p class="card-subtitle">${esc(subtitle)}</p><p>${esc(training?text.split('\n\n')[0]:text)}</p>${training?`<a class="album-card-link" href="${link(slug)}">Программа и участие →</a>`:''}${kind==='specialist'?`<p class="specialist-price">${siteCopy.consultationPrice}</p><span class="interior-card-link">Подробнее о специалисте →</span>`:kind==='review'||slug==='transformacionnye-igry'||training?'':`<a href="${link('specialisty')}">Индивидуальный подбор специалиста →</a>`}</div></article>`;
    return kind==='specialist'?`<a class="interior-card-wrapper" href="${link(`specialisty/${slug}`)}">${card}</a>`:`<div class="interior-card-wrapper">${card}</div>`;
  }).join('')}</section>`;
}

const twoGisReviewsUrl = "https://2gis.ru/vladivostok/search/%D0%9F%D1%83%D1%82%D1%8C%20%D0%BA%20%D1%81%D0%B5%D0%B1%D0%B5%20%D0%91%D0%B5%D1%81%D1%82%D1%83%D0%B6%D0%B5%D0%B2%D0%B0%2021%D0%91";
const reviewsExternal = `<section class="external-reviews"><div><span class="section-label">Независимые отзывы</span><h2>Отзывы о центре в 2ГИС</h2><p>Откройте карточку центра, чтобы прочитать отзывы клиентов и поделиться своим впечатлением.</p></div><a class="button button-light" href="${twoGisReviewsUrl}">Открыть отзывы в 2ГИС →</a></section>`;
const socialSection = `<section class="social-networks"><span class="section-label">Социальные сети</span><h2>Следите за центром</h2><div><a href="https://t.me/centre_pathtoyourself"><strong>Telegram</strong><span>Новости и анонсы центра</span>→</a><a href="https://max.ru/"><strong>MAX</strong><span>+7 914 665-86-53</span>→</a><a href="https://vk.ru/putkseberu"><strong>ВКонтакте</strong><span>Материалы, события и общение</span>→</a><a href="https://www.instagram.com/itc.put_k_sebe"><strong>Instagram</strong><span>Жизнь центра и короткие заметки</span>→</a></div></section>`;
const archiveEntry = `<section class="events-archive-entry"><div><span class="section-label">Прошедшие встречи</span><h2>Архив мероприятий</h2><p>Мастер-классы, встречи и практики центра, к которым можно вернуться.</p></div><a class="button button-light" href="${link("arhiv-meropriyatiy")}">Открыть архив →</a></section>`;
const archiveContent = `<section class="event-archive-grid">${archivedEvents.map(([title, subtitle, text, image, slug]) => `<article id="${esc(slug)}"><div class="event-archive-image"><a href="${link(`arhiv-meropriyatiy/${slug}`)}" aria-label="${esc(title)} — фото и видео"><img src="${base}images/${image}" alt="${esc(title)}"></a></div><div class="event-archive-copy"><span class="section-label">Прошедшее мероприятие</span><h2>${esc(title)}</h2><p class="card-subtitle">${esc(subtitle)}</p><p class="event-archive-description">${esc(text.length > 220 ? text.slice(0,220).replace(/\s+\S*$/,"") + "…" : text)}</p><a class="album-card-link" href="${link(`arhiv-meropriyatiy/${slug}`)}">Фото и видео встречи →</a></div></article>`).join("")}</section>`;

function interior({ slug, eyebrow, title, lead, image, content }) {
  if (slug === "contacts") {
    title = "Контакты и социальные сети";
    content = `<section class="contact-page-grid"><div class="contact-details"><span class="section-label">Мы рядом</span><h2>Центр «Путь к себе»</h2><p>${icon("utility-phone")}<a href="tel:+79146658653">+7 914 665-86-53</a></p><p>${icon("utility-location")}<span>Владивосток, ул. Бестужева, 21Б, этаж 2</span></p><p>${icon("utility-send")}<a href="${siteCopy.whatsappUrl}" target="_blank" rel="noreferrer">WhatsApp</a> · <a href="tg://resolve?phone=79146658653">Telegram</a></p><p class="contact-muted">Работаем очно во Владивостоке и онлайн с клиентами по всему миру.</p></div><div class="selection-coffee-card"><h2>${siteCopy.selectionLabel}</h2><p>${siteCopy.selectionDescription}</p><a class="button" href="${link("specialisty")}">Посмотреть специалистов →</a></div></section>${socialSection}`;
  }
  const hero = slug === "arhiv-meropriyatiy" ? `<section class="archive-page-heading"><span class="eyebrow">${eyebrow}</span><h1>${title}</h1><p>${lead}</p></section>` : `<section class="interior-hero"><div><span class="eyebrow">${eyebrow}</span><h1>${title}</h1><p>${lead}</p>${slug === "nezavershennye-otnosheniya" ? `<a class="button" href="#participation">Обсудить участие →</a>` : slug === "test-na-resursnost" ? '<!--TEST_ACTION-->' : `<a class="button" href="${link("specialisty")}">${siteCopy.selectionLabel} →</a>`}</div><div class="interior-hero-image"><img src="${base}images/${image}" alt=""></div></section>`;
  const body = `<main>${header()}${hero}<div class="interior-body">${content}</div>${footer()}</main>`;
  const schema = slug === "osnovatel" ? {"@context":"https://schema.org","@type":"Person",name:"Алёна Савинова",url:`${origin}/osnovatel/`,jobTitle:"Основатель центра «Путь к себе»",worksFor:{"@id":`${origin}/#organization`,"@type":"Organization",name:"Путь к себе"}} : slug === "uslugi" ? {"@context":"https://schema.org","@graph":programs.map(([name,,description,,id])=>({"@type":"Service",name,description,url:`${origin}/uslugi/#${id}`,provider:{"@id":`${origin}/#organization`,"@type":"Organization",name:"Путь к себе"}}))} : slug === "specialisty" ? {"@context":"https://schema.org","@graph":specialistProfiles.map(profile=>({"@type":"Person",name:profile.name,jobTitle:profile.role,url:`${origin}/specialisty/${profile.slug}/`,image:`${origin}${profile.image}`,worksFor:{"@id":`${origin}/#organization`,"@type":"Organization",name:"Путь к себе"}}))} : null;
  return [slug, layout(title, body, lead, slug, schema)];
}

function specialistPage(profile) {
  const list = (items) => `<ul>${items.map((item) => `<li>${esc(item)}</li>`).join("")}</ul>`;
  const education = profile.education.map((item, index) => `<li><span>${String(index + 1).padStart(2, "0")}</span><p>${esc(item)}</p></li>`).join("");
  const credentials = profile.credentials.length
    ? `<div class="credentials-grid">${profile.credentials.map((path, index) => { const src = `${base}${path.replace(/^\//, "")}`; return `<a href="${src}" target="_blank" rel="noreferrer" aria-label="Открыть документ ${index + 1}"><img src="${src}" alt="Документ об образовании ${esc(profile.name)}, ${index + 1}"></a>`; }).join("")}</div>`
    : `<p class="credentials-pending">Сведения об образовании размещены выше. Сканы дипломов и сертификатов будут добавлены после получения оригиналов от специалиста.</p>`;
  const body = `<main>${header()}<section class="specialist-detail-hero"><div class="specialist-detail-photo"><img src="${base}${profile.image.replace(/^\//, "")}" alt="${esc(profile.name)}"></div><div class="specialist-detail-intro"><span class="eyebrow">Специалист центра</span><h1>${esc(profile.name)}</h1><p class="specialist-detail-role">${esc(profile.role)}</p><div class="specialist-detail-tags"><span>${esc(profile.format)}</span><span>${esc(profile.city)}</span>${profile.experience ? `<span>${esc(profile.experience)}</span>` : ""}</div><p>${esc(profile.intro)}</p><a class="button" href="#consultation">Индивидуальный подбор специалиста →</a></div></section><div class="specialist-detail-body"><section class="specialist-detail-columns"><div><span class="section-label">Основные запросы</span><h2>С чем можно обратиться</h2>${list(profile.requests)}</div><div><span class="section-label">Подход</span><h2>Как строится работа</h2>${list(profile.approach)}</div></section><section class="specialist-education"><div><span class="section-label">Подготовка</span><h2>Образование и квалификация</h2></div><ol>${education}</ol></section><section class="credentials-section"><div class="credentials-heading"><div><span class="section-label">Документы специалиста</span><h2>Дипломы и сертификаты</h2></div><p>Нажмите на документ, чтобы открыть его в полном размере.</p></div>${credentials}</section><section class="specialist-detail-consultation" id="consultation"><div><span class="section-label">Первый шаг</span><h2>Индивидуальный подбор специалиста</h2><p>${siteCopy.selectionDescription}</p><div class="booking-session"><span>Индивидуальная консультация</span><strong>${siteCopy.consultationPrice}</strong><p>${esc(profile.format)}</p><small>Длительность и стоимость встречи согласовываются индивидуально.</small></div><a href="${link("specialisty")}">Вернуться ко всем специалистам →</a></div><div class="booking-preview"><div class="booking-form-heading"><span class="section-label">Запись к специалисту</span><h3>${esc(profile.name)}</h3><p>Вы можете записаться к выбранному специалисту напрямую или попросить помочь с подбором.</p></div><p>Вы выбрали специалиста: ${esc(profile.name)}. Напишите нам — согласуем удобное время встречи.</p><a class="button" href="${esc(siteCopy.whatsappRequest(`Здравствуйте! Хочу записаться к специалисту: ${profile.name}.`))}" target="_blank" rel="noreferrer">Индивидуальный подбор специалиста →</a><p class="form-note">Онлайн-отправка формы пока недоступна. Запись доступна через WhatsApp или по телефону <a href="tel:+79146658653">+7 914 665-86-53</a>.</p></div></section></div>${footer()}</main>`;
  const updatedBody = body.replace('<a class="button" href="#consultation">Индивидуальный подбор специалиста →</a>', '<a class="button" href="#booking">Записаться на консультацию →</a>')
    .replace(/<section class="credentials-section">[\s\S]*?<\/section>/, profile.credentials.length ? `<section class="credentials-section"><div class="credentials-heading"><div><span class="section-label">Документы специалиста</span><h2>Дипломы и сертификаты</h2></div><p>Нажмите на документ, чтобы открыть его в полном размере.</p></div>${credentials}</section>` : '')
    .replace(/<section class="specialist-detail-consultation"[\s\S]*?<\/section>/, bookingHtml({base,profile,esc,serverForms}));
  return [`specialisty/${profile.slug}`, layout(profile.name, updatedBody, `${profile.role}. ${profile.format}.`, `specialisty/${profile.slug}`, {"@context":"https://schema.org","@type":"Person",name:profile.name,jobTitle:profile.role,url:`${origin}/specialisty/${profile.slug}/`,image:`${origin}${profile.image}`,worksFor:{"@id":`${origin}/#organization`}})];
}

const pages = [
  ["index", home()],
  interior({slug:'nezavershennye-otnosheniya',eyebrow:'31 октября · начало в 11:00',title:'Незавершённые отношения',lead:'Открытый тренинг: завершение незавершённых отношений и процессов. Участие во всём тренинге или в качестве заместителя.',image:'strategy-20261021.webp',content:trainingContent}),
  interior({slug:"specialisty", eyebrow:"Владивосток · онлайн", title:"Специалисты центра", lead:"Команда, которая работает с предпринимателями, руководителями и лидерами — внимательно, системно и по существу.", image:"alena-portrait-2.jpg", content:cards(specialists,"specialist")}),
  interior({slug:"uslugi", eyebrow:"Форматы работы", title:"Программы и услуги", lead:"Стратегические сессии, разбор бизнеса и системная работа — под задачу собственника и его текущую точку.", image:"centre-materials.jpg", content:cards(programs,"program")}),
  interior({slug:"meropriyatiya", eyebrow:"Афиша", title:"Ближайшие мероприятия", lead:"Камерные форматы во Владивостоке, где можно разобрать конкретную ситуацию и увидеть следующий шаг.", image:"centre-interior.jpg", content:cards(events,"event") + archiveEntry}),
  interior({slug:"arhiv-meropriyatiy", eyebrow:"Фото · видео · истории", title:"Архив мероприятий", lead:"Прошедшие встречи центра — материалы, атмосфера и важные моменты, к которым можно вернуться.", image:"event-2.jpg", content:archiveContent}),
  interior({slug:"otzyvy", eyebrow:"Истории клиентов", title:"Что меняется после работы", lead:"Ясность, спокойствие и решения, которые остаются с человеком после встречи, курса или расстановки.", image:"reviews-20261021.webp", content:cards(reviews,"review") + reviewsExternal}),
  interior({slug:"socialnye-seti", eyebrow:"Будем на связи", title:"Социальные сети", lead:"Новости центра, анонсы мероприятий и материалы об устойчивом состоянии собственника.", image:"team-1.jpeg", content:socialSection}),
  interior({slug:"osnovatel", eyebrow:"Основатель центра", title:"Алёна Савинова", lead:"Бизнес-наставник с опытом 25 лет, системный семейный психолог, ТВ-эксперт федеральных каналов и автор научного метода.", image:"founder-speaking.jpeg", content:editorial.biography + editorial.education + editorial.science + editorial.book}),
  interior({slug:"obrazovanie", eyebrow:"Опыт и метод", title:"Образование и научная работа", lead:"Системная психология, семейная терапия и авторский метод формирования ресурсных систем личности.", image:"alena-portrait-1.jpg", content:editorial.education + editorial.science}),
  interior({slug:"test-na-resursnost", eyebrow:"Авторский тест Алёны Савиновой", title:"Тест на ресурсность", lead:"Поймите, на что вы опираетесь сейчас и каким сферам жизни нужно больше внимания.", image:"founder-speaking.jpeg", content:editorial.test}),
  interior({slug:"contacts", eyebrow:"Владивосток", title:"Контакты", lead:"Свяжитесь с нами — поможем сформулировать запрос и подобрать специалиста или формат работы.", image:"event-2.jpg", content:`<section class="contact-page-grid"><div class="contact-details"><span class="section-label">Мы рядом</span><h2>Центр «Путь к себе»</h2><p>${icon("utility-phone")}<a href="tel:+79146658653">+7 914 665-86-53</a></p><p>${icon("utility-location")}<span>Владивосток, ул. Бестужева, 21Б, этаж 2</span></p><p>${icon("utility-send")}<a href="${siteCopy.whatsappUrl}" target="_blank" rel="noreferrer">WhatsApp</a> · <a href="tg://resolve?phone=79146658653">Telegram</a> · <a href="https://max.ru/">MAX</a></p><p class="contact-muted">Работаем очно во Владивостоке и онлайн с клиентами по всему миру.</p></div><div class="demo-disabled"><h2>Индивидуальный подбор специалиста</h2><p>${siteCopy.selectionDescription}</p><p>Онлайн-отправка формы пока недоступна. Свяжитесь с нами напрямую.</p><a class="button" href="${siteCopy.whatsappUrl}" target="_blank" rel="noreferrer">${siteCopy.selectionLabel} →</a></div></section>${socialSection}`}),
  interior({slug:"dokumenty", eyebrow:"Документы центра", title:"Документы и условия", lead:"Условия работы центра, оформления услуг и обработки персональных данных.", image:"centre-interior.jpg", content:serverForms ? '<!--DOCUMENT_LIST-->' : `<section class="legal-documents-list">${legalDocumentDefinitions.map((doc)=>`<a href="${link(doc.slug)}"><span>${esc(doc.title)}</span><span>→</span></a>`).join("")}</section>`}),
  ...legalDocumentDefinitions.map(doc => interior({slug:doc.slug,eyebrow:"Документы центра",title:doc.title,lead:"Условия работы центра и обращения с данными.",image:"centre-interior.jpg",content:serverForms ? '<!--LEGAL_BODY-->' : `<div class="legal-document-text">${esc(legalTemplates.documents[doc.slug].body.replace(/\{\{([a-z_]+)\}\}/g,(_,key)=>legalTemplates.fields[key].default || "—"))}</div>`})),
  ...specialistProfiles.map(specialistPage),
  ...eventAlbums.map(album=>[`arhiv-meropriyatiy/${album.slug}`,layout(`${album.title}: фото и видео`,`<main>${header()}${albumHtml({album,base,link,esc})}${footer()}</main>`,album.description,`arhiv-meropriyatiy/${album.slug}`)]),
].filter(([slug]) => slug !== "socialnye-seti");

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
await cp(join(root, "public", "images"), join(output, "images"), { recursive: true });
await cp(join(root, 'public', 'videos'), join(output, 'videos'), {recursive:true});
await cp(join(root, "public", "favicon.svg"), join(output, "favicon.svg"));

let css = await readFile(join(root, "app", "globals.css"), "utf8");
css = css.replace(/^@import[^;]+;\s*$/gm, "").replaceAll("url('/images/", `url('${base}images/`);
css += `\n.hero-photo>img,.program-image>img,.specialist-photo>img,.reviews-photo>img,.interior-hero-image>img,.interior-card-image>img,.founder-spotlight-photo>img,.specialist-detail-photo>img,.credentials-grid img{position:absolute;inset:0;width:100%;height:100%}.income-flow>b{font-weight:400;color:#9b7d84}.demo-menu{display:none;background:none;border:0;color:#7d0b24;font-size:25px}.demo-disabled{padding:35px;border:1px solid #ded5cf;border-radius:12px;background:#fffdfb;color:#2e2220}@media(max-width:1380px){.demo-menu{display:block}.site-header>.button{display:none}.site-header .main-nav.open,.home-reference .site-header .main-nav.open{display:flex;position:absolute;left:20px;right:20px;top:72px;padding:20px;flex-direction:column;background:#fff;box-shadow:0 15px 40px rgba(0,0,0,.12)}}`;
await writeFile(join(output, "site.css"), css);
await writeFile(join(output, "demo.js"), `const b=document.querySelector('.demo-menu');const n=document.querySelector('.main-nav');if(b&&n)b.addEventListener('click',()=>{const o=n.classList.toggle('open');b.setAttribute('aria-expanded',String(o));});const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;const reveal='.resource-test-teaser,.resource-result,.resource-test-next,.education-list,.science-block,.book-block,.path-strip,.pain-section,.results-section,.programs-section,.income-section,.specialists-section,.founder-spotlight,.reviews-section,.consultation-section,.interior-hero,.interior-grid,.editorial-split,.contact-page-grid,.legal-copy,.interior-consultation,.specialist-detail-hero,.specialist-detail-columns,.specialist-education,.credentials-section,.specialist-detail-consultation';const sequence='.path-grid,.pain-grid,.results-grid,.program-grid,.income-flow,.specialist-grid,.reviews-layout,.interior-grid,.contact-details,.credentials-grid';const rs=[...document.querySelectorAll(reveal)];const ss=[...document.querySelectorAll(sequence)];rs.forEach(e=>e.classList.add('motion-reveal'));ss.forEach(e=>e.classList.add('motion-sequence'));document.documentElement.classList.add('motion-ready');const show=e=>e.classList.add('is-visible');if(reduce||!('IntersectionObserver'in window)){rs.forEach(show);ss.forEach(show)}else{const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){show(e.target);io.unobserve(e.target)}}),{rootMargin:'0px 0px -9% 0px',threshold:.08});[...rs,...ss].forEach(e=>io.observe(e))}`);
if (!serverForms) await writeFile(join(output, "robots.txt"), "User-agent: *\nDisallow: /\n");
await writeFile(join(output, ".nojekyll"), "");

const manifestPages = {};
const sharp = (await import("sharp")).default;
const dimensions = new Map();
const optimizedImages = new Map();
await mkdir(join(output,"images/optimized"),{recursive:true});
for (const [slug, originalHtml] of pages) {
  const dir = slug === "index" ? output : join(output, slug);
  await mkdir(dir, { recursive: true });
  let html = originalHtml;
  for (const match of originalHtml.matchAll(/<img\b[^>]*src="([^"]+)"[^>]*>/g)) {
    const src = match[1];
    if (!src.startsWith(`${base}images/`)) continue;
    const imagePath = join(root, "public", src.slice(base.length));
    if (!dimensions.has(src)) { try { dimensions.set(src,await sharp(imagePath).metadata()); } catch { dimensions.set(src,{}); } }
    const size = dimensions.get(src);
    let tag = match[0];
    if (!tag.includes(' width=') && size.width && size.height) tag = tag.replace(/>$/, ` width="${size.width}" height="${size.height}">`);
    const heroContext = originalHtml.slice(Math.max(0, match.index - 100), match.index);
    const priority = tag.includes('brand-logo') || tag.includes('centre-team-20261013') || heroContext.includes('interior-hero-image') || heroContext.includes('specialist-detail-photo');
    // Encoding/resizing only: keep original photos and credential originals unchanged.
    if (/\.(?:png|jpe?g|webp)$/.test(src) && !src.includes('/credentials/') && !src.includes('resource-test-example')) {
      if (!optimizedImages.has(src)) {
        const bytes=await readFile(imagePath),id=createHash('sha256').update(bytes).digest('hex').slice(0,16);
        const fixed=src.includes('/icons/') ? 256 : src.includes('/brand/') ? 640 : null;
        const max=Math.min(size.width||1280,fixed||1440);
        const widths=fixed ? [max] : [...new Set([...([480,768,1200].filter(w=>w<max)),max])];
        const variants=[];
        for (const width of widths) {
          const path=`images/optimized/${id}-${width}.webp`;
          await sharp(bytes).resize({width,withoutEnlargement:true}).webp({quality:90,lossless:src.includes('/icons/')}).toFile(join(output,path));
          variants.push({width,src:`${base}${path}`});
        }
        optimizedImages.set(src,{variants,fixed});
      }
      const image=optimizedImages.get(src),variants=image.variants;
      tag=tag.replace(`src="${src}"`,`src="${variants.at(-1).src}"`);
      if (!image.fixed) {
        const sizes=priority ? '(max-width: 700px) 100vw, 55vw' : '(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 25vw';
        tag=tag.replace(/>$/,` srcset="${variants.map(v=>`${v.src} ${v.width}w`).join(', ')}" sizes="${sizes}">`);
      }
    }
    if (!priority) tag = tag.replace(/>$/, ' loading="lazy" decoding="async">');
    else if (!tag.includes('brand-logo')) tag = tag.replace(/>$/, ' fetchpriority="high" decoding="async">');
    html = html.replace(match[0],tag);
  }
  html = html.replaceAll(' · </p>', '</p>');
  if (!serverForms) html = html.replaceAll('<!--TEST_ACTION-->', `<a class="button" href="${esc(siteCopy.resourceTestUrl)}" target="_blank" rel="noreferrer">Пройти тест →</a>`);
  await writeFile(join(dir, "index.html"), html);
  manifestPages[slug === "index" ? "" : slug] = {...pageMetadata[slug === "index" ? "" : slug],file:slug === "index" ? "index.html" : `${slug}/index.html`};
}

// Primary aliases are real server redirects; demo aliases remain non-indexable.
if (!serverForms) for (const [alias,target] of [["kontakty","contacts"],["o-centre","osnovatel"],["socialnye-seti","contacts"]]) {
  await mkdir(join(output,alias),{recursive:true});
  await writeFile(join(output,alias,"index.html"),`<!doctype html><html lang="ru"><head><meta name="robots" content="noindex,nofollow"><meta http-equiv="refresh" content="0;url=${link(target)}"><title>Переход</title></head><body><a href="${link(target)}">Перейти на страницу</a></body></html>`);
}
await writeFile(join(output, "404.html"), layout("Страница не найдена", `<main>${header()}<section class="legal-copy"><h1>Страница не найдена</h1><p><a class="button" href="${base}">Вернуться на главную</a></p></section>${footer()}</main>`, "Страница не найдена", "404", null, false));
if (serverForms) {
  await writeFile(join(output,".site-manifest.json"),JSON.stringify({pages:manifestPages,legal:legalTemplates,resourceTestUrl:siteCopy.resourceTestUrl,documents:Object.fromEntries(legalDocumentDefinitions.map(doc=>[doc.slug,doc])),specialists:specialistProfiles.map(({slug,name,format})=>({slug,name,format}))},null,2));
  for (const [src,dest] of [["runtime.php","site-runtime.php"],["admin.php","beget-admin.php"],["admin.css","beget-admin.css"],["site-ui.js","site-ui.js"],["htaccess",".htaccess"],["dev-router.php","dev-router.php"]]) await cp(join(root,"beget",src),join(output,dest));
  await cp(join(root,"public","googlef2660784658c6c2f.html"),join(output,"googlef2660784658c6c2f.html"));
  await cp(join(root,"public","llms.txt"),join(output,".llms-source.txt"));
}

console.log(output);
