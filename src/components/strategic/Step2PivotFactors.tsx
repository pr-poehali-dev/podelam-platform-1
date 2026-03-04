import { useState, useMemo } from "react";
import Icon from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { StrategicData, Step2Data } from "@/lib/proTrainerTypes";
import { calcStep2 } from "@/lib/proTrainerFormulas";

interface StepProps {
  data: StrategicData;
  onUpdate: (stepKey: string, data: Step2Data) => void;
  onNext: () => void;
  onBack: () => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  micro: "Микро",
  meso: "Мезо",
  macro: "Макро",
  hidden: "Скрытые",
};

const CATEGORY_COLORS: Record<string, string> = {
  micro: "bg-blue-100 text-blue-700",
  meso: "bg-amber-100 text-amber-700",
  macro: "bg-emerald-100 text-emerald-700",
  hidden: "bg-purple-100 text-purple-700",
};

export default function Step2PivotFactors({ data, onUpdate, onNext, onBack }: StepProps) {
  const factors = data.step1?.factors || [];
  const links = data.step1?.links || [];

  const sorted = useMemo(
    () => [...factors].sort((a, b) => b.influence - a.influence),
    [factors]
  );

  const prev = data.step2;
  const [selected, setSelected] = useState<string[]>(prev?.pivotFactorIds || []);
  const [errors, setErrors] = useState<string[]>([]);

  const toggle = (id: string) => {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((s) => s !== id);
      if (prev.length >= 5) return prev;
      return [...prev, id];
    });
  };

  const calc = useMemo(() => {
    if (selected.length < 3) return null;
    return calcStep2(factors, links, selected);
  }, [factors, links, selected]);

  const validate = (): boolean => {
    const errs: string[] = [];
    if (selected.length < 3) errs.push("Выберите минимум 3 узловых фактора");
    if (selected.length > 5) errs.push("Максимум 5 узловых факторов");
    setErrors(errs);
    return errs.length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    const result = calcStep2(factors, links, selected);
    const stepData: Step2Data = {
      pivotFactorIds: selected,
      ...result,
    };
    onUpdate("step2", stepData);
    onNext();
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-lg bg-slate-950 flex items-center justify-center">
            <span className="text-xs font-bold text-white">2</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">Определение узловых факторов</h2>
        </div>
        <p className="text-sm text-slate-500 ml-11">
          Выберите 3-5 факторов с наибольшим рычагом влияния
        </p>
      </div>

      <div className="flex items-center justify-between mb-6">
        <span className="text-sm text-slate-500">
          Выбрано: <span className="font-medium text-slate-900">{selected.length}</span> / 3-5
        </span>
        {selected.length >= 3 && (
          <span className="text-xs text-emerald-600 flex items-center gap-1">
            <Icon name="Check" size={12} />
            Минимум выбран
          </span>
        )}
      </div>

      <div className="space-y-2 mb-8">
        {sorted.map((f, i) => {
          const isSelected = selected.includes(f.id);
          const outgoing = links.filter((l) => l.from === f.id).length;

          return (
            <button
              key={f.id}
              onClick={() => toggle(f.id)}
              className={`w-full text-left rounded-xl border p-4 transition-all ${
                isSelected
                  ? "border-slate-900 bg-slate-950 text-white"
                  : "border-slate-200 bg-white hover:border-slate-300"
              } ${!isSelected && selected.length >= 5 ? "opacity-40 cursor-not-allowed" : ""}`}
              disabled={!isSelected && selected.length >= 5}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <span
                    className={`text-xs font-mono ${isSelected ? "text-slate-400" : "text-slate-400"}`}
                  >
                    #{i + 1}
                  </span>
                  <span className={`text-sm font-medium truncate ${isSelected ? "text-white" : "text-slate-900"}`}>
                    {f.name}
                  </span>
                  <span
                    className={`text-[10px] font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${
                      isSelected ? "bg-slate-800 text-slate-300" : CATEGORY_COLORS[f.category]
                    }`}
                  >
                    {CATEGORY_LABELS[f.category]}
                  </span>
                </div>
                <div className="flex items-center gap-4 flex-shrink-0 ml-3">
                  <div className={`text-xs ${isSelected ? "text-slate-400" : "text-slate-500"}`}>
                    Влияние: <span className="font-medium">{f.influence}</span>
                  </div>
                  <div className={`text-xs ${isSelected ? "text-slate-400" : "text-slate-500"}`}>
                    Связей: <span className="font-medium">{outgoing}</span>
                  </div>
                  <div
                    className={`w-6 h-6 rounded-md border flex items-center justify-center transition-all ${
                      isSelected ? "bg-white border-white" : "border-slate-300"
                    }`}
                  >
                    {isSelected && <Icon name="Check" size={14} className="text-slate-900" />}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {calc && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 mb-6">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-4">Расчётные показатели</p>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <p className="text-[11px] text-slate-500 mb-1">СУФ</p>
              <p className="text-xl font-bold text-slate-900">{calc.suf}</p>
            </div>
            <div>
              <p className="text-[11px] text-slate-500 mb-1">Слепых зон</p>
              <p className="text-xl font-bold text-slate-900">{calc.blindSpots.length}</p>
            </div>
            <div>
              <p className="text-[11px] text-slate-500 mb-1">КПС</p>
              <p className="text-xl font-bold text-slate-900">{calc.kps}</p>
            </div>
          </div>
          {calc.blindSpots.length > 0 && (
            <div>
              <p className="text-xs text-slate-500 mb-2">Факторы в слепой зоне (влияние &ge; 4, не выбраны):</p>
              <div className="flex flex-wrap gap-1.5">
                {calc.blindSpots.map((id) => {
                  const f = factors.find((fac) => fac.id === id);
                  return f ? (
                    <span key={id} className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                      {f.name}
                    </span>
                  ) : null;
                })}
              </div>
            </div>
          )}
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
        <Button variant="ghost" onClick={onBack} className="text-slate-500 hover:text-slate-900">
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
