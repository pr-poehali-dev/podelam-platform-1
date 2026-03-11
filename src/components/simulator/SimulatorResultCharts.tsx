import {
  LineChart, Line, BarChart, Bar, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { COLORS, fmt, fmtR, type Results, type Tab } from './simulatorResultTypes';

interface Props {
  tab: Tab;
  results: Results;
  detailVariant: number;
  onSetDetailVariant: (i: number) => void;
  chartNetWorth: Record<string, number | string>[];
  chartIncomeExpenses: Record<string, number | string>[];
  radarData: Record<string, number | string>[];
}

export default function SimulatorResultCharts({
  tab, results, detailVariant, onSetDetailVariant,
  chartNetWorth, chartIncomeExpenses, radarData,
}: Props) {
  return (
    <>
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
          <div className="flex gap-2 flex-wrap">
            {results.variants.map((v, i) => (
              <button key={v.variant_id} onClick={() => onSetDetailVariant(i)}
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

      {/* === По годам === */}
      {tab === 'detail' && (
        <div className="space-y-3">
          <div className="flex gap-2 flex-wrap">
            {results.variants.map((v, i) => (
              <button key={v.variant_id} onClick={() => onSetDetailVariant(i)}
                className={`px-3 py-1.5 rounded-xl text-sm border transition-all ${detailVariant === i ? 'text-white border-transparent' : 'border-border text-foreground hover:bg-muted'}`}
                style={detailVariant === i ? { background: COLORS[i] } : {}}>
                {v.name}
              </button>
            ))}
          </div>
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
    </>
  );
}
