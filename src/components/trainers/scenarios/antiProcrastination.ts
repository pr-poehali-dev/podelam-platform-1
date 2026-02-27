import { TrainerScenario } from "../types";

export const antiProcrastinationScenario: TrainerScenario = {
  id: "anti-procrastination",
  resultCalculator: "anti-procrastination",
  steps: [
    {
      id: "ap-intro",
      type: "intro",
      title: "Антипрокрастинация. Малый шаг",
      description:
        "Прокрастинация — это не лень. Это защитная реакция на страх, перегрузку или неясность. Этот тренажёр поможет разобрать конкретную задачу, которую вы откладываете, и найти тот самый первый маленький шаг. Метод «2 минуты» работает: начните — и мозг включится.",
    },
    {
      id: "ap-task",
      type: "text-input",
      title: "Какую задачу вы сейчас откладываете?",
      description:
        "Выберите одну конкретную задачу. Не самую глобальную — ту, которая прямо сейчас вызывает внутреннее сопротивление.",
      placeholder: "Например: начать писать отчёт, записаться к врачу...",
    },
    {
      id: "ap-why",
      type: "single-choice",
      title: "Почему эта задача важна для вас?",
      description:
        "Мотивация «надо» слабее мотивации «хочу, потому что...». Найдите свою причину.",
      scoreCategory: "motivation",
      options: [
        { id: "ap-w-goal", label: "Приближает к важной цели", score: 5 },
        { id: "ap-w-relief", label: "После неё станет легче", score: 4 },
        { id: "ap-w-people", label: "Это важно для людей, которые мне дороги", score: 3 },
        { id: "ap-w-money", label: "Связана с доходом или карьерой", score: 4 },
        { id: "ap-w-health", label: "Касается моего здоровья", score: 4 },
        { id: "ap-w-must", label: "Честно — просто «надо» и всё", score: 1 },
      ],
    },
    {
      id: "ap-blocker",
      type: "single-choice",
      title: "Что мешает вам начать?",
      description:
        "Определить барьер — значит на 50% его преодолеть.",
      scoreCategory: "resistance",
      options: [
        { id: "ap-b-big", label: "Задача слишком большая и непонятно, с чего начать", score: 4 },
        { id: "ap-b-boring", label: "Скучно и неинтересно", score: 3 },
        { id: "ap-b-scary", label: "Страшно: а вдруг не получится?", score: 5 },
        { id: "ap-b-unclear", label: "Неясно, как именно это делать", score: 4 },
        { id: "ap-b-perfect", label: "Хочу сделать идеально — и поэтому не начинаю", score: 5 },
        { id: "ap-b-tired", label: "Нет сил, устал(а)", score: 3 },
      ],
    },
    {
      id: "ap-duration",
      type: "single-choice",
      title: "Как давно вы откладываете эту задачу?",
      description:
        "Чем дольше откладываем — тем больше тревога. Но и начать никогда не поздно.",
      scoreCategory: "resistance",
      options: [
        { id: "ap-d-today", label: "Только сегодня", score: 1 },
        { id: "ap-d-days", label: "Несколько дней", score: 2 },
        { id: "ap-d-week", label: "Около недели", score: 3 },
        { id: "ap-d-weeks", label: "Несколько недель", score: 4 },
        { id: "ap-d-month", label: "Месяц и более", score: 5 },
      ],
    },
    {
      id: "ap-two-min",
      type: "single-choice",
      title: "Можете ли вы заниматься этим всего 2 минуты?",
      description:
        "Не час, не полдня — ровно 2 минуты. Откройте файл, напишите первое предложение, наберите номер.",
      scoreCategory: "action",
      options: [
        { id: "ap-2m-yes", label: "Да, 2 минуты — это точно могу", score: 5 },
        { id: "ap-2m-maybe", label: "Наверное, если заставлю себя", score: 3 },
        { id: "ap-2m-hard", label: "Даже 2 минуты кажутся сложными", score: 1 },
      ],
    },
    {
      id: "ap-smallest",
      type: "text-input",
      title: "Какой самый маленький шаг вы можете сделать?",
      description:
        "Подумайте: что бы вы сделали, если бы на задачу было только 2 минуты? Именно это и запишите.",
      placeholder: "Например: открыть документ и написать заголовок...",
    },
    {
      id: "ap-after",
      type: "single-choice",
      title: "Что вы почувствуете, когда сделаете хотя бы этот шаг?",
      description:
        "Представьте: шаг сделан. Что внутри?",
      scoreCategory: "motivation",
      options: [
        { id: "ap-a-relief", label: "Облегчение — груз свалился", score: 5 },
        { id: "ap-a-pride", label: "Гордость — я смог(ла)!", score: 5 },
        { id: "ap-a-energy", label: "Прилив энергии — хочется продолжить", score: 4 },
        { id: "ap-a-calm", label: "Спокойствие — хотя бы начал(а)", score: 3 },
        { id: "ap-a-nothing", label: "Ничего особенного", score: 1 },
      ],
    },
    {
      id: "ap-when",
      type: "single-choice",
      title: "Когда именно вы сделаете этот маленький шаг?",
      description:
        "Конкретное время повышает вероятность действия в 3 раза. Выберите момент.",
      scoreCategory: "action",
      options: [
        { id: "ap-w-now", label: "Сразу после этого тренажёра", score: 5 },
        { id: "ap-w-hour", label: "В ближайший час", score: 4 },
        { id: "ap-w-today", label: "Сегодня вечером", score: 3 },
        { id: "ap-w-tomorrow", label: "Завтра утром", score: 2 },
        { id: "ap-w-unsure", label: "Пока не знаю, но скоро", score: 1 },
      ],
    },
    {
      id: "ap-distractors",
      type: "multiple-choice",
      title: "Что может вас отвлечь?",
      description:
        "Знать врага в лицо — значит быть готовым. Выберите свои главные отвлекатели.",
      scoreCategory: "resistance",
      options: [
        { id: "ap-dist-phone", label: "Телефон и соцсети", score: 2 },
        { id: "ap-dist-people", label: "Просьбы и разговоры с людьми", score: 1 },
        { id: "ap-dist-food", label: "Желание поесть/попить чай", score: 1 },
        { id: "ap-dist-other", label: "Другие «срочные» задачи", score: 2 },
        { id: "ap-dist-mood", label: "Плохое настроение или усталость", score: 2 },
        { id: "ap-dist-nothing", label: "Я смогу сфокусироваться", score: 0 },
      ],
    },
    {
      id: "ap-confidence",
      type: "scale",
      title: "Насколько вы уверены, что начнёте?",
      description:
        "Будьте честны — даже 3 из 10 уже лучше, чем не думать об этом.",
      scaleMin: 1,
      scaleMax: 10,
      scaleLabels: { min: "Почти не верю", max: "Начну точно" },
      scoreCategory: "action",
    },
    {
      id: "ap-result",
      type: "result",
      title: "Ваш результат",
      resultTemplate: "anti-procrastination",
    },
  ],
};
