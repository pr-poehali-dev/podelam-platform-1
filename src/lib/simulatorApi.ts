const BASE = 'https://functions.poehali.dev/5af702ea-5077-43e6-a08b-145e4be0df50';

function getUserId(): number | null {
  const raw = localStorage.getItem('pdd_user');
  if (!raw) return null;
  const u = JSON.parse(raw);
  return u.id || null;
}

async function get(action: string, extra: Record<string, string> = {}) {
  const uid = getUserId();
  const p = new URLSearchParams({ action, user_id: String(uid), ...extra });
  const r = await fetch(`${BASE}?${p}`);
  return r.json();
}

async function post(action: string, body: object) {
  const uid = getUserId();
  const r = await fetch(`${BASE}?action=${action}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: uid, ...body }),
  });
  return r.json();
}

export const simulatorApi = {
  list: () => get('list'),
  create: (data: object) => post('create', data),
  update: (data: object) => post('update', data),
  run: (scenario_id: number) => post('run', { scenario_id }),
  getResult: (scenario_id: number) => get('get_result', { scenario_id: String(scenario_id) }),
  delete: (scenario_id: number) => post('delete', { scenario_id }),
  getUserId,
};

export type ScenarioType =
  | 'real_estate' | 'job' | 'business' | 'credit'
  | 'relocation' | 'car' | 'education' | 'investment' | 'free';

export const SCENARIO_TYPES: { id: ScenarioType; label: string; icon: string }[] = [
  { id: 'real_estate', label: 'Недвижимость', icon: 'Home' },
  { id: 'job', label: 'Работа', icon: 'Briefcase' },
  { id: 'business', label: 'Бизнес', icon: 'TrendingUp' },
  { id: 'credit', label: 'Кредит', icon: 'CreditCard' },
  { id: 'relocation', label: 'Переезд', icon: 'MapPin' },
  { id: 'car', label: 'Автомобиль', icon: 'Car' },
  { id: 'education', label: 'Образование', icon: 'GraduationCap' },
  { id: 'investment', label: 'Инвестиции', icon: 'BarChart2' },
  { id: 'free', label: 'Свободный сценарий', icon: 'Sparkles' },
];

export interface SimTemplate {
  id: string;
  type: ScenarioType;
  title: string;
  description: string;
  icon: string;
  period: number;
  variants: {
    name: string;
    parameters: Record<string, number>;
  }[];
}

export const SIMULATOR_TEMPLATES: SimTemplate[] = [
  {
    id: 'mortgage_vs_rent',
    type: 'real_estate',
    title: 'Ипотека или аренда',
    description: 'Покупка квартиры в ипотеку vs аренда и инвестиции',
    icon: 'Home',
    period: 20,
    variants: [
      {
        name: 'Купить в ипотеку',
        parameters: {
          income: 200000,
          expenses: 70000,
          asset_cost: 8000000,
          asset_growth: 0.05,
          credit_principal: 6000000,
          credit_rate: 0.12,
          credit_months: 240,
          investments: 5000,
          invest_return: 0.12,
          income_growth: 0.05,
          inflation: 0.07,
          work_hours_week: 40,
          risk_probability: 0.05,
        },
      },
      {
        name: 'Арендовать и копить',
        parameters: {
          income: 200000,
          expenses: 110000,
          investments: 60000,
          invest_return: 0.15,
          income_growth: 0.07,
          inflation: 0.07,
          work_hours_week: 40,
          risk_probability: 0.05,
        },
      },
    ],
  },
  {
    id: 'car_credit_vs_save',
    type: 'car',
    title: 'Автомобиль: кредит или накопить',
    description: 'Взять авто в кредит сейчас vs накопить и купить позже',
    icon: 'Car',
    period: 5,
    variants: [
      {
        name: 'Кредит сейчас',
        parameters: {
          income: 150000,
          expenses: 60000,
          asset_cost: 2500000,
          asset_growth: -0.10,
          credit_principal: 2000000,
          credit_rate: 0.20,
          credit_months: 60,
          income_growth: 0.05,
          inflation: 0.07,
          work_hours_week: 40,
          risk_probability: 0.05,
        },
      },
      {
        name: 'Накопить за 2 года',
        parameters: {
          income: 150000,
          expenses: 60000,
          investments: 60000,
          invest_return: 0.12,
          income_growth: 0.05,
          inflation: 0.07,
          work_hours_week: 40,
          risk_probability: 0.05,
        },
      },
    ],
  },
  {
    id: 'job_change',
    type: 'job',
    title: 'Смена работы',
    description: 'Остаться на текущем месте vs уйти на новое с риском',
    icon: 'Briefcase',
    period: 10,
    variants: [
      {
        name: 'Остаться',
        parameters: {
          income: 130000,
          expenses: 80000,
          investments: 15000,
          invest_return: 0.12,
          income_growth: 0.04,
          inflation: 0.07,
          work_hours_week: 40,
          stress_coeff: 1.0,
          risk_probability: 0.03,
        },
      },
      {
        name: 'Сменить работу',
        parameters: {
          income: 200000,
          expenses: 90000,
          investments: 30000,
          invest_return: 0.12,
          income_growth: 0.10,
          inflation: 0.07,
          work_hours_week: 50,
          stress_coeff: 1.5,
          risk_probability: 0.12,
        },
      },
    ],
  },
  {
    id: 'relocation',
    type: 'relocation',
    title: 'Переезд в другой город',
    description: 'Жить в текущем городе vs переехать туда, где выше зарплата',
    icon: 'MapPin',
    period: 10,
    variants: [
      {
        name: 'Остаться',
        parameters: {
          income: 120000,
          expenses: 65000,
          investments: 20000,
          invest_return: 0.12,
          income_growth: 0.05,
          inflation: 0.07,
          work_hours_week: 40,
          commute_hours_week: 7,
          risk_probability: 0.04,
        },
      },
      {
        name: 'Переехать',
        parameters: {
          income: 200000,
          expenses: 120000,
          start_capital: -300000,
          investments: 30000,
          invest_return: 0.12,
          income_growth: 0.08,
          inflation: 0.07,
          work_hours_week: 45,
          commute_hours_week: 3,
          risk_probability: 0.08,
        },
      },
    ],
  },
  {
    id: 'business_vs_job',
    type: 'business',
    title: 'Бизнес или работа по найму',
    description: 'Открыть своё дело vs продолжать работать в найме',
    icon: 'TrendingUp',
    period: 10,
    variants: [
      {
        name: 'Работа по найму',
        parameters: {
          income: 180000,
          expenses: 90000,
          investments: 20000,
          invest_return: 0.12,
          income_growth: 0.06,
          inflation: 0.07,
          work_hours_week: 40,
          stress_coeff: 1.0,
          risk_probability: 0.04,
        },
      },
      {
        name: 'Открыть бизнес',
        parameters: {
          income: 100000,
          expenses: 100000,
          start_capital: -500000,
          income_growth: 0.25,
          inflation: 0.07,
          work_hours_week: 60,
          stress_coeff: 1.8,
          risk_probability: 0.20,
        },
      },
    ],
  },
  {
    id: 'education',
    type: 'education',
    title: 'Инвестиции в образование',
    description: 'Платное обучение для роста дохода vs работа без диплома',
    icon: 'GraduationCap',
    period: 15,
    variants: [
      {
        name: 'Учиться',
        parameters: {
          income: 60000,
          expenses: 100000,
          credit_principal: 500000,
          credit_rate: 0.10,
          credit_months: 60,
          income_growth: 0.15,
          inflation: 0.07,
          work_hours_week: 20,
          risk_probability: 0.05,
        },
      },
      {
        name: 'Работать сразу',
        parameters: {
          income: 80000,
          expenses: 55000,
          investments: 10000,
          invest_return: 0.12,
          income_growth: 0.05,
          inflation: 0.07,
          work_hours_week: 40,
          risk_probability: 0.04,
        },
      },
    ],
  },
];