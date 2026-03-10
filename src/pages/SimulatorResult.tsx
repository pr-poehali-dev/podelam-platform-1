import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { simulatorApi } from '@/lib/simulatorApi';
import Icon from '@/components/ui/icon';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer,
} from 'recharts';

const COLORS = ['#6366f1', '#22d3ee', '#f59e0b', '#10b981'];

function fmt(n: number) {
  if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(1)} млн`;
  if (Math.abs(n) >= 1_000) return `${(n / 1_000).toFixed(0)} тыс`;
  return String(n);
}

interface VariantResult {
  variant_id: number;
  name: string;
  final_capital: number;
  total_expenses: number;
  total_income: number;
  assets: number;
  quality_index: number;
  risk: string;
  yearly_capital: number[];
}

interface Results {
  period: number;
  variants: VariantResult[];
  recommendation: string;
}

export default function SimulatorResult() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const scenarioId = Number(params.get('scenario_id'));
  const autoRun = params.get('run') === '1';

  const [results, setResults] = useState<Results | null>(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [tab, setTab] = useState<'compare' | 'capital' | 'expenses' | 'quality'>('compare');

  useEffect(() => {
    if (!scenarioId) { navigate('/pro/simulator'); return; }
    if (autoRun) {
      runSimulation();
    } else {
      loadResult();
    }
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

  // Строим данные графиков
  const chartCapital = results ? Array.from({ length: results.period }, (_, i) => {
    const row: Record<string, number | string> = { year: `${i + 1} г` };
    results.variants.forEach(v => { row[v.name] = v.yearly_capital[i] || 0; });
    return row;
  }) : [];

  const chartExpenses = results ? results.variants.map(v => ({
    name: v.name,
    'Расходы': Math.round(v.total_expenses / 1000),
    'Доходы': Math.round(v.total_income / 1000),
  })) : [];

  const chartQuality = results ? results.variants.map(v => ({
    name: v.name,
    'Качество жизни': v.quality_index,
  })) : [];

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-muted-foreground" style={{ background: 'hsl(var(--background))' }}>
        <Icon name="Loader2" size={40} className="animate-spin text-primary" />
        <p className="text-base">{running ? 'Просчитываем сценарии...' : 'Загружаем результаты...'}</p>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: 'hsl(var(--background))' }}>
        <Icon name="AlertCircle" size={40} className="text-muted-foreground" />
        <p className="text-muted-foreground">Результаты не найдены</p>
        <button onClick={() => navigate(`/pro/simulator/edit?id=${scenarioId}`)} className="bg-primary text-white px-6 py-2 rounded-xl">Ввести параметры</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'hsl(var(--background))' }}>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <button onClick={() => navigate('/pro/simulator')} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
          <Icon name="ChevronLeft" size={16} /> Мои сценарии
        </button>

        <div className="flex items-start justify-between gap-4 flex-wrap">
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
          <div className="mt-5 bg-primary/8 border border-primary/20 rounded-2xl px-5 py-4 flex gap-3">
            <Icon name="Sparkles" size={20} className="text-primary shrink-0 mt-0.5" />
            <p className="text-sm text-foreground">{results.recommendation}</p>
          </div>
        )}

        {/* Табы */}
        <div className="mt-6 flex gap-1 p-1 bg-muted rounded-xl w-fit">
          {[
            { id: 'compare' as const, label: 'Сравнение' },
            { id: 'capital' as const, label: 'Капитал' },
            { id: 'expenses' as const, label: 'Расходы' },
            { id: 'quality' as const, label: 'Качество жизни' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${tab === t.id ? 'bg-white text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Таблица сравнения */}
        {tab === 'compare' && (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="text-left">
                  <th className="text-sm font-medium text-muted-foreground py-3 pr-4 min-w-[140px]">Показатель</th>
                  {results.variants.map((v, i) => (
                    <th key={v.variant_id} className="text-sm font-semibold py-3 px-4 text-center" style={{ color: COLORS[i] }}>{v.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { key: 'final_capital', label: 'Итоговый капитал', format: fmt },
                  { key: 'total_income', label: 'Суммарный доход', format: fmt },
                  { key: 'total_expenses', label: 'Суммарные расходы', format: fmt },
                  { key: 'assets', label: 'Активы', format: fmt },
                  { key: 'quality_index', label: 'Индекс качества жизни', format: (n: number) => `${n}/10` },
                  { key: 'risk', label: 'Риск', format: (v: string | number) => String(v) },
                ].map(row => (
                  <tr key={row.key} className="border-t border-border">
                    <td className="py-3 pr-4 text-sm text-muted-foreground">{row.label}</td>
                    {results.variants.map(v => (
                      <td key={v.variant_id} className="py-3 px-4 text-sm font-medium text-center text-foreground">
                        {row.format((v as unknown as Record<string, number | string>)[row.key])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* График капитала */}
        {tab === 'capital' && (
          <div className="mt-5 bg-card border border-border rounded-2xl p-5">
            <h3 className="text-base font-semibold text-foreground mb-4">Динамика капитала по годам (тыс. ₽)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartCapital}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="year" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={v => fmt(Number(v) * 1000)} tick={{ fontSize: 11 }} width={70} />
                <Tooltip formatter={(v: number) => fmt(v)} />
                <Legend />
                {results.variants.map((v, i) => (
                  <Line key={v.variant_id} type="monotone" dataKey={v.name} stroke={COLORS[i]} strokeWidth={2} dot={false} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* График расходов */}
        {tab === 'expenses' && (
          <div className="mt-5 bg-card border border-border rounded-2xl p-5">
            <h3 className="text-base font-semibold text-foreground mb-4">Доходы и расходы (тыс. ₽ за весь период)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartExpenses}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 11 }} width={70} />
                <Tooltip formatter={(v: number) => `${v} тыс. ₽`} />
                <Legend />
                <Bar dataKey="Доходы" fill="#6366f1" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Расходы" fill="#f59e0b" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Качество жизни */}
        {tab === 'quality' && (
          <div className="mt-5">
            <div className="grid sm:grid-cols-2 gap-4">
              {results.variants.map((v, i) => (
                <div key={v.variant_id} className="bg-card border border-border rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-3 h-3 rounded-full" style={{ background: COLORS[i] }} />
                    <h4 className="font-semibold text-foreground">{v.name}</h4>
                  </div>
                  <div className="space-y-3">
                    {[
                      { label: 'Финансы', value: v.quality_index },
                      { label: 'Свободное время', value: Math.max(1, 10 - (v.quality_index - 1)) },
                      { label: 'Риск', value: v.risk === 'низкий' ? 8 : v.risk === 'средний' ? 5 : 2 },
                      { label: 'Комфорт', value: Math.round((v.quality_index + (v.risk === 'низкий' ? 8 : 4)) / 2) },
                    ].map(item => (
                      <div key={item.label}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-muted-foreground">{item.label}</span>
                          <span className="font-medium text-foreground">{item.value}/10</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all" style={{ width: `${item.value * 10}%`, background: COLORS[i] }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Нижние кнопки */}
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
