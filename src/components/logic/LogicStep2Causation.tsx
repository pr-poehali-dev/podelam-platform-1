import { useState, useMemo } from "react";
import Icon from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import type { LogicData, LogicStep2Data, CausalChain } from "@/lib/logicTrainerTypes";
import { calcICL } from "@/lib/logicTrainerFormulas";

interface StepProps {
  data: LogicData;
  onUpdate: (stepKey: string, data: LogicStep2Data) => void;
  onNext: () => void;
  onBack: () => void;
}

function createChain(): CausalChain {
  return {
    id: crypto.randomUUID(),
    factorA: "",
    consequenceB: "",
    resultC: "",
    probability: 3,
    hasData: false,
    hasAlternative: false,
  };
}

export default function LogicStep2Causation({ data, onUpdate, onNext, onBack }: StepProps) {
  const prev = data.step2;

  const [chains, setChains] = useState<CausalChain[]>(
    prev?.chains || [createChain()]
  );
  const [errors, setErrors] = useState<string[]>([]);

  const currentData: LogicStep2Data = useMemo(
    () => ({ chains, icl: 0 }),
    [chains]
  );

  const icl = useMemo(() => calcICL(currentData), [currentData]);

  const allLinear = useMemo(
    () => chains.length > 0 && chains.every((c) => !c.hasAlternative),
    [chains]
  );

  const updateChain = (id: string, patch: Partial<CausalChain>) => {
    setChains((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  };

  const removeChain = (id: string) => {
    setChains((prev) => prev.filter((c) => c.id !== id));
  };

  const addChain = () => {
    setChains((prev) => [...prev, createChain()]);
  };

  const validate = (): boolean => {
    const errs: string[] = [];
    if (chains.length < 4) errs.push(`Нужно минимум 4 цепочки (сейчас ${chains.length})`);
    const incomplete = chains.filter(
      (c) => !c.factorA.trim() || !c.consequenceB.trim() || !c.resultC.trim()
    );
    if (incomplete.length > 0) errs.push("Заполните все поля в каждой цепочке");
    setErrors(errs);
    return errs.length === 0;
  };

  const buildData = (): LogicStep2Data => ({
    chains,
    icl,
  });

  const handleSubmit = () => {
    if (!validate()) return;
    onUpdate("step2", buildData());
    onNext();
  };

  const handleBack = () => {
    if (chains.some((c) => c.factorA.trim() || c.consequenceB.trim() || c.resultC.trim())) {
      onUpdate("step2", buildData());
    }
    onBack();
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
            <span className="text-xs font-bold text-white">2</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">Причинно-следственные связи</h2>
        </div>
        <p className="text-sm text-slate-500 ml-11">
          Постройте цепочки: Фактор A &rarr; Следствие B &rarr; Результат C
        </p>
      </div>

      <div className="space-y-8">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <p className="text-xs text-slate-500 uppercase tracking-wider">Цепочки</p>
              <span className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full">
                {chains.length}
              </span>
            </div>
            <span className="text-[11px] text-slate-400">мин. 4</span>
          </div>

          <div className="space-y-4">
            {chains.map((chain, idx) => (
              <div
                key={chain.id}
                className="rounded-xl border border-slate-200 bg-white p-5 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-400">#{idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeChain(chain.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <Icon name="X" size={16} />
                  </button>
                </div>

                <div className="hidden sm:flex items-end gap-2">
                  <div className="flex-1">
                    <Label className="text-[11px] text-slate-500 mb-1.5 block">Фактор A</Label>
                    <Input
                      value={chain.factorA}
                      onChange={(e) => updateChain(chain.id, { factorA: e.target.value })}
                      placeholder="Причина..."
                      className="border-slate-200 focus-visible:ring-indigo-400"
                    />
                  </div>
                  <div className="pb-2.5">
                    <Icon name="ArrowRight" size={18} className="text-indigo-400" />
                  </div>
                  <div className="flex-1">
                    <Label className="text-[11px] text-slate-500 mb-1.5 block">Следствие B</Label>
                    <Input
                      value={chain.consequenceB}
                      onChange={(e) => updateChain(chain.id, { consequenceB: e.target.value })}
                      placeholder="Следствие..."
                      className="border-slate-200 focus-visible:ring-indigo-400"
                    />
                  </div>
                  <div className="pb-2.5">
                    <Icon name="ArrowRight" size={18} className="text-indigo-400" />
                  </div>
                  <div className="flex-1">
                    <Label className="text-[11px] text-slate-500 mb-1.5 block">Результат C</Label>
                    <Input
                      value={chain.resultC}
                      onChange={(e) => updateChain(chain.id, { resultC: e.target.value })}
                      placeholder="Результат..."
                      className="border-slate-200 focus-visible:ring-indigo-400"
                    />
                  </div>
                </div>

                <div className="flex sm:hidden flex-col gap-2">
                  <div>
                    <Label className="text-[11px] text-slate-500 mb-1.5 block">Фактор A</Label>
                    <Input
                      value={chain.factorA}
                      onChange={(e) => updateChain(chain.id, { factorA: e.target.value })}
                      placeholder="Причина..."
                      className="border-slate-200 focus-visible:ring-indigo-400"
                    />
                  </div>
                  <div className="flex justify-center py-0.5">
                    <Icon name="ArrowDown" size={16} className="text-indigo-400" />
                  </div>
                  <div>
                    <Label className="text-[11px] text-slate-500 mb-1.5 block">Следствие B</Label>
                    <Input
                      value={chain.consequenceB}
                      onChange={(e) => updateChain(chain.id, { consequenceB: e.target.value })}
                      placeholder="Следствие..."
                      className="border-slate-200 focus-visible:ring-indigo-400"
                    />
                  </div>
                  <div className="flex justify-center py-0.5">
                    <Icon name="ArrowDown" size={16} className="text-indigo-400" />
                  </div>
                  <div>
                    <Label className="text-[11px] text-slate-500 mb-1.5 block">Результат C</Label>
                    <Input
                      value={chain.resultC}
                      onChange={(e) => updateChain(chain.id, { resultC: e.target.value })}
                      placeholder="Результат..."
                      className="border-slate-200 focus-visible:ring-indigo-400"
                    />
                  </div>
                </div>

                <div className="border-t border-slate-100" />

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[11px] text-slate-500">Вероятность связи</p>
                    <span className="text-xs font-semibold text-slate-900">
                      {chain.probability}/5
                    </span>
                  </div>
                  <Slider
                    value={[chain.probability]}
                    onValueChange={([v]) => updateChain(chain.id, { probability: v })}
                    min={1}
                    max={5}
                    step={1}
                  />
                  <div className="flex justify-between mt-1">
                    <span className="text-[10px] text-slate-400">1</span>
                    <span className="text-[10px] text-slate-400">5</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => updateChain(chain.id, { hasData: !chain.hasData })}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      chain.hasData
                        ? "bg-indigo-100 border-indigo-300 text-indigo-700"
                        : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300"
                    }`}
                  >
                    <Icon
                      name={chain.hasData ? "Check" : "Database"}
                      size={12}
                      className="inline-block mr-1.5 -mt-px"
                    />
                    Есть данные
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      updateChain(chain.id, { hasAlternative: !chain.hasAlternative })
                    }
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      chain.hasAlternative
                        ? "bg-indigo-100 border-indigo-300 text-indigo-700"
                        : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300"
                    }`}
                  >
                    <Icon
                      name={chain.hasAlternative ? "Check" : "GitBranch"}
                      size={12}
                      className="inline-block mr-1.5 -mt-px"
                    />
                    Есть альтернатива
                  </button>
                </div>
              </div>
            ))}
          </div>

          <Button
            variant="outline"
            onClick={addChain}
            className="mt-3 w-full border-dashed border-slate-300 text-slate-600 hover:text-indigo-600 hover:border-indigo-300"
          >
            <Icon name="Plus" size={16} className="mr-2" />
            Добавить цепочку
          </Button>
        </div>

        {chains.length > 0 && (
          <>
            <div className="border-t border-slate-100" />

            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-4">
                Индекс причинно-следственной логики
              </p>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-center">
                <p className="text-[11px] text-slate-500 mb-1">ICL</p>
                <p className="text-3xl font-bold text-slate-900">{icl.toFixed(2)}</p>
              </div>

              {allLinear && (
                <div className="rounded-lg bg-amber-50 border border-amber-100 p-3 mt-4">
                  <div className="flex items-start gap-2">
                    <Icon
                      name="AlertTriangle"
                      size={14}
                      className="text-amber-600 mt-0.5 shrink-0"
                    />
                    <p className="text-xs text-amber-700">
                      Все цепочки линейные — штраф -20% к ICL. Рассмотрите альтернативные
                      причины хотя бы для части цепочек.
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
