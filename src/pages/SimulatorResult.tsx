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
  return `${sign}${Math.round(abs)}`;
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
  real_capital: number;
}

interface EconomicSummary {
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
  real_capital: number;
  daily_free_budget: number;
  cost_of_life_day: number;
  safety_months: number;
}

interface VariantResult {
  variant_id: number;
  name: string;
  final: Final;
  yearly: YearRow[];
  economic_summary?: EconomicSummary;
}

interface Results {
  period: number;
  variants: VariantResult[];
  recommendation: string;
}

type Tab = 'compare' | 'economics' | 'networth' | 'income' | 'quality' | 'detail';

const COMPARE_ROWS: { key: keyof Final; label: string; fmt: (n: number) => string }[] = [
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

  function handleDownloadPdf() {
    if (!results) return;
    const rows = COMPARE_ROWS.map(r => {
      const cells = results.variants.map(v => r.fmt(v.final[r.key] as number));
      return `<tr><td style="padding:6px 10px;border-bottom:1px solid #e5e7eb">${r.label}</td>${cells.map(c => `<td style="padding:6px 10px;text-align:center;border-bottom:1px solid #e5e7eb">${c}</td>`).join('')}</tr>`;
    }).join('');
    const detailTables = results.variants.map(v => {
      const headerRow = `<tr><th>Год</th><th>Доход</th><th>Расходы</th><th>Капитал</th><th>Инвестиции</th><th>Жизнь</th><th>Риск</th></tr>`;
      const bodyRows = v.yearly.map(y => `<tr><td>${y.year}</td><td>${fmtR(y.income)}</td><td>${fmtR(y.expenses)}</td><td>${fmtR(y.net_worth)}</td><td>${fmtR(y.invest_portfolio)}</td><td>${y.life_index.toFixed(1)}</td><td>${y.risk_index.toFixed(1)}</td></tr>`).join('');
      return `<h3 style="margin:20px 0 8px">${v.name} (рейтинг: ${v.final.scenario_score.toFixed(1)}/10)</h3><table style="width:100%;border-collapse:collapse;font-size:12px" border="1" cellpadding="5">${headerRow}${bodyRows}</table>`;
    }).join('');
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Симулятор — результаты</title><style>body{font-family:sans-serif;padding:30px;font-size:13px;color:#1a1a2e}table{width:100%;border-collapse:collapse}th{background:#f3f4f6;padding:6px 10px;text-align:center;border-bottom:2px solid #d1d5db}td{padding:6px 10px}h1{font-size:20px;margin-bottom:4px}h2{font-size:16px;margin:18px 0 8px;color:#6366f1}h3{font-size:14px;color:#333}p{margin:4px 0;color:#555}.rec{background:#eff6ff;border:1px solid #bfdbfe;padding:10px 14px;border-radius:8px;margin:14px 0}@media print{body{padding:10px}}</style></head><body>
    <h1>Симулятор жизненных решений — ПоДелам</h1>
    <p>Горизонт анализа: ${results.period} лет</p>
    ${results.recommendation ? `<div class="rec">${results.recommendation}</div>` : ''}
    <h2>Сравнение сценариев</h2>
    <table><thead><tr><th style="text-align:left">Показатель</th>${results.variants.map(v => `<th>${v.name}</th>`).join('')}</tr></thead><tbody>${rows}</tbody></table>
    <h2>Детальный анализ по годам</h2>
    ${detailTables}
    <p style="margin-top:30px;font-size:11px;color:#999">Сгенерировано на podelam.online · ${new Date().toLocaleDateString('ru')}</p>
    </body></html>`;
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const w = window.open(url, '_blank');
    if (w) setTimeout(() => { w.print(); }, 500);
    else {
      const a = document.createElement('a');
      a.href = url;
      a.download = 'simulator-results.html';
      a.click();
    }
  }

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
    const row: Record<string, number | string> = { year: `${i + 1}г` };
    results.variants.forEach(v => { row[v.name] = Math.round(v.yearly[i]?.net_worth ?? 0); });
    return row;
  }) : [];

  const chartIncomeExpenses = results ? (results.variants[detailVariant]?.yearly ?? []).map(y => ({
    year: `${y.year}г`,
    'Доход': Math.round(y.income / 1000),
    'Расходы': Math.round(y.expenses / 1000),
    'Накопления': Math.round(y.savings / 1000),
  })) : [];

  const radarData = results ? [
    { subject: 'Финансы', ...Object.fromEntries(results.variants.map(v => [v.name, +v.final.scenario_score.toFixed(1)])) },
    { subject: 'Время', ...Object.fromEntries(results.variants.map(v => [v.name, +Math.min(10, v.final.free_time_hours / 876).toFixed(1)])) },
    { subject: 'Без стресса', ...Object.fromEntries(results.variants.map(v => [v.name, +Math.max(0, 10 - v.final.stress_index).toFixed(1)])) },
    { subject: 'Устойчивость', ...Object.fromEntries(results.variants.map(v => [v.name, +Math.min(10, v.final.fin_stability * 3).toFixed(1)])) },
    { subject: 'Без риска', ...Object.fromEntries(results.variants.map(v => [v.name, +Math.max(0, 10 - v.final.risk_index).toFixed(1)])) },
  ] : [];

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: 'hsl(var(--background))' }}>
        <Icon name="Loader2" size={40} className="animate-spin text-primary" />
        <p className="text-muted-foreground text-sm">{running ? 'Просчитываем сценарии...' : 'Загружаем результаты...'}</p>
      </div>
    );
  }

  if (!results?.variants?.length) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4" style={{ background: 'hsl(var(--background))' }}>
        <Icon name="AlertCircle" size={40} className="text-muted-foreground" />
        <p className="text-muted-foreground text-sm">Результаты не найдены</p>
        <button onClick={() => navigate(`/pro/simulator/edit?id=${scenarioId}`)} className="bg-primary text-white px-6 py-2 rounded-xl text-sm">Ввести параметры</button>
      </div>
    );
  }

  const bestIdx = results.variants.reduce((bi, v, i, arr) =>
    v.final.scenario_score > arr[bi].final.scenario_score ? i : bi, 0);

  const TABS: { id: Tab; label: string }[] = [
    { id: 'compare', label: 'Сравнение' },
    { id: 'economics', label: 'Экономика' },
    { id: 'networth', label: 'Капитал' },
    { id: 'income', label: 'Доходы' },
    { id: 'quality', label: 'Жизнь' },
    { id: 'detail', label: 'По годам' },
  ];

  return (
    <div className="min-h-screen" style={{ background: 'hsl(var(--background))' }}>
      <div className="max-w-4xl mx-auto px-4 py-6 pb-10">

        {/* Шапка */}
        <button onClick={() => navigate('/pro/simulator')} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
          <Icon name="ChevronLeft" size={16} /> Мои сценарии
        </button>

        <div className="flex items-start justify-between gap-3 flex-wrap mb-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">Результаты симуляции</h1>
            <p className="text-muted-foreground text-sm mt-0.5">Горизонт: {results.period} лет</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => navigate(`/pro/simulator/edit?id=${scenarioId}`)} className="flex items-center gap-1 border border-border rounded-xl px-3 py-2 text-sm hover:bg-muted">
              <Icon name="Pencil" size={14} />
              <span className="hidden sm:inline">Изменить</span>
            </button>
            <button onClick={runSimulation} disabled={running} className="flex items-center gap-1 bg-primary text-white rounded-xl px-3 py-2 text-sm hover:opacity-90">
              <Icon name="RefreshCw" size={14} className={running ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">Пересчитать</span>
            </button>
          </div>
        </div>

        {/* Рекомендация */}
        {results.recommendation && (
          <div className="bg-primary/8 border border-primary/20 rounded-2xl px-4 py-3 flex gap-3 mb-5">
            <Icon name="Sparkles" size={18} className="text-primary shrink-0 mt-0.5" />
            <p className="text-sm text-foreground leading-relaxed">{results.recommendation}</p>
          </div>
        )}

        {/* Карточки рейтинга */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
          {results.variants.map((v, i) => (
            <div key={v.variant_id} className={`rounded-2xl border p-4 ${i === bestIdx ? 'border-primary bg-primary/5' : 'border-border bg-card'}`}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0" style={{ background: COLORS[i] }}>
                  {VARIANT_LABELS[i]}
                </div>
                <span className="font-semibold text-sm text-foreground truncate flex-1">{v.name}</span>
                {i === bestIdx && <span className="text-xs text-primary font-bold shrink-0">★ Лучший</span>}
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-2xl font-black text-foreground">
                    {v.final.scenario_score.toFixed(1)}<span className="text-sm font-normal text-muted-foreground">/10</span>
                  </div>
                  <div className="text-xs text-muted-foreground">рейтинг</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-foreground">{fmtR(v.final.net_worth)}</div>
                  <div className="text-xs text-muted-foreground">капитал</div>
                </div>
              </div>
              <div className="text-xs text-muted-foreground mt-1.5 capitalize">{v.final.investor_type}</div>
            </div>
          ))}
        </div>

        {/* Табы — скролл на мобайле */}
        <div className="mb-5 -mx-4 px-4 overflow-x-auto">
          <div className="flex gap-1 p-1 bg-muted rounded-xl w-max min-w-full">
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${tab === t.id ? 'bg-white text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* === Сравнение — карточки на мобайле, таблица на десктопе === */}
        {tab === 'compare' && (
          <>
            {/* Мобайл: карточки */}
            <div className="sm:hidden space-y-3">
              {COMPARE_ROWS.map(row => (
                <div key={row.key} className="bg-card border border-border rounded-xl p-3">
                  <p className="text-xs text-muted-foreground mb-2">{row.label}</p>
                  <div className="flex gap-2 flex-wrap">
                    {results.variants.map((v, i) => (
                      <div key={v.variant_id} className="flex-1 min-w-[80px]">
                        <div className="text-[10px] mb-0.5" style={{ color: COLORS[i] }}>{v.name}</div>
                        <div className={`text-sm font-semibold ${i === bestIdx && row.key === 'scenario_score' ? 'text-primary' : 'text-foreground'}`}>
                          {row.fmt(v.final[row.key] as number)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Десктоп: таблица */}
            <div className="hidden sm:block overflow-x-auto bg-card border border-border rounded-2xl">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="text-left text-sm font-medium text-muted-foreground py-3 px-5 min-w-[160px]">Показатель</th>
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
          </>
        )}

        {/* === Экономика дня === */}
        {tab === 'economics' && (
          <div className="space-y-4">
            <div className="flex gap-2 flex-wrap">
              {results.variants.map((v, i) => (
                <button key={v.variant_id} onClick={() => setDetailVariant(i)}
                  className={`px-3 py-1.5 rounded-xl text-sm border transition-all ${detailVariant === i ? 'text-white border-transparent' : 'border-border text-foreground hover:bg-muted'}`}
                  style={detailVariant === i ? { background: COLORS[i] } : {}}>
                  {v.name}
                </button>
              ))}
            </div>

            {(() => {
              const eco = results.variants[detailVariant]?.economic_summary;
              if (!eco) return <p className="text-sm text-muted-foreground">Пересчитайте сценарий для отображения экономических показателей</p>;

              const safetyColor = eco.safety_months >= 12 ? 'text-emerald-600' : eco.safety_months >= 6 ? 'text-amber-500' : 'text-rose-500';
              const safetyLabel = eco.safety_months >= 12 ? 'Устойчиво' : eco.safety_months >= 6 ? 'Приемлемо' : 'Риск';

              return (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {[
                      { icon: 'TrendingUp', label: 'Доход в день', value: fmtR(eco.daily_income), color: 'text-emerald-600' },
                      { icon: 'TrendingDown', label: 'Расход в день', value: fmtR(eco.daily_expenses), color: 'text-rose-500' },
                      { icon: 'Wallet', label: 'Свободно в день', value: fmtR(eco.daily_free_budget), color: eco.daily_free_budget >= 0 ? 'text-emerald-600' : 'text-rose-500' },
                      { icon: 'Heart', label: 'Стоимость дня жизни', value: fmtR(eco.cost_of_life_day), color: 'text-foreground' },
                      { icon: 'Clock', label: 'Час жизни стоит', value: fmtR(eco.life_hour_value), color: 'text-primary' },
                      { icon: 'Shield', label: 'Фин. безопасность', value: `${eco.safety_months.toFixed(1)} мес.`, color: safetyColor },
                    ].map(card => (
                      <div key={card.label} className="bg-card border border-border rounded-2xl p-3 sm:p-4">
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <Icon name={card.icon} size={14} className="text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">{card.label}</span>
                        </div>
                        <div className={`text-lg sm:text-xl font-bold ${card.color}`}>{card.value}</div>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-card border border-border rounded-2xl p-4">
                      <h4 className="text-sm font-semibold text-foreground mb-3">Капитал</h4>
                      <div className="space-y-2.5">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Номинальный</span>
                          <span className="text-sm font-medium text-foreground">{fmtR(eco.nominal_capital)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Реальный (с учётом инфляции)</span>
                          <span className="text-sm font-medium text-foreground">{fmtR(eco.real_capital)}</span>
                        </div>
                        {eco.nominal_capital > 0 && (
                          <div className="pt-1 border-t border-border">
                            <div className="flex justify-between">
                              <span className="text-xs text-muted-foreground">Потеря от инфляции</span>
                              <span className="text-xs text-rose-500">−{fmtR(eco.nominal_capital - eco.real_capital)}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="bg-card border border-border rounded-2xl p-4">
                      <h4 className="text-sm font-semibold text-foreground mb-3">Финансовая безопасность</h4>
                      <div className="space-y-2.5">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Запас</span>
                          <span className={`text-sm font-semibold ${safetyColor}`}>
                            {eco.safety_months.toFixed(1)} мес. / {eco.safety_days} дн.
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Статус</span>
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                            eco.safety_months >= 12 ? 'bg-emerald-100 text-emerald-700' :
                            eco.safety_months >= 6 ? 'bg-amber-100 text-amber-700' :
                            'bg-rose-100 text-rose-700'
                          }`}>{safetyLabel}</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all" style={{
                            width: `${Math.min(100, (eco.safety_months / 24) * 100)}%`,
                            background: eco.safety_months >= 12 ? '#10b981' : eco.safety_months >= 6 ? '#f59e0b' : '#ef4444',
                          }} />
                        </div>
                        <p className="text-[10px] text-muted-foreground">Рекомендация: 6–12 месяцев расходов</p>
                      </div>
                    </div>
                  </div>

                  {eco.daily_cost_projection.length > 0 && (
                    <div className="bg-card border border-border rounded-2xl p-4">
                      <h4 className="text-sm font-semibold text-foreground mb-3">Прогноз стоимости дня жизни</h4>
                      <div className="space-y-2">
                        {eco.daily_cost_projection.map((pt, idx) => {
                          const maxCost = eco.daily_cost_projection[eco.daily_cost_projection.length - 1]?.daily_cost || 1;
                          return (
                            <div key={pt.year} className="flex items-center gap-3">
                              <span className="text-xs text-muted-foreground w-16 shrink-0">Через {pt.year} {pt.year === 1 ? 'год' : pt.year < 5 ? 'года' : 'лет'}</span>
                              <div className="flex-1 h-5 bg-muted rounded-full overflow-hidden relative">
                                <div className="h-full rounded-full" style={{
                                  width: `${(pt.daily_cost / maxCost) * 100}%`,
                                  background: idx === 0 ? '#6366f1' : `hsl(${240 - idx * 20}, 70%, 60%)`,
                                }} />
                              </div>
                              <span className="text-sm font-medium text-foreground w-20 text-right">{fmtR(pt.daily_cost)}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        )}

        {/* === Капитал === */}
        {tab === 'networth' && (
          <div className="bg-card border border-border rounded-2xl p-4">
            <h3 className="text-sm font-semibold mb-4 text-foreground">Чистый капитал по годам</h3>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={chartNetWorth} margin={{ left: 0, right: 8, top: 4, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                <YAxis tickFormatter={v => fmt(Number(v))} tick={{ fontSize: 10 }} width={65} />
                <Tooltip formatter={(v: number) => fmtR(v)} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                {results.variants.map((v, i) => (
                  <Line key={v.variant_id} type="monotone" dataKey={v.name} stroke={COLORS[i]} strokeWidth={2.5} dot={false} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* === Доходы/расходы === */}
        {tab === 'income' && (
          <div className="space-y-3">
            {/* Выбор варианта */}
            <div className="flex gap-2 flex-wrap">
              {results.variants.map((v, i) => (
                <button key={v.variant_id} onClick={() => setDetailVariant(i)}
                  className={`px-3 py-1.5 rounded-xl text-sm border transition-all ${detailVariant === i ? 'text-white border-transparent' : 'border-border text-foreground hover:bg-muted'}`}
                  style={detailVariant === i ? { background: COLORS[i] } : {}}>
                  {v.name}
                </button>
              ))}
            </div>
            <div className="bg-card border border-border rounded-2xl p-4">
              <h3 className="text-sm font-semibold mb-4 text-foreground">Доходы, расходы и накопления (тыс. ₽/год)</h3>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={chartIncomeExpenses} margin={{ left: 0, right: 8, top: 4, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 10 }} width={50} />
                  <Tooltip formatter={(v: number) => `${v} тыс. ₽`} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="Доход" fill={COLORS[detailVariant]} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Расходы" fill="#f87171" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Накопления" fill="#34d399" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* === Качество жизни === */}
        {tab === 'quality' && (
          <div className="space-y-4">
            <div className="bg-card border border-border rounded-2xl p-4">
              <h3 className="text-sm font-semibold mb-4 text-foreground">Индекс жизненного баланса</h3>
              <ResponsiveContainer width="100%" height={260}>
                <RadarChart data={radarData} margin={{ top: 0, right: 20, bottom: 0, left: 20 }}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
                  {results.variants.map((v, i) => (
                    <Radar key={v.variant_id} name={v.name} dataKey={v.name} stroke={COLORS[i]} fill={COLORS[i]} fillOpacity={0.15} />
                  ))}
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {results.variants.map((v, i) => (
                <div key={v.variant_id} className="bg-card border border-border rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-3 h-3 rounded-full shrink-0" style={{ background: COLORS[i] }} />
                    <h4 className="font-semibold text-foreground text-sm">{v.name}</h4>
                  </div>
                  {[
                    { label: 'Качество жизни', value: v.final.life_index },
                    { label: 'Фин. устойчивость', value: Math.min(10, v.final.fin_stability * 3) },
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
                        <div className="h-full rounded-full" style={{ width: `${(item.value / 10) * 100}%`, background: COLORS[i] }} />
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* === По годам — скролл по горизонтали === */}
        {tab === 'detail' && (
          <div className="space-y-3">
            <div className="flex gap-2 flex-wrap">
              {results.variants.map((v, i) => (
                <button key={v.variant_id} onClick={() => setDetailVariant(i)}
                  className={`px-3 py-1.5 rounded-xl text-sm border transition-all ${detailVariant === i ? 'text-white border-transparent' : 'border-border text-foreground hover:bg-muted'}`}
                  style={detailVariant === i ? { background: COLORS[i] } : {}}>
                  {v.name}
                </button>
              ))}
            </div>
            {/* Подсказка скролла на мобайле */}
            <p className="text-xs text-muted-foreground sm:hidden">← Прокрутите таблицу вправо</p>
            <div className="overflow-x-auto bg-card border border-border rounded-2xl">
              <table className="border-collapse text-sm" style={{ minWidth: 600 }}>
                <thead>
                  <tr className="text-xs text-muted-foreground border-b border-border text-left">
                    <th className="py-3 px-3 sticky left-0 bg-card z-10 min-w-[52px]">Год</th>
                    <th className="py-3 px-3 whitespace-nowrap">Доход</th>
                    <th className="py-3 px-3 whitespace-nowrap">Расходы</th>
                    <th className="py-3 px-3 whitespace-nowrap">Накопления</th>
                    <th className="py-3 px-3 whitespace-nowrap">Капитал</th>
                    <th className="py-3 px-3 whitespace-nowrap">Инвестиции</th>
                    <th className="py-3 px-3 whitespace-nowrap">Жизнь</th>
                    <th className="py-3 px-3 whitespace-nowrap">Риск</th>
                  </tr>
                </thead>
                <tbody>
                  {(results.variants[detailVariant]?.yearly ?? []).map(y => (
                    <tr key={y.year} className="border-t border-border hover:bg-muted/30">
                      <td className="py-2 px-3 font-semibold sticky left-0 bg-card z-10">{y.year}</td>
                      <td className="py-2 px-3 text-emerald-600 whitespace-nowrap">{fmtR(y.income)}</td>
                      <td className="py-2 px-3 text-rose-500 whitespace-nowrap">{fmtR(y.expenses)}</td>
                      <td className={`py-2 px-3 whitespace-nowrap ${y.savings >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>{fmtR(y.savings)}</td>
                      <td className={`py-2 px-3 font-semibold whitespace-nowrap ${y.net_worth >= 0 ? 'text-foreground' : 'text-rose-500'}`}>{fmtR(y.net_worth)}</td>
                      <td className="py-2 px-3 text-indigo-500 whitespace-nowrap">{fmtR(y.invest_portfolio)}</td>
                      <td className="py-2 px-3">{y.life_index.toFixed(1)}</td>
                      <td className="py-2 px-3">{y.risk_index.toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Нижние кнопки */}
        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          <button onClick={handleDownloadPdf} className="flex items-center justify-center gap-2 bg-primary text-white rounded-xl px-5 py-3 text-sm font-medium hover:opacity-90 transition-opacity">
            <Icon name="FileDown" size={16} /> Скачать PDF
          </button>
          <button onClick={() => navigate(`/pro/simulator/edit?id=${scenarioId}`)} className="flex items-center justify-center gap-2 border border-border rounded-xl px-5 py-3 text-sm hover:bg-muted">
            <Icon name="Pencil" size={16} /> Изменить параметры
          </button>
          <button onClick={() => navigate('/pro/simulator/create')} className="flex items-center justify-center gap-2 border border-border rounded-xl px-5 py-3 text-sm hover:bg-muted">
            <Icon name="Plus" size={16} /> Новый сценарий
          </button>
        </div>
      </div>
    </div>
  );
}