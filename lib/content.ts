export type ContentType = "specialist" | "program" | "event" | "review";

export type ContentItem = {
  id: string;
  type: ContentType;
  slug: string;
  title: string;
  subtitle: string;
  body: string;
  image: string;
  meta: string;
  sortOrder: number;
  published: boolean;
  updatedAt?: string;
};

export const defaultContent: ContentItem[] = [
  {
    id: "specialist-elizaveta", type: "specialist", slug: "elizaveta-homentovskaya",
    title: "Елизавета Хоментовская", subtitle: "Предприниматель, бизнес-психолог",
    body: "Оборот 5 млн+ в месяц. Продала бизнес в плюсе. Работает с состоянием собственников и переходом на новый уровень. Клиенты увеличивают оборот, делегируют ключевые задачи и перестают управлять из тревоги.",
    image: "/images/og-source.jpg", meta: JSON.stringify({ focus: "Состояние собственника" }), sortOrder: 10, published: true,
  },
  {
    id: "specialist-mark", type: "specialist", slug: "mark", title: "Марк", subtitle: "Психолог",
    body: "Бизнес не существует отдельно от состояния владельца. Помогает предпринимателям работать с выгоранием, стрессом, решениями и потолком дохода.",
    image: "/images/event-1.jpg", meta: JSON.stringify({ focus: "Выгорание и стресс" }), sortOrder: 20, published: true,
  },
  {
    id: "specialist-alena", type: "specialist", slug: "alena-savinova", title: "Алёна Савинова", subtitle: "Основатель, бизнес-психолог, предприниматель",
    body: "20+ лет работы с предпринимателями, 8000+ клиентов по всему миру. Сертифицированный системный расстановщик, автор научного метода и книги «Жить ресурсно».",
    image: "/images/founder-speaking.jpeg", meta: JSON.stringify({ focus: "Масштабирование и системная работа" }), sortOrder: 30, published: true,
  },
  {
    id: "program-strategy", type: "program", slug: "strategicheskaya-sessiya", title: "Стратегическая сессия", subtitle: "Онлайн или офлайн · 1,5 часа · 50 000 ₽",
    body: "Для собственников и руководителей, которым нужен ясный план перехода из точки А в точку Б. Пакет: 5 сессий и расстановка — 500 000 ₽.",
    image: "/images/event-2.jpg", meta: JSON.stringify({ category: "Состояние собственника" }), sortOrder: 10, published: true,
  },
  {
    id: "program-business-review", type: "program", slug: "razbor-biznesa", title: "Разбор бизнеса", subtitle: "Совместный поиск точки роста",
    body: "Для собственников, которые не видят, где теряются деньги и что тормозит масштаб. За несколько часов вы замечаете слепые зоны и находите рабочие ходы.",
    image: "/images/team-1.jpeg", meta: JSON.stringify({ category: "Решения и рост" }), sortOrder: 20, published: true,
  },
  {
    id: "program-arrangement", type: "program", slug: "biznes-rasstanovki", title: "Бизнес-расстановки", subtitle: "Участие · 3 500 ₽",
    body: "Системная работа с бизнесом и ресурсами для предпринимателей в стагнации, которые ищут новую модель дохода и решений.",
    image: "/images/team-2.jpg", meta: JSON.stringify({ category: "Семья, команда, бизнес" }), sortOrder: 30, published: true,
  },
  {
    id: "event-review", type: "event", slug: "biznes-razbor", title: "Бизнес-разбор", subtitle: "8 сентября, 18:00 · 2 500 ₽",
    body: "Алёна Савинова и Александр Скляр разбирают реальные ситуации собственников и руководителей, которым важно увидеть точку роста в бизнесе.",
    image: "/images/alena-portrait-1.jpg", meta: JSON.stringify({ date: "8 сентября", price: "2 500 ₽" }), sortOrder: 10, published: true,
  },
  {
    id: "event-model", type: "event", slug: "novaya-model-biznesa", title: "Новая модель бизнеса", subtitle: "9 сентября, 18:00 · 3 500 ₽",
    body: "Бизнес-расстановка для предпринимателей, которые чувствуют стагнацию и ищут новую точку роста и увеличения дохода.",
    image: "/images/founder-speaking.jpeg", meta: JSON.stringify({ date: "9 сентября", price: "3 500 ₽" }), sortOrder: 20, published: true,
  },
  {
    id: "event-yacht", type: "event", slug: "rassvet-biznesa", title: "Деньги. Смыслы. Отношения", subtitle: "15 сентября, 10:00–17:00 · 25 000 ₽",
    body: "Камерный тренинг на яхте до 10 человек: мастер-класс, мини-расстановки и работа с конфликтом между деньгами, отношениями и личными смыслами.",
    image: "/images/event-2.jpg", meta: JSON.stringify({ date: "15 сентября", price: "25 000 ₽" }), sortOrder: 30, published: true,
  },
  {
    id: "review-anna", type: "review", slug: "anna", title: "Анна", subtitle: "Клиент центра",
    body: "Здесь создаётся атмосфера доверия и поддержки. Специалисты помогают найти реальные пути решения сложностей.", image: "", meta: "{}", sortOrder: 10, published: true,
  },
  {
    id: "review-margarita", type: "review", slug: "margarita", title: "Маргарита", subtitle: "Участница расстановки",
    body: "После работы по-другому смотришь на свои решения и на себя. Появилось ощущение ясности внутри.", image: "", meta: "{}", sortOrder: 20, published: true,
  },
  {
    id: "review-client", type: "review", slug: "client", title: "Участник курса", subtitle: "Курс «Путь к себе»",
    body: "Сейчас я в наполненном состоянии и стремлюсь к большему не из недостатка, а из внутренней опоры.", image: "", meta: "{}", sortOrder: 30, published: true,
  },
];

export const navItems = [
  { href: "/osnovatel", label: "О центре" },
  { href: "/specialisty", label: "Специалисты" },
  { href: "/uslugi", label: "Программы" },
  { href: "/meropriyatiya", label: "Мероприятия" },
  { href: "/otzyvy", label: "Отзывы" },
  { href: "/contacts", label: "Контакты" },
];

export function defaultsByType(type: ContentType) {
  return defaultContent.filter((item) => item.type === type).sort((a, b) => a.sortOrder - b.sortOrder);
}

export function safeMeta(item: ContentItem): Record<string, string> {
  try { return JSON.parse(item.meta || "{}"); } catch { return {}; }
}
