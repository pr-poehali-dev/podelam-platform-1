import {
  TrainerScenario,
  TrainerSession,
  ScenarioStep,
  SessionAnswer,
  TrainerResult,
  TrainerId,
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
  return scenario.steps[session.currentStepIndex] || null;
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

  const step = scenario.steps.find((s) => s.id === stepId);
  if (!step) return session;

  const answer: SessionAnswer = {
    stepId,
    type: step.type,
    value,
    timestamp: new Date().toISOString(),
  };

  const newScores = { ...session.scores };

  // Calculate scores based on step type
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

  // Determine next step
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

  if (!step.options && step.nextStep) {
    const targetIdx = scenario.steps.findIndex(
      (s) => s.id === step.nextStep
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

// Result calculators for each trainer
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
  const awareness = session.scores["awareness"] || 0;
  const regulation = session.scores["regulation"] || 0;
  const triggers = session.scores["triggers"] || 0;
  const total = awareness + regulation;

  let level: string;
  let title: string;
  let summary: string;

  if (total >= 25) {
    level = "high";
    title = "Высокий эмоциональный интеллект";
    summary =
      "Вы хорошо распознаёте и управляете эмоциями. Продолжайте отслеживать паттерны.";
  } else if (total >= 15) {
    level = "medium";
    title = "Развивающийся эмоциональный интеллект";
    summary =
      "Вы учитесь замечать свои эмоции. Регулярная практика поможет улучшить саморегуляцию.";
  } else {
    level = "developing";
    title = "Начало эмоциональной осознанности";
    summary =
      "Эмоции часто захватывают вас. Тренажёр поможет научиться их замечать до того, как они повлияют на действия.";
  }

  const recommendations: string[] = [];
  if (awareness < 10)
    recommendations.push(
      "Ведите краткий дневник эмоций: 3 раза в день фиксируйте, что чувствуете."
    );
  if (regulation < 10)
    recommendations.push(
      "Освойте технику «пауза 5 секунд» перед реакцией на раздражитель."
    );
  if (triggers > 8)
    recommendations.push(
      "Составьте карту триггеров: что вызывает сильные реакции."
    );
  recommendations.push(
    "Повторяйте тренажёр каждые 2 недели для отслеживания динамики."
  );

  return {
    title,
    summary,
    level,
    scores: { awareness, regulation, triggers, total },
    recommendations,
    insights: [
      `Осознанность эмоций: ${awareness} баллов`,
      `Навык саморегуляции: ${regulation} баллов`,
      `Чувствительность к триггерам: ${triggers} баллов`,
    ],
  };
}

function calculateAntiProcrastinationResult(
  session: TrainerSession
): TrainerResult {
  const motivation = session.scores["motivation"] || 0;
  const resistance = session.scores["resistance"] || 0;
  const action = session.scores["action"] || 0;
  const total = motivation + action - resistance;

  let level: string;
  let title: string;
  let summary: string;

  if (total >= 20) {
    level = "high";
    title = "Мастер малых шагов";
    summary =
      "Вы отлично справляетесь с прокрастинацией. Метод малых шагов — ваш надёжный инструмент.";
  } else if (total >= 10) {
    level = "medium";
    title = "На пути к действию";
    summary =
      "Иногда сопротивление побеждает, но вы учитесь разбивать задачи на маленькие шаги.";
  } else {
    level = "developing";
    title = "Первый малый шаг сделан";
    summary =
      "Прокрастинация пока сильна, но сам факт прохождения тренажёра — уже победа. Каждый день выбирайте один маленький шаг.";
  }

  const recommendations: string[] = [];
  if (resistance > 10)
    recommendations.push(
      "Когда хочется отложить — сделайте только 2 минуты. Обычно этого хватает, чтобы втянуться."
    );
  if (motivation < 8)
    recommendations.push(
      "Свяжите задачу с тем, что для вас важно. «Зачем?» сильнее «Надо»."
    );
  if (action < 8)
    recommendations.push(
      "Запланируйте конкретное время и место для важной задачи."
    );
  recommendations.push(
    "Повторяйте тренажёр еженедельно для формирования привычки."
  );

  return {
    title,
    summary,
    level,
    scores: { motivation, resistance, action, total },
    recommendations,
    insights: [
      `Мотивация: ${motivation} баллов`,
      `Сопротивление: ${resistance} баллов`,
      `Готовность к действию: ${action} баллов`,
    ],
    nextActions: [
      "Выбрать одну задачу и сделать первые 2 минуты сегодня",
    ],
  };
}

function calculateSelfEsteemResult(
  session: TrainerSession
): TrainerResult {
  const selfWorth = session.scores["self-worth"] || 0;
  const innerCritic = session.scores["inner-critic"] || 0;
  const boundaries = session.scores["boundaries"] || 0;
  const total = selfWorth + boundaries - innerCritic;

  let level: string;
  let title: string;
  let summary: string;

  if (total >= 20) {
    level = "high";
    title = "Устойчивая самооценка";
    summary =
      "У вас крепкий внутренний фундамент. Вы цените себя и умеете отстаивать границы.";
  } else if (total >= 10) {
    level = "medium";
    title = "Растущая внутренняя опора";
    summary =
      "Внутренний критик ещё силён, но вы учитесь опираться на себя. Продолжайте!";
  } else {
    level = "developing";
    title = "Начало пути к себе";
    summary =
      "Самооценка пока неустойчива — это нормально. Регулярная работа с тренажёром поможет укрепить внутреннюю опору.";
  }

  const recommendations: string[] = [];
  if (innerCritic > 10)
    recommendations.push(
      "Замечайте внутреннего критика и спрашивайте: «Я бы сказал это другу?»"
    );
  if (selfWorth < 10)
    recommendations.push(
      "Каждый вечер записывайте 3 вещи, за которые вы себе благодарны."
    );
  if (boundaries < 8)
    recommendations.push(
      "Начните с маленьких «нет» — они тренируют мышцу границ."
    );
  recommendations.push(
    "Проходите тренажёр каждые 2 недели — динамика покажет рост."
  );

  return {
    title,
    summary,
    level,
    scores: {
      "self-worth": selfWorth,
      "inner-critic": innerCritic,
      boundaries,
      total,
    },
    recommendations,
    insights: [
      `Самоценность: ${selfWorth} баллов`,
      `Внутренний критик: ${innerCritic} баллов`,
      `Личные границы: ${boundaries} баллов`,
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
    title = "Здоровое отношение к деньгам";
    summary =
      "Вы умеете работать с финансовой тревогой и принимать денежные решения без стресса.";
  } else if (total >= 10) {
    level = "medium";
    title = "Денежная осознанность растёт";
    summary =
      "Тревога о деньгах ещё влияет на решения, но вы начинаете менять паттерны.";
  } else {
    level = "developing";
    title = "Первый шаг к финансовому спокойствию";
    summary =
      "Деньги вызывают сильное напряжение. Тренажёр поможет разобраться в корнях тревоги и начать менять установки.";
  }

  const recommendations: string[] = [];
  if (anxiety > 10)
    recommendations.push(
      "Запишите свой главный денежный страх и спросите: «Что самое худшее может случиться?»"
    );
  if (beliefs < 8)
    recommendations.push(
      "Запишите 5 убеждений о деньгах из детства — осознание меняет установки."
    );
  if (strategy < 8)
    recommendations.push(
      "Создайте простой финансовый план на месяц — конкретика снижает тревогу."
    );
  recommendations.push(
    "Для предпринимателей рекомендуем годовой доступ для глубокой проработки."
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
      `Денежная стратегия: ${strategy} баллов`,
    ],
    nextActions: [
      "Записать 3 денежных убеждения из семьи",
      "Повторить через 2 недели",
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
