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
