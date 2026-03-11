export const COLORS = ['#6366f1', '#22d3ee', '#f59e0b'];
export const VARIANT_LABELS = ['A', 'B', 'C'];

export function fmt(n: number) {
  if (!isFinite(n)) return '—';
  const abs = Math.abs(n);
  const sign = n < 0 ? '−' : '';
  if (abs >= 1_000_000) return `${sign}${(abs / 1_000_000).toFixed(1)} млн`;
  if (abs >= 1_000) return `${sign}${(abs / 1_000).toFixed(0)} тыс`;
  return `${sign}${Math.round(abs)}`;
}
export function fmtR(n: number) { return fmt(n) + ' ₽'; }

export interface YearRow {
  year: number;
  income: number;
  expenses: number;
  savings: number;
  capital: number;
  invest_portfolio: number;
  asset_value: number;
  net_worth: number;
  debt_remaining: number;
  free_time_hours: number;
  stress_index: number;
  life_index: number;
  fin_stability: number;
  risk_index: number;
  real_capital: number;
}

export interface EconomicSummary {
  daily_income: number;
  daily_expenses: number;
  daily_free_budget: number;
  cost_of_life_day: number;
  life_hour_value: number;
  safety_months: number;
  safety_days: number;
  nominal_capital: number;
  real_capital: number;
  real_income_growth: number;
  daily_cost_projection: { year: number; daily_cost: number }[];
}

export interface Final {
  net_worth: number;
  capital: number;
  invest_portfolio: number;
  asset_value: number;
  total_income: number;
  total_expenses: number;
  total_savings: number;
  debt_remaining: number;
  life_index: number;
  stress_index: number;
  free_time_hours: number;
  fin_stability: number;
  risk_index: number;
  scenario_score: number;
  investor_type: string;
  real_capital: number;
  daily_free_budget: number;
  cost_of_life_day: number;
  safety_months: number;
}

export interface VariantResult {
  variant_id: number;
  name: string;
  final: Final;
  yearly: YearRow[];
  economic_summary?: EconomicSummary;
}

export interface Results {
  period: number;
  variants: VariantResult[];
  recommendation: string;
}

export type Tab = 'compare' | 'economics' | 'networth' | 'income' | 'quality' | 'detail';

export const COMPARE_ROWS: { key: keyof Final; label: string; fmt: (n: number) => string }[] = [
  { key: 'net_worth', label: 'Чистый капитал', fmt: fmtR },
  { key: 'capital', label: 'Ликвидный капитал', fmt: fmtR },
  { key: 'real_capital', label: 'Реальный капитал', fmt: fmtR },
  { key: 'invest_portfolio', label: 'Инвестиции', fmt: fmtR },
  { key: 'asset_value', label: 'Активы', fmt: fmtR },
  { key: 'debt_remaining', label: 'Остаток долга', fmt: fmtR },
  { key: 'total_income', label: 'Суммарный доход', fmt: fmtR },
  { key: 'total_expenses', label: 'Суммарные расходы', fmt: fmtR },
  { key: 'daily_free_budget', label: 'Свободный бюджет/день', fmt: fmtR },
  { key: 'cost_of_life_day', label: 'Стоимость дня жизни', fmt: fmtR },
  { key: 'safety_months', label: 'Фин. безопасность', fmt: (n) => n >= 12 ? `${n.toFixed(0)} мес.` : n >= 6 ? `${n.toFixed(1)} мес.` : `${n.toFixed(1)} мес. ⚠` },
  { key: 'life_index', label: 'Качество жизни', fmt: (n) => `${n.toFixed(1)}/10` },
  { key: 'stress_index', label: 'Стресс', fmt: (n) => `${n.toFixed(1)}/10` },
  { key: 'risk_index', label: 'Риск', fmt: (n) => `${n.toFixed(1)}/10` },
  { key: 'fin_stability', label: 'Устойчивость', fmt: (n) => n >= 3 ? `${n.toFixed(1)} — ok` : n >= 1 ? `${n.toFixed(1)} — средне` : `${n.toFixed(1)} — риск` },
  { key: 'scenario_score', label: 'Рейтинг', fmt: (n) => `${n.toFixed(1)}/10` },
];
