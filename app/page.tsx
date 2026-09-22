import Image from "next/image";
import Link from "next/link";
import {
  AnchorLeafIcon, ArrowIcon, BatteryHeartIcon, ClockFlowIcon,
  ConnectionIcon, DocumentSparkIcon, GrowthIcon, GuideIcon,
  IdeaIcon, NeuralIcon, PlayIcon, ShieldBloomIcon,
} from "@/components/premium-icons";
import { SiteFooter, SiteHeader } from "@/components/site-shell";
import { getContent } from "@/lib/content.server";

export const dynamic = "force-dynamic";

const pathItems = [
  { icon: NeuralIcon, label: "Научный подход" },
  { icon: GuideIcon, label: "Специалист под запрос" },
  { icon: ShieldBloomIcon, label: "Собственная методика" },
  { icon: DocumentSparkIcon, label: "Поддержка при сложных случаях" },
];

const pains = [
  { icon: NeuralIcon, label: "Тревога и напряжение" },
  { icon: ClockFlowIcon, label: "Бизнес не отпускает" },
  { icon: ConnectionIcon, label: "Отдаление в семье" },
  { icon: BatteryHeartIcon, label: "Нет сил на близких" },
];

const results = [
  ["01", "Внутренняя опора", "Больше уверенности и спокойствия"],
  ["02", "Денежные решения", "Чёткость и новые возможности"],
  ["03", "Близость в семье", "Глубокие и тёплые отношения"],
  ["04", "Сильная команда", "Поддержка и понимание"],
  ["05", "Рост дохода", "Больше ресурсов для жизни"],
];

export default async function Home() {
  const [programs, specialists, reviews] = await Promise.all([
    getContent("program"), getContent("specialist"), getContent("review"),
  ]);

  return (
    <main className="home-reference">
      <SiteHeader />
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Центр для предпринимателей<br />и их семей</p>
          <h1>Найди <em>баланс</em><br />между бизнесом<br />и семьёй</h1>
          <p className="hero-lead">Укрепи себя, сохрани семью<br />и расти в доходе.</p>
          <div className="hero-actions">
            <a className="button" href="#consultation">Начать изменения <ArrowIcon /></a>
            <Link className="button button-light" href="/specialisty">Подобрать специалиста</Link>
          </div>
          <div className="hero-stats" aria-label="О центре">
            <div><strong>20+</strong><span>лет практики</span></div>
            <div><strong>8000+</strong><span>клиентов по всему миру</span></div>
            <div><strong>Владивосток</strong><span>очно и онлайн</span></div>
          </div>
        </div>
        <div className="hero-photo">
          <Image src="/images/hero-team-reference.png" alt="Команда психологического центра" fill priority sizes="(max-width: 800px) 100vw, 55vw" />
          <div className="hero-quote">Помогаем<br />идти по-настоящему —<br />с опорой для бизнеса и семьи</div>
          <Link className="hero-play" href="/o-centre"><span><PlayIcon /></span><b>Посмотрите<br />о нашем подходе</b></Link>
        </div>
      </section>

      <section className="path-strip">
        <div className="section-label">Наш путь</div>
        <div className="path-content">
          <h2>Самый короткий путь к результату</h2>
          <p>Научный подход. Личный маршрут. Гарантия результата.</p>
          <div className="path-grid">
            {pathItems.map(({ icon: Icon, label }) => <div className="path-item" key={label}><Icon /><span>{label}</span></div>)}
          </div>
        </div>
      </section>

      <section className="pain-section section-shell">
        <h2>Всё хорошо снаружи. Но сил уже нет.</h2>
        <div className="pain-grid">
          {pains.map(({ icon: Icon, label }) => <div key={label}><Icon /><span>{label}</span></div>)}
          <p className="hand-note">Ты можешь<br />по-другому ↙</p>
        </div>
      </section>

      <section className="results-section section-shell">
        <div className="section-label">Ваши возможные<br />результаты</div>
        <div className="section-content">
          <h2>Что меняется</h2>
          <div className="results-grid">
            {results.map(([num, title, text]) => (
              <article className="result-card" key={num}><span>{num}</span><h3>{title}</h3><p>{text}</p></article>
            ))}
          </div>
        </div>
      </section>

      <section className="programs-section section-shell">
        <div className="section-label">Выберите свой<br />запрос</div>
        <div className="section-content">
          <div className="section-heading-row"><h2>Популярные направления работы</h2><Link href="/uslugi">Все программы <ArrowIcon /></Link></div>
          <div className="program-grid">
            {programs.slice(0, 3).map((program) => (
              <article className="program-card" key={program.id}>
                <div className="program-image"><Image src={program.image} alt="" fill sizes="(max-width: 700px) 100vw, 33vw" /></div>
                <div className="program-card-copy"><h3>{program.title}</h3><p>{program.body}</p><Link href="/uslugi">Узнать больше <ArrowIcon /></Link></div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="income-section section-shell-wide">
        <h2>Доход растёт из устойчивого состояния</h2>
        <div className="income-flow">
          <div><AnchorLeafIcon /><span>Опора</span></div><ArrowIcon />
          <div><IdeaIcon /><span>Решения</span></div><ArrowIcon />
          <div><ConnectionIcon /><span>Команда</span></div><ArrowIcon />
          <div><GrowthIcon /><span>Доход</span></div>
          <blockquote>«Устойчивость — не роскошь, а основа больших результатов»</blockquote>
        </div>
      </section>

      <section className="specialists-section section-shell">
        <div className="section-label">Наша команда</div>
        <div className="section-content">
          <h2>Специалисты центра</h2>
          <div className="specialist-grid">
            {specialists.map((person) => (
              <article className="specialist-card" key={person.id}>
                <div className="specialist-photo"><Image src={person.image} alt={person.title} fill sizes="(max-width: 700px) 100vw, 33vw" /></div>
                <div><h3>{person.title}</h3><p>{person.subtitle}</p><Link href="/specialisty">Подробнее <ArrowIcon /></Link></div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="reviews-section section-shell">
        <div className="section-label">Истории<br />клиентов</div>
        <div className="reviews-layout">
          <div className="reviews-photo"><Image src="/images/founder-speaking.jpeg" alt="Алёна Савинова" fill sizes="340px" /></div>
          <blockquote className="featured-review">«Понимаю, что настоящая эффективность начинается с устойчивого состояния»<footer>Алёна Савинова<br /><span>Основатель центра «Путь к себе»</span></footer></blockquote>
          <div className="review-stack">
            {reviews.slice(0, 2).map((review) => <blockquote key={review.id}>“ {review.body}<footer>{review.title}, {review.subtitle}</footer></blockquote>)}
          </div>
        </div>
      </section>

      <section className="consultation-section" id="consultation">
        <div><h2>Перестань выбирать между бизнесом и семьёй</h2><p>Укрепи себя, сохрани близость и создай условия для роста дохода.</p></div>
        <Link className="button button-light" href="/kontakty">Подобрать специалиста <ArrowIcon /></Link>
      </section>
      <SiteFooter />
    </main>
  );
}
