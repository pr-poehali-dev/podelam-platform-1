import { useState } from "react";
import Icon from "@/components/ui/icon";
import { SavedPlanEntry, formatPlanAsMarkdown } from "./planBotEngine";
import { DIRECTION_NAMES, DIRECTION_ICONS, Direction } from "./planBotData";
import { renderMarkdown } from "./PlanBotWidgets";

type Props = {
  entries: SavedPlanEntry[];
  onNewPlan: () => void;
};

export default function PlanBotHistory({ entries, onNewPlan }: Props) {
  const [expanded, setExpanded] = useState<number | null>(null);

  if (entries.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center px-6 text-center">
        <div>
          <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Icon name="Map" size={24} className="text-emerald-300" />
          </div>
          <p className="text-gray-500 text-sm">Планов пока нет</p>
          <p className="text-gray-400 text-xs mt-1">Создайте первый план развития</p>
          <button
            onClick={onNewPlan}
            className="mt-4 px-5 py-2.5 bg-emerald-600 text-white font-semibold rounded-xl text-sm hover:bg-emerald-700 transition-colors"
          >
            Создать план
          </button>
        </div>
      </div>
    );
  }

  const sorted = [...entries].reverse();

  return (
    <div className="flex-1 overflow-y-auto px-4 py-5 max-w-2xl mx-auto w-full space-y-4">
      <button
        onClick={onNewPlan}
        className="w-full flex items-center justify-center gap-2 bg-emerald-600 text-white font-semibold py-3 rounded-xl hover:bg-emerald-700 transition-colors text-sm"
      >
        <Icon name="Plus" size={16} />
        Создать новый план
      </button>

      {sorted.map((entry, i) => {
        const realIdx = entries.length - 1 - i;
        const isOpen = expanded === realIdx;
        const d = new Date(entry.date);
        const dateStr = d.toLocaleDateString("ru-RU", { day: "2-digit", month: "long", year: "numeric" });
        const plan = entry.plan;
        const dirIcon = DIRECTION_ICONS[plan.direction as Direction] || "Map";

        return (
          <div key={realIdx} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
            <button
              onClick={() => setExpanded(isOpen ? null : realIdx)}
              className="w-full px-4 py-3.5 flex items-center justify-between text-left"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                  <Icon name={dirIcon} size={16} className="text-emerald-600" />
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-sm text-gray-900">{plan.directionName}</div>
                  <div className="text-xs text-gray-500 flex items-center gap-2 mt-0.5 flex-wrap">
                    <span>{dateStr}</span>
                    <span>·</span>
                    <span>{plan.strategyName}</span>
                    <span>·</span>
                    <span>Готовность: {plan.readiness_index}/10</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-2">
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  plan.strategy === "intensive" ? "bg-green-100 text-green-700" :
                  plan.strategy === "balanced" ? "bg-blue-100 text-blue-700" :
                  "bg-amber-100 text-amber-700"
                }`}>
                  {plan.strategy === "intensive" ? "Интенсив" : plan.strategy === "balanced" ? "Баланс" : "Мягкий"}
                </span>
                <Icon name={isOpen ? "ChevronUp" : "ChevronDown"} size={16} className="text-gray-400" />
              </div>
            </button>

            {isOpen && (
              <div className="px-4 pb-4 border-t border-gray-100 pt-3 space-y-3">
                {entry.testProfile && (entry.testProfile.psychProfileName || entry.testProfile.careerTopTypeName) && (
                  <div className="bg-indigo-50 border border-indigo-200 rounded-xl px-3 py-2.5">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Icon name="Brain" size={13} className="text-indigo-600" />
                      <span className="text-xs font-semibold text-indigo-700">Данные тестов</span>
                    </div>
                    {entry.testProfile.psychProfileName && (
                      <p className="text-xs text-indigo-600">Профиль: {entry.testProfile.psychProfileName}</p>
                    )}
                    {entry.testProfile.careerTopTypeName && (
                      <p className="text-xs text-indigo-600">Тип: {entry.testProfile.careerTopTypeName}</p>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-gray-50 rounded-xl px-3 py-2 text-center">
                    <p className="text-[10px] text-gray-500 uppercase">Время</p>
                    <p className="text-sm font-bold text-gray-800">{plan.time_per_week} ч/нед</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl px-3 py-2 text-center">
                    <p className="text-[10px] text-gray-500 uppercase">Цель</p>
                    <p className="text-sm font-bold text-gray-800">{plan.income_target?.toLocaleString("ru")} ₽</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl px-3 py-2 text-center">
                    <p className="text-[10px] text-gray-500 uppercase">Сейчас</p>
                    <p className="text-sm font-bold text-gray-800">{plan.current_income > 0 ? plan.current_income.toLocaleString("ru") + " ₽" : "0"}</p>
                  </div>
                </div>

                <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2.5 text-sm leading-relaxed">
                  {renderMarkdown(formatPlanAsMarkdown(plan, entry.testProfile))}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const text = formatPlanAsMarkdown(plan, entry.testProfile);
                      const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `plan_${plan.direction}_${dateStr}.txt`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    className="flex-1 flex items-center gap-2 justify-center bg-emerald-600 text-white font-medium py-2.5 rounded-xl hover:bg-emerald-700 transition-colors text-xs"
                  >
                    <Icon name="Download" size={14} />
                    Скачать
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
