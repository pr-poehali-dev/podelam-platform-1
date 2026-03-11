import Icon from '@/components/ui/icon';
import { COLORS, VARIANT_LABELS, fmtR, type Results, type Tab } from './simulatorResultTypes';

interface Props {
  results: Results;
  scenarioId: number;
  running: boolean;
  tab: Tab;
  bestIdx: number;
  onNavigateBack: () => void;
  onNavigateEdit: () => void;
  onRunSimulation: () => void;
  onDownloadPdf: () => void;
  onSetTab: (t: Tab) => void;
}

const TABS: { id: Tab; label: string }[] = [
  { id: 'compare', label: 'Сравнение' },
  { id: 'economics', label: 'Экономика' },
  { id: 'networth', label: 'Капитал' },
  { id: 'income', label: 'Доходы' },
  { id: 'quality', label: 'Жизнь' },
  { id: 'detail', label: 'По годам' },
];

export default function SimulatorResultHeader({
  results, scenarioId, running, tab, bestIdx,
  onNavigateBack, onNavigateEdit, onRunSimulation, onDownloadPdf, onSetTab,
}: Props) {
  return (
    <>
      <button onClick={onNavigateBack} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
        <Icon name="ChevronLeft" size={16} /> Мои сценарии
      </button>

      <div className="flex items-start justify-between gap-3 flex-wrap mb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Результаты симуляции</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Горизонт: {results.period} лет</p>
        </div>
        <div className="flex gap-2">
          <button onClick={onNavigateEdit} className="flex items-center gap-1 border border-border rounded-xl px-3 py-2 text-sm hover:bg-muted">
            <Icon name="Pencil" size={14} />
            <span className="hidden sm:inline">Изменить</span>
          </button>
          <button onClick={onRunSimulation} disabled={running} className="flex items-center gap-1 bg-primary text-white rounded-xl px-3 py-2 text-sm hover:opacity-90">
            <Icon name="RefreshCw" size={14} className={running ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">Пересчитать</span>
          </button>
        </div>
      </div>

      {results.recommendation && (
        <div className="bg-primary/8 border border-primary/20 rounded-2xl px-4 py-3 flex gap-3 mb-5">
          <Icon name="Sparkles" size={18} className="text-primary shrink-0 mt-0.5" />
          <p className="text-sm text-foreground leading-relaxed">{results.recommendation}</p>
        </div>
      )}

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

      <div className="mb-5 -mx-4 px-4 overflow-x-auto">
        <div className="flex gap-1 p-1 bg-muted rounded-xl w-max min-w-full">
          {TABS.map(t => (
            <button key={t.id} onClick={() => onSetTab(t.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${tab === t.id ? 'bg-white text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
