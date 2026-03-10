import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { simulatorApi, SCENARIO_TYPES, FIELDS_BY_TYPE, type ParamFieldDef } from '@/lib/simulatorApi';
import { checkAccess } from '@/lib/access';
import Icon from '@/components/ui/icon';

const PERIODS = [5, 10, 20, 30];

interface ParamField {
  key: string;
  label: string;
  placeholder: string;
  hint?: string;
  type?: 'percent' | 'number';
  advanced?: boolean;
}

const BASE_FIELDS: ParamField[] = [
  { key: 'income', label: 'Доход', placeholder: '150 000', hint: '₽ в месяц' },
  { key: 'expenses', label: 'Расходы', placeholder: '80 000', hint: '₽ в месяц' },
  { key: 'start_capital', label: 'Стартовый капитал', placeholder: '0', hint: '₽ уже накоплено' },
];

const CREDIT_FIELDS: ParamField[] = [
  { key: 'credit_principal', label: 'Сумма кредита', placeholder: '3 000 000', hint: '₽' },
  { key: 'credit_rate', label: 'Ставка кредита', placeholder: '0.18', hint: 'доля/год, напр. 0.18 = 18%', type: 'percent' },
  { key: 'credit_months', label: 'Срок кредита', placeholder: '120', hint: 'месяцев' },
];

const INVEST_FIELDS: ParamField[] = [
  { key: 'investments', label: 'Инвестиции', placeholder: '20 000', hint: '₽ в месяц' },
  { key: 'invest_return', label: 'Доходность инвестиций', placeholder: '0.12', hint: 'доля/год, напр. 0.12 = 12%', type: 'percent' },
];

const ADV_FIELDS: ParamField[] = [
  { key: 'income_growth', label: 'Рост дохода в год', placeholder: '0.05', hint: 'доля/год, напр. 0.05 = 5%', type: 'percent', advanced: true },
  { key: 'inflation', label: 'Инфляция', placeholder: '0.07', hint: 'доля/год, напр. 0.07 = 7%', type: 'percent', advanced: true },
  { key: 'work_hours_week', label: 'Рабочих часов в неделю', placeholder: '40', hint: 'часов', advanced: true },
  { key: 'commute_hours_week', label: 'Дорога на работу', placeholder: '0', hint: 'часов в неделю', advanced: true },
  { key: 'stress_coeff', label: 'Коэффициент стресса', placeholder: '1.0', hint: '0.5 – лёгкая работа, 2.0 – тяжёлая', advanced: true },
  { key: 'risk_probability', label: 'Вероятность потери дохода', placeholder: '0.05', hint: 'доля/год, напр. 0.05 = 5%', type: 'percent', advanced: true },
];

interface Variant {
  name: string;
  parameters: Record<string, string>;
}

function emptyVariant(label: string): Variant {
  return { name: label, parameters: {} };
}

function FieldInput({ field, value, onChange, step }: { field: ParamField | ParamFieldDef; value: string; onChange: (v: string) => void; step?: string }) {
  const resolvedStep = step || ('step' in field && field.step) || ('type' in field && (field as ParamField).type === 'percent' ? '0.01' : '1');
  return (
    <div>
      <label className="text-xs font-medium text-foreground block mb-1">
        {field.label}
        {field.hint && <span className="text-muted-foreground font-normal ml-1">— {field.hint}</span>}
      </label>
      <input
        type="number"
        step={resolvedStep as string}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={field.placeholder}
        className="w-full border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-background"
      />
    </div>
  );
}

/** Check if type-specific groups already include a credit section */
function typeHasCreditFields(scenarioType: string): boolean {
  const groups = FIELDS_BY_TYPE[scenarioType] || [];
  return groups.some(g => g.fields.some(f => f.key === 'credit_principal'));
}

export default function SimulatorEdit() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const editId = params.get('id');
  const initType = params.get('type') || 'free';

  const [title, setTitle] = useState('');
  const [scenarioType, setScenarioType] = useState(initType);
  const [period, setPeriod] = useState(10);
  const [variants, setVariants] = useState<Variant[]>([emptyVariant('Сценарий A'), emptyVariant('Сценарий B')]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(!!editId);
  const [showAdv, setShowAdv] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const a = checkAccess('simulator');
    if (a === 'locked') { navigate('/pro/simulator'); return; }
    if (editId) {
      simulatorApi.list().then(data => {
        const sc = (data.scenarios || []).find((s: { id: number }) => s.id === Number(editId));
        if (sc) {
          setTitle(sc.title);
          setPeriod(sc.period);
          if (sc.type) setScenarioType(sc.type);
          if (sc.variants?.length) {
            setVariants(sc.variants.map((v: { name: string; parameters: Record<string, string> }) => ({ name: v.name, parameters: v.parameters || {} })));
          }
        }
        setLoading(false);
      });
    } else {
      const typeLabel = SCENARIO_TYPES.find(t => t.id === initType)?.label || '';
      setTitle(typeLabel || '');
    }
  }, [editId, initType]);

  const typeGroups = FIELDS_BY_TYPE[scenarioType] || [];
  const showGenericCredit = !typeHasCreditFields(scenarioType);

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
    const payload = { title: title || 'Без названия', type: scenarioType, period, variants };
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
        <p className="text-muted-foreground mt-1 mb-6">Заполните параметры — незаполненные поля используют значения по умолчанию</p>

        {/* Основные параметры */}
        <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
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
                <button key={p} onClick={() => setPeriod(p)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${period === p ? 'bg-primary text-white border-primary' : 'border-border text-foreground hover:border-primary/40'}`}>
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
              {/* Имя варианта */}
              <div className="flex items-center gap-2 mb-5">
                <input
                  value={v.name}
                  onChange={e => setVariantName(vi, e.target.value)}
                  className="flex-1 border border-border rounded-xl px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/30 bg-background"
                />
                {variants.length > 1 && (
                  <button onClick={() => removeVariant(vi)} className="text-muted-foreground hover:text-destructive">
                    <Icon name="X" size={18} />
                  </button>
                )}
              </div>

              {/* BASE: Доходы и расходы */}
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Доходы и расходы</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                {BASE_FIELDS.map(f => (
                  <FieldInput key={f.key} field={f} value={v.parameters[f.key] || ''} onChange={val => setParam(vi, f.key, val)} />
                ))}
              </div>

              {/* TYPE-SPECIFIC field groups */}
              {typeGroups.map((group, gi) => (
                <div key={gi}>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">{group.title}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                    {group.fields.map(f => (
                      <FieldInput key={f.key} field={f} value={v.parameters[f.key] || ''} onChange={val => setParam(vi, f.key, val)} step={f.step} />
                    ))}
                  </div>
                </div>
              ))}

              {/* Generic credit */}
              {showGenericCredit && (
                <>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Кредит / ипотека</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                    {CREDIT_FIELDS.map(f => (
                      <FieldInput key={f.key} field={f} value={v.parameters[f.key] || ''} onChange={val => setParam(vi, f.key, val)} />
                    ))}
                  </div>
                </>
              )}

              {/* Инвестиции */}
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Инвестиции</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                {INVEST_FIELDS.map(f => (
                  <FieldInput key={f.key} field={f} value={v.parameters[f.key] || ''} onChange={val => setParam(vi, f.key, val)} />
                ))}
              </div>

              {/* Расширенные */}
              <button
                onClick={() => setShowAdv(prev => ({ ...prev, [vi]: !prev[vi] }))}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mt-1"
              >
                <Icon name={showAdv[vi] ? 'ChevronUp' : 'ChevronDown'} size={16} />
                {showAdv[vi] ? 'Скрыть' : 'Показать расширенные параметры'}
              </button>

              {showAdv[vi] && (
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {ADV_FIELDS.map(f => (
                    <FieldInput key={f.key} field={f} value={v.parameters[f.key] || ''} onChange={val => setParam(vi, f.key, val)} />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="mt-8 w-full bg-primary text-white rounded-xl py-4 text-base font-medium hover:opacity-90 transition-opacity disabled:opacity-60"
        >
          {saving
            ? <span className="flex items-center justify-center gap-2"><Icon name="Loader2" size={18} className="animate-spin" />Сохранение...</span>
            : 'Просчитать сценарии'
          }
        </button>
      </div>
    </div>
  );
}