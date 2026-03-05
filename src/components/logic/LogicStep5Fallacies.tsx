import { useState, useMemo } from "react";
import Icon from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import type { LogicData, LogicStep5Data, LogicalFallacy } from "@/lib/logicTrainerTypes";
import { FALLACY_LABELS } from "@/lib/logicTrainerTypes";
import { calcIKI } from "@/lib/logicTrainerFormulas";

interface StepProps {
  data: LogicData;
  onUpdate: (stepKey: string, data: LogicStep5Data) => void;
  onNext: () => void;
  onBack: () => void;
}

const FALLACY_DESCRIPTIONS: Record<LogicalFallacy, string> = {
  generalization: "Выводы на основе единичных случаев",
  emotional: "Решение под влиянием эмоций, а не фактов",
  reverse_cause: "Перепутаны причина и следствие",
  black_white: "Нет промежуточных вариантов",
  ignore_alternatives: "Не рассмотрены другие объяснения",
  survivorship: "Учтены только успешные примеры",
};

const ALL_FALLACIES: LogicalFallacy[] = [
  "generalization",
  "emotional",
  "reverse_cause",
  "black_white",
  "ignore_alternatives",
  "survivorship",
];

export default function LogicStep5Fallacies({ data, onUpdate, onNext, onBack }: StepProps) {
  const prev = data.step5;

  const [fallacies, setFallacies] = useState<LogicalFallacy[]>(prev?.fallacies || []);

  const currentData: LogicStep5Data = useMemo(
    () => ({ fallacies, iki: 0 }),
    [fallacies]
  );

  const iki = useMemo(() => calcIKI(currentData), [currentData]);

  const toggleFallacy = (f: LogicalFallacy) => {
    setFallacies((prev) =>
      prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]
    );
  };

  const buildData = (): LogicStep5Data => ({
    fallacies,
    iki,
  });

  const handleSubmit = () => {
    onUpdate("step5", buildData());
    onNext();
  };

  const handleBack = () => {
    onUpdate("step5", buildData());
    onBack();
  };

  const ikiColor =
    iki > 0.5 ? "text-red-600" : iki > 0.3 ? "text-amber-600" : "text-emerald-600";
  const ikiBg =
    iki > 0.5
      ? "bg-red-50 border-red-100"
      : iki > 0.3
        ? "bg-amber-50 border-amber-100"
        : "bg-emerald-50 border-emerald-100";

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
            <span className="text-xs font-bold text-white">5</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">Проверка на логические ошибки</h2>
        </div>
        <p className="text-sm text-slate-500 ml-11">
          Отметьте ошибки, которые вы обнаружили в своих рассуждениях
        </p>
      </div>

      <div className="rounded-xl bg-indigo-50/50 border border-indigo-100 p-4 mb-8">
        <div className="flex items-start gap-3">
          <Icon name="Info" size={16} className="text-indigo-500 mt-0.5 shrink-0" />
          <div className="text-sm text-indigo-700 space-y-1">
            <p className="font-medium">Как пользоваться этим шагом</p>
            <p className="text-xs text-indigo-600/80">Честно отметьте все когнитивные ошибки, которые вы заметили в своих рассуждениях. Чем больше ошибок отмечено — тем выше индекс когнитивных искажений (IKI). Но честная самопроверка — это признак зрелого мышления, не наоборот.</p>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        <div className="space-y-3">
          {ALL_FALLACIES.map((f) => {
            const isChecked = fallacies.includes(f);
            return (
              <div
                key={f}
                role="button"
                tabIndex={0}
                onClick={() => toggleFallacy(f)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    toggleFallacy(f);
                  }
                }}
                className={`rounded-xl border p-4 transition-all cursor-pointer ${
                  isChecked
                    ? "bg-indigo-50 border-indigo-300"
                    : "bg-white border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                      isChecked
                        ? "bg-indigo-600 border-indigo-600"
                        : "border-slate-300 bg-white"
                    }`}
                  >
                    {isChecked && <Icon name="Check" size={12} className="text-white" />}
                  </div>
                  <div>
                    <p
                      className={`text-sm font-medium ${
                        isChecked ? "text-indigo-900" : "text-slate-900"
                      }`}
                    >
                      {FALLACY_LABELS[f]}
                    </p>
                    <p
                      className={`text-[11px] mt-0.5 ${
                        isChecked ? "text-indigo-600" : "text-slate-400"
                      }`}
                    >
                      {FALLACY_DESCRIPTIONS[f]}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="border-t border-slate-100" />

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-4">
            Индекс когнитивных искажений
          </p>
          <div className={`rounded-lg border p-4 text-center ${ikiBg}`}>
            <p className="text-[11px] text-slate-500 mb-1">IKI</p>
            <p className={`text-2xl font-bold ${ikiColor}`}>{(iki * 100).toFixed(0)}%</p>
            <p className="text-[10px] text-slate-400 mt-0.5">
              {fallacies.length} / 6 отмечено
            </p>
          </div>

          {fallacies.length === 0 && (
            <div className="rounded-lg bg-amber-50 border border-amber-100 p-3 mt-4">
              <div className="flex items-start gap-2">
                <Icon
                  name="Info"
                  size={14}
                  className="text-amber-600 mt-0.5 shrink-0"
                />
                <p className="text-xs text-amber-700">
                  Внимательно проверьте — мало кто мыслит без искажений
                </p>
              </div>
            </div>
          )}

          {iki > 0.5 && (
            <div className="rounded-lg bg-red-50 border border-red-100 p-3 mt-4">
              <div className="flex items-start gap-2">
                <Icon
                  name="AlertTriangle"
                  size={14}
                  className="text-red-600 mt-0.5 shrink-0"
                />
                <p className="text-xs text-red-700">
                  Обнаружено много когнитивных искажений. Рекомендуется пересмотреть
                  аргументацию с учётом выявленных ошибок.
                </p>
              </div>
            </div>
          )}
        </div>

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