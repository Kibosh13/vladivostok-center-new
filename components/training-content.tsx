import {defaultContent} from '@/lib/content';
export function TrainingContent() {
  const training=defaultContent.find(i=>i.id==='event-unfinished-relationships')!;
  return <><section className="training-formats" id="participation"><article><span className="section-label">Участник тренинга</span><h2>Весь день · с 11:00</h2><strong>50 000 ₽</strong><p>Тренинговая и расстановочная части уже включены.</p></article><article><span className="section-label">Заместитель</span><h2>Присоединиться с 16:00</h2><strong>5 000 ₽</strong><p>Открытый формат участия в расстановочной части.</p></article></section><section className="training-details"><h2>О тренинге</h2>{training.body.split('\n\n').map((p,i)=><p key={i}>{p}</p>)}<a className="button" href="tel:+79146658653">Обсудить участие · +7 914 665-86-53</a></section></>;
}
