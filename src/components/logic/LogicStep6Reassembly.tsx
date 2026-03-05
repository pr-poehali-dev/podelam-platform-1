import { useState, useMemo } from "react";
import Icon from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import type { LogicData, LogicStep6Data } from "@/lib/logicTrainerTypes";
import { calcILC } from "@/lib/logicTrainerFormulas";

interface StepProps {
  data: LogicData;
  onUpdate: (stepKey: string, data: LogicStep6Data) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function LogicStep6Reassembly({ data, onUpdate, onNext, onBack }: StepProps) {
  const prev = data.step6;
  const step0 = data.step0;

  const [revisedDecision, setRevisedDecision] = useState(prev?.revisedDecision || "");
  const [revisedConfidence, setRevisedConfidence] = useState(
    prev?.revisedConfidence ?? (step0?.initialConfidence ?? 50)
  );
  const [errors, setErrors] = useState<string[]>([]);

  const oldConfidence = step0?.initialConfidence ?? 0;
  const delta = revisedConfidence - oldConfidence;

  const ilc = useMemo(() => {
    if (!step0) return 0;
    return calcILC(step0, { revisedDecision, revisedConfidence, ilc: 0 });
  }, [step0, revisedDecision, revisedConfidence]);

  const validate = (): boolean => {
    const errs: string[] = [];
    if (!revisedDecision.trim()) errs.push("Сформулируйте новое решение");
    setErrors(errs);
    return errs.length === 0;
  };

  const buildData = (): LogicStep6Data => ({
    revisedDecision: revisedDecision.trim(),
    revisedConfidence,
    ilc,
  });

  const handleSubmit = () => {
    if (!validate()) return;
    onUpdate("step6", buildData());
    onNext();
  };

  const handleBack = () => {
    if (revisedDecision.trim()) {
      onUpdate("step6", buildData());
    }
    onBack();
  };

  const ilcColor =
    ilc === 0 ? "text-amber-600" : ilc > 0.3 ? "text-emerald-600" : "text-slate-900";
  const ilcBg =
    ilc === 0
      ? "bg-amber-50 border-amber-100"
      : ilc > 0.3
        ? "bg-emerald-50 border-emerald-100"
        : "bg-slate-50 border-slate-200";

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
            <span className="text-xs font-bold text-white">6</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">Пересборка решения</h2>
        </div>
        <p className="text-sm text-slate-500 ml-11">
          Переформулируйте решение после проведённого анализа
        </p>
      </div>

      <div className="space-y-8">
        {step0 && (
          <div className="rounded-xl bg-indigo-50 border border-indigo-100 p-5">
            <div className="space-y-3">
              <div>
                <p className="text-[11px] text-indigo-400 mb-1">Исходное утверждение:</p>
                <p className="text-sm font-medium text-indigo-900">{step0.statement}</p>
              </div>
              <div>
                <p className="text-[11px] text-indigo-400 mb-1">Ваше решение:</p>
                <p className="text-sm font-medium text-indigo-900">{step0.initialDecision}</p>
              </div>
              <div>
                <p className="text-[11px] text-indigo-400 mb-1">Уверенность:</p>
                <p className="text-sm font-bold text-indigo-700">{step0.initialConfidence}%</p>
              </div>
            </div>
          </div>
        )}

        <div className="border-t border-slate-100" />

        <div>
          <Label className="text-slate-700 mb-2 block">Новое решение</Label>
          <Textarea
            value={revisedDecision}
            onChange={(e) => setRevisedDecision(e.target.value)}
            placeholder="Сформулируйте обновлённое решение с учётом проведённого анализа..."
            rows={4}
            className="border-slate-200 focus-visible:ring-indigo-400 resize-none"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <Label className="text-slate-700">Новая уверенность</Label>
            <span className="text-sm font-bold text-indigo-600">{revisedConfidence}%</span>
          </div>
          <Slider
            value={[revisedConfidence]}
            onValueChange={([v]) => setRevisedConfidence(v)}
            min={0}
            max={100}
            step={1}
          />
          <div className="flex justify-between mt-1">
            <span className="text-[11px] text-slate-400">0%</span>
            <span className="text-[11px] text-slate-400">100%</span>
          </div>
          {step0 && (
            <p className="text-[11px] text-slate-500 mt-2">
              Было {oldConfidence}% &rarr; Стало {revisedConfidence}%
              {delta !== 0 && (
                <span
                  className={`font-medium ${delta > 0 ? "text-emerald-600" : "text-amber-600"}`}
                >
                  {" "}
                  ({delta > 0 ? "+" : ""}
                  {delta}%)
                </span>
              )}
            </p>
          )}
        </div>

        <div className="border-t border-slate-100" />

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-4">
            Индекс логического изменения
          </p>
          <div className={`rounded-lg border p-4 text-center ${ilcBg}`}>
            <p className="text-[11px] text-slate-500 mb-1">ILC</p>
            <p className={`text-2xl font-bold ${ilcColor}`}>{(ilc * 100).toFixed(0)}%</p>
            <p className="text-[10px] text-slate-400 mt-0.5">
              |{revisedConfidence} - {oldConfidence}| / 100
            </p>
          </div>

          {ilc === 0 && (
            <div className="rounded-lg bg-amber-50 border border-amber-100 p-3 mt-4">
              <div className="flex items-start gap-2">
                <Icon
                  name="AlertTriangle"
                  size={14}
                  className="text-amber-600 mt-0.5 shrink-0"
                />
                <p className="text-xs text-amber-700">
                  Уверенность не изменилась — возможна ригидность мышления
                </p>
              </div>
            </div>
          )}

          {ilc > 0.3 && (
            <div className="rounded-lg bg-emerald-50 border border-emerald-100 p-3 mt-4">
              <div className="flex items-start gap-2">
                <Icon
                  name="CheckCircle"
                  size={14}
                  className="text-emerald-600 mt-0.5 shrink-0"
                />
                <p className="text-xs text-emerald-700">
                  Высокая гибкость мышления
                </p>
              </div>
            </div>
          )}
        </div>

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
            Завершить анализ
            <Icon name="Check" size={16} className="ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
