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

/* ------------------------------------------------------------------ */
/*  ParamFieldDef & FIELDS_BY_TYPE                                    */
/* ------------------------------------------------------------------ */

export interface ParamFieldDef {
  key: string;
  label: string;
  placeholder: string;
  hint?: string;
  step?: string;
}

export const FIELDS_BY_TYPE: Record<string, { title: string; fields: ParamFieldDef[] }[]> = {
  real_estate: [
    {
      title: 'Недвижимость',
      fields: [
        { key: 'property_price', label: 'Цена недвижимости', placeholder: '8 000 000', hint: '₽' },
        { key: 'down_payment', label: 'Первоначальный взнос', placeholder: '2 000 000', hint: '₽' },
        { key: 'mortgage_rate', label: 'Ставка ипотеки', placeholder: '0.12', hint: 'доля/год', step: '0.01' },
        { key: 'mortgage_years', label: 'Срок ипотеки', placeholder: '20', hint: 'лет' },
        { key: 'rent_cost', label: 'Стоимость аренды', placeholder: '40 000', hint: '₽/мес — для сценария "аренда"' },
        { key: 'property_growth_rate', label: 'Рост цены в год', placeholder: '0.05', hint: 'доля', step: '0.01' },
        { key: 'maintenance_rate', label: 'Обслуживание', placeholder: '0.01', hint: 'доля/год', step: '0.001' },
        { key: 'tax_rate', label: 'Налог на имущество', placeholder: '0.001', hint: 'доля/год', step: '0.001' },
      ],
    },
  ],

  car: [
    {
      title: 'Автомобиль',
      fields: [
        { key: 'car_price', label: 'Цена автомобиля', placeholder: '2 500 000', hint: '₽' },
        { key: 'fuel_cost_month', label: 'Топливо', placeholder: '8 000', hint: '₽/мес' },
        { key: 'insurance_year', label: 'Страховка', placeholder: '50 000', hint: '₽/год' },
        { key: 'maintenance_year', label: 'Обслуживание', placeholder: '30 000', hint: '₽/год' },
        { key: 'depreciation_rate', label: 'Амортизация', placeholder: '0.10', hint: 'доля/год', step: '0.01' },
      ],
    },
  ],

  job: [
    {
      title: 'Карьера',
      fields: [
        { key: 'current_salary', label: 'Текущая зарплата', placeholder: '130 000', hint: '₽/мес' },
        { key: 'new_salary', label: 'Новая зарплата', placeholder: '200 000', hint: '₽/мес' },
        { key: 'salary_growth_current', label: 'Рост текущей', placeholder: '0.04', hint: 'доля/год', step: '0.01' },
        { key: 'salary_growth_new', label: 'Рост новой', placeholder: '0.10', hint: 'доля/год', step: '0.01' },
        { key: 'job_loss_probability', label: 'Вероятность потери работы', placeholder: '0.05', hint: 'доля', step: '0.01' },
      ],
    },
  ],

  business: [
    {
      title: 'Бизнес',
      fields: [
        { key: 'startup_investment', label: 'Стартовые вложения', placeholder: '500 000', hint: '₽' },
        { key: 'monthly_revenue', label: 'Выручка', placeholder: '100 000', hint: '₽/мес' },
        { key: 'monthly_business_expenses', label: 'Расходы бизнеса', placeholder: '100 000', hint: '₽/мес' },
        { key: 'revenue_growth_rate', label: 'Рост выручки', placeholder: '0.25', hint: 'доля/год', step: '0.01' },
        { key: 'success_probability', label: 'Вероятность успеха', placeholder: '0.70', hint: 'доля', step: '0.01' },
      ],
    },
  ],

  relocation: [
    {
      title: 'Переезд',
      fields: [
        { key: 'current_salary', label: 'Текущая зарплата', placeholder: '120 000', hint: '₽/мес' },
        { key: 'new_city_salary', label: 'Зарплата в новом городе', placeholder: '200 000', hint: '₽/мес' },
        { key: 'current_cost_living', label: 'Расходы текущие', placeholder: '65 000', hint: '₽/мес' },
        { key: 'new_cost_living', label: 'Расходы в новом городе', placeholder: '120 000', hint: '₽/мес' },
        { key: 'relocation_cost', label: 'Стоимость переезда', placeholder: '300 000', hint: '₽' },
      ],
    },
  ],

  credit: [
    {
      title: 'Кредит',
      fields: [
        { key: 'credit_principal', label: 'Сумма кредита', placeholder: '3 000 000', hint: '₽' },
        { key: 'credit_rate', label: 'Ставка', placeholder: '0.18', hint: 'доля/год', step: '0.01' },
        { key: 'credit_months', label: 'Срок кредита', placeholder: '120', hint: 'месяцев' },
      ],
    },
  ],

  investment: [
    {
      title: 'Инвестиции',
      fields: [
        { key: 'initial_investment', label: 'Начальная сумма', placeholder: '500 000', hint: '₽' },
        { key: 'monthly_investment', label: 'Ежемесячно', placeholder: '20 000', hint: '₽' },
        { key: 'investment_return_rate', label: 'Доходность', placeholder: '0.12', hint: 'доля/год', step: '0.01' },
        { key: 'volatility', label: 'Волатильность', placeholder: '0.15', hint: '0–1', step: '0.01' },
      ],
    },
  ],

  education: [
    {
      title: 'Кредит на обучение',
      fields: [
        { key: 'credit_principal', label: 'Сумма кредита', placeholder: '500 000', hint: '₽' },
        { key: 'credit_rate', label: 'Ставка', placeholder: '0.10', hint: 'доля/год', step: '0.01' },
        { key: 'credit_months', label: 'Срок кредита', placeholder: '60', hint: 'месяцев' },
      ],
    },
  ],

  free: [],
};

/* ------------------------------------------------------------------ */
/*  Simulator Templates                                               */
/* ------------------------------------------------------------------ */

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
          property_price: 8000000,
          down_payment: 2000000,
          mortgage_rate: 0.12,
          mortgage_years: 20,
          property_growth_rate: 0.05,
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
          expenses: 70000,
          rent_cost: 40000,
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
          car_price: 2500000,
          fuel_cost_month: 8000,
          insurance_year: 50000,
          maintenance_year: 30000,
          depreciation_rate: 0.10,
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
          car_price: 2500000,
          fuel_cost_month: 8000,
          insurance_year: 50000,
          maintenance_year: 30000,
          depreciation_rate: 0.10,
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
          current_salary: 130000,
          salary_growth_current: 0.04,
          job_loss_probability: 0.03,
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
          new_salary: 200000,
          salary_growth_new: 0.10,
          job_loss_probability: 0.12,
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
          current_salary: 120000,
          current_cost_living: 65000,
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
          new_city_salary: 200000,
          new_cost_living: 120000,
          relocation_cost: 300000,
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
          startup_investment: 500000,
          monthly_revenue: 100000,
          monthly_business_expenses: 100000,
          revenue_growth_rate: 0.25,
          success_probability: 0.70,
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
