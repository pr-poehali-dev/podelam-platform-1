import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { simulatorApi } from '@/lib/simulatorApi';
import Icon from '@/components/ui/icon';
import { fmtR, COMPARE_ROWS, type Results, type Tab } from '@/components/simulator/simulatorResultTypes';
import SimulatorResultHeader from '@/components/simulator/SimulatorResultHeader';
import SimulatorResultCompare from '@/components/simulator/SimulatorResultCompare';
import SimulatorResultEconomics from '@/components/simulator/SimulatorResultEconomics';
import SimulatorResultCharts from '@/components/simulator/SimulatorResultCharts';

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

  return (
    <div className="min-h-screen" style={{ background: 'hsl(var(--background))' }}>
      <div className="max-w-4xl mx-auto px-4 py-6 pb-10">

        <SimulatorResultHeader
          results={results}
          scenarioId={scenarioId}
          running={running}
          tab={tab}
          bestIdx={bestIdx}
          onNavigateBack={() => navigate('/pro/simulator')}
          onNavigateEdit={() => navigate(`/pro/simulator/edit?id=${scenarioId}`)}
          onRunSimulation={runSimulation}
          onDownloadPdf={handleDownloadPdf}
          onSetTab={setTab}
        />

        {tab === 'compare' && (
          <SimulatorResultCompare results={results} bestIdx={bestIdx} />
        )}

        {tab === 'economics' && (
          <SimulatorResultEconomics
            results={results}
            detailVariant={detailVariant}
            onSetDetailVariant={setDetailVariant}
          />
        )}

        {(tab === 'networth' || tab === 'income' || tab === 'quality' || tab === 'detail') && (
          <SimulatorResultCharts
            tab={tab}
            results={results}
            detailVariant={detailVariant}
            onSetDetailVariant={setDetailVariant}
            chartNetWorth={chartNetWorth}
            chartIncomeExpenses={chartIncomeExpenses}
            radarData={radarData}
          />
        )}

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
