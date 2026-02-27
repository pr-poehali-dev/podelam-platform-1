import {
  TrainerScenario,
  TrainerSession,
  ScenarioStep,
  SessionAnswer,
  TrainerResult,
  TrainerId,
  StepOption,
} from "./types";
import { consciousChoiceScenario } from "./scenarios/consciousChoice";
import { emotionsScenario } from "./scenarios/emotions";
import { antiProcrastinationScenario } from "./scenarios/antiProcrastination";
import { selfEsteemScenario } from "./scenarios/selfEsteem";
import { moneyAnxietyScenario } from "./scenarios/moneyAnxiety";

const SCENARIOS: Record<TrainerId, TrainerScenario> = {
  "conscious-choice": consciousChoiceScenario,
  "emotions-in-action": emotionsScenario,
  "anti-procrastination": antiProcrastinationScenario,
  "self-esteem": selfEsteemScenario,
  "money-anxiety": moneyAnxietyScenario,
};

export function getScenario(trainerId: TrainerId): TrainerScenario {
  return SCENARIOS[trainerId];
}

export function createSession(trainerId: TrainerId): TrainerSession {
  return {
    id: `${trainerId}_${Date.now()}`,
    trainerId,
    startedAt: new Date().toISOString(),
    currentStepIndex: 0,
    answers: {},
    scores: {},
  };
}

export function getCurrentStep(
  session: TrainerSession
): ScenarioStep | null {
  const scenario = getScenario(session.trainerId);
  if (!scenario) return null;
  const step = scenario.steps[session.currentStepIndex] || null;

  if (step && step.meta?.dynamic && step.id === "em-strategy") {
    return getDynamicStrategyStep(session, step);
  }
  if (step && step.meta?.dynamic && step.id === "ma-rational") {
    return getDynamicRationalStep(session, step);
  }
  return step;
}

export function getTotalSteps(trainerId: TrainerId): number {
  const scenario = getScenario(trainerId);
  return scenario
    ? scenario.steps.filter(
        (s) => s.type !== "intro" && s.type !== "result"
      ).length
    : 0;
}

export function getProgress(session: TrainerSession): number {
  const scenario = getScenario(session.trainerId);
  if (!scenario) return 0;
  const total = scenario.steps.length;
  return Math.round((session.currentStepIndex / (total - 1)) * 100);
}

export function answerStep(
  session: TrainerSession,
  stepId: string,
  value: string | string[] | number
): TrainerSession {
  const scenario = getScenario(session.trainerId);
  if (!scenario) return session;

  let step = scenario.steps.find((s) => s.id === stepId);
  if (!step) return session;

  if (step.meta?.dynamic && step.id === "em-strategy") {
    step = getDynamicStrategyStep(session, step);
  }
  if (step.meta?.dynamic && step.id === "ma-rational") {
    step = getDynamicRationalStep(session, step);
  }

  const answer: SessionAnswer = {
    stepId,
    type: step.type,
    value,
    timestamp: new Date().toISOString(),
  };

  const newScores = { ...session.scores };

  if (step.type === "single-choice" && step.options) {
    const selected = step.options.find((o) => o.id === value);
    if (selected?.score !== undefined) {
      const cat =
        selected.scoreCategory || step.scoreCategory || "general";
      newScores[cat] = (newScores[cat] || 0) + selected.score;
    }
  } else if (
    step.type === "multiple-choice" &&
    step.options &&
    Array.isArray(value)
  ) {
    for (const optId of value) {
      const opt = step.options.find((o) => o.id === optId);
      if (opt?.score !== undefined) {
        const cat =
          opt.scoreCategory || step.scoreCategory || "general";
        newScores[cat] = (newScores[cat] || 0) + opt.score;
      }
    }
  } else if (step.type === "scale" && typeof value === "number") {
    const cat = step.scoreCategory || "general";
    newScores[cat] = (newScores[cat] || 0) + value;
  }

  let nextIndex = session.currentStepIndex + 1;

  if (step.type === "single-choice" && step.options) {
    const selected = step.options.find((o) => o.id === value);
    if (selected?.nextStep) {
      const targetIdx = scenario.steps.findIndex(
        (s) => s.id === selected.nextStep
      );
      if (targetIdx >= 0) nextIndex = targetIdx;
    }
  }

  if (step.type === "confirm" && typeof value === "string") {
    const targetId = value === "yes" ? step.confirmYesStep : step.confirmNoStep;
    if (targetId) {
      const targetIdx = scenario.steps.findIndex((s) => s.id === targetId);
      if (targetIdx >= 0) nextIndex = targetIdx;
    }
  }

  if (!step.options && step.nextStep && step.type !== "confirm") {
    const targetIdx = scenario.steps.findIndex(
      (s) => s.id === step!.nextStep
    );
    if (targetIdx >= 0) nextIndex = targetIdx;
  }

  return {
    ...session,
    currentStepIndex: nextIndex,
    answers: { ...session.answers, [stepId]: answer },
    scores: newScores,
  };
}

export function skipToNext(session: TrainerSession): TrainerSession {
  return {
    ...session,
    currentStepIndex: session.currentStepIndex + 1,
  };
}

const EMOTION_STRATEGY_MAP: Record<string, StepOption[]> = {
  "fear-group": [
    { id: "str-prepare", label: "Подготовиться к тому, что пугает", score: 3 },
    { id: "str-split-task", label: "Разделить задачу на маленький шаг", score: 3 },
    { id: "str-talk-fear", label: "Обсудить страх с кем-то", score: 2 },
  ],
  "anger-group": [
    { id: "str-boundaries", label: "Обсудить границы", score: 3 },
    { id: "str-pause", label: "Сделать паузу перед реакцией", score: 3 },
    { id: "str-formulate", label: "Сформулировать требования", score: 2 },
  ],
  "guilt-group": [
    { id: "str-fix", label: "Исправить ситуацию", score: 3 },
    { id: "str-forgive", label: "Попросить прощения", score: 2 },
    { id: "str-release", label: "Отпустить — вы сделали, что могли", score: 3 },
  ],
  "fatigue-group": [
    { id: "str-rest", label: "Позволить себе отдых", score: 3 },
    { id: "str-delegate", label: "Делегирование — передать часть задач", score: 3 },
    { id: "str-reduce", label: "Снизить нагрузку на ближайшие дни", score: 2 },
  ],
  positive: [
    { id: "str-anchor", label: "Закрепить результат — записать, что сработало", score: 3 },
    { id: "str-next-step", label: "Сделать следующий шаг, пока есть энергия", score: 3 },
    { id: "str-share", label: "Поделиться с кем-то важным", score: 2 },
  ],
};

function getDynamicStrategyStep(
  session: TrainerSession,
  baseStep: ScenarioStep
): ScenarioStep {
  const emotionAnswer = session.answers["em-emotion"];
  const selectedEmotions: string[] = emotionAnswer
    ? Array.isArray(emotionAnswer.value)
      ? (emotionAnswer.value as string[])
      : [emotionAnswer.value as string]
    : [];

  const emotionScenario = getScenario("emotions-in-action");
  const emotionStep = emotionScenario?.steps.find((s) => s.id === "em-emotion");
  const allOptions = emotionStep?.options || [];

  const tagGroups = new Set<string>();
  for (const eid of selectedEmotions) {
    const opt = allOptions.find((o) => o.id === eid);
    if (opt?.tags) {
      for (const tag of opt.tags) {
        if (tag !== "negative" && tag !== "positive") {
          tagGroups.add(tag);
        }
        if (tag === "positive") tagGroups.add("positive");
      }
    }
  }

  const strategyOptions: StepOption[] = [];
  const usedIds = new Set<string>();

  for (const group of tagGroups) {
    const opts = EMOTION_STRATEGY_MAP[group] || EMOTION_STRATEGY_MAP["positive"];
    for (const opt of opts) {
      if (!usedIds.has(opt.id)) {
        usedIds.add(opt.id);
        strategyOptions.push(opt);
      }
    }
  }

  if (strategyOptions.length === 0) {
    const fallback = EMOTION_STRATEGY_MAP["positive"];
    for (const opt of fallback) {
      strategyOptions.push(opt);
    }
  }

  return {
    ...baseStep,
    options: strategyOptions,
  };
}

const MONEY_RATIONAL_MAP: Record<string, StepOption[]> = {
  worthlessness: [
    { id: "rat-market", label: "Сравнить свою цену с рынком", score: 3 },
    { id: "rat-value", label: "Проанализировать ценность для клиента", score: 3 },
    { id: "rat-contribution", label: "Посчитать свой вклад в результат", score: 2 },
  ],
  distrust: [
    { id: "rat-stats", label: "Проверить статистику: уходят ли клиенты?", score: 3 },
    { id: "rat-test-raise", label: "Протестировать повышение на 1 клиенте", score: 3 },
    { id: "rat-survey", label: "Провести опрос среди клиентов", score: 2 },
  ],
  scarcity: [
    { id: "rat-plan", label: "Сделать финансовый план на 3 месяца", score: 3 },
    { id: "rat-cushion", label: "Создать подушку безопасности", score: 3 },
    { id: "rat-sources", label: "Найти дополнительный источник дохода", score: 2 },
  ],
  overwork: [
    { id: "rat-hourly", label: "Посчитать стоимость часа работы", score: 3 },
    { id: "rat-automate", label: "Автоматизировать рутину", score: 2 },
    { id: "rat-delegate2", label: "Передать часть задач", score: 3 },
  ],
  "money-fear": [
    { id: "rat-small-step", label: "Начать с минимального финансового шага", score: 3 },
    { id: "rat-educate", label: "Изучить тему: книга, курс, подкаст", score: 2 },
    { id: "rat-mentor", label: "Найти наставника в финансовом вопросе", score: 3 },
  ],
  "money-guilt": [
    { id: "rat-deserve", label: "Составить список: что я даю за эти деньги", score: 3 },
    { id: "rat-permission", label: "Дать себе разрешение зарабатывать больше", score: 2 },
    { id: "rat-separate", label: "Разделить свою вину и факты", score: 3 },
  ],
  positive: [
    { id: "rat-amplify", label: "Закрепить успех — записать, что сработало", score: 3 },
    { id: "rat-next", label: "Сделать следующий финансовый шаг", score: 3 },
    { id: "rat-share-success", label: "Поделиться результатом", score: 2 },
  ],
};

function getDynamicRationalStep(
  session: TrainerSession,
  baseStep: ScenarioStep
): ScenarioStep {
  const thoughtAnswer = session.answers["ma-thought"];
  const thoughtId =
    typeof thoughtAnswer?.value === "string" ? thoughtAnswer.value : "";

  const moneyScenario = getScenario("money-anxiety");
  const thoughtStep = moneyScenario?.steps.find((s) => s.id === "ma-thought");
  const allOptions = thoughtStep?.options || [];

  const selected = allOptions.find((o) => o.id === thoughtId);
  const tags = selected?.tags || ["positive"];

  let strategyOptions: StepOption[] = [];
  const usedIds = new Set<string>();

  for (const tag of tags) {
    const opts = MONEY_RATIONAL_MAP[tag] || MONEY_RATIONAL_MAP["positive"];
    for (const opt of opts) {
      if (!usedIds.has(opt.id)) {
        usedIds.add(opt.id);
        strategyOptions.push(opt);
      }
    }
  }

  if (strategyOptions.length === 0) {
    strategyOptions = [...MONEY_RATIONAL_MAP["positive"]];
  }

  return {
    ...baseStep,
    options: strategyOptions,
  };
}

const RESULT_CALCULATORS: Record<
  string,
  (session: TrainerSession) => TrainerResult
> = {
  "conscious-choice": calculateConsciousChoiceResult,
  "emotions-in-action": calculateEmotionsResult,
  "anti-procrastination": calculateAntiProcrastinationResult,
  "self-esteem": calculateSelfEsteemResult,
  "money-anxiety": calculateMoneyAnxietyResult,
};

export function calculateResult(session: TrainerSession): TrainerResult {
  const calculator = RESULT_CALCULATORS[session.trainerId];
  if (calculator) return calculator(session);
  return {
    title: "Результат",
    summary: "Тренажёр пройден",
    scores: session.scores,
    recommendations: [],
    insights: [],
  };
}

function calculateConsciousChoiceResult(
  session: TrainerSession
): TrainerResult {
  const clarity = session.scores["clarity"] || 0;
  const values = session.scores["values"] || 0;
  const fear = session.scores["fear"] || 0;
  const total = clarity + values - fear;

  let level: string;
  let title: string;
  let summary: string;

  if (total >= 25) {
    level = "high";
    title = "Высокая осознанность выбора";
    summary =
      "Вы хорошо понимаете свои ценности и умеете принимать взвешенные решения. Страхи не управляют вашим выбором.";
  } else if (total >= 15) {
    level = "medium";
    title = "Растущая осознанность";
    summary =
      "Вы на верном пути. Иногда сомнения и страхи влияют на решения, но вы учитесь их замечать.";
  } else {
    level = "developing";
    title = "Начало осознанного пути";
    summary =
      "Вам свойственно сомневаться в решениях. Это нормально — каждый проход тренажёра укрепляет навык.";
  }

  const recommendations: string[] = [];
  if (fear > 10)
    recommendations.push(
      "Попробуйте записать свои страхи — на бумаге они теряют силу."
    );
  if (clarity < 10)
    recommendations.push(
      "Перед важным решением выделите 10 минут на письменный разбор «за» и «против»."
    );
  if (values < 8)
    recommendations.push(
      "Составьте список 5 главных ценностей — он станет вашим компасом."
    );
  recommendations.push(
    "Повторите тренажёр через неделю, чтобы отследить динамику."
  );

  return {
    title,
    summary,
    level,
    scores: { clarity, values, fear, total },
    recommendations,
    insights: [
      `Ясность мышления: ${clarity} баллов`,
      `Опора на ценности: ${values} баллов`,
      `Влияние страхов: ${fear} баллов`,
    ],
    nextActions: [
      "Записать топ-3 решения на этой неделе",
      "Вернуться к тренажёру через 7 дней",
    ],
  };
}

function calculateEmotionsResult(
  session: TrainerSession
): TrainerResult {
  const emotionAnswer = session.answers["em-emotion"];
  const selectedEmotions: string[] = emotionAnswer
    ? Array.isArray(emotionAnswer.value)
      ? (emotionAnswer.value as string[])
      : [emotionAnswer.value as string]
    : [];

  const bodyAnswer = session.answers["em-body"];
  const bodySignals: string[] = bodyAnswer
    ? Array.isArray(bodyAnswer.value)
      ? (bodyAnswer.value as string[])
      : []
    : [];

  const thoughtAnswer = session.answers["em-thought"];
  const hasThought = !!thoughtAnswer;

  const intensityAnswer = session.answers["em-intensity"];
  const intensity =
    typeof intensityAnswer?.value === "number" ? intensityAnswer.value : 5;

  const impulseAnswer = session.answers["em-impulse"];
  const impulseId =
    typeof impulseAnswer?.value === "string" ? impulseAnswer.value : "";

  const strategyAnswer = session.answers["em-strategy"];
  const hasStrategy = !!strategyAnswer;

  const planAnswer = session.answers["em-plan"];
  const hasAction = !!planAnswer && typeof planAnswer.value === "string" && planAnswer.value.length > 3;

  const R = selectedEmotions.length > 0 ? 1 : 0;
  const B = bodySignals.length > 0 ? 1 : 0;
  const T = hasThought ? 1 : 0;
  const EA = (R + B + T) * 10;

  const C = hasStrategy ? 1 : 0;
  const A = hasAction ? 1 : 0;
  const SR = C * 20 + A * 10;

  const IMPULSE_WEIGHTS: Record<string, number> = {
    avoid: 8,
    postpone: 8,
    attack: 9,
    withdraw: 7,
    justify: 6,
    devalue: 7,
    comply: 7,
    overwork: 6,
    freeze: 7,
    act: 2,
    discuss: 3,
    "other-impulse": 5,
  };
  const impulseWeight = IMPULSE_WEIGHTS[impulseId] || 5;
  const IP = Math.round((intensity * impulseWeight) / 10);

  const rawEMI = EA + SR - IP;
  const EMI = Math.max(0, Math.min(100, rawEMI));

  let level: string;
  let title: string;
  let summary: string;

  if (EMI >= 86) {
    level = "excellent";
    title = "Высокий уровень осознанности";
    summary =
      "Вы отлично распознаёте эмоции, понимаете их источник и выбираете экологичные реакции. Продолжайте отслеживать паттерны.";
  } else if (EMI >= 71) {
    level = "high";
    title = "Зрелая саморегуляция";
    summary =
      "Вы хорошо управляете эмоциями. Импульсивные реакции редки — вы осознанно выбираете свои действия.";
  } else if (EMI >= 51) {
    level = "medium";
    title = "Средний уровень";
    summary =
      "Вы на пути к осознанности. Иногда эмоции берут верх, но вы учитесь замечать паттерны.";
  } else if (EMI >= 31) {
    level = "developing";
    title = "Нестабильная регуляция";
    summary =
      "Эмоции часто управляют вашими реакциями. Регулярная работа с тренажёром поможет увидеть закономерности.";
  } else {
    level = "beginning";
    title = "Эмоции управляют";
    summary =
      "Сейчас эмоции сильно влияют на ваши решения. Каждое прохождение тренажёра — шаг к осознанности.";
  }

  const EMOTION_LABELS: Record<string, string> = {
    fear: "Страх", anxiety: "Тревога", panic: "Паника", shame: "Стыд",
    guilt: "Вина", anger: "Злость", irritation: "Раздражение",
    resentment: "Обида", jealousy: "Ревность", envy: "Зависть",
    helplessness: "Беспомощность", disappointment: "Разочарование",
    fatigue: "Усталость", apathy: "Апатия", loneliness: "Одиночество",
    insecurity: "Неуверенность", tension: "Напряжение", overload: "Перегруз",
    joy: "Радость", interest: "Интерес", inspiration: "Вдохновение",
    excitement: "Азарт", calm: "Спокойствие", confidence: "Уверенность",
    gratitude: "Благодарность", pride: "Гордость",
    anticipation: "Предвкушение", enthusiasm: "Воодушевление",
  };

  const TRIGGER_LABELS: Record<string, string> = {
    work: "Работа", money: "Деньги", relationships: "Отношения",
    family: "Семья", "self-esteem": "Самооценка", publicity: "Публичность",
    mistake: "Ошибка", criticism: "Критика", uncertainty: "Неопределённость",
    tiredness: "Усталость", conflict: "Конфликт", comparison: "Сравнение",
    "other-trigger": "Другое",
  };

  const IMPULSE_LABELS: Record<string, string> = {
    avoid: "Избегание", postpone: "Откладывание", attack: "Нападение",
    withdraw: "Замыкание", justify: "Оправдание", devalue: "Обесценивание",
    comply: "Уступчивость", overwork: "Переработка", freeze: "Замирание",
    act: "Действие", discuss: "Обсуждение", "other-impulse": "Другое",
  };

  const emotionNames = selectedEmotions
    .map((id) => EMOTION_LABELS[id] || id)
    .join(", ");

  const triggerAnswer = session.answers["em-trigger"];
  const triggerId =
    typeof triggerAnswer?.value === "string" ? triggerAnswer.value : "";
  const triggerName = TRIGGER_LABELS[triggerId] || triggerId;

  const impulseName = IMPULSE_LABELS[impulseId] || impulseId;

  const insights: string[] = [
    `Эмоции: ${emotionNames} (интенсивность ${intensity}/10)`,
    `Триггер: ${triggerName}`,
    `Телесные сигналы: ${bodySignals.length} зон`,
    `Импульсивная реакция: ${impulseName}`,
  ];

  const recommendations: string[] = [];
  if (IP > 6)
    recommendations.push(
      "Попробуйте технику «пауза 5 секунд» перед реакцией — она снижает импульсивность."
    );
  if (EA < 20)
    recommendations.push(
      "Ведите краткий дневник эмоций: 3 раза в день фиксируйте, что чувствуете и где в теле."
    );
  if (SR < 20)
    recommendations.push(
      "Заранее выбирайте стратегию на случай сильных эмоций — это тренирует саморегуляцию."
    );
  if (intensity >= 8)
    recommendations.push(
      "При высокой интенсивности помогает телесная разрядка: прогулка, дыхание, холодная вода."
    );
  recommendations.push(
    "Повторяйте тренажёр регулярно — система покажет ваши эмоциональные паттерны."
  );

  return {
    title,
    summary,
    level,
    scores: {
      EA,
      SR,
      IP,
      EMI,
    },
    recommendations,
    insights,
    nextActions: [
      "Выполнить план действия из тренажёра",
      "Повторить через 2–3 дня для отслеживания паттернов",
    ],
  };
}

function calculateAntiProcrastinationResult(
  session: TrainerSession
): TrainerResult {
  const V = session.scores["value"] || 5;
  const C = session.scores["complexity"] || 5;
  const R = session.scores["resistance"] || 5;
  const R_after = session.scores["resistance_after"] || 5;

  const doneAnswer = session.answers["ap-done"];
  const doneId = typeof doneAnswer?.value === "string" ? doneAnswer.value : "";
  let A = 0;
  if (doneId === "done-full") A = 1;
  else if (doneId === "done-partial") A = 0.5;

  const RI = R - R_after;

  const rawSI = A * 20 + Math.max(0, RI) * 5;
  const SI = Math.round(Math.min(100, (rawSI / 70) * 100));

  const PI = Math.round(R * 4 + C * 3 - V * 2);

  const DI = A > 0 ? Math.round(A * 100) : 0;

  const rawAI = SI + DI - Math.max(0, PI);
  const AI = Math.max(0, Math.min(100, rawAI));

  let level: string;
  let title: string;
  let summary: string;

  if (AI >= 86) {
    level = "excellent";
    title = "Устойчивый человек действия";
    summary = "Вы запустили работу и довели до результата. Сопротивление не помешало вам.";
  } else if (AI >= 71) {
    level = "high";
    title = "Высокая дисциплина";
    summary = "Вы хорошо справляетесь с прокрастинацией. Продолжайте в том же темпе.";
  } else if (AI >= 51) {
    level = "medium";
    title = "Формируется привычка";
    summary = "Вы учитесь начинать через сопротивление. Каждый запуск укрепляет навык.";
  } else if (AI >= 31) {
    level = "developing";
    title = "Нестабильный запуск";
    summary = "Иногда получается начать, иногда нет. Попробуйте уменьшить шаг.";
  } else {
    level = "beginning";
    title = "Хроническая прокрастинация";
    summary = "Сопротивление пока сильнее. Но вы уже здесь — и это первый шаг.";
  }

  const REASON_LABELS: Record<string, string> = {
    "fear-fail": "Страх неудачи", "fear-judge": "Страх оценки",
    "no-energy": "Нет энергии", "no-start": "Не знаю с чего начать",
    "too-big": "Слишком большая задача", "no-plan": "Нет плана",
    "perfectionism": "Перфекционизм", "boring": "Неинтересно",
    "no-deadline": "Нет дедлайна", "no-belief": "Не верю в результат",
    "other-reason": "Другое",
  };

  const reasonAnswer = session.answers["ap-reason"];
  const reasonId = typeof reasonAnswer?.value === "string" ? reasonAnswer.value : "";
  const reasonLabel = REASON_LABELS[reasonId] || reasonId;

  const insights: string[] = [
    `Важность задачи: ${V}/10`,
    `Сложность: ${C}/10`,
    `Сопротивление до: ${R}/10 → после: ${R_after}/10 (${RI > 0 ? "−" + RI : RI === 0 ? "без изменений" : "+" + Math.abs(RI)})`,
    `Причина откладывания: ${reasonLabel}`,
    `Результат: ${doneId === "done-full" ? "выполнено полностью" : doneId === "done-partial" ? "частично" : "не выполнено"}`,
  ];

  const recommendations: string[] = [];
  if (R >= 8 && A === 0)
    recommendations.push("Попробуйте уменьшить шаг в 2 раза — задача может быть слишком большой.");
  if (RI <= 0)
    recommendations.push("Сопротивление не снизилось — попробуйте другой подход к задаче.");
  if (RI > 3)
    recommendations.push("Отличное снижение сопротивления! Продолжайте использовать метод малого шага.");
  if (PI > 40)
    recommendations.push("Высокий риск откладывания. Разбейте задачу на ещё более мелкие части.");
  if (A < 1)
    recommendations.push("Не страшно, что не доделали. Попробуйте завтра ещё меньший шаг.");
  recommendations.push("Повторяйте тренажёр ежедневно — 3 дня подряд сформируют «Запуск», 21 день — привычку.");

  return {
    title,
    summary,
    level,
    scores: { RI, SI, PI, DI, AI },
    recommendations,
    insights,
    nextActions: [
      "Повторить завтра с той же или новой задачей",
      "Зафиксировать своё наблюдение из рефлексии",
    ],
  };
}

function calculateSelfEsteemResult(
  session: TrainerSession
): TrainerResult {
  const achievementsAnswer = session.answers["se-achievements"];
  const achievements: string[] = achievementsAnswer
    ? Array.isArray(achievementsAnswer.value)
      ? (achievementsAnswer.value as string[])
      : []
    : [];
  const A = Math.min(achievements.length, 6);

  const copingAnswer = session.answers["se-coping"];
  const copingId = typeof copingAnswer?.value === "string" ? copingAnswer.value : "";

  const COPING_SCORES: Record<string, number> = {
    "cop-acted": 10,
    "cop-boundary": 10,
    "cop-mistake": 9,
    "cop-help": 8,
    "cop-postpone": 7,
    "cop-ignored": 3,
    "cop-avoided": 2,
  };
  const MRI = COPING_SCORES[copingId] || 5;

  const S = session.scores["self_value"] || 5;
  const E = session.scores["external_dependency"] || 5;

  const FOI = A * 5;
  const rawIOS = FOI + MRI + S * 4;
  const IOS = Math.round(Math.min(100, (rawIOS / 80) * 100));

  const EDI = E * 10;
  const SSI = 70;
  const rawIA = SSI - EDI;
  const IA = Math.max(0, Math.min(100, rawIA));

  const DI = 100;
  const rawIVO = IOS * 0.5 + IA * 0.3 + DI * 0.2;
  const IVO = Math.max(0, Math.min(100, Math.round(rawIVO)));

  let level: string;
  let title: string;
  let summary: string;

  if (IVO >= 86) {
    level = "excellent";
    title = "Сильная автономная личность";
    summary = "У вас крепкая внутренняя опора. Вы цените себя на основе фактов, а не чужого мнения.";
  } else if (IVO >= 71) {
    level = "high";
    title = "Зрелая внутренняя устойчивость";
    summary = "Ваша самооценка опирается на реальные действия. Продолжайте фиксировать достижения.";
  } else if (IVO >= 51) {
    level = "medium";
    title = "Формируется опора";
    summary = "Вы учитесь опираться на себя. Регулярная фиксация достижений укрепит фундамент.";
  } else if (IVO >= 31) {
    level = "developing";
    title = "Нестабильная самооценка";
    summary = "Внешнее мнение ещё сильно влияет. Каждый день с тренажёром — шаг к устойчивости.";
  } else {
    level = "beginning";
    title = "Низкая опора";
    summary = "Самооценка зависит от внешнего. Начните с малого: 3 достижения каждый день.";
  }

  const COPING_LABELS: Record<string, string> = {
    "cop-acted": "Действовал", "cop-boundary": "Защитил границы",
    "cop-mistake": "Ошибся, сделал вывод", "cop-help": "Попросил помощи",
    "cop-postpone": "Отложил осознанно", "cop-ignored": "Проигнорировал",
    "cop-avoided": "Избежал",
  };
  const copingLabel = COPING_LABELS[copingId] || copingId;

  const insights: string[] = [
    `Достижений сегодня: ${A}`,
    `Реакция на трудность: ${copingLabel} (${MRI}/10)`,
    `Самоценность: ${S}/10`,
    `Зависимость от внешнего: ${E}/10`,
  ];

  const recommendations: string[] = [];
  if (S <= 4)
    recommendations.push("Ваша самоценность сейчас снижена — это нормальный период. Фиксируйте даже мелкие достижения.");
  if (E >= 7)
    recommendations.push("Высокая зависимость от чужого мнения. Попробуйте записать: «Что я думаю о себе сам?»");
  if (copingId === "cop-avoided" || copingId === "cop-ignored")
    recommendations.push("Избегание снижает опору. Попробуйте завтра хотя бы назвать проблему вслух.");
  if (A < 3)
    recommendations.push("Старайтесь находить минимум 3 достижения — они формируют фактическую опору.");
  if (MRI >= 8)
    recommendations.push("Отличная реакция на трудность! Это укрепляет вашу внутреннюю устойчивость.");
  recommendations.push("Проходите тренажёр ежедневно — динамика IVO покажет рост вашей внутренней опоры.");

  return {
    title,
    summary,
    level,
    scores: { FOI, MRI, IOS, IA, IVO },
    recommendations,
    insights,
    nextActions: [
      "Завтра снова зафиксировать 3+ достижения",
      "Замечать моменты зависимости от чужого мнения",
    ],
  };
}

function calculateMoneyAnxietyResult(
  session: TrainerSession
): TrainerResult {
  const intensityAnswer = session.answers["ma-intensity"];
  const MA = typeof intensityAnswer?.value === "number" ? intensityAnswer.value : 5;

  const impulseAnswer = session.answers["ma-impulse"];
  const impulseId = typeof impulseAnswer?.value === "string" ? impulseAnswer.value : "";

  const IMPULSE_WEIGHTS: Record<string, number> = {
    "lower-price": 8, refuse: 9, postpone: 7, "avoid-talk": 8,
    "work-free": 9, overwork: 6, "freeze-project": 8, "do-nothing": 8,
    calculate: 2, "raise-price": 3, "discuss-terms": 3,
  };
  const impulseWeight = IMPULSE_WEIGHTS[impulseId] || 5;

  const rationalAnswer = session.answers["ma-rational"];
  const R = rationalAnswer ? 1 : 0;

  const doneAnswer = session.answers["ma-done"];
  const doneId = typeof doneAnswer?.value === "string" ? doneAnswer.value : "";
  let A = 0;
  if (doneId === "done-full") A = 1;
  else if (doneId === "done-partial") A = 0.5;

  const MAI = MA * 10;
  const MII = Math.round((MA * impulseWeight) / 10);
  const rawMRI = R * 20 + A * 20;
  const MRI_norm = Math.round(Math.min(100, (rawMRI / 40) * 100));

  const rawFSI = MRI_norm + (100 - MAI) - MII;
  const FSI = Math.max(0, Math.min(100, rawFSI));

  let level: string;
  let title: string;
  let summary: string;

  if (FSI >= 86) {
    level = "excellent";
    title = "Устойчивое денежное мышление";
    summary = "Вы управляете деньгами осознанно. Тревога не влияет на финансовые решения. Продолжайте отслеживать динамику.";
  } else if (FSI >= 71) {
    level = "high";
    title = "Уверенное управление";
    summary = "Вы хорошо справляетесь с денежной тревогой и принимаете рациональные решения.";
  } else if (FSI >= 51) {
    level = "medium";
    title = "Формируется финансовая зрелость";
    summary = "Вы на пути к финансовой устойчивости. Тревога иногда влияет на решения, но вы учитесь замечать это.";
  } else if (FSI >= 31) {
    level = "developing";
    title = "Нестабильность";
    summary = "Денежная тревога часто влияет на решения. Регулярная работа с тренажёром покажет паттерны.";
  } else {
    level = "beginning";
    title = "Тревога управляет деньгами";
    summary = "Сейчас эмоции сильно влияют на финансовые решения. Каждое прохождение — шаг к устойчивости.";
  }

  const SITUATION_LABELS: Record<string, string> = {
    shortage: "Нехватка денег", "income-growth": "Рост дохода",
    "price-raise": "Повышение цены", sales: "Продажи",
    debts: "Долги", credits: "Кредиты", investments: "Инвестиции",
    "unstable-income": "Нестабильный доход", "lost-client": "Потеря клиента",
    "big-purchase": "Большая покупка", scaling: "Масштабирование",
    "other-situation": "Другое",
  };

  const TRIGGER_LABELS: Record<string, string> = {
    "fear-loss": "Страх потери", "fear-instability": "Страх нестабильности",
    "fear-judgment": "Страх осуждения", "fear-responsibility": "Страх ответственности",
    "fear-success": "Страх успеха", comparison: "Сравнение с другими",
    insufficiency: "Чувство недостаточности", hypercontrol: "Контроль и гиперответственность",
    avoidance: "Избегание денег", "guilt-income": "Вина за доход",
    "other-trigger": "Другое",
  };

  const IMPULSE_LABELS: Record<string, string> = {
    "lower-price": "Снизить цену", refuse: "Отказаться", postpone: "Отложить",
    "avoid-talk": "Избегать обсуждения", "work-free": "Работать бесплатно",
    overwork: "Перерабатывать", "freeze-project": "Заморозить проект",
    "do-nothing": "Ничего не делать", calculate: "Идти в расчёт",
    "raise-price": "Поднять цену", "discuss-terms": "Обсудить условия",
  };

  const situationAnswer = session.answers["ma-situation"];
  const situationId = typeof situationAnswer?.value === "string" ? situationAnswer.value : "";
  const situationLabel = SITUATION_LABELS[situationId] || situationId;

  const triggerAnswer = session.answers["ma-trigger"];
  const triggerId = typeof triggerAnswer?.value === "string" ? triggerAnswer.value : "";
  const triggerLabel = TRIGGER_LABELS[triggerId] || triggerId;

  const impulseLabel = IMPULSE_LABELS[impulseId] || impulseId;

  const insights: string[] = [
    `Ситуация: ${situationLabel}`,
    `Триггер: ${triggerLabel}`,
    `Денежная тревога: ${MA}/10`,
    `Импульс: ${impulseLabel} (вес ${impulseWeight})`,
    `Готовность к действию: ${doneId === "done-full" ? "высокая" : doneId === "done-partial" ? "средняя" : "низкая"}`,
  ];

  const recommendations: string[] = [];
  if (MAI >= 80)
    recommendations.push("Тревога очень высока. Попробуйте разбить финансовое действие на ещё меньший шаг.");
  if (MII > 6)
    recommendations.push("Высокая импульсивность. Перед финансовым решением берите паузу 24 часа.");
  if (MRI_norm < 40)
    recommendations.push("Рациональных действий пока мало. Начните с одного простого шага — считать расходы.");
  if (impulseId === "lower-price" || impulseId === "work-free")
    recommendations.push("Вы склонны обесценивать свою работу. Попробуйте сравнить цену с рынком.");
  if (A === 0)
    recommendations.push("Не страшно, что не готовы к шагу. Сформулируйте его поменьше.");
  if (FSI >= 71)
    recommendations.push("Отличная финансовая зрелость. Отслеживайте динамику FSI.");
  recommendations.push("Повторяйте тренажёр регулярно — система покажет ваши денежные паттерны и рост FSI.");

  return {
    title,
    summary,
    level,
    scores: { MAI, MII, MRI: MRI_norm, FSI },
    recommendations,
    insights,
    nextActions: [
      "Выполнить финансовый шаг из тренажёра в течение 48 часов",
      "Повторить тренажёр через 3–5 дней для отслеживания динамики",
    ],
  };
}

export function completeSession(
  session: TrainerSession
): TrainerSession {
  const result = calculateResult(session);
  return {
    ...session,
    completedAt: new Date().toISOString(),
    result,
  };
}