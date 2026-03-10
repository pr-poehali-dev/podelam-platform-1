import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SCENARIO_TYPES, type ScenarioType } from '@/lib/simulatorApi';
import Icon from '@/components/ui/icon';

export default function SimulatorCreate() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<ScenarioType | null>(null);

  function handleNext() {
    if (!selected) return;
    navigate(`/pro/simulator/edit?type=${selected}`);
  }

  return (
    <div className="min-h-screen" style={{ background: 'hsl(var(--background))' }}>
      <div className="max-w-3xl mx-auto px-4 py-8">
        <button onClick={() => navigate('/pro/simulator')} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
          <Icon name="ChevronLeft" size={16} /> Назад
        </button>
        <h1 className="text-2xl font-bold text-foreground">Выберите тип решения</h1>
        <p className="text-muted-foreground mt-1 mb-6">Выберите категорию, которую хотите смоделировать</p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {SCENARIO_TYPES.map(t => (
            <button
              key={t.id}
              onClick={() => setSelected(t.id)}
              className={`flex flex-col items-center gap-3 p-5 rounded-2xl border-2 text-center transition-all ${
                selected === t.id
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-border bg-card text-foreground hover:border-primary/40 hover:bg-primary/3'
              }`}
            >
              <Icon name={t.icon as never} size={28} />
              <span className="text-sm font-medium leading-tight">{t.label}</span>
            </button>
          ))}
        </div>

        <button
          onClick={handleNext}
          disabled={!selected}
          className="mt-8 w-full bg-primary text-white rounded-xl py-4 text-base font-medium hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Далее
        </button>
      </div>
    </div>
  );
}
