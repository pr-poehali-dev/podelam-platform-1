// Система доступа и оплаты ПоДелам
// Тарифы: 290₽ за один инструмент / 990₽ подписка на 30 дней (все инструменты)
// Баланс: хранится в pdd_balance_{email}

const ADD_PAYMENT_URL = "https://functions.poehali.dev/55a42126-88c7-4b99-b0b5-831a53a24325";
const USER_AUTH_URL = "https://functions.poehali.dev/487cc378-edbf-4dee-8e28-4c1fe70b6a3c";

function getUserData() {
  try { const u = JSON.parse(localStorage.getItem("pdd_user") || "{}"); return { email: u.email || "", name: u.name || "" }; } catch { return { email: "", name: "" }; }
}

function sendPayment(amount: number, tariff: string, action: string, toolId?: string) {
  const { email, name } = getUserData();
  fetch(ADD_PAYMENT_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_email: email, user_name: name, amount, tariff, status: "paid", action, tool_id: toolId || "" }),
  }).catch(() => {});
}

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
// Ключ баланса: pdd_balance_{email} -> число (рубли)
function balanceKey(email: string) { return `pdd_balance_${email}`; }

/** Получить баланс пользователя */
export function getBalance(): number {
  const email = getEmail();
  return parseFloat(localStorage.getItem(balanceKey(email)) || "0");
}

function notifyBalanceChange() {
  window.dispatchEvent(new CustomEvent("pdd_balance_change"));
}

/** Синхронизировать баланс, подписку и купленные инструменты с сервером */
export async function syncFromServer(): Promise<number> {
  const email = getEmail();
  if (!email || email === "guest") return getBalance();

  const res = await fetch(USER_AUTH_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "get_profile", email }),
  });
  if (!res.ok) return getBalance();

  const data = await res.json();

  if (typeof data.balance === "number") {
    localStorage.setItem(balanceKey(email), String(data.balance));
  }

  if (data.subscription_expires) {
    localStorage.setItem(subKey(email), new Date(data.subscription_expires).toISOString());
  }

  if (Array.isArray(data.paid_tools)) {
    for (const t of data.paid_tools) {
      localStorage.setItem(`pdd_once_${email}_${t}`, "1");
    }
  }

  notifyBalanceChange();
  return data.balance ?? getBalance();
}

/** Пополнить баланс */
export function topUpBalance(amount: number): void {
  const email = getEmail();
  const current = getBalance();
  localStorage.setItem(balanceKey(email), String(current + amount));
  notifyBalanceChange();
  sendPayment(amount, "Пополнение баланса", "topup");
}

/** Списать с баланса. Возвращает true если успешно */
export function chargeBalance(amount: number): boolean {
  const email = getEmail();
  const current = getBalance();
  if (current < amount) return false;
  localStorage.setItem(balanceKey(email), String(current - amount));
  notifyBalanceChange();
  return true;
}

/** Названия инструментов для платежей */
const TOOL_NAMES: Record<string, string> = {
  "psych-bot": "Психологический анализ",
  "barrier-bot": "Барьеры и тревога",
  "income-bot": "Подбор дохода",
  "plan-bot": "Шаги развития",
  "progress": "Прогресс развития",
  "diary": "Дневник самоанализа",
};

/** Списать с баланса и активировать разовый доступ к инструменту */
export function payFromBalanceOnce(toolId: ToolId): boolean {
  const ok = chargeBalance(TOOL_PRICE);
  if (ok) {
    activatePaidOnce(toolId);
    sendPayment(TOOL_PRICE, TOOL_NAMES[toolId] || toolId, "pay_tool", toolId);
  }
  return ok;
}

/** Списать с баланса и активировать подписку на 30 дней */
export function payFromBalanceSub(): boolean {
  const ok = chargeBalance(SUB_PRICE);
  if (ok) {
    activateSubscription();
    sendPayment(SUB_PRICE, "Подписка 30 дней", "pay_sub");
  }
  return ok;
}

/** Московское время истечения подписки */
export function subscriptionExpiresFormatted(): string | null {
  const email = getEmail();
  const val = localStorage.getItem(subKey(email));
  if (!val) return null;
  const d = new Date(val);
  if (d <= new Date()) return null;
  return d.toLocaleString("ru-RU", {
    timeZone: "Europe/Moscow",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

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
  // Постоянный флаг — инструмент пройден хотя бы раз (не удаляется)
  localStorage.setItem(`pdd_ever_done_${email}_${toolId}`, "1");
}

/** Проверить, был ли инструмент пройден хотя бы раз */
export function wasEverDone(toolId: ToolId): boolean {
  const email = getEmail();
  // Проверяем и постоянный флаг, и наличие completions
  if (localStorage.getItem(`pdd_ever_done_${email}_${toolId}`) === "1") return true;
  const completions: ToolCompletion[] = JSON.parse(localStorage.getItem(`pdd_completions_${email}`) || "[]");
  return completions.some((c) => c.toolId === toolId);
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