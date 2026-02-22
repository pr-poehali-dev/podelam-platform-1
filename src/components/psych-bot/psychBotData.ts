// ─── СЕГМЕНТЫ ─────────────────────────────────────────────────────────────────

export const SEGMENT_NAMES: Record<string, string> = {
  creative: "Творчество и самовыражение",
  help_people: "Помощь и забота о людях",
  analytics: "Аналитика и системность",
  business: "Предпринимательство и деньги",
  education: "Обучение и передача знаний",
  communication: "Коммуникации и влияние",
  management: "Организация и управление",
  practical: "Практическая деятельность",
  research: "Исследование и развитие",
  freedom: "Свобода и независимый формат",
};

export const MOTIVATION_NAMES: Record<string, string> = {
  meaning: "Смысл и польза",
  money: "Деньги и доход",
  recognition: "Признание и известность",
  freedom: "Свобода и независимость",
  process: "Интерес к процессу",
  status: "Статус и карьера",
};

// ─── ВОПРОСЫ ТЕСТА ────────────────────────────────────────────────────────────

export type QuestionOption = {
  text: string;
  segments: Partial<Record<string, number>>;
  motivations: Partial<Record<string, number>>;
};

export type Question = {
  id: number;
  text: string;
  options: QuestionOption[];
};

export const QUESTIONS: Question[] = [
  {
    id: 1,
    text: "Когда ты представляешь идеальный рабочий день — что происходит?",
    options: [
      { text: "Я создаю что-то своими руками или головой — текст, дизайн, музыку", segments: { creative: 3 }, motivations: { process: 2, recognition: 1 } },
      { text: "Я помогаю конкретному человеку решить его проблему", segments: { help_people: 3 }, motivations: { meaning: 3 } },
      { text: "Я работаю с данными, строю модели, нахожу закономерности", segments: { analytics: 3, research: 1 }, motivations: { process: 2, status: 1 } },
      { text: "Я провожу переговоры, заключаю сделки, строю бизнес", segments: { business: 3 }, motivations: { money: 2, status: 1 } },
      { text: "Я преподаю или передаю знания, вижу как человек понимает", segments: { education: 3 }, motivations: { meaning: 2, recognition: 1 } },
    ],
  },
  {
    id: 2,
    text: "Что тебя заряжает энергией на работе?",
    options: [
      { text: "Свобода действий и отсутствие жёстких рамок", segments: { freedom: 3, creative: 1 }, motivations: { freedom: 3 } },
      { text: "Общение с людьми, живые эмоции и взаимодействие", segments: { communication: 3, help_people: 1 }, motivations: { recognition: 1, meaning: 1 } },
      { text: "Организация людей и процессов, когда всё работает как часы", segments: { management: 3 }, motivations: { status: 2, process: 1 } },
      { text: "Когда вижу результат своими глазами — сделал, готово", segments: { practical: 3 }, motivations: { process: 2, meaning: 1 } },
      { text: "Углубляюсь в тему, изучаю, нахожу неочевидные ответы", segments: { research: 3, analytics: 1 }, motivations: { process: 3 } },
    ],
  },
  {
    id: 3,
    text: "Ради чего ты готов работать бесплатно (или почти бесплатно)?",
    options: [
      { text: "Ради признания и известности, чтобы меня знали и уважали", segments: { communication: 2, creative: 1 }, motivations: { recognition: 3 } },
      { text: "Ради смысла и пользы — если это реально помогает людям", segments: { help_people: 2, education: 1 }, motivations: { meaning: 3 } },
      { text: "Ради опыта и интереса к самому процессу", segments: { research: 2, creative: 1 }, motivations: { process: 3 } },
      { text: "Я не готов работать бесплатно — деньги это главный критерий", segments: { business: 2 }, motivations: { money: 3 } },
      { text: "Ради карьерного роста и статуса в своей сфере", segments: { management: 2, analytics: 1 }, motivations: { status: 3 } },
    ],
  },
  {
    id: 4,
    text: "Как ты хочешь работать — выбери ближайшее к твоей мечте:",
    options: [
      { text: "Фриланс, сам выбираю клиентов и задачи, никакого офиса", segments: { freedom: 3, creative: 1 }, motivations: { freedom: 3 } },
      { text: "Своё дело с командой, я принимаю решения", segments: { business: 2, management: 2 }, motivations: { status: 2, money: 1 } },
      { text: "Работа с людьми лично — консультации, сессии, занятия", segments: { help_people: 2, education: 2 }, motivations: { meaning: 2, recognition: 1 } },
      { text: "Удалённая работа в стабильной компании, чёткие задачи", segments: { analytics: 2, management: 1 }, motivations: { status: 1, freedom: 1 } },
      { text: "Творческая мастерская или студия, где я создаю", segments: { creative: 3, practical: 1 }, motivations: { process: 2, recognition: 1 } },
    ],
  },
  {
    id: 5,
    text: "Что из этого ты делаешь лучше всего?",
    options: [
      { text: "Нахожу нестандартные решения, придумываю идеи", segments: { creative: 2, research: 1 }, motivations: { process: 2 } },
      { text: "Объясняю сложное простыми словами", segments: { education: 3, communication: 1 }, motivations: { meaning: 2, recognition: 1 } },
      { text: "Анализирую ситуацию, нахожу причины и закономерности", segments: { analytics: 3, research: 1 }, motivations: { process: 2, status: 1 } },
      { text: "Организую людей и процессы, привожу к результату", segments: { management: 3 }, motivations: { status: 2 } },
      { text: "Делаю что-то руками лучше, чем другие", segments: { practical: 3 }, motivations: { process: 2, recognition: 1 } },
    ],
  },
  {
    id: 6,
    text: "Представь, что у тебя появилось 100 000 рублей свободных. Что сделаешь в первую очередь?",
    options: [
      { text: "Вложу в своё образование или навык, который хочу освоить", segments: { education: 1, research: 1 }, motivations: { meaning: 1, process: 1 } },
      { text: "Запущу мини-бизнес или протестирую идею", segments: { business: 3 }, motivations: { money: 2, status: 1 } },
      { text: "Инвестирую — акции, крипта, недвижимость", segments: { business: 2, analytics: 1 }, motivations: { money: 3 } },
      { text: "Сделаю что-то значимое — помогу людям или реализую проект мечты", segments: { help_people: 1, creative: 1 }, motivations: { meaning: 2 } },
      { text: "Куплю свободу — съезжу путешествовать, дам себе время подумать", segments: { freedom: 3 }, motivations: { freedom: 3 } },
    ],
  },
  {
    id: 7,
    text: "Как ты обычно реагируешь, когда тебе дают сложную задачу без чёткого решения?",
    options: [
      { text: "Начинаю экспериментировать и пробовать разные подходы", segments: { creative: 2, research: 2 }, motivations: { process: 2 } },
      { text: "Ищу данные, строю логическую цепочку, разбираю по шагам", segments: { analytics: 3 }, motivations: { process: 2, status: 1 } },
      { text: "Собираю команду или нужных людей, распределяю задачи", segments: { management: 3 }, motivations: { status: 2 } },
      { text: "Спрашиваю у тех, кто знает — не хочу тратить время на угадайку", segments: { help_people: 1, education: 1 }, motivations: { meaning: 1 } },
      { text: "Чувствую прилив энергии — люблю разбираться в непонятном", segments: { research: 3 }, motivations: { process: 3 } },
    ],
  },
  {
    id: 8,
    text: "Что для тебя важнее всего в работе — выбери одно:",
    options: [
      { text: "Высокий доход и финансовая независимость", segments: { business: 2, freedom: 1 }, motivations: { money: 3 } },
      { text: "Чувство, что делаю что-то важное и полезное", segments: { help_people: 2, education: 1 }, motivations: { meaning: 3 } },
      { text: "Признание и известность в своей сфере", segments: { communication: 2, creative: 1 }, motivations: { recognition: 3 } },
      { text: "Свобода — работать где хочу и когда хочу", segments: { freedom: 3 }, motivations: { freedom: 3 } },
      { text: "Карьерный рост и высокая должность", segments: { management: 2, analytics: 1 }, motivations: { status: 3 } },
    ],
  },
  {
    id: 9,
    text: "Выбери описание, которое лучше всего тебя характеризует:",
    options: [
      { text: "Я — человек-идея: вижу красоту и смысл там, где другие не замечают", segments: { creative: 3 }, motivations: { process: 2, meaning: 1 } },
      { text: "Я — человек-система: люблю порядок, цифры и логику", segments: { analytics: 3 }, motivations: { process: 2, status: 1 } },
      { text: "Я — человек-связь: умею объединять людей и налаживать коммуникацию", segments: { communication: 3, management: 1 }, motivations: { recognition: 1, meaning: 1 } },
      { text: "Я — человек-результат: мне важно видеть итог и двигаться вперёд", segments: { business: 2, practical: 1 }, motivations: { money: 1, status: 1 } },
      { text: "Я — человек-исследователь: всегда хочу знать «почему» и «как устроено»", segments: { research: 3, analytics: 1 }, motivations: { process: 3 } },
    ],
  },
  {
    id: 10,
    text: "Тебе предлагают два проекта. Какой выберешь?",
    options: [
      { text: "Сложный аналитический проект с хорошей оплатой, но монотонный", segments: { analytics: 2 }, motivations: { money: 2, status: 1 } },
      { text: "Интересный творческий проект с неопределённым доходом", segments: { creative: 3 }, motivations: { process: 3 } },
      { text: "Помочь небольшой организации — денег мало, но видно как помогаешь людям", segments: { help_people: 3 }, motivations: { meaning: 3 } },
      { text: "Запустить что-то с нуля — риск есть, но и прибыль может быть хорошей", segments: { business: 3 }, motivations: { money: 2, freedom: 1 } },
      { text: "Преподавать или обучать — стабильно, системно, с отдачей", segments: { education: 3 }, motivations: { meaning: 2, recognition: 1 } },
    ],
  },
  {
    id: 11,
    text: "Что больше всего раздражает в работе?",
    options: [
      { text: "Когда нет чёткой задачи и всё хаотично — не понимаю что делать", segments: { analytics: 2, management: 1 }, motivations: { status: 1 } },
      { text: "Когда работа бессмысленная и не приносит пользы людям", segments: { help_people: 2, education: 1 }, motivations: { meaning: 2 } },
      { text: "Когда нет свободы — всё по инструкции и под контролем", segments: { freedom: 3, creative: 1 }, motivations: { freedom: 3 } },
      { text: "Когда нет роста ни в деньгах, ни в статусе", segments: { business: 1, management: 1 }, motivations: { money: 2, status: 2 } },
      { text: "Когда скучно и нет места для творчества и экспериментов", segments: { creative: 2, research: 1 }, motivations: { process: 2 } },
    ],
  },
  {
    id: 12,
    text: "Каким тебя чаще всего описывают друзья или коллеги?",
    options: [
      { text: "Творческий, нестандартно мыслит, всегда с идеями", segments: { creative: 3 }, motivations: { process: 2, recognition: 1 } },
      { text: "Надёжный, всегда помогает, на него можно положиться", segments: { help_people: 3 }, motivations: { meaning: 3 } },
      { text: "Умный, логичный, разбирается в сложном", segments: { analytics: 2, research: 2 }, motivations: { status: 2, process: 1 } },
      { text: "Общительный, харизматичный, умеет убеждать", segments: { communication: 3 }, motivations: { recognition: 2, freedom: 1 } },
      { text: "Организованный, доводит дела до конца, умеет управлять", segments: { management: 3 }, motivations: { status: 2 } },
    ],
  },
  {
    id: 13,
    text: "Если бы тебе дали год без денежных забот — чем бы ты занимался?",
    options: [
      { text: "Писал книгу, снимал фильм, рисовал — создавал что-то своё", segments: { creative: 3 }, motivations: { process: 3, recognition: 1 } },
      { text: "Путешествовал, изучал мир, жил в разных городах", segments: { freedom: 3 }, motivations: { freedom: 3 } },
      { text: "Запустил благотворительный проект или помогал людям", segments: { help_people: 3 }, motivations: { meaning: 3 } },
      { text: "Строил бизнес — всё равно, даже без нужды в деньгах интересно", segments: { business: 3 }, motivations: { status: 2, process: 1 } },
      { text: "Глубоко изучил интересующую меня тему, написал исследование", segments: { research: 3, education: 1 }, motivations: { process: 3, meaning: 1 } },
    ],
  },
  {
    id: 14,
    text: "Как ты относишься к публичности?",
    options: [
      { text: "Люблю быть на виду — мне нравится, когда меня замечают", segments: { communication: 3, creative: 1 }, motivations: { recognition: 3 } },
      { text: "Не против, если это помогает делу и привлекает клиентов", segments: { business: 2, education: 1 }, motivations: { money: 2, recognition: 1 } },
      { text: "Предпочитаю работать за кулисами — результат важнее известности", segments: { analytics: 2, research: 1 }, motivations: { process: 2, meaning: 1 } },
      { text: "Готов быть публичным ради смысла — если это поможет людям", segments: { help_people: 1, education: 2 }, motivations: { meaning: 3 } },
      { text: "Не моё — хочу свободы и не хочу зависеть от чужого мнения", segments: { freedom: 3 }, motivations: { freedom: 3 } },
    ],
  },
  {
    id: 15,
    text: "Что для тебя «успех» через 5 лет?",
    options: [
      { text: "Финансовая независимость и пассивный доход", segments: { business: 2, freedom: 2 }, motivations: { money: 3, freedom: 1 } },
      { text: "Признанный эксперт в своей области, меня знают и уважают", segments: { communication: 2, education: 1 }, motivations: { recognition: 3, status: 1 } },
      { text: "Занимаюсь любимым делом и не считаю это работой", segments: { creative: 2, freedom: 1 }, motivations: { process: 3, freedom: 1 } },
      { text: "Создал что-то, что изменило жизнь людей к лучшему", segments: { help_people: 2, education: 1 }, motivations: { meaning: 3 } },
      { text: "Руководящая должность, влияние, команда, карьера", segments: { management: 3 }, motivations: { status: 3 } },
    ],
  },
];

// ─── ПРОФЕССИИ ────────────────────────────────────────────────────────────────

export type Profession = { name: string; tags: string[] };

export const SEGMENT_PROFESSIONS: Record<string, Profession[]> = {
  creative: [
    { name: "Контент-креатор / блогер", tags: ["recognition", "freedom"] },
    { name: "Дизайнер (графика, UX)", tags: ["process", "status"] },
    { name: "Копирайтер / сторителлер", tags: ["freedom", "process"] },
    { name: "Фотограф", tags: ["freedom", "recognition"] },
    { name: "Видеограф / монтажёр", tags: ["recognition", "process"] },
    { name: "Иллюстратор", tags: ["process", "meaning"] },
    { name: "Музыкант / саунд-дизайнер", tags: ["process", "recognition"] },
    { name: "SMM-специалист", tags: ["recognition", "freedom"] },
    { name: "Арт-директор", tags: ["status", "recognition"] },
    { name: "Режиссёр / сценарист", tags: ["recognition", "process"] },
  ],
  help_people: [
    { name: "Психолог / коуч", tags: ["meaning", "process"] },
    { name: "Нутрициолог / диетолог", tags: ["meaning", "freedom"] },
    { name: "Фитнес-тренер", tags: ["meaning", "recognition"] },
    { name: "Медиатор / конфликтолог", tags: ["meaning", "status"] },
    { name: "HR / рекрутер", tags: ["meaning", "status"] },
    { name: "Социальный работник", tags: ["meaning"] },
    { name: "Массажист / телесный терапевт", tags: ["meaning", "freedom"] },
    { name: "Волонтёр / НКО-менеджер", tags: ["meaning"] },
    { name: "Онлайн-консультант", tags: ["freedom", "meaning"] },
    { name: "Специалист по реабилитации", tags: ["meaning", "process"] },
  ],
  analytics: [
    { name: "Аналитик данных", tags: ["process", "status"] },
    { name: "Финансовый аналитик", tags: ["money", "status"] },
    { name: "Бизнес-аналитик", tags: ["status", "money"] },
    { name: "Data Scientist", tags: ["process", "status"] },
    { name: "Аудитор", tags: ["status", "money"] },
    { name: "SEO-специалист", tags: ["process", "freedom"] },
    { name: "Продуктовый аналитик", tags: ["process", "status"] },
    { name: "Бухгалтер / налоговый консультант", tags: ["money", "status"] },
    { name: "Системный аналитик", tags: ["process", "status"] },
    { name: "Исследователь рынка", tags: ["process", "money"] },
  ],
  business: [
    { name: "Предприниматель / основатель стартапа", tags: ["money", "status", "freedom"] },
    { name: "Трейдер / инвестор", tags: ["money", "freedom"] },
    { name: "Продажник / менеджер по продажам", tags: ["money", "recognition"] },
    { name: "Маркетолог", tags: ["money", "recognition"] },
    { name: "Франчайзи", tags: ["money", "status"] },
    { name: "Риелтор", tags: ["money", "freedom"] },
    { name: "Affiliate-маркетолог", tags: ["money", "freedom"] },
    { name: "E-commerce предприниматель", tags: ["money", "freedom"] },
    { name: "Бизнес-консультант", tags: ["money", "status"] },
    { name: "Специалист по закупкам", tags: ["money", "process"] },
  ],
  education: [
    { name: "Онлайн-преподаватель / автор курса", tags: ["meaning", "freedom", "money"] },
    { name: "Тренер / бизнес-тренер", tags: ["meaning", "recognition"] },
    { name: "Репетитор", tags: ["meaning", "freedom"] },
    { name: "Методолог / инструктивный дизайнер", tags: ["process", "meaning"] },
    { name: "Детский педагог", tags: ["meaning"] },
    { name: "Куратор онлайн-курса", tags: ["meaning", "freedom"] },
    { name: "Ментор / наставник", tags: ["meaning", "status"] },
    { name: "Автор обучающих материалов", tags: ["process", "freedom"] },
    { name: "Лектор / публичный спикер", tags: ["recognition", "meaning"] },
    { name: "Корпоративный тренер", tags: ["money", "status"] },
  ],
  communication: [
    { name: "Ведущий мероприятий", tags: ["recognition", "process"] },
    { name: "PR-специалист", tags: ["recognition", "status"] },
    { name: "Журналист / редактор", tags: ["recognition", "meaning"] },
    { name: "Публичный спикер", tags: ["recognition", "status"] },
    { name: "Community-менеджер", tags: ["meaning", "recognition"] },
    { name: "Подкастер", tags: ["recognition", "freedom"] },
    { name: "Переговорщик / дипломат", tags: ["status", "money"] },
    { name: "Клиентский менеджер", tags: ["money", "recognition"] },
    { name: "Рекламный менеджер", tags: ["money", "status"] },
    { name: "Нетворк-организатор", tags: ["recognition", "meaning"] },
  ],
  management: [
    { name: "Проджект-менеджер (PM)", tags: ["status", "process"] },
    { name: "Продакт-менеджер", tags: ["status", "money"] },
    { name: "Операционный директор (COO)", tags: ["status", "money"] },
    { name: "HR-директор", tags: ["status", "meaning"] },
    { name: "Event-менеджер", tags: ["process", "recognition"] },
    { name: "Scrum-мастер", tags: ["process", "status"] },
    { name: "Руководитель отдела", tags: ["status", "money"] },
    { name: "Операционный менеджер", tags: ["status", "process"] },
    { name: "Бизнес-партнёр (HRBP)", tags: ["status", "meaning"] },
    { name: "Директор по развитию", tags: ["status", "money"] },
  ],
  practical: [
    { name: "Мастер ручного труда / ремесленник", tags: ["process", "freedom"] },
    { name: "Повар / шеф-повар", tags: ["process", "recognition"] },
    { name: "Кондитер", tags: ["process", "freedom"] },
    { name: "Парикмахер / стилист", tags: ["recognition", "freedom"] },
    { name: "Мастер маникюра / beauty-мастер", tags: ["recognition", "freedom"] },
    { name: "Тату-мастер", tags: ["recognition", "process"] },
    { name: "Тренер / инструктор по спорту", tags: ["meaning", "recognition"] },
    { name: "Автомеханик / мастер по ремонту", tags: ["process", "money"] },
    { name: "Фермер / агропредприниматель", tags: ["freedom", "money"] },
    { name: "Строитель / прораб", tags: ["money", "process"] },
  ],
  research: [
    { name: "UX-исследователь", tags: ["process", "status"] },
    { name: "Маркетинговый исследователь", tags: ["process", "money"] },
    { name: "Технический писатель", tags: ["process", "freedom"] },
    { name: "Специалист по кибербезопасности", tags: ["status", "money"] },
    { name: "Биотехнолог / фармаколог", tags: ["meaning", "status"] },
    { name: "Социолог / антрополог", tags: ["meaning", "process"] },
    { name: "AI/ML-специалист", tags: ["status", "money"] },
    { name: "QA-инженер", tags: ["process", "status"] },
    { name: "R&D-менеджер", tags: ["status", "process"] },
    { name: "Патентный поверенный", tags: ["status", "money"] },
  ],
  freedom: [
    { name: "Цифровой кочевник / удалённый специалист", tags: ["freedom", "process"] },
    { name: "Фрилансер (любая специальность)", tags: ["freedom", "money"] },
    { name: "Онлайн-предприниматель", tags: ["freedom", "money"] },
    { name: "Инфобизнесмен / автор курсов", tags: ["freedom", "money"] },
    { name: "Дропшиппер / e-commerce", tags: ["freedom", "money"] },
    { name: "Удалённый консультант", tags: ["freedom", "status"] },
    { name: "Автор пассивных продуктов (шаблоны, курсы)", tags: ["freedom", "money"] },
    { name: "Коуч онлайн", tags: ["freedom", "meaning"] },
    { name: "Специалист по автоматизации", tags: ["freedom", "process"] },
    { name: "Контент-предприниматель (YouTube, Telegram)", tags: ["freedom", "recognition"] },
  ],
};

// ─── МАТРИЦА ПРОФИЛЕЙ (мотивация × сегмент) ───────────────────────────────────

export const PROFILE_MATRIX: Record<string, Record<string, string>> = {
  meaning: {
    creative: "Осознанный творец",
    help_people: "Осознанный наставник",
    analytics: "Системный исследователь",
    business: "Миссионер-предприниматель",
    education: "Вдохновляющий учитель",
    communication: "Голос перемен",
    management: "Ответственный лидер",
    practical: "Мастер с душой",
    research: "Исследователь будущего",
    freedom: "Свободный созидатель",
  },
  money: {
    creative: "Коммерческий креатор",
    help_people: "Прагматичный помощник",
    analytics: "Финансовый аналитик",
    business: "Стратег-предприниматель",
    education: "Монетизатор знаний",
    communication: "Продающий коммуникатор",
    management: "Результато-ориентированный менеджер",
    practical: "Мастер-предприниматель",
    research: "Коммерческий исследователь",
    freedom: "Финансово свободный",
  },
  recognition: {
    creative: "Звёздный творец",
    help_people: "Известный эксперт-помощник",
    analytics: "Авторитетный аналитик",
    business: "Публичный предприниматель",
    education: "Лидер-просветитель",
    communication: "Публичная фигура",
    management: "Влиятельный руководитель",
    practical: "Мастер с именем",
    research: "Признанный учёный",
    freedom: "Известный номад",
  },
  freedom: {
    creative: "Свободный создатель",
    help_people: "Независимый помощник",
    analytics: "Автономный аналитик",
    business: "Свободный предприниматель",
    education: "Независимый педагог",
    communication: "Свободный коммуникатор",
    management: "Гибкий организатор",
    practical: "Независимый мастер",
    research: "Свободный исследователь",
    freedom: "Абсолютный автономист",
  },
  process: {
    creative: "Влюблённый в творчество",
    help_people: "Преданный своему делу",
    analytics: "Любитель данных",
    business: "Азартный предприниматель",
    education: "Увлечённый педагог",
    communication: "Страстный коммуникатор",
    management: "Процесс-ориентированный лидер",
    practical: "Ремесленник-перфекционист",
    research: "Учёный-энтузиаст",
    freedom: "Гедонист-путешественник",
  },
  status: {
    creative: "Элитный творец",
    help_people: "Статусный эксперт",
    analytics: "Топ-аналитик",
    business: "Бизнес-элита",
    education: "Профессор-авторитет",
    communication: "Влиятельный спикер",
    management: "Топ-менеджер",
    practical: "Мастер высшего класса",
    research: "Ведущий исследователь",
    freedom: "Успешный независимый",
  },
};

// ─── ТЕКСТЫ ПРОФИЛЯ ───────────────────────────────────────────────────────────

export const ENERGY_TEXT: Record<string, string> = {
  creative: "создавать что-то новое, видеть результат своей работы, получать обратную связь на своё творчество",
  help_people: "помогать людям решать проблемы, видеть реальные изменения в жизни других, ощущать свою нужность",
  analytics: "разбираться в сложных системах, находить закономерности в данных, оптимизировать процессы",
  business: "строить и масштабировать, видеть рост цифр, находить новые возможности для монетизации",
  education: "передавать знания, видеть как растут ученики, создавать понятные объяснения сложных вещей",
  communication: "общаться, убеждать, влиять на людей, строить отношения и репутацию",
  management: "организовывать людей и процессы, выстраивать системы, добиваться результатов командой",
  practical: "работать руками, видеть осязаемый результат, совершенствовать мастерство",
  research: "углубляться в тему, задавать вопросы «почему», находить неочевидные ответы",
  freedom: "работать в своём ритме, выбирать задачи и место, не зависеть от чужих решений",
};

export const BURNOUT_TEXT: Record<string, string> = {
  creative: "монотонные задачи без творчества, жёсткие корпоративные рамки, работа «по шаблону»",
  help_people: "работа без отдачи и благодарности, эмоциональный перегруз, помощь через силу",
  analytics: "хаотичные данные без системы, давление без времени на анализ, работа «на ощупь»",
  business: "работа без результата и роста, чужой проект без права голоса, стагнация",
  education: "незаинтересованная аудитория, отсутствие прогресса учеников, бюрократия в образовании",
  communication: "изоляция и работа в одиночку, задачи без живого взаимодействия с людьми",
  management: "хаос без структуры, команда без мотивации, отсутствие полномочий при высокой ответственности",
  practical: "сидячая офисная работа, абстрактные задачи без видимого результата, монотонный интеллектуальный труд",
  research: "поверхностный подход, нет времени на глубокое изучение, результат не важен",
  freedom: "жёсткий контроль, фиксированный график, зависимость от одного работодателя",
};

export const FORMAT_TEXT: Record<string, string> = {
  creative: "проектная работа или фриланс, гибкий график, возможность экспериментировать",
  help_people: "индивидуальная или групповая работа с людьми, осмысленные задачи, команда единомышленников",
  analytics: "работа с данными и инструментами, чёткие задачи, возможность глубокого погружения",
  business: "собственный проект или высокая автономия внутри компании, прямая связь результата и вознаграждения",
  education: "гибридный формат (онлайн + офлайн), работа с мотивированной аудиторией",
  communication: "активная внешняя коммуникация, публичность, разнообразие контактов",
  management: "управление командой, проектная работа, чёткие метрики результата",
  practical: "работа «в полях», физическая активность, видимый результат каждого дня",
  research: "самостоятельные исследования, доступ к ресурсам, публикация результатов",
  freedom: "удалённая работа или собственный проект, отсутствие фиксированного графика",
};

// ─── МОНЕТИЗАЦИЯ ──────────────────────────────────────────────────────────────

export const MONETIZATION: Record<string, { start: string; mid: string; scale: string }> = {
  creative: {
    start: "фриланс-заказы на бирже (Kwork, FL.ru), продажа цифровых товаров (принты, шаблоны), ведение соцсетей за небольшой гонорар",
    mid: "постоянные клиенты по подписке, продажа курсов или пресетов, монетизация аудитории (реклама, донаты)",
    scale: "агентство, продюсерский центр, собственный бренд, лицензирование контента",
  },
  help_people: {
    start: "консультации по 1500–3000 ₽/час, групповые разборы в соцсетях, небольшие курсы",
    mid: "коучинговые программы 30–90 дней, своя онлайн-школа, партнёрство с клиниками или фитнес-центрами",
    scale: "масштабная онлайн-школа, франшиза методологии, книги и выступления",
  },
  analytics: {
    start: "фриланс-аудиты (сайтов, рекламы, финансов), разовые аналитические отчёты, консультации",
    mid: "ведение аналитики на аутсорсе для 3–5 клиентов, должность аналитика в компании",
    scale: "аналитическое агентство, SaaS-продукт, собственная аналитическая методология",
  },
  business: {
    start: "арбитраж, перепродажа, дропшиппинг, партнёрские программы — без увольнения",
    mid: "собственный бизнес с командой 3–7 человек, онлайн-продукт с автоворонкой",
    scale: "масштабирование через партнёров, франшиза, венчурные инвестиции",
  },
  education: {
    start: "репетиторство, мастер-классы, небольшие интенсивы по своей теме",
    mid: "авторский онлайн-курс, программа наставничества, корпоративные тренинги",
    scale: "онлайн-университет, образовательная платформа, издание учебных материалов",
  },
  communication: {
    start: "ведение мероприятий за небольшой гонорар, PR-консультации, ведение соцсетей",
    mid: "агентство коммуникаций, персональный брендинг, регулярные выступления",
    scale: "медиа-компания, книги, собственное шоу или подкаст с рекламой",
  },
  management: {
    start: "проектное управление на аутсорсе, организация мероприятий, консультации по процессам",
    mid: "PM/COO в компании, собственное операционное агентство",
    scale: "управляющий партнёр, холдинг, консалтинговая компания",
  },
  practical: {
    start: "частные заказы и услуги рядом с домом, продажа изделий ручной работы",
    mid: "собственная мастерская или студия, регулярные клиенты по подписке",
    scale: "бренд, франшиза, обучение мастерству",
  },
  research: {
    start: "фриланс-исследования для бизнеса, написание статей и материалов по теме",
    mid: "должность в R&D или исследовательской компании, консалтинг",
    scale: "собственный исследовательский центр, публикации, гранты",
  },
  freedom: {
    start: "удалённая работа по найму, фриланс на зарубежных биржах (Upwork, Toptal)",
    mid: "собственный онлайн-продукт или сервис, работа с иностранными клиентами",
    scale: "пассивный доход (курсы, SaaS, инвестиции), полная финансовая независимость",
  },
};

// ─── ПЛАН 30 ДНЕЙ ─────────────────────────────────────────────────────────────

export const PLAN_30: Record<string, string[]> = {
  creative: [
    "Неделя 1 — собери портфолио из 5–7 работ, зарегистрируйся на Kwork или Behance",
    "Неделя 2 — опубликуй первые работы и напиши 10 потенциальным клиентам",
    "Неделя 3 — возьми первый заказ (даже по низкой цене для отзыва)",
    "Неделя 4 — проанализируй спрос и подними цену на 30%",
  ],
  help_people: [
    "Неделя 1 — определи нишу (коучинг, психология, нутрициология, фитнес)",
    "Неделя 2 — проведи 3 бесплатные консультации и собери обратную связь",
    "Неделя 3 — сделай первую платную консультацию (1500–3000 ₽)",
    "Неделя 4 — оформи соцсеть и опубликуй 5 полезных постов с кейсами",
  ],
  analytics: [
    "Неделя 1 — выбери специализацию (финансы, маркетинг, данные, SEO)",
    "Неделя 2 — сделай бесплатный аудит одному знакомому бизнесу для кейса",
    "Неделя 3 — разместить предложение на профильных площадках",
    "Неделя 4 — найти первого платного клиента, зафиксировать процесс работы",
  ],
  business: [
    "Неделя 1 — выбери нишу и проверь спрос (анализ конкурентов, опрос аудитории)",
    "Неделя 2 — создай минимальный продукт или закупи первую партию товара",
    "Неделя 3 — сделай первые продажи через личные сообщения или авито",
    "Неделя 4 — посчитай экономику, реши масштабировать или менять нишу",
  ],
  education: [
    "Неделя 1 — выбери тему мини-курса или интенсива, составь программу",
    "Неделя 2 — проведи бесплатный вебинар или урок, собери отзывы",
    "Неделя 3 — упакуй материалы и запусти первый платный поток",
    "Неделя 4 — автоматизируй продажи через бота или лендинг",
  ],
  communication: [
    "Неделя 1 — определи свою экспертизу и создай медийный образ",
    "Неделя 2 — начни публиковаться в соцсетях ежедневно (5–7 постов)",
    "Неделя 3 — выступи на одном мероприятии или дай интервью",
    "Неделя 4 — запусти первую коллаборацию или партнёрство",
  ],
  management: [
    "Неделя 1 — составь портфолио кейсов: чем управлял, каких результатов достиг",
    "Неделя 2 — разместись на HH и LinkedIn, укажи конкретные метрики",
    "Неделя 3 — пройди 3 собеседования или найди первый фриланс-проект",
    "Неделя 4 — предложи услугу малому бизнесу — операционный партнёр на 3 месяца",
  ],
  practical: [
    "Неделя 1 — сфотографируй 10 лучших работ или подготовь услугу для продажи",
    "Неделя 2 — разместись на Авито, Яндекс.Услуги, создай страницу в соцсети",
    "Неделя 3 — первые 3 клиента (даже дёшево — ради отзывов)",
    "Неделя 4 — подними цену, сделай прайс и улучши описание услуги",
  ],
  research: [
    "Неделя 1 — определи тему исследования или специализацию (UX, рынок, биотех)",
    "Неделя 2 — напиши первую статью или кейс, опубликуй в профессиональном сообществе",
    "Неделя 3 — предложи исследование малому бизнесу как услугу",
    "Неделя 4 — выйди на первый платный проект или подай заявку на грант",
  ],
  freedom: [
    "Неделя 1 — выбери удалённую специальность и составь профиль на Upwork / Kwork",
    "Неделя 2 — откликнись на 20 проектов, даже если страшно",
    "Неделя 3 — выполни первый заказ, собери отзыв",
    "Неделя 4 — выстрои систему 2–3 постоянных клиентов",
  ],
};
