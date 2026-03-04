import { useState, useMemo } from "react";
import Icon from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { StrategicData, Step0Data } from "@/lib/proTrainerTypes";
import { calcKSZ } from "@/lib/proTrainerFormulas";
import StepHint from "./StepHint";

interface StepProps {
  data: StrategicData;
  onUpdate: (stepKey: string, data: Step0Data) => void;
  onNext: () => void;
  onBack: () => void;
}

const ERROR_LABELS: Record<number, string> = {
  1: "Низкая",
  2: "Умеренная",
  3: "Средняя",
  4: "Высокая",
  5: "Критическая",
};

const IMPORTANCE_LABELS: Record<number, string> = {
  1: "Низкая",
  2: "Умеренная",
  3: "Средняя",
  4: "Высокая",
  5: "Максимальная",
};

export default function Step0Session({ data, onUpdate, onNext, onBack }: StepProps) {
  const prev = data.step0;
  const [name, setName] = useState(prev?.name || "");
  const [goal, setGoal] = useState(prev?.goal || "");
  const [horizonMonths, setHorizonMonths] = useState(prev?.horizonMonths || 12);
  const [errorCost, setErrorCost] = useState(prev?.errorCost || 3);
  const [budget, setBudget] = useState(prev?.budget || 0);
  const [resources, setResources] = useState(prev?.resources || 0);
  const [importance, setImportance] = useState(prev?.importance || 3);
  const [errors, setErrors] = useState<string[]>([]);

  const ksz = useMemo(() => calcKSZ(horizonMonths, errorCost, importance), [horizonMonths, errorCost, importance]);

  const validate = (): boolean => {
    const errs: string[] = [];
    if (name.trim().length < 3) errs.push("Название решения — минимум 3 символа");
    if (goal.trim().length < 10) errs.push("Цель — минимум 10 символов");
    if (horizonMonths < 1 || horizonMonths > 120) errs.push("Горизонт: от 1 до 120 месяцев");
    if (budget <= 0) errs.push("Укажите бюджет");
    if (resources <= 0) errs.push("Укажите ресурсы");
    setErrors(errs);
    return errs.length === 0;
  };

  const getCurrentData = (): Step0Data => ({
    name: name.trim(),
    goal: goal.trim(),
    horizonMonths,
    errorCost,
    budget,
    resources,
    importance,
    ksz,
  });

  const handleSubmit = () => {
    if (!validate()) return;
    onUpdate("step0", getCurrentData());
    onNext();
  };

  const handleBack = () => {
    if (name.trim() || goal.trim() || budget > 0) {
      onUpdate("step0", getCurrentData());
    }
    onBack();
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-lg bg-slate-950 flex items-center justify-center">
            <span className="text-xs font-bold text-white">0</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">Создание стратегической сессии</h2>
        </div>
        <p className="text-sm text-slate-500 ml-11">Определите параметры вашего стратегического решения</p>
      </div>

      <StepHint
        title="Как заполнить этот шаг?"
        description="На этом шаге вы описываете решение, которое хотите проанализировать. Это может быть любое важное решение: запуск нового продукта, выход на рынок, смена поставщика и т.д."
        hints={[
          { term: "Название решения", explanation: "короткое описание вашего решения (2-4 слова). Например: «Открытие филиала в Казани» или «Запуск интернет-магазина»" },
          { term: "Цель", explanation: "чего вы хотите достичь этим решением? Пишите конкретно: не «больше денег», а «увеличить выручку на 30% за год»" },
          { term: "Горизонт", explanation: "на сколько месяцев вперёд вы планируете. 6 месяцев — короткий план, 12 — средний, 24+ — долгосрочный" },
          { term: "Цена ошибки", explanation: "насколько серьёзно будет, если решение окажется неверным. 1 — ошибку легко исправить, 5 — потери будут критическими" },
          { term: "Бюджет", explanation: "сколько денег (в рублях) вы готовы вложить в это решение" },
          { term: "Доступные ресурсы", explanation: "количество людей, единиц оборудования или других ключевых ресурсов, которые вы можете задействовать" },
          { term: "Важность решения", explanation: "насколько это решение важно для вашего бизнеса. 1 — рутинное, 5 — определяет будущее компании" },
          { term: "КСЗ (Коэффициент сложности задачи)", explanation: "автоматический показатель, который учитывает горизонт, цену ошибки и важность. Чем выше — тем сложнее задача и тем тщательнее нужен анализ" },
        ]}
      />

      <div className="space-y-6">
        <div>
          <Label className="text-slate-700 mb-2 block">Название решения</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Например: Выход на новый рынок"
            className="border-slate-200 focus-visible:ring-slate-400"
          />
        </div>

        <div>
          <Label className="text-slate-700 mb-2 block">Цель</Label>
          <Textarea
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="Опишите, чего вы хотите достичь этим решением"
            rows={3}
            className="border-slate-200 focus-visible:ring-slate-400"
          />
        </div>

        <div>
          <Label className="text-slate-700 mb-2 block">Горизонт (месяцев)</Label>
          <Input
            type="number"
            min={1}
            max={120}
            value={horizonMonths}
            onChange={(e) => setHorizonMonths(Math.max(1, Math.min(120, parseInt(e.target.value) || 1)))}
            className="border-slate-200 focus-visible:ring-slate-400 w-32"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <Label className="text-slate-700">Цена ошибки</Label>
            <span className="text-sm font-medium text-slate-900">{errorCost} — {ERROR_LABELS[errorCost]}</span>
          </div>
          <Slider
            value={[errorCost]}
            onValueChange={([v]) => setErrorCost(v)}
            min={1}
            max={5}
            step={1}
          />
          <div className="flex justify-between mt-1">
            <span className="text-[11px] text-slate-400">Низкая</span>
            <span className="text-[11px] text-slate-400">Критическая</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label className="text-slate-700 mb-2 block">Бюджет решения (руб.)</Label>
            <Input
              type="number"
              min={0}
              value={budget || ""}
              onChange={(e) => setBudget(parseInt(e.target.value) || 0)}
              placeholder="500000"
              className="border-slate-200 focus-visible:ring-slate-400"
            />
          </div>
          <div>
            <Label className="text-slate-700 mb-2 block">Доступные ресурсы</Label>
            <Input
              type="number"
              min={0}
              value={resources || ""}
              onChange={(e) => setResources(parseInt(e.target.value) || 0)}
              placeholder="Количество"
              className="border-slate-200 focus-visible:ring-slate-400"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <Label className="text-slate-700">Важность решения</Label>
            <span className="text-sm font-medium text-slate-900">{importance} — {IMPORTANCE_LABELS[importance]}</span>
          </div>
          <Slider
            value={[importance]}
            onValueChange={([v]) => setImportance(v)}
            min={1}
            max={5}
            step={1}
          />
          <div className="flex justify-between mt-1">
            <span className="text-[11px] text-slate-400">Низкая</span>
            <span className="text-[11px] text-slate-400">Максимальная</span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Коэффициент сложности задачи</p>
              <p className="text-sm text-slate-600">КСЗ = (горизонт x цена ошибки x важность) / 10</p>
            </div>
            <div className="text-3xl font-bold text-slate-900">{ksz.toFixed(1)}</div>
          </div>
        </div>

        {errors.length > 0 && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            {errors.map((e, i) => (
              <p key={i} className="text-sm text-red-600 flex items-center gap-2">
                <Icon name="AlertCircle" size={14} />
                {e}
              </p>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mt-10 pt-6 border-t border-slate-100">
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