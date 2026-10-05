import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LeadForm } from "@/components/lead-form";
import { ArrowIcon } from "@/components/premium-icons";
import { SiteFooter, SiteHeader } from "@/components/site-shell";
import { getSpecialistProfile, specialistProfiles } from "@/lib/specialists";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return specialistProfiles.map(({ slug }) => ({ specialist: slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ specialist: string }> }) {
  const { specialist } = await params;
  const profile = getSpecialistProfile(specialist);
  return profile ? {
    title: `${profile.name} — специалист центра «Путь к себе»`,
    description: `${profile.role}. ${profile.format}. Основные запросы, подход, образование и документы специалиста.`,
  } : {};
}

export default async function SpecialistPage({ params }: { params: Promise<{ specialist: string }> }) {
  const { specialist } = await params;
  const profile = getSpecialistProfile(specialist);
  if (!profile) notFound();

  return <main>
    <SiteHeader />
    <section className="specialist-detail-hero">
      <div className="specialist-detail-photo"><Image src={profile.image} alt={profile.name} fill priority sizes="(max-width: 760px) 100vw, 43vw" /></div>
      <div className="specialist-detail-intro">
        <span className="eyebrow">Специалист центра</span>
        <h1>{profile.name}</h1>
        <p className="specialist-detail-role">{profile.role}</p>
        <div className="specialist-detail-tags"><span>{profile.format}</span><span>{profile.city}</span>{profile.experience && <span>{profile.experience}</span>}</div>
        <p>{profile.intro}</p>
        <a className="button" href="#consultation">Бесплатный подбор психолога <ArrowIcon /></a>
      </div>
    </section>

    <div className="specialist-detail-body">
      <section className="specialist-detail-columns">
        <div><span className="section-label">Основные запросы</span><h2>С чем можно обратиться</h2><ul>{profile.requests.map((item) => <li key={item}>{item}</li>)}</ul></div>
        <div><span className="section-label">Подход</span><h2>Как строится работа</h2><ul>{profile.approach.map((item) => <li key={item}>{item}</li>)}</ul></div>
      </section>

      <section className="specialist-education">
        <div><span className="section-label">Подготовка</span><h2>Образование и квалификация</h2></div>
        <ol>{profile.education.map((item, index) => <li key={item}><span>{String(index + 1).padStart(2, "0")}</span><p>{item}</p></li>)}</ol>
      </section>

      <section className="credentials-section">
        <div className="credentials-heading"><div><span className="section-label">Документы специалиста</span><h2>Дипломы и сертификаты</h2></div><p>Нажмите на документ, чтобы открыть его в полном размере.</p></div>
        {profile.credentials.length ? <div className="credentials-grid">{profile.credentials.map((src, index) => <a href={src} target="_blank" rel="noreferrer" key={src} aria-label={`Открыть документ ${index + 1}`}><Image src={src} alt={`Документ об образовании ${profile.name}, ${index + 1}`} fill sizes="(max-width: 640px) 100vw, 33vw" /></a>)}</div> : <p className="credentials-pending">Сведения об образовании размещены выше. Сканы дипломов и сертификатов будут добавлены после получения оригиналов от специалиста.</p>}
      </section>

      <section className="specialist-detail-consultation" id="consultation">
        <div><span className="section-label">Первый шаг</span><h2>Бесплатный подбор психолога</h2><p>Начните с бесплатной диагностической сессии — обсудим запрос и согласуем дальнейшую работу.</p>
          <div className="booking-session"><span>Индивидуальная консультация</span>{profile.session ? <><strong>{profile.session.price}</strong><p>{profile.session.duration} · {profile.format.toLowerCase()}</p><small>{profile.session.note}</small></> : <><strong>По вашему запросу</strong><p>Стоимость и длительность уточнит администратор.</p></>}</div>
          <Link href="/specialisty">Вернуться ко всем специалистам <ArrowIcon /></Link>
        </div>
        <LeadForm source={`specialist-${profile.slug}`} specialistName={profile.name} />
      </section>
    </div>
    <SiteFooter />
  </main>;
}
