import { useState, useEffect, useMemo, useRef } from "react";
import Icon from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StrategicData, Step5Data, Scenario } from "@/lib/proTrainerTypes";
import { applyStressTest, calcStep3, calcIA } from "@/lib/proTrainerFormulas";
import StepHint from "./StepHint";

interface StepProps {
  data: StrategicData;
  onUpdate: (stepKey: string, data: Step5Data) => void;
  onNext: () => void;
  onBack: () => void;
}

const STRESS_FACTORS = [
  { icon: "TrendingDown", label: "Доход", change: "-30%", desc: "Снижение дохода на 30%" },
  { icon: "TrendingUp", label: "Затраты", change: "+20%", desc: "Рост затрат на 20%" },
  { icon: "Clock", label: "Сроки", change: "x1.5", desc: "Увеличение сроков в 1.5 раза" },
  { icon: "Percent", label: "Вероятность", change: "-15%", desc: "Снижение вероятности на 15 п.п." },
];

const SCENARIO_LABELS: Record<string, string> = {
  optimistic: "Оптимистичный",
  realistic: "Реалистичный",
  negative: "Негативный",
};

const SCENARIO_COLORS: Record<string, string> = {
  optimistic: "text-emerald-600",
  realistic: "text-blue-600",
  negative: "text-red-600",
};

export default function Step5StressTest({ data, onUpdate, onNext, onBack }: StepProps) {
  const originalScenarios = data.step3?.scenarios || [];
  const originalCalc = useMemo(() => calcStep3(originalScenarios), [originalScenarios]);
  const stressedScenarios = useMemo(() => applyStressTest(originalScenarios), [originalScenarios]);
  const stressedCalc = useMemo(() => calcStep3(stressedScenarios), [stressedScenarios]);

  const ia = useMemo(() => calcIA(originalCalc.ev, stressedCalc.ev), [originalCalc.ev, stressedCalc.ev]);

  const [decision, setDecision] = useState<boolean | null>(null);
  const [notes, setNotes] = useState("");
  const decisionStartRef = useRef<number | null>(null);
  const [reactionTime, setReactionTime] = useState<number | undefined>(undefined);
  const [errors, setErrors] = useState<string[]>([]);

  const handleDecision = (revise: boolean) => {
    if (decision === null) {
      const elapsed = decisionStartRef.current
        ? Math.round((Date.now() - decisionStartRef.current) / 1000)
        : undefined;
      setReactionTime(elapsed);
    }
    setDecision(revise);
  };

  useEffect(() => {
    decisionStartRef.current = Date.now();
  }, []);

  const validate = (): boolean => {
    const errs: string[] = [];
    if (decision === null) errs.push("Примите решение: пересмотреть стратегию или нет");
    setErrors(errs);
    return errs.length === 0;
  };

  const getCurrentData = (): Step5Data => ({
    originalEv: originalCalc.ev,
    stressedEv: stressedCalc.ev,
    ia,
    revisedStrategy: decision ?? false,
    reactionTimeSec: reactionTime,
  });

  const handleSubmit = () => {
    if (!validate()) return;
    onUpdate("step5", { ...getCurrentData(), revisedStrategy: decision! });
    onNext();
  };

  const handleBack = () => {
    if (decision !== null) {
      onUpdate("step5", getCurrentData());
    }
    onBack();
  };

  const formatNum = (n: number) => n.toLocaleString("ru-RU");

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-lg bg-slate-950 flex items-center justify-center">
            <span className="text-xs font-bold text-white">5</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">Стресс-тест</h2>
        </div>
        <p className="text-sm text-slate-500 ml-11">Проверка стратегии в экстремальных условиях</p>
      </div>

      <StepHint
        title="Что такое стресс-тест и зачем он нужен?"
        description="Стресс-тест — это проверка вашего плана на прочность. Мы берём ваши сценарии из шага 3 и ухудшаем их: доходы падают, расходы растут, сроки затягиваются. Цель — понять, выживет ли ваша стратегия в плохих условиях."
        hints={[
          { term: "Доход -30%", explanation: "что если ваш доход окажется на 30% меньше, чем вы планировали? Клиентов меньше, средний чек ниже" },
          { term: "Затраты +20%", explanation: "что если расходы вырастут на 20%? Подорожали материалы, выросли зарплаты, непредвиденные траты" },
          { term: "Сроки x1.5", explanation: "что если всё займёт в 1.5 раза больше времени? Задержки, согласования, технические проблемы" },
          { term: "Вероятность -15%", explanation: "шанс благоприятного исхода снижается на 15 процентных пунктов" },
          { term: "Исходная EV", explanation: "ожидаемая ценность вашего проекта ДО стресс-теста (рассчитана на шаге 3)" },
          { term: "Стресс-EV", explanation: "ожидаемая ценность ПОСЛЕ стресс-теста. Показывает, сколько вы заработаете в плохих условиях" },
          { term: "ИА (Индекс адаптивности)", explanation: "отношение стресс-EV к исходной EV. Если ≥ 0.7 — ваша стратегия устойчива. Если < 0.4 — нужно серьёзно пересмотреть план" },
          { term: "Решение о пересмотре", explanation: "после просмотра результатов вам нужно ответить: готовы ли вы менять стратегию? Нет правильного ответа — это проверка вашей гибкости" },
        ]}
      />

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 mb-8">
        <p className="text-xs text-slate-500 uppercase tracking-wider mb-4">Применённые стресс-факторы</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {STRESS_FACTORS.map((sf, i) => (
            <div key={i} className="rounded-lg bg-white border border-slate-200 p-3 text-center">
              <Icon name={sf.icon} size={18} className="text-slate-700 mx-auto mb-2" />
              <p className="text-xs text-slate-500 mb-1">{sf.label}</p>
              <p className="text-lg font-bold text-slate-900">{sf.change}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 p-5 mb-8 overflow-x-auto">
        <p className="text-xs text-slate-500 uppercase tracking-wider mb-4">Сравнение: до и после стресс-теста</p>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="text-left py-2 pr-4 text-slate-500 font-medium text-xs">Сценарий</th>
              <th className="text-right py-2 px-3 text-slate-500 font-medium text-xs">Доход</th>
              <th className="text-right py-2 px-3 text-slate-500 font-medium text-xs">Затраты</th>
              <th className="text-right py-2 px-3 text-slate-500 font-medium text-xs">Срок</th>
              <th className="text-right py-2 pl-3 text-slate-500 font-medium text-xs">Вер-ть</th>
            </tr>
          </thead>
          <tbody>
            {originalScenarios.map((sc: Scenario, i: number) => {
              const stressed = stressedScenarios[i];
              return (
                <tr key={sc.type} className="border-b border-slate-100 last:border-0">
                  <td className={`py-3 pr-4 font-medium ${SCENARIO_COLORS[sc.type]}`}>
                    {SCENARIO_LABELS[sc.type]}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <div className="text-slate-400 line-through text-xs">{formatNum(sc.revenue)}</div>
                    <div className="text-slate-900 font-medium">{formatNum(stressed.revenue)}</div>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <div className="text-slate-400 line-through text-xs">{formatNum(sc.costs)}</div>
                    <div className="text-slate-900 font-medium">{formatNum(stressed.costs)}</div>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <div className="text-slate-400 line-through text-xs">{sc.months} мес</div>
                    <div className="text-slate-900 font-medium">{stressed.months} мес</div>
                  </td>
                  <td className="py-3 pl-3 text-right">
                    <div className="text-slate-400 line-through text-xs">{sc.probability}%</div>
                    <div className="text-slate-900 font-medium">{stressed.probability}%</div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-center">
          <p className="text-[11px] text-slate-500 mb-1">Исходная EV</p>
          <p className="text-2xl font-bold text-slate-900">{formatNum(originalCalc.ev)}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-center">
          <p className="text-[11px] text-slate-500 mb-1">Стресс-EV</p>
          <p className="text-2xl font-bold text-red-600">{formatNum(stressedCalc.ev)}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-center">
          <p className="text-[11px] text-slate-500 mb-1">Индекс адаптивности (ИА)</p>
          <p className={`text-2xl font-bold ${ia >= 0.7 ? "text-emerald-600" : ia >= 0.4 ? "text-amber-600" : "text-red-600"}`}>
            {ia}
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-900 bg-slate-950 p-6 mb-6">
        <h3 className="text-base font-semibold text-white mb-2">Хотите пересмотреть стратегию?</h3>
        <p className="text-sm text-slate-400 mb-5">
          После стресс-теста ожидаемая ценность{" "}
          {stressedCalc.ev < originalCalc.ev ? "снизилась" : "не изменилась"}.
          Готовы ли вы пересмотреть параметры?
        </p>
        <div className="flex gap-3">
          <Button
            onClick={() => handleDecision(true)}
            className={`h-11 px-6 transition-all ${
              decision === true
                ? "bg-white text-slate-950"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            <Icon name="RefreshCw" size={16} />
            Да, пересмотреть
          </Button>
          <Button
            onClick={() => handleDecision(false)}
            className={`h-11 px-6 transition-all ${
              decision === false
                ? "bg-white text-slate-950"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            <Icon name="Shield" size={16} />
            Нет, оставить
          </Button>
        </div>

        {decision === true && (
          <div className="mt-5 pt-5 border-t border-slate-800">
            <p className="text-sm text-slate-400 mb-2">Заметки о пересмотре (необязательно)</p>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Что бы вы изменили в стратегии?"
              rows={3}
              className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-600 focus-visible:ring-slate-500"
            />
          </div>
        )}

        {reactionTime !== undefined && (
          <p className="text-xs text-slate-600 mt-3">
            Время принятия решения: {reactionTime} сек.
          </p>
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