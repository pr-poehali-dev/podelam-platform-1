import { useState } from "react";
import Icon from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import type { LogicData, LogicStep0Data } from "@/lib/logicTrainerTypes";
import { EXAMPLE_CASES } from "@/lib/logicTrainerTypes";

interface StepProps {
  data: LogicData;
  onUpdate: (stepKey: string, data: LogicStep0Data) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function LogicStep0Statement({ data, onUpdate, onNext, onBack }: StepProps) {
  const prev = data.step0;

  const [statement, setStatement] = useState(prev?.statement || "");
  const [isCustom, setIsCustom] = useState(prev?.isCustom ?? true);
  const [initialDecision, setInitialDecision] = useState(prev?.initialDecision || "");
  const [initialConfidence, setInitialConfidence] = useState(prev?.initialConfidence || 0);
  const [errors, setErrors] = useState<string[]>([]);

  const selectCase = (text: string) => {
    setStatement(text);
    setIsCustom(false);
  };

  const handleCustomInput = (value: string) => {
    setStatement(value);
    setIsCustom(true);
  };

  const validate = (): boolean => {
    const errs: string[] = [];
    if (!statement.trim()) errs.push("Сформулируйте утверждение");
    if (!initialDecision.trim()) errs.push("Укажите ваше решение");
    if (initialConfidence <= 0) errs.push("Укажите уровень уверенности больше 0");
    setErrors(errs);
    return errs.length === 0;
  };

  const buildData = (): LogicStep0Data => ({
    statement: statement.trim(),
    isCustom,
    initialDecision: initialDecision.trim(),
    initialConfidence,
  });

  const handleSubmit = () => {
    if (!validate()) return;
    onUpdate("step0", buildData());
    onNext();
  };

  const handleBack = () => {
    if (statement.trim() || initialDecision.trim() || initialConfidence > 0) {
      onUpdate("step0", buildData());
    }
    onBack();
  };

  const isSelected = (c: string) => statement === c && !isCustom;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
            <span className="text-xs font-bold text-white">0</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">Исходная задача</h2>
        </div>
        <p className="text-sm text-slate-500 ml-11">
          Сформулируйте утверждение или выберите готовый кейс
        </p>
      </div>

      <div className="rounded-xl bg-indigo-50/50 border border-indigo-100 p-4 mb-8">
        <div className="flex items-start gap-3">
          <Icon name="Info" size={16} className="text-indigo-500 mt-0.5 shrink-0" />
          <div className="text-sm text-indigo-700 space-y-1">
            <p className="font-medium">Как пользоваться этим шагом</p>
            <p className="text-xs text-indigo-600/80">Сформулируйте задачу как утверждение (не вопрос). Укажите ваше текущее решение и оцените уверенность в нём от 0 до 100%. В конце тренажёра вы сравните, как изменилось ваше мнение после анализа.</p>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-4">Выберите кейс</p>
          <div className="flex flex-wrap gap-2">
            {EXAMPLE_CASES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => selectCase(c)}
                className={`px-3.5 py-1.5 rounded-full text-sm border transition-all ${
                  isSelected(c)
                    ? "bg-indigo-100 border-indigo-300 text-indigo-700"
                    : "bg-white text-slate-700 border-slate-200 hover:border-indigo-300 hover:text-indigo-700"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="border-t border-slate-100" />

        <div>
          <Label className="text-slate-700 mb-2 block">Утверждение</Label>
          <Input
            value={statement}
            onChange={(e) => handleCustomInput(e.target.value)}
            placeholder="Например: Нужно менять стратегию продаж"
            className="border-slate-200 focus-visible:ring-indigo-400"
          />
          <p className="text-[11px] text-slate-400 mt-1.5">
            Сформулируйте как утверждение, а не вопрос
          </p>
        </div>

        <div className="border-t border-slate-100" />

        <div>
          <Label className="text-slate-700 mb-2 block">Ваше решение</Label>
          <Textarea
            value={initialDecision}
            onChange={(e) => setInitialDecision(e.target.value)}
            placeholder="Что вы сейчас думаете по этому поводу?"
            rows={3}
            className="border-slate-200 focus-visible:ring-indigo-400 resize-none"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <Label className="text-slate-700">Уверенность в решении</Label>
            <span className="text-sm font-bold text-indigo-600">{initialConfidence}%</span>
          </div>
          <Slider
            value={[initialConfidence]}
            onValueChange={([v]) => setInitialConfidence(v)}
            min={0}
            max={100}
            step={1}
          />
          <div className="flex justify-between mt-1">
            <span className="text-[11px] text-slate-400">0%</span>
            <span className="text-[11px] text-slate-400">100%</span>
          </div>
          {initialConfidence > 0 && (
            <div className={`mt-3 rounded-lg border p-3 text-center ${
              initialConfidence >= 80 ? "bg-indigo-50 border-indigo-100" :
              initialConfidence >= 50 ? "bg-amber-50 border-amber-100" :
              "bg-slate-50 border-slate-200"
            }`}>
              <p className="text-[11px] text-slate-500 mb-0.5">Уровень уверенности</p>
              <p className={`text-sm font-semibold ${
                initialConfidence >= 80 ? "text-indigo-600" :
                initialConfidence >= 50 ? "text-amber-600" :
                "text-slate-600"
              }`}>
                {initialConfidence >= 80 ? "Высокая уверенность" :
                 initialConfidence >= 50 ? "Умеренная уверенность" :
                 "Низкая уверенность"}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {initialConfidence >= 80 ? "Проверьте, не упускаете ли вы что-то важное" :
                 initialConfidence >= 50 ? "Хорошая отправная точка для анализа" :
                 "Анализ поможет укрепить или изменить позицию"}
              </p>
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
            Далее
            <Icon name="ArrowRight" size={16} className="ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}