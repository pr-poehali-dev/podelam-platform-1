import {
  Direction,
  PLANS,
  CHECKPOINTS,
  DIRECTION_NAMES,
  WeekPlan,
  MonthPlan,
  StrategyPlan,
} from "./planBotData";

// ─── ТИПЫ ─────────────────────────────────────────────────────────────────────

export type Strategy = "intensive" | "balanced" | "soft";

export type UserInputs = {
  direction: Direction;
  energy_level: number;
  motivation_level: number;
  confidence_level: number;
  time_per_week: number;
  income_target: number;
  current_income: number;
};

export type TestProfile = {
  careerTopType?: string;
  careerTopTypeName?: string;
  careerProfessions?: string[];
  psychProfileName?: string;
  psychTopSegments?: { key: string; name: string; pct: number }[];
  psychMotivations?: { key: string; name: string; pct: number }[];
  psychProfessions?: { name: string; match: number }[];
};

export type SavedPlanEntry = {
  date: string;
  plan: FinalPlan;
  testProfile?: TestProfile;
};

function getUserEmail(): string {
  try { return JSON.parse(localStorage.getItem("pdd_user") || "{}").email || ""; } catch { return ""; }
}

export function PLANS_KEY() { return `plan_history_${getUserEmail()}`; }

export function getSavedPlans(): SavedPlanEntry[] {
  try { return JSON.parse(localStorage.getItem(PLANS_KEY()) || "[]"); } catch { return []; }
}

export function savePlanEntry(plan: FinalPlan, testProfile?: TestProfile): void {
  const history = getSavedPlans();
  history.push({ date: new Date().toISOString(), plan, testProfile });
  localStorage.setItem(PLANS_KEY(), JSON.stringify(history));
}

export function loadTestProfile(): TestProfile {
  const email = getUserEmail();
  const profile: TestProfile = {};

  try {
    const careerRaw = localStorage.getItem(`career_result_${email}`);
    if (careerRaw) {
      const results = JSON.parse(careerRaw);
      const latest = Array.isArray(results) ? results[0] : results;
      if (latest) {
        profile.careerTopType = latest.topType;
        profile.careerTopTypeName = latest.topTypeName;
        profile.careerProfessions = latest.professions;
      }
    }
  } catch { /* ignore */ }

  try {
    const psychRaw = localStorage.getItem(`psych_result_${email}`);
    if (psychRaw) {
      const psych = JSON.parse(psychRaw);
      profile.psychProfileName = psych.profileName;
      profile.psychTopSegments = psych.topSegs;
      profile.psychMotivations = psych.topMotivations;
      profile.psychProfessions = psych.professions;
    }
  } catch { /* ignore */ }

  return profile;
}

export function suggestDirection(profile: TestProfile): Direction | null {
  const segToDir: Record<string, Direction> = {
    creative: "creative",
    business: "sales",
    analytics: "online",
    communication: "soft",
    education: "soft",
    management: "sales",
    practical: "body",
    help_people: "soft",
    research: "online",
    freedom: "online",
  };

  const careerToDir: Record<string, Direction> = {
    realistic: "body",
    investigative: "online",
    artistic: "creative",
    social: "soft",
    enterprising: "sales",
    conventional: "online",
  };

  if (profile.psychTopSegments?.length) {
    const topSeg = profile.psychTopSegments[0].key;
    if (segToDir[topSeg]) return segToDir[topSeg];
  }

  if (profile.careerTopType) {
    if (careerToDir[profile.careerTopType]) return careerToDir[profile.careerTopType];
  }

  return null;
}

export function formatTestInsight(profile: TestProfile): string {
  const parts: string[] = [];

  if (profile.psychProfileName) {
    parts.push(`**Ваш психологический профиль:** ${profile.psychProfileName}`);
  }
  if (profile.psychTopSegments?.length) {
    const top3 = profile.psychTopSegments.slice(0, 3).map(s => s.name).join(", ");
    parts.push(`**Сильные стороны:** ${top3}`);
  }
  if (profile.psychMotivations?.length) {
    const top2 = profile.psychMotivations.slice(0, 2).map(m => m.name).join(", ");
    parts.push(`**Мотивация:** ${top2}`);
  }
  if (profile.careerTopTypeName) {
    parts.push(`**Тип личности (тест профессий):** ${profile.careerTopTypeName}`);
  }
  if (profile.careerProfessions?.length) {
    parts.push(`**Рекомендованные профессии:** ${profile.careerProfessions.slice(0, 4).join(", ")}`);
  }

  return parts.join("\n");
}

export type PlanBotStep =
  | "welcome"
  | "ask_direction"
  | "ask_energy"
  | "ask_motivation"
  | "ask_confidence"
  | "ask_time"
  | "ask_income_target"
  | "ask_current_income"
  | "building"
  | "report";

export type PlanBotState = {
  step: PlanBotStep;
  inputs: Partial<UserInputs>;
  readiness_index: number;
  strategy: Strategy;
};

export const INITIAL_PLAN_STATE: PlanBotState = {
  step: "welcome",
  inputs: {},
  readiness_index: 0,
  strategy: "balanced",
};

export type Message = {
  id: number;
  from: "bot" | "user";
  text: string;
  widget?: PlanWidget;
};

export type PlanWidget =
  | { type: "button_list"; options: string[] }
  | { type: "slider"; min: number; max: number; label: string; key: keyof UserInputs }
  | { type: "number_input"; label: string; placeholder: string; key: keyof UserInputs };

// ─── АЛГОРИТМ РАСЧЁТА ─────────────────────────────────────────────────────────

export function calcReadinessIndex(energy: number, motivation: number, confidence: number): number {
  return Math.round((energy + motivation + confidence) / 3);
}

export function defineStrategy(readiness: number): Strategy {
  if (readiness >= 8) return "intensive";
  if (readiness >= 5) return "balanced";
  return "soft";
}

export function strategyLabel(s: Strategy): string {
  return s === "intensive" ? "Интенсивная" : s === "balanced" ? "Сбалансированная" : "Мягкий вход";
}

export function calcGapPercent(income_target: number, current_income: number): number {
  if (income_target <= 0) return 100;
  return ((income_target - current_income) / income_target) * 100;
}

// ─── ПОСТРОЕНИЕ ПЛАНА ─────────────────────────────────────────────────────────

export type FinalPlan = {
  direction: Direction;
  directionName: string;
  strategy: Strategy;
  strategyName: string;
  readiness_index: number;
  time_per_week: number;
  income_target: number;
  current_income: number;
  gap_percent: number;
  lowTimeNote: boolean;
  highTimeBonus: boolean;
  activeSearchNote: boolean;
  scalingNote: boolean;
  lowReadinessNote: boolean;
  months: [MonthPlan, MonthPlan, MonthPlan];
  checkpoints: typeof CHECKPOINTS[Direction];
};

export function buildPlan(inputs: UserInputs): FinalPlan {
  const {
    direction,
    energy_level,
    motivation_level,
    confidence_level,
    time_per_week,
    income_target,
    current_income,
  } = inputs;

  const readiness_index = calcReadinessIndex(energy_level, motivation_level, confidence_level);
  const strategy = defineStrategy(readiness_index);
  const plan: StrategyPlan = PLANS[direction][strategy];
  const gap_percent = calcGapPercent(income_target, current_income);

  const lowTimeNote = time_per_week < 7;
  const highTimeBonus = time_per_week > 20;
  const activeSearchNote = gap_percent > 70;
  const scalingNote = gap_percent < 30;
  const lowReadinessNote = readiness_index <= 4;

  // Копируем план (без мутации)
  const months: [MonthPlan, MonthPlan, MonthPlan] = plan.map((month, mi) => ({
    ...month,
    weeks: month.weeks.map((week, wi) => {
      let tasks = [...week.tasks];

      // Сокращение задач если мало времени
      if (lowTimeNote) {
        tasks = tasks.slice(0, Math.ceil(tasks.length * 0.7));
      }

      // Блок "Активный поиск клиентов" в мес. 2 и 3
      if (activeSearchNote && mi >= 1 && wi === 3) {
        tasks = [...tasks, "🔍 Активный поиск клиентов: 5 новых обращений в неделю", "🔍 Участие в 1 тематическом мероприятии или сообществе"];
      }

      // Блок "Повышение чека" если gap маленький
      if (scalingNote && mi >= 1 && wi === 3) {
        tasks = [...tasks, "📈 Поднять цену на 20–30% для новых клиентов", "📈 Предложить текущим клиентам расширенный пакет"];
      }

      return { ...week, tasks };
    }) as [WeekPlan, WeekPlan, WeekPlan, WeekPlan],

    // Блок "Ускоренное масштабирование" в 3 мес если много времени
    title: mi === 2 && highTimeBonus
      ? `${month.title} (+ Ускоренное масштабирование)`
      : month.title,
  })) as [MonthPlan, MonthPlan, MonthPlan];

  return {
    direction,
    directionName: DIRECTION_NAMES[direction],
    strategy,
    strategyName: strategyLabel(strategy),
    readiness_index,
    time_per_week,
    income_target,
    current_income,
    gap_percent,
    lowTimeNote,
    highTimeBonus,
    activeSearchNote,
    scalingNote,
    lowReadinessNote,
    months,
    checkpoints: CHECKPOINTS[direction],
  };
}

// ─── ФОРМАТИРОВАНИЕ ОТЧЁТА В MARKDOWN ─────────────────────────────────────────

export function formatPlanAsMarkdown(plan: FinalPlan, testProfile?: TestProfile): string {
  const lines: string[] = [];

  lines.push(`# Персональный план развития на 3 месяца`);
  lines.push(`\n## Стратегия: ${plan.strategyName}`);
  lines.push(`**Направление:** ${plan.directionName}`);
  lines.push(`**Индекс готовности:** ${plan.readiness_index}/10`);

  if (testProfile) {
    const insight = formatTestInsight(testProfile);
    if (insight) {
      lines.push(`\n---\n## На основе ваших тестов\n`);
      lines.push(insight);
    }
  }

  if (plan.lowReadinessNote) {
    lines.push(`\n> ⚠️ Рекомендуется начать с восстановления энергии и дисциплины. План построен с постепенной нагрузкой.`);
  }
  if (plan.lowTimeNote) {
    lines.push(`\n> 🕐 Объём адаптирован под доступное время (${plan.time_per_week} ч/нед).`);
  }
  if (plan.highTimeBonus) {
    lines.push(`\n> ⚡ Добавлен блок ускоренного масштабирования в 3-й месяц (${plan.time_per_week} ч/нед доступно).`);
  }
  if (plan.activeSearchNote) {
    lines.push(`\n> 🎯 Добавлен блок "Активный поиск клиентов" — разрыв с целью по доходу > 70%.`);
  }
  if (plan.scalingNote) {
    lines.push(`\n> 📈 Добавлен блок "Повышение чека / масштабирование" — ты уже близко к цели.`);
  }

  plan.months.forEach((month, mi) => {
    lines.push(`\n---\n## Месяц ${mi + 1} — ${month.title}`);
    month.weeks.forEach((week, wi) => {
      lines.push(`\n**Неделя ${mi * 4 + wi + 1}: ${week.focus}**`);
      week.tasks.forEach((task) => lines.push(`• ${task}`));
    });
  });

  lines.push(`\n---`);
  lines.push(`\n## Контрольные точки`);
  plan.checkpoints.forEach((cp) => {
    lines.push(`\n**Неделя ${cp.week}: ${cp.title}**`);
    cp.criteria.forEach((c) => lines.push(`✓ ${c}`));
  });

  lines.push(`\n---`);
  lines.push(`\n*Рекомендуется пересматривать план каждые 4 недели на основе фактических результатов.*`);

  return lines.join("\n");
}