// ─── ТИПЫ ────────────────────────────────────────────────────────────────────

export type Step = {
  index: number;
  text: string;
  x: number;
  y: number;
};

export type BotPhase =
  | "welcome"
  | "context"
  | "strength"
  | "weakness"
  | "steps_intro"
  | "step_text"
  | "step_x"
  | "step_y"
  | "step_more"
  | "break_point"
  | "break_manual"
  | "insight"
  | "additional_strength"
  | "recalc"
  | "result"
  | "done";

export type BotState = {
  phase: BotPhase;
  selectedContext: string;
  mainStrength: string[];
  mainWeakness: string;
  steps: Step[];
  currentStepIndex: number;
  breakStep: number;
  additionalStrength: string[];
  psychProfile: string;
};

export type Message = {
  id: number;
  from: "bot" | "user";
  text: string;
  widget?: Widget;
};

export type Widget =
  | { type: "choices"; options: string[] }
  | { type: "multi_choices"; options: string[]; max: number }
  | { type: "slider"; min: number; max: number; label: string }
  | { type: "text_input"; placeholder: string }
  | { type: "chart"; steps: Step[]; breakStep: number; newY?: number }
  | { type: "confirm" };

// ─── ДАННЫЕ ───────────────────────────────────────────────────────────────────

export const CONTEXTS = [
  "Новая работа",
  "Попытка сменить профессию",
  "Запуск проекта",
  "Обучение новому",
  "Публичное выступление",
  "Попытка начать бизнес",
  "Повышение",
  "Творческий проект",
  "Спорт / дисциплина",
  "Отношения",
  "Свой вариант",
];

export const STRENGTHS = [
  "Ответственность",
  "Упорство",
  "Креативность",
  "Аналитическое мышление",
  "Общительность",
  "Самостоятельность",
  "Быстрое обучение",
  "Организованность",
  "Энергичность",
  "Стратегическое мышление",
  "Дисциплина",
  "Смелость",
  "Инициативность",
  "Эмпатия",
  "Стрессоустойчивость",
  "Свой вариант",
];

export const WEAKNESSES = [
  "Страх ошибки",
  "Страх осуждения",
  "Страх нестабильности",
  "Прокрастинация",
  "Перфекционизм",
  "Синдром самозванца",
  "Быстрое выгорание",
  "Тревожность",
  "Неуверенность",
  "Потеря мотивации",
  "Страх отказа",
  "Страх критики",
  "Самосаботаж",
  "Импульсивность",
  "Усталость",
  "Свой вариант",
];

// ─── НАЧАЛЬНОЕ СОСТОЯНИЕ ──────────────────────────────────────────────────────

export const INITIAL_STATE: BotState = {
  phase: "welcome",
  selectedContext: "",
  mainStrength: [],
  mainWeakness: "",
  steps: [],
  currentStepIndex: 0,
  breakStep: -1,
  additionalStrength: [],
  psychProfile: "",
};

// ─── ЛОГИКА ТОЧКИ СРЫВА ───────────────────────────────────────────────────────

export function detectBreakPoint(steps: Step[]): number {
  for (let i = 0; i < steps.length; i++) {
    const s = steps[i];
    if (s.y >= 7) {
      if (i === steps.length - 1) return i;
      if (steps[i + 1].x < s.x * 0.5) return i;
      return i;
    }
  }
  for (let i = 1; i < steps.length; i++) {
    if (steps[i].x < steps[i - 1].x * 0.5) return i;
  }
  return -1;
}

// ─── ПЕРЕРАСЧЁТ Y ─────────────────────────────────────────────────────────────

export function recalcY(originalY: number, weakness: string, additionalCount: number): number {
  let reduction = 0;

  if (additionalCount === 1) {
    if (weakness.includes("страх") || weakness.toLowerCase().includes("самозванца") || weakness.includes("Синдром")) {
      reduction = 2;
    } else if (weakness.includes("выгорание") || weakness.includes("Быстрое выгорание")) {
      reduction = 1;
    } else {
      reduction = 2;
    }
  } else if (additionalCount >= 2) {
    reduction = 3;
  }

  return Math.max(0, originalY - reduction);
}

// ─── ПСИХОЛОГИЧЕСКИЙ ПРОФИЛЬ ──────────────────────────────────────────────────

export function detectProfile(steps: Step[]): string {
  if (steps.length === 0) return "";

  const avgY = steps.reduce((s, st) => s + st.y, 0) / steps.length;
  const avgX = steps.reduce((s, st) => s + st.x, 0) / steps.length;

  const yValues = steps.map((s) => s.y);
  const maxY = Math.max(...yValues);
  const minY = Math.min(...yValues);
  const ySpread = maxY - minY;

  if (avgX >= 7 && avgY >= 7) return "ambitious_anxious";
  if (avgX <= 4) return "low_belief";
  if (ySpread >= 5) return "fear_of_evaluation";
  if (avgY >= 5 && ySpread <= 3) return "chronic_anxiety";
  return "balanced";
}

export const PROFILE_TEXTS: Record<string, { title: string; desc: string }> = {
  ambitious_anxious: {
    title: "Амбициозный, но тревожный",
    desc: "Ты двигаешься смело и видишь высокие цели — но внутреннее напряжение растёт вместе с прогрессом. Тебе важно научиться выдерживать собственный рост.",
  },
  low_belief: {
    title: "Сниженная вера в успех",
    desc: "С самого начала ты не верил в результат. Это не слабость — это сигнал: нужна точка опоры ещё до первого шага.",
  },
  fear_of_evaluation: {
    title: "Страх оценки",
    desc: "Тревога резко скачет — обычно в моменты, когда тебя могут увидеть или оценить. Это классический триггер срыва.",
  },
  chronic_anxiety: {
    title: "Хроническая тревожность",
    desc: "Напряжение нарастало постепенно и ровно. Не один взрыв — а долгий фон, который в итоге забрал ресурс.",
  },
  balanced: {
    title: "Сбалансированный тип",
    desc: "Ты двигался устойчиво. Срыв произошёл не из-за системной проблемы, а из-за конкретной точки. Это легче всего исправить.",
  },
};

// ─── ПРИМЕНЕНИЕ ОТВЕТА → НОВАЯ ФАЗА ─────────────────────────────────────────

export function applyAnswer(state: BotState, answer: string | number | string[]): BotState {
  const s = { ...state, steps: [...state.steps] };

  switch (s.phase) {
    case "welcome":
      s.phase = "context";
      break;

    case "context":
      s.selectedContext = String(answer);
      s.phase = "strength";
      break;

    case "strength":
      s.mainStrength = Array.isArray(answer) ? answer : [String(answer)];
      s.phase = "weakness";
      break;

    case "weakness":
      s.mainWeakness = String(answer);
      s.phase = "steps_intro";
      break;

    case "steps_intro":
      s.phase = "step_text";
      s.currentStepIndex = 0;
      break;

    case "step_text": {
      const idx = s.currentStepIndex;
      s.steps[idx] = { index: idx + 1, text: String(answer), x: 0, y: 0 };
      s.phase = "step_x";
      break;
    }

    case "step_x": {
      const idx = s.currentStepIndex;
      s.steps[idx] = { ...s.steps[idx], x: Number(answer) };
      s.phase = "step_y";
      break;
    }

    case "step_y": {
      const idx = s.currentStepIndex;
      s.steps[idx] = { ...s.steps[idx], y: Number(answer) };
      s.currentStepIndex = idx + 1;
      if (idx + 1 < 10) {
        s.phase = "step_more";
      } else {
        s.phase = "break_point";
        s.breakStep = detectBreakPoint(s.steps);
      }
      break;
    }

    case "step_more": {
      if (String(answer) === "Добавить ещё шаг" && s.currentStepIndex < 10) {
        s.phase = "step_text";
      } else {
        s.phase = "break_point";
        s.breakStep = detectBreakPoint(s.steps);
      }
      break;
    }

    case "break_point": {
      const ans = String(answer);
      if (ans === "Да, это он" || ans === "Определить автоматически") {
        if (s.breakStep === -1) {
          s.breakStep = detectBreakPoint(s.steps);
        }
        if (s.breakStep === -1) {
          s.phase = "break_manual";
        } else {
          s.phase = "insight";
          s.psychProfile = detectProfile(s.steps);
        }
      } else {
        s.phase = "break_manual";
      }
      break;
    }

    case "break_manual": {
      const manualStep = parseInt(String(answer)) - 1;
      s.breakStep = Math.max(0, Math.min(manualStep, s.steps.length - 1));
      s.phase = "insight";
      s.psychProfile = detectProfile(s.steps);
      break;
    }

    case "insight":
      s.phase = "additional_strength";
      break;

    case "additional_strength":
      s.additionalStrength = Array.isArray(answer) ? answer : [String(answer)];
      s.phase = "recalc";
      break;

    case "recalc":
      s.phase = "result";
      break;

    case "result":
      s.phase = "done";
      break;

    default:
      break;
  }

  return s;
}