import type { Scores, ResultKey } from "./types";
import type { IncomeSession } from "./IncomeBotHistory";

export function calcScores(answers: Record<string, string>): Scores {
  const s: Scores = { score_body: 0, score_sales: 0, score_online: 0, score_creative: 0, score_soft: 0 };

  const body_interest = answers.body_interest?.toLowerCase() ?? "";
  const touch_comfort = answers.touch_comfort?.toLowerCase() ?? "";
  const physical_load = answers.physical_load?.toLowerCase() ?? "";
  const offline_available = answers.offline_available?.toLowerCase() ?? "";
  const start_ready_raw = answers.start_ready ?? "";
  const likes_people = answers.likes_people?.toLowerCase() ?? "";
  const energy_level = answers.energy_level?.toLowerCase() ?? "";
  const income_target = answers.income_target ?? "";
  const online_available = answers.online_available?.toLowerCase() ?? "";
  const goal = answers.goal?.toLowerCase() ?? "";
  const strength = answers.strength?.toLowerCase() ?? "";
  const time_per_week = answers.time_per_week ?? "";

  const startReadyHigh = start_ready_raw.includes("7") || start_ready_raw.includes("9") || start_ready_raw.includes("10");
  const startReadyLow = start_ready_raw.includes("1") || start_ready_raw.includes("4") || start_ready_raw.includes("5") || start_ready_raw.includes("6");

  if (body_interest.includes("да")) s.score_body += 3;
  else if (body_interest.includes("возможно")) s.score_body += 2;
  if (touch_comfort.includes("да") && !touch_comfort.includes("скорее")) s.score_body += 3;
  else if (touch_comfort.includes("скорее")) s.score_body += 2;
  if (physical_load.includes("хорошо")) s.score_body += 2;
  else if (physical_load.includes("нормально")) s.score_body += 1;
  if (offline_available.includes("да")) s.score_body += 1;
  if (startReadyHigh) s.score_body += 1;

  if (likes_people.includes("очень")) s.score_sales += 3;
  else if (likes_people.includes("нормально")) s.score_sales += 1;
  if (energy_level.includes("высокий")) s.score_sales += 2;
  else if (energy_level.includes("средний")) s.score_sales += 1;
  if (income_target.includes("50") || income_target.includes("100")) s.score_sales += 1;

  if (online_available.includes("да")) s.score_online += 2;
  if (likes_people.includes("минимум")) s.score_online += 3;
  if (offline_available.includes("нет")) s.score_online += 2;

  if (goal.includes("реализация")) s.score_creative += 2;
  if (strength.includes("создаю") || strength.includes("придумываю")) s.score_creative += 2;

  if (energy_level.includes("низкий")) s.score_soft += 3;
  if (startReadyLow) s.score_soft += 2;
  if (time_per_week.includes("до 5") || time_per_week.includes("5 часов")) s.score_soft += 1;

  return s;
}

export function pickResult(s: Scores): ResultKey {
  const priority: ResultKey[] = ["body", "sales", "online", "creative", "soft"];
  const scoreMap: Record<ResultKey, number> = {
    body: s.score_body,
    sales: s.score_sales,
    online: s.score_online,
    creative: s.score_creative,
    soft: s.score_soft,
  };
  const max = Math.max(...Object.values(scoreMap));
  return priority.find((k) => scoreMap[k] === max) ?? "soft";
}

export function getUserEmail(): string {
  const u = localStorage.getItem("pdd_user");
  return u ? JSON.parse(u).email : "";
}

export function getIncomeSessions(): IncomeSession[] {
  const email = getUserEmail();
  if (!email) return [];
  return JSON.parse(localStorage.getItem(`income_results_${email}`) ?? "[]");
}

export function saveIncomeSession(session: IncomeSession) {
  const email = getUserEmail();
  if (!email) return;
  const all = getIncomeSessions();
  all.push(session);
  localStorage.setItem(`income_results_${email}`, JSON.stringify(all));
}
