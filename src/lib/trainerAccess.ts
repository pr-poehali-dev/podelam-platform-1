import { TrainerId } from "@/components/trainers/types";
import { getBalance, chargeBalance, syncFromServer } from "./access";

const ADD_PAYMENT_URL = "https://functions.poehali.dev/55a42126-88c7-4b99-b0b5-831a53a24325";
const YOOKASSA_URL = "https://functions.poehali.dev/1b07c03c-bee7-4b25-aeee-836e7331e044";
const TRAINER_ACCESS_URL = "https://functions.poehali.dev/22d54726-be91-4843-858c-41203c2d37a4";

export type TrainerPlanId = "basic" | "advanced" | "yearly";

export interface TrainerPlan {
  id: TrainerPlanId;
  name: string;
  price: number;
  period: string;
  durationDays: number;
  allTrainers: boolean;
  description: string;
}

export const TRAINER_PLANS: TrainerPlan[] = [
  {
    id: "basic",
    name: "Базовый",
    price: 990,
    period: "мес",
    durationDays: 30,
    allTrainers: false,
    description: "1 тренажер на выбор · 30 дней",
  },
  {
    id: "advanced",
    name: "Продвинутый",
    price: 2490,
    period: "3 мес",
    durationDays: 90,
    allTrainers: true,
    description: "Все тренажеры · 90 дней",
  },
  {
    id: "yearly",
    name: "Годовой",
    price: 6990,
    period: "год",
    durationDays: 365,
    allTrainers: true,
    description: "Все тренажеры · 365 дней",
  },
];

function getEmail(): string {
  try {
    const u = localStorage.getItem("pdd_user");
    return u ? JSON.parse(u).email : "guest";
  } catch {
    return "guest";
  }
}

function getUserData() {
  try {
    const u = JSON.parse(localStorage.getItem("pdd_user") || "{}");
    return { email: u.email || "", name: u.name || "" };
  } catch {
    return { email: "", name: "" };
  }
}

function trainerSubKey(email: string): string {
  return `pdd_trainer_sub_${email}`;
}

export interface TrainerSubscription {
  planId: TrainerPlanId;
  trainerId?: TrainerId;
  expiresAt: string;
  allTrainers: boolean;
}

function getDeviceId(): string {
  let id = localStorage.getItem("pdd_device_id");
  if (!id) {
    id = `d_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem("pdd_device_id", id);
  }
  return id;
}

export function getTrainerSubscription(): TrainerSubscription | null {
  const email = getEmail();
  try {
    const raw = localStorage.getItem(trainerSubKey(email));
    if (!raw) return null;
    const sub: TrainerSubscription = JSON.parse(raw);
    if (new Date(sub.expiresAt) <= new Date()) return null;
    return sub;
  } catch {
    return null;
  }
}

export function hasTrainerAccess(trainerId: TrainerId): boolean {
  const sub = getTrainerSubscription();
  if (!sub) return false;
  if (sub.allTrainers) return true;
  if (!sub.trainerId) return true;
  return sub.trainerId === trainerId;
}

export function isBasicUnbound(): boolean {
  const sub = getTrainerSubscription();
  return !!sub && !sub.allTrainers && !sub.trainerId;
}

const BASIC_SESSION_LIMIT = 4;

export function getSessionLimitInfo(trainerId: TrainerId): { limited: boolean; used: number; limit: number } {
  const sub = getTrainerSubscription();
  if (!sub || sub.allTrainers) return { limited: false, used: 0, limit: Infinity };

  try {
    const email = getEmail();
    const raw = localStorage.getItem(`pdd_trainer_${email}_sessions_${trainerId}`);
    const sessions = raw ? JSON.parse(raw) : [];
    const completed = sessions.filter((s: { completedAt?: string }) => s.completedAt);
    return {
      limited: completed.length >= BASIC_SESSION_LIMIT,
      used: completed.length,
      limit: BASIC_SESSION_LIMIT,
    };
  } catch {
    return { limited: false, used: 0, limit: BASIC_SESSION_LIMIT };
  }
}

export async function bindBasicPlan(trainerId: TrainerId): Promise<void> {
  const sub = getTrainerSubscription();
  if (!sub || sub.allTrainers || sub.trainerId) return;

  const email = getEmail();
  const updated: TrainerSubscription = { ...sub, trainerId };
  localStorage.setItem(trainerSubKey(email), JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent("pdd_balance_change"));

  try {
    await fetch(TRAINER_ACCESS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "activate",
        email,
        plan_id: sub.planId,
        trainer_id: trainerId,
      }),
    });
  } catch {
    // local already saved
  }
}

function saveSubLocally(sub: TrainerSubscription): void {
  const email = getEmail();
  localStorage.setItem(trainerSubKey(email), JSON.stringify(sub));
  window.dispatchEvent(new CustomEvent("pdd_balance_change"));
}

export async function activateTrainerPlan(
  planId: TrainerPlanId,
  trainerId?: TrainerId
): Promise<void> {
  const email = getEmail();
  const plan = TRAINER_PLANS.find((p) => p.id === planId);
  if (!plan) return;

  const expires = new Date();
  expires.setDate(expires.getDate() + plan.durationDays);

  const sub: TrainerSubscription = {
    planId,
    trainerId: plan.allTrainers ? undefined : trainerId,
    expiresAt: expires.toISOString(),
    allTrainers: plan.allTrainers,
  };
  saveSubLocally(sub);

  try {
    const res = await fetch(TRAINER_ACCESS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "activate",
        email,
        plan_id: planId,
        trainer_id: plan.allTrainers ? undefined : trainerId,
      }),
    });
    const data = await res.json();
    if (data.subscription) {
      const serverSub: TrainerSubscription = {
        planId: data.subscription.plan_id,
        trainerId: data.subscription.trainer_id || undefined,
        expiresAt: new Date(data.subscription.expires_at).toISOString(),
        allTrainers: data.subscription.all_trainers,
      };
      saveSubLocally(serverSub);
    }
  } catch {
    // local sub already saved as fallback
  }
}

export async function syncTrainerSubscription(): Promise<TrainerSubscription | null> {
  const email = getEmail();
  if (!email || email === "guest") return getTrainerSubscription();

  try {
    const res = await fetch(TRAINER_ACCESS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "get_subscription", email }),
    });
    const data = await res.json();
    if (data.subscription) {
      const sub: TrainerSubscription = {
        planId: data.subscription.plan_id,
        trainerId: data.subscription.trainer_id || undefined,
        expiresAt: new Date(data.subscription.expires_at).toISOString(),
        allTrainers: data.subscription.all_trainers,
      };
      saveSubLocally(sub);
      return sub;
    } else {
      localStorage.removeItem(trainerSubKey(email));
      window.dispatchEvent(new CustomEvent("pdd_balance_change"));
      return null;
    }
  } catch {
    return getTrainerSubscription();
  }
}

export function trainerSubExpiresFormatted(): string | null {
  const sub = getTrainerSubscription();
  if (!sub) return null;
  return new Date(sub.expiresAt).toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export async function payTrainerPlanFromBalance(
  planId: TrainerPlanId,
  trainerId?: TrainerId
): Promise<boolean> {
  await syncFromServer().catch(() => {});
  const plan = TRAINER_PLANS.find((p) => p.id === planId);
  if (!plan) return false;

  const ok = chargeBalance(plan.price);
  if (ok) {
    await activateTrainerPlan(planId, trainerId);
    const { email, name } = getUserData();
    window.ym?.(107022183, "reachGoal", "trainer_plan_purchase", {
      plan: planId,
      amount: plan.price,
    });
    fetch(ADD_PAYMENT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_email: email,
        user_name: name,
        amount: plan.price,
        tariff: `Тренажеры: ${plan.name}`,
        status: "paid",
        action: "pay_sub",
        tool_id: trainerId || "all-trainers",
      }),
    }).catch(() => {});
  }
  return ok;
}

export async function createTrainerPayment(
  planId: TrainerPlanId,
  trainerId?: TrainerId
): Promise<string | null> {
  const { email, name } = getUserData();
  if (!email || email === "guest") return null;

  const plan = TRAINER_PLANS.find((p) => p.id === planId);
  if (!plan) return null;

  localStorage.setItem(
    "pdd_pending_trainer_plan",
    JSON.stringify({ planId, trainerId })
  );

  try {
    const res = await fetch(YOOKASSA_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "create",
        user_email: email,
        user_name: name,
        amount: plan.price,
        return_url: window.location.origin,
      }),
    });
    const data = await res.json();
    if (data.confirmation_url) {
      window.ym?.(107022183, "reachGoal", "trainer_payment_initiated", {
        plan: planId,
        amount: plan.price,
      });
      return data.confirmation_url;
    }
    return null;
  } catch {
    return null;
  }
}

export function getPendingTrainerPlan(): {
  planId: TrainerPlanId;
  trainerId?: TrainerId;
} | null {
  try {
    const raw = localStorage.getItem("pdd_pending_trainer_plan");
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearPendingTrainerPlan(): void {
  localStorage.removeItem("pdd_pending_trainer_plan");
}

export async function startTrainerSession(trainerId: TrainerId): Promise<{ ok: boolean; blocked?: boolean; blockedTrainer?: string }> {
  const email = getEmail();
  if (!email || email === "guest") return { ok: false };

  try {
    const res = await fetch(TRAINER_ACCESS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "session_start",
        email,
        trainer_id: trainerId,
        device_id: getDeviceId(),
      }),
    });
    if (res.status === 409) {
      const data = await res.json();
      return { ok: false, blocked: true, blockedTrainer: data.trainer_id };
    }
    if (res.status === 403) {
      return { ok: false };
    }
    return { ok: true };
  } catch {
    return { ok: true };
  }
}

export async function sendHeartbeat(): Promise<{ ok: boolean; blocked?: boolean }> {
  const email = getEmail();
  if (!email || email === "guest") return { ok: true };

  try {
    const res = await fetch(TRAINER_ACCESS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "heartbeat",
        email,
        device_id: getDeviceId(),
      }),
    });
    if (res.status === 409) {
      return { ok: false, blocked: true };
    }
    return { ok: true };
  } catch {
    return { ok: true };
  }
}

export async function endTrainerSession(): Promise<void> {
  const email = getEmail();
  if (!email || email === "guest") return;

  fetch(TRAINER_ACCESS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "session_end",
      email,
      device_id: getDeviceId(),
    }),
  }).catch(() => {});
}

export async function checkDeviceBlocked(): Promise<{ blocked: boolean; trainerId?: string }> {
  const email = getEmail();
  if (!email || email === "guest") return { blocked: false };

  try {
    const res = await fetch(TRAINER_ACCESS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "check_device",
        email,
        device_id: getDeviceId(),
      }),
    });
    const data = await res.json();
    return { blocked: !!data.blocked, trainerId: data.trainer_id };
  } catch {
    return { blocked: false };
  }
}

export async function saveSessionToServer(session: {
  trainerId: string;
  sessionId: string;
  startedAt: string;
  completedAt?: string;
  scores: Record<string, number>;
  result?: unknown;
  answers?: Record<string, unknown>;
}): Promise<void> {
  const email = getEmail();
  if (!email || email === "guest") return;

  try {
    await fetch(TRAINER_ACCESS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "save_session",
        email,
        trainer_id: session.trainerId,
        session_id: session.sessionId,
        started_at: session.startedAt,
        completed_at: session.completedAt || null,
        scores: session.scores,
        result: session.result || null,
        answers: session.answers || {},
      }),
    });
  } catch {
    // offline fallback — local already saved
  }
}

export async function getSessionsFromServer(trainerId?: string): Promise<
  {
    session_id: string;
    trainer_id: string;
    started_at: string | null;
    completed_at: string | null;
    scores: Record<string, number>;
    result: unknown | null;
  }[]
> {
  const email = getEmail();
  if (!email || email === "guest") return [];

  try {
    const res = await fetch(TRAINER_ACCESS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "get_sessions",
        email,
        trainer_id: trainerId,
      }),
    });
    const data = await res.json();
    return data.sessions || [];
  } catch {
    return [];
  }
}

export async function getServerSessionCount(trainerId: string): Promise<number> {
  const email = getEmail();
  if (!email || email === "guest") return 0;

  try {
    const res = await fetch(TRAINER_ACCESS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "get_session_count",
        email,
        trainer_id: trainerId,
      }),
    });
    const data = await res.json();
    return data.count || 0;
  } catch {
    return 0;
  }
}

export async function getSessionLimitInfoAsync(trainerId: TrainerId): Promise<{ limited: boolean; used: number; limit: number }> {
  const sub = getTrainerSubscription();
  if (!sub || sub.allTrainers) return { limited: false, used: 0, limit: Infinity };

  const serverCount = await getServerSessionCount(trainerId);
  const localInfo = getSessionLimitInfo(trainerId);
  const used = Math.max(serverCount, localInfo.used);

  return {
    limited: used >= BASIC_SESSION_LIMIT,
    used,
    limit: BASIC_SESSION_LIMIT,
  };
}

export default {
  hasTrainerAccess,
  isBasicUnbound,
  bindBasicPlan,
  getSessionLimitInfo,
  getSessionLimitInfoAsync,
  getTrainerSubscription,
  activateTrainerPlan,
  syncTrainerSubscription,
  payTrainerPlanFromBalance,
  createTrainerPayment,
  startTrainerSession,
  sendHeartbeat,
  endTrainerSession,
  checkDeviceBlocked,
  saveSessionToServer,
  getSessionsFromServer,
  getServerSessionCount,
  TRAINER_PLANS,
};