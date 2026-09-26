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
    title: "Елизавета Хоментовская", subtitle: "Бизнес-психолог · онлайн и офлайн",
    body: "Основные запросы:\n• Масштабирование бизнеса.\n• Работа с командой и повышение мотивации.\n• Эмоциональное состояние собственника и руководителя.\n• Выгорание, отсутствие энергии и сил на реализацию.\n\nПомогает собственникам возвращать ясность, делегировать ключевые задачи и переходить на новый уровень без управления из тревоги.",
    image: "/images/specialists/elizaveta-homentovskaya.png", meta: JSON.stringify({ focus: "Состояние собственника", format: "Онлайн и офлайн" }), sortOrder: 10, published: true,
  },
  {
    id: "specialist-mark", type: "specialist", slug: "mark-belkin", title: "Марк Белкин", subtitle: "Психолог · онлайн и офлайн",
    body: "Основные запросы:\n• Эмоциональные проблемы.\n• Тревожность и навязчивые мысли.\n• Панические атаки.\n• Низкая самооценка и апатия.\n\nВ работе использует арт-терапию, эмоционально-образную и когнитивно-поведенческую терапию, метафорические карты и работу с частями личности.\n\nОбразование: ДВФУ — психологическое консультирование и психодиагностика; магистратура ДВФУ — психология менеджмента. Опыт работы — 7 лет.",
    image: "/images/specialists/mark-belkin.jpg", meta: JSON.stringify({ focus: "Тревожность и эмоциональные проблемы", format: "Онлайн и офлайн" }), sortOrder: 20, published: true,
  },
  {
    id: "specialist-maria", type: "specialist", slug: "maria-osipova", title: "Мария Осипова", subtitle: "Психолог, сексолог · онлайн",
    body: "Основные запросы:\n• Снижение или отсутствие сексуального желания.\n• Различие в сексуальном темпераменте и потребностях партнёров.\n• Трудности с получением удовольствия.\n• Сложности в интимной коммуникации.\n• Принятие своего тела и сексуальности.\n\nПомогает услышать тело, восстановить отношения и вернуть ресурс через ощущение безопасности.\n\nОбразование: высшее образование по направлению «Клиническая психология», профессиональная переподготовка по специальности «Сексология».",
    image: "/images/specialists/maria-osipova.png", meta: JSON.stringify({ focus: "Отношения и сексуальность", format: "Онлайн" }), sortOrder: 30, published: true,
  },
  {
    id: "specialist-tatyana", type: "specialist", slug: "tatyana-vasilieva", title: "Татьяна Васильева", subtitle: "Психолог · онлайн",
    body: "Основные запросы:\n• Завершение старых и построение новых отношений.\n• Личностный рост.\n• Женская самореализация.\n• Самооценка и повышение собственной значимости.\n\nИспользует комплексный индивидуальный подход, коучинг, арт-терапию и другие методы работы с подсознанием. Помогает восстановить контакт с собой и выстроить личную стратегию изменений.",
    image: "/images/specialists/tatyana-vasilieva.png", meta: JSON.stringify({ focus: "Отношения и самореализация", format: "Онлайн" }), sortOrder: 40, published: true,
  },
  {
    id: "specialist-olga", type: "specialist", slug: "olga-melnikova", title: "Ольга Мельникова", subtitle: "Клинический психолог, интегративный терапевт · онлайн",
    body: "Основные запросы:\n• Экзистенциальные и возрастные кризисы.\n• Профессиональное выгорание.\n• Травмирующие события, нарушенные границы, созависимые и абьюзивные отношения.\n• Диагностика клинических случаев и проработка внутренних опор личности.\n• Депрессивные состояния.\n\nОбразование: Международная школа коучинга ICU, Международный институт практической психологии, Институт консультирования и системных решений. Более 500 часов личной и групповой терапии.",
    image: "/images/specialists/olga-melnikova.jpg", meta: JSON.stringify({ focus: "Клинические случаи", format: "Онлайн" }), sortOrder: 50, published: true,
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
    id: "event-review", type: "event", slug: "gde-dengi", title: "Где деньги?", subtitle: "15 октября · 18:00–21:00 · 3 500 ₽",
    body: "Мастер-класс для предпринимателей и руководителей, которые понимают: проблема не всегда в рынке, команде или конкурентах.\n\nНа мастер-классе разберём:\n• Что на самом деле стоит за дефицитом денег.\n• Какие сигналы предупреждают о потере дохода задолго до падения прибыли.\n• Как состояние руководителя влияет на финансовые результаты компании.\n• Практику «Тройные стандарты», которая поможет увидеть ограничения и найти новые точки роста.\n• Проведём диагностику вашего текущего состояния и его влияния на деньги.\n\nВ результате вы получите:\n✔ Чёткое понимание, где теряются деньги.\n✔ Конкретные шаги для роста дохода.\n✔ Новую стратегию принятия решений.\n✔ Больше ясности, энергии и уверенности для масштабирования бизнеса.\n\nЕсли вам кажется, что вы работаете больше, чем зарабатываете, пора разобраться, куда утекает ваша прибыль.\n\nАлёна Савинова — основатель международного тренингового центра «Путь к себе», бизнес-наставник с опытом 25 лет, ТВ-эксперт федеральных каналов. Более 130 успешных кейсов с увеличением дохода компаний от ×3 за 6 месяцев.\n\nЗапись: +7 914 665-86-53 · WhatsApp, Telegram, MAX.",
    image: "/images/alena-portrait-1.jpg", meta: JSON.stringify({ date: "15 октября", price: "3 500 ₽", archived: "false" }), sortOrder: 10, published: true,
  },
  {
    id: "event-model", type: "event", slug: "rasshirenie-vozmozhnostey", title: "Расширение возможностей", subtitle: "29 сентября · 18:00–21:00 · бизнес-расстановка",
    body: "Вы чувствуете, что готовы к большему, но будто что-то не даёт выйти на новый уровень? Масштаб — это не только больше денег и возможностей. Это ещё больше ответственности, решений и необходимости отпускать контроль.\n\nИногда именно внутренние страхи, ограничения и привычные сценарии не позволяют расшириться, даже когда внешне всё для этого уже есть. Посмотрим, что мешает вам идти в масштаб и что стоит за внутренними препятствиями на пути к следующему уровню.\n\nЕсли сейчас вы стоите на пороге роста — приходите.\n\nЗапись: +7 914 665-86-53 · WhatsApp, Telegram, MAX.",
    image: "/images/founder-speaking.jpeg", meta: JSON.stringify({ date: "29 сентября", archived: "false" }), sortOrder: 20, published: true,
  },
  {
    id: "event-yacht", type: "event", slug: "rassvet-biznesa", title: "Деньги. Смыслы. Отношения", subtitle: "15 сентября, 10:00–17:00 · 25 000 ₽",
    body: "Камерный тренинг на яхте до 10 человек: мастер-класс, мини-расстановки и работа с конфликтом между деньгами, отношениями и личными смыслами.",
    image: "/images/event-2.jpg", meta: JSON.stringify({ date: "15 сентября", price: "25 000 ₽", archived: "true" }), sortOrder: 30, published: true,
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
  { href: "/obrazovanie", label: "Образование" },
  { href: "/socialnye-seti", label: "Социальные сети" },
];

export function defaultsByType(type: ContentType) {
  return defaultContent.filter((item) => item.type === type).sort((a, b) => a.sortOrder - b.sortOrder);
}

export function safeMeta(item: ContentItem): Record<string, string> {
  try { return JSON.parse(item.meta || "{}"); } catch { return {}; }
}
