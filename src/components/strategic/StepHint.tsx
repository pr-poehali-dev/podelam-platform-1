import { useState } from "react";
import Icon from "@/components/ui/icon";

interface HintItem {
  term: string;
  explanation: string;
}

interface StepHintProps {
  title: string;
  description: string;
  hints: HintItem[];
}

export default function StepHint({ title, description, hints }: StepHintProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-xl border border-blue-100 bg-blue-50/50 mb-8">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 p-4 text-left"
      >
        <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
          <Icon name="HelpCircle" size={16} className="text-blue-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-blue-900">{title}</p>
          <p className="text-xs text-blue-600 mt-0.5">{open ? "Нажмите, чтобы свернуть" : "Нажмите, чтобы узнать подробнее"}</p>
        </div>
        <Icon
          name="ChevronDown"
          size={16}
          className={`text-blue-400 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="px-4 pb-4 border-t border-blue-100">
          <p className="text-sm text-blue-800 mt-3 mb-4">{description}</p>
          <div className="space-y-2.5">
            {hints.map((h, i) => (
              <div key={i} className="flex gap-2">
                <span className="text-blue-400 mt-0.5 flex-shrink-0">
                  <Icon name="ArrowRight" size={12} />
                </span>
                <div>
                  <span className="text-sm font-medium text-blue-900">{h.term}</span>
                  <span className="text-sm text-blue-700"> — {h.explanation}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
