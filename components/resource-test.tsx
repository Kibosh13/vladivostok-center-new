import Image from "next/image";
import Link from "next/link";
import { ArrowIcon } from "@/components/premium-icons";
import { resourceTestRequest, resourceTestUrl } from "@/lib/site-copy";

export function ResourceTestTeaser() {
  return <section className="resource-test-teaser section-shell" id="resource-test"><div className="section-label">Первый шаг<br />к балансу</div><div className="resource-teaser-copy"><span className="eyebrow">Авторский тест Алёны Савиновой</span><h2>Тест на ресурсность</h2><p>Поймите, где сейчас хватает внутренней опоры, а каким сферам нужно больше внимания. Посмотрите пример результата и получите личную расшифровку.</p><Link className="button" href="/test-na-resursnost">Пройти тест <ArrowIcon /></Link></div></section>;
}

export function ResourceTestContent() {
  return <>
    <section className="resource-test-intro editorial-split"><div><span className="section-label">Об авторском тесте</span><h2>Начните работать с ресурсом</h2></div><div className="rich-copy"><p>Когда энергия быстро восстанавливается, легче двигаться вперёд и сохранять баланс в разных сферах жизни.</p><p>По наблюдениям автора теста, при нестабильном уровне энергии одна сфера может процветать, пока другие остаются на минимуме. Это может проявляться как:</p><ul><li>Нехватка энергии</li><li>Трудности или нежелание заводить новые отношения</li><li>Проблемы на работе</li><li>Ощущение постоянного потока негатива</li></ul><p>Авторский тест помогает обсудить ваше состояние со специалистом и наметить работу с ресурсом.</p></div></section>
    <section className="resource-result"><div className="resource-result-heading"><span className="section-label">Пример результата</span><h2>Как выглядит баланс ресурсов</h2><p>Предоставленный автором пример с общим результатом 85%. Это пример, а не ваш персональный результат.</p></div><a href="/images/resource-test-example.webp" target="_blank" rel="noreferrer" aria-label="Открыть пример результата в полном размере"><Image src="/images/resource-test-example.webp" width={1280} height={729} alt="Пример теста: общий результат 85%; физический 88%, удовольствие 100%, психоэмоциональный 89%, интеллектуальный, духовный и родовой по 75%, кармический 83%, энергетический и больших и малых систем по 88%." sizes="(max-width: 700px) 90vw, 85vw" /></a><p className="resource-note">Результаты авторского теста не являются медицинским диагнозом и не заменяют консультацию специалиста.</p></section>
    <section className="resource-test-next" id="take-test"><span className="section-label">Личная обратная связь</span><h2>Получите расшифровку от автора</h2><p>Алёна Савинова поможет разобраться, как восстановить баланс энергии в разных сферах жизни.</p><a className="button" href={resourceTestUrl || resourceTestRequest} target="_blank" rel="noreferrer">Пройти тест <ArrowIcon /></a>{!resourceTestUrl && <p className="resource-note">Кнопка открывает WhatsApp с запросом теста. Сам тест вам отправит специалист.</p>}</section>
  </>;
}
