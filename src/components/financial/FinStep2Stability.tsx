import { useMemo } from "react";
import Icon from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import type { FinancialData, FinancialStep2Data } from "@/lib/financialTrainerTypes";
import {
  calcCashFlow,
  calcDebtLoadRatio,
  calcFinancialCushion,
  calcStabilityIndex,
} from "@/lib/financialTrainerFormulas";

interface StepProps {
  data: FinancialData;
  onUpdate: (stepKey: string, data: FinancialStep2Data) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function FinStep2Stability({ data, onUpdate, onNext, onBack }: StepProps) {
  const step0 = data.step0;

  const cf = useMemo(
    () =>
      step0
        ? calcCashFlow(step0.monthlyIncome, step0.fixedExpenses, step0.variableExpenses, step0.monthlyDebtPayments)
        : 0,
    [step0]
  );

  const kdn = useMemo(
    () => (step0 ? calcDebtLoadRatio(step0.monthlyDebtPayments, step0.monthlyIncome) : 0),
    [step0]
  );

  const kfp = useMemo(
    () => (step0 ? calcFinancialCushion(step0.savings, step0.fixedExpenses, step0.variableExpenses) : 0),
    [step0]
  );

  const iu = useMemo(() => calcStabilityIndex(cf, kfp, kdn), [cf, kfp, kdn]);

  const fmt = (n: number) => n.toLocaleString("ru-RU");

  const iuColor =
    iu < 0 ? "text-red-600" : iu < 10000 ? "text-amber-600" : "text-emerald-600";

  const iuInterpretation = (() => {
    if (iu < 0) return "Отрицательная устойчивость. Расходы превышают доходы, финансовое положение крайне нестабильно.";
    if (iu < 5000) return "Низкая устойчивость. Минимальный запас прочности, высокая уязвимость к любым изменениям.";
    if (iu < 20000) return "Умеренная устойчивость. Есть базовый запас, но крупные непредвиденные расходы могут вызвать проблемы.";
    if (iu < 100000) return "Хорошая устойчивость. Стабильное финансовое положение с достаточным запасом прочности.";
    return "Высокая устойчивость. Сильная финансовая позиция с большим запасом прочности.";
  })();

  const handleSubmit = () => {
    onUpdate("step2", { stabilityIndex: iu });
    onNext();
  };

  const handleBack = () => {
    onUpdate("step2", { stabilityIndex: iu });
    onBack();
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-lg bg-slate-950 flex items-center justify-center">
            <span className="text-xs font-bold text-white">2</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">Финансовая устойчивость</h2>
        </div>
        <p className="text-sm text-slate-500 ml-11">
          Автоматический расчёт индекса устойчивости на основе ваших данных
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-8 mb-8 text-center">
        <p className="text-xs text-slate-500 uppercase tracking-wider mb-3">
          Индекс устойчивости (IU)
        </p>
        <p className={`text-5xl font-bold ${iuColor}`}>
          {fmt(Math.round(iu))}
        </p>
        <p className="text-sm text-slate-500 mt-3 max-w-md mx-auto">
          {iuInterpretation}
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 mb-8">
        <p className="text-xs text-slate-500 uppercase tracking-wider mb-4">Формула расчёта</p>
        <div className="flex items-center justify-center gap-2 flex-wrap text-sm mb-6">
          <span className="font-mono text-slate-500">IU = CF</span>
          <span className="text-slate-400">x</span>
          <span className="font-mono text-slate-500">KFP</span>
          <span className="text-slate-400">x</span>
          <span className="font-mono text-slate-500">(1 - KDN)</span>
          {cf < 0 && (
            <>
              <span className="text-slate-400">x</span>
              <span className="font-mono text-red-500">0.5</span>
            </>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-center">
            <p className="text-[11px] text-slate-500 mb-1">Денежный поток (CF)</p>
            <p className={`text-xl font-bold ${cf >= 0 ? "text-emerald-600" : "text-red-600"}`}>
              {fmt(Math.round(cf))}
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-center">
            <p className="text-[11px] text-slate-500 mb-1">Фин. подушка (KFP)</p>
            <p className="text-xl font-bold text-slate-900">
              {kfp.toFixed(2)}
            </p>
            <p className="text-[10px] text-slate-400">{kfp.toFixed(1)} мес</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-center">
            <p className="text-[11px] text-slate-500 mb-1">Долговая нагрузка (KDN)</p>
            <p
              className={`text-xl font-bold ${
                kdn > 0.5 ? "text-red-600" : kdn > 0.3 ? "text-amber-600" : "text-emerald-600"
              }`}
            >
              {(kdn * 100).toFixed(1)}%
            </p>
            <p className="text-[10px] text-slate-400">1 - KDN = {(1 - kdn).toFixed(2)}</p>
          </div>
        </div>
      </div>

      {cf < 0 && (
        <div className="rounded-xl bg-red-50 border border-red-100 p-4 mb-8">
          <div className="flex items-start gap-3">
            <Icon name="AlertTriangle" size={18} className="text-red-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-red-800 mb-1">Отрицательный денежный поток</p>
              <p className="text-xs text-red-600">
                Ваши расходы и платежи по долгам превышают доход. Индекс устойчивости снижен на 50%. Рекомендуется пересмотреть структуру расходов или увеличить доход.
              </p>
            </div>
          </div>
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
          className="bg-slate-950 text-white hover:bg-slate-800"
        >
          Далее
          <Icon name="ArrowRight" size={16} className="ml-2" />
        </Button>
      </div>
    </div>
  );
}
