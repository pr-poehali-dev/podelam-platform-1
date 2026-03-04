import Icon from "@/components/ui/icon";

const STEP_TITLES = [
  "Сессия",
  "Факторы",
  "Узлы",
  "Сценарии",
  "Риски",
  "Стресс",
  "Гибкость",
  "Результат",
];

type Props = {
  currentStep: number;
  onStepClick?: (step: number) => void;
};

export default function StrategicStepIndicator({ currentStep, onStepClick }: Props) {
  return (
    <div className="mb-10">
      <div className="flex items-center justify-center">
        <div className="flex items-center gap-0 overflow-x-auto px-2">
          {STEP_TITLES.map((title, i) => {
            const isActive = i === currentStep;
            const isDone = i < currentStep;
            const isResult = i === 7;
            const canClick = isDone && onStepClick && i < 7;

            return (
              <div key={i} className="flex items-center">
                {i > 0 && (
                  <div
                    className={`w-4 sm:w-8 h-px ${
                      isDone ? "bg-slate-900" : "bg-slate-200"
                    }`}
                  />
                )}
                <div className="flex flex-col items-center gap-1">
                  <button
                    onClick={() => canClick && onStepClick?.(i)}
                    disabled={!canClick}
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
                      isActive
                        ? "bg-slate-950 text-white ring-4 ring-slate-200"
                        : isDone
                        ? "bg-slate-900 text-white hover:ring-2 hover:ring-slate-300 cursor-pointer"
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
                    className={`text-[10px] hidden sm:block ${
                      isActive ? "text-slate-900 font-medium" : isDone ? "text-slate-700" : "text-slate-400"
                    }`}
                  >
                    {title}
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
