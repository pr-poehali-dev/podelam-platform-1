import {
  SEGMENT_KEYWORDS,
  MOTIVATION_MARKERS,
  MOTIVATION_NAMES,
  SEGMENT_PROFESSIONS,
  PROFILE_MATRIX,
  MONETIZATION,
  PLAN_30,
  SEGMENT_NAMES,
  ENERGY_TEXT,
  BURNOUT_TEXT,
  FORMAT_TEXT,
} from "./psychBotData";

// ─── ТИПЫ ─────────────────────────────────────────────────────────────────────

export type BotStep =
  | "welcome"
  | "collect_activities"
  | "show_top2"
  | "ask_segment_why"
  | "show_professions"
  | "collect_ratings"
  | "filter_ratings"
  | "ask_final_choice"
  | "report";

export type Profession = { name: string; tags: string[] };

export type Message = { id: number; from: "bot" | "user"; text: string; widget?: Widget };

export type Widget =
  | { type: "button_list"; options: string[] }
  | { type: "rating_list"; professions: string[] }
  | { type: "textarea_submit"; placeholder: string };

export type BotState = {
  step: BotStep;
  activities: string[];
  segmentScores: Record<string, number>;
  top2: [string, string] | null;
  chosenSegment: string | null;
  motivationText: string;
  motivationScores: Record<string, number>;
  primaryMotivation: string;
  professions: Profession[];
  ratings: Record<string, number>;
  highRated: string[];
  selectedProfession: string | null;
};

export const INITIAL_STATE: BotState = {
  step: "welcome",
  activities: [],
  segmentScores: {},
  top2: null,
  chosenSegment: null,
  motivationText: "",
  motivationScores: {},
  primaryMotivation: "process",
  professions: [],
  ratings: {},
  highRated: [],
  selectedProfession: null,
};

// ─── АЛГОРИТМЫ ────────────────────────────────────────────────────────────────

export function preprocess(text: string): string[] {
  const cleaned = text.toLowerCase().replace(/[.,!?;:()"«»-]/g, " ");
  const stopWords = new Set([
    "и","в","на","с","по","за","от","до","из","к","у","о","а","но","или","это","как","что","он","она","они","мы","вы","я","то","не","же","бы","ли",
    "при","для","об","со","под","над","без","через","между","во","про","чтобы","когда","если","так","еще","уже","вот","все","тоже","всё","свои","своё","своя","своих",
  ]);
  return cleaned.split(/\s+/).filter((w) => w.length > 2 && !stopWords.has(w));
}

export function segmentActivities(activities: string[]): Record<string, number> {
  const scores: Record<string, number> = {};
  Object.keys(SEGMENT_KEYWORDS).forEach((s) => (scores[s] = 0));

  for (const activity of activities) {
    const lemmas = preprocess(activity);
    const matched: string[] = [];

    for (const seg of Object.keys(SEGMENT_KEYWORDS)) {
      const keywords = SEGMENT_KEYWORDS[seg];
      const hit = lemmas.some((lemma) => keywords.some((kw) => lemma.startsWith(kw) || kw.startsWith(lemma.slice(0, 5))));
      if (hit) matched.push(seg);
    }

    if (matched.length === 1) {
      scores[matched[0]] += 1;
    } else if (matched.length > 1) {
      const w = 1 / matched.length;
      matched.forEach((s) => (scores[s] += w));
    }
  }

  const total = Object.values(scores).reduce((a, b) => a + b, 0);
  if (total > 0) {
    Object.keys(scores).forEach((s) => (scores[s] = scores[s] / total));
  }

  return scores;
}

export function getTop2(scores: Record<string, number>): [string, string] {
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  return [sorted[0][0], sorted[1][0]];
}

export function analyzeMotivation(text: string): Record<string, number> {
  const scores: Record<string, number> = {};
  Object.keys(MOTIVATION_MARKERS).forEach((m) => (scores[m] = 0));
  const lemmas = preprocess(text);
  for (const lemma of lemmas) {
    for (const m of Object.keys(MOTIVATION_MARKERS)) {
      if (MOTIVATION_MARKERS[m].some((mk) => lemma.startsWith(mk) || mk.startsWith(lemma.slice(0, 5)))) {
        scores[m] += 1;
      }
    }
  }
  return scores;
}

export function getPrimaryMotivation(scores: Record<string, number>): string {
  const max = Math.max(...Object.values(scores));
  if (max === 0) return "process";
  return Object.keys(scores).find((k) => scores[k] === max) ?? "process";
}

export function rankProfessions(segment: string, primaryMotivation: string): Profession[] {
  const profs = (SEGMENT_PROFESSIONS[segment] ?? []).map((p) => ({
    ...p,
    score: p.tags.includes(primaryMotivation) ? 2 : 1,
  }));
  return profs.sort((a, b) => b.score - a.score).slice(0, 10);
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
    motivationScores["money"] > 0 &&
    Object.entries(motivationScores).every(([k, v]) => k === "money" || v === 0);
  if (moneyOnly) burnout += 2;

  const sorted = Object.entries(segScores).sort((a, b) => b[1] - a[1]);
  if (sorted.length >= 2 && sorted[0][1] - sorted[1][1] < 0.05) burnout += 1;

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

  const topSegsDisplay = Object.entries(segScores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([s, v]) => `${SEGMENT_NAMES[s]} — ${Math.round(v * 100)}%`)
    .join("\n• ");

  return `## 1️⃣ Твой психологический профиль

**Тип личности:** ${profileName}
**Ведущий сегмент:** ${SEGMENT_NAMES[topSeg]}
**Ведущая мотивация:** ${MOTIVATION_NAMES[primaryMotivation]}

**Что даёт тебе энергию:**
${ENERGY_TEXT[topSeg]}

**Где ты будешь выгорать:**
${BURNOUT_TEXT[topSeg]}

**Подходящий формат работы:**
${FORMAT_TEXT[topSeg]}

---

## 2️⃣ Почему именно это направление

По распределению активностей твой профиль выглядит так:
• ${topSegsDisplay}

Ты выбрал направление **«${SEGMENT_NAMES[topSeg]}»** и объяснил это через мотивацию **«${MOTIVATION_NAMES[primaryMotivation]}»**. Это наиболее органичное сочетание для долгосрочной работы без выгорания.

Выбранная профессия **«${selectedProfName}»** — прямое попадание в твой профиль.

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
    ? "Есть небольшое несовпадение между мотивацией и выбранным направлением. Следи за балансом — не гонись только за деньгами или только за процессом."
    : "Высокий риск связан с тем, что мотивация и выбранное направление могут конфликтовать. Рекомендую пересмотреть приоритеты или добавить элементы смысла в работу."
}

---

## 5️⃣ План на 30 дней

${plan.map((p) => `**${p.split("—")[0]}—**${p.split("—").slice(1).join("—")}`).join("\n\n")}

---

Сохрани этот результат. Он основан на твоих реальных ответах, а не на шаблоне.`;
}
