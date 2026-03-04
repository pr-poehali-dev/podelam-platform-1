import { useState, useMemo } from "react";
import Icon from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import type { FinancialData, FinancialStep6Data } from "@/lib/financialTrainerTypes";
import { calcDisciplineIndex } from "@/lib/financialTrainerFormulas";

interface StepProps {
  data: FinancialData;
  onUpdate: (stepKey: string, data: FinancialStep6Data) => void;
  onNext: () => void;
  onBack: () => void;
}

const FREQ_LABELS: Record<number, string> = {
  1: "Никогда",
  2: "Редко",
  3: "Иногда",
  4: "Часто",
  5: "Постоянно",
};

export default function FinStep6Behavior({ data, onUpdate, onNext, onBack }: StepProps) {
  const prev = data.step6;

  const [budgetExceedFreq, setBudgetExceedFreq] = useState(prev?.budgetExceedFreq ?? 3);
  const [hasExpenseTracking, setHasExpenseTracking] = useState(prev?.hasExpenseTracking ?? false);
  const [makesImpulsiveDecisions, setMakesImpulsiveDecisions] = useState(prev?.makesImpulsiveDecisions ?? false);
  const [hasBackupPlan, setHasBackupPlan] = useState(prev?.hasBackupPlan ?? false);

  const currentData: FinancialStep6Data = useMemo(() => {
    const base = {
      budgetExceedFreq,
      hasExpenseTracking,
      makesImpulsiveDecisions,
      hasBackupPlan,
      financialDisciplineIndex: 0,
    };
    base.financialDisciplineIndex = calcDisciplineIndex(base);
    return base;
  }, [budgetExceedFreq, hasExpenseTracking, makesImpulsiveDecisions, hasBackupPlan]);

  const ifd = currentData.financialDisciplineIndex;

  const ifdColor =
    ifd < 0.4 ? "text-red-600" : ifd < 0.7 ? "text-amber-600" : "text-emerald-600";
  const ifdBg =
    ifd < 0.4
      ? "bg-red-50 border-red-100"
      : ifd < 0.7
        ? "bg-amber-50 border-amber-100"
        : "bg-emerald-50 border-emerald-100";
  const ifdLabel =
    ifd < 0.4
      ? "Низкая дисциплина. Требуется системная работа над финансовыми привычками."
      : ifd < 0.7
        ? "Умеренная дисциплина. Есть базовые навыки, но остаются зоны роста."
        : "Высокая дисциплина. Сильный финансовый самоконтроль и планирование.";

  const handleSubmit = () => {
    onUpdate("step6", currentData);
    onNext();
  };

  const handleBack = () => {
    onUpdate("step6", currentData);
    onBack();
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-lg bg-slate-950 flex items-center justify-center">
            <span className="text-xs font-bold text-white">6</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">Поведенческий анализ</h2>
        </div>
        <p className="text-sm text-slate-500 ml-11">
          Оцените ваши финансовые привычки и дисциплину
        </p>
      </div>

      <div className="space-y-8">
        <div>
          <div className="flex items-center justify-between mb-3">
            <Label className="text-slate-700">Как часто вы превышаете бюджет?</Label>
            <span className="text-sm font-medium text-slate-900">
              {budgetExceedFreq} — {FREQ_LABELS[budgetExceedFreq]}
            </span>
          </div>
          <Slider
            value={[budgetExceedFreq]}
            onValueChange={([v]) => setBudgetExceedFreq(v)}
            min={1}
            max={5}
            step={1}
          />
          <div className="flex justify-between mt-1">
            <span className="text-[11px] text-slate-400">Никогда</span>
            <span className="text-[11px] text-slate-400">Постоянно</span>
          </div>
        </div>

        <div className="border-t border-slate-100" />

        <BooleanQuestion
          label="Ведёте ли вы учёт расходов?"
          value={hasExpenseTracking}
          onChange={setHasExpenseTracking}
        />

        <div className="border-t border-slate-100" />

        <BooleanQuestion
          label="Принимаете ли импульсивные финансовые решения?"
          value={makesImpulsiveDecisions}
          onChange={setMakesImpulsiveDecisions}
        />

        <div className="border-t border-slate-100" />

        <BooleanQuestion
          label="Есть ли у вас резервный финансовый план?"
          value={hasBackupPlan}
          onChange={setHasBackupPlan}
        />

        <div className="border-t border-slate-100" />

        <div className={`rounded-xl border p-6 text-center ${ifdBg}`}>
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">
            Индекс финансовой дисциплины (IFD)
          </p>
          <p className={`text-4xl font-bold ${ifdColor}`}>{(ifd * 100).toFixed(0)}%</p>
          <p className="text-xs text-slate-400 mt-1 mb-3">
            {ifd.toFixed(2)} из 1.00
          </p>
          <p className="text-sm text-slate-600 max-w-md mx-auto">{ifdLabel}</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-4">Детализация оценки</p>
          <div className="space-y-3">
            <ScoreRow
              label="Учёт расходов"
              score={hasExpenseTracking ? 5 : 1}
            />
            <ScoreRow
              label="Контроль бюджета"
              score={Math.max(1, Math.min(5, 6 - budgetExceedFreq))}
            />
            <ScoreRow
              label="Планирование"
              score={!makesImpulsiveDecisions ? 5 : 1}
            />
            <ScoreRow
              label="Резервный план"
              score={hasBackupPlan ? 5 : 1}
            />
          </div>
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
            className="bg-slate-950 text-white hover:bg-slate-800"
          >
            Завершить
            <Icon name="ArrowRight" size={16} className="ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function BooleanQuestion({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div>
      <Label className="text-slate-700 mb-3 block">{label}</Label>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => onChange(true)}
          className={`flex-1 rounded-lg border px-4 py-3 text-sm font-medium transition-colors ${
            value
              ? "border-slate-900 bg-slate-950 text-white"
              : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
          }`}
        >
          Да
        </button>
        <button
          type="button"
          onClick={() => onChange(false)}
          className={`flex-1 rounded-lg border px-4 py-3 text-sm font-medium transition-colors ${
            !value
              ? "border-slate-900 bg-slate-950 text-white"
              : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
          }`}
        >
          Нет
        </button>
      </div>
    </div>
  );
}

function ScoreRow({ label, score }: { label: string; score: number }) {
  const pct = (score / 5) * 100;
  const color =
    score <= 2
      ? "bg-red-500"
      : score <= 3
        ? "bg-amber-500"
        : "bg-emerald-500";
  return (
    <div className="flex items-center gap-3">
      <p className="text-xs text-slate-500 w-32 shrink-0">{label}</p>
      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-xs font-medium text-slate-700 w-8 text-right">{score}/5</p>
    </div>
  );
}
