import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { simulatorApi, SCENARIO_TYPES } from '@/lib/simulatorApi';
import Icon from '@/components/ui/icon';

const PERIODS = [5, 10, 20, 30];

const PARAM_FIELDS = [
  { key: 'income', label: 'Доход (₽/мес)', placeholder: '150 000' },
  { key: 'expenses', label: 'Расходы (₽/мес)', placeholder: '80 000' },
  { key: 'asset_cost', label: 'Стоимость объекта (₽)', placeholder: '5 000 000' },
  { key: 'credit', label: 'Кредитный платёж (₽/мес)', placeholder: '30 000' },
  { key: 'investments', label: 'Инвестиции (₽/мес)', placeholder: '10 000' },
];

interface Variant {
  name: string;
  parameters: Record<string, string>;
}

function emptyVariant(label: string): Variant {
  return { name: label, parameters: {} };
}

export default function SimulatorEdit() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const editId = params.get('id');
  const initType = params.get('type') || 'free';

  const [title, setTitle] = useState('');
  const [period, setPeriod] = useState(10);
  const [variants, setVariants] = useState<Variant[]>([emptyVariant('Сценарий A'), emptyVariant('Сценарий B')]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(!!editId);

  useEffect(() => {
    if (editId) {
      simulatorApi.list().then(data => {
        const sc = (data.scenarios || []).find((s: { id: number }) => s.id === Number(editId));
        if (sc) {
          setTitle(sc.title);
          setPeriod(sc.period);
          if (sc.variants?.length) {
            setVariants(sc.variants.map((v: { name: string; parameters: Record<string, string> }) => ({ name: v.name, parameters: v.parameters || {} })));
          }
        }
        setLoading(false);
      });
    } else {
      const typeLabel = SCENARIO_TYPES.find(t => t.id === initType)?.label || '';
      setTitle(typeLabel ? `${typeLabel}` : '');
    }
  }, [editId, initType]);

  function addVariant() {
    if (variants.length >= 3) return;
    setVariants(v => [...v, emptyVariant(`Сценарий ${String.fromCharCode(65 + v.length)}`)]);
  }

  function removeVariant(i: number) {
    setVariants(v => v.filter((_, idx) => idx !== i));
  }

  function setParam(vi: number, key: string, val: string) {
    setVariants(prev => prev.map((v, i) => i === vi ? { ...v, parameters: { ...v.parameters, [key]: val } } : v));
  }

  function setVariantName(vi: number, name: string) {
    setVariants(prev => prev.map((v, i) => i === vi ? { ...v, name } : v));
  }

  async function handleSave() {
    setSaving(true);
    const payload = { title: title || 'Без названия', type: initType, period, variants };
    let id: number;
    if (editId) {
      await simulatorApi.update({ scenario_id: Number(editId), ...payload });
      id = Number(editId);
    } else {
      const res = await simulatorApi.create(payload);
      id = res.id;
    }
    setSaving(false);
    navigate(`/pro/simulator/result?scenario_id=${id}&run=1`);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        <Icon name="Loader2" size={24} className="animate-spin mr-2" /> Загрузка...
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'hsl(var(--background))' }}>
      <div className="max-w-3xl mx-auto px-4 py-8">
        <button onClick={() => navigate(editId ? '/pro/simulator' : '/pro/simulator/create')} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
          <Icon name="ChevronLeft" size={16} /> Назад
        </button>
        <h1 className="text-2xl font-bold text-foreground">{editId ? 'Редактирование сценария' : 'Создание сценария'}</h1>

        {/* Основные параметры */}
        <div className="mt-6 bg-card border border-border rounded-2xl p-5 space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground block mb-1">Название сценария</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Например: Покупка квартиры"
              className="w-full border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-background"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground block mb-2">Горизонт анализа</label>
            <div className="flex gap-2 flex-wrap">
              {PERIODS.map(p => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${period === p ? 'bg-primary text-white border-primary' : 'border-border text-foreground hover:border-primary/40'}`}
                >
                  {p} лет
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Варианты */}
        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Варианты решения</h2>
            {variants.length < 3 && (
              <button onClick={addVariant} className="flex items-center gap-1 text-sm text-primary hover:opacity-80">
                <Icon name="Plus" size={16} /> Добавить вариант
              </button>
            )}
          </div>

          {variants.map((v, vi) => (
            <div key={vi} className="bg-card border border-border rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <input
                  value={v.name}
                  onChange={e => setVariantName(vi, e.target.value)}
                  className="flex-1 border border-border rounded-xl px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 bg-background"
                />
                {variants.length > 1 && (
                  <button onClick={() => removeVariant(vi)} className="text-muted-foreground hover:text-destructive">
                    <Icon name="X" size={18} />
                  </button>
                )}
              </div>
              <div className="grid gap-3">
                {PARAM_FIELDS.map(f => (
                  <div key={f.key}>
                    <label className="text-xs text-muted-foreground block mb-1">{f.label}</label>
                    <input
                      type="number"
                      value={v.parameters[f.key] || ''}
                      onChange={e => setParam(vi, f.key, e.target.value)}
                      placeholder={f.placeholder}
                      className="w-full border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-background"
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="mt-8 w-full bg-primary text-white rounded-xl py-4 text-base font-medium hover:opacity-90 transition-opacity disabled:opacity-60"
        >
          {saving ? (
            <span className="flex items-center justify-center gap-2"><Icon name="Loader2" size={18} className="animate-spin" /> Сохранение...</span>
          ) : 'Просчитать сценарии'}
        </button>
      </div>
    </div>
  );
}
