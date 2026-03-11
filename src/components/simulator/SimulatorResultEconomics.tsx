import Icon from '@/components/ui/icon';
import { COLORS, fmtR, type Results } from './simulatorResultTypes';

interface Props {
  results: Results;
  detailVariant: number;
  onSetDetailVariant: (i: number) => void;
}

export default function SimulatorResultEconomics({ results, detailVariant, onSetDetailVariant }: Props) {
  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        {results.variants.map((v, i) => (
          <button key={v.variant_id} onClick={() => onSetDetailVariant(i)}
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
  );
}
