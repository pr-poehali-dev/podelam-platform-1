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
  const beliefs = session.scores["beliefs"] || 0;
  const anxiety = session.scores["anxiety"] || 0;
  const strategy = session.scores["strategy"] || 0;
  const total = beliefs + strategy - anxiety;

  let level: string;
  let title: string;
  let summary: string;

  if (total >= 20) {
    level = "high";
    title = "Финансовое спокойствие";
    summary =
      "У вас здоровое отношение к деньгам. Тревога минимальна, стратегия выстроена.";
  } else if (total >= 10) {
    level = "medium";
    title = "На пути к финансовому спокойствию";
    summary =
      "Денежная тревога ещё присутствует, но вы работаете над стратегией и убеждениями.";
  } else {
    level = "developing";
    title = "Начало работы с денежной тревогой";
    summary =
      "Финансовые вопросы вызывают сильное напряжение. Тренажёр поможет выстроить здоровое отношение.";
  }

  const recommendations: string[] = [];
  if (anxiety > 10)
    recommendations.push(
      "Замечайте моменты денежной тревоги — осознание снижает её силу."
    );
  if (beliefs < 10)
    recommendations.push(
      "Запишите 3 родительских установки о деньгах и проверьте: они ваши?"
    );
  if (strategy < 8)
    recommendations.push(
      "Начните с простого: фиксируйте доходы и расходы 1 неделю."
    );
  recommendations.push(
    "Повторяйте тренажёр ежемесячно для отслеживания прогресса."
  );

  return {
    title,
    summary,
    level,
    scores: { beliefs, anxiety, strategy, total },
    recommendations,
    insights: [
      `Денежные убеждения: ${beliefs} баллов`,
      `Финансовая тревога: ${anxiety} баллов`,
      `Стратегическое мышление: ${strategy} баллов`,
    ],
    nextActions: [
      "Записать 3 главных страха о деньгах",
      "Составить план расходов на неделю",
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