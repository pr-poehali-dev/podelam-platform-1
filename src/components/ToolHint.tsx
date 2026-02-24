import { useState } from "react";
import Icon from "@/components/ui/icon";

type Props = {
  title: string;
  items: string[];
};

export default function ToolHint({ title, items }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mx-4 mb-3">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm font-medium hover:bg-amber-100 transition-colors"
      >
        <Icon name="Lightbulb" size={15} className="text-amber-500 shrink-0" />
        <span className="flex-1 text-left">{title}</span>
        <Icon
          name="ChevronDown"
          size={15}
          className={`text-amber-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="mt-2 px-4 py-3 rounded-xl bg-amber-50/60 border border-amber-100 text-sm text-amber-900 space-y-2 animate-fade-in">
          {items.map((item, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="mt-0.5 w-5 h-5 rounded-full bg-amber-200/70 text-amber-700 flex items-center justify-center text-xs font-bold shrink-0">
                {i + 1}
              </span>
              <span className="leading-relaxed">{item}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
