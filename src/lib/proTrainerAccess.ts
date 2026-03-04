import { ProTrainerId, PRO_TRAINERS, StrategicSession } from "./proTrainerTypes";
import type { FinancialSession } from "./financialTrainerTypes";
import { calcOSI } from "./proTrainerFormulas";
import { buildFullInterpretation } from "./proTrainerInterpretation";
import { chargeBalance, syncFromServer } from "./access";

const ADD_PAYMENT_URL = "https://functions.poehali.dev/55a42126-88c7-4b99-b0b5-831a53a24325";
const YOOKASSA_URL = "https://functions.poehali.dev/1b07c03c-bee7-4b25-aeee-836e7331e044";

function getEmail(): string {
  try {
    const u = localStorage.getItem("pdd_user");
    return u ? JSON.parse(u).email : "guest";
  } catch { return "guest"; }
}

function getUserData() {
  try {
    const u = JSON.parse(localStorage.getItem("pdd_user") || "{}");
    return { email: u.email || "", name: u.name || "" };
  } catch { return { email: "", name: "" }; }
}

export interface ProTrainerAccess {
  trainerId: ProTrainerId;
  planId: string;
  expiresAt: string;
  unlimited: boolean;
  sessionsUsed: number;
}

function accessKey(email: string, trainerId: ProTrainerId): string {
  return `pdd_pro_${email}_${trainerId}`;
}

function sessionsKey(email: string, trainerId: ProTrainerId): string {
  return `pdd_pro_sessions_${email}_${trainerId}`;
}

export function getProAccess(trainerId: ProTrainerId): ProTrainerAccess | null {
  const email = getEmail();
  try {
    const raw = localStorage.getItem(accessKey(email, trainerId));
    if (!raw) return null;
    const a: ProTrainerAccess = JSON.parse(raw);
    if (new Date(a.expiresAt) <= new Date()) return null;
    return a;
  } catch { return null; }
}

export function hasProAccess(trainerId: ProTrainerId): boolean {
  const access = getProAccess(trainerId);
  if (!access) return false;
  if (access.unlimited) return true;
  return access.sessionsUsed < 1;
}

export function activateProAccess(trainerId: ProTrainerId, planId: string): void {
  const email = getEmail();
  const trainer = PRO_TRAINERS.find(t => t.id === trainerId);
  if (!trainer) return;
  const plan = trainer.pricing.find(p => p.id === planId);
  if (!plan) return;

  const expires = new Date();
  expires.setDate(expires.getDate() + plan.durationDays);

  const access: ProTrainerAccess = {
    trainerId,
    planId,
    expiresAt: expires.toISOString(),
    unlimited: plan.unlimited,
    sessionsUsed: 0,
  };
  localStorage.setItem(accessKey(email, trainerId), JSON.stringify(access));
  window.dispatchEvent(new CustomEvent("pdd_balance_change"));
}

export function incrementProSession(trainerId: ProTrainerId): void {
  const email = getEmail();
  const raw = localStorage.getItem(accessKey(email, trainerId));
  if (!raw) return;
  const access: ProTrainerAccess = JSON.parse(raw);
  access.sessionsUsed += 1;
  localStorage.setItem(accessKey(email, trainerId), JSON.stringify(access));
}

export async function payProFromBalance(trainerId: ProTrainerId, planId: string): Promise<boolean> {
  await syncFromServer().catch(() => {});
  const trainer = PRO_TRAINERS.find(t => t.id === trainerId);
  if (!trainer) return false;
  const plan = trainer.pricing.find(p => p.id === planId);
  if (!plan) return false;

  const ok = chargeBalance(plan.price);
  if (ok) {
    activateProAccess(trainerId, planId);
    const { email, name } = getUserData();
    window.ym?.(107022183, "reachGoal", "pro_trainer_purchase", { plan: planId, amount: plan.price });
    fetch(ADD_PAYMENT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_email: email,
        user_name: name,
        amount: plan.price,
        tariff: `PRO: ${trainer.title} — ${plan.name}`,
        status: "paid",
        action: "pay_pro_trainer",
      }),
    }).catch(() => {});
  }
  return ok;
}

export async function createProPayment(trainerId: ProTrainerId, planId: string): Promise<string | null> {
  const trainer = PRO_TRAINERS.find(t => t.id === trainerId);
  if (!trainer) return null;
  const plan = trainer.pricing.find(p => p.id === planId);
  if (!plan) return null;

  const { email } = getUserData();
  localStorage.setItem("pdd_pending_pro_plan", JSON.stringify({ trainerId, planId }));

  try {
    const res = await fetch(YOOKASSA_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "create",
        user_email: email,
        amount: plan.price,
        description: `PRO-тренажёр: ${trainer.title} — ${plan.name}`,
        return_url: window.location.origin + "/payment/success",
      }),
    });
    const data = await res.json();
    return data.confirmation_url || null;
  } catch { return null; }
}

export function getSavedSessions(trainerId: ProTrainerId): StrategicSession[] {
  const email = getEmail();
  try {
    const raw = localStorage.getItem(sessionsKey(email, trainerId));
    const sessions: StrategicSession[] = raw ? JSON.parse(raw) : [];
    let changed = false;
    for (const s of sessions) {
      if (s.currentStep >= 7 && !s.results) {
        const results = calcOSI(s.data);
        if (results) {
          results.interpretation = buildFullInterpretation(s.data, results);
          s.results = results;
          if (!s.completedAt) s.completedAt = s.createdAt;
          changed = true;
        }
      }
      if (s.currentStep >= 7 && s.results && !s.results.interpretation) {
        s.results.interpretation = buildFullInterpretation(s.data, s.results);
        changed = true;
      }
    }
    if (changed) {
      localStorage.setItem(sessionsKey(email, trainerId), JSON.stringify(sessions));
    }
    return sessions;
  } catch { return []; }
}

export function saveSession(trainerId: ProTrainerId, session: StrategicSession): void {
  const email = getEmail();
  const sessions = getSavedSessions(trainerId);
  const idx = sessions.findIndex(s => s.id === session.id);
  if (idx >= 0) sessions[idx] = session;
  else sessions.unshift(session);
  if (sessions.length > 20) sessions.pop();
  localStorage.setItem(sessionsKey(email, trainerId), JSON.stringify(sessions));
}

export function deleteSession(trainerId: ProTrainerId, sessionId: string): void {
  const email = getEmail();
  const sessions = getSavedSessions(trainerId).filter(s => s.id !== sessionId);
  localStorage.setItem(sessionsKey(email, trainerId), JSON.stringify(sessions));
}

export function proAccessExpiresFormatted(trainerId: ProTrainerId): string | null {
  const access = getProAccess(trainerId);
  if (!access) return null;
  return new Date(access.expiresAt).toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function getFinancialSessions(trainerId: ProTrainerId): FinancialSession[] {
  const email = getEmail();
  try {
    const raw = localStorage.getItem(sessionsKey(email, trainerId));
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function saveFinancialSession(trainerId: ProTrainerId, session: FinancialSession): void {
  const email = getEmail();
  const sessions = getFinancialSessions(trainerId);
  const idx = sessions.findIndex(s => s.id === session.id);
  if (idx >= 0) sessions[idx] = session;
  else sessions.unshift(session);
  if (sessions.length > 20) sessions.pop();
  localStorage.setItem(sessionsKey(email, trainerId), JSON.stringify(sessions));
}

export function deleteFinancialSession(trainerId: ProTrainerId, sessionId: string): void {
  const email = getEmail();
  const sessions = getFinancialSessions(trainerId).filter(s => s.id !== sessionId);
  localStorage.setItem(sessionsKey(email, trainerId), JSON.stringify(sessions));
}