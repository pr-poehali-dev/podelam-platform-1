import { useState, useMemo } from "react";
import Icon from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import type {
  FinancialData,
  FinancialStep5Data,
  FinancialScenario,
  FinancialDecisionType,
  FinancialDecisionResult,
} from "@/lib/financialTrainerTypes";
import {
  calcCashFlow,
  calcDebtLoadRatio,
  calcFinancialCushion,
  calcStabilityIndex,
  calcGoalProjection,
  calcDecisionResult,
} from "@/lib/financialTrainerFormulas";

interface StepProps {
  data: FinancialData;
  onUpdate: (stepKey: string, data: FinancialStep5Data) => void;
  onNext: () => void;
  onBack: () => void;
}

interface ScenarioConfig {
  type: FinancialDecisionType;
  title: string;
  icon: string;
  hint: string;
}

const SCENARIO_CONFIGS: ScenarioConfig[] = [
  {
    type: "increase_income",
    title: "Увеличить доход",
    icon: "TrendingUp",
    hint: "Как изменятся показатели при росте дохода",
  },
  {
    type: "reduce_expenses",
    title: "Снизить расходы",
    icon: "TrendingDown",
    hint: "Как изменятся показатели при оптимизации расходов",
  },
  {
    type: "restructure_debt",
    title: "Реструктурировать долг",
    icon: "RefreshCw",
    hint: "Как изменятся показатели при пересмотре долговых обязательств",
  },
];

const RISK_LABELS: Record<number, string> = {
  1: "Минимальный",
  2: "Низкий",
  3: "Средний",
  4: "Высокий",
  5: "Критический",
};

export default function FinStep5Decisions({ data, onUpdate, onNext, onBack }: StepProps) {
  const step0 = data.step0;
  const step4 = data.step4;
  const prev = data.step5;

  const defaultScenario = (type: FinancialDecisionType): FinancialScenario => ({
    type,
    description: "",
    newIncome: step0?.monthlyIncome ?? 0,
    newFixedExpenses: step0?.fixedExpenses ?? 0,
    newVariableExpenses: step0?.variableExpenses ?? 0,
    newDebtPayments: step0?.monthlyDebtPayments ?? 0,
    riskLevel: 3,
  });

  const [scenarios, setScenarios] = useState<FinancialScenario[]>(
    prev?.scenarios?.length === 3
      ? prev.scenarios
      : SCENARIO_CONFIGS.map((c) => defaultScenario(c.type))
  );
  const [errors, setErrors] = useState<string[]>([]);

  const originalCF = useMemo(
    () =>
      step0
        ? calcCashFlow(step0.monthlyIncome, step0.fixedExpenses, step0.variableExpenses, step0.monthlyDebtPayments)
        : 0,
    [step0]
  );

  const originalKDN = useMemo(
    () => (step0 ? calcDebtLoadRatio(step0.monthlyDebtPayments, step0.monthlyIncome) : 0),
    [step0]
  );

  const originalKFP = useMemo(
    () => (step0 ? calcFinancialCushion(step0.savings, step0.fixedExpenses, step0.variableExpenses) : 0),
    [step0]
  );

  const originalIU = useMemo(
    () => calcStabilityIndex(originalCF, originalKFP, originalKDN),
    [originalCF, originalKFP, originalKDN]
  );

  const originalGoal = useMemo(
    () =>
      calcGoalProjection(
        originalCF,
        step0?.goalAmount ?? 0,
        step0?.goalMonths ?? 12,
        step4?.expectedReturn ?? 0
      ),
    [originalCF, step0, step4]
  );

  const scenarioResults = useMemo(() => {
    return scenarios.map((sc) => {
      const newCF = calcCashFlow(sc.newIncome, sc.newFixedExpenses, sc.newVariableExpenses, sc.newDebtPayments);
      const newKDN = calcDebtLoadRatio(sc.newDebtPayments, sc.newIncome);
      const newIU = calcStabilityIndex(newCF, originalKFP, newKDN);
      const newGoal = calcGoalProjection(
        newCF,
        step0?.goalAmount ?? 0,
        step0?.goalMonths ?? 12,
        step4?.expectedReturn ?? 0
      );
      const result = calcDecisionResult(
        { cf: originalCF, iu: originalIU, kdg: originalGoal.kdg },
        { cf: newCF, iu: newIU, kdg: newGoal.kdg },
        sc.riskLevel
      );
      return { newCF, ...result };
    });
  }, [scenarios, originalCF, originalIU, originalGoal.kdg, originalKFP, step0, step4]);

  const updateScenario = (index: number, field: keyof FinancialScenario, value: string | number) => {
    setScenarios((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const numUpdate = (index: number, field: keyof FinancialScenario) => (e: React.ChangeEvent<HTMLInputElement>) => {
    updateScenario(index, field, Math.max(0, parseFloat(e.target.value) || 0));
  };

  const validate = (): boolean => {
    const errs: string[] = [];
    scenarios.forEach((sc, i) => {
      if (!sc.description.trim()) {
        errs.push(`Сценарий ${i + 1}: укажите описание`);
      }
    });
    setErrors(errs);
    return errs.length === 0;
  };

  const buildData = (): FinancialStep5Data => {
    const results: FinancialDecisionResult[] = scenarios.map((sc, i) => ({
      type: sc.type,
      deltaCF: scenarioResults[i].deltaCF,
      deltaIU: scenarioResults[i].deltaIU,
      deltaKDG: scenarioResults[i].deltaKDG,
      ikr: scenarioResults[i].ikr,
    }));
    return { scenarios, results };
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onUpdate("step5", buildData());
    onNext();
  };

  const handleBack = () => {
    onUpdate("step5", buildData());
    onBack();
  };

  const fmt = (n: number) => n.toLocaleString("ru-RU");
  const fmtDelta = (n: number) => (n >= 0 ? `+${fmt(Math.round(n))}` : fmt(Math.round(n)));

  if (!step0) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <Icon name="AlertCircle" size={32} className="text-slate-400 mx-auto mb-4" />
        <p className="text-slate-500">Нет исходных данных. Вернитесь к шагу 0.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-lg bg-slate-950 flex items-center justify-center">
            <span className="text-xs font-bold text-white">5</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">Финансовые решения</h2>
        </div>
        <p className="text-sm text-slate-500 ml-11">
          Смоделируйте три сценария и сравните их влияние на ваши показатели
        </p>
      </div>

      <div className="space-y-6">
        {SCENARIO_CONFIGS.map((config, i) => {
          const sc = scenarios[i];
          const res = scenarioResults[i];
          return (
            <div key={config.type} className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center">
                  <Icon name={config.icon} size={15} className="text-slate-700" />
                </div>
                <h3 className="text-sm font-semibold text-slate-900">{config.title}</h3>
              </div>
              <p className="text-[11px] text-slate-400 ml-10 mb-5">{config.hint}</p>

              <div className="space-y-4">
                <div>
                  <Label className="text-slate-700 mb-2 block">Описание решения</Label>
                  <Input
                    value={sc.description}
                    onChange={(e) => updateScenario(i, "description", e.target.value)}
                    placeholder="Что именно вы планируете сделать"
                    className="border-slate-200 focus-visible:ring-slate-400"
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <Label className="text-slate-700 mb-1 block text-xs">Доход</Label>
                    <Input
                      type="number"
                      min={0}
                      value={sc.newIncome || ""}
                      onChange={numUpdate(i, "newIncome")}
                      className="border-slate-200 focus-visible:ring-slate-400 text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-slate-700 mb-1 block text-xs">Обяз. расходы</Label>
                    <Input
                      type="number"
                      min={0}
                      value={sc.newFixedExpenses || ""}
                      onChange={numUpdate(i, "newFixedExpenses")}
                      className="border-slate-200 focus-visible:ring-slate-400 text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-slate-700 mb-1 block text-xs">Перем. расходы</Label>
                    <Input
                      type="number"
                      min={0}
                      value={sc.newVariableExpenses || ""}
                      onChange={numUpdate(i, "newVariableExpenses")}
                      className="border-slate-200 focus-visible:ring-slate-400 text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-slate-700 mb-1 block text-xs">Платежи по долгам</Label>
                    <Input
                      type="number"
                      min={0}
                      value={sc.newDebtPayments || ""}
                      onChange={numUpdate(i, "newDebtPayments")}
                      className="border-slate-200 focus-visible:ring-slate-400 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-slate-700 text-xs">Уровень риска</Label>
                    <span className="text-xs font-medium text-slate-900">
                      {sc.riskLevel} — {RISK_LABELS[sc.riskLevel]}
                    </span>
                  </div>
                  <Slider
                    value={[sc.riskLevel]}
                    onValueChange={([v]) => updateScenario(i, "riskLevel", v)}
                    min={1}
                    max={5}
                    step={1}
                  />
                </div>

                <div className="border-t border-slate-100 pt-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="rounded-lg bg-slate-50 border border-slate-200 p-2 text-center">
                      <p className="text-[10px] text-slate-500 mb-0.5">Новый CF</p>
                      <p
                        className={`text-sm font-bold ${
                          res.newCF >= 0 ? "text-slate-900" : "text-red-600"
                        }`}
                      >
                        {fmt(Math.round(res.newCF))}
                      </p>
                    </div>
                    <div className="rounded-lg bg-slate-50 border border-slate-200 p-2 text-center">
                      <p className="text-[10px] text-slate-500 mb-0.5">Delta CF</p>
                      <p
                        className={`text-sm font-bold ${
                          res.deltaCF >= 0 ? "text-emerald-600" : "text-red-600"
                        }`}
                      >
                        {fmtDelta(res.deltaCF)}
                      </p>
                    </div>
                    <div className="rounded-lg bg-slate-50 border border-slate-200 p-2 text-center">
                      <p className="text-[10px] text-slate-500 mb-0.5">Delta KDG</p>
                      <p
                        className={`text-sm font-bold ${
                          res.deltaKDG >= 0 ? "text-emerald-600" : "text-red-600"
                        }`}
                      >
                        {res.deltaKDG >= 0 ? "+" : ""}
                        {res.deltaKDG.toFixed(2)}
                      </p>
                    </div>
                    <div className="rounded-lg bg-slate-50 border border-slate-200 p-2 text-center">
                      <p className="text-[10px] text-slate-500 mb-0.5">IKR</p>
                      <p
                        className={`text-sm font-bold ${
                          res.ikr > 0 ? "text-emerald-600" : res.ikr < 0 ? "text-red-600" : "text-slate-900"
                        }`}
                      >
                        {res.ikr.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

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
