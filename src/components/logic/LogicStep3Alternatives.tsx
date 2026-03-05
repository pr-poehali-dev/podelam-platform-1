import { useState, useMemo } from "react";
import Icon from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import type { LogicData, LogicStep3Data, AlternativeHypothesis } from "@/lib/logicTrainerTypes";
import { calcIAL } from "@/lib/logicTrainerFormulas";

interface StepProps {
  data: LogicData;
  onUpdate: (stepKey: string, data: LogicStep3Data) => void;
  onNext: () => void;
  onBack: () => void;
}

function createHypothesis(): AlternativeHypothesis {
  return {
    id: crypto.randomUUID(),
    description: "",
    probability: 25,
  };
}

export default function LogicStep3Alternatives({ data, onUpdate, onNext, onBack }: StepProps) {
  const prev = data.step3;

  const [hypotheses, setHypotheses] = useState<AlternativeHypothesis[]>(
    prev?.hypotheses || [createHypothesis()]
  );
  const [errors, setErrors] = useState<string[]>([]);

  const totalProbability = useMemo(
    () => hypotheses.reduce((s, h) => s + h.probability, 0),
    [hypotheses]
  );

  const currentData: LogicStep3Data = useMemo(
    () => ({ hypotheses, ial: 0 }),
    [hypotheses]
  );

  const ial = useMemo(() => calcIAL(currentData), [currentData]);

  const updateHypothesis = (id: string, patch: Partial<AlternativeHypothesis>) => {
    setHypotheses((prev) => prev.map((h) => (h.id === id ? { ...h, ...patch } : h)));
  };

  const removeHypothesis = (id: string) => {
    setHypotheses((prev) => prev.filter((h) => h.id !== id));
  };

  const addHypothesis = () => {
    setHypotheses((prev) => [...prev, createHypothesis()]);
  };

  const validate = (): boolean => {
    const errs: string[] = [];
    if (hypotheses.length < 3)
      errs.push(`Нужно минимум 3 гипотезы (сейчас ${hypotheses.length})`);
    const empty = hypotheses.filter((h) => !h.description.trim());
    if (empty.length > 0) errs.push("Заполните описание всех гипотез");
    setErrors(errs);
    return errs.length === 0;
  };

  const buildData = (): LogicStep3Data => ({
    hypotheses,
    ial,
  });

  const handleSubmit = () => {
    if (!validate()) return;
    onUpdate("step3", buildData());
    onNext();
  };

  const handleBack = () => {
    if (hypotheses.some((h) => h.description.trim())) {
      onUpdate("step3", buildData());
    }
    onBack();
  };

  const probIsClose = totalProbability >= 95 && totalProbability <= 105;
  const probBarColor = probIsClose
    ? "bg-emerald-500"
    : totalProbability > 100
      ? "bg-amber-500"
      : "bg-indigo-500";
  const probTextColor = probIsClose ? "text-emerald-600" : "text-slate-900";

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
            <span className="text-xs font-bold text-white">3</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">Альтернативные гипотезы</h2>
        </div>
        <p className="text-sm text-slate-500 ml-11">
          Предложите минимум 3 альтернативных объяснения
        </p>
      </div>

      <div className="rounded-xl bg-indigo-50/50 border border-indigo-100 p-4 mb-8">
        <div className="flex items-start gap-3">
          <Icon name="Info" size={16} className="text-indigo-500 mt-0.5 shrink-0" />
          <div className="text-sm text-indigo-700 space-y-1">
            <p className="font-medium">Как пользоваться этим шагом</p>
            <p className="text-xs text-indigo-600/80">Придумайте минимум 3 альтернативных объяснения ситуации. Для каждого укажите вероятность. Сумма вероятностей должна быть около 100% — система скорректирует пропорционально. Чем больше альтернатив и равномернее распределение — тем выше индекс.</p>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <p className="text-xs text-slate-500 uppercase tracking-wider">Гипотезы</p>
              <span className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full">
                {hypotheses.length}
              </span>
            </div>
            <span className="text-[11px] text-slate-400">мин. 3</span>
          </div>

          <div className="space-y-4">
            {hypotheses.map((h, idx) => (
              <div
                key={h.id}
                className="rounded-xl border border-slate-200 bg-white p-4 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-400">#{idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeHypothesis(h.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <Icon name="X" size={16} />
                  </button>
                </div>

                <div>
                  <Label className="text-[11px] text-slate-500 mb-1.5 block">Описание</Label>
                  <Input
                    value={h.description}
                    onChange={(e) => updateHypothesis(h.id, { description: e.target.value })}
                    placeholder="Альтернативное объяснение..."
                    className="border-slate-200 focus-visible:ring-indigo-400"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[11px] text-slate-500">Вероятность</p>
                    <span className="text-xs font-bold text-indigo-600">{h.probability}%</span>
                  </div>
                  <Slider
                    value={[h.probability]}
                    onValueChange={([v]) => updateHypothesis(h.id, { probability: v })}
                    min={1}
                    max={100}
                    step={1}
                  />
                  <div className="flex justify-between mt-1">
                    <span className="text-[10px] text-slate-400">1%</span>
                    <span className="text-[10px] text-slate-400">100%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Button
            variant="outline"
            onClick={addHypothesis}
            className="mt-3 w-full border-dashed border-slate-300 text-slate-600 hover:text-indigo-600 hover:border-indigo-300"
          >
            <Icon name="Plus" size={16} className="mr-2" />
            Добавить гипотезу
          </Button>
        </div>

        {hypotheses.length > 0 && (
          <>
            <div className="border-t border-slate-100" />

            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-4">
                Распределение вероятностей
              </p>

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[11px] text-slate-500">Сумма вероятностей</p>
                  <p className={`text-sm font-semibold ${probTextColor}`}>
                    {totalProbability}%
                  </p>
                </div>
                <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${probBarColor}`}
                    style={{ width: `${Math.min(totalProbability, 100)}%` }}
                  />
                </div>
                {!probIsClose && (
                  <p className="text-[10px] text-slate-400 mt-2">
                    Система пропорционально скорректирует
                  </p>
                )}
              </div>

              <div className={`rounded-lg border p-4 text-center ${
                ial >= 2 ? "bg-emerald-50 border-emerald-100" : ial >= 1 ? "bg-amber-50 border-amber-100" : "bg-red-50 border-red-100"
              }`}>
                <p className="text-[11px] text-slate-500 mb-1">Индекс альтернативности</p>
                <p className={`text-2xl font-bold ${
                  ial >= 2 ? "text-emerald-600" : ial >= 1 ? "text-amber-600" : "text-red-600"
                }`}>{ial.toFixed(2)}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">IAL (норма: 2+)</p>
              </div>
              {ial < 1 && hypotheses.length > 0 && (
                <div className="rounded-lg bg-amber-50 border border-amber-100 p-3 mt-4">
                  <div className="flex items-start gap-2">
                    <Icon name="Info" size={14} className="text-amber-600 mt-0.5 shrink-0" />
                    <p className="text-xs text-amber-700">Мало альтернатив или одна гипотеза доминирует — добавьте ещё объяснений.</p>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {errors.length > 0 && (
          <div className="rounded-xl bg-red-50 border border-red-100 p-4 space-y-1">
            {errors.map((err, i) => (
              <p key={i} className="text-sm text-red-600 flex items-center gap-2">
                <Icon name="AlertCircle" size={14} />
                {err}
              </p>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between pt-4">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="text-slate-600 hover:text-slate-900"
          >
            <Icon name="ArrowLeft" size={16} className="mr-2" />
            Назад
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-indigo-600 text-white hover:bg-indigo-700"
          >
            Далее
            <Icon name="ArrowRight" size={16} className="ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}