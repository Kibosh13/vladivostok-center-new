import Image from "next/image";
import { ArrowIcon } from "@/components/premium-icons";
import { bookFragment, bookPage, founderEducation, founderFacts, founderReviews, founderSource, scientificArticle } from "@/lib/founder";

export function FounderContent() {
  return <section className="editorial-split founder-bio" id="about-founder">
    <div><span className="section-label">Основатель центра</span><h2>Алёна Савинова</h2></div>
    <div className="rich-copy"><ul>{founderFacts.map((fact) => <li key={fact}>{fact}</li>)}</ul><a className="source-link" href={founderSource} target="_blank" rel="noreferrer">Профиль в Практическом институте клинической психологии и психосоматики <ArrowIcon /></a></div>
  </section>;
}

export function EducationContent() {
  return <section className="education-list" id="education"><span className="section-label">Образование и квалификация</span>{founderEducation.map(([year, school, detail]) => <article key={school}><span>{year}</span><div><h2>{school}</h2><p>{detail}</p></div></article>)}<a className="source-link" href={founderSource} target="_blank" rel="noreferrer">Посмотреть документы и полную информацию об образовании <ArrowIcon /></a></section>;
}

export function ScienceContent() {
  return <section className="science-block" id="science"><span className="section-label">Научный подход</span><h2>Авторский метод и научная публикация</h2><p>Метод рассматривает взаимосвязь ресурсов личности и эмоциональной зрелости. С его теоретическими основами можно ознакомиться в научной статье Алёны Савиновой.</p><a className="scientific-article-link" href={scientificArticle} target="_blank" rel="noreferrer"><span>Международный научно-исследовательский журнал · № 5 (155), 2025</span><strong>Теоретические основы создания авторского метода формирования ресурсных систем личности</strong><span>Читать опубликованную статью · DOI: 10.60797/IRJ.2025.155.53 <ArrowIcon /></span></a><div className="science-reviews" id="reviews"><h3>Рецензии</h3><div className="science-grid">{founderReviews.map((review) => <a className="science-review-card" href={review.href} key={review.href} target="_blank" rel="noreferrer"><h3>{review.title}</h3><p className="science-review-role">{review.role}</p><p>{review.description}</p><span>Открыть полную рецензию <ArrowIcon /></span></a>)}</div></div></section>;
}

export function BookContent() {
  return <section className="book-block" id="book"><div><span className="section-label">Книга Алёны Савиновой</span><h2>«Жить ресурсно»</h2><p>Практические инструменты саморегуляции и самодиагностики: как замечать своё состояние, находить энергию и работать с внутренними ограничениями.</p><div className="book-actions"><a className="button" href={bookPage} target="_blank" rel="noreferrer">Подробнее о книге <ArrowIcon /></a><a className="text-link" href={bookFragment} target="_blank" rel="noreferrer">Читать бесплатный фрагмент <ArrowIcon /></a></div></div><a className="book-cover" href={bookPage} target="_blank" rel="noreferrer"><Image src="/images/book-live-resource-cover.png" alt="Книга Алёны Савиновой «Жить ресурсно»" width={1680} height={1187} sizes="(max-width: 700px) 80vw, 35vw" /></a></section>;
}
