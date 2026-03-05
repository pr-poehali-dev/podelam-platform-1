import { useState, useMemo } from "react";
import Icon from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { LogicData, LogicStep4Data } from "@/lib/logicTrainerTypes";
import { calcKF, calcINU } from "@/lib/logicTrainerFormulas";

interface StepProps {
  data: LogicData;
  onUpdate: (stepKey: string, data: LogicStep4Data) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function LogicStep4DataCheck({ data, onUpdate, onNext, onBack }: StepProps) {
  const prev = data.step4;

  const [confirmedFacts, setConfirmedFacts] = useState(prev?.confirmedFacts || 0);
  const [assumptions, setAssumptions] = useState(prev?.assumptions || 0);
  const [unknowns, setUnknowns] = useState(prev?.unknowns || 0);
  const [errors, setErrors] = useState<string[]>([]);

  const total = useMemo(
    () => confirmedFacts + assumptions + unknowns,
    [confirmedFacts, assumptions, unknowns]
  );

  const currentData: LogicStep4Data = useMemo(
    () => ({ confirmedFacts, assumptions, unknowns, kf: 0, inu: 0 }),
    [confirmedFacts, assumptions, unknowns]
  );

  const kf = useMemo(() => calcKF(currentData), [currentData]);
  const inu = useMemo(() => calcINU(currentData), [currentData]);

  const numChange =
    (setter: (v: number) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setter(Math.max(0, parseInt(e.target.value) || 0));
    };

  const validate = (): boolean => {
    const errs: string[] = [];
    if (total === 0) errs.push("Укажите хотя бы одно значение");
    setErrors(errs);
    return errs.length === 0;
  };

  const buildData = (): LogicStep4Data => ({
    confirmedFacts,
    assumptions,
    unknowns,
    kf,
    inu,
  });

  const handleSubmit = () => {
    if (!validate()) return;
    onUpdate("step4", buildData());
    onNext();
  };

  const handleBack = () => {
    if (total > 0) {
      onUpdate("step4", buildData());
    }
    onBack();
  };

  const kfColor =
    kf >= 0.5 ? "text-emerald-600" : kf >= 0.3 ? "text-amber-600" : "text-red-600";
  const kfBg =
    kf >= 0.5
      ? "bg-emerald-50 border-emerald-100"
      : kf >= 0.3
        ? "bg-amber-50 border-amber-100"
        : "bg-red-50 border-red-100";

  const inuColor =
    inu <= 0.3 ? "text-emerald-600" : inu <= 0.5 ? "text-amber-600" : "text-red-600";
  const inuBg =
    inu <= 0.3
      ? "bg-emerald-50 border-emerald-100"
      : inu <= 0.5
        ? "bg-amber-50 border-amber-100"
        : "bg-red-50 border-red-100";

  const factsPct = total > 0 ? (confirmedFacts / total) * 100 : 0;
  const assumptionsPct = total > 0 ? (assumptions / total) * 100 : 0;
  const unknownsPct = total > 0 ? (unknowns / total) * 100 : 0;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
            <span className="text-xs font-bold text-white">4</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">Работа с данными</h2>
        </div>
        <p className="text-sm text-slate-500 ml-11">
          Оцените количество фактов, предположений и неизвестных в вашей аргументации
        </p>
      </div>

      <div className="rounded-xl bg-indigo-50/50 border border-indigo-100 p-4 mb-8">
        <div className="flex items-start gap-3">
          <Icon name="Info" size={16} className="text-indigo-500 mt-0.5 shrink-0" />
          <div className="text-sm text-indigo-700 space-y-1">
            <p className="font-medium">Как пользоваться этим шагом</p>
            <p className="text-xs text-indigo-600/80">Посчитайте, сколько в вашей аргументации подтверждённых фактов, предположений и неизвестных. Чем выше доля фактов — тем выше коэффициент фактичности (KF). Много неизвестных повышают индекс неопределённости (INU).</p>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        <div className="space-y-5">
          <div>
            <Label className="text-slate-700 mb-1 block">Подтверждённые факты</Label>
            <p className="text-[11px] text-slate-400 mb-2">Подтверждены источниками</p>
            <Input
              type="number"
              min={0}
              value={confirmedFacts || ""}
              onChange={numChange(setConfirmedFacts)}
              placeholder="0"
              className="border-slate-200 focus-visible:ring-indigo-400"
            />
          </div>
          <div>
            <Label className="text-slate-700 mb-1 block">Предположения</Label>
            <p className="text-[11px] text-slate-400 mb-2">Не подтверждены, но вероятны</p>
            <Input
              type="number"
              min={0}
              value={assumptions || ""}
              onChange={numChange(setAssumptions)}
              placeholder="0"
              className="border-slate-200 focus-visible:ring-indigo-400"
            />
          </div>
          <div>
            <Label className="text-slate-700 mb-1 block">Неизвестные</Label>
            <p className="text-[11px] text-slate-400 mb-2">Нет данных</p>
            <Input
              type="number"
              min={0}
              value={unknowns || ""}
              onChange={numChange(setUnknowns)}
              placeholder="0"
              className="border-slate-200 focus-visible:ring-indigo-400"
            />
          </div>
        </div>

        {total > 0 && (
          <>
            <div className="border-t border-slate-100" />

            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-4">
                Структура данных
              </p>

              <div className="mb-4">
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden flex">
                  <div
                    className="h-full bg-emerald-500 transition-all"
                    style={{ width: `${factsPct}%` }}
                  />
                  <div
                    className="h-full bg-amber-400 transition-all"
                    style={{ width: `${assumptionsPct}%` }}
                  />
                  <div
                    className="h-full bg-slate-300 transition-all"
                    style={{ width: `${unknownsPct}%` }}
                  />
                </div>
                <div className="flex items-center gap-4 mt-2 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-[10px] text-slate-500">
                      Факты {factsPct.toFixed(0)}%
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-amber-400" />
                    <span className="text-[10px] text-slate-500">
                      Предположения {assumptionsPct.toFixed(0)}%
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-slate-300" />
                    <span className="text-[10px] text-slate-500">
                      Неизвестные {unknownsPct.toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className={`rounded-lg border p-4 text-center ${kfBg}`}>
                  <p className="text-[11px] text-slate-500 mb-1">Коэффициент фактичности</p>
                  <p className={`text-2xl font-bold ${kfColor}`}>
                    {(kf * 100).toFixed(1)}%
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">KF</p>
                </div>
                <div className={`rounded-lg border p-4 text-center ${inuBg}`}>
                  <p className="text-[11px] text-slate-500 mb-1">Индекс неопределённости</p>
                  <p className={`text-2xl font-bold ${inuColor}`}>
                    {(inu * 100).toFixed(1)}%
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">INU</p>
                </div>
              </div>

              {kf < 0.3 && (
                <div className="flex items-center gap-2 mt-4 px-3 py-2 rounded-full bg-red-50 border border-red-200 w-fit">
                  <Icon name="AlertTriangle" size={12} className="text-red-600 shrink-0" />
                  <span className="text-xs text-red-700">Низкая фактичность</span>
                </div>
              )}

              {inu > 0.5 && (
                <div className="flex items-center gap-2 mt-3 px-3 py-2 rounded-full bg-red-50 border border-red-200 w-fit">
                  <Icon name="AlertTriangle" size={12} className="text-red-600 shrink-0" />
                  <span className="text-xs text-red-700">Высокая неопределённость</span>
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