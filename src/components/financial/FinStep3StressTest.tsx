import { useMemo } from "react";
import Icon from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import type { FinancialData, FinancialStep3Data } from "@/lib/financialTrainerTypes";
import { calcStressTest } from "@/lib/financialTrainerFormulas";

interface StepProps {
  data: FinancialData;
  onUpdate: (stepKey: string, data: FinancialStep3Data) => void;
  onNext: () => void;
  onBack: () => void;
}

const STRESS_FACTORS = [
  { icon: "TrendingDown", label: "Доход", change: "-20%", desc: "Снижение дохода" },
  { icon: "TrendingUp", label: "Расходы", change: "+15%", desc: "Рост расходов" },
  { icon: "CreditCard", label: "Платежи по долгам", change: "+10%", desc: "Рост платежей" },
];

export default function FinStep3StressTest({ data, onUpdate, onNext, onBack }: StepProps) {
  const step0 = data.step0;

  const stressResult = useMemo(() => (step0 ? calcStressTest(step0) : null), [step0]);

  const fmt = (n: number) => n.toLocaleString("ru-RU");

  const isu = stressResult?.isu ?? 0;

  const isuColor = isu < 0.7 ? "text-red-600" : isu <= 1 ? "text-amber-600" : "text-emerald-600";
  const isuBg =
    isu < 0.7
      ? "bg-red-50 border-red-100"
      : isu <= 1
        ? "bg-amber-50 border-amber-100"
        : "bg-emerald-50 border-emerald-100";
  const isuLabel =
    isu < 0.7 ? "Уязвим" : isu <= 1 ? "Средняя устойчивость" : "Высокая адаптивность";
  const isuDescription =
    isu < 0.7
      ? "Ваше финансовое положение значительно ухудшается при стрессовом сценарии. Рекомендуется создать резервный фонд и снизить долговую нагрузку."
      : isu <= 1
        ? "Финансовая устойчивость снижается, но остаётся в управляемых пределах. Стоит проработать план действий на случай кризиса."
        : "Ваши финансы хорошо выдерживают стрессовые условия. Высокий запас прочности позволяет адаптироваться к ухудшению ситуации.";

  const handleSubmit = () => {
    if (!stressResult) return;
    onUpdate("step3", {
      stressedCashFlow: stressResult.stressedCF,
      stressedStabilityIndex: stressResult.stressedIU,
      stressResilienceIndex: stressResult.isu,
    });
    onNext();
  };

  const handleBack = () => {
    if (stressResult) {
      onUpdate("step3", {
        stressedCashFlow: stressResult.stressedCF,
        stressedStabilityIndex: stressResult.stressedIU,
        stressResilienceIndex: stressResult.isu,
      });
    }
    onBack();
  };

  if (!step0 || !stressResult) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <Icon name="AlertCircle" size={32} className="text-slate-400 mx-auto mb-4" />
        <p className="text-slate-500">Нет данных для стресс-теста. Вернитесь к шагу 0.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-lg bg-slate-950 flex items-center justify-center">
            <span className="text-xs font-bold text-white">3</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">Стресс-тест</h2>
        </div>
        <p className="text-sm text-slate-500 ml-11">
          Проверка финансовой устойчивости в неблагоприятных условиях
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 mb-8">
        <p className="text-xs text-slate-500 uppercase tracking-wider mb-4">
          Применённые стресс-факторы
        </p>
        <div className="grid grid-cols-3 gap-3">
          {STRESS_FACTORS.map((sf, i) => (
            <div key={i} className="rounded-lg bg-white border border-slate-200 p-3 text-center">
              <Icon name={sf.icon} size={18} className="text-slate-700 mx-auto mb-2" />
              <p className="text-xs text-slate-500 mb-1">{sf.label}</p>
              <p className="text-lg font-bold text-slate-900">{sf.change}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 mb-8">
        <p className="text-xs text-slate-500 uppercase tracking-wider mb-4">
          Сравнение: до и после стресс-теста
        </p>
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-[11px] text-slate-400 mb-1">Показатель</p>
            </div>
            <div className="text-center">
              <p className="text-[11px] text-slate-400 mb-1">До стресса</p>
            </div>
            <div className="text-center">
              <p className="text-[11px] text-slate-400 mb-1">После стресса</p>
            </div>
          </div>

          <div className="border-t border-slate-100" />

          <div className="grid grid-cols-3 gap-4 items-center">
            <p className="text-sm text-slate-600">Денежный поток (CF)</p>
            <div className="text-center">
              <p
                className={`text-lg font-bold ${
                  stressResult.originalCF >= 0 ? "text-slate-900" : "text-red-600"
                }`}
              >
                {fmt(Math.round(stressResult.originalCF))}
              </p>
            </div>
            <div className="text-center">
              <p
                className={`text-lg font-bold ${
                  stressResult.stressedCF >= 0 ? "text-slate-900" : "text-red-600"
                }`}
              >
                {fmt(Math.round(stressResult.stressedCF))}
              </p>
              <p className="text-[10px] text-red-500 mt-0.5">
                {stressResult.stressedCF - stressResult.originalCF < 0
                  ? fmt(Math.round(stressResult.stressedCF - stressResult.originalCF))
                  : `+${fmt(Math.round(stressResult.stressedCF - stressResult.originalCF))}`}
              </p>
            </div>
          </div>

          <div className="border-t border-slate-100" />

          <div className="grid grid-cols-3 gap-4 items-center">
            <p className="text-sm text-slate-600">Индекс устойчивости (IU)</p>
            <div className="text-center">
              <p className="text-lg font-bold text-slate-900">
                {fmt(Math.round(stressResult.originalIU))}
              </p>
            </div>
            <div className="text-center">
              <p
                className={`text-lg font-bold ${
                  stressResult.stressedIU >= 0 ? "text-slate-900" : "text-red-600"
                }`}
              >
                {fmt(Math.round(stressResult.stressedIU))}
              </p>
              <p className="text-[10px] text-red-500 mt-0.5">
                {stressResult.stressedIU - stressResult.originalIU < 0
                  ? fmt(Math.round(stressResult.stressedIU - stressResult.originalIU))
                  : `+${fmt(Math.round(stressResult.stressedIU - stressResult.originalIU))}`}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className={`rounded-xl border p-6 mb-8 text-center ${isuBg}`}>
        <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">
          Индекс стресс-устойчивости (ISU)
        </p>
        <p className={`text-4xl font-bold ${isuColor}`}>{isu.toFixed(2)}</p>
        <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/60">
          <Icon
            name={isu < 0.7 ? "ShieldAlert" : isu <= 1 ? "Shield" : "ShieldCheck"}
            size={16}
            className={isuColor}
          />
          <span className={`text-sm font-medium ${isuColor}`}>{isuLabel}</span>
        </div>
        <p className="text-xs text-slate-500 mt-3 max-w-md mx-auto">{isuDescription}</p>
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
          Далее
          <Icon name="ArrowRight" size={16} className="ml-2" />
        </Button>
      </div>
    </div>
  );
}
