export type Stage = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export type Phase =
  | "intro"
  | "context"
  | "achievements"
  | "achievements_follow"
  | "actions"
  | "actions_follow"
  | "emotions"
  | "emotion_trigger"
  | "energy"
  | "stress"
  | "difficulties"
  | "difficulty_follow"
  | "insights"
  | "insight_follow"
  | "gratitude"
  | "finishing"
  | "done";

export type InputMode = "text" | "buttons" | "chips" | "slider" | "none";

export type Message = {
  id: number;
  from: "bot" | "user";
  text: string;
  inputMode?: InputMode;
  buttons?: string[];
  chips?: { label: string; group: string }[];
  sliderMin?: number;
  sliderMax?: number;
  sliderLabel?: string;
};

export type EmotionRecord = { emotion: string; trigger: string };

export type JournalEntry = {
  date: string;
  context_area: string;
  achievements: string[];
  actions: string[];
  emotions: EmotionRecord[];
  body_state: string[];
  difficulties: string[];
  insights: string[];
  gratitude: string[];
  energy_level: number;
  stress_level: number;
  completion_stage: number;
  report: string;
};

function getUserEmail(): string {
  try { return JSON.parse(localStorage.getItem("pdd_user") || "{}").email || ""; } catch { return ""; }
}
export function CHAT_KEY() { return `diary_chat_${getUserEmail()}`; }
export function ENTRIES_KEY() { return `diary_entries_${getUserEmail()}`; }

export const CONTEXT_AREAS = [
  "Работа",
  "Переход в новую деятельность",
  "Обучение",
  "Проект",
  "Финансы",
  "Отношения",
  "Саморазвитие",
  "Эмоциональное состояние",
];

export const EMOTIONS_POSITIVE = [
  "Радость", "Интерес", "Воодушевление", "Спокойствие", "Уверенность",
  "Благодарность", "Гордость", "Лёгкость", "Удовлетворение", "Вдохновение",
  "Надежда", "Любопытство", "Смелость",
];

export const EMOTIONS_NEUTRAL = [
  "Усталость", "Задумчивость", "Сдержанность", "Сосредоточенность", "Отстранённость",
];

export const EMOTIONS_NEGATIVE = [
  "Тревога", "Страх", "Раздражение", "Злость", "Стыд", "Вина", "Обида",
  "Разочарование", "Апатия", "Бессилие", "Перегрузка", "Растерянность",
  "Давление", "Неуверенность", "Сомнение",
];

export const ALL_EMOTIONS_CHIPS = [
  ...EMOTIONS_POSITIVE.map(e => ({ label: e, group: "positive" })),
  ...EMOTIONS_NEUTRAL.map(e => ({ label: e, group: "neutral" })),
  ...EMOTIONS_NEGATIVE.map(e => ({ label: e, group: "negative" })),
];

const ACHIEVEMENT_FOLLOWUPS = [
  "Почему это важно для вас?",
  "Что в этом было самым сложным?",
  "Что вы сделали правильно?",
  "Какая ваша сильная сторона помогла?",
  "Чем вы гордитесь в этом моменте?",
];

const ACTIONS_FOLLOWUPS = [
  "Что продвинуло вас ближе к цели?",
  "Было ли что-то сделано «через сопротивление»?",
  "Что заняло больше энергии, чем ожидалось?",
];

const DIFFICULTY_FOLLOWUPS = [
  "Что именно вызвало сложность?",
  "Это внешняя причина или внутренняя?",
  "Повторяется ли это?",
];

const INSIGHT_FOLLOWUPS = [
  "Что вы поняли о себе?",
  "Что стоит изменить?",
  "Что нужно сохранить?",
  "Где вы недооценили себя?",
];

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function getAchievementFollowup(): string {
  return randomFrom(ACHIEVEMENT_FOLLOWUPS);
}

export function getActionsFollowup(): string {
  return randomFrom(ACTIONS_FOLLOWUPS);
}

export function getDifficultyFollowup(): string {
  return randomFrom(DIFFICULTY_FOLLOWUPS);
}

export function getInsightFollowup(): string {
  return randomFrom(INSIGHT_FOLLOWUPS);
}

export function stageLabel(stage: number): string {
  const labels: Record<number, string> = {
    1: "Контекст",
    2: "Достижения",
    3: "Действия",
    4: "Эмоции",
    5: "Энергия и стресс",
    6: "Сложности",
    7: "Осознания",
    8: "Благодарность",
  };
  return labels[stage] || "";
}

export function buildReport(entry: Omit<JournalEntry, "report" | "date">): string {
  const lines: string[] = [];

  lines.push("**Итоги дня**\n");

  if (entry.context_area) {
    lines.push(`Сфера: **${entry.context_area}**\n`);
  }

  if (entry.achievements.length >= 3) {
    lines.push("Сегодня вы сделали больше, чем вам кажется.");
  } else if (entry.achievements.length === 0 && entry.completion_stage >= 2) {
    lines.push("Даже если день был сложным, сам факт анализа — уже шаг вперёд.");
  } else if (entry.achievements.length > 0) {
    lines.push(`Вы зафиксировали ${entry.achievements.length} ${entry.achievements.length === 1 ? "достижение" : "достижения"} — это важно.`);
  }

  if (entry.actions.length > 0) {
    lines.push(`Конкретных шагов за день: ${entry.actions.length}.`);
  }

  if (entry.emotions.length > 0) {
    lines.push("");
    const emotionNames = entry.emotions.map(e => e.emotion);
    const posCount = emotionNames.filter(e => EMOTIONS_POSITIVE.includes(e)).length;
    const negCount = emotionNames.filter(e => EMOTIONS_NEGATIVE.includes(e)).length;

    lines.push(`Эмоции: ${emotionNames.join(", ")}`);

    if (emotionNames.length > 0) {
      if (negCount > posCount && negCount > emotionNames.length / 2) {
        lines.push("\nВы прожили напряжённый день. Это не слабость — это нагрузка.");
      } else if (posCount > negCount && posCount > emotionNames.length / 2) {
        lines.push("\nВы движетесь в ресурсном состоянии.");
      } else if (posCount > 0 && negCount > 0) {
        lines.push("\nВы видите и светлые, и тёмные стороны — это зрелость.");
      }
    }
  }

  if (entry.energy_level > 0 || entry.stress_level > 0) {
    lines.push("");
    lines.push(`Энергия: ${entry.energy_level}/10 · Стресс: ${entry.stress_level}/10`);

    if (entry.energy_level <= 3 && entry.stress_level >= 7) {
      lines.push("\nНизкая энергия + высокий стресс. Организм сигнализирует: нужно восстановление. Позвольте себе отдых — это не слабость, а забота о себе.");
    } else if (entry.energy_level >= 7 && entry.stress_level >= 7) {
      lines.push("\nВысокая энергия при высоком стрессе — будьте осторожны. Такой режим может привести к выгоранию. Запланируйте паузу.");
    } else if (entry.energy_level >= 7 && entry.stress_level <= 3) {
      lines.push("\nОтличное сочетание: много энергии и мало стресса. Это ваш оптимальный режим — запомните, что к нему привело.");
    } else if (entry.energy_level <= 3 && entry.stress_level <= 3) {
      lines.push("\nМало энергии и мало стресса — возможно, не хватает стимулов. Попробуйте добавить что-то новое или вдохновляющее в завтрашний день.");
    }
  }

  if (entry.difficulties.length > 0) {
    lines.push("");
    lines.push(`Сложности: ${entry.difficulties.length}`);

    const allEntries = getStoredEntries();
    if (allEntries.length >= 3) {
      const recentDiffs = allEntries.slice(-7).flatMap(e => e.difficulties.map(d => d.toLowerCase()));
      for (const diff of entry.difficulties) {
        const count = recentDiffs.filter(d => d.includes(diff.toLowerCase().slice(0, 10))).length;
        if (count >= 3) {
          lines.push(`\nСложность «${diff.slice(0, 40)}» повторяется ${count} раз за последние записи — это системный барьер. Стоит разобрать глубже.`);
          break;
        }
      }
    }
  }

  if (entry.insights.length > 0) {
    lines.push("");
    lines.push("**Ваши осознания:**");
    entry.insights.forEach(ins => lines.push(`· ${ins}`));
  }

  if (entry.gratitude.length > 0) {
    lines.push("");
    lines.push("**Благодарность себе:**");
    entry.gratitude.forEach(g => lines.push(`· ${g}`));
  }

  lines.push("\n---\n");
  lines.push("**Рекомендация на завтра:**\n");

  if (entry.energy_level <= 3 || entry.stress_level >= 8) {
    lines.push("Снизьте нагрузку. Завтра сфокусируйтесь на одной важной задаче и позвольте себе отдых.");
  } else if (entry.stress_level >= 5 && entry.energy_level >= 5) {
    lines.push("Усильте фокус. Выберите 2-3 ключевых задачи и не распыляйтесь на мелочи.");
  } else if (entry.energy_level >= 7 && entry.stress_level <= 3) {
    lines.push("Продолжайте в том же темпе. Вы в отличной форме — используйте это для важных дел.");
  } else if (entry.emotions.some(e => EMOTIONS_NEGATIVE.includes(e.emotion) && ["Страх", "Тревога", "Неуверенность", "Сомнение"].includes(e.emotion))) {
    lines.push("Проработайте тревогу. Запишите, что именно вас беспокоит, и оцените реальность этих опасений.");
  } else {
    lines.push("Добавьте отдых. Даже 15 минут для себя помогут перезагрузиться.");
  }

  lines.push("\nВы молодец, что уделили себе время. До встречи в следующий раз.");

  return lines.join("\n");
}

export function getStoredEntries(): JournalEntry[] {
  try {
    return JSON.parse(localStorage.getItem(ENTRIES_KEY()) ?? "[]");
  } catch {
    return [];
  }
}

export function getWeeklyStats(entries: JournalEntry[]): {
  avgEnergy: number;
  avgStress: number;
  topEmotions: string[];
  totalAchievements: number;
  repeatingDifficulties: string[];
} | null {
  if (entries.length < 7) return null;
  const recent = entries.slice(-7);

  const energyArr = recent.filter(e => e.energy_level > 0).map(e => e.energy_level);
  const stressArr = recent.filter(e => e.stress_level > 0).map(e => e.stress_level);
  const avgEnergy = energyArr.length ? Math.round(energyArr.reduce((a, b) => a + b, 0) / energyArr.length * 10) / 10 : 0;
  const avgStress = stressArr.length ? Math.round(stressArr.reduce((a, b) => a + b, 0) / stressArr.length * 10) / 10 : 0;

  const emotionCount: Record<string, number> = {};
  recent.forEach(e => e.emotions.forEach(em => {
    emotionCount[em.emotion] = (emotionCount[em.emotion] || 0) + 1;
  }));
  const topEmotions = Object.entries(emotionCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([e]) => e);

  const totalAchievements = recent.reduce((s, e) => s + e.achievements.length, 0);

  const diffCount: Record<string, number> = {};
  recent.forEach(e => e.difficulties.forEach(d => {
    const key = d.toLowerCase().slice(0, 30);
    diffCount[key] = (diffCount[key] || 0) + 1;
  }));
  const repeatingDifficulties = Object.entries(diffCount)
    .filter(([, c]) => c >= 3)
    .map(([d]) => d);

  return { avgEnergy, avgStress, topEmotions, totalAchievements, repeatingDifficulties };
}
