import { useState, useMemo } from "react";
import Icon from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import type { FinancialData, FinancialStep4Data } from "@/lib/financialTrainerTypes";
import {
  calcCashFlow,
  calcGoalProjection,
} from "@/lib/financialTrainerFormulas";

interface StepProps {
  data: FinancialData;
  onUpdate: (stepKey: string, data: FinancialStep4Data) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function FinStep4Goals({ data, onUpdate, onNext, onBack }: StepProps) {
  const prev = data.step4;
  const step0 = data.step0;

  const [expectedReturn, setExpectedReturn] = useState(prev?.expectedReturn ?? 10);

  const cf = useMemo(
    () =>
      step0
        ? calcCashFlow(
            step0.monthlyIncome,
            step0.fixedExpenses,
            step0.variableExpenses,
            step0.monthlyDebtPayments
          )
        : 0,
    [step0]
  );

  const goalAmount = step0?.goalAmount ?? 0;
  const goalMonths = step0?.goalMonths ?? 12;

  const projection = useMemo(
    () => calcGoalProjection(cf, goalAmount, goalMonths, expectedReturn),
    [cf, goalAmount, goalMonths, expectedReturn]
  );

  const fmt = (n: number) => n.toLocaleString("ru-RU");

  const kdgColor =
    projection.kdg < 1
      ? "text-red-600"
      : projection.kdg < 1.5
        ? "text-amber-600"
        : "text-emerald-600";
  const kdgBg =
    projection.kdg < 1
      ? "bg-red-50 border-red-100"
      : projection.kdg < 1.5
        ? "bg-amber-50 border-amber-100"
        : "bg-emerald-50 border-emerald-100";
  const kdgLabel =
    projection.kdg < 1
      ? "Цель недостижима при текущих параметрах"
      : projection.kdg < 1.5
        ? "Достижима при финансовой дисциплине"
        : "Комфортная достижимость";

  const cfVsPmtRatio = projection.pmt > 0 ? Math.min((cf / projection.pmt) * 100, 100) : 0;

  const buildData = (): FinancialStep4Data => ({
    expectedReturn,
    requiredMonthlyPayment: projection.pmt,
    goalAchievabilityRatio: projection.kdg,
  });

  const handleSubmit = () => {
    onUpdate("step4", buildData());
    onNext();
  };

  const handleBack = () => {
    onUpdate("step4", buildData());
    onBack();
  };

  if (!step0) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <Icon name="AlertCircle" size={32} className="text-slate-400 mx-auto mb-4" />
        <p className="text-slate-500">Нет данных для моделирования. Вернитесь к шагу 0.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-lg bg-slate-950 flex items-center justify-center">
            <span className="text-xs font-bold text-white">4</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">Моделирование финансовой цели</h2>
        </div>
        <p className="text-sm text-slate-500 ml-11">
          Оценка достижимости вашей цели при текущих параметрах
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 mb-8">
        <p className="text-xs text-slate-500 uppercase tracking-wider mb-4">Ваша цель</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-lg bg-white border border-slate-200 p-3 text-center">
            <p className="text-[11px] text-slate-500 mb-1">Сумма цели</p>
            <p className="text-lg font-bold text-slate-900">{fmt(goalAmount)}</p>
          </div>
          <div className="rounded-lg bg-white border border-slate-200 p-3 text-center">
            <p className="text-[11px] text-slate-500 mb-1">Срок</p>
            <p className="text-lg font-bold text-slate-900">{goalMonths} мес</p>
          </div>
          <div className="rounded-lg bg-white border border-slate-200 p-3 text-center">
            <p className="text-[11px] text-slate-500 mb-1">Денежный поток (CF)</p>
            <p className={`text-lg font-bold ${cf >= 0 ? "text-emerald-600" : "text-red-600"}`}>
              {fmt(Math.round(cf))}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        <div>
          <div className="flex items-center justify-between mb-3">
            <Label className="text-slate-700">Ожидаемая доходность инвестиций, % годовых</Label>
            <span className="text-sm font-medium text-slate-900">{expectedReturn.toFixed(1)}%</span>
          </div>
          <Slider
            value={[expectedReturn]}
            onValueChange={([v]) => setExpectedReturn(v)}
            min={0}
            max={30}
            step={0.5}
          />
          <div className="flex justify-between mt-1">
            <span className="text-[11px] text-slate-400">0%</span>
            <span className="text-[11px] text-slate-400">30%</span>
          </div>
        </div>

        <div className="border-t border-slate-100" />

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-4">Результат расчёта</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-center">
              <p className="text-[11px] text-slate-500 mb-1">Требуемый ежемесячный вклад (PMT)</p>
              <p className="text-2xl font-bold text-slate-900">{fmt(Math.round(projection.pmt))}</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-center">
              <p className="text-[11px] text-slate-500 mb-1">Срок при текущем CF</p>
              <p className="text-2xl font-bold text-slate-900">
                {projection.monthsToGoal >= 999 ? "---" : `${projection.monthsToGoal} мес`}
              </p>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-slate-500">CF vs PMT</p>
              <p className="text-xs text-slate-500">
                {fmt(Math.round(cf))} / {fmt(Math.round(projection.pmt))}
              </p>
            </div>
            <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  cfVsPmtRatio >= 100
                    ? "bg-emerald-500"
                    : cfVsPmtRatio >= 66
                      ? "bg-amber-500"
                      : "bg-red-500"
                }`}
                style={{ width: `${Math.max(cfVsPmtRatio, 0)}%` }}
              />
            </div>
          </div>
        </div>

        <div className={`rounded-xl border p-6 text-center ${kdgBg}`}>
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">
            Коэффициент достижимости (KDG)
          </p>
          <p className={`text-4xl font-bold ${kdgColor}`}>
            {projection.kdg >= 999 ? "---" : projection.kdg.toFixed(2)}
          </p>
          <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/60">
            <Icon
              name={projection.kdg < 1 ? "XCircle" : projection.kdg < 1.5 ? "AlertCircle" : "CheckCircle"}
              size={16}
              className={kdgColor}
            />
            <span className={`text-sm font-medium ${kdgColor}`}>{kdgLabel}</span>
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
            Далее
            <Icon name="ArrowRight" size={16} className="ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
