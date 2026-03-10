import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SCENARIO_TYPES, SIMULATOR_TEMPLATES, type ScenarioType, simulatorApi } from '@/lib/simulatorApi';
import { checkAccess } from '@/lib/access';
import Icon from '@/components/ui/icon';

export default function SimulatorCreate() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<ScenarioType | null>(null);
  const [loading, setLoading] = useState<string | null>(null);

  useEffect(() => {
    const a = checkAccess('simulator');
    if (a === 'locked') navigate('/pro/simulator');
  }, []);

  async function handleTemplate(templateId: string) {
    const tpl = SIMULATOR_TEMPLATES.find(t => t.id === templateId);
    if (!tpl) return;
    setLoading(templateId);
    const res = await simulatorApi.create({
      title: tpl.title,
      type: tpl.type,
      period: tpl.period,
      variants: tpl.variants,
    });
    setLoading(null);
    if (res.id) navigate(`/pro/simulator/result?scenario_id=${res.id}&run=1`);
  }

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
        <h1 className="text-2xl font-bold text-foreground">Создать сценарий</h1>
        <p className="text-muted-foreground mt-1 mb-8">Выберите готовый шаблон или настройте всё вручную</p>

        {/* Шаблоны */}
        <div className="mb-8">
          <h2 className="text-base font-semibold text-foreground mb-1">Готовые шаблоны</h2>
          <p className="text-sm text-muted-foreground mb-4">Нажмите — сценарий заполнится автоматически, сразу увидите результат</p>
          <div className="grid sm:grid-cols-2 gap-3">
            {SIMULATOR_TEMPLATES.map(tpl => (
              <button
                key={tpl.id}
                onClick={() => handleTemplate(tpl.id)}
                disabled={loading === tpl.id}
                className="flex items-start gap-3 p-4 bg-card border border-border rounded-2xl text-left hover:border-primary/50 hover:shadow-sm transition-all disabled:opacity-60 group"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/15 transition-colors">
                  {loading === tpl.id
                    ? <Icon name="Loader2" size={20} className="text-primary animate-spin" />
                    : <Icon name={tpl.icon as never} size={20} className="text-primary" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm text-foreground">{tpl.title}</div>
                  <div className="text-xs text-muted-foreground mt-0.5 leading-snug">{tpl.description}</div>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {tpl.variants.map(v => (
                      <span key={v.name} className="text-[11px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{v.name}</span>
                    ))}
                    <span className="text-[11px] text-muted-foreground/60">{tpl.period} лет</span>
                  </div>
                </div>
                <Icon name="ChevronRight" size={16} className="text-muted-foreground shrink-0 mt-1 group-hover:translate-x-0.5 transition-transform" />
              </button>
            ))}
          </div>
        </div>

        {/* Разделитель */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 border-t border-border" />
          <span className="text-xs text-muted-foreground">или создайте с нуля</span>
          <div className="flex-1 border-t border-border" />
        </div>

        {/* Выбор типа вручную */}
        <h2 className="text-base font-semibold text-foreground mb-4">Выберите тип решения</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {SCENARIO_TYPES.map(t => (
            <button
              key={t.id}
              onClick={() => setSelected(t.id)}
              className={`flex flex-col items-center gap-3 p-5 rounded-2xl border-2 text-center transition-all ${
                selected === t.id
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-border bg-card text-foreground hover:border-primary/40'
              }`}
            >
              <Icon name={t.icon as never} size={26} />
              <span className="text-sm font-medium leading-tight">{t.label}</span>
            </button>
          ))}
        </div>

        <button
          onClick={handleNext}
          disabled={!selected}
          className="mt-6 w-full bg-primary text-white rounded-xl py-4 text-base font-medium hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Настроить параметры
        </button>
      </div>
    </div>
  );
}