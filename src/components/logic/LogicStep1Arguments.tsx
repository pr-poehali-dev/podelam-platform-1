import { useState, useMemo } from "react";
import Icon from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import type { LogicData, LogicStep1Data, Argument, ArgumentType } from "@/lib/logicTrainerTypes";
import { calcIA, calcBA } from "@/lib/logicTrainerFormulas";

interface StepProps {
  data: LogicData;
  onUpdate: (stepKey: string, data: LogicStep1Data) => void;
  onNext: () => void;
  onBack: () => void;
}

const TYPE_OPTIONS: { value: ArgumentType; label: string }[] = [
  { value: "fact", label: "Факт" },
  { value: "assumption", label: "Предположение" },
  { value: "opinion", label: "Мнение" },
];

function createArgument(side: "for" | "against"): Argument {
  return {
    id: crypto.randomUUID(),
    text: "",
    side,
    type: "assumption",
    strength: 3,
    verifiability: 3,
  };
}

export default function LogicStep1Arguments({ data, onUpdate, onNext, onBack }: StepProps) {
  const prev = data.step1;

  const [thesis, setThesis] = useState(prev?.thesis || data.step0?.statement || "");
  const [args, setArgs] = useState<Argument[]>(
    prev?.arguments || [createArgument("for"), createArgument("against")]
  );
  const [errors, setErrors] = useState<string[]>([]);

  const forArgs = useMemo(() => args.filter((a) => a.side === "for"), [args]);
  const againstArgs = useMemo(() => args.filter((a) => a.side === "against"), [args]);

  const currentData: LogicStep1Data = useMemo(
    () => ({ thesis, arguments: args, ia: 0, ba: 0 }),
    [thesis, args]
  );

  const ia = useMemo(() => calcIA(currentData), [currentData]);
  const ba = useMemo(() => calcBA(currentData), [currentData]);

  const updateArg = (id: string, patch: Partial<Argument>) => {
    setArgs((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a)));
  };

  const removeArg = (id: string) => {
    setArgs((prev) => prev.filter((a) => a.id !== id));
  };

  const addArg = (side: "for" | "against") => {
    setArgs((prev) => [...prev, createArgument(side)]);
  };

  const validate = (): boolean => {
    const errs: string[] = [];
    if (!thesis.trim()) errs.push("Укажите тезис");
    if (forArgs.length < 5)
      errs.push(`Нужно минимум 5 аргументов «за» (сейчас ${forArgs.length})`);
    if (againstArgs.length < 3)
      errs.push(`Нужно минимум 3 аргумента «против» (сейчас ${againstArgs.length})`);
    const emptyArgs = args.filter((a) => !a.text.trim());
    if (emptyArgs.length > 0) errs.push("Заполните текст всех аргументов");
    setErrors(errs);
    return errs.length === 0;
  };

  const buildData = (): LogicStep1Data => ({
    thesis: thesis.trim(),
    arguments: args,
    ia,
    ba,
  });

  const handleSubmit = () => {
    if (!validate()) return;
    onUpdate("step1", buildData());
    onNext();
  };

  const handleBack = () => {
    if (thesis.trim() || args.some((a) => a.text.trim())) {
      onUpdate("step1", buildData());
    }
    onBack();
  };

  const baColor =
    ba < 0.3 ? "text-amber-600" : ba > 0.8 ? "text-red-600" : "text-emerald-600";
  const baBg =
    ba < 0.3
      ? "bg-amber-50 border-amber-100"
      : ba > 0.8
        ? "bg-red-50 border-red-100"
        : "bg-emerald-50 border-emerald-100";

  const renderArgCard = (arg: Argument, indexInGroup: number) => (
    <div key={arg.id} className="rounded-xl border border-slate-200 bg-white p-4 space-y-4">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium text-slate-400">#{indexInGroup + 1}</span>
        <button
          type="button"
          onClick={() => removeArg(arg.id)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
        >
          <Icon name="X" size={16} />
        </button>
      </div>

      <Input
        value={arg.text}
        onChange={(e) => updateArg(arg.id, { text: e.target.value })}
        placeholder="Текст аргумента..."
        className="border-slate-200 focus-visible:ring-indigo-400"
      />

      <div>
        <p className="text-[11px] text-slate-500 mb-2">Тип аргумента</p>
        <div className="flex gap-1.5">
          {TYPE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => updateArg(arg.id, { type: opt.value })}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                arg.type === opt.value
                  ? "bg-indigo-100 border-indigo-300 text-indigo-700"
                  : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] text-slate-500">Сила</p>
            <span className="text-xs font-semibold text-slate-900">{arg.strength}</span>
          </div>
          <Slider
            value={[arg.strength]}
            onValueChange={([v]) => updateArg(arg.id, { strength: v })}
            min={1}
            max={5}
            step={1}
          />
          <div className="flex justify-between mt-1">
            <span className="text-[10px] text-slate-400">1</span>
            <span className="text-[10px] text-slate-400">5</span>
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] text-slate-500">Проверяемость</p>
            <span className="text-xs font-semibold text-slate-900">{arg.verifiability}</span>
          </div>
          <Slider
            value={[arg.verifiability]}
            onValueChange={([v]) => updateArg(arg.id, { verifiability: v })}
            min={1}
            max={5}
            step={1}
          />
          <div className="flex justify-between mt-1">
            <span className="text-[10px] text-slate-400">1</span>
            <span className="text-[10px] text-slate-400">5</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
            <span className="text-xs font-bold text-white">1</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">Структура аргумента</h2>
        </div>
        <p className="text-sm text-slate-500 ml-11">
          Сформулируйте тезис и постройте аргументацию
        </p>
      </div>

      <div className="space-y-8">
        <div>
          <Label className="text-slate-700 mb-2 block">Тезис (T)</Label>
          <Input
            value={thesis}
            onChange={(e) => setThesis(e.target.value)}
            placeholder="Основной тезис для анализа"
            className="border-slate-200 focus-visible:ring-indigo-400"
          />
        </div>

        <div className="border-t border-slate-100" />

        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <p className="text-xs text-slate-500 uppercase tracking-wider">
                Аргументы «за»
              </p>
              <span className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full">
                {forArgs.length}
              </span>
            </div>
            <span className="text-[11px] text-slate-400">мин. 5</span>
          </div>
          <div className="space-y-3">
            {forArgs.map((arg, i) => renderArgCard(arg, i))}
          </div>
          <Button
            variant="outline"
            onClick={() => addArg("for")}
            className="mt-3 w-full border-dashed border-slate-300 text-slate-600 hover:text-indigo-600 hover:border-indigo-300"
          >
            <Icon name="Plus" size={16} className="mr-2" />
            Добавить аргумент «за»
          </Button>
        </div>

        <div className="border-t border-slate-100" />

        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <p className="text-xs text-slate-500 uppercase tracking-wider">
                Аргументы «против»
              </p>
              <span className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full">
                {againstArgs.length}
              </span>
            </div>
            <span className="text-[11px] text-slate-400">мин. 3</span>
          </div>
          <div className="space-y-3">
            {againstArgs.map((arg, i) => renderArgCard(arg, i))}
          </div>
          <Button
            variant="outline"
            onClick={() => addArg("against")}
            className="mt-3 w-full border-dashed border-slate-300 text-slate-600 hover:text-indigo-600 hover:border-indigo-300"
          >
            <Icon name="Plus" size={16} className="mr-2" />
            Добавить аргумент «против»
          </Button>
        </div>

        {args.length > 0 && (
          <>
            <div className="border-t border-slate-100" />

            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-4">
                Показатели аргументации
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-center">
                  <p className="text-[11px] text-slate-500 mb-1">
                    Индекс аргументированности
                  </p>
                  <p className="text-2xl font-bold text-slate-900">{ia.toFixed(2)}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">IA</p>
                </div>
                <div className={`rounded-lg border p-4 text-center ${baBg}`}>
                  <p className="text-[11px] text-slate-500 mb-1">Баланс аргументов</p>
                  <p className={`text-2xl font-bold ${baColor}`}>{ba.toFixed(2)}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">BA</p>
                </div>
              </div>

              {ba < 0.3 && forArgs.length > 0 && (
                <div className="rounded-lg bg-amber-50 border border-amber-100 p-3 mt-4">
                  <div className="flex items-start gap-2">
                    <Icon
                      name="AlertTriangle"
                      size={14}
                      className="text-amber-600 mt-0.5 shrink-0"
                    />
                    <p className="text-xs text-amber-700">
                      Перекос подтверждения. Слишком мало контраргументов относительно
                      аргументов «за». Добавьте аргументы «против» для объективного
                      анализа.
                    </p>
                  </div>
                </div>
              )}

              {ba > 0.8 && (
                <div className="rounded-lg bg-red-50 border border-red-100 p-3 mt-4">
                  <div className="flex items-start gap-2">
                    <Icon
                      name="AlertTriangle"
                      size={14}
                      className="text-red-600 mt-0.5 shrink-0"
                    />
                    <p className="text-xs text-red-700">
                      Гиперкритичность. Контраргументы значительно преобладают. Убедитесь,
                      что вы не игнорируете аргументы «за».
                    </p>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

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
