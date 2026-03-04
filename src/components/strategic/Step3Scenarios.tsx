import { useState, useMemo } from "react";
import Icon from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StrategicData, Step3Data, Scenario } from "@/lib/proTrainerTypes";
import { calcStep3 } from "@/lib/proTrainerFormulas";
import StepHint from "./StepHint";

interface StepProps {
  data: StrategicData;
  onUpdate: (stepKey: string, data: Step3Data) => void;
  onNext: () => void;
  onBack: () => void;
}

const SCENARIO_META: { type: Scenario["type"]; label: string; color: string; barColor: string }[] = [
  { type: "optimistic", label: "Оптимистичный", color: "text-emerald-600", barColor: "bg-emerald-500" },
  { type: "realistic", label: "Реалистичный", color: "text-blue-600", barColor: "bg-blue-500" },
  { type: "negative", label: "Негативный", color: "text-red-600", barColor: "bg-red-500" },
];

function defaultScenarios(prev?: Scenario[]): Scenario[] {
  if (prev && prev.length === 3) return prev;
  return [
    { type: "optimistic", revenue: 0, costs: 0, months: 6, probability: 25 },
    { type: "realistic", revenue: 0, costs: 0, months: 12, probability: 50 },
    { type: "negative", revenue: 0, costs: 0, months: 18, probability: 25 },
  ];
}

export default function Step3Scenarios({ data, onUpdate, onNext, onBack }: StepProps) {
  const prev = data.step3;
  const [scenarios, setScenarios] = useState<Scenario[]>(defaultScenarios(prev?.scenarios));
  const [errors, setErrors] = useState<string[]>([]);

  const updateScenario = (index: number, patch: Partial<Scenario>) => {
    setScenarios((prev) => prev.map((s, i) => (i === index ? { ...s, ...patch } : s)));
  };

  const probSum = scenarios.reduce((s, sc) => s + sc.probability, 0);

  const calc = useMemo(() => {
    const allFilled = scenarios.every((s) => s.revenue > 0);
    if (!allFilled) return null;
    return calcStep3(scenarios);
  }, [scenarios]);

  const maxRevenue = Math.max(...scenarios.map((s) => Math.abs(s.revenue)), 1);

  const validate = (): boolean => {
    const errs: string[] = [];
    scenarios.forEach((s, i) => {
      if (s.revenue === 0) errs.push(`${SCENARIO_META[i].label}: укажите доход/результат`);
      if (s.costs === 0) errs.push(`${SCENARIO_META[i].label}: укажите затраты`);
      if (s.months <= 0) errs.push(`${SCENARIO_META[i].label}: укажите срок`);
    });
    if (probSum !== 100) errs.push(`Сумма вероятностей должна быть 100% (сейчас ${probSum}%)`);
    setErrors(errs);
    return errs.length === 0;
  };

  const getCurrentData = (): Step3Data => {
    const allFilled = scenarios.every((s) => s.revenue > 0);
    const result = allFilled ? calcStep3(scenarios) : { ev: 0, spread: 0, ism: 0 };
    return { scenarios, ...result };
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onUpdate("step3", getCurrentData());
    onNext();
  };

  const handleBack = () => {
    onUpdate("step3", getCurrentData());
    onBack();
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-lg bg-slate-950 flex items-center justify-center">
            <span className="text-xs font-bold text-white">3</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">Сценарное моделирование</h2>
        </div>
        <p className="text-sm text-slate-500 ml-11">Постройте три сценария развития событий</p>
      </div>

      <StepHint
        title="Как строить сценарии?"
        description="Сценарное моделирование — это когда вы представляете три варианта развития событий: лучший, средний и худший. Это помогает подготовиться к любому исходу и не попасть в ловушку «всё будет хорошо»."
        hints={[
          { term: "Оптимистичный сценарий", explanation: "лучший реалистичный исход. Всё идёт по плану, рынок благоприятный. Не фантастика, а хороший, но возможный результат" },
          { term: "Реалистичный сценарий", explanation: "наиболее вероятный исход. Что-то пойдёт не так, но в целом ситуация управляемая. Обычно это ваш базовый план" },
          { term: "Негативный сценарий", explanation: "худший реалистичный исход. Несколько рисков сработали одновременно. Не катастрофа, но серьёзные трудности" },
          { term: "Доход / результат", explanation: "сколько денег (в рублях) вы ожидаете получить при этом сценарии. Это может быть выручка, прибыль или другой ключевой финансовый показатель" },
          { term: "Затраты", explanation: "сколько денег потребуется потратить в этом сценарии. Включайте все расходы: зарплаты, аренда, маркетинг, закупки" },
          { term: "Срок (мес.)", explanation: "за сколько месяцев реализуется этот сценарий. Оптимистичный обычно быстрее, негативный — дольше" },
          { term: "Вероятность (%)", explanation: "шанс наступления этого сценария. Сумма всех трёх должна быть ровно 100%. Обычно: оптимистичный 20-30%, реалистичный 40-60%, негативный 20-30%" },
          { term: "EV (Ожидаемая ценность)", explanation: "средневзвешенный доход по всем сценариям. Показывает, сколько вы «в среднем» заработаете с учётом вероятностей" },
          { term: "Разброс", explanation: "разница между лучшим и худшим сценарием. Большой разброс = высокая неопределённость" },
          { term: "ИСМ (Индекс сценарного моделирования)", explanation: "оценка качества ваших сценариев. Учитывает разброс и разницу в сроках" },
        ]}
      />

      <div className="space-y-6 mb-8">
        {scenarios.map((sc, i) => {
          const meta = SCENARIO_META[i];
          return (
            <div key={meta.type} className="rounded-xl border border-slate-200 p-5">
              <div className="flex items-center gap-2 mb-5">
                <div className={`w-2.5 h-2.5 rounded-full ${meta.barColor}`} />
                <h3 className={`text-sm font-semibold ${meta.color}`}>{meta.label}</h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <Label className="text-slate-600 text-xs mb-1.5 block">Доход / результат</Label>
                  <Input
                    type="number"
                    value={sc.revenue || ""}
                    onChange={(e) => updateScenario(i, { revenue: parseInt(e.target.value) || 0 })}
                    placeholder="руб."
                    className="border-slate-200 focus-visible:ring-slate-400"
                  />
                </div>
                <div>
                  <Label className="text-slate-600 text-xs mb-1.5 block">Затраты</Label>
                  <Input
                    type="number"
                    value={sc.costs || ""}
                    onChange={(e) => updateScenario(i, { costs: parseInt(e.target.value) || 0 })}
                    placeholder="руб."
                    className="border-slate-200 focus-visible:ring-slate-400"
                  />
                </div>
                <div>
                  <Label className="text-slate-600 text-xs mb-1.5 block">Срок (мес.)</Label>
                  <Input
                    type="number"
                    min={1}
                    value={sc.months || ""}
                    onChange={(e) => updateScenario(i, { months: parseInt(e.target.value) || 0 })}
                    className="border-slate-200 focus-visible:ring-slate-400"
                  />
                </div>
                <div>
                  <Label className="text-slate-600 text-xs mb-1.5 block">Вероятность %</Label>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={sc.probability || ""}
                    onChange={(e) =>
                      updateScenario(i, { probability: Math.min(100, Math.max(0, parseInt(e.target.value) || 0)) })
                    }
                    className="border-slate-200 focus-visible:ring-slate-400"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-2 mb-8">
        <span className="text-sm text-slate-500">Сумма вероятностей:</span>
        <span className={`text-sm font-semibold ${probSum === 100 ? "text-emerald-600" : "text-red-600"}`}>
          {probSum}%
        </span>
        {probSum !== 100 && (
          <span className="text-xs text-red-500 flex items-center gap-1">
            <Icon name="AlertCircle" size={12} />
            Должно быть 100%
          </span>
        )}
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 mb-6">
        <p className="text-xs text-slate-500 uppercase tracking-wider mb-4">Сравнение сценариев</p>
        <div className="space-y-3 mb-6">
          {scenarios.map((sc, i) => {
            const meta = SCENARIO_META[i];
            const width = maxRevenue > 0 ? (Math.abs(sc.revenue) / maxRevenue) * 100 : 0;
            return (
              <div key={meta.type}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-slate-600">{meta.label}</span>
                  <span className="text-xs font-medium text-slate-900">
                    {sc.revenue.toLocaleString("ru-RU")} &#8381;
                  </span>
                </div>
                <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${meta.barColor} rounded-full transition-all duration-500`}
                    style={{ width: `${width}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {calc && (
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-200">
            <div>
              <p className="text-[11px] text-slate-500 mb-1">Ожидаемая ценность (EV)</p>
              <p className="text-xl font-bold text-slate-900">{calc.ev.toLocaleString("ru-RU")}</p>
            </div>
            <div>
              <p className="text-[11px] text-slate-500 mb-1">Разброс</p>
              <p className="text-xl font-bold text-slate-900">{calc.spread.toLocaleString("ru-RU")}</p>
            </div>
            <div>
              <p className="text-[11px] text-slate-500 mb-1">ИСМ</p>
              <p className="text-xl font-bold text-slate-900">{calc.ism}</p>
            </div>
          </div>
        )}
      </div>

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
        <Button variant="ghost" onClick={handleBack} className="text-slate-500 hover:text-slate-900">
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