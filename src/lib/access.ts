// Система доступа и оплаты ПоДелам
// Тарифы: 290₽ за один инструмент / 990₽ подписка на 30 дней (все инструменты)

export type ToolId =
  | "career-test"    // Тест «Какая профессия тебе подходит» — БЕСПЛАТНО
  | "psych-bot"      // Психологический анализ — 290₽ / подписка
  | "barrier-bot"    // Барьеры и тревога — 290₽ / подписка
  | "income-bot"     // Подбор дохода — 290₽ / подписка
  | "plan-bot"       // Шаги развития — 290₽ / подписка
  | "progress"       // Прогресс развития — 290₽ / подписка
  | "diary";         // Дневник самоанализа — ТОЛЬКО подписка 990₽

export const TOOL_PRICE = 290; // руб за разовый доступ
export const SUB_PRICE = 990;  // руб за 30 дней
export const SUB_DAYS = 30;

export type AccessStatus = "free" | "paid_once" | "subscribed" | "locked";

function getEmail(): string {
  try {
    const u = localStorage.getItem("pdd_user");
    return u ? JSON.parse(u).email : "guest";
  } catch {
    return "guest";
  }
}

// Ключ подписки: pdd_sub_{email} -> ISO-дата истечения
function subKey(email: string) { return `pdd_sub_${email}`; }
// Ключ разового доступа: pdd_once_{email}_{toolId} -> "1"
function onceKey(email: string, toolId: ToolId) { return `pdd_once_${email}_${toolId}`; }
// Ключ результата теста профессий (склонности)
function careerKey(email: string) { return `career_result_${email}`; }

/** Проверить активность подписки */
export function hasSubscription(): boolean {
  const email = getEmail();
  const val = localStorage.getItem(subKey(email));
  if (!val) return false;
  return new Date(val) > new Date();
}

/** Дата истечения подписки */
export function subscriptionExpires(): Date | null {
  const email = getEmail();
  const val = localStorage.getItem(subKey(email));
  if (!val) return null;
  const d = new Date(val);
  return d > new Date() ? d : null;
}

/** Проверить разовый доступ к инструменту */
export function hasPaidOnce(toolId: ToolId): boolean {
  const email = getEmail();
  return localStorage.getItem(onceKey(email, toolId)) === "1";
}

/** Проверить общий доступ к инструменту */
export function checkAccess(toolId: ToolId): AccessStatus {
  if (toolId === "career-test") return "free";
  if (hasSubscription()) return "subscribed";
  if (toolId === "diary") return "locked"; // дневник только по подписке
  if (hasPaidOnce(toolId)) return "paid_once";
  return "locked";
}

/** Активировать разовый доступ (симуляция оплаты) */
export function activatePaidOnce(toolId: ToolId): void {
  const email = getEmail();
  localStorage.setItem(onceKey(email, toolId), "1");
}

/** Активировать подписку на 30 дней (симуляция оплаты) */
export function activateSubscription(): void {
  const email = getEmail();
  const expires = new Date();
  expires.setDate(expires.getDate() + SUB_DAYS);
  localStorage.setItem(subKey(email), expires.toISOString());
}

/** Сохранить результат теста профессий */
export function saveCareerResult(result: CareerResult): void {
  const email = getEmail();
  const existing = getCareerResults();
  existing.unshift({ ...result, date: new Date().toLocaleDateString("ru-RU"), id: Date.now().toString() });
  localStorage.setItem(careerKey(email), JSON.stringify(existing.slice(0, 5))); // храним до 5 результатов
}

/** Получить все результаты теста профессий */
export function getCareerResults(): CareerResult[] {
  const email = getEmail();
  const val = localStorage.getItem(careerKey(email));
  return val ? JSON.parse(val) : [];
}

/** Получить последний результат теста профессий */
export function getLatestCareerResult(): CareerResult | null {
  const results = getCareerResults();
  return results.length > 0 ? results[0] : null;
}

export type CareerResult = {
  id: string;
  date: string;
  topType: string;        // главный тип личности
  topTypeName: string;    // название
  topTypeDesc: string;    // описание
  professions: string[];  // рекомендованные профессии
  scores: { type: string; name: string; score: number }[];
};

/** Сохранить факт прохождения инструмента для Progress */
export function saveToolCompletion(toolId: ToolId, summary: string): void {
  const email = getEmail();
  const key = `pdd_completions_${email}`;
  const existing: ToolCompletion[] = JSON.parse(localStorage.getItem(key) || "[]");
  existing.unshift({
    toolId,
    date: new Date().toLocaleDateString("ru-RU"),
    timestamp: Date.now(),
    summary,
  });
  localStorage.setItem(key, JSON.stringify(existing.slice(0, 50)));
}

/** Получить историю пройденных инструментов */
export function getToolCompletions(toolId?: ToolId): ToolCompletion[] {
  const email = getEmail();
  const key = `pdd_completions_${email}`;
  const all: ToolCompletion[] = JSON.parse(localStorage.getItem(key) || "[]");
  return toolId ? all.filter((c) => c.toolId === toolId) : all;
}

export type ToolCompletion = {
  toolId: ToolId;
  date: string;
  timestamp: number;
  summary: string;
};
