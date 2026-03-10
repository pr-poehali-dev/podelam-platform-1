import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { simulatorApi } from '@/lib/simulatorApi';
import Icon from '@/components/ui/icon';
import {
  LineChart, Line, BarChart, Bar, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

const COLORS = ['#6366f1', '#22d3ee', '#f59e0b'];
const VARIANT_LABELS = ['A', 'B', 'C'];

function fmt(n: number) {
  if (!isFinite(n)) return '—';
  const abs = Math.abs(n);
  const sign = n < 0 ? '−' : '';
  if (abs >= 1_000_000) return `${sign}${(abs / 1_000_000).toFixed(1)} млн`;
  if (abs >= 1_000) return `${sign}${(abs / 1_000).toFixed(0)} тыс`;
  return `${sign}${abs}`;
}

function fmtR(n: number) { return fmt(n) + ' ₽'; }

interface YearRow {
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
}

interface Final {
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
}

interface VariantResult {
  variant_id: number;
  name: string;
  final: Final;
  yearly: YearRow[];
}

interface Results {
  period: number;
  variants: VariantResult[];
  recommendation: string;
}

type Tab = 'compare' | 'networth' | 'income' | 'quality' | 'detail';

const COMPARE_ROWS: { key: keyof Final; label: string; fmt: (n: number) => string }[] = [
  { key: 'net_worth', label: 'Чистый капитал', fmt: fmtR },
  { key: 'capital', label: 'Ликвидный капитал', fmt: fmtR },
  { key: 'invest_portfolio', label: 'Инвестиции', fmt: fmtR },
  { key: 'asset_value', label: 'Активы', fmt: fmtR },
  { key: 'debt_remaining', label: 'Остаток долга', fmt: fmtR },
  { key: 'total_income', label: 'Суммарный доход', fmt: fmtR },
  { key: 'total_expenses', label: 'Суммарные расходы', fmt: fmtR },
  { key: 'life_index', label: 'Индекс качества жизни', fmt: (n) => `${n.toFixed(1)}/10` },
  { key: 'stress_index', label: 'Стресс', fmt: (n) => `${n.toFixed(1)}/10` },
  { key: 'risk_index', label: 'Риск', fmt: (n) => `${n.toFixed(1)}/10` },
  { key: 'fin_stability', label: 'Финансовая устойчивость', fmt: (n) => n >= 3 ? `${n.toFixed(1)} — устойчиво` : n >= 1 ? `${n.toFixed(1)} — средне` : `${n.toFixed(1)} — риск` },
  { key: 'scenario_score', label: 'Итоговый рейтинг', fmt: (n) => `${n.toFixed(1)}/10` },
];

export default function SimulatorResult() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const scenarioId = Number(params.get('scenario_id'));
  const autoRun = params.get('run') === '1';

  const [results, setResults] = useState<Results | null>(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [tab, setTab] = useState<Tab>('compare');
  const [detailVariant, setDetailVariant] = useState(0);

  useEffect(() => {
    if (!scenarioId) { navigate('/pro/simulator'); return; }
    if (autoRun) runSimulation(); else loadResult();
  }, [scenarioId]);

  async function runSimulation() {
    setRunning(true);
    setLoading(true);
    const data = await simulatorApi.run(scenarioId);
    if (data.results) setResults(data.results);
    setLoading(false);
    setRunning(false);
  }

  async function loadResult() {
    setLoading(true);
    const data = await simulatorApi.getResult(scenarioId);
    if (data.results) setResults(data.results);
    setLoading(false);
  }

  const chartNetWorth = results ? (results.variants[0]?.yearly ?? []).map((_, i) => {
    const row: Record<string, number | string> = { year: `${i + 1} г` };
    results.variants.forEach(v => { row[v.name] = Math.round(v.yearly[i]?.net_worth ?? 0); });
    return row;
  }) : [];

  const chartIncomeExpenses = results ? (results.variants[detailVariant]?.yearly ?? []).map(y => ({
    year: `${y.year} г`,
    'Доход': Math.round(y.income / 1000),
    'Расходы': Math.round(y.expenses / 1000),
    'Накопления': Math.round(y.savings / 1000),
  })) : [];

  const radarData = results ? [
    { subject: 'Финансы', ...Object.fromEntries(results.variants.map(v => [v.name, +v.final.scenario_score.toFixed(1)])) },
    { subject: 'Время', ...Object.fromEntries(results.variants.map(v => [v.name, +Math.min(10, v.final.free_time_hours / 876).toFixed(1)])) },
    { subject: 'Низкий стресс', ...Object.fromEntries(results.variants.map(v => [v.name, +Math.max(0, 10 - v.final.stress_index).toFixed(1)])) },
    { subject: 'Устойчивость', ...Object.fromEntries(results.variants.map(v => [v.name, +Math.min(10, v.final.fin_stability * 3).toFixed(1)])) },
    { subject: 'Низкий риск', ...Object.fromEntries(results.variants.map(v => [v.name, +Math.max(0, 10 - v.final.risk_index).toFixed(1)])) },
  ] : [];

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: 'hsl(var(--background))' }}>
        <Icon name="Loader2" size={40} className="animate-spin text-primary" />
        <p className="text-muted-foreground">{running ? 'Просчитываем сценарии...' : 'Загружаем результаты...'}</p>
      </div>
    );
  }

  if (!results?.variants?.length) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: 'hsl(var(--background))' }}>
        <Icon name="AlertCircle" size={40} className="text-muted-foreground" />
        <p className="text-muted-foreground">Результаты не найдены</p>
        <button onClick={() => navigate(`/pro/simulator/edit?id=${scenarioId}`)} className="bg-primary text-white px-6 py-2 rounded-xl text-sm">Ввести параметры</button>
      </div>
    );
  }

  const bestIdx = results.variants.reduce((bi, v, i, arr) =>
    v.final.scenario_score > arr[bi].final.scenario_score ? i : bi, 0);

  return (
    <div className="min-h-screen" style={{ background: 'hsl(var(--background))' }}>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <button onClick={() => navigate('/pro/simulator')} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
          <Icon name="ChevronLeft" size={16} /> Мои сценарии
        </button>

        <div className="flex items-start justify-between gap-4 flex-wrap mb-5">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Результаты симуляции</h1>
            <p className="text-muted-foreground mt-1">Горизонт анализа: {results.period} лет</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => navigate(`/pro/simulator/edit?id=${scenarioId}`)} className="flex items-center gap-1 border border-border rounded-xl px-4 py-2 text-sm hover:bg-muted">
              <Icon name="Pencil" size={14} /> Изменить
            </button>
            <button onClick={runSimulation} disabled={running} className="flex items-center gap-1 bg-primary text-white rounded-xl px-4 py-2 text-sm hover:opacity-90">
              <Icon name="RefreshCw" size={14} /> Пересчитать
            </button>
          </div>
        </div>

        {/* Вывод системы */}
        {results.recommendation && (
          <div className="bg-primary/8 border border-primary/20 rounded-2xl px-5 py-4 flex gap-3 mb-6">
            <Icon name="Sparkles" size={20} className="text-primary shrink-0 mt-0.5" />
            <p className="text-sm text-foreground">{results.recommendation}</p>
          </div>
        )}

        {/* Карточки рейтинга */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          {results.variants.map((v, i) => (
            <div key={v.variant_id} className={`rounded-2xl border p-4 ${i === bestIdx ? 'border-primary bg-primary/5' : 'border-border bg-card'}`}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: COLORS[i] }}>
                  {VARIANT_LABELS[i]}
                </div>
                <span className="font-semibold text-sm text-foreground truncate flex-1">{v.name}</span>
                {i === bestIdx && <span className="text-xs text-primary font-bold shrink-0">★ Лучший</span>}
              </div>
              <div className="text-2xl font-black text-foreground">
                {v.final.scenario_score.toFixed(1)}<span className="text-sm font-normal text-muted-foreground">/10</span>
              </div>
              <div className="text-xs text-muted-foreground">рейтинг сценария</div>
              <div className="mt-2 text-sm font-semibold text-foreground">{fmtR(v.final.net_worth)}</div>
              <div className="text-xs text-muted-foreground">чистый капитал</div>
              <div className="text-xs text-muted-foreground mt-1 capitalize">{v.final.investor_type}</div>
            </div>
          ))}
        </div>

        {/* Табы */}
        <div className="flex gap-1 p-1 bg-muted rounded-xl w-fit mb-6 flex-wrap">
          {([
            { id: 'compare', label: 'Сравнение' },
            { id: 'networth', label: 'Капитал' },
            { id: 'income', label: 'Доходы' },
            { id: 'quality', label: 'Качество жизни' },
            { id: 'detail', label: 'По годам' },
          ] as { id: Tab; label: string }[]).map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${tab === t.id ? 'bg-white text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Сравнение */}
        {tab === 'compare' && (
          <div className="overflow-x-auto bg-card border border-border rounded-2xl">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="text-left text-sm font-medium text-muted-foreground py-3 px-5 min-w-[180px]">Показатель</th>
                  {results.variants.map((v, i) => (
                    <th key={v.variant_id} className="text-sm font-semibold py-3 px-4 text-center" style={{ color: COLORS[i] }}>{v.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARE_ROWS.map(row => (
                  <tr key={row.key} className="border-t border-border">
                    <td className="py-3 px-5 text-sm text-muted-foreground">{row.label}</td>
                    {results.variants.map(v => (
                      <td key={v.variant_id} className="py-3 px-4 text-sm font-medium text-center text-foreground">
                        {row.fmt(v.final[row.key] as number)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Чистый капитал */}
        {tab === 'networth' && (
          <div className="bg-card border border-border rounded-2xl p-5">
            <h3 className="text-base font-semibold mb-4">Чистый капитал по годам</h3>
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={chartNetWorth}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="year" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={v => fmt(Number(v))} tick={{ fontSize: 11 }} width={80} />
                <Tooltip formatter={(v: number) => fmtR(v)} />
                <Legend />
                {results.variants.map((v, i) => (
                  <Line key={v.variant_id} type="monotone" dataKey={v.name} stroke={COLORS[i]} strokeWidth={2.5} dot={false} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Доходы/расходы */}
        {tab === 'income' && (
          <div className="space-y-4">
            <div className="flex gap-2 flex-wrap">
              {results.variants.map((v, i) => (
                <button key={v.variant_id} onClick={() => setDetailVariant(i)}
                  className={`px-4 py-1.5 rounded-xl text-sm border transition-all ${detailVariant === i ? 'text-white border-transparent' : 'border-border text-foreground hover:bg-muted'}`}
                  style={detailVariant === i ? { background: COLORS[i] } : {}}>
                  {v.name}
                </button>
              ))}
            </div>
            <div className="bg-card border border-border rounded-2xl p-5">
              <h3 className="text-base font-semibold mb-4">Доходы, расходы и накопления (тыс. ₽/год)</h3>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={chartIncomeExpenses}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} width={60} />
                  <Tooltip formatter={(v: number) => `${v} тыс. ₽`} />
                  <Legend />
                  <Bar dataKey="Доход" fill={COLORS[detailVariant]} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Расходы" fill="#f87171" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Накопления" fill="#34d399" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Качество жизни */}
        {tab === 'quality' && (
          <div className="space-y-4">
            <div className="bg-card border border-border rounded-2xl p-5">
              <h3 className="text-base font-semibold mb-4">Индекс жизненного баланса</h3>
              <ResponsiveContainer width="100%" height={320}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12 }} />
                  {results.variants.map((v, i) => (
                    <Radar key={v.variant_id} name={v.name} dataKey={v.name} stroke={COLORS[i]} fill={COLORS[i]} fillOpacity={0.15} />
                  ))}
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {results.variants.map((v, i) => (
                <div key={v.variant_id} className="bg-card border border-border rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-3 h-3 rounded-full" style={{ background: COLORS[i] }} />
                    <h4 className="font-semibold text-foreground text-sm">{v.name}</h4>
                  </div>
                  {[
                    { label: 'Качество жизни', value: v.final.life_index },
                    { label: 'Финансовая устойчивость', value: Math.min(10, v.final.fin_stability * 3) },
                    { label: 'Низкий стресс', value: Math.max(0, 10 - v.final.stress_index) },
                    { label: 'Низкий риск', value: Math.max(0, 10 - v.final.risk_index) },
                    { label: 'Свободное время', value: Math.min(10, v.final.free_time_hours / 876) },
                  ].map(item => (
                    <div key={item.label} className="mb-2.5">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground">{item.label}</span>
                        <span className="font-medium text-foreground">{item.value.toFixed(1)}</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{ width: `${(item.value / 10) * 100}%`, background: COLORS[i] }} />
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* По годам */}
        {tab === 'detail' && (
          <div className="space-y-4">
            <div className="flex gap-2 flex-wrap">
              {results.variants.map((v, i) => (
                <button key={v.variant_id} onClick={() => setDetailVariant(i)}
                  className={`px-4 py-1.5 rounded-xl text-sm border transition-all ${detailVariant === i ? 'text-white border-transparent' : 'border-border text-foreground hover:bg-muted'}`}
                  style={detailVariant === i ? { background: COLORS[i] } : {}}>
                  {v.name}
                </button>
              ))}
            </div>
            <div className="overflow-x-auto bg-card border border-border rounded-2xl">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="text-xs text-muted-foreground border-b border-border text-left">
                    <th className="py-3 px-4">Год</th>
                    <th className="py-3 px-4">Доход</th>
                    <th className="py-3 px-4">Расходы</th>
                    <th className="py-3 px-4">Накопления</th>
                    <th className="py-3 px-4">Чистый капитал</th>
                    <th className="py-3 px-4">Инвестиции</th>
                    <th className="py-3 px-4">Жизнь</th>
                    <th className="py-3 px-4">Риск</th>
                  </tr>
                </thead>
                <tbody>
                  {(results.variants[detailVariant]?.yearly ?? []).map(y => (
                    <tr key={y.year} className="border-t border-border hover:bg-muted/30">
                      <td className="py-2.5 px-4 font-medium">{y.year}</td>
                      <td className="py-2.5 px-4 text-emerald-600">{fmtR(y.income)}</td>
                      <td className="py-2.5 px-4 text-rose-500">{fmtR(y.expenses)}</td>
                      <td className={`py-2.5 px-4 ${y.savings >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>{fmtR(y.savings)}</td>
                      <td className={`py-2.5 px-4 font-semibold ${y.net_worth >= 0 ? 'text-foreground' : 'text-rose-500'}`}>{fmtR(y.net_worth)}</td>
                      <td className="py-2.5 px-4 text-indigo-500">{fmtR(y.invest_portfolio)}</td>
                      <td className="py-2.5 px-4">{y.life_index.toFixed(1)}</td>
                      <td className="py-2.5 px-4">{y.risk_index.toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="mt-8 flex gap-3 flex-wrap">
          <button onClick={() => navigate(`/pro/simulator/edit?id=${scenarioId}`)} className="flex items-center gap-2 border border-border rounded-xl px-5 py-3 text-sm hover:bg-muted">
            <Icon name="Pencil" size={16} /> Изменить параметры
          </button>
          <button onClick={() => navigate('/pro/simulator/create')} className="flex items-center gap-2 border border-border rounded-xl px-5 py-3 text-sm hover:bg-muted">
            <Icon name="Plus" size={16} /> Новый сценарий
          </button>
        </div>
      </div>
    </div>
  );
}
