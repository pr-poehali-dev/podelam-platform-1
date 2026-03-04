import { useState, useMemo } from "react";
import Icon from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StrategicData, Step6Data } from "@/lib/proTrainerTypes";
import { calcIKG } from "@/lib/proTrainerFormulas";

interface StepProps {
  data: StrategicData;
  onUpdate: (stepKey: string, data: Step6Data) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function Step6Flexibility({ data, onUpdate, onNext, onBack }: StepProps) {
  const factors = data.step1?.factors || [];
  const risks = data.step4?.risks || [];
  const scenarios = data.step3?.scenarios || [];

  const prev = data.step6;
  const [readyToChange, setReadyToChange] = useState<boolean | null>(prev?.readyToChange ?? null);
  const [wrongAssumptions, setWrongAssumptions] = useState<string[]>(prev?.wrongAssumptions || []);
  const [newAssumption, setNewAssumption] = useState("");
  const [underestimatedFactors, setUnderestimatedFactors] = useState<string[]>(prev?.underestimatedFactors || []);
  const [errors, setErrors] = useState<string[]>([]);

  const totalParams = factors.length + risks.length + scenarios.length * 4;
  const revisedParams = wrongAssumptions.length + underestimatedFactors.length;

  const ikg = useMemo(() => calcIKG(revisedParams, totalParams), [revisedParams, totalParams]);

  const addAssumption = () => {
    if (newAssumption.trim().length === 0) return;
    setWrongAssumptions((prev) => [...prev, newAssumption.trim()]);
    setNewAssumption("");
  };

  const removeAssumption = (index: number) => {
    setWrongAssumptions((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleFactor = (factorId: string) => {
    setUnderestimatedFactors((prev) =>
      prev.includes(factorId) ? prev.filter((id) => id !== factorId) : [...prev, factorId]
    );
  };

  const validate = (): boolean => {
    const errs: string[] = [];
    if (readyToChange === null) errs.push("Ответьте на вопрос о готовности менять решение");
    setErrors(errs);
    return errs.length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    const stepData: Step6Data = {
      readyToChange: readyToChange!,
      wrongAssumptions,
      underestimatedFactors,
      ikg,
      revisedParams,
      totalParams,
    };
    onUpdate("step6", stepData);
    onNext();
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-lg bg-slate-950 flex items-center justify-center">
            <span className="text-xs font-bold text-white">6</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">Проверка когнитивной гибкости</h2>
        </div>
        <p className="text-sm text-slate-500 ml-11">Оцените свою готовность адаптировать решения</p>
      </div>

      <div className="rounded-xl border border-slate-200 p-6 mb-8">
        <h3 className="text-base font-semibold text-slate-900 mb-2">
          Готовы ли вы изменить принятое решение?
        </h3>
        <p className="text-sm text-slate-500 mb-5">
          Учитывая результаты стресс-теста и анализа рисков, готовы ли вы кардинально пересмотреть стратегию?
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => setReadyToChange(true)}
            className={`flex-1 h-12 rounded-lg border text-sm font-medium transition-all ${
              readyToChange === true
                ? "border-slate-900 bg-slate-950 text-white"
                : "border-slate-200 text-slate-600 hover:border-slate-300"
            }`}
          >
            Да, готов(а)
          </button>
          <button
            onClick={() => setReadyToChange(false)}
            className={`flex-1 h-12 rounded-lg border text-sm font-medium transition-all ${
              readyToChange === false
                ? "border-slate-900 bg-slate-950 text-white"
                : "border-slate-200 text-slate-600 hover:border-slate-300"
            }`}
          >
            Нет, оставлю как есть
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 p-6 mb-8">
        <h3 className="text-base font-semibold text-slate-900 mb-2">
          Какие допущения оказались неверны?
        </h3>
        <p className="text-sm text-slate-500 mb-5">
          Перечислите допущения, которые вы сделали в начале, но теперь считаете ошибочными
        </p>

        {wrongAssumptions.length > 0 && (
          <div className="space-y-2 mb-4">
            {wrongAssumptions.map((a, i) => (
              <div key={i} className="flex items-center gap-2 rounded-lg bg-slate-50 border border-slate-200 px-3 py-2">
                <Icon name="AlertTriangle" size={14} className="text-amber-500 flex-shrink-0" />
                <span className="text-sm text-slate-700 flex-1">{a}</span>
                <button
                  onClick={() => removeAssumption(i)}
                  className="text-slate-400 hover:text-red-500 transition-colors"
                >
                  <Icon name="X" size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <Input
            value={newAssumption}
            onChange={(e) => setNewAssumption(e.target.value)}
            placeholder="Например: переоценил спрос на продукт"
            className="border-slate-200 focus-visible:ring-slate-400"
            onKeyDown={(e) => e.key === "Enter" && addAssumption()}
          />
          <Button
            onClick={addAssumption}
            disabled={newAssumption.trim().length === 0}
            className="bg-slate-950 text-white hover:bg-slate-800 h-10 px-4 flex-shrink-0"
          >
            <Icon name="Plus" size={14} />
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 p-6 mb-8">
        <h3 className="text-base font-semibold text-slate-900 mb-2">
          Какие факторы вы недооценили?
        </h3>
        <p className="text-sm text-slate-500 mb-5">
          Выберите факторы из вашего анализа, влияние которых вы недооценили
        </p>

        <div className="space-y-1.5">
          {factors.map((f) => {
            const isSelected = underestimatedFactors.includes(f.id);
            return (
              <button
                key={f.id}
                onClick={() => toggleFactor(f.id)}
                className={`w-full text-left rounded-lg border px-4 py-3 transition-all flex items-center gap-3 ${
                  isSelected
                    ? "border-slate-900 bg-slate-950 text-white"
                    : "border-slate-200 text-slate-700 hover:border-slate-300"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 transition-all ${
                    isSelected ? "bg-white border-white" : "border-slate-300"
                  }`}
                >
                  {isSelected && <Icon name="Check" size={12} className="text-slate-900" />}
                </div>
                <span className="text-sm font-medium flex-1">{f.name}</span>
                <span className={`text-xs ${isSelected ? "text-slate-400" : "text-slate-400"}`}>
                  Влияние: {f.influence}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 mb-6">
        <p className="text-xs text-slate-500 uppercase tracking-wider mb-3">Расчётные показатели</p>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-[11px] text-slate-500 mb-1">Пересмотрено параметров</p>
            <p className="text-xl font-bold text-slate-900">{revisedParams}</p>
          </div>
          <div>
            <p className="text-[11px] text-slate-500 mb-1">Всего параметров</p>
            <p className="text-xl font-bold text-slate-900">{totalParams}</p>
          </div>
          <div>
            <p className="text-[11px] text-slate-500 mb-1">ИКГ</p>
            <p className="text-xl font-bold text-slate-900">{ikg}</p>
          </div>
        </div>
      </div>

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
        <Button variant="ghost" onClick={onBack} className="text-slate-500 hover:text-slate-900">
          <Icon name="ArrowLeft" size={16} />
          Назад
        </Button>
        <Button onClick={handleSubmit} className="bg-slate-950 text-white hover:bg-slate-800 h-11 px-6">
          Завершить
          <Icon name="ArrowRight" size={16} />
        </Button>
      </div>
    </div>
  );
}