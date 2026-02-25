export const ADMIN_URL = "https://functions.poehali.dev/91afbdc0-3ea5-4c84-9ae2-510594dec646";
export const SETTINGS_URL = "https://functions.poehali.dev/9b051641-9091-421a-ac74-86d1aed78798";

export interface Stats {
  total_users: number;
  total_payments: number;
  total_revenue: number;
  payments_month: number;
  revenue_month: number;
}

export interface Client {
  id: number;
  name: string;
  email: string;
  created_at: string;
  last_login: string | null;
  total_paid: number;
  payments_count: number;
  balance: number;
  subscription_expires: string | null;
  paid_tools: string;
  total_topup: number;
  total_spent: number;
}

export interface Payment {
  id: number;
  user_name: string;
  user_email: string;
  amount: number;
  tariff: string;
  status: string;
  created_at: string;
}

export type Tab = "clients" | "payments";

export const TOOL_LABELS: Record<string, string> = {
  "psych-bot": "Психоанализ",
  "barrier-bot": "Барьеры",
  "income-bot": "Доход",
  "plan-bot": "План",
  "progress": "Прогресс",
  "diary": "Дневник",
};

export function formatDate(s: string | null) {
  if (!s) return "—";
  const d = new Date(s);
  return d.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" }) +
    " " + d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
}

export function formatMoney(n: number) {
  return Number(n).toLocaleString("ru-RU") + " ₽";
}
