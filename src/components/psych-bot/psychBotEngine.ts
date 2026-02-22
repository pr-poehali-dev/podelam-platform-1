import {
  QUESTIONS,
  MOTIVATION_NAMES,
  SEGMENT_PROFESSIONS,
  PROFILE_MATRIX,
  MONETIZATION,
  PLAN_30,
  SEGMENT_NAMES,
  ENERGY_TEXT,
  BURNOUT_TEXT,
  FORMAT_TEXT,
  type Profession,
} from "./psychBotData";

// ─── ТИПЫ ─────────────────────────────────────────────────────────────────────

export type BotStep =
  | "welcome"
  | "quiz"
  | "show_professions"
  | "collect_ratings"
  | "ask_final_choice"
  | "report";

export type { Profession };

export type Message = { id: number; from: "bot" | "user"; text: string; widget?: Widget };

export type Widget =
  | { type: "button_list"; options: string[] }
  | { type: "rating_list"; professions: string[] }
  | { type: "start_button" };

export type BotState = {
  step: BotStep;
  currentQuestion: number;
  segmentScores: Record<string, number>;
  motivationScores: Record<string, number>;
  answers: number[];
  topSegment: string | null;
  primaryMotivation: string | null;
  professions: Profession[];
  ratings: Record<string, number>;
  highRated: string[];
  selectedProfession: string | null;
};

export const INITIAL_STATE: BotState = {
  step: "welcome",
  currentQuestion: 0,
  segmentScores: {},
  motivationScores: {},
  answers: [],
  topSegment: null,
  primaryMotivation: null,
  professions: [],
  ratings: {},
  highRated: [],
  selectedProfession: null,
};

// ─── АЛГОРИТМЫ ────────────────────────────────────────────────────────────────

export function applyAnswer(
  segScores: Record<string, number>,
  motivScores: Record<string, number>,
  questionIndex: number,
  optionIndex: number
): { segmentScores: Record<string, number>; motivationScores: Record<string, number> } {
  const q = QUESTIONS[questionIndex];
  const option = q.options[optionIndex];

  const newSeg = { ...segScores };
  const newMotiv = { ...motivScores };

  for (const [seg, weight] of Object.entries(option.segments)) {
    newSeg[seg] = (newSeg[seg] ?? 0) + (weight ?? 0);
  }
  for (const [mot, weight] of Object.entries(option.motivations)) {
    newMotiv[mot] = (newMotiv[mot] ?? 0) + (weight ?? 0);
  }

  return { segmentScores: newSeg, motivationScores: newMotiv };
}

export function getTopSegment(scores: Record<string, number>): string {
  const entries = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  return entries[0]?.[0] ?? "creative";
}

export function getPrimaryMotivation(scores: Record<string, number>): string {
  const entries = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  return entries[0]?.[0] ?? "process";
}

export function rankProfessions(segment: string, primaryMotivation: string): Profession[] {
  const profs = (SEGMENT_PROFESSIONS[segment] ?? []).map((p) => ({
    ...p,
    score: p.tags.includes(primaryMotivation) ? 2 : 1,
  }));
  return profs.sort((a, b) => b.score - a.score).slice(0, 8);
}

export function calcBurnout(
  motivationScores: Record<string, number>,
  primaryMotivation: string,
  selectedProf: Profession | undefined,
  segScores: Record<string, number>
): number {
  let burnout = 0;

  if (selectedProf && !selectedProf.tags.includes(primaryMotivation)) burnout += 2;

  const moneyOnly =
    (motivationScores["money"] ?? 0) > 0 &&
    Object.entries(motivationScores).every(([k, v]) => k === "money" || v === 0);
  if (moneyOnly) burnout += 2;

  const sorted = Object.entries(segScores).sort((a, b) => b[1] - a[1]);
  if (sorted.length >= 2 && sorted[0][1] - sorted[1][1] < 3) burnout += 1;

  return burnout;
}

export function buildReport(
  topSeg: string,
  primaryMotivation: string,
  selectedProfName: string,
  segScores: Record<string, number>,
  motivationScores: Record<string, number>
): string {
  const selectedProf = (SEGMENT_PROFESSIONS[topSeg] ?? []).find((p) => p.name === selectedProfName);
  const burnoutScore = calcBurnout(motivationScores, primaryMotivation, selectedProf, segScores);
  const risk = burnoutScore <= 1 ? "🟢 Низкий" : burnoutScore <= 3 ? "🟡 Средний" : "🔴 Высокий";
  const profileName = PROFILE_MATRIX[primaryMotivation]?.[topSeg] ?? "Уникальный профиль";
  const mon = MONETIZATION[topSeg];
  const plan = PLAN_30[topSeg] ?? [];

  const totalSeg = Object.values(segScores).reduce((a, b) => a + b, 0) || 1;
  const topSegsDisplay = Object.entries(segScores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([s, v]) => `${SEGMENT_NAMES[s]} — ${Math.round((v / totalSeg) * 100)}%`)
    .join("\n• ");

  const totalMotiv = Object.values(motivationScores).reduce((a, b) => a + b, 0) || 1;
  const top2Motivations = Object.entries(motivationScores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .filter(([, v]) => v > 0)
    .map(([m]) => MOTIVATION_NAMES[m])
    .join(" + ");

  return `## 1️⃣ Твой психологический профиль

**Тип личности:** ${profileName}
**Ведущее направление:** ${SEGMENT_NAMES[topSeg]}
**Ведущая мотивация:** ${MOTIVATION_NAMES[primaryMotivation]}${top2Motivations ? ` (также: ${top2Motivations})` : ""}

**Что даёт тебе энергию:**
${ENERGY_TEXT[topSeg]}

**Где ты будешь выгорать:**
${BURNOUT_TEXT[topSeg]}

**Подходящий формат работы:**
${FORMAT_TEXT[topSeg]}

---

## 2️⃣ Почему именно это направление

По результатам теста твой профиль:
• ${topSegsDisplay}

Выбранная профессия **«${selectedProfName}»** — прямое попадание в твой тип.

---

## 3️⃣ Варианты монетизации

**🔹 Минимальный старт (без увольнения):**
${mon.start}

**🔹 Доход 50–100 тыс/мес:**
${mon.mid}

**🔹 Масштабирование:**
${mon.scale}

---

## 4️⃣ Риск выгорания: ${risk}

${
  burnoutScore <= 1
    ? "Выбранное направление хорошо совпадает с твоей мотивацией и предрасположенностью. Риск минимальный."
    : burnoutScore <= 3
    ? "Есть небольшое несовпадение между мотивацией и выбранным направлением. Следи за балансом."
    : "Высокий риск: мотивация и направление могут конфликтовать. Рекомендую добавить элементы смысла в работу."
}

---

## 5️⃣ План на 30 дней

${plan.map((p) => `**${p.split("—")[0]}—**${p.split("—").slice(1).join("—")}`).join("\n\n")}

---

Сохрани этот результат. Он основан на твоих реальных ответах.`;
}

export const TOTAL_QUESTIONS = QUESTIONS.length;
