import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { GeneratedIcon } from "@/components/generated-icon";
import { ArrowIcon } from "@/components/premium-icons";
import { SiteFooter, SiteHeader } from "@/components/site-shell";
import { LeadForm } from "@/components/lead-form";
import { getContent } from "@/lib/content.server";
import { safeMeta, type ContentItem, type ContentType } from "@/lib/content";
import { FounderContent, EducationContent, ScienceContent, BookContent } from "@/components/founder-content";
import { ResourceTestContent } from "@/components/resource-test";
import { consultationPrice, selectionDescription, whatsappUrl } from "@/lib/site-copy";

export const dynamic = "force-dynamic";

type PageConfig = {
  eyebrow: string;
  title: string;
  lead: string;
  image: string;
  type?: ContentType;
};

const pages: Record<string, PageConfig> = {
  "test-na-resursnost": { eyebrow: "Авторский тест Алёны Савиновой", title: "Тест на ресурсность", lead: "Поймите, на что вы опираетесь сейчас и каким сферам жизни нужно больше внимания.", image: "/images/founder-speaking.jpeg" },
  specialisty: { eyebrow: "Владивосток · онлайн", title: "Специалисты центра", lead: "Команда, которая работает с предпринимателями, руководителями и семьями — внимательно, системно и по существу.", image: "/images/alena-portrait-2.jpg", type: "specialist" },
  uslugi: { eyebrow: "Форматы работы", title: "Программы и услуги", lead: "Стратегические сессии, разбор бизнеса и системная работа — под задачу собственника и его текущую точку.", image: "/images/centre-materials.jpg", type: "program" },
  meropriyatiya: { eyebrow: "Афиша", title: "Ближайшие мероприятия", lead: "Камерные форматы во Владивостоке, где можно разобрать конкретную ситуацию и увидеть следующий шаг.", image: "/images/centre-interior.jpg", type: "event" },
  "arhiv-meropriyatiy": { eyebrow: "Фото · видео · истории", title: "Архив мероприятий", lead: "Прошедшие встречи центра — материалы, атмосфера и важные моменты, к которым можно вернуться.", image: "/images/event-2.jpg" },
  otzyvy: { eyebrow: "Истории клиентов", title: "Что меняется после работы", lead: "Ясность, спокойствие и решения, которые остаются с человеком после встречи, курса или расстановки.", image: "/images/team-2.jpg", type: "review" },
  "socialnye-seti": { eyebrow: "Будем на связи", title: "Социальные сети", lead: "Новости центра, анонсы мероприятий и материалы об устойчивом состоянии собственника.", image: "/images/team-1.jpeg" },
  osnovatel: { eyebrow: "Основатель центра", title: "Алёна Савинова", lead: "Бизнес-наставник с опытом 25 лет, системный семейный психолог, ТВ-эксперт федеральных каналов и автор научного метода.", image: "/images/founder-speaking.jpeg" },
  obrazovanie: { eyebrow: "Опыт и метод", title: "Образование и научная работа", lead: "Системная психология, семейная терапия и авторский метод формирования ресурсных систем личности.", image: "/images/alena-portrait-1.jpg" },
  putksebe: { eyebrow: "7 недель, которые меняют жизнь", title: "Курс «Путь к себе»", lead: "Авторский курс в формате группового наставничества, который проводится уже 18 лет. До 10 человек в группе.", image: "/images/founder-speaking.jpeg" },
  "rassvet-biznesa": { eyebrow: "15 сентября · 10:00–17:00", title: "Деньги. Смыслы. Отношения", lead: "Один день на яхте вдали от суеты, чтобы увидеть конфликт между деньгами, отношениями и смыслами — и найти внутреннюю опору.", image: "/images/event-2.jpg" },
  contacts: { eyebrow: "Владивосток", title: "Контакты", lead: "Свяжитесь с нами — поможем сформулировать запрос и подобрать специалиста или формат работы.", image: "/images/event-2.jpg" },
  privacy: { eyebrow: "Документы", title: "Политика конфиденциальности", lead: "Как центр обрабатывает контактные данные, которые вы оставляете в форме на сайте.", image: "/images/event-2.jpg" },
  offer: { eyebrow: "Документы", title: "Договор оферты", lead: "Общие условия записи, оплаты и участия в программах центра.", image: "/images/event-2.jpg" },
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = pages[slug];
  return page ? { title: `${page.title} — Путь к себе`, description: page.lead } : {};
}

function Cards({ items, type }: { items: ContentItem[]; type: ContentType }) {
  return (
    <section className={`interior-grid ${type === "review" ? "review-cards" : ""} ${type === "event" ? "event-cards" : ""} ${type === "program" ? "program-cards" : ""}`}>
      {items.map((item) => {
        const card = <article className="interior-card" id={item.slug}>
          {item.image && <div className="interior-card-image"><Image src={item.image} alt={item.title} fill sizes="(max-width: 700px) 100vw, 33vw" /></div>}
          <div className="interior-card-copy">
            {type === "review" && <span className="quote-mark">“</span>}
            <h2>{item.title}</h2>
            <p className="card-subtitle">{item.subtitle}</p>
            <p>{item.body}</p>
            {type === "specialist" && <p className="specialist-price">{consultationPrice}</p>}
            {type === "specialist" && <span className="interior-card-link">Подробнее о специалисте <ArrowIcon /></span>}
            {type !== "review" && type !== "specialist" && item.slug !== "transformacionnye-igry" && <a href="#consultation">Индивидуальный подбор специалиста <ArrowIcon /></a>}
          </div>
        </article>;
        return type === "specialist" ? <Link className="interior-card-wrapper" href={`/specialisty/${item.slug}`} key={item.id}>{card}</Link> : <div className="interior-card-wrapper" key={item.id}>{card}</div>;
      })}
    </section>
  );
}

const twoGisReviewsUrl = "https://2gis.ru/vladivostok/search/%D0%9F%D1%83%D1%82%D1%8C%20%D0%BA%20%D1%81%D0%B5%D0%B1%D0%B5%20%D0%91%D0%B5%D1%81%D1%82%D1%83%D0%B6%D0%B5%D0%B2%D0%B0%2021%D0%91";

function ReviewsExternal() {
  return <section className="external-reviews"><div><span className="section-label">Независимые отзывы</span><h2>Отзывы о центре в 2ГИС</h2><p>Откройте карточку центра, чтобы прочитать отзывы клиентов и поделиться своим впечатлением.</p></div><a className="button button-light" href={twoGisReviewsUrl} target="_blank" rel="noreferrer">Открыть отзывы в 2ГИС <ArrowIcon /></a></section>;
}

function SocialNetworks() {
  const networks = [
    ["Telegram", "Новости и анонсы центра", "https://t.me/centre_pathtoyourself"],
    ["MAX", "+7 914 665-86-53", "https://max.ru/"],
    ["ВКонтакте", "Материалы, события и общение", "https://vk.ru/putkseberu"],
    ["Instagram", "Жизнь центра и короткие заметки", "https://www.instagram.com/itc.put_k_sebe"],
  ];
  return <section className="social-networks"><span className="section-label">Социальные сети</span><h2>Следите за центром</h2><div>{networks.map(([title, text, href]) => <a key={title} href={href} target="_blank" rel="noreferrer"><strong>{title}</strong><span>{text}</span><ArrowIcon /></a>)}</div></section>;
}

function EventsArchiveEntry() {
  return <section className="events-archive-entry"><div><span className="section-label">Прошедшие встречи</span><h2>Архив мероприятий</h2><p>Здесь будут собраны фото, видео и материалы прошедших встреч. Раздел уже готов к пополнению.</p></div><Link className="button button-light" href="/arhiv-meropriyatiy">Открыть архив <ArrowIcon /></Link></section>;
}

function EventArchive({ items }: { items: ContentItem[] }) {
  return <section className="event-archive-grid">{items.map((item) => <article key={item.id}><div className="event-archive-image"><Image src={item.image} alt={item.title} fill sizes="(max-width: 700px) 100vw, 46vw" /></div><div><span className="section-label">Прошедшее мероприятие</span><h2>{item.title}</h2><p className="card-subtitle">{item.subtitle}</p><p>{item.body}</p><span className="media-coming">Фото и видео будут добавлены</span></div></article>)}</section>;
}


function CourseContent() {
  const lessons = [
    ["12.09", "Стратегия перехода на новый уровень"], ["19.09", "Цели, фокус, результат"],
    ["26.09", "Формирование ресурсного состояния"], ["03.10", "Законы систем. Своё место"],
    ["10.10", "Баланс в отношениях"], ["17.10", "Проявленность. Новые смыслы"],
    ["24.10", "Предназначение и деньги"],
  ];
  return <>
    <section className="course-facts"><div><strong>7</strong><span>офлайн‑тренингов</span></div><div><strong>до 8 часов</strong><span>каждая встреча</span></div><div><strong>до 10</strong><span>человек в группе</span></div><div><strong>18 лет</strong><span>развития программы</span></div></section>
    <section className="course-about editorial-split"><div><span className="section-label">Для кого</span><h2>Когда внешне всё есть, но внутри нет опоры</h2></div><ul><li>Не чувствуете внутренней устойчивости</li><li>Не понимаете, ради чего работаете и живёте</li><li>Делаете всё для других и не чувствуете свою ценность</li><li>Много работаете, чтобы доказать свою значимость</li><li>Не видите, какую пользу можете принести</li></ul></section>
    <section className="program-timeline"><span className="section-label">Программа курса</span>{lessons.map(([date, title], index) => <article key={date}><span>{String(index + 1).padStart(2, "0")}</span><time>{date}</time><h2>{title}</h2></article>)}</section>
  </>;
}

function YachtContent() {
  const inclusions = ["Аренда яхты", "Комфортное размещение", "Питание и свежие морепродукты", "Мастер-класс", "Мини-расстановки", "Практические материалы", "Индивидуальные рекомендации"];
  return <>
    <section className="event-facts"><div><GeneratedIcon name="utility-calendar" /><strong>15 сентября</strong><span>10:00–17:00</span></div><div><strong>до 10</strong><span>участников</span></div><div><strong>25 000 ₽</strong><span>всё включено</span></div></section>
    <section className="editorial-split"><div><span className="section-label">О тренинге</span><h2>Остановиться и увидеть свою жизнь с другой точки</h2></div><div className="rich-copy"><p>Все сферы жизни связаны. Внутренний конфликт забирает энергию у отношений, финансов, решений и способности двигаться вперёд.</p><p>На воде легче выйти за привычные границы и заметить то, что теряется в ежедневной спешке. В программе — мастер-класс с Алёной Савиновой, мини-расстановки и индивидуальные рекомендации.</p></div></section>
    <section className="included-block"><span className="section-label">На борту</span><h2>Всё включено</h2><div>{inclusions.map((item) => <p key={item}><GeneratedIcon name="utility-success" className="generated-icon-inline" />{item}</p>)}</div></section>
  </>;
}

function ContactContent() {
  return <section className="contact-page-grid"><div className="contact-details"><span className="section-label">Мы рядом</span><h2>Центр «Путь к себе»</h2><p><GeneratedIcon name="utility-phone" /> <a href="tel:+79146658653">+7 914 665-86-53</a></p><p><GeneratedIcon name="utility-location" /> Владивосток, ул. Бестужева, 21Б, этаж 2</p><p><GeneratedIcon name="utility-send" /> <a href={whatsappUrl} target="_blank" rel="noreferrer">WhatsApp</a> · <a href="tg://resolve?phone=79146658653">Telegram</a> · <a href="https://max.ru/">MAX</a> · <a href="https://vk.ru/putkseberu">ВКонтакте</a> · <a href="https://www.instagram.com/itc.put_k_sebe">Instagram</a></p><p className="contact-muted">Работаем очно во Владивостоке и онлайн с клиентами по всему миру.</p></div><div id="consultation"><h2>Индивидуальный подбор специалиста</h2><p>{selectionDescription}</p><LeadForm source="contacts" /></div></section>;
}

function LegalContent({ offer }: { offer: boolean }) {
  return <section className="legal-copy"><h2>{offer ? "Общие условия" : "Обработка персональных данных"}</h2>{offer ? <><p>Запись на консультации, мероприятия и программы подтверждается после согласования формата, времени и стоимости с представителем центра.</p><p>Условия оплаты, переноса и возврата сообщаются до оплаты выбранной услуги. Для мероприятий с ограниченным числом мест бронирование считается завершённым после подтверждения.</p></> : <><p>Оператор: Индивидуальный предприниматель Савинова Алёна Викторовна, ОГРНИП 321774600294768, ИНН 254001615330.</p><p>Данные из формы используются только для связи по вопросу консультации, мероприятия или программы. Вы можете запросить уточнение или удаление данных по телефону центра.</p><p>Продолжая пользоваться сайтом, вы соглашаетесь с использованием технических cookies, необходимых для его работы.</p></>}</section>;
}

export default async function InteriorPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = pages[slug];
  if (!page) notFound();
  const items = page.type ? await getContent(page.type) : slug === "arhiv-meropriyatiy" ? await getContent("event") : [];
  const visibleItems = page.type === "specialist" ? items.filter((item) => item.id !== "specialist-alena") : items;
  const upcomingEvents = visibleItems.filter((item) => safeMeta(item).archived !== "true");
  const archivedEvents = items.filter((item) => safeMeta(item).archived === "true");
  return <main>
    <SiteHeader />
    <section className="interior-hero"><div><span className="eyebrow">{page.eyebrow}</span><h1>{page.title}</h1><p>{page.lead}</p><a className="button" href={slug === "test-na-resursnost" ? "#take-test" : "#consultation"}>{slug === "test-na-resursnost" ? "Пройти тест" : "Индивидуальный подбор специалиста"} <ArrowIcon /></a></div><div className="interior-hero-image"><Image src={page.image} alt="" fill priority sizes="(max-width: 800px) 100vw, 48vw" /></div></section>
    <div className="interior-body">
      {page.type && slug !== "meropriyatiya" && <Cards items={visibleItems} type={page.type} />}
      {slug === "meropriyatiya" && <><Cards items={upcomingEvents} type="event" /><EventsArchiveEntry /></>}
      {slug === "arhiv-meropriyatiy" && <EventArchive items={archivedEvents} />}
      {slug === "otzyvy" && <ReviewsExternal />}
      {slug === "socialnye-seti" && <SocialNetworks />}
      {slug === "osnovatel" && <><FounderContent /><EducationContent /><ScienceContent /><BookContent /></>}
      {slug === "obrazovanie" && <><EducationContent /><ScienceContent /></>}
      {slug === "test-na-resursnost" && <ResourceTestContent />}
      {slug === "putksebe" && <CourseContent />}
      {slug === "rassvet-biznesa" && <YachtContent />}
      {slug === "contacts" && <ContactContent />}
      {slug === "contacts" && <SocialNetworks />}
      {slug === "privacy" && <LegalContent offer={false} />}
      {slug === "offer" && <LegalContent offer />}
      {slug !== "test-na-resursnost" && slug !== "contacts" && slug !== "privacy" && slug !== "offer" && <section className="interior-consultation" id="consultation"><div><span className="section-label">Первый шаг</span><h2>Индивидуальный подбор специалиста</h2><p>{selectionDescription}</p></div><LeadForm source={`page-${slug}`} /></section>}
    </div>
    <SiteFooter />
  </main>;
}
