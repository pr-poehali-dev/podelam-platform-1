import { RefObject } from "react";
import Icon from "@/components/ui/icon";
import { Message, PlanBotStep, FinalPlan } from "./planBotEngine";
import { renderMarkdown } from "./PlanBotWidgets";
import PlanBotInputPanel from "./PlanBotInputPanel";

type SliderValues = { energy: number; motivation: number; confidence: number };

type Props = {
  messages: Message[];
  loading: boolean;
  step: PlanBotStep;
  sliderValues: SliderValues;
  currentPlan: FinalPlan | null;
  bottomRef: RefObject<HTMLDivElement>;
  onSliderChange: (key: keyof SliderValues, value: number) => void;
  onEnergySubmit: () => void;
  onMotivationSubmit: () => void;
  onConfidenceSubmit: () => void;
  onDirectionClick: (dir: string) => void;
  onTimeSubmit: (v: number) => void;
  onIncomeTargetSubmit: (v: number) => void;
  onCurrentIncomeSubmit: (v: number) => void;
  onReset: () => void;
  onExit?: () => void;
  paidOnce?: boolean;
};

export default function PlanBotMessages({
  messages,
  loading,
  step,
  sliderValues,
  currentPlan,
  bottomRef,
  onSliderChange,
  onEnergySubmit,
  onMotivationSubmit,
  onConfidenceSubmit,
  onDirectionClick,
  onTimeSubmit,
  onIncomeTargetSubmit,
  onCurrentIncomeSubmit,
  onReset,
  onExit,
  paidOnce,
}: Props) {
  const lastBotId = Math.max(
    ...messages.filter((m) => m.from === "bot").map((m) => m.id),
    -Infinity
  );

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 pb-32">
      {messages.map((msg) => (
        <div key={msg.id} className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}>
          {msg.from === "bot" && (
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shrink-0 mr-2 mt-1">
              <Icon name="Map" size={14} className="text-white" />
            </div>
          )}
          <div className={`max-w-[92%] ${msg.from === "user" ? "" : "w-full"}`}>
            <div className={`rounded-2xl px-4 py-3 ${
              msg.from === "user"
                ? "bg-emerald-600 text-white rounded-tr-sm ml-auto inline-block"
                : "bg-white border border-gray-100 shadow-sm rounded-tl-sm"
            }`}>
              {msg.from === "bot" ? (
                <div className="text-sm leading-relaxed">{renderMarkdown(msg.text)}</div>
              ) : (
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
              )}
            </div>

            {msg.from === "bot" && msg.id === lastBotId && !loading && (
              <div className="mt-2 ml-0">
                <PlanBotInputPanel
                  step={step}
                  sliderValues={sliderValues}
                  currentPlan={currentPlan}
                  onSliderChange={onSliderChange}
                  onEnergySubmit={onEnergySubmit}
                  onMotivationSubmit={onMotivationSubmit}
                  onConfidenceSubmit={onConfidenceSubmit}
                  onDirectionClick={onDirectionClick}
                  onTimeSubmit={onTimeSubmit}
                  onIncomeTargetSubmit={onIncomeTargetSubmit}
                  onCurrentIncomeSubmit={onCurrentIncomeSubmit}
                  onReset={onReset}
                  onExit={onExit}
                  paidOnce={paidOnce}
                />
              </div>
            )}
          </div>
        </div>
      ))}

      {loading && (
        <div className="flex justify-start">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shrink-0 mr-2 mt-1">
            <Icon name="Map" size={14} className="text-white" />
          </div>
          <div className="bg-white border border-gray-100 shadow-sm rounded-2xl rounded-tl-sm px-4 py-3">
            <div className="flex gap-1 items-center h-5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: "0ms" }} />
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: "150ms" }} />
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}