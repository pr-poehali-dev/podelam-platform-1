import { useState, useMemo } from "react";
import Icon from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { StrategicData, Step4Data, Risk } from "@/lib/proTrainerTypes";
import { calcStep4 } from "@/lib/proTrainerFormulas";
import StepHint from "./StepHint";

interface StepProps {
  data: StrategicData;
  onUpdate: (stepKey: string, data: Step4Data) => void;
  onNext: () => void;
  onBack: () => void;
}

function createEmptyRisk(): Risk {
  return {
    id: crypto.randomUUID(),
    name: "",
    probability: 3,
    damage: 3,
    manageability: 3,
  };
}

function riskColor(probability: number, damage: number): string {
  const score = probability * damage;
  if (score > 15) return "border-red-300 bg-red-50";
  if (score > 8) return "border-amber-300 bg-amber-50";
  return "border-emerald-300 bg-emerald-50";
}

function riskBadge(probability: number, damage: number): { label: string; className: string } {
  const score = probability * damage;
  if (score > 15) return { label: "Критический", className: "bg-red-100 text-red-700" };
  if (score > 8) return { label: "Умеренный", className: "bg-amber-100 text-amber-700" };
  return { label: "Низкий", className: "bg-emerald-100 text-emerald-700" };
}

export default function Step4Risks({ data, onUpdate, onNext, onBack }: StepProps) {
  const prev = data.step4;
  const [risks, setRisks] = useState<Risk[]>(prev?.risks || [createEmptyRisk()]);
  const [editingId, setEditingId] = useState<string | null>(risks[0]?.id || null);
  const [errors, setErrors] = useState<string[]>([]);

  const validRisks = useMemo(() => risks.filter((r) => r.name.trim().length > 0), [risks]);
  const calc = useMemo(() => {
    if (validRisks.length === 0) return null;
    return calcStep4(validRisks);
  }, [validRisks]);

  const updateRisk = (id: string, patch: Partial<Risk>) => {
    setRisks((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  };

  const addRisk = () => {
    const r = createEmptyRisk();
    setRisks((prev) => [...prev, r]);
    setEditingId(r.id);
  };

  const removeRisk = (id: string) => {
    setRisks((prev) => prev.filter((r) => r.id !== id));
    if (editingId === id) setEditingId(null);
  };

  const validate = (): boolean => {
    const errs: string[] = [];
    if (validRisks.length < 7) errs.push(`Добавьте минимум 7 рисков (сейчас ${validRisks.length})`);
    const empty = risks.filter((r) => r.name.trim().length === 0);
    if (empty.length > 0) errs.push(`${empty.length} риск(ов) без названия`);
    setErrors(errs);
    return errs.length === 0;
  };

  const getCurrentData = (): Step4Data => {
    const result = validRisks.length > 0 ? calcStep4(validRisks) : { ir: 0, iur: 0 };
    return { risks: validRisks, ...result };
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onUpdate("step4", getCurrentData());
    onNext();
  };

  const handleBack = () => {
    if (validRisks.length > 0) {
      onUpdate("step4", getCurrentData());
    }
    onBack();
  };

  const editing = risks.find((r) => r.id === editingId);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-lg bg-slate-950 flex items-center justify-center">
            <span className="text-xs font-bold text-white">4</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">Анализ рисков</h2>
        </div>
        <p className="text-sm text-slate-500 ml-11">Определите и оцените минимум 7 рисков</p>
      </div>

      <StepHint
        title="Как определять и оценивать риски?"
        description="Риски — это то, что может пойти не так. Не бойтесь их записывать — чем честнее вы с собой, тем лучше подготовитесь. Хороший стратег не тот, кто не видит рисков, а тот, кто знает о них заранее."
        hints={[
          { term: "Что записывать как риск", explanation: "любую угрозу вашему плану. Примеры: «уход ключевого сотрудника», «рост цен на сырьё», «появление сильного конкурента», «задержка поставок»" },
          { term: "Вероятность (1-5)", explanation: "насколько вероятно, что этот риск сработает. 1 — маловероятно, 3 — возможно, 5 — почти наверняка случится" },
          { term: "Ущерб (1-5)", explanation: "насколько серьёзным будет урон, если риск сработает. 1 — незначительный, 3 — ощутимый, 5 — может разрушить проект" },
          { term: "Управляемость (1-5)", explanation: "можете ли вы повлиять на этот риск. 1 — никак (например, стихийное бедствие), 5 — полностью контролируете (например, качество своего продукта)" },
          { term: "Score (оценка риска)", explanation: "вероятность × ущерб. Автоматически вычисляется. Чем выше — тем опаснее риск" },
          { term: "Критический риск (красный)", explanation: "Score больше 15. Требует немедленного плана реагирования" },
          { term: "Умеренный риск (жёлтый)", explanation: "Score от 9 до 15. Нужно держать под контролем" },
          { term: "Низкий риск (зелёный)", explanation: "Score 8 и ниже. Можно мониторить, но не паниковать" },
          { term: "ИР (Индекс рисков)", explanation: "сумма всех Score. Общий уровень рисковости проекта" },
          { term: "ИУР (Индекс управления рисками)", explanation: "средняя управляемость ваших рисков. Чем выше — тем больше вы можете влиять на ситуацию" },
        ]}
      />

      <div className="flex items-center gap-3 mb-6">
        <Button onClick={addRisk} className="bg-slate-950 text-white hover:bg-slate-800 h-9 text-sm">
          <Icon name="Plus" size={14} />
          Добавить риск
        </Button>
        <span className="text-sm text-slate-400 ml-auto">{validRisks.length} / 7 мин.</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
        {risks.map((r) => {
          const badge = riskBadge(r.probability, r.damage);
          return (
            <div
              key={r.id}
              className={`rounded-xl border p-4 cursor-pointer transition-all ${
                editingId === r.id
                  ? "border-slate-900 bg-slate-50"
                  : r.name.trim() ? riskColor(r.probability, r.damage) : "border-slate-200"
              }`}
              onClick={() => setEditingId(editingId === r.id ? null : r.id)}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span className="text-sm font-medium text-slate-900 truncate">
                    {r.name || "Без названия"}
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {r.name.trim() && (
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${badge.className}`}>
                      {badge.label}
                    </span>
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); removeRisk(r.id); }}
                    className="text-slate-400 hover:text-red-500 transition-colors p-1"
                  >
                    <Icon name="X" size={14} />
                  </button>
                </div>
              </div>
              <div className="flex gap-3 text-[11px] text-slate-500">
                <span>P: {r.probability}</span>
                <span>D: {r.damage}</span>
                <span>M: {r.manageability}</span>
                <span className="font-medium">Score: {r.probability * r.damage}</span>
              </div>
            </div>
          );
        })}
      </div>

      {editing && editingId && (
        <div className="rounded-xl border border-slate-900 bg-white p-6 mb-6 transition-all">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Редактирование риска</h3>
          <div className="space-y-4">
            <div>
              <Label className="text-slate-600 text-xs mb-1.5 block">Название риска</Label>
              <Input
                value={editing.name}
                onChange={(e) => updateRisk(editingId, { name: e.target.value })}
                placeholder="Опишите риск"
                className="border-slate-200 focus-visible:ring-slate-400"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-slate-600 text-xs">Вероятность</Label>
                <span className="text-xs font-medium text-slate-900">{editing.probability} / 5</span>
              </div>
              <Slider
                value={[editing.probability]}
                onValueChange={([v]) => updateRisk(editingId, { probability: v })}
                min={1} max={5} step={1}
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-slate-600 text-xs">Ущерб</Label>
                <span className="text-xs font-medium text-slate-900">{editing.damage} / 5</span>
              </div>
              <Slider
                value={[editing.damage]}
                onValueChange={([v]) => updateRisk(editingId, { damage: v })}
                min={1} max={5} step={1}
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-slate-600 text-xs">Управляемость</Label>
                <span className="text-xs font-medium text-slate-900">{editing.manageability} / 5</span>
              </div>
              <Slider
                value={[editing.manageability]}
                onValueChange={([v]) => updateRisk(editingId, { manageability: v })}
                min={1} max={5} step={1}
              />
            </div>
          </div>
        </div>
      )}

      {calc && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 mb-6">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-3">Расчётные показатели</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[11px] text-slate-500 mb-1">Индекс рисков (ИР)</p>
              <p className="text-xl font-bold text-slate-900">{calc.ir}</p>
            </div>
            <div>
              <p className="text-[11px] text-slate-500 mb-1">Индекс управляемости (ИУР)</p>
              <p className="text-xl font-bold text-slate-900">{calc.iur}</p>
            </div>
          </div>
        </div>
      )}

      {errors.length > 0 && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 mb-6">
          {errors.map((e, i) => (
            <p key={i} className="text-sm text-red-600 flex items-center gap-2">
              <Icon name="AlertCircle" size={14} />
              {e}
            </p>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between pt-6 border-t border-slate-100">
        <Button variant="ghost" onClick={handleBack} className="text-slate-500 hover:text-slate-900">
          <Icon name="ArrowLeft" size={16} />
          Назад
        </Button>
        <Button onClick={handleSubmit} className="bg-slate-950 text-white hover:bg-slate-800 h-11 px-6">
          Далее
          <Icon name="ArrowRight" size={16} />
        </Button>
      </div>
    </div>
  );
}