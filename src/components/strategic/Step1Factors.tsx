import { useState, useMemo } from "react";
import Icon from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { StrategicData, Step1Data, Factor, FactorLink } from "@/lib/proTrainerTypes";
import { calcStep1 } from "@/lib/proTrainerFormulas";

interface StepProps {
  data: StrategicData;
  onUpdate: (stepKey: string, data: Step1Data) => void;
  onNext: () => void;
  onBack: () => void;
}

const CATEGORIES: { value: Factor["category"]; label: string }[] = [
  { value: "micro", label: "Микро" },
  { value: "meso", label: "Мезо" },
  { value: "macro", label: "Макро" },
  { value: "hidden", label: "Скрытые" },
];

const CATEGORY_COLORS: Record<string, string> = {
  micro: "bg-blue-100 text-blue-700",
  meso: "bg-amber-100 text-amber-700",
  macro: "bg-emerald-100 text-emerald-700",
  hidden: "bg-purple-100 text-purple-700",
};

function createEmptyFactor(): Factor {
  return {
    id: crypto.randomUUID(),
    name: "",
    category: "micro",
    influence: 3,
    controllability: 3,
    changeProb: 3,
  };
}

export default function Step1Factors({ data, onUpdate, onNext, onBack }: StepProps) {
  const prev = data.step1;
  const [factors, setFactors] = useState<Factor[]>(prev?.factors || [createEmptyFactor()]);
  const [links, setLinks] = useState<FactorLink[]>(prev?.links || []);
  const [editingId, setEditingId] = useState<string | null>(factors[0]?.id || null);
  const [showLinks, setShowLinks] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const validFactors = useMemo(() => factors.filter((f) => f.name.trim().length > 0), [factors]);
  const calc = useMemo(() => {
    if (validFactors.length < 2) return null;
    return calcStep1(validFactors, links);
  }, [validFactors, links]);

  const updateFactor = (id: string, patch: Partial<Factor>) => {
    setFactors((prev) => prev.map((f) => (f.id === id ? { ...f, ...patch } : f)));
  };

  const addFactor = () => {
    const f = createEmptyFactor();
    setFactors((prev) => [...prev, f]);
    setEditingId(f.id);
  };

  const removeFactor = (id: string) => {
    setFactors((prev) => prev.filter((f) => f.id !== id));
    setLinks((prev) => prev.filter((l) => l.from !== id && l.to !== id));
    if (editingId === id) setEditingId(null);
  };

  const toggleLink = (from: string, to: string) => {
    setLinks((prev) => {
      const exists = prev.some((l) => l.from === from && l.to === to);
      if (exists) return prev.filter((l) => !(l.from === from && l.to === to));
      return [...prev, { from, to }];
    });
  };

  const hasLink = (from: string, to: string) => links.some((l) => l.from === from && l.to === to);

  const validate = (): boolean => {
    const errs: string[] = [];
    if (validFactors.length < 12) errs.push(`Добавьте минимум 12 факторов (сейчас ${validFactors.length})`);
    const empty = factors.filter((f) => f.name.trim().length === 0);
    if (empty.length > 0) errs.push(`${empty.length} фактор(ов) без названия`);
    setErrors(errs);
    return errs.length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    const result = calcStep1(validFactors, links);
    const stepData: Step1Data = {
      factors: validFactors,
      links,
      ...result,
    };
    onUpdate("step1", stepData);
    onNext();
  };

  const editing = factors.find((f) => f.id === editingId);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-lg bg-slate-950 flex items-center justify-center">
            <span className="text-xs font-bold text-white">1</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">Системный анализ факторов</h2>
        </div>
        <p className="text-sm text-slate-500 ml-11">Определите факторы влияния на четырёх уровнях (минимум 12)</p>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <Button onClick={addFactor} className="bg-slate-950 text-white hover:bg-slate-800 h-9 text-sm">
          <Icon name="Plus" size={14} />
          Добавить фактор
        </Button>
        <Button
          variant={showLinks ? "default" : "outline"}
          onClick={() => setShowLinks(!showLinks)}
          className={showLinks ? "bg-slate-700 text-white hover:bg-slate-600 h-9 text-sm" : "h-9 text-sm"}
        >
          <Icon name="Link" size={14} />
          Связи ({links.length})
        </Button>
        <span className="text-sm text-slate-400 ml-auto">{validFactors.length} / 12 мин.</span>
      </div>

      {!showLinks ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
          {factors.map((f) => (
            <div
              key={f.id}
              className={`rounded-xl border p-4 cursor-pointer transition-all ${
                editingId === f.id ? "border-slate-900 bg-slate-50" : "border-slate-200 hover:border-slate-300"
              }`}
              onClick={() => setEditingId(editingId === f.id ? null : f.id)}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${CATEGORY_COLORS[f.category]}`}>
                    {CATEGORIES.find((c) => c.value === f.category)?.label}
                  </span>
                  <span className="text-sm font-medium text-slate-900 truncate">
                    {f.name || "Без названия"}
                  </span>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); removeFactor(f.id); }}
                  className="text-slate-400 hover:text-red-500 transition-colors p-1"
                >
                  <Icon name="X" size={14} />
                </button>
              </div>
              <div className="flex gap-3 text-[11px] text-slate-500">
                <span>Влияние: {f.influence}</span>
                <span>Контроль: {f.controllability}</span>
                <span>Изменч.: {f.changeProb}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mb-6 rounded-xl border border-slate-200 p-4 overflow-x-auto">
          <p className="text-sm text-slate-600 mb-4">Отметьте, какие факторы влияют друг на друга</p>
          <table className="w-full text-xs">
            <thead>
              <tr>
                <th className="text-left p-2 text-slate-500 font-medium">Фактор влияет на →</th>
                {validFactors.map((f) => (
                  <th key={f.id} className="p-2 text-slate-500 font-medium text-center max-w-[80px]">
                    <span className="block truncate">{f.name.substring(0, 8)}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {validFactors.map((from) => (
                <tr key={from.id} className="border-t border-slate-100">
                  <td className="p-2 text-slate-700 font-medium truncate max-w-[120px]">{from.name}</td>
                  {validFactors.map((to) => (
                    <td key={to.id} className="p-2 text-center">
                      {from.id === to.id ? (
                        <span className="text-slate-300">—</span>
                      ) : (
                        <button
                          onClick={() => toggleLink(from.id, to.id)}
                          className={`w-6 h-6 rounded border transition-all ${
                            hasLink(from.id, to.id)
                              ? "bg-slate-900 border-slate-900"
                              : "border-slate-300 hover:border-slate-400"
                          }`}
                        >
                          {hasLink(from.id, to.id) && (
                            <Icon name="Check" size={12} className="text-white mx-auto" />
                          )}
                        </button>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && editingId && !showLinks && (
        <div className="rounded-xl border border-slate-900 bg-white p-6 mb-6 transition-all">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Редактирование фактора</h3>
          <div className="space-y-4">
            <div>
              <Label className="text-slate-600 text-xs mb-1.5 block">Название</Label>
              <Input
                value={editing.name}
                onChange={(e) => updateFactor(editingId, { name: e.target.value })}
                placeholder="Название фактора"
                className="border-slate-200 focus-visible:ring-slate-400"
              />
            </div>
            <div>
              <Label className="text-slate-600 text-xs mb-1.5 block">Категория</Label>
              <div className="flex gap-2">
                {CATEGORIES.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => updateFactor(editingId, { category: c.value })}
                    className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                      editing.category === c.value
                        ? "border-slate-900 bg-slate-900 text-white"
                        : "border-slate-200 text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-slate-600 text-xs">Влияние</Label>
                <span className="text-xs font-medium text-slate-900">{editing.influence}</span>
              </div>
              <Slider
                value={[editing.influence]}
                onValueChange={([v]) => updateFactor(editingId, { influence: v })}
                min={1} max={5} step={1}
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-slate-600 text-xs">Контролируемость</Label>
                <span className="text-xs font-medium text-slate-900">{editing.controllability}</span>
              </div>
              <Slider
                value={[editing.controllability]}
                onValueChange={([v]) => updateFactor(editingId, { controllability: v })}
                min={1} max={5} step={1}
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-slate-600 text-xs">Вероятность изменения</Label>
                <span className="text-xs font-medium text-slate-900">{editing.changeProb}</span>
              </div>
              <Slider
                value={[editing.changeProb]}
                onValueChange={([v]) => updateFactor(editingId, { changeProb: v })}
                min={1} max={5} step={1}
              />
            </div>
          </div>
        </div>
      )}

      {calc && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 mb-6">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-3">Расчётные показатели</p>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-[11px] text-slate-500 mb-1">Среднее влияние</p>
              <p className="text-xl font-bold text-slate-900">{calc.avgInfluence}</p>
            </div>
            <div>
              <p className="text-[11px] text-slate-500 mb-1">Уровней</p>
              <p className="text-xl font-bold text-slate-900">{calc.levelsUsed} / 4</p>
            </div>
            <div>
              <p className="text-[11px] text-slate-500 mb-1">ИСГ</p>
              <p className="text-xl font-bold text-slate-900">{calc.isg}</p>
            </div>
          </div>
        </div>
      )}

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
        <Button variant="ghost" onClick={onBack} className="text-slate-500 hover:text-slate-900">
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
