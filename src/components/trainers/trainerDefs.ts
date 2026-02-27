import { TrainerDef, TrainerId } from "./types";

export const TRAINER_DEFS: TrainerDef[] = [
  {
    id: "conscious-choice",
    icon: "Compass",
    title: "Осознанный выбор",
    subtitle: "ПоДелам",
    description:
      "Научитесь принимать решения осознанно, опираясь на ценности, а не на страхи. Подходит для любых жизненных развилок.",
    color: "bg-indigo-50",
    iconColor: "text-indigo-600",
    bgGradient: "from-indigo-500 to-violet-600",
    accessPlans: [
      {
        duration: "1month",
        label: "1 месяц",
        price: 990,
        features: ["Базовый доступ", "До 4 сессий"],
      },
      {
        duration: "3months",
        label: "3 месяца",
        price: 2490,
        features: [
          "Аналитика паттернов",
          "Неограниченные сессии",
          "Сравнение периодов",
        ],
      },
    ],
    stepsCount: 12,
    estimatedMinutes: 7,
    tags: ["решения", "ценности", "осознанность"],
  },
  {
    id: "emotions-in-action",
    icon: "Heart",
    title: "Эмоции в действии",
    subtitle: "Эмоциональный интеллект",
    description:
      "Распознавайте эмоции, находите триггеры и учитесь управлять реакциями. Для глубокой работы рекомендуется минимум 3 месяца.",
    color: "bg-rose-50",
    iconColor: "text-rose-600",
    bgGradient: "from-rose-500 to-pink-600",
    accessPlans: [
      {
        duration: "3months",
        label: "3 месяца",
        price: 2490,
        features: [
          "Полный функционал",
          "Эмоциональная карта",
          "Статистика повторяемости",
        ],
      },
      {
        duration: "1year",
        label: "1 год",
        price: 6990,
        features: [
          "Годовая эмоциональная карта",
          "Глубокая аналитика",
          "Все дополнения",
        ],
      },
    ],
    stepsCount: 14,
    estimatedMinutes: 10,
    tags: ["эмоции", "триггеры", "саморегуляция"],
  },
  {
    id: "anti-procrastination",
    icon: "Zap",
    title: "Антипрокрастинация",
    subtitle: "Малый шаг",
    description:
      "Преодолейте откладывание через метод малых шагов. Формирование привычки за 30–60 дней.",
    color: "bg-amber-50",
    iconColor: "text-amber-600",
    bgGradient: "from-amber-500 to-orange-600",
    accessPlans: [
      {
        duration: "1month",
        label: "1 месяц",
        price: 990,
        features: ["Запуск привычки", "До 4 сессий в неделю"],
      },
      {
        duration: "3months",
        label: "3 месяца",
        price: 2490,
        features: [
          "Закрепление привычки",
          "Трекер прогресса",
          "Неограниченно",
        ],
      },
    ],
    stepsCount: 10,
    estimatedMinutes: 5,
    tags: ["прокрастинация", "привычки", "действие"],
  },
  {
    id: "self-esteem",
    icon: "Shield",
    title: "Самооценка и внутренняя опора",
    subtitle: "Фундамент личности",
    description:
      "Укрепите самоценность, ослабьте внутреннего критика и научитесь выстраивать личные границы. Минимум 3 месяца для результата.",
    color: "bg-emerald-50",
    iconColor: "text-emerald-600",
    bgGradient: "from-emerald-500 to-teal-600",
    accessPlans: [
      {
        duration: "3months",
        label: "3 месяца",
        price: 2490,
        features: [
          "Полный доступ",
          "Карта самооценки",
          "Трекер границ",
        ],
      },
      {
        duration: "1year",
        label: "1 год",
        price: 6990,
        features: [
          "Годовая динамика",
          "Все уровни",
          "Глубокая аналитика",
        ],
      },
    ],
    stepsCount: 14,
    estimatedMinutes: 10,
    tags: ["самооценка", "границы", "уверенность"],
  },
  {
    id: "money-anxiety",
    icon: "Wallet",
    title: "Деньги без тревоги",
    subtitle: "Финансовое спокойствие",
    description:
      "Разберите денежные установки, снизьте финансовую тревогу и выстройте здоровое отношение к деньгам.",
    color: "bg-sky-50",
    iconColor: "text-sky-600",
    bgGradient: "from-sky-500 to-blue-600",
    accessPlans: [
      {
        duration: "1month",
        label: "1 месяц",
        price: 990,
        features: ["Работа с одной задачей", "Базовая аналитика"],
      },
      {
        duration: "3months",
        label: "3 месяца",
        price: 2490,
        features: ["Смена денежной стратегии", "Полная аналитика"],
      },
      {
        duration: "1year",
        label: "1 год",
        price: 6990,
        features: [
          "Для предпринимателей",
          "Все уровни",
          "Глубокая проработка",
        ],
      },
    ],
    stepsCount: 12,
    estimatedMinutes: 8,
    tags: ["деньги", "тревога", "финансы"],
  },
];

export function getTrainerDef(id: TrainerId): TrainerDef | undefined {
  return TRAINER_DEFS.find((t) => t.id === id);
}
