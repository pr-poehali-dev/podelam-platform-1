import { useState, useMemo } from "react";
import Icon from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type {
  FinancialData,
  FinancialStep1Data,
  ExpenseCategories,
} from "@/lib/financialTrainerTypes";
import { calcExpenseStructure } from "@/lib/financialTrainerFormulas";

interface StepProps {
  data: FinancialData;
  onUpdate: (stepKey: string, data: FinancialStep1Data) => void;
  onNext: () => void;
  onBack: () => void;
}

const CATEGORY_FIELDS: { key: keyof ExpenseCategories; label: string; hint: string }[] = [
  { key: "basic", label: "Базовые расходы", hint: "Еда, транспорт, коммуналка, связь" },
  { key: "development", label: "Развитие и обучение", hint: "Курсы, книги, консультации" },
  { key: "investments", label: "Инвестиции", hint: "Фондовый рынок, депозиты, бизнес" },
  { key: "impulse", label: "Импульсные покупки", hint: "Незапланированные траты" },
  { key: "other", label: "Прочее", hint: "Развлечения, подарки, разное" },
];

export default function FinStep1Expenses({ data, onUpdate, onNext, onBack }: StepProps) {
  const prev = data.step1;
  const totalReference =
    data.step0 ? data.step0.fixedExpenses + data.step0.variableExpenses : 0;

  const [categories, setCategories] = useState<ExpenseCategories>(
    prev?.categories || { basic: 0, development: 0, investments: 0, impulse: 0, other: 0 }
  );
  const [errors, setErrors] = useState<string[]>([]);

  const totalEntered = useMemo(
    () =>
      categories.basic +
      categories.development +
      categories.investments +
      categories.impulse +
      categories.other,
    [categories]
  );

  const { ksr, iir } = useMemo(() => calcExpenseStructure(categories), [categories]);

  const updateCategory = (key: keyof ExpenseCategories, value: number) => {
    setCategories((prev) => ({ ...prev, [key]: Math.max(0, value) }));
  };

  const validate = (): boolean => {
    const errs: string[] = [];
    if (totalEntered <= 0) errs.push("Укажите хотя бы одну категорию расходов");
    setErrors(errs);
    return errs.length === 0;
  };

  const buildData = (): FinancialStep1Data => ({
    categories,
    expenseStructureRatio: ksr,
    impulseExpenseIndex: iir,
  });

  const handleSubmit = () => {
    if (!validate()) return;
    onUpdate("step1", buildData());
    onNext();
  };

  const handleBack = () => {
    if (totalEntered > 0) {
      onUpdate("step1", buildData());
    }
    onBack();
  };

  const fmt = (n: number) => n.toLocaleString("ru-RU");

  const iirColor =
    iir > 0.2 ? "text-red-600" : iir > 0.1 ? "text-amber-600" : "text-emerald-600";
  const iirBg =
    iir > 0.2 ? "bg-red-50 border-red-100" : iir > 0.1 ? "bg-amber-50 border-amber-100" : "bg-emerald-50 border-emerald-100";

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-lg bg-slate-950 flex items-center justify-center">
            <span className="text-xs font-bold text-white">1</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">Структура расходов</h2>
        </div>
        <p className="text-sm text-slate-500 ml-11">
          Распределите ваши расходы по категориям
        </p>
      </div>

      {totalReference > 0 && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 mb-8">
          <div className="flex items-center gap-2">
            <Icon name="Info" size={16} className="text-slate-500" />
            <p className="text-sm text-slate-600">
              Общие расходы из шага 0:{" "}
              <span className="font-semibold text-slate-900">{fmt(totalReference)}</span>
            </p>
          </div>
        </div>
      )}

      <div className="space-y-6">
        <div className="space-y-4">
          {CATEGORY_FIELDS.map((field) => (
            <div key={field.key}>
              <Label className="text-slate-700 mb-1 block">{field.label}</Label>
              <p className="text-[11px] text-slate-400 mb-2">{field.hint}</p>
              <Input
                type="number"
                min={0}
                value={categories[field.key] || ""}
                onChange={(e) =>
                  updateCategory(field.key, parseFloat(e.target.value) || 0)
                }
                placeholder="0"
                className="border-slate-200 focus-visible:ring-slate-400"
              />
            </div>
          ))}
        </div>

        {totalEntered > 0 && (
          <>
            <div className="border-t border-slate-100" />

            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs text-slate-500 uppercase tracking-wider">
                  Итого распределено
                </p>
                <p className="text-sm font-semibold text-slate-900">{fmt(totalEntered)}</p>
              </div>

              {totalReference > 0 && totalEntered !== totalReference && (
                <div className="rounded-lg bg-amber-50 border border-amber-100 p-3 mb-4">
                  <p className="text-xs text-amber-700">
                    Разница с общими расходами:{" "}
                    <span className="font-semibold">
                      {fmt(totalEntered - totalReference)}
                    </span>
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-center">
                  <p className="text-[11px] text-slate-500 mb-1">Коэффициент структуры</p>
                  <p className="text-lg font-bold text-slate-900">
                    {(ksr * 100).toFixed(1)}%
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    KSR (развитие + инвестиции)
                  </p>
                </div>
                <div
                  className={`rounded-lg border p-3 text-center ${iirBg}`}
                >
                  <p className="text-[11px] text-slate-500 mb-1">Импульсные расходы</p>
                  <p className={`text-lg font-bold ${iirColor}`}>
                    {(iir * 100).toFixed(1)}%
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">IIR</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              {CATEGORY_FIELDS.map((field) => {
                const share =
                  totalEntered > 0
                    ? (categories[field.key] / totalEntered) * 100
                    : 0;
                return (
                  <div key={field.key} className="flex items-center gap-3">
                    <p className="text-xs text-slate-500 w-36 shrink-0 truncate">
                      {field.label}
                    </p>
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-slate-400 rounded-full transition-all"
                        style={{ width: `${Math.min(share, 100)}%` }}
                      />
                    </div>
                    <p className="text-xs font-medium text-slate-700 w-12 text-right">
                      {share.toFixed(0)}%
                    </p>
                  </div>
                );
              })}
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
