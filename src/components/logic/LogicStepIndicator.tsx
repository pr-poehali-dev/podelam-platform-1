import Icon from "@/components/ui/icon";

const STEP_LABELS = [
  "Задача",
  "Аргументы",
  "Связи",
  "Гипотезы",
  "Данные",
  "Ошибки",
  "Решение",
];

interface Props {
  currentStep: number;
  totalSteps: number;
  onStepClick: (step: number) => void;
}

export default function LogicStepIndicator({ currentStep, totalSteps, onStepClick }: Props) {
  const showResult = currentStep >= totalSteps;
  const labels = showResult ? [...STEP_LABELS, "Результат"] : STEP_LABELS;

  return (
    <div className="mb-10">
      <div className="flex items-center justify-center">
        <div className="flex items-center gap-0 overflow-x-auto px-2">
          {labels.map((label, i) => {
            const isActive = i === currentStep;
            const isDone = i < currentStep;
            const isResult = i === totalSteps;
            const canClick = isDone && i < totalSteps;

            return (
              <div key={i} className="flex items-center">
                {i > 0 && (
                  <div
                    className={`w-4 sm:w-8 h-px ${
                      isDone ? "bg-indigo-600" : "bg-slate-200"
                    }`}
                  />
                )}
                <div className="flex flex-col items-center gap-1">
                  <button
                    onClick={() => canClick && onStepClick(i)}
                    disabled={!canClick}
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
                      isActive
                        ? "bg-indigo-600 text-white ring-4 ring-indigo-100"
                        : isDone
                          ? "bg-indigo-600 text-white hover:ring-2 hover:ring-indigo-200 cursor-pointer"
                          : "bg-slate-100 text-slate-400"
                    } ${!canClick && !isActive ? "cursor-default" : ""}`}
                  >
                    {isDone ? (
                      <Icon name="Check" size={12} />
                    ) : isResult ? (
                      <Icon name="Star" size={12} />
                    ) : (
                      i
                    )}
                  </button>
                  <span
                    className={`text-[10px] hidden sm:block whitespace-nowrap ${
                      isActive
                        ? "text-indigo-700 font-medium"
                        : isDone
                          ? "text-slate-700"
                          : "text-slate-400"
                    }`}
                  >
                    {label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
