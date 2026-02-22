import Icon from "@/components/ui/icon";
import { FinalPlan, PlanBotStep, formatPlanAsMarkdown } from "./planBotEngine";
import { Direction, DIRECTION_NAMES, DIRECTION_ICONS } from "./planBotData";
import { SliderWidget, NumberInputWidget } from "./PlanBotWidgets";

type SliderValues = { energy: number; motivation: number; confidence: number };

type Props = {
  step: PlanBotStep;
  sliderValues: SliderValues;
  currentPlan: FinalPlan | null;
  onSliderChange: (key: keyof SliderValues, value: number) => void;
  onEnergySubmit: () => void;
  onMotivationSubmit: () => void;
  onConfidenceSubmit: () => void;
  onDirectionClick: (dir: string) => void;
  onTimeSubmit: (v: number) => void;
  onIncomeTargetSubmit: (v: number) => void;
  onCurrentIncomeSubmit: (v: number) => void;
  onReset: () => void;
};

export default function PlanBotInputPanel({
  step,
  sliderValues,
  currentPlan,
  onSliderChange,
  onEnergySubmit,
  onMotivationSubmit,
  onConfidenceSubmit,
  onDirectionClick,
  onTimeSubmit,
  onIncomeTargetSubmit,
  onCurrentIncomeSubmit,
  onReset,
}: Props) {
  return (
    <>
      {/* Выбор направления */}
      {step === "ask_direction" && (
        <div className="grid grid-cols-1 gap-2">
          {(Object.keys(DIRECTION_NAMES) as Direction[]).map((dir) => (
            <button
              key={dir}
              onClick={() => onDirectionClick(dir)}
              className="flex items-center gap-3 bg-white border border-gray-200 text-left px-4 py-3 rounded-xl hover:border-emerald-400 hover:bg-emerald-50 transition-all text-sm font-medium text-gray-800"
            >
              <Icon name={DIRECTION_ICONS[dir] as "Map"} size={18} className="text-emerald-600 shrink-0" />
              {DIRECTION_NAMES[dir]}
            </button>
          ))}
        </div>
      )}

      {/* Слайдер энергии */}
      {step === "ask_energy" && (
        <>
          <SliderWidget
            label="Уровень энергии"
            value={sliderValues.energy}
            onChange={(v) => onSliderChange("energy", v)}
          />
          <button
            onClick={onEnergySubmit}
            className="mt-2 w-full bg-emerald-600 text-white font-semibold py-3 rounded-xl hover:bg-emerald-700 transition-colors text-sm"
          >
            Подтвердить: {sliderValues.energy}/10 →
          </button>
        </>
      )}

      {/* Слайдер мотивации */}
      {step === "ask_motivation" && (
        <>
          <SliderWidget
            label="Уровень мотивации"
            value={sliderValues.motivation}
            onChange={(v) => onSliderChange("motivation", v)}
          />
          <button
            onClick={onMotivationSubmit}
            className="mt-2 w-full bg-emerald-600 text-white font-semibold py-3 rounded-xl hover:bg-emerald-700 transition-colors text-sm"
          >
            Подтвердить: {sliderValues.motivation}/10 →
          </button>
        </>
      )}

      {/* Слайдер уверенности */}
      {step === "ask_confidence" && (
        <>
          <SliderWidget
            label="Уровень уверенности"
            value={sliderValues.confidence}
            onChange={(v) => onSliderChange("confidence", v)}
          />
          <button
            onClick={onConfidenceSubmit}
            className="mt-2 w-full bg-emerald-600 text-white font-semibold py-3 rounded-xl hover:bg-emerald-700 transition-colors text-sm"
          >
            Подтвердить: {sliderValues.confidence}/10 →
          </button>
        </>
      )}

      {/* Числовой ввод: часы в неделю */}
      {step === "ask_time" && (
        <NumberInputWidget
          placeholder="Например: 10"
          suffix="ч/нед"
          onSubmit={onTimeSubmit}
        />
      )}

      {/* Числовой ввод: цель по доходу */}
      {step === "ask_income_target" && (
        <NumberInputWidget
          placeholder="Например: 50000"
          suffix="₽/мес"
          onSubmit={onIncomeTargetSubmit}
        />
      )}

      {/* Числовой ввод: текущий доход */}
      {step === "ask_current_income" && (
        <NumberInputWidget
          placeholder="0 если ещё не зарабатываешь"
          suffix="₽/мес"
          onSubmit={onCurrentIncomeSubmit}
        />
      )}

      {/* Кнопки скачать/сохранить план */}
      {step === "report" && currentPlan && (
        <div className="mt-3 flex flex-col gap-2">
          <div className="flex gap-2">
            <button
              onClick={() => {
                const text = formatPlanAsMarkdown(currentPlan);
                const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "plan_3_months.txt";
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="flex-1 flex items-center gap-2 justify-center bg-emerald-600 text-white font-semibold py-3 rounded-xl hover:bg-emerald-700 transition-colors text-sm"
            >
              <Icon name="Download" size={16} />
              Скачать .txt
            </button>
            <button
              onClick={() => {
                const md = formatPlanAsMarkdown(currentPlan);
                const html = md
                  .split("\n")
                  .map((line) => {
                    if (line.startsWith("# ")) return `<h1>${line.replace(/^# /, "")}</h1>`;
                    if (line.startsWith("## ")) return `<h2>${line.replace(/^## /, "")}</h2>`;
                    if (line.startsWith("### ")) return `<h3>${line.replace(/^### /, "")}</h3>`;
                    if (line.startsWith("---")) return `<hr/>`;
                    if (line.startsWith("> ")) return `<blockquote>${line.replace(/^> /, "")}</blockquote>`;
                    if (line.startsWith("• ") || line.startsWith("✓ ")) return `<p class="bullet">${line}</p>`;
                    if (line.trim() === "") return `<br/>`;
                    return `<p>${line.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")}</p>`;
                  })
                  .join("");

                const win = window.open("", "_blank");
                if (!win) return;
                win.document.write(`<!DOCTYPE html><html><head>
                  <meta charset="utf-8"/>
                  <title>Мой план развития на 3 месяца</title>
                  <style>
                    body { font-family: Arial, sans-serif; max-width: 800px; margin: 40px auto; color: #1a1a1a; line-height: 1.6; padding: 0 20px; }
                    h1 { font-size: 22px; color: #059669; border-bottom: 2px solid #059669; padding-bottom: 8px; margin-top: 32px; }
                    h2 { font-size: 17px; color: #1a1a1a; margin-top: 24px; }
                    h3 { font-size: 14px; color: #374151; margin-top: 18px; }
                    hr { border: none; border-top: 1px solid #e5e7eb; margin: 16px 0; }
                    blockquote { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 8px 12px; margin: 10px 0; border-radius: 0 8px 8px 0; font-size: 13px; }
                    p { font-size: 13px; margin: 4px 0; }
                    p.bullet { padding-left: 8px; }
                    strong { font-weight: 600; }
                    @media print { body { margin: 20px; } }
                  </style>
                </head><body>${html}<br/><p style="color:#9ca3af;font-size:11px;margin-top:32px">Сформировано: ${new Date().toLocaleDateString("ru-RU")}</p></body></html>`);
                win.document.close();
                setTimeout(() => { win.focus(); win.print(); }, 400);
              }}
              className="flex-1 flex items-center gap-2 justify-center bg-white border border-emerald-300 text-emerald-700 font-semibold py-3 rounded-xl hover:bg-emerald-50 transition-colors text-sm"
            >
              <Icon name="FileText" size={16} />
              Сохранить PDF
            </button>
          </div>
          <button
            onClick={onReset}
            className="flex items-center gap-2 justify-center bg-white border border-gray-200 text-gray-700 font-medium py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-sm"
          >
            <Icon name="RotateCcw" size={15} />
            Построить новый план
          </button>
        </div>
      )}
    </>
  );
}
