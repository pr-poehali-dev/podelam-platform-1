import { useState, useMemo } from "react";
import Icon from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import type { FinancialData, FinancialStep0Data } from "@/lib/financialTrainerTypes";
import {
  calcCashFlow,
  calcDebtLoadRatio,
  calcFinancialCushion,
  calcIncomeDiversification,
} from "@/lib/financialTrainerFormulas";

interface StepProps {
  data: FinancialData;
  onUpdate: (stepKey: string, data: FinancialStep0Data) => void;
  onNext: () => void;
  onBack: () => void;
}

const SOURCE_LABELS: Record<number, string> = {
  1: "Один источник",
  2: "Два источника",
  3: "Три источника",
  4: "Четыре",
  5: "Пять",
  6: "Шесть",
  7: "Семь",
  8: "Восемь",
  9: "Девять",
  10: "Десять",
};

export default function FinStep0Initial({ data, onUpdate, onNext, onBack }: StepProps) {
  const prev = data.step0;

  const [monthlyIncome, setMonthlyIncome] = useState(prev?.monthlyIncome || 0);
  const [fixedExpenses, setFixedExpenses] = useState(prev?.fixedExpenses || 0);
  const [variableExpenses, setVariableExpenses] = useState(prev?.variableExpenses || 0);
  const [totalDebt, setTotalDebt] = useState(prev?.totalDebt || 0);
  const [monthlyDebtPayments, setMonthlyDebtPayments] = useState(prev?.monthlyDebtPayments || 0);
  const [savings, setSavings] = useState(prev?.savings || 0);
  const [investments, setInvestments] = useState(prev?.investments || 0);
  const [incomeSources, setIncomeSources] = useState(prev?.incomeSources || 1);
  const [goalAmount, setGoalAmount] = useState(prev?.goalAmount || 0);
  const [goalMonths, setGoalMonths] = useState(prev?.goalMonths || 12);
  const [errors, setErrors] = useState<string[]>([]);

  const cf = useMemo(
    () => calcCashFlow(monthlyIncome, fixedExpenses, variableExpenses, monthlyDebtPayments),
    [monthlyIncome, fixedExpenses, variableExpenses, monthlyDebtPayments]
  );

  const kdn = useMemo(
    () => calcDebtLoadRatio(monthlyDebtPayments, monthlyIncome),
    [monthlyDebtPayments, monthlyIncome]
  );

  const kfp = useMemo(
    () => calcFinancialCushion(savings, fixedExpenses, variableExpenses),
    [savings, fixedExpenses, variableExpenses]
  );

  const kdi = useMemo(() => calcIncomeDiversification(incomeSources), [incomeSources]);

  const validate = (): boolean => {
    const errs: string[] = [];
    if (monthlyIncome <= 0) errs.push("Укажите ежемесячный доход");
    if (fixedExpenses < 0) errs.push("Обязательные расходы не могут быть отрицательными");
    if (variableExpenses < 0) errs.push("Переменные расходы не могут быть отрицательными");
    if (totalDebt < 0) errs.push("Сумма долгов не может быть отрицательной");
    if (monthlyDebtPayments < 0) errs.push("Платежи по долгам не могут быть отрицательными");
    if (savings < 0) errs.push("Накопления не могут быть отрицательными");
    if (investments < 0) errs.push("Инвестиции не могут быть отрицательными");
    if (goalAmount <= 0) errs.push("Укажите сумму финансовой цели");
    if (goalMonths <= 0) errs.push("Укажите срок достижения цели");
    setErrors(errs);
    return errs.length === 0;
  };

  const buildData = (): FinancialStep0Data => ({
    monthlyIncome,
    fixedExpenses,
    variableExpenses,
    totalDebt,
    monthlyDebtPayments,
    savings,
    investments,
    incomeSources,
    goalAmount,
    goalMonths,
    cashFlow: cf,
    debtLoadRatio: kdn,
    financialCushionRatio: kfp,
    incomeDiversification: kdi,
  });

  const handleSubmit = () => {
    if (!validate()) return;
    onUpdate("step0", buildData());
    onNext();
  };

  const handleBack = () => {
    if (monthlyIncome > 0 || goalAmount > 0) {
      onUpdate("step0", buildData());
    }
    onBack();
  };

  const numChange = (setter: (v: number) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setter(Math.max(0, parseFloat(e.target.value) || 0));
  };

  const fmt = (n: number) => n.toLocaleString("ru-RU");

  const kdnColor = kdn > 0.5 ? "text-red-600" : kdn > 0.3 ? "text-amber-600" : "text-emerald-600";
  const cfColor = cf >= 0 ? "text-emerald-600" : "text-red-600";

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-lg bg-slate-950 flex items-center justify-center">
            <span className="text-xs font-bold text-white">0</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">Исходные финансовые данные</h2>
        </div>
        <p className="text-sm text-slate-500 ml-11">
          Введите ваши текущие финансовые показатели для анализа
        </p>
      </div>

      <div className="space-y-8">
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-4">Доходы</p>
          <div className="space-y-4">
            <div>
              <Label className="text-slate-700 mb-2 block">Ежемесячный доход</Label>
              <Input
                type="number"
                min={0}
                value={monthlyIncome || ""}
                onChange={numChange(setMonthlyIncome)}
                placeholder="100 000"
                className="border-slate-200 focus-visible:ring-slate-400"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-3">
                <Label className="text-slate-700">Источники дохода</Label>
                <span className="text-sm font-medium text-slate-900">
                  {incomeSources} — {SOURCE_LABELS[incomeSources]}
                </span>
              </div>
              <Slider
                value={[incomeSources]}
                onValueChange={([v]) => setIncomeSources(v)}
                min={1}
                max={10}
                step={1}
              />
              <div className="flex justify-between mt-1">
                <span className="text-[11px] text-slate-400">1</span>
                <span className="text-[11px] text-slate-400">10</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100" />

        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-4">Расходы</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-slate-700 mb-2 block">Обязательные расходы</Label>
              <Input
                type="number"
                min={0}
                value={fixedExpenses || ""}
                onChange={numChange(setFixedExpenses)}
                placeholder="40 000"
                className="border-slate-200 focus-visible:ring-slate-400"
              />
            </div>
            <div>
              <Label className="text-slate-700 mb-2 block">Переменные расходы</Label>
              <Input
                type="number"
                min={0}
                value={variableExpenses || ""}
                onChange={numChange(setVariableExpenses)}
                placeholder="20 000"
                className="border-slate-200 focus-visible:ring-slate-400"
              />
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100" />

        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-4">Долги</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-slate-700 mb-2 block">Общая сумма долгов</Label>
              <Input
                type="number"
                min={0}
                value={totalDebt || ""}
                onChange={numChange(setTotalDebt)}
                placeholder="0"
                className="border-slate-200 focus-visible:ring-slate-400"
              />
            </div>
            <div>
              <Label className="text-slate-700 mb-2 block">Ежемесячные платежи по долгам</Label>
              <Input
                type="number"
                min={0}
                value={monthlyDebtPayments || ""}
                onChange={numChange(setMonthlyDebtPayments)}
                placeholder="0"
                className="border-slate-200 focus-visible:ring-slate-400"
              />
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100" />

        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-4">Активы</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-slate-700 mb-2 block">Накопления</Label>
              <Input
                type="number"
                min={0}
                value={savings || ""}
                onChange={numChange(setSavings)}
                placeholder="200 000"
                className="border-slate-200 focus-visible:ring-slate-400"
              />
            </div>
            <div>
              <Label className="text-slate-700 mb-2 block">Инвестиции</Label>
              <Input
                type="number"
                min={0}
                value={investments || ""}
                onChange={numChange(setInvestments)}
                placeholder="0"
                className="border-slate-200 focus-visible:ring-slate-400"
              />
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100" />

        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-4">Финансовая цель</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-slate-700 mb-2 block">Сумма цели</Label>
              <Input
                type="number"
                min={0}
                value={goalAmount || ""}
                onChange={numChange(setGoalAmount)}
                placeholder="1 000 000"
                className="border-slate-200 focus-visible:ring-slate-400"
              />
            </div>
            <div>
              <Label className="text-slate-700 mb-2 block">Срок (месяцев)</Label>
              <Input
                type="number"
                min={1}
                max={600}
                value={goalMonths || ""}
                onChange={(e) => setGoalMonths(Math.max(1, parseInt(e.target.value) || 1))}
                placeholder="12"
                className="border-slate-200 focus-visible:ring-slate-400"
              />
            </div>
          </div>
        </div>

        {monthlyIncome > 0 && (
          <>
            <div className="border-t border-slate-100" />
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-4">
                Расчётные показатели
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="rounded-lg bg-white border border-slate-200 p-3 text-center">
                  <p className="text-[11px] text-slate-500 mb-1">Денежный поток</p>
                  <p className={`text-lg font-bold ${cfColor}`}>{fmt(Math.round(cf))}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">CF</p>
                </div>
                <div className="rounded-lg bg-white border border-slate-200 p-3 text-center">
                  <p className="text-[11px] text-slate-500 mb-1">Долговая нагрузка</p>
                  <p className={`text-lg font-bold ${kdnColor}`}>
                    {(kdn * 100).toFixed(1)}%
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">KDN</p>
                </div>
                <div className="rounded-lg bg-white border border-slate-200 p-3 text-center">
                  <p className="text-[11px] text-slate-500 mb-1">Фин. подушка</p>
                  <p className="text-lg font-bold text-slate-900">
                    {kfp.toFixed(1)} мес
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">KFP</p>
                </div>
                <div className="rounded-lg bg-white border border-slate-200 p-3 text-center">
                  <p className="text-[11px] text-slate-500 mb-1">Диверсификация</p>
                  <p className="text-lg font-bold text-slate-900">
                    {(kdi * 100).toFixed(0)}%
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">KDI</p>
                </div>
              </div>
            </div>
          </>
        )}

        {errors.length > 0 && (
          <div className="rounded-xl bg-red-50 border border-red-100 p-4">
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
